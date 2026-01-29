import React, { useState } from 'react';
import { IconClose } from './Icons';
import { AVATAR_ASSETS, AvatarFilters } from './AvatarAssets';
import { Shirt, Scissors, User as UserIcon, ShoppingBag, Palette, ChevronLeft } from 'lucide-react';

export interface AvatarConfig {
  skinColor: string;
  faceWidth: number; // -1 to 1
  jawSize: number;   // -1 to 1
  cheekFullness: number; // -1 to 1
  hairStyle: 'dreads' | 'curtains' | 'short';
  hairColor: string;
  top: 'blackTee' | 'stripedShirt' | 'monsterHoodie';
  bottom: 'jeans' | 'cargos';
  shoes: 'converseWhite' | 'leatherBoots';
}

const DEFAULT_AVATAR: AvatarConfig = {
  skinColor: '#E0B184',
  faceWidth: 0,
  jawSize: 0,
  cheekFullness: 0,
  hairStyle: 'curtains',
  hairColor: '#1a1a1a',
  top: 'blackTee',
  bottom: 'jeans',
  shoes: 'converseWhite'
};

// --- RENDER ENGINE ---
export const AvatarRender = ({ config, className = "w-full h-full" }: { config: AvatarConfig, className?: string }) => {
  return (
    <svg viewBox="0 0 200 450" className={className} style={{filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))'}}>
      {/* INJECT GLOBAL FILTERS */}
      <AvatarFilters />

      {/* 1. Body Base (Legs & Arms first for layering) */}
      {AVATAR_ASSETS.body.legs(config.skinColor)}
      {AVATAR_ASSETS.body.arms(config.skinColor)}
      
      {/* 2. Shoes */}
      {AVATAR_ASSETS.shoes[config.shoes]}

      {/* 3. Bottoms */}
      {AVATAR_ASSETS.bottoms[config.bottom]}

      {/* 4. Tops */}
      {AVATAR_ASSETS.tops[config.top]}

      {/* 5. Head (Morphable) */}
      {AVATAR_ASSETS.body.head(config.skinColor, config.faceWidth, config.jawSize, config.cheekFullness)}

      {/* 6. Face Features */}
      {AVATAR_ASSETS.eyes.realistic}

      {/* 7. Hair */}
      {AVATAR_ASSETS.hair[config.hairStyle](config.hairColor)}
    </svg>
  );
};

