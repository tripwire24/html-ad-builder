
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AdState, AdContextType, AdAssets, AssetItem, AdCopy, AdDesign, AdAnimation, AnimationPreset, AdSizeOverride, AdFrame, UtmParams, FrameLayout } from '../types';
import { compressImage } from '../utils/compression';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultFrame = (id: string = generateId()): AdFrame => ({
  id,
  assets: {
    logo: null,
    background: null,
    product: null,
  },
  copy: {
    headline: 'Your Headline Here',
    subline: 'Compelling subtext goes here',
    cta: 'Learn More',
  },
  layout: 'standard'
});

const createDefaultState = (id: string = generateId(), name: string = 'Variation 1'): AdState => {
  const frame1 = createDefaultFrame();
  return {
    id,
    name,
    selectedSizes: ['300x250'],
    landingPage: 'https://www.google.com',
    utm: {
      source: 'google',
      medium: 'display',
      campaign: 'campaign_name',
      content: 'creative_1',
      term: ''
    },
    frames: [frame1],
    activeFrameId: frame1.id,
    frameDuration: 3,
    timingMode: 'global',
    design: {
      primaryColor: '#1e293b',
      accentColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      borderColor: '#cccccc',
      font: 'Arial',
      customFont: null,
      disableGoogleFonts: true,
      fontSizeScale: 1.0,
      logoPosition: 'top-left',
    },
    animation: {
      effect: 'fade-in',
      duration: 0.8,
    },
    animationKey: 0,
    sizeOverrides: {},
    assetLibrary: [],
  };
};

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [variations, setVariations] = useState<AdState[]>(() => [createDefaultState()]);
  const [activeVariationId, setActiveVariationId] = useState<string>(() => variations[0]?.id || '');

  // Helper to get the state for the current ID
  const getActiveState = useCallback((): AdState => {
    const found = variations.find(v => v.id === activeVariationId);
    return found || variations[0];
  }, [variations, activeVariationId]);

  const updateActiveState = useCallback((updater: (prev: AdState) => AdState) => {
    setVariations((prevVars) => 
      prevVars.map((v) => (v.id === activeVariationId ? updater(v) : v))
    );
  }, [activeVariationId]);

  const loadProject = (loadedState: AdState) => {
    if (!loadedState || !loadedState.frames) {
      alert("Invalid project file");
      return;
    }
    const newId = generateId();
    // Ensure new properties exist if loading old project files
    const newState = { 
      ...loadedState, 
      id: newId, 
      name: (loadedState.name || 'Imported') + ' (Imported)',
      timingMode: loadedState.timingMode || 'global',
      assetLibrary: loadedState.assetLibrary || []
    };
    setVariations(prev => [...prev, newState]);
    setActiveVariationId(newId);
  };

  const setActiveVariation = (id: string) => {
    setActiveVariationId(id);
  };

  const addVariation = () => {
    const current = getActiveState();
    const newId = generateId();
    
    // Deep clone frames with new IDs
    const clonedFrames = current.frames.map(f => ({
       ...f,
       id: generateId(),
       assets: { ...f.assets },
       copy: { ...f.copy }
    }));

    const newState: AdState = {
      ...current,
      id: newId,
      name: `${current.name} (Copy)`,
      frames: clonedFrames,
      activeFrameId: clonedFrames[0].id,
      animationKey: 0,
      assetLibrary: [...(current.assetLibrary || [])]
    };
    
    setVariations(prev => [...prev, newState]);
    setActiveVariationId(newId);
  };

  const removeVariation = (id: string) => {
    if (variations.length <= 1) return; 
    const newVariations = variations.filter(v => v.id !== id);
    setVariations(newVariations);
    if (activeVariationId === id) {
      setActiveVariationId(newVariations[0].id);
    }
  };

  const updateVariationName = (id: string, name: string) => {
    setVariations(prev => prev.map(v => v.id === id ? { ...v, name } : v));
  };

  const addFrame = () => {
    updateActiveState(prev => {
       const newFrame = createDefaultFrame();
       return {
         ...prev,
         frames: [...prev.frames, newFrame],
         activeFrameId: newFrame.id,
         animationKey: prev.animationKey + 1
       };
    });
  };

  const duplicateFrame = (id: string) => {
    updateActiveState(prev => {
      const index = prev.frames.findIndex(f => f.id === id);
      if (index === -1) return prev;
      const frameToClone = prev.frames[index];
      const newFrame: AdFrame = {
        ...frameToClone,
        id: generateId(),
        assets: { ...frameToClone.assets },
        copy: { ...frameToClone.copy }
      };
      const newFrames = [...prev.frames];
      newFrames.splice(index + 1, 0, newFrame);
      return {
        ...prev,
        frames: newFrames,
        activeFrameId: newFrame.id,
        animationKey: prev.animationKey + 1
      };
    });
  };

  const removeFrame = (id: string) => {
    updateActiveState(prev => {
      if (prev.frames.length <= 1) return prev;
      const newFrames = prev.frames.filter(f => f.id !== id);
      const newActiveId = prev.activeFrameId === id ? newFrames[0].id : prev.activeFrameId;
      return {
        ...prev,
        frames: newFrames,
        activeFrameId: newActiveId,
        animationKey: prev.animationKey + 1
      };
    });
  };

  const moveFrame = (id: string, direction: 'left' | 'right') => {
    updateActiveState(prev => {
      const index = prev.frames.findIndex(f => f.id === id);
      if (index === -1) return prev;
      const newFrames = [...prev.frames];
      if (direction === 'left' && index > 0) {
        [newFrames[index - 1], newFrames[index]] = [newFrames[index], newFrames[index - 1]];
      } else if (direction === 'right' && index < newFrames.length - 1) {
        [newFrames[index + 1], newFrames[index]] = [newFrames[index], newFrames[index + 1]];
      } else {
        return prev;
      }
      return {
        ...prev,
        frames: newFrames,
        animationKey: prev.animationKey + 1
      };
    });
  };

  const setActiveFrame = (id: string) => {
    updateActiveState(prev => ({ ...prev, activeFrameId: id }));
  };
  
  const updateFrameLayout = (layout: FrameLayout) => {
    updateActiveState(prev => ({
      ...prev,
      frames: prev.frames.map(f => f.id === prev.activeFrameId ? { ...f, layout } : f)
    }));
  };

  const updateActiveFrameDuration = (duration: number | undefined) => {
    updateActiveState(prev => ({
      ...prev,
      frames: prev.frames.map(f => f.id === prev.activeFrameId ? { ...f, duration } : f),
      animationKey: prev.animationKey + 1
    }));
  };

  const updateFrameDurationById = (id: string, duration: number) => {
    updateActiveState(prev => ({
      ...prev,
      frames: prev.frames.map(f => f.id === id ? { ...f, duration } : f),
      animationKey: prev.animationKey + 1
    }));
  };

  const updateFrameDuration = (seconds: number) => {
    updateActiveState(prev => ({ ...prev, frameDuration: seconds, animationKey: prev.animationKey + 1 }));
  };

  const toggleTimingMode = (mode: 'global' | 'custom') => {
    updateActiveState(prev => ({ ...prev, timingMode: mode }));
  };

  const toggleSize = (sizeKey: string) => {
    updateActiveState((prev) => {
      const exists = prev.selectedSizes.includes(sizeKey);
      if (exists) {
        return { ...prev, selectedSizes: prev.selectedSizes.filter((s) => s !== sizeKey) };
      }
      return { ...prev, selectedSizes: [...prev.selectedSizes, sizeKey] };
    });
  };

  const addCustomSize = (width: number, height: number) => {
    const key = `${width}x${height}`;
    updateActiveState((prev) => {
      if (!prev.selectedSizes.includes(key)) {
        return { ...prev, selectedSizes: [...prev.selectedSizes, key] };
      }
      return prev;
    });
  };

  const updateLandingPage = (url: string) => {
    updateActiveState(prev => ({ ...prev, landingPage: url }));
  };

  const updateUtm = (key: keyof UtmParams, value: string) => {
    updateActiveState(prev => ({ ...prev, utm: { ...prev.utm, [key]: value } }));
  };

  const updateAsset = (key: keyof AdAssets, value: string | null) => {
    updateActiveState((prev) => ({
      ...prev,
      frames: prev.frames.map(f => f.id === prev.activeFrameId ? {
        ...f,
        assets: { ...f.assets, [key]: value }
      } : f)
    }));
  };

  const addAssetsToLibrary = async (files: File[], category: AssetItem['category']) => {
    const newAssets: AssetItem[] = [];
    
    // Process all files
    for (const file of files) {
      try {
        const url = await compressImage(file);
        newAssets.push({
          id: generateId(),
          url,
          category,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error("Failed to load asset", file.name, e);
      }
    }

    if (newAssets.length === 0) return;

    updateActiveState((prev) => {
      // Also set the first one as active on the current frame if applicable
      const firstAsset = newAssets[0];
      const updatedFrames = prev.frames.map(f => f.id === prev.activeFrameId ? {
        ...f,
        assets: category !== 'general' ? { ...f.assets, [category]: firstAsset.url } : f.assets
      } : f);

      return {
        ...prev,
        assetLibrary: [...newAssets, ...(prev.assetLibrary || [])],
        frames: updatedFrames
      };
    });
  };

  const updateCopy = (key: keyof AdCopy, value: string) => {
    updateActiveState((prev) => ({
      ...prev,
      frames: prev.frames.map(f => f.id === prev.activeFrameId ? {
        ...f,
        copy: { ...f.copy, [key]: value }
      } : f)
    }));
  };

  const updateDesign = (key: keyof AdDesign, value: string | number | null | boolean) => {
    updateActiveState((prev) => ({
      ...prev,
      design: { ...prev.design, [key]: value as any },
    }));
  };

  const updateAnimation = (key: keyof AdAnimation, value: string | number) => {
    updateActiveState((prev) => ({
      ...prev,
      animation: { ...prev.animation, [key]: value as any },
    }));
  };

  const applyAnimationPreset = (preset: AnimationPreset) => {
    updateActiveState((prev) => ({
      ...prev,
      animation: {
        effect: preset.effect,
        duration: preset.duration
      },
      animationKey: prev.animationKey + 1,
    }));
  };

  const updateSizeOverride = (sizeKey: string, override: Partial<AdSizeOverride>) => {
    updateActiveState((prev) => {
      const currentOverride = prev.sizeOverrides[sizeKey] || {};
      return {
        ...prev,
        sizeOverrides: {
          ...prev.sizeOverrides,
          [sizeKey]: { ...currentOverride, ...override }
        }
      };
    });
  };

  const triggerReplay = () => {
    updateActiveState((prev) => ({ ...prev, animationKey: prev.animationKey + 1 }));
  };

  const reset = () => {
    const newState = createDefaultState();
    setVariations([newState]);
    setActiveVariationId(newState.id);
  };

  const currentState = getActiveState();

  return (
    <AdContext.Provider
      value={{
        state: currentState,
        variations,
        activeVariationId,
        setActiveVariation,
        addVariation,
        removeVariation,
        updateVariationName,
        loadProject,
        addFrame,
        duplicateFrame,
        removeFrame,
        moveFrame,
        setActiveFrame,
        updateFrameLayout,
        updateActiveFrameDuration,
        updateFrameDurationById,
        toggleSize,
        addCustomSize,
        updateLandingPage,
        updateUtm,
        updateAsset,
        addAssetsToLibrary,
        updateCopy,
        updateFrameDuration,
        toggleTimingMode,
        updateDesign,
        updateAnimation,
        applyAnimationPreset,
        updateSizeOverride,
        triggerReplay,
        reset,
      }}
    >
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAd must be used within an AdProvider');
  }
  return context;
};
