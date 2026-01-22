import OpenAI from 'openai';

// Types matching the Index.tsx interfaces
export interface TextNote {
  id: string;
  content: string;
  fileName: string;
}

export interface FileInsight {
  id: string;
  fileName: string;
  type: "image" | "text";
  preview?: string;
  content: string;
  originalText?: string;
}

/**
 * Get OpenAI client instance with API key from environment variables
 */
const getOpenAIClient = (): OpenAI => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.');
  }
  return new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true // Required for browser usage
  });
};

/**
 * Convert a File object to base64 data URL
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Analyze an image using GPT-4 Vision -> here we have the objective of extract text/content from the image
 */
const analyzeImage = async (imageFile: File, fileName: string): Promise<string> => {
  const openai = getOpenAIClient();
  const base64Image = await fileToBase64(imageFile);
  
  // Remove data URL prefix if present (OpenAI accepts both formats)
  const imageUrl = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert at extracting and transcribing text from images of handwritten or printed notes. 
            The images may vary in quality, lighting conditions, paper colors, contrast levels, and writing styles.

            Your task is to:
            1. Extract all visible text from the image, preserving the original structure and formatting as much as possible.

            2. For unclear or ambiguous words:
               - If you can reasonably infer what the word likely is based on context, write the inferred word followed by alternative possibilities 
               in square brackets, like: "word[alternative1/alternative2]"
               - If a word is too unclear to infer a single likely option, provide multiple plausible alternatives that fit the sentence pattern 
               and context, separated by slashes within square brackets, like: "[option1/option2/option3]"
               - Always consider the surrounding text context and sentence structure when suggesting alternatives

            3. Language support: The notes may be written in English, German, French, or Italian. Identify the language(s) used and transcribe 
            accordingly. Do not assume the text is in English.

            4. Acronyms and capitalized text: Preserve ALL acronyms, abbreviations, and words written in CAPITAL LETTERS exactly as they appear 
            in the image. Do not convert them to lowercase or modify their capitalization.

            5. Provide a clear, structured transcription that maintains the original layout and organization of the notes when possible.

            IMPORTANT OUTPUT FORMAT:
            - Return ONLY the transcribed text content directly
            - Do NOT include any introductory sentences, explanations, or prefacing text
            - Do NOT write phrases like "Here's the transcription", "The text reads:", "Here's what I found:", or any similar introductory statements
            - Start immediately with the actual transcribed text from the image

            Extract all text from this image following these guidelines.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }
    return content;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Analyze text using GPT-4
 */
