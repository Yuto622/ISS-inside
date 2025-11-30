import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { MobileControls } from './components/MobileControls';
import { PlayerController } from './components/PlayerController';
import { Station } from './components/Environment/Station';
import { Earth } from './components/Environment/Earth';
import { ControllerState } from './types';

const App: React.FC = () => {
  const inputRef = useRef<ControllerState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  });

  useEffect(() => {
    // Keyboard Listeners (WASD + Space/Shift)
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': inputRef.current.forward = true; break;
        case 'KeyS': inputRef.current.backward = true; break;
        case 'KeyA': inputRef.current.left = true; break;
        case 'KeyD': inputRef.current.right = true; break;
        case 'Space': inputRef.current.up = true; break;
        case 'ShiftLeft': inputRef.current.down = true; break;
        case 'ArrowUp': inputRef.current.forward = true; break;
        case 'ArrowDown': inputRef.current.backward = true; break;
        case 'ArrowLeft': inputRef.current.left = true; break;
        case 'ArrowRight': inputRef.current.right = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': inputRef.current.forward = false; break;
        case 'KeyS': inputRef.current.backward = false; break;
        case 'KeyA': inputRef.current.left = false; break;
        case 'KeyD': inputRef.current.right = false; break;
        case 'Space': inputRef.current.up = false; break;
        case 'ShiftLeft': inputRef.current.down = false; break;
        case 'ArrowUp': inputRef.current.forward = false; break;
        case 'ArrowDown': inputRef.current.backward = false; break;
        case 'ArrowLeft': inputRef.current.left = false; break;
        case 'ArrowRight': inputRef.current.right = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMobileInput = (input: Partial<ControllerState>) => {
    inputRef.current = { ...inputRef.current, ...input };
  };

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden">
      
      <Canvas camera={{ fov: 75, near: 0.1, far: 1000 }} className="touch-none block">
        <ambientLight intensity={0.2} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Station />
        <Earth />
        <PlayerController inputState={inputRef} />
      </Canvas>

      {/* Always Show HUD Controls */}
      <MobileControls onInput={handleMobileInput} />
      
    </div>
  );
};

export default App;
