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

const VALID_LANGUAGES = ['german', 'english', 'french', 'italian'] as const;

/**
 * Detect the dominant language of handwritten content in an image.
 * Returns a normalized language string or "unknown" on failure.
 */
const detectDominantLanguage = async (imageFile: File): Promise<string> => {
  const openai = getOpenAIClient();
  const base64Image = await fileToBase64(imageFile);
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
              text: `Look at this image of handwritten notes. Determine the dominant language of the text (one of: german, english, french, italian). Other languages (DE, EN, FR, IT) may appear briefly in the document.

Reply with exactly one line in this format:
DOMINANT_LANGUAGE: <language>

Example: DOMINANT_LANGUAGE: german`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 100
    });

    const content = response.choices[0]?.message?.content?.trim() ?? '';
    const match = content.match(/DOMINANT_LANGUAGE:\s*(\w+)/i);
    const lang = match ? match[1].toLowerCase() : '';
    return VALID_LANGUAGES.includes(lang as typeof VALID_LANGUAGES[number]) ? lang : 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Base transcription instructions shared by all variants, with dominant language injected.
 */
const getTranscriptionPrompt = (variant: 'A' | 'B' | 'C', dominantLanguage: string): string => {
  const languageInstruction =
    dominantLanguage === 'unknown'
      ? 'The document may be in one or more of: German, English, French, Italian. Transcribe each part in its language.'
      : `The main language of this document is ${dominantLanguage}. Transcribe in that language; short phrases may also appear in DE, EN, FR, IT.`;

  const base = `You are an expert at extracting and transcribing text from images of handwritten or printed notes.
${languageInstruction}

Preserve ALL acronyms, abbreviations, and words in CAPITAL LETTERS exactly as they appear.
Return ONLY the transcribed text. Do NOT include any introductory sentences. Start immediately with the actual transcribed text.`;

  const variantInstructions = {
    A: `Prioritize accuracy. Transcribe only what you can read with high confidence. For ambiguous characters/words use [alt1/alt2]. Preserve layout and line breaks.`,
    B: `Transcribe everything visible, including unclear parts; give your best guess and mark uncertainty with [alt1/alt2] where needed. Preserve structure.`,
    C: `Preserve the exact layout, line breaks, indentation, and sections. Transcribe all text; use [word1/word2] for ambiguous words.`
  };

  return `${base}\n\n${variantInstructions[variant]}\n\nExtract all text from this image following these guidelines.`;
};

/**
 * Transcribe an image with one of three prompt variants (A: accuracy, B: completeness, C: structure).
 */
const transcribeImageVariant = async (
  imageFile: File,
  variant: 'A' | 'B' | 'C',
  dominantLanguage: string
): Promise<string> => {
  const openai = getOpenAIClient();
  const base64Image = await fileToBase64(imageFile);
  const imageUrl = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: getTranscriptionPrompt(variant, dominantLanguage) },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
    max_tokens: 1500
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response content from OpenAI');
  return content;
};

/**
 * Judge: merge three transcriptions into one final text using the image to resolve ambiguities.
 * For very unclear words, output [word1, word2, word3] for the user to choose.
 */
