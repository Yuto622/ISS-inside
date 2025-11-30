import React from 'react';
import { DoubleSide } from 'three';

const WallMaterial = () => (
  <meshStandardMaterial 
    color="#e0e0e0" 
    roughness={0.4} 
    metalness={0.1} 
    flatShading 
    side={DoubleSide}
  />
);

const DarkMaterial = () => (
    <meshStandardMaterial 
      color="#2a2a2a" 
      roughness={0.8} 
      flatShading 
    />
);

// Reusable simple panel to build walls
const Panel: React.FC<{ position: [number, number, number], args: [number, number, number], color?: string }> = ({ position, args, color }) => (
    <mesh position={position}>
        <boxGeometry args={args} />
        {color ? <meshStandardMaterial color={color} roughness={0.5} flatShading /> : <WallMaterial />}
    </mesh>
);

const CorridorSegment: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    return (
        <group position={position}>
            {/* Floor */}
            <Panel position={[0, -2, 0]} args={[4, 0.2, 4]} color="#8899aa" />
            {/* Ceiling */}
            <Panel position={[0, 2, 0]} args={[4, 0.2, 4]} />
            {/* Left Wall */}
            <Panel position={[-2, 0, 0]} args={[0.2, 4, 4]} />
            {/* Right Wall */}
            <Panel position={[2, 0, 0]} args={[0.2, 4, 4]} />
            
            {/* Handrails (Floating Aids) */}
            <mesh position={[-1.8, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 4]} />
                <meshStandardMaterial color="orange" />
            </mesh>
            <mesh position={[1.8, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 4]} />
                <meshStandardMaterial color="orange" />
            </mesh>
        </group>
    )
}

const HatchRing: React.FC<{position: [number, number, number], rotation?: [number, number, number]}> = ({position, rotation}) => (
    <mesh position={position} rotation={rotation ? [rotation[0], rotation[1], rotation[2]] : [0,0,0]}>
        <torusGeometry args={[1.5, 0.2, 8, 16]} />
        <DarkMaterial />
    </mesh>
)

export const Station: React.FC = () => {
  return (
    <group>
      {/* Main Corridor (Length 24, z from -12 to 12) */}
      {/* Created by segments to allow ease of lighting and collision concepts visually */}
      <CorridorSegment position={[0, 0, 0]} />
      <CorridorSegment position={[0, 0, 4]} />
      <CorridorSegment position={[0, 0, 8]} />
      <CorridorSegment position={[0, 0, -4]} />
      <CorridorSegment position={[0, 0, -8]} />

      {/* Viewing Window Frame at end (z = -10 approx) */}
      <group position={[0, 0, -10]}>
         <Panel position={[0, 2.5, 0]} args={[4.2, 1, 0.5]} color="#333" />
         <Panel position={[0, -2.5, 0]} args={[4.2, 1, 0.5]} color="#333" />
         <Panel position={[-2.5, 0, 0]} args={[1, 6, 0.5]} color="#333" />
         <Panel position={[2.5, 0, 0]} args={[1, 6, 0.5]} color="#333" />
      </group>

      {/* Start Cap (Behind player) */}
      <Panel position={[0, 0, 10]} args={[4, 4, 0.2]} color="#555" />

      {/* Side Rooms */}
      
      {/* Left Room Intersection */}
      <group position={[-4, 0, 0]}>
          <HatchRing position={[1.8, 0, 0]} rotation={[0, Math.PI/2, 0]} />
          {/* Room Box */}
          <mesh position={[-2, 0, 0]}>
              <boxGeometry args={[4, 3, 3]} />
              <meshStandardMaterial color="#ddd" side={DoubleSide} />
          </mesh>
          {/* Lab Table Dummy */}
          <mesh position={[-2, -1, 0]}>
              <boxGeometry args={[2, 0.8, 1]} />
              <meshStandardMaterial color="#99aacc" />
          </mesh>
      </group>

       {/* Right Room Intersection */}
       <group position={[4, 0, 4]}>
          <HatchRing position={[-1.8, 0, 0]} rotation={[0, Math.PI/2, 0]} />
          {/* Room Box */}
          <mesh position={[2, 0, 0]}>
              <boxGeometry args={[4, 3, 3]} />
              <meshStandardMaterial color="#ddd" side={DoubleSide} />
          </mesh>
           {/* Storage Containers Dummy */}
           <mesh position={[3, -1, 0.5]} rotation={[0, 0.5, 0]}>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#cc4444" />
          </mesh>
          <mesh position={[3, -0.2, 0.5]} rotation={[0, 0.2, 0]}>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial color="#cc4444" />
          </mesh>
      </group>

      {/* Lights */}
      {/* Corridor Lights */}
      <pointLight position={[0, 1.8, 0]} intensity={0.5} distance={5} color="#ccffff" />
      <pointLight position={[0, 1.8, 8]} intensity={0.5} distance={5} />
      <pointLight position={[0, 1.8, -8]} intensity={0.5} distance={5} />
      
      {/* Room Lights */}
      <pointLight position={[-6, 1, 0]} intensity={0.8} distance={6} color="#ffaaff" />
      <pointLight position={[6, 1, 4]} intensity={0.8} distance={6} color="#ffffaa" />
    </group>
  );
};