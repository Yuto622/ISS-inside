import React from 'react';
import { ControllerState } from '../types';

interface MobileControlsProps {
  onInput: (input: Partial<ControllerState>) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onInput }) => {
  const handleTouchStart = (key: keyof ControllerState) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onInput({ [key]: true });
  };

  const handleTouchEnd = (key: keyof ControllerState) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onInput({ [key]: false });
  };

  const Button = ({ cmd, label, className }: { cmd: keyof ControllerState, label: React.ReactNode, className?: string }) => (
    <button
      className={`bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center active:bg-blue-500/50 active:border-blue-400 transition-all select-none touch-none ${className}`}
      onTouchStart={handleTouchStart(cmd)}
      onTouchEnd={handleTouchEnd(cmd)}
      onMouseDown={handleTouchStart(cmd)}
      onMouseUp={handleTouchEnd(cmd)}
      onMouseLeave={handleTouchEnd(cmd)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-end p-6 no-select">
      <div className="flex flex-row justify-between items-end w-full pb-4">
        
        {/* Left Side: Directional Movement (WASD equivalent) */}
        <div className="pointer-events-auto relative w-40 h-40 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
           <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2 gap-1">
              <div /> {/* Top Left */}
              <Button cmd="forward" label="▲" className="w-full h-full text-xl" />
              <div /> {/* Top Right */}
              
              <Button cmd="left" label="◀" className="w-full h-full text-xl" />
              <div className="flex items-center justify-center">
                 <div className="w-2 h-2 bg-white/30 rounded-full" />
              </div>
              <Button cmd="right" label="▶" className="w-full h-full text-xl" />
              
              <div /> {/* Bottom Left */}
              <Button cmd="backward" label="▼" className="w-full h-full text-xl" />
              <div /> {/* Bottom Right */}
           </div>
           <div className="absolute -top-6 w-full text-center text-xs text-white/50 font-mono">MOVE</div>
        </div>

        {/* Center: Info */}
        <div className="flex-1 flex justify-center pb-2 opacity-50">
            <div className="text-[10px] text-white font-mono text-center leading-tight hidden sm:block">
                DRAG SCREEN TO LOOK<br/>
                BUTTONS TO MOVE
            </div>
        </div>

        {/* Right Side: Vertical Movement (Up/Down) */}
        <div className="pointer-events-auto flex flex-col gap-4 items-center">
          <div className="text-xs text-white/50 font-mono">ELEVATION</div>
          <div className="flex flex-col gap-3">
             <Button cmd="up" label="▲" className="w-16 h-16 text-2xl font-bold bg-white/10 border-white/30" />
             <Button cmd="down" label="▼" className="w-16 h-16 text-2xl font-bold bg-white/10 border-white/30" />
          </div>
        </div>

      </div>

      <div className="absolute top-4 left-4 text-white/40 text-xs font-mono pointer-events-none">
        <p>ZERO-G OS v1.1</p>
        <p className="text-green-400">SYSTEM NORMAL</p>
      </div>
    </div>
  );
};
