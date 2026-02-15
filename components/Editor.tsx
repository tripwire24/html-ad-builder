
import React, { useRef, useState } from 'react';
import { useAd } from '../context/AdContext';
import { AVAILABLE_SIZES, ANIMATION_PRESETS, AdAssets, FrameLayout, AssetItem } from '../types';
import { compressImage, base64ToBlob } from '../utils/compression';
import { Trash2, Upload, RefreshCw, Layers, Layout, Image as ImageIcon, Palette, Type, Download, Plus, Search, Copy, ExternalLink, MoreVertical, Film, LayoutTemplate, PanelTop, PanelBottom, PanelLeft, PanelRight, Maximize, Clock, WifiOff, ArrowLeft, ArrowRight, Save, FolderOpen, Grid, Check } from 'lucide-react';
import JSZip from 'jszip';
import { generateBannerHTML } from '../utils/generators';

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-colors border-b-2 ${
      active ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className="text-[10px] uppercase font-semibold mt-1 tracking-wide">{label}</span>
  </button>
);

const AssetManager: React.FC<{ 
  label: string; 
  assetKey: keyof AdAssets; 
  category: AssetItem['category'];
  currentValue: string | null; 
}> = ({ label, assetKey, category, currentValue }) => {
  const { updateAsset, addAssetsToLibrary, state } = useAd();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addAssetsToLibrary(Array.from(e.target.files), category);
    }
  };

  // Filter library for this specific category
  const libraryAssets = (state.assetLibrary || []).filter(a => a.category === category);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        {currentValue && (
           <div className="flex gap-1">
             <button onClick={() => updateAsset(assetKey, null)} className="text-red-600 hover:text-red-800"><Trash2 size={14}/></button>
           </div>
        )}
      </div>
      
      {/* Current Asset Preview */}
      <div className="p-3 bg-white">
        {currentValue ? (
          <div className="h-32 w-full flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZWVlZWVlIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] rounded border border-gray-200">
             <img src={currentValue} alt={label} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="h-24 w-full border-2 border-dashed border-gray-200 rounded flex flex-col items-center justify-center text-gray-300">
            <ImageIcon size={24} />
            <span className="text-[10px] mt-1">Empty Slot</span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-3 pb-3">
         <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center justify-center gap-2 text-xs font-medium transition-colors"
          >
            <Upload size={14} />
            Upload New (Batch Supported)
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" multiple />
      </div>

      {/* Library Grid */}
      {libraryAssets.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-2">
           <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2 pl-1">
             <Grid size={10} /> Library ({libraryAssets.length})
           </div>
           <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1">
             {libraryAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => updateAsset(assetKey, asset.url)}
                  className={`relative aspect-square rounded border overflow-hidden bg-white hover:border-blue-400 transition-all ${currentValue === asset.url ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200'}`}
                >
                   <img src={asset.url} className="w-full h-full object-cover" alt="" />
                   {currentValue === asset.url && (
                     <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                       <div className="bg-blue-600 rounded-full p-0.5"><Check size={10} className="text-white"/></div>
                     </div>
                   )}
                </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export const Editor: React.FC = () => {
  const { 
    state, toggleSize, addCustomSize, updateCopy, updateDesign, updateAnimation, applyAnimationPreset,
    variations, activeVariationId, setActiveVariation, addVariation, removeVariation, updateVariationName, loadProject,
    addFrame, duplicateFrame, removeFrame, moveFrame, setActiveFrame, updateFrameDuration, updateLandingPage, updateUtm, updateFrameLayout, 
    updateActiveFrameDuration, updateFrameDurationById, toggleTimingMode
  } = useAd();
  
  const [activeTab, setActiveTab] = useState<'layout' | 'assets' | 'design' | 'content'>('layout');
  const [customW, setCustomW] = useState('300');
  const [customH, setCustomH] = useState('100');
  const projectInputRef = useRef<HTMLInputElement>(null);

  // Identify active frame
  const activeFrame = state.frames.find(f => f.id === state.activeFrameId) || state.frames[0];
  const activeFrameIndex = state.frames.indexOf(activeFrame);

  const handleCustomSizeAdd = () => {
    const w = parseInt(customW);
    const h = parseInt(customH);
    if (w > 0 && h > 0) {
      addCustomSize(w, h);
      setCustomW('');
      setCustomH('');
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSaveProject = () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const filename = `${state.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    downloadBlob(blob, filename);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const loadedState = JSON.parse(ev.target?.result as string);
          loadProject(loadedState);
        } catch (err) {
          alert("Failed to load project file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = async () => {
    const totalUnits = variations.reduce((acc, v) => acc + v.selectedSizes.length, 0);
    
    if (totalUnits === 0) {
      alert("Please select at least one size to export.");
      return;
    }

    const mainZip = new JSZip();

    // Helper to generate a single ad unit zip
    const createAdUnitZip = async (variation: typeof state, w: number, h: number) => {
      const unitZip = new JSZip();
      
      // Image Extraction Logic
      const imageMap = new Map<string, string>(); // base64 -> 'assets/img1.png'
      const assetsFolder = unitZip.folder("assets");
      let imgCounter = 1;

      // Scan all frames for images
      variation.frames.forEach(frame => {
        ['background', 'logo', 'product'].forEach(key => {
          const base64 = frame.assets[key as keyof AdAssets];
          if (base64 && !imageMap.has(base64)) {
             // Determine extension
             const isPng = base64.startsWith('data:image/png');
             const ext = isPng ? 'png' : 'jpg';
             const fileName = `img_${imgCounter}.${ext}`;
             
             if (assetsFolder) {
               assetsFolder.file(fileName, base64ToBlob(base64));
               imageMap.set(base64, `assets/${fileName}`);
               imgCounter++;
             }
          }
        });
      });

      const html = generateBannerHTML(variation, w, h, imageMap);
      unitZip.file('index.html', html);
      return unitZip.generateAsync({ type: 'blob' });
    };

    // CASE 1: Single Unit Export
    if (totalUnits === 1) {
      const variation = variations.find(v => v.selectedSizes.length > 0);
      if (!variation) return;
      
      const sizeStr = variation.selectedSizes[0];
      const [w, h] = sizeStr.split('x').map(Number);
      
      const blob = await createAdUnitZip(variation, w, h);
      
      // Filename
      let baseName = variation.utm.campaign && variation.utm.campaign !== 'campaign_name' 
        ? variation.utm.campaign 
        : variation.name;
      baseName = baseName.replace(/[^a-z0-9-_]/gi, '-');
      const dateStr = new Date().toISOString().slice(0, 10);
      
      downloadBlob(blob, `${baseName}_${sizeStr}_${dateStr}.zip`);
      return;
    }

    // CASE 2: Bulk Export (Bundle)
    mainZip.file("README.txt", "IMPORTANT: Do not upload this ZIP file directly to Google Ads.\n\n1. Unzip this file first.\n2. Upload the individual .zip files (e.g., '300x250.zip') found inside.");

    const variationPromises = variations.map(async (variation) => {
      let targetFolder = mainZip;
      if (variations.length > 1) {
        let folderName = variation.name.trim().replace(/[^a-z0-9-_]/gi, '-');
        if (!folderName) folderName = `variation-${variation.id}`;
        targetFolder = mainZip.folder(folderName) || mainZip;
      }

      const sizePromises = variation.selectedSizes.map(async (sizeStr) => {
          const [w, h] = sizeStr.split('x').map(Number);
          const unitZipBlob = await createAdUnitZip(variation, w, h);
          targetFolder.file(`${sizeStr}.zip`, unitZipBlob);
      });
      await Promise.all(sizePromises);
    });

    await Promise.all(variationPromises);
    const content = await mainZip.generateAsync({ type: 'blob' });
    
    let fileName = 'HTML5_Banners_Bundle';
    const activeVar = variations.find(v => v.id === activeVariationId) || variations[0];
    if (activeVar.utm.campaign && activeVar.utm.campaign !== 'campaign_name') {
       fileName = activeVar.utm.campaign + '_Bundle';
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadBlob(content, `${fileName.replace(/[^a-z0-9-_]/gi, '-')}_${dateStr}.zip`);
  };

  const getFullClickTagPreview = () => {
    const params = new URLSearchParams();
    if (state.utm.source) params.append('utm_source', state.utm.source);
    if (state.utm.medium) params.append('utm_medium', state.utm.medium);
    if (state.utm.campaign) params.append('utm_campaign', state.utm.campaign);
    if (state.utm.content) params.append('utm_content', state.utm.content);
    if (state.utm.term) params.append('utm_term', state.utm.term);
    const qs = params.toString();
    const sep = state.landingPage.includes('?') ? '&' : '?';
    return qs ? `${state.landingPage}${sep}${qs}` : state.landingPage;
  };

  const layoutOptions: { id: FrameLayout; label: string; icon: React.ReactNode }[] = [
    { id: 'standard', label: 'Standard', icon: <LayoutTemplate size={16} /> },
    { id: 'split-top', label: 'Img Top', icon: <PanelTop size={16} /> },
    { id: 'split-bottom', label: 'Img Btm', icon: <PanelBottom size={16} /> },
    { id: 'split-left', label: 'Img Left', icon: <PanelLeft size={16} /> },
    { id: 'split-right', label: 'Img Right', icon: <PanelRight size={16} /> },
    { id: 'overlay', label: 'Overlay', icon: <Maximize size={16} /> },
  ];

  return (
    <div className="w-96 bg-white border-r border-gray-200 h-full flex flex-col shadow-xl z-20">
      
      {/* App Header */}
      <div className="p-4 border-b border-gray-100 flex flex-col gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center gap-2">
            <Layers className="text-blue-400" /> 
            <h1 className="text-lg font-bold tracking-tight">AdBuilder Pro</h1>
        </div>
        
        {/* Project Controls */}
        <div className="flex gap-2 mt-1">
            <button 
                onClick={handleSaveProject}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 rounded transition-colors"
            >
                <Save size={12} /> Save Project
            </button>
            <button 
                onClick={() => projectInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 rounded transition-colors"
            >
                <FolderOpen size={12} /> Open
            </button>
            <input 
                type="file" 
                ref={projectInputRef} 
                onChange={handleLoadProject} 
                accept=".json" 
                className="hidden" 
            />
        </div>
      </div>

      {/* Variation Manager */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
         <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Variation</span>
            <button 
              onClick={addVariation}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
              title="Duplicate current variation"
            >
              <Copy size={12} /> Duplicate
            </button>
         </div>
         <div className="flex gap-2">
            <div className="relative flex-1">
              <select 
                value={activeVariationId} 
                onChange={(e) => setActiveVariation(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 font-medium focus:outline-none focus:border-blue-500 shadow-sm"
              >
                {variations.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <MoreVertical size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
            </div>
            
            <input 
              type="text" 
              value={state.name}
              onChange={(e) => updateVariationName(state.id, e.target.value)}
              className="w-1/3 px-2 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
              placeholder="Label"
            />

            {variations.length > 1 && (
               <button 
                 onClick={() => removeVariation(state.id)}
                 className="p-2 text-red-500 hover:bg-red-50 rounded border border-gray-200 bg-white shadow-sm"
                 title="Delete Variation"
               >
                 <Trash2 size={16} />
               </button>
            )}
         </div>
      </div>

      {/* TILE / FRAME MANAGER */}
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-gray-500">
             <Film size={14} />
             <span className="text-[10px] font-bold uppercase tracking-wider">Frame Sequence</span>
          </div>
          <button onClick={addFrame} className="text-xs text-blue-600 font-semibold hover:bg-blue-50 px-2 py-1 rounded">
             + Add Tile
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {state.frames.map((frame, index) => (
             <div key={frame.id} className="relative group/frame flex flex-col">
                <button
                onClick={() => setActiveFrame(frame.id)}
                className={`relative flex flex-col items-center min-w-[3.5rem] p-1.5 rounded border transition-all ${
                    frame.id === state.activeFrameId 
                    ? 'border-blue-600 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                >
                <span className={`text-xs font-bold mb-3 ${frame.id === state.activeFrameId ? 'text-blue-700' : 'text-gray-600'}`}>
                    #{index + 1}
                </span>
                <div className="flex items-center gap-1">
                    <div onClick={(e) => { e.stopPropagation(); duplicateFrame(frame.id); }} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="Duplicate Tile">
                        <Copy size={10} />
                    </div>
                    {state.frames.length > 1 && (
                    <div onClick={(e) => { e.stopPropagation(); removeFrame(frame.id); }} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors" title="Delete Tile">
                        <Trash2 size={10} />
                    </div>
                    )}
                </div>
                </button>
                
                {/* Reorder Controls */}
                {state.frames.length > 1 && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex bg-white border border-gray-200 rounded-full shadow-sm opacity-0 group-hover/frame:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); moveFrame(frame.id, 'left'); }}
                            disabled={index === 0}
                            className={`p-0.5 ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                            <ArrowLeft size={10} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); moveFrame(frame.id, 'right'); }}
                            disabled={index === state.frames.length - 1}
                            className={`p-0.5 ${index === state.frames.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                            <ArrowRight size={10} />
                        </button>
                    </div>
                )}
             </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <TabButton active={activeTab === 'layout'} onClick={() => setActiveTab('layout')} icon={<Layout size={18} />} label="Layout" />
        <TabButton active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} icon={<ImageIcon size={18} />} label="Assets" />
        <TabButton active={activeTab === 'design'} onClick={() => setActiveTab('design')} icon={<Palette size={18} />} label="Design" />
        <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<Type size={18} />} label="Content" />
      </div>

      <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
        
        {/* LAYOUT TAB */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Standard Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((size) => {
                  const key = `${size.width}x${size.height}`;
                  const isActive = state.selectedSizes.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleSize(key)}
                      className={`px-3 py-2 text-xs rounded border transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Custom Size</h3>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 mb-1 block">Width</label>
                  <input 
                    type="number" 
                    value={customW} 
                    onChange={e => setCustomW(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400 shadow-sm" 
                    placeholder="W" 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 mb-1 block">Height</label>
                  <input 
                    type="number" 
                    value={customH} 
                    onChange={e => setCustomH(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400 shadow-sm" 
                    placeholder="H" 
                  />
                </div>
                <button onClick={handleCustomSizeAdd} className="h-[38px] w-[38px] flex items-center justify-center bg-gray-800 text-white rounded hover:bg-black shadow-sm">
                  <Plus size={16} />
                </button>
              </div>
            </section>

             <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Google Ads Settings</h3>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Landing Page URL</label>
                <input
                  type="text"
                  value={state.landingPage}
                  onChange={(e) => updateLandingPage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  placeholder="https://www.example.com"
                />
                <p className="text-[10px] text-gray-400 mt-1">Must be https://</p>
              </div>

              <div className="space-y-3 p-3 bg-gray-100 rounded border border-gray-200">
                 <h4 className="text-[11px] font-bold text-gray-600 uppercase">UTM Parameters</h4>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">Source</label>
                      <input 
                        type="text" 
                        value={state.utm.source}
                        onChange={(e) => updateUtm('source', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900"
                        placeholder="google"
                      />
                   </div>
                   <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">Medium</label>
                      <input 
                        type="text" 
                        value={state.utm.medium}
                        onChange={(e) => updateUtm('medium', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900"
                        placeholder="display"
                      />
                   </div>
                 </div>
                 
                 <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">Campaign</label>
                    <input 
                      type="text" 
                      value={state.utm.campaign}
                      onChange={(e) => updateUtm('campaign', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900"
                      placeholder="summer_sale"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">Content (Optional)</label>
                      <input 
                        type="text" 
                        value={state.utm.content}
                        onChange={(e) => updateUtm('content', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900"
                        placeholder="banner_size"
                      />
                   </div>
                   <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">Term (Optional)</label>
                      <input 
                        type="text" 
                        value={state.utm.term}
                        onChange={(e) => updateUtm('term', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900"
                        placeholder="keywords"
                      />
                   </div>
                 </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                 <h4 className="text-[10px] font-bold text-blue-800 uppercase mb-1">ClickTag Fallback Preview</h4>
                 <div className="bg-white p-2 rounded border border-blue-200 text-[10px] font-mono text-gray-600 break-all">
                   {getFullClickTagPreview()}
                 </div>
                 <p className="text-[10px] text-blue-800 mt-2 leading-relaxed">
                   The exported HTML includes Google's standard <code>clickTag</code> variable. Google's ad server will replace this with their tracking URL, using the fallback above for local testing.
                 </p>
              </div>
            </section>
          </div>
        )}

        {/* ASSETS TAB */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
             <div className="bg-yellow-50 p-2 rounded border border-yellow-100 mb-2 text-[11px] text-yellow-800 flex items-center gap-2">
               <Film size={12}/> Editing Assets for <strong>Frame {activeFrameIndex + 1}</strong>
             </div>
             
             <AssetManager 
               label="Background Image" 
               assetKey="background" 
               category="background"
               currentValue={activeFrame.assets.background} 
             />
             <AssetManager 
               label="Logo" 
               assetKey="logo" 
               category="logo"
               currentValue={activeFrame.assets.logo} 
             />
             <AssetManager 
               label="Product Image" 
               assetKey="product" 
               category="product"
               currentValue={activeFrame.assets.product} 
             />
          </div>
        )}

        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Colors</h3>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 shadow-sm">
                    <span className="text-sm text-gray-600">Background</span>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-mono text-gray-400">{state.design.backgroundColor}</span>
                       <input type="color" value={state.design.backgroundColor} onChange={(e) => updateDesign('backgroundColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 shadow-sm">
                    <span className="text-sm text-gray-600">Headline</span>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-mono text-gray-400">{state.design.primaryColor}</span>
                       <input type="color" value={state.design.primaryColor} onChange={(e) => updateDesign('primaryColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 shadow-sm">
                    <span className="text-sm text-gray-600">CTA Button</span>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-mono text-gray-400">{state.design.accentColor}</span>
                       <input type="color" value={state.design.accentColor} onChange={(e) => updateDesign('accentColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 shadow-sm">
                    <span className="text-sm text-gray-600">Border</span>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-mono text-gray-400">{state.design.borderColor}</span>
                       <input type="color" value={state.design.borderColor} onChange={(e) => updateDesign('borderColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    </div>
                 </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Typography</h3>
              <div className="space-y-3">
                {/* Google Font Toggle */}
                <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded">
                  <div className="flex items-center gap-2">
                     <WifiOff size={14} className="text-blue-600"/>
                     <span className="text-xs font-medium text-blue-800">Disable Google Fonts</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={state.design.disableGoogleFonts}
                      onChange={(e) => updateDesign('disableGoogleFonts', e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {state.design.disableGoogleFonts && (
                  <p className="text-[10px] text-gray-500">
                    Fixes "Cannot reference external URL" errors by using system fonts (Arial, Helvetica, etc) instead of linking to fonts.googleapis.com.
                  </p>
                )}

                {/* Standard Font Select */}
                <div>
                   <label className="block text-xs font-medium text-gray-600 mb-1">Standard Font</label>
                   <select 
                     value={state.design.font}
                     onChange={(e) => updateDesign('font', e.target.value)}
                     className="w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 shadow-sm"
                     disabled={!!state.design.customFont}
                   >
                     <option value="Roboto">Roboto</option>
                     <option value="Open Sans">Open Sans</option>
                     <option value="Montserrat">Montserrat</option>
                     <option value="Lato">Lato</option>
                     <option value="Poppins">Poppins</option>
                     <option value="Oswald">Oswald</option>
                     <option value="Arial">Arial</option>
                   </select>
                </div>

                {/* Custom Google Font Input */}
                <div className={state.design.disableGoogleFonts ? 'opacity-50 pointer-events-none' : ''}>
                   <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center justify-between">
                      <span>Or Custom Google Font</span>
                      <a href="https://fonts.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-[10px]">Browse Fonts</a>
                   </label>
                   <div className="relative">
                      <input 
                        type="text" 
                        value={state.design.customFont || ''}
                        onChange={(e) => updateDesign('customFont', e.target.value || null)}
                        placeholder="e.g. Pacifico"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                      />
                      <Search size={14} className="absolute left-2.5 top-3 text-gray-400" />
                   </div>
                   <p className="text-[10px] text-gray-400 mt-1">Entering a name here overrides the standard font.</p>
                </div>

                {/* Font Size Slider */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600">Text Size Scale</label>
                    <span className="text-xs text-gray-400">{Math.round(state.design.fontSizeScale * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={state.design.fontSizeScale}
                    onChange={(e) => updateDesign('fontSizeScale', parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </section>

             <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Animation & Timing</h3>
              
              <div className="mb-6">
                 <label className="text-xs font-medium text-gray-600 mb-1 block">Transition Effect</label>
                 <select 
                   value={state.animation.effect}
                   onChange={(e) => updateAnimation('effect', e.target.value)}
                   className="w-full px-3 py-2 border rounded-md text-sm bg-white text-gray-900 shadow-sm"
                 >
                   {ANIMATION_PRESETS.map(p => (
                     <option key={p.effect} value={p.effect}>{p.label}</option>
                   ))}
                 </select>
              </div>

               <div className="bg-gray-50 rounded border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                        <Clock size={12}/> Frame Durations
                     </span>
                     <div className="flex bg-white rounded border border-gray-300 overflow-hidden">
                        <button 
                           onClick={() => toggleTimingMode('global')}
                           className={`px-2 py-1 text-[10px] font-medium ${state.timingMode === 'global' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                           Uniform
                        </button>
                        <button 
                           onClick={() => toggleTimingMode('custom')}
                           className={`px-2 py-1 text-[10px] font-medium ${state.timingMode === 'custom' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                           Individual
                        </button>
                     </div>
                  </div>
                  
                  {state.timingMode === 'global' ? (
                     <div>
                        <div className="flex justify-between mb-1">
                           <label className="text-xs text-gray-500">All frames duration</label>
                           <span className="text-xs text-gray-900 font-mono">{state.frameDuration}s</span>
                        </div>
                        <input 
                           type="range" min="1" max="10" step="0.5" 
                           value={state.frameDuration}
                           onChange={(e) => updateFrameDuration(parseFloat(e.target.value))}
                           className="w-full accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                     </div>
                  ) : (
                     <div className="space-y-2">
                        {state.frames.map((frame, idx) => (
                           <div key={frame.id} className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 w-12">Frame {idx + 1}</span>
                              <input 
                                 type="range" min="1" max="10" step="0.5"
                                 value={frame.duration ?? state.frameDuration}
                                 onChange={(e) => updateFrameDurationById(frame.id, parseFloat(e.target.value))}
                                 className="flex-1 accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <span className="text-[10px] font-mono w-8 text-right">{(frame.duration ?? state.frameDuration).toFixed(1)}s</span>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </section>
          </div>
        )}

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-6">
             <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-[11px] text-yellow-800 flex items-center gap-2">
               <Film size={12}/> Editing Content for <strong>Frame {activeFrameIndex + 1}</strong>
             </div>

             {/* Frame Layout Selector */}
             <div>
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Frame Layout</label>
               <div className="grid grid-cols-3 gap-2">
                 {layoutOptions.map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => updateFrameLayout(opt.id)}
                     className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                       activeFrame.layout === opt.id
                         ? 'bg-blue-50 border-blue-600 text-blue-700'
                         : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                     }`}
                     title={opt.label}
                   >
                     {opt.icon}
                     <span className="text-[10px] mt-1 font-medium">{opt.label}</span>
                   </button>
                 ))}
               </div>
             </div>

             <div className="space-y-4">
               <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Headline</label>
                <textarea
                  rows={2}
                  value={activeFrame.copy.headline}
                  onChange={(e) => updateCopy('headline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subline</label>
                <textarea
                  rows={2}
                  value={activeFrame.copy.subline}
                  onChange={(e) => updateCopy('subline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CTA Text</label>
                <input
                  type="text"
                  value={activeFrame.copy.cta}
                  onChange={(e) => updateCopy('cta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <button 
          onClick={handleExport}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-lg transition-transform active:scale-[0.98] flex justify-center items-center gap-2"
        >
          <Download size={18} />
          Export All Variations
        </button>
      </div>
    </div>
  );
};