const analyzeText = async (text: string): Promise<string> => {
  const openai = getOpenAIClient();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Analyze this text and extract key insights, important details, and relevant information. Provide a comprehensive analysis in a clear, structured format:\n\n${text}`
        }
      ],
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }
    return content;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Analyze files (images and text notes) and return insights
 */
export const analyzeFiles = async (
  images: Array<{ id: string; file: File; preview: string }>,
  textNotes: TextNote[]
): Promise<FileInsight[]> => {
  const insights: FileInsight[] = [];

  try {
    // Process text notes
    for (const note of textNotes) {
      try {
        const analysis = await analyzeText(note.content);
        insights.push({
          id: note.id,
          fileName: note.fileName,
          type: "text",
          content: analysis,
          originalText: note.content,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze text';
        insights.push({
          id: note.id,
          fileName: note.fileName,
          type: "text",
          content: `Error analyzing text: ${errorMessage}`,
          originalText: note.content,
        });
      }
    }

    // Process images in parallel for better performance
    const imagePromises = images.map(async (img) => {
      try {
        const analysis = await analyzeImage(img.file, img.file.name);
        return {
          id: img.id,
          fileName: img.file.name,
          type: "image" as const,
          preview: img.preview,
          content: analysis,
          originalText: `[Image: ${img.file.name}]`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image';
        return {
          id: img.id,
          fileName: img.file.name,
          type: "image" as const,
          preview: img.preview,
          content: `Error analyzing image: ${errorMessage}`,
          originalText: `[Image: ${img.file.name}]`,
        };
      }
    });

    const imageInsights = await Promise.all(imagePromises);
    insights.push(...imageInsights);

    return insights;
  } catch (error) {
    throw new Error(`Failed to analyze files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get the language-specific prompt for summary generation
 */
const getSummaryPrompt = (language: string): string => {
  const prompts: Record<string, string> = {
    english: `You are summarizing transcribed text content that has been extracted from images and text notes. The filenames below (like "image-4.png") are just organizational labels - you are working with TEXT TRANSCRIPTIONS that have already been extracted, NOT image files to view. All content below is plain text that has been transcribed from the original sources.

Summarize all the following transcribed text content into a single comprehensive document with a maximum of 500 pages. Organize the content logically and ensure all key points are included. Provide a well-structured summary that captures the essential information from all transcriptions. IMPORTANT: Generate the entire summary in English.`,

    german: `Sie fassen transkribierten Textinhalt zusammen, der aus Bildern und Textnotizen extrahiert wurde. Die Dateinamen unten (wie "image-4.png") sind nur organisatorische Bezeichnungen - Sie arbeiten mit TEXT-TRANSKRIPTIONEN, die bereits extrahiert wurden, NICHT mit Bilddateien zum Ansehen. Der gesamte Inhalt unten ist Klartext, der aus den ursprünglichen Quellen transkribiert wurde.

Fassen Sie den gesamten folgenden transkribierten Textinhalt in einem einzigen umfassenden Dokument mit maximal 500 Seiten zusammen. Organisieren Sie den Inhalt logisch und stellen Sie sicher, dass alle wichtigen Punkte enthalten sind. Stellen Sie eine gut strukturierte Zusammenfassung bereit, die die wesentlichen Informationen aus allen Transkriptionen erfasst. WICHTIG: Generieren Sie die gesamte Zusammenfassung auf Deutsch.`,

    french: `Vous résumez du contenu textuel transcrit qui a été extrait d'images et de notes textuelles. Les noms de fichiers ci-dessous (comme "image-4.png") ne sont que des étiquettes organisationnelles - vous travaillez avec des TRANSCRIPTIONS DE TEXTE qui ont déjà été extraites, PAS avec des fichiers image à visualiser. Tout le contenu ci-dessous est du texte brut qui a été transcrit à partir des sources originales.

Résumez tout le contenu textuel transcrit suivant en un seul document complet avec un maximum de 500 pages. Organisez le contenu de manière logique et assurez-vous que tous les points clés sont inclus. Fournissez un résumé bien structuré qui capture les informations essentielles de toutes les transcriptions. IMPORTANT : Générez l'intégralité du résumé en français.`,

    italian: `Stai riassumendo contenuti testuali trascritti che sono stati estratti da immagini e note testuali. I nomi dei file qui sotto (come "image-4.png") sono solo etichette organizzative - stai lavorando con TRASCRIZIONI DI TESTO che sono già state estratte, NON con file immagine da visualizzare. Tutto il contenuto qui sotto è testo semplice che è stato trascritto dalle fonti originali.

Riassumi tutto il seguente contenuto testuale trascritto in un unico documento completo con un massimo di 500 pagine. Organizza il contenuto in modo logico e assicurati che tutti i punti chiave siano inclusi. Fornisci un riassunto ben strutturato che catturi le informazioni essenziali da tutte le trascrizioni. IMPORTANTE: Genera l'intero riassunto in italiano.`
  };

  return prompts[language.toLowerCase()] || prompts.english;
};

/**
 * Generate a summary from all insights
 */
export const generateSummary = async (insights: FileInsight[], language: string = 'english'): Promise<string> => {
  if (insights.length === 0) {
    throw new Error('No insights provided for summary generation');
  }

  const openai = getOpenAIClient();

  // Combine all insights into a single text
  const allInsightsText = insights.map((insight, index) => {
    return `--- Source ${index + 1}: ${insight.fileName} (${insight.type === 'image' ? 'transcribed from image' : 'text note'}) ---\n${insight.content}\n`;
  }).join('\n');

  const prompt = getSummaryPrompt(language);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\n${allInsightsText}`
        }
      ],
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }
    return content;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
};