const judgeTranscriptions = async (
  transcriptions: [string, string, string],
  imageFile: File,
  dominantLanguage: string
): Promise<string> => {
  const openai = getOpenAIClient();
  const base64Image = await fileToBase64(imageFile);
  const imageUrl = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;

  const [t1, t2, t3] = transcriptions;
  const textContent = `You are given three transcriptions of the same handwritten image. The notes describe a single inspection (one scenario). Produce one final transcription that is consistent and describes that one scenario.

Use the image to resolve ambiguities where the three versions disagree. For words that remain very unclear (no clarity from the image or agreement between versions), output alternatives in exactly this format: [word1, word2, word3] for the user to choose.

Preserve layout and structure. Main language: ${dominantLanguage}.

Return ONLY the final transcribed text. Do NOT include any introductory sentences. Start immediately with the actual text.

--- Transcription 1 ---
${t1}

--- Transcription 2 ---
${t2}

--- Transcription 3 ---
${t3}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: textContent },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
    max_tokens: 2000
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response content from OpenAI');
  return content;
};

/**
 * Orchestrate the 5-step pipeline: detect language, 3 transcriptions in parallel, then judge.
 */
const analyzeImageWithEnsemble = async (imageFile: File, _fileName: string): Promise<string> => {
  let dominantLanguage: string;
  try {
    dominantLanguage = await detectDominantLanguage(imageFile);
  } catch (error) {
    throw new Error(`Language detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  let t1: string, t2: string, t3: string;
  try {
    [t1, t2, t3] = await Promise.all([
      transcribeImageVariant(imageFile, 'A', dominantLanguage),
      transcribeImageVariant(imageFile, 'B', dominantLanguage),
      transcribeImageVariant(imageFile, 'C', dominantLanguage)
    ]);
  } catch (error) {
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    return await judgeTranscriptions([t1, t2, t3], imageFile, dominantLanguage);
  } catch (error) {
    throw new Error(`Judge step failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    // Process text notes - use content directly without ChatGPT processing
    for (const note of textNotes) {
      insights.push({
        id: note.id,
        fileName: note.fileName,
        type: "text",
        content: note.content,
        originalText: note.content,
      });
    }

    // Process images in parallel for better performance
    const imagePromises = images.map(async (img) => {
      try {
        const analysis = await analyzeImageWithEnsemble(img.file, img.file.name);
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
    english: `You are summarizing transcribed text content that has been extracted from images and 
             text notes. The filenames below (like "image-4.png") are just organizational labels - you 
             are working with TEXT TRANSCRIPTIONS that have already been extracted, NOT image files to 
             view. All content below is plain text that has been transcribed from the original sources.

             Summarize all the following transcribed text content into a single comprehensive document 
             with a maximum of 1000 words. Organize the content logically and ensure all key points are 
             included. Provide a well-structured summary that captures the essential information from 
             all transcriptions. Keep it brief. Do not add additional comments other than the summary. 
             No recommendations to the user. IMPORTANT: Generate the entire summary in English.`,

    german: `Sie fassen transkribierten Textinhalt zusammen, der aus Bildern und Textnotizen extrahiert 
            wurde. Die Dateinamen unten (wie "image-4.png") sind nur organisatorische Bezeichnungen - 
            Sie arbeiten mit TEXT-TRANSKRIPTIONEN, die bereits extrahiert wurden, NICHT mit Bilddateien 
            zum Ansehen. Der gesamte Inhalt unten ist Klartext, der aus den ursprünglichen Quellen 
            transkribiert wurde.

            Fassen Sie den gesamten folgenden transkribierten Textinhalt in einem einzigen umfassenden 
            Dokument mit maximal 1000 Wörtern zusammen. Organisieren Sie den Inhalt logisch und stellen 
            Sie sicher, dass alle wichtigen Punkte enthalten sind. Stellen Sie eine gut strukturierte 
            Zusammenfassung bereit, die die wesentlichen Informationen aus allen Transkriptionen 
            erfasst. Halten Sie es kurz. Fügen Sie keine zusätzlichen Kommentare außer der Zusammenfassung 
            hinzu. Keine Empfehlungen an den Benutzer. WICHTIG: Generieren Sie die gesamte Zusammenfassung auf Deutsch.`,

    french: `Vous résumez du contenu textuel transcrit qui a été extrait d'images et de notes 
            textuelles. Les noms de fichiers ci-dessous (comme "image-4.png") ne sont que des étiquettes 
            organisationnelles - vous travaillez avec des TRANSCRIPTIONS DE TEXTE qui ont déjà été 
            extraites, PAS avec des fichiers image à visualiser. Tout le contenu ci-dessous est du 
            texte brut qui a été transcrit à partir des sources originales.

            Résumez tout le contenu textuel transcrit suivant en un seul document complet avec un 
            maximum de 1000 mots. Organisez le contenu de manière logique et assurez-vous que tous 
            les points clés sont inclus. Fournissez un résumé bien structuré qui capture les 
            informations essentielles de toutes les transcriptions. Soyez concis. N'ajoutez pas de 
            commentaires supplémentaires autres que le résumé. Aucune recommandation à l'utilisateur. 
            IMPORTANT : Générez l'intégralité du résumé en français.`,

    italian: `Stai riassumendo contenuti testuali trascritti che sono stati estratti da immagini e 
            note testuali. I nomi dei file qui sotto (come "image-4.png") sono solo etichette 
            organizzative - stai lavorando con TRASCRIZIONI DI TESTO che sono già state estratte, NON 
            con file immagine da visualizzare. Tutto il contenuto qui sotto è testo semplice che è 
            stato trascritto dalle fonti originali.

            Riassumi tutto il seguente contenuto testuale trascritto in un unico documento completo con 
            un massimo di 1000 parole. Organizza il contenuto in modo logico e assicurati che tutti i 
            punti chiave siano inclusi. Fornisci un riassunto ben strutturato che catturi le informazioni 
            essenziali da tutte le trascrizioni. Sii conciso. Non aggiungere commenti aggiuntivi oltre al 
            riassunto. Nessuna raccomandazione all'utente. IMPORTANTE: Genera l'intero riassunto in italiano.`,
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
