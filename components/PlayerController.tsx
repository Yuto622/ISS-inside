import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Euler } from 'three';
import { ControllerState } from '../types';

interface PlayerControllerProps {
  inputState: React.MutableRefObject<ControllerState>;
}

export const PlayerController: React.FC<PlayerControllerProps> = ({ inputState }) => {
  const { camera, gl } = useThree();
  const velocity = useRef(new Vector3(0, 0, 0));
  
  // Settings
  const speed = 0.15; // Acceleration
  const friction = 0.96; // Zero-G Inertia
  const boundaryZ = 10; 
  const boundaryZNeg = -9; 
  
  // Input tracking
  const isDragging = useRef(false);
  const lastMousePosition = useRef<{x: number, y: number} | null>(null);
  
  // Initial spawn
  useEffect(() => {
    camera.position.set(0, 0, 8);
  }, [camera]);

  // Handle Rotation (Mouse + Touch)
  useEffect(() => {
    const canvas = gl.domElement;

    // --- TOUCH LOGIC ---
    const handleTouchStart = (e: TouchEvent) => {
        if(e.touches.length > 0) {
            lastMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    };
    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0 && lastMousePosition.current) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastMousePosition.current.x;
            const deltaY = touch.clientY - lastMousePosition.current.y;
            rotateCamera(deltaX, deltaY);
            lastMousePosition.current = { x: touch.clientX, y: touch.clientY };
        }
    };
    const handleTouchEnd = () => {
        lastMousePosition.current = null;
    };

    // --- MOUSE LOGIC ---
    const handleMouseDown = (e: MouseEvent) => {
        // Only drag if left click
        if (e.button === 0) {
            isDragging.current = true;
            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    };
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging.current && lastMousePosition.current) {
            const deltaX = e.clientX - lastMousePosition.current.x;
            const deltaY = e.clientY - lastMousePosition.current.y;
            rotateCamera(deltaX, deltaY);
            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    };
    const handleMouseUp = () => {
        isDragging.current = false;
        lastMousePosition.current = null;
    };

    const rotateCamera = (deltaX: number, deltaY: number) => {
        const sensitivity = 0.005;
        const euler = new Euler(0, 0, 0, 'YXZ');
        euler.setFromQuaternion(camera.quaternion);
        
        euler.y -= deltaX * sensitivity;
        euler.x -= deltaY * sensitivity;
        
        // Clamp pitch
        euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
        
        camera.quaternion.setFromEuler(euler);
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [camera, gl.domElement]);


  useFrame(() => {
    const input = inputState.current;
    
    // Direction vectors
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

    // Thrust
    if (input.forward) velocity.current.add(forward.multiplyScalar(speed * 0.1));
    if (input.backward) velocity.current.add(forward.multiplyScalar(-speed * 0.1));
    if (input.right) velocity.current.add(right.multiplyScalar(speed * 0.1));
    if (input.left) velocity.current.add(right.multiplyScalar(-speed * 0.1));
    if (input.up) velocity.current.add(up.multiplyScalar(speed * 0.1));
    if (input.down) velocity.current.add(up.multiplyScalar(-speed * 0.1));

    // Physics
    camera.position.add(velocity.current);
    velocity.current.multiplyScalar(friction);

    // Collisions
    if (camera.position.z > boundaryZ) {
        camera.position.z = boundaryZ;
        velocity.current.z *= -0.5;
    }
    if (camera.position.z < boundaryZNeg) {
        camera.position.z = boundaryZNeg;
        velocity.current.z *= -0.5;
    }

    // Wall constraints
    const inLeftRoom = camera.position.x < -1.8 && Math.abs(camera.position.z) < 2;
    const inRightRoom = camera.position.x > 1.8 && Math.abs(camera.position.z - 4) < 2;

    if (!inLeftRoom && !inRightRoom) {
        if (camera.position.x > 1.8) { camera.position.x = 1.8; velocity.current.x *= -0.5; }
        if (camera.position.x < -1.8) { camera.position.x = -1.8; velocity.current.x *= -0.5; }
    }

    // Floor/Ceiling constraints
    if (camera.position.y > 1.8) { camera.position.y = 1.8; velocity.current.y *= -0.5; }
    if (camera.position.y < -1.8) { camera.position.y = -1.8; velocity.current.y *= -0.5; }

  });

  return null; // No visual component needed
};
