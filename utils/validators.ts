import { AdState } from '../types';
import { generateBannerHTML } from './generators';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateAdConfig = (state: AdState): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Frames
  if (state.frames.length === 0) {
    errors.push('At least one frame is required.');
  }

  // Check first frame assets as baseline
  const firstFrame = state.frames[0];
  if (firstFrame && !firstFrame.assets.background && !state.design.backgroundColor) {
    warnings.push('No background image or color set.');
  }
  
  // Check headlines
  state.frames.forEach((frame, idx) => {
    if (!frame.copy.headline) {
      errors.push(`Frame ${idx + 1}: Headline is required.`);
    }
  });

  if (!state.selectedSizes.length) {
    errors.push('Select at least one ad size.');
  }

  // Check file sizes for all frames generated
  const sizesToCheck = state.selectedSizes;
  sizesToCheck.forEach(sizeStr => {
    const [w, h] = sizeStr.split('x').map(Number);
    const html = generateBannerHTML(state, w, h);
    
    // Approximate size in KB
    const sizeInBytes = new Blob([html]).size;
    const sizeInKB = sizeInBytes / 1024;

    if (sizeInKB > 150) {
      errors.push(`Banner size ${sizeStr} exceeds 150KB limit (${sizeInKB.toFixed(1)}KB). Reduce image sizes or frame count.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
