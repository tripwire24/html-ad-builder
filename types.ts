export interface AdSize {
  width: number;
  height: number;
  label: string;
}

export const AVAILABLE_SIZES: AdSize[] = [
  { width: 300, height: 250, label: 'Medium Rectangle' },
  { width: 728, height: 90, label: 'Leaderboard' },
  { width: 160, height: 600, label: 'Wide Skyscraper' },
  { width: 300, height: 600, label: 'Half Page' },
  { width: 320, height: 50, label: 'Mobile Leaderboard' },
  { width: 970, height: 250, label: 'Billboard' },
  { width: 320, height: 480, label: 'Mobile Interstitial' },
  { width: 336, height: 280, label: 'Large Rectangle' },
];

export interface AdAssets {
  logo: string | null; // Base64
  background: string | null; // Base64
  product: string | null; // Base64
}

export interface AdCopy {
  headline: string;
  subline: string;
  cta: string;
}

export type FrameLayout = 'standard' | 'split-top' | 'split-bottom' | 'split-left' | 'split-right' | 'overlay';

export interface AdFrame {
  id: string;
  assets: AdAssets;
  copy: AdCopy;
  layout: FrameLayout;
}

export interface AdDesign {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  font: string; // The selected standard font
  customFont: string | null; // Optional user-provided Google Font
  fontSizeScale: number; // 0.5 to 2.0, default 1.0
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'center';
}

export type AnimationEffect = 
  | 'none' 
  | 'fade-in' 
  | 'slide-in-bottom' 
  | 'slide-in-top' 
  | 'slide-in-left' 
  | 'slide-in-right' 
  | 'zoom-in' 
  | 'zoom-out';

export interface AdAnimation {
  effect: AnimationEffect;
  duration: number; // Transition duration in seconds
}

export interface AnimationPreset {
  label: string;
  effect: AnimationEffect;
  duration: number;
}

export const ANIMATION_PRESETS: AnimationPreset[] = [
  { label: 'None', effect: 'none', duration: 0 },
  { label: 'Fade In', effect: 'fade-in', duration: 0.8 },
  { label: 'Slide Up', effect: 'slide-in-bottom', duration: 0.6 },
  { label: 'Slide Down', effect: 'slide-in-top', duration: 0.6 },
  { label: 'Slide Right', effect: 'slide-in-left', duration: 0.6 },
  { label: 'Slide Left', effect: 'slide-in-right', duration: 0.6 },
  { label: 'Zoom In', effect: 'zoom-in', duration: 0.8 },
  { label: 'Zoom Out', effect: 'zoom-out', duration: 0.8 },
];

export interface AdSizeOverride {
  fontSizeScale?: number;
  logoScale?: number;
  textOffsetX?: number; // pixels
  textOffsetY?: number; // pixels
  logoOffsetX?: number; // pixels
  logoOffsetY?: number; // pixels
}

export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
}

export interface AdState {
  id: string; // Unique ID for the variation
  name: string; // Label for the variation
  selectedSizes: string[]; // Array of "widthxheight" strings
  
  landingPage: string; // Base URL
  utm: UtmParams;
  
  frames: AdFrame[]; // Sequence of frames
  activeFrameId: string; // Currently editing frame
  frameDuration: number; // Seconds each frame stays visible

  design: AdDesign;
  animation: AdAnimation;
  animationKey: number; // Used to force re-render/replay
  sizeOverrides: Record<string, AdSizeOverride>; // Keyed by "widthxheight"
}

export interface AdContextType {
  state: AdState; // The currently active variation
  variations: AdState[]; // List of all variations
  activeVariationId: string;
  setActiveVariation: (id: string) => void;
  addVariation: () => void; // Clones current or adds new
  removeVariation: (id: string) => void;
  updateVariationName: (id: string, name: string) => void;
  
  // Frame Management
  addFrame: () => void;
  duplicateFrame: (id: string) => void;
  removeFrame: (id: string) => void;
  setActiveFrame: (id: string) => void;
  updateFrameLayout: (layout: FrameLayout) => void; // New
  
  // Content
  toggleSize: (sizeKey: string) => void;
  addCustomSize: (width: number, height: number) => void;
  
  updateLandingPage: (url: string) => void;
  updateUtm: (key: keyof UtmParams, value: string) => void;
  
  updateAsset: (key: keyof AdAssets, value: string | null) => void; // Updates active frame
  updateCopy: (key: keyof AdCopy, value: string) => void; // Updates active frame
  updateFrameDuration: (seconds: number) => void;

  updateDesign: (key: keyof AdDesign, value: string | number | null) => void;
  updateAnimation: (key: keyof AdAnimation, value: string | number) => void;
  applyAnimationPreset: (preset: AnimationPreset) => void;
  updateSizeOverride: (sizeKey: string, override: Partial<AdSizeOverride>) => void;
  triggerReplay: () => void;
  reset: () => void;
}
