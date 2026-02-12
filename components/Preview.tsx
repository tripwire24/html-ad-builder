import React, { useState, useEffect } from 'react';
import { useAd } from '../context/AdContext';
import { generateBannerHTML } from '../utils/generators';
import { Play, ZoomIn, ZoomOut, Monitor, Smartphone, AlertCircle, CheckCircle, Edit, X, Film } from 'lucide-react';
import { AdSizeOverride } from '../types';

interface EditModalProps {
  sizeKey: string;
  width: number;
  height: number;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ sizeKey, width, height, onClose }) => {
  const { state, updateSizeOverride, updateCopy } = useAd();
  const override = state.sizeOverrides[sizeKey] || {};
  
  // Identify active frame for content editing
  const activeFrame = state.frames.find(f => f.id === state.activeFrameId) || state.frames[0];
  const activeFrameIndex = state.frames.indexOf(activeFrame);

  const handleUpdate = (updates: Partial<AdSizeOverride>) => {
    updateSizeOverride(sizeKey, updates);
  };

  const html = generateBannerHTML(state, width, height);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Edit {sizeKey} Banner</h3>
            <p className="text-xs text-gray-500">Changes below affect the active frame content or size-specific positioning.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-auto relative">
             <div className="bg-white shadow-lg ring-1 ring-gray-200" style={{ width, height }}>
                <iframe
                  title={`edit-${sizeKey}`}
                  srcDoc={html}
                  width={width}
                  height={height}
                  style={{ border: 'none' }}
                  sandbox="allow-scripts"
                />
             </div>
          </div>

          {/* Controls Area */}
          <div className="w-full md:w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto space-y-8">
            
            {/* 1. Content Editing (Active Frame) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Film size={14} className="text-blue-600" />
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">Content (Frame {activeFrameIndex + 1})</label>
              </div>
              
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Headline</label>
                <textarea 
                  rows={2}
                  value={activeFrame.copy.headline}
                  onChange={(e) => updateCopy('headline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Subline</label>
                <textarea 
                  rows={2}
                  value={activeFrame.copy.subline}
                  onChange={(e) => updateCopy('subline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
               <div>
                <label className="text-xs text-gray-500 mb-1 block">CTA</label>
                <input 
                  type="text"
                  value={activeFrame.copy.cta}
                  onChange={(e) => updateCopy('cta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* 2. Text Positioning Overrides */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block border-b border-gray-100 pb-2">Text Layout Overrides</label>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Size Scale</span>
                  <span className="text-xs text-gray-400">{(override.fontSizeScale ?? state.design.fontSizeScale).toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="2.0" step="0.1"
                  value={override.fontSizeScale ?? state.design.fontSizeScale}
                  onChange={(e) => handleUpdate({ fontSizeScale: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-xs text-gray-500 mb-1 block">Offset X</label>
                    <input 
                      type="number" 
                      value={override.textOffsetX || 0}
                      onChange={(e) => handleUpdate({ textOffsetX: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 mb-1 block">Offset Y</label>
                    <input 
                      type="number" 
                      value={override.textOffsetY || 0}
                      onChange={(e) => handleUpdate({ textOffsetY: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                    />
                 </div>
              </div>
            </div>

            {/* 3. Logo Positioning Overrides */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block border-b border-gray-100 pb-2">Logo Layout Overrides</label>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Size Scale</span>
                  <span className="text-xs text-gray-400">{(override.logoScale ?? 1.0).toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="2.0" step="0.1"
                  value={override.logoScale ?? 1.0}
                  onChange={(e) => handleUpdate({ logoScale: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-xs text-gray-500 mb-1 block">Offset X</label>
                    <input 
                      type="number" 
                      value={override.logoOffsetX || 0}
                      onChange={(e) => handleUpdate({ logoOffsetX: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 mb-1 block">Offset Y</label>
                    <input 
                      type="number" 
                      value={override.logoOffsetY || 0}
                      onChange={(e) => handleUpdate({ logoOffsetY: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
                    />
                 </div>
              </div>
            </div>

            <div className="pt-4 mt-auto">
               <button 
                 onClick={() => updateSizeOverride(sizeKey, { fontSizeScale: undefined, logoScale: undefined, textOffsetX: 0, textOffsetY: 0, logoOffsetX: 0, logoOffsetY: 0 })}
                 className="w-full py-2 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded transition-colors"
               >
                 Reset Layout Overrides
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BannerPreviewCard: React.FC<{ width: number; height: number; animationKey: number; onEdit: () => void; isDark: boolean }> = ({ width, height, animationKey, onEdit, isDark }) => {
  const { state } = useAd();
  const [fileSize, setFileSize] = useState<number>(0);
  
  const html = generateBannerHTML(state, width, height);

  useEffect(() => {
     const blob = new Blob([html]);
     setFileSize(blob.size / 1024);
  }, [html]);

  const isSizeValid = fileSize <= 150;
  
  return (
    <div className="flex flex-col gap-1 group/card">
      <div className="flex justify-between items-end px-1">
         <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{width}x{height}</span>
         <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-mono ${!isSizeValid ? 'text-red-500 font-bold' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
              {fileSize.toFixed(1)}KB
            </span>
            {isSizeValid ? <CheckCircle size={12} className="text-green-500" /> : <AlertCircle size={12} className="text-red-500" />}
         </div>
      </div>
      
      <div className="relative group inline-block cursor-pointer" onClick={onEdit}>
        <div 
          className="bg-white shadow-sm overflow-hidden ring-1 ring-gray-200 transition-all hover:shadow-lg group-hover:scale-[1.02]"
          style={{ width, height }}
        >
          <iframe
            key={animationKey}
            title={`preview-${width}x${height}`}
            srcDoc={html}
            width={width}
            height={height}
            style={{ border: 'none', pointerEvents: 'none' }} // Disable iframe events so clicking works on the div
            tabIndex={-1}
          />
        </div>

        {/* Edit Overlay */}
        <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/5 transition-colors flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
           <button 
             className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105"
             title="Edit this size"
           >
             <Edit size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};

export const Preview: React.FC = () => {
  const { state, triggerReplay } = useAd();
  const [zoom, setZoom] = useState(1);
  const [bgDark, setBgDark] = useState(false);
  const [editingSize, setEditingSize] = useState<{key: string, w: number, h: number} | null>(null);

  if (state.selectedSizes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
        <Monitor size={48} className="opacity-20" />
        <p>Select a size or add a custom one to start previewing.</p>
      </div>
    );
  }

  // Group sizes
  const groups = {
    landscape: [] as string[],
    square: [] as string[],
    portrait: [] as string[]
  };

  state.selectedSizes.forEach(sizeStr => {
    const [w, h] = sizeStr.split('x').map(Number);
    const ratio = w / h;
    if (ratio > 1.25) {
      groups.landscape.push(sizeStr);
    } else if (ratio < 0.8) {
      groups.portrait.push(sizeStr);
    } else {
      groups.square.push(sizeStr);
    }
  });

  const renderGroup = (title: string, sizes: string[]) => {
    if (sizes.length === 0) return null;
    return (
      <section className="mb-12">
        <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 border-b pb-2 ${bgDark ? 'text-gray-400 border-gray-700' : 'text-gray-400 border-gray-200'}`}>
          {title}
        </h3>
        <div className="flex flex-wrap gap-8 items-end">
          {sizes.map(sizeStr => {
            const [w, h] = sizeStr.split('x').map(Number);
            return (
              <BannerPreviewCard 
                key={sizeStr} 
                width={w} 
                height={h} 
                animationKey={state.animationKey} 
                onEdit={() => setEditingSize({ key: sizeStr, w, h })}
                isDark={bgDark}
              />
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {editingSize && (
        <EditModal 
          sizeKey={editingSize.key} 
          width={editingSize.w} 
          height={editingSize.h} 
          onClose={() => setEditingSize(null)} 
        />
      )}

      {/* Toolbar */}
      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={triggerReplay}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors font-medium text-sm"
          >
            <Play size={16} fill="currentColor" /> Replay Animations
          </button>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
           <div className="flex items-center gap-2 text-sm text-gray-600">
             <CheckCircle size={16} className="text-green-500"/> 
             <span>150KB Limit Check Active</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
              <button onClick={() => setBgDark(false)} className={`p-1.5 rounded ${!bgDark ? 'bg-white shadow-sm' : 'text-gray-500'}`}><Monitor size={16}/></button>
              <button onClick={() => setBgDark(true)} className={`p-1.5 rounded ${bgDark ? 'bg-white shadow-sm' : 'text-gray-500'}`}><Smartphone size={16}/></button>
           </div>
           <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><ZoomOut size={18}/></button>
              <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><ZoomIn size={18}/></button>
           </div>
        </div>
      </div>

      {/* Grouped Grid */}
      <div className={`flex-1 overflow-auto p-10 transition-colors duration-300 ${bgDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div 
          className="mx-auto w-full max-w-[1600px] origin-top transition-transform duration-200 ease-out pb-20"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          {renderGroup('Landscape / Leaderboard', groups.landscape)}
          {renderGroup('Square / Rectangle', groups.square)}
          {renderGroup('Portrait / Skyscraper', groups.portrait)}
        </div>
      </div>
    </div>
  );
};
