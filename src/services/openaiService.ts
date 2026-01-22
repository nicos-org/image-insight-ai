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
 * Analyze an image using GPT-4 Vision
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
              text: "Analyze this image and provide detailed insights about its content, focusing on visual elements, composition, and key observations relevant to inspection notes. Provide a comprehensive analysis in a clear, structured format."
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
 * Generate a summary from all insights
 */
export const generateSummary = async (insights: FileInsight[]): Promise<string> => {
  if (insights.length === 0) {
    throw new Error('No insights provided for summary generation');
  }

  const openai = getOpenAIClient();

  // Combine all insights into a single text
  const allInsightsText = insights.map((insight, index) => {
    return `--- File ${index + 1}: ${insight.fileName} (${insight.type}) ---\n${insight.content}\n`;
  }).join('\n');

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Summarize all the following insights into a single comprehensive document with a maximum of 500 pages. Organize the content logically and ensure all key points are included. Provide a well-structured summary that captures the essential information from all files:\n\n${allInsightsText}`
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
