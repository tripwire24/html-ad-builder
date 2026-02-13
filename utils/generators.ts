import { AdState, FrameLayout } from '../types';

export const generateBannerHTML = (
  state: AdState, 
  width: number, 
  height: number,
  imageMap?: Map<string, string>
): string => {
  const { frames, design, animation, sizeOverrides, frameDuration, landingPage, utm } = state;
  const sizeKey = `${width}x${height}`;
  const override = sizeOverrides[sizeKey] || {};

  // 1. ClickTag Construction
  const params = new URLSearchParams();
  if (utm.source) params.append('utm_source', utm.source);
  if (utm.medium) params.append('utm_medium', utm.medium);
  if (utm.campaign) params.append('utm_campaign', utm.campaign);
  if (utm.content) params.append('utm_content', utm.content);
  if (utm.term) params.append('utm_term', utm.term);
  
  const queryString = params.toString();
  const separator = landingPage.includes('?') ? '&' : '?';
  const fullClickTag = queryString ? `${landingPage}${separator}${queryString}` : landingPage;

  // 2. Asset Resolution
  const getSrc = (base64: string | null) => {
    if (!base64) return '';
    if (imageMap && imageMap.has(base64)) {
      return imageMap.get(base64);
    }
    return base64;
  };

  // 3. Layout Detection (Only include CSS for used layouts to save bytes)
  const usedLayouts = new Set<FrameLayout>(frames.map(f => f.layout));
  
  const isWide = width > height * 1.5;

  // 4. CSS Generation
  const effectiveFontScale = override.fontSizeScale !== undefined ? override.fontSizeScale : design.fontSizeScale;
  const logoScale = override.logoScale !== undefined ? override.logoScale : 1.0;
  
  const textOffsetX = override.textOffsetX || 0;
  const textOffsetY = override.textOffsetY || 0;
  const logoOffsetX = override.logoOffsetX || 0;
  const logoOffsetY = override.logoOffsetY || 0;

  const scale = effectiveFontScale || 1.0;
  const baseFontSize = Math.max(12, Math.round(Math.min(width, height) / 10)) * scale;
  const headlineSize = Math.round(baseFontSize * 1.6);
  const sublineSize = Math.round(baseFontSize * 1.0);
  const ctaSize = Math.round(baseFontSize * 0.9);

  // Logo Positioning
  const logoStyles: Record<string, string> = {
    'top-left': 'top: 8px; left: 8px;',
    'top-right': 'top: 8px; right: 8px;',
    'bottom-left': 'bottom: 8px; left: 8px;',
    'bottom-right': 'bottom: 8px; right: 8px;',
    'top-center': 'top: 8px; left: 50%; transform: translateX(-50%);',
    'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0;',
  };
  const logoStyleBase = logoStyles[design.logoPosition] || logoStyles['top-left'];

  // Animation Keyframes
  let animationKeyframes = '';
  const animDuration = animation.duration;

  if (animation.effect !== 'none') {
      let fromTransform = '';
      let toTransform = 'transform: translate(0,0) scale(1);';
      let fromOpacity = '0';
      
      switch (animation.effect) {
        case 'fade-in': fromTransform = ''; break;
        case 'slide-in-bottom': fromTransform = 'transform: translateY(100%);'; break;
        case 'slide-in-top': fromTransform = 'transform: translateY(-100%);'; break;
        case 'slide-in-left': fromTransform = 'transform: translateX(-100%);'; break;
        case 'slide-in-right': fromTransform = 'transform: translateX(100%);'; break;
        case 'zoom-in': fromTransform = 'transform: scale(0.5);'; break;
        case 'zoom-out': fromTransform = 'transform: scale(1.5);'; break;
      }
      animationKeyframes = `
        @keyframes enter { 
          from { opacity: ${fromOpacity}; ${fromTransform} } 
          to { opacity: 1; ${toTransform} } 
        }`;
  } else {
      animationKeyframes = `@keyframes enter { from { opacity: 0; } to { opacity: 1; } }`;
  }

  // Layout CSS Blocks
  let layoutCSS = '';

  if (usedLayouts.has('standard')) {
    layoutCSS += `
      .layout-standard .content-wrapper {
        flex-direction: ${isWide ? 'row' : 'column'};
        justify-content: center;
        align-items: center;
        text-align: ${isWide ? 'left' : 'center'};
      }
      .layout-standard .product-img {
        max-width: ${isWide ? '40%' : '70%'};
        max-height: ${isWide ? '80%' : '45%'};
        ${isWide ? 'margin-right: 15px;' : 'margin-bottom: 10px;'}
      }
      .layout-standard .text-group { align-items: ${isWide ? 'flex-start' : 'center'}; }
    `;
  }

  if (usedLayouts.has('split-top')) {
    layoutCSS += `
      .layout-split-top .content-wrapper { flex-direction: column; justify-content: flex-start; padding: 0; }
      .layout-split-top .product-img { width: 100%; height: 50%; object-fit: contain; margin-bottom: 0; background: rgba(0,0,0,0.03); }
      .layout-split-top .text-group { height: 50%; width: 100%; justify-content: center; padding: 10px; }
    `;
  }

  if (usedLayouts.has('split-bottom')) {
    layoutCSS += `
      .layout-split-bottom .content-wrapper { flex-direction: column-reverse; justify-content: flex-end; padding: 0; }
      .layout-split-bottom .product-img { width: 100%; height: 50%; object-fit: contain; background: rgba(0,0,0,0.03); }
      .layout-split-bottom .text-group { height: 50%; width: 100%; justify-content: center; padding: 10px; }
    `;
  }

  if (usedLayouts.has('split-left')) {
    layoutCSS += `
      .layout-split-left .content-wrapper { flex-direction: row; justify-content: flex-start; padding: 0; }
      .layout-split-left .product-img { width: 50%; height: 100%; object-fit: contain; background: rgba(0,0,0,0.03); margin: 0; }
      .layout-split-left .text-group { width: 50%; height: 100%; justify-content: center; padding: 10px; }
    `;
  }

  if (usedLayouts.has('split-right')) {
    layoutCSS += `
      .layout-split-right .content-wrapper { flex-direction: row-reverse; justify-content: flex-end; padding: 0; }
      .layout-split-right .product-img { width: 50%; height: 100%; object-fit: contain; background: rgba(0,0,0,0.03); margin: 0; }
      .layout-split-right .text-group { width: 50%; height: 100%; justify-content: center; padding: 10px; }
    `;
  }

  if (usedLayouts.has('overlay')) {
    layoutCSS += `
      .layout-overlay .content-wrapper { flex-direction: column; justify-content: center; align-items: center; padding: 20px; }
      .layout-overlay .product-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; }
      .layout-overlay .text-group { background: rgba(255,255,255,0.9); padding: 15px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    `;
  }

  // Frame Staggering
  let frameCSS = '';
  let cumulativeDelay = 0;
  frames.forEach((frame, index) => {
    const currentDuration = frame.duration !== undefined ? frame.duration : frameDuration;
    if (index === 0) {
      frameCSS += `#frame-0 { z-index: 10; opacity: 1; }`;
    } else {
      frameCSS += `
        #frame-${index} {
          z-index: ${10 + index};
          opacity: 0; 
          animation: enter ${animDuration}s ease-out forwards;
          animation-delay: ${cumulativeDelay}s;
        }
      `;
    }
    cumulativeDelay += currentDuration;
  });

  // HTML Construction
  const framesHTML = frames.map((frame, i) => {
    const bgSrc = getSrc(frame.assets.background);
    const logoSrc = getSrc(frame.assets.logo);
    const prodSrc = getSrc(frame.assets.product);
    
    return `
      <div id="frame-${i}" class="frame layout-${frame.layout}">
        ${bgSrc ? `<img src="${bgSrc}" class="bg-image" alt="" />` : ''}
        ${logoSrc ? `<img src="${logoSrc}" class="logo" alt="Logo" />` : ''}
        <div class="content-wrapper">
          ${prodSrc ? `<img src="${prodSrc}" class="product-img" alt="Product" />` : ''}
          <div class="text-group">
            ${frame.copy.headline ? `<h1>${frame.copy.headline}</h1>` : ''}
            ${frame.copy.subline ? `<p>${frame.copy.subline}</p>` : ''}
            ${frame.copy.cta ? `<div class="cta-wrapper"><span class="cta-btn">${frame.copy.cta}</span></div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="ad.size" content="width=${width},height=${height}">
<title>${frames[0].copy.headline}</title>
<script>var clickTag = "${fullClickTag}";</script>
<style>
  body { margin: 0; padding: 0; overflow: hidden; font-family: Arial, Helvetica, sans-serif; }
  #ad-container {
    width: ${width}px;
    height: ${height}px;
    position: relative;
    border: 1px solid ${design.borderColor};
    box-sizing: border-box;
    background-color: ${design.backgroundColor};
    color: ${design.textColor};
    overflow: hidden;
    cursor: pointer;
    -webkit-font-smoothing: antialiased;
  }
  .frame {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    overflow: hidden; background-color: ${design.backgroundColor}; pointer-events: none;
  }
  .bg-image {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    object-fit: cover; z-index: 1;
  }
  .content-wrapper {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 10; display: flex; box-sizing: border-box;
    gap: 8px; padding: 12px;
  }
  .logo {
    position: absolute; z-index: 20; object-fit: contain;
    ${logoStyleBase}
    max-width: ${isWide ? '140px' : '35%'}; max-height: ${isWide ? '60px' : '20%'};
    margin-left: ${logoOffsetX}px; margin-top: ${logoOffsetY}px;
    transform: scale(${logoScale}) ${design.logoPosition.includes('center') && !design.logoPosition.includes('top-center') ? 'translate(-50%, -50%)' : ''} ${design.logoPosition === 'top-center' ? 'translateX(-50%)' : ''};
    transform-origin: center;
  }
  .text-group {
    display: flex; flex-direction: column; width: 100%;
    transform: translate(${textOffsetX}px, ${textOffsetY}px);
  }
  h1 { margin: 0 0 4px 0; font-size: ${headlineSize}px; line-height: 1.1; color: ${design.primaryColor}; font-weight: 700; }
  p { margin: 0 0 8px 0; font-size: ${sublineSize}px; line-height: 1.25; opacity: 0.9; }
  .cta-wrapper { margin-top: auto; }
  .cta-btn {
    display: inline-block; background-color: ${design.accentColor}; color: #ffffff;
    padding: 6px 14px; text-decoration: none; font-weight: 600; font-size: ${ctaSize}px;
    border-radius: 3px;
  }
  ${animationKeyframes}
  ${layoutCSS}
  ${frameCSS}
</style>
</head>
<body>
  <div id="ad-container" onclick="window.open(window.clickTag)">
    ${framesHTML}
  </div>
</body>
</html>`;
};
