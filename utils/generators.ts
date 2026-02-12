import { AdState } from '../types';

export const generateBannerHTML = (state: AdState, width: number, height: number): string => {
  const { frames, design, animation, sizeOverrides, frameDuration, landingPage, utm } = state;
  const sizeKey = `${width}x${height}`;
  const override = sizeOverrides[sizeKey] || {};

  // Construct ClickTag
  const params = new URLSearchParams();
  if (utm.source) params.append('utm_source', utm.source);
  if (utm.medium) params.append('utm_medium', utm.medium);
  if (utm.campaign) params.append('utm_campaign', utm.campaign);
  if (utm.content) params.append('utm_content', utm.content);
  if (utm.term) params.append('utm_term', utm.term);
  
  const queryString = params.toString();
  const separator = landingPage.includes('?') ? '&' : '?';
  const fullClickTag = queryString ? `${landingPage}${separator}${queryString}` : landingPage;

  // Apply Overrides or Defaults
  const effectiveFontScale = override.fontSizeScale !== undefined ? override.fontSizeScale : design.fontSizeScale;
  const logoScale = override.logoScale !== undefined ? override.logoScale : 1.0;
  
  const textOffsetX = override.textOffsetX || 0;
  const textOffsetY = override.textOffsetY || 0;
  const logoOffsetX = override.logoOffsetX || 0;
  const logoOffsetY = override.logoOffsetY || 0;

  // Animation CSS Keyframes
  let animationKeyframes = '';
  const animDuration = animation.duration; // transition duration

  // Define transition keyframes
  switch (animation.effect) {
    case 'fade-in':
      animationKeyframes = `@keyframes enter { from { opacity: 0; } to { opacity: 1; } }`;
      break;
    case 'slide-in-bottom':
      animationKeyframes = `@keyframes enter { from { transform: translateY(100%); opacity: 1; } to { transform: translateY(0); opacity: 1; } }`;
      break;
    case 'slide-in-top':
      animationKeyframes = `@keyframes enter { from { transform: translateY(-100%); opacity: 1; } to { transform: translateY(0); opacity: 1; } }`;
      break;
    case 'slide-in-left': 
      animationKeyframes = `@keyframes enter { from { transform: translateX(-100%); opacity: 1; } to { transform: translateX(0); opacity: 1; } }`;
      break;
    case 'slide-in-right':
      animationKeyframes = `@keyframes enter { from { transform: translateX(100%); opacity: 1; } to { transform: translateX(0); opacity: 1; } }`;
      break;
    case 'zoom-in':
      animationKeyframes = `@keyframes enter { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`;
      break;
    case 'zoom-out':
      animationKeyframes = `@keyframes enter { from { transform: scale(1.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`;
      break;
    default:
      animationKeyframes = `@keyframes enter { from { opacity: 0; } to { opacity: 1; } }`;
  }

  // Generate CSS for frames stacking
  let frameCSS = '';
  frames.forEach((frame, index) => {
    const delay = index * frameDuration;
    if (index === 0) {
      frameCSS += `
        #frame-0 {
          z-index: 10;
          opacity: 1;
        }
      `;
    } else {
      frameCSS += `
        #frame-${index} {
          z-index: ${10 + index};
          opacity: 0; 
          animation: enter ${animDuration}s ease-out forwards;
          animation-delay: ${delay}s;
        }
      `;
    }
  });

  // Positioning Logic
  const logoStyles: Record<string, string> = {
    'top-left': 'top: 10px; left: 10px;',
    'top-right': 'top: 10px; right: 10px;',
    'bottom-left': 'bottom: 10px; left: 10px;',
    'bottom-right': 'bottom: 10px; right: 10px;',
    'top-center': 'top: 10px; left: 50%; transform: translateX(-50%);',
    'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0;',
  };

  const isWide = width > height * 2;
  
  const activeFontFamily = design.customFont ? design.customFont : design.font;
  const fontUrlBase = 'https://fonts.googleapis.com/css2?display=swap';
  let fontLinkHtml = '';
  if (design.customFont) {
    const formattedFontName = design.customFont.trim().replace(/ /g, '+');
    fontLinkHtml = `<link href="${fontUrlBase}&family=${formattedFontName}:wght@400;700" rel="stylesheet">`;
  } else {
    fontLinkHtml = `<link href="${fontUrlBase}&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Montserrat:wght@400;700" rel="stylesheet">`;
  }

  const scale = effectiveFontScale || 1.0;
  const baseFontSize = Math.max(12, Math.round(Math.min(width, height) / 8)) * scale;
  const headlineSize = Math.round(baseFontSize * 1.5);
  const sublineSize = Math.round(baseFontSize * 1.0);
  const ctaSize = Math.round(baseFontSize * 0.9);

  const logoStyleBase = logoStyles[design.logoPosition] || logoStyles['top-left'];

  // LAYOUT SPECIFIC CSS LOGIC
  // We use utility classes in the frame wrapper to control layout
  const layoutCSS = `
    /* Standard: Responsive based on aspect ratio */
    .layout-standard .content-wrapper {
      flex-direction: ${isWide ? 'row' : 'column'};
      justify-content: center;
      align-items: center;
    }
    .layout-standard .product-img {
      max-width: ${isWide ? '30%' : '60%'};
      max-height: ${isWide ? '80%' : '40%'};
      ${isWide ? 'margin-right: 15px;' : 'margin-bottom: 10px;'}
    }

    /* Split Top: Image Top 50%, Text Bottom 50% */
    .layout-split-top .content-wrapper {
      flex-direction: column;
      justify-content: flex-start;
      padding: 0;
    }
    .layout-split-top .product-img {
      width: 100%;
      height: 50%;
      object-fit: contain;
      background: rgba(0,0,0,0.02);
      margin: 0;
    }
    .layout-split-top .text-group {
      height: 50%;
      width: 100%;
      justify-content: center;
      padding: 10px;
      box-sizing: border-box;
    }

    /* Split Bottom: Text Top 50%, Image Bottom 50% */
    .layout-split-bottom .content-wrapper {
      flex-direction: column-reverse;
      justify-content: flex-end;
      padding: 0;
    }
    .layout-split-bottom .product-img {
      width: 100%;
      height: 50%;
      object-fit: contain;
      background: rgba(0,0,0,0.02);
      margin: 0;
    }
    .layout-split-bottom .text-group {
      height: 50%;
      width: 100%;
      justify-content: center;
      padding: 10px;
      box-sizing: border-box;
    }

    /* Split Left: Image Left 50%, Text Right 50% */
    .layout-split-left .content-wrapper {
      flex-direction: row;
      justify-content: flex-start;
      padding: 0;
    }
    .layout-split-left .product-img {
      width: 50%;
      height: 100%;
      object-fit: contain;
      background: rgba(0,0,0,0.02);
      margin: 0;
    }
    .layout-split-left .text-group {
      width: 50%;
      height: 100%;
      justify-content: center;
      padding: 10px;
      box-sizing: border-box;
    }

    /* Split Right: Text Left 50%, Image Right 50% */
    .layout-split-right .content-wrapper {
      flex-direction: row-reverse;
      justify-content: flex-end;
      padding: 0;
    }
    .layout-split-right .product-img {
      width: 50%;
      height: 100%;
      object-fit: contain;
      background: rgba(0,0,0,0.02);
      margin: 0;
    }
    .layout-split-right .text-group {
      width: 50%;
      height: 100%;
      justify-content: center;
      padding: 10px;
      box-sizing: border-box;
    }

    /* Overlay: Image Full Background, Text centered on top */
    .layout-overlay .content-wrapper {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .layout-overlay .product-img {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      object-fit: cover;
      z-index: -1;
      opacity: 0.9;
    }
    .layout-overlay .text-group {
      background: rgba(255,255,255,0.8);
      padding: 15px;
      border-radius: 8px;
    }
  `;

  // Frame Content Generator
  const generateFrameContent = (frame: typeof frames[0], idx: number) => `
    <div id="frame-${idx}" class="frame layout-${frame.layout}">
      ${frame.assets.background ? `<img src="${frame.assets.background}" class="bg-image" alt="" />` : ''}
      ${frame.assets.logo ? `<img src="${frame.assets.logo}" class="logo" alt="Logo" />` : ''}
      
      <div class="content-wrapper">
        ${frame.assets.product ? `<img src="${frame.assets.product}" class="product-img" alt="Product" />` : ''}
        
        <div class="text-group">
          <h1>${frame.copy.headline}</h1>
          ${frame.copy.subline ? `<p>${frame.copy.subline}</p>` : ''}
          ${frame.copy.cta ? `<span class="cta-btn">${frame.copy.cta}</span>` : ''}
        </div>
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="ad.size" content="width=${width},height=${height}">
<title>${frames[0].copy.headline}</title>
${fontLinkHtml}
<script>
  var clickTag = "${fullClickTag}";
</script>
<style>
  body { margin: 0; padding: 0; overflow: hidden; font-family: '${activeFontFamily}', sans-serif; }
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
  }
  
  .frame {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    overflow: hidden;
    background-color: ${design.backgroundColor};
  }

  .bg-image {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    object-fit: cover;
    z-index: 1;
  }
  
  .content-wrapper {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    z-index: 10;
    display: flex;
    /* Default flex props overridden by layout classes */
    box-sizing: border-box;
    text-align: center;
    gap: 10px;
    padding: 15px;
  }

  .logo {
    position: absolute;
    ${logoStyleBase}
    max-width: ${isWide ? '150px' : '35%'};
    max-height: ${isWide ? '80%' : '20%'};
    z-index: 20;
    object-fit: contain;
    /* Apply overrides */
    margin-left: ${logoOffsetX}px;
    margin-top: ${logoOffsetY}px;
    transform: scale(${logoScale}) ${design.logoPosition.includes('center') && !design.logoPosition.includes('top-center') ? 'translate(-50%, -50%)' : ''} ${design.logoPosition === 'top-center' ? 'translateX(-50%)' : ''};
    transform-origin: center;
  }

  .text-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Apply Offset Override */
    transform: translate(${textOffsetX}px, ${textOffsetY}px);
  }

  h1 {
    margin: 0 0 5px 0;
    font-size: ${headlineSize}px;
    line-height: 1.2;
    color: ${design.primaryColor};
  }

  p {
    margin: 0 0 10px 0;
    font-size: ${sublineSize}px;
    line-height: 1.3;
    opacity: 0.9;
  }

  .cta-btn {
    display: inline-block;
    background-color: ${design.accentColor};
    color: #ffffff;
    padding: 8px 16px;
    text-decoration: none;
    font-weight: bold;
    font-size: ${ctaSize}px;
    border-radius: 4px;
    transition: transform 0.2s;
  }
  
  .cta-btn:hover {
    transform: scale(1.05);
  }

  /* Animation Keyframes */
  ${animationKeyframes}
  
  /* Layout Classes */
  ${layoutCSS}

  /* Frame Staggering */
  ${frameCSS}
</style>
</head>
<body>
  <a href="javascript:window.open(window.clickTag)" id="clickArea">
    <div id="ad-container">
      ${frames.map((frame, i) => generateFrameContent(frame, i)).join('')}
    </div>
  </a>
</body>
</html>`;
};
