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
        
        // Use JPEG for background/opaque, PNG if file was PNG (preserve transparency)
        // Simple heuristic: if original was png, keep png.
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        
        // Lower quality to 0.6 to safely stay under 150KB limit with multiple images
        const quality = 0.6;
        
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

/**
 * Converts a Base64 Data URL to a Blob for file saving.
 */
export const base64ToBlob = (dataURI: string): Blob => {
  const splitDataURI = dataURI.split(',');
  const byteString = splitDataURI[0].indexOf('base64') >= 0 
      ? atob(splitDataURI[1]) 
      : decodeURI(splitDataURI[1]);
  
  const mimeString = splitDataURI[0].split(':')[1].split(';')[0];
  const ia = new Uint8Array(byteString.length);
  
  for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ia], { type: mimeString });
};
