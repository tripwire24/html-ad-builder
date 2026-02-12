/**
 * Compresses an image file to a Base64 string with a max dimension and quality setting.
 * Designed to help keep banner sizes under 150KB.
 */
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600; // Sufficient for retina 300x250
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as JPEG with 0.8 quality for good compression/quality balance
        // If the original was PNG with transparency, this converts to black background if using jpeg.
        // For banners, we usually want PNG for logos/products (transparency) and JPEG for backgrounds.
        // Heuristic: If file type is png, try to keep it png but scale it down, unless it's very large.
        
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = 0.8;
        
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const calculateBase64SizeInKB = (base64String: string | null): number => {
  if (!base64String) return 0;
  const stringLength = base64String.length - 'data:image/png;base64,'.length;
  const sizeInBytes = 4 * Math.ceil((stringLength) / 3) * 0.5624896334383812;
  return sizeInBytes / 1024;
};
