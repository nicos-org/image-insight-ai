export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

/**
 * Load all images for a use case by reading its files.txt manifest
 * and fetching each listed image file.
 */
export const loadUseCaseImages = async (folder: string): Promise<ImageFile[]> => {
  const manifestRes = await fetch(`/data/${folder}/files.txt`);
  if (!manifestRes.ok) {
    throw new Error(`Failed to load manifest for ${folder}`);
  }

  const manifestText = await manifestRes.text();
  const fileNames = manifestText.trim().split("\n").filter(Boolean);

  const imageFiles = await Promise.all(
    fileNames.map(async (name) => {
      const fileRes = await fetch(`/data/${folder}/${name}`);
      if (!fileRes.ok) {
        throw new Error(`Failed to load file: ${name}`);
      }
      const blob = await fileRes.blob();
      const file = new File([blob], name, { type: blob.type });
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(blob),
      };
    })
  );

  return imageFiles;
};

/**
 * Load ground truth .txt files for each image in a use case.
 * Each image (e.g. "photo.png") may have a corresponding "photo.txt".
 * Returns a Record mapping the original image filename to its ground truth text.
 * If the .txt file doesn't exist, the entry will be an empty string.
 */
export const loadUseCaseGroundTruths = async (
  folder: string,
  imageFileNames: string[]
): Promise<Record<string, string>> => {
  const entries = await Promise.all(
    imageFileNames.map(async (name) => {
      const baseName = name.replace(/\.[^.]+$/, "");
      const txtName = `${baseName}.txt`;
      try {
        const res = await fetch(`/data/${folder}/${txtName}`);
        if (!res.ok) {
          return [name, ""] as const;
        }
        const text = await res.text();
        return [name, text] as const;
      } catch {
        return [name, ""] as const;
      }
    })
  );

  return Object.fromEntries(entries);
};
