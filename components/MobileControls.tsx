import React, { useState } from 'react';
import { ControllerState } from '../types';

interface MobileControlsProps {
  onInput: (input: Partial<ControllerState>) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onInput }) => {
  // Local state to track active buttons for visual feedback
  const [activeKeys, setActiveKeys] = useState<Partial<Record<keyof ControllerState, boolean>>>({});

  const handleInput = (key: keyof ControllerState, active: boolean) => {
    onInput({ [key]: active });
    setActiveKeys(prev => ({ ...prev, [key]: active }));
  };

  const handleTouchStart = (key: keyof ControllerState) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    handleInput(key, true);
  };

  const handleTouchEnd = (key: keyof ControllerState) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    handleInput(key, false);
  };

  // --- UI COMPONENTS ---

  const TechButton = ({ cmd, label, sub, className, style }: { cmd: keyof ControllerState, label: string | React.ReactNode, sub?: string, className?: string, style?: React.CSSProperties }) => {
    const isActive = activeKeys[cmd];
    return (
      <button
        className={`relative group transition-all duration-75 outline-none ${className}`}
        style={style}
        onTouchStart={handleTouchStart(cmd)}
        onTouchEnd={handleTouchEnd(cmd)}
        onMouseDown={handleTouchStart(cmd)}
        onMouseUp={handleTouchEnd(cmd)}
        onMouseLeave={handleTouchEnd(cmd)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Button Background with Cut Corner */}
        <div 
            className={`absolute inset-0 border transition-all duration-100 
                ${isActive 
                    ? 'bg-cyan-400/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                    : 'bg-black/40 border-cyan-800/50 hover:border-cyan-500/50'
                }`}
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none">
            <span className={`text-xl font-bold tracking-widest ${isActive ? 'text-white' : 'text-cyan-400 group-hover:text-cyan-200'}`}>
                {label}
            </span>
            {sub && (
                <span className={`text-[9px] tracking-[0.2em] mt-1 ${isActive ? 'text-cyan-100' : 'text-cyan-700 group-hover:text-cyan-500'}`}>
                    {sub}
                </span>
            )}
        </div>
        
        {/* Corner Accent */}
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-t border-l border-cyan-500/30 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      </button>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 font-tech overflow-hidden text-cyan-500 select-none">
      
      {/* 1. SCREEN EFFECTS */}
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,10,20,0.8)_100%)]" />
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] opacity-20 pointer-events-none" />

      {/* 2. TOP HUD (Info) */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start opacity-90">
          <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                  <div className="relative w-3 h-3">
                      <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-75" />
                      <div className="absolute inset-0 bg-cyan-500 rounded-full" />
                  </div>
                  <span className="text-sm tracking-[0.2em] font-bold text-cyan-100 text-shadow-glow">SYSTEM :: ONLINE</span>
              </div>
              <div className="flex gap-4 text-[10px] text-cyan-600 mt-1">
                  <span>FPS: 60</span>
                  <span>PING: 12ms</span>
                  <span>O2: 98%</span>
              </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
               <div className="flex items-center gap-2 border-b border-cyan-800 pb-1 mb-1">
                   <span className="text-xs text-cyan-400">COORDS</span>
                   <span className="text-sm text-cyan-100 font-bold">X: 42.0 Y: -0.5</span>
               </div>
               <div className="text-[10px] text-cyan-700 tracking-widest">EVA SUIT MK-IV</div>
          </div>
      </div>

      {/* 3. CENTER RETICLE */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-60">
           {/* Rotating Outer Ring */}
           <div className="animate-[spin_12s_linear_infinite] w-[180px] h-[180px] border border-dashed border-cyan-800 rounded-full opacity-30" />
           
           {/* Inner Brackets */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px]">
               <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/50" />
               <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/50" />
               <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500/50" />
               <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/50" />
           </div>

           {/* Center Dot */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
      </div>

      {/* 4. BOTTOM CONTROLS */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 flex justify-between items-end z-20">
        
        {/* LEFT: Movement Pad */}
        <div className="relative pointer-events-auto">
             {/* Decorative Grid Background */}
             <div className="absolute -inset-4 border border-cyan-900/30 bg-black/20 skew-x-12" />
             <div className="text-[10px] text-cyan-700 mb-2 tracking-[0.3em] font-bold">THRUST VECTORS</div>
             
             <div className="grid grid-cols-3 gap-2">
                 <div />
                 <TechButton cmd="forward" label="▲" className="w-16 h-14" />
                 <div />
                 
                 <TechButton cmd="left" label="◀" className="w-16 h-14" />
                 <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border border-cyan-800 rounded-full flex items-center justify-center opacity-50">
                        <div className="w-1 h-1 bg-cyan-500" />
                    </div>
                 </div>
                 <TechButton cmd="right" label="▶" className="w-16 h-14" />
                 
                 <div />
                 <TechButton cmd="backward" label="▼" className="w-16 h-14" />
                 <div />
             </div>
        </div>

        {/* CENTER: Status Message */}
        <div className="hidden md:flex flex-col items-center justify-end pb-4 opacity-50">
             <div className="text-[9px] text-cyan-800 tracking-[0.5em] mb-1">INERTIAL DAMPENERS</div>
             <div className="w-32 h-1 bg-cyan-900 rounded-full overflow-hidden">
                 <div className="w-2/3 h-full bg-cyan-500/50" />
             </div>
             <div className="mt-2 text-[10px] text-cyan-400">DRAG TO ROTATE VIEW</div>
        </div>

        {/* RIGHT: Elevation Control */}
        <div className="relative pointer-events-auto flex flex-col items-end">
            <div className="text-[10px] text-cyan-700 mb-2 tracking-[0.3em] font-bold mr-2">ELEVATION</div>
            <div className="flex flex-col gap-2 bg-black/20 p-2 border border-cyan-900/30 rounded-lg backdrop-blur-sm">
                <TechButton cmd="up" label="ASC" sub="▲▲" className="w-20 h-20" />
                <div className="h-[2px] w-full bg-cyan-900/50" />
                <TechButton cmd="down" label="DSC" sub="▼▼" className="w-20 h-20" />
            </div>
        </div>

      </div>

      {/* Decorative Lines */}
      <div className="absolute bottom-32 left-0 w-16 h-[1px] bg-cyan-800/50" />
      <div className="absolute bottom-32 right-0 w-16 h-[1px] bg-cyan-800/50" />

    </div>
  );
};