export const AvatarCreator = ({ 
  initialConfig, 
  onSave, 
  onCancel 
}: { 
  initialConfig: AvatarConfig | null, 
  onSave: (config: AvatarConfig) => void,
  onCancel: () => void
}) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || DEFAULT_AVATAR);
  const [activeTab, setActiveTab] = useState<'Style' | 'Hair' | 'Face' | 'Body'>('Style');
  const [subTab, setSubTab] = useState<'Tops' | 'Bottoms' | 'Shoes'>('Tops');

  // Slider Component for Face Morphing
  const Slider = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium tracking-wide">
        <span>{label}</span>
      </div>
      <input 
        type="range" 
        min="-1" max="1" step="0.1" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );

  // Asset Card Component
  const AssetCard = ({ active, onClick, children }: any) => (
    <button 
      onClick={onClick}
      className={`
        aspect-[3/4] rounded-xl flex items-center justify-center relative overflow-hidden transition-all active:scale-95
        ${active ? 'bg-white/10 border-2 border-white' : 'bg-[#1E1E1E] border border-white/5'}
      `}
    >
      <div className="scale-[0.6] transform translate-y-4">
        {children}
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F1115] text-white flex flex-col font-sans">
      
      {/* 1. Top Bar */}
      <div className="px-4 py-4 flex justify-between items-center z-10 bg-[#0F1115]">
        <button onClick={onCancel} className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button 
          onClick={() => onSave(config)} 
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-500 active:scale-95"
        >
          Save
        </button>
      </div>

      {/* 2. 3D Preview Area */}
      <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(circle_at_center,_#2a2a2a_0%,_#0F1115_100%)] overflow-hidden">
        <div className="absolute inset-0 bg-[#0F1115] opacity-20 z-0"></div>
        <div className="relative h-[90%] w-auto z-10 transition-transform duration-500">
           <AvatarRender config={config} />
        </div>
      </div>

      {/* 3. Studio Controls (Bottom Sheet) */}
      <div className="bg-[#121418] border-t border-white/5 flex flex-col h-[45%] rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        
        {/* Main Tabs */}
        <div className="flex justify-around py-4 border-b border-white/5">
           {['Style', 'Hair', 'Face', 'Body'].map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab as any)}
               className={`text-sm font-bold tracking-wide px-4 py-2 rounded-full transition-all ${activeTab === tab ? 'text-white bg-white/10' : 'text-gray-500 hover:text-gray-300'}`}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 overflow-y-auto">
            
            {/* STYLE TAB */}
            {activeTab === 'Style' && (
              <>
                <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar">
                  {['Tops', 'Bottoms', 'Shoes'].map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setSubTab(sub as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${subTab === sub ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-400'}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-3">
                   {subTab === 'Tops' && (
                     <>
                        <AssetCard active={config.top === 'blackTee'} onClick={() => setConfig({...config, top: 'blackTee'})}>
                          <svg viewBox="0 0 200 400">{AVATAR_ASSETS.tops.blackTee}</svg>
                        </AssetCard>
                        <AssetCard active={config.top === 'stripedShirt'} onClick={() => setConfig({...config, top: 'stripedShirt'})}>
                          <svg viewBox="0 0 200 400">{AVATAR_ASSETS.tops.stripedShirt}</svg>
                        </AssetCard>
                        <AssetCard active={config.top === 'monsterHoodie'} onClick={() => setConfig({...config, top: 'monsterHoodie'})}>
                          <svg viewBox="0 0 200 400">{AVATAR_ASSETS.tops.monsterHoodie}</svg>
                        </AssetCard>
                     </>
                   )}
                   {subTab === 'Bottoms' && (
                     <>
                        <AssetCard active={config.bottom === 'jeans'} onClick={() => setConfig({...config, bottom: 'jeans'})}>
                          <svg viewBox="0 0 200 450">{AVATAR_ASSETS.bottoms.jeans}</svg>
                        </AssetCard>
                        <AssetCard active={config.bottom === 'cargos'} onClick={() => setConfig({...config, bottom: 'cargos'})}>
                          <svg viewBox="0 0 200 450">{AVATAR_ASSETS.bottoms.cargos}</svg>
                        </AssetCard>
                     </>
                   )}
                   {subTab === 'Shoes' && (
                     <>
                        <AssetCard active={config.shoes === 'converseWhite'} onClick={() => setConfig({...config, shoes: 'converseWhite'})}>
                          <svg viewBox="0 0 200 450">{AVATAR_ASSETS.shoes.converseWhite}</svg>
                        </AssetCard>
                        <AssetCard active={config.shoes === 'leatherBoots'} onClick={() => setConfig({...config, shoes: 'leatherBoots'})}>
                          <svg viewBox="0 0 200 450">{AVATAR_ASSETS.shoes.leatherBoots}</svg>
                        </AssetCard>
                     </>
                   )}
                </div>
              </>
            )}

            {/* HAIR TAB */}
            {activeTab === 'Hair' && (
              <div className="grid grid-cols-3 gap-4">
                 <AssetCard active={config.hairStyle === 'curtains'} onClick={() => setConfig({...config, hairStyle: 'curtains'})}>
                    <svg viewBox="0 0 200 200">
                      <AvatarFilters />
                      {AVATAR_ASSETS.body.head('#E0B184', 0, 0, 0)}
                      {AVATAR_ASSETS.hair.curtains(config.hairColor)}
                    </svg>
                 </AssetCard>
                 <AssetCard active={config.hairStyle === 'dreads'} onClick={() => setConfig({...config, hairStyle: 'dreads'})}>
                    <svg viewBox="0 0 200 200">
                      <AvatarFilters />
                      {AVATAR_ASSETS.body.head('#E0B184', 0, 0, 0)}
                      {AVATAR_ASSETS.hair.dreads(config.hairColor)}
                    </svg>
                 </AssetCard>
                 <AssetCard active={config.hairStyle === 'short'} onClick={() => setConfig({...config, hairStyle: 'short'})}>
                    <svg viewBox="0 0 200 200">
                      <AvatarFilters />
                      {AVATAR_ASSETS.body.head('#E0B184', 0, 0, 0)}
                      {AVATAR_ASSETS.hair.short(config.hairColor)}
                    </svg>
                 </AssetCard>
              </div>
            )}

            {/* FACE TAB - MORPHING SLIDERS */}
            {activeTab === 'Face' && (
              <div className="space-y-6 px-2">
                 <h3 className="text-sm font-bold text-white mb-4">Face Shape</h3>
                 <Slider 
                   label="Face Width" 
                   value={config.faceWidth} 
                   onChange={(v) => setConfig({...config, faceWidth: v})} 
                 />
                 <Slider 
                   label="Jaw Size" 
                   value={config.jawSize} 
                   onChange={(v) => setConfig({...config, jawSize: v})} 
                 />
                 <Slider 
                   label="Cheek Fullness" 
                   value={config.cheekFullness} 
                   onChange={(v) => setConfig({...config, cheekFullness: v})} 
                 />
              </div>
            )}
            
            {/* BODY TAB - SKIN TONE */}
            {activeTab === 'Body' && (
               <div>
                  <h3 className="text-sm font-bold text-white mb-4">Skin Tone</h3>
                  <div className="flex gap-4">
                    {AVATAR_ASSETS.skinTones.map(tone => (
                      <button 
                        key={tone}
                        onClick={() => setConfig({...config, skinColor: tone})}
                        className={`w-12 h-12 rounded-full border-2 transition-transform ${config.skinColor === tone ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{backgroundColor: tone}}
                      />
                    ))}
                  </div>
               </div>
            )}

        </div>
      </div>
    </div>
  );
};