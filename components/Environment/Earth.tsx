import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial, Color, AdditiveBlending, BackSide, Vector3 } from 'three';

// --- GLSL NOISE FUNCTIONS ---
// Simplex 3D Noise 
// by Ian McEwan, Ashima Arts
const noiseGLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

// --- SHADERS ---

const earthVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const earthFragmentShader = `
uniform float uTime;
uniform vec3 uSunDirection;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

${noiseGLSL}

void main() {
  // Use 3D position for noise to avoid UV seams
  float noiseVal = snoise(vPosition * 0.15 + vec3(0.0, 0.0, 0.0));
  float detailNoise = snoise(vPosition * 0.6);
  
  float landFactor = smoothstep(-0.05, 0.05, noiseVal + detailNoise * 0.2);

  // Colors
  vec3 deepOcean = vec3(0.0, 0.05, 0.2);
  vec3 shallowOcean = vec3(0.0, 0.2, 0.4);
  vec3 landBase = vec3(0.1, 0.3, 0.1); // Dark Green
  vec3 landHigh = vec3(0.4, 0.35, 0.2); // Brownish
  
  vec3 oceanColor = mix(deepOcean, shallowOcean, noiseVal * 0.5 + 0.5);
  vec3 landColor = mix(landBase, landHigh, detailNoise * 0.5 + 0.5);
  
  vec3 surfaceColor = mix(oceanColor, landColor, landFactor);

  // Lighting
  vec3 normal = normalize(vNormal);
  float lightIntensity = max(dot(normal, uSunDirection), 0.0);
  
  // Specular (Ocean only)
  vec3 viewDir = normalize(-vPosition);
  vec3 halfVector = normalize(uSunDirection + viewDir);
  float NdotH = max(dot(normal, halfVector), 0.0);
  float specular = pow(NdotH, 32.0) * (1.0 - landFactor); // Only ocean shines
  
  // Night lights (simple mask)
  float nightMask = smoothstep(0.2, -0.2, dot(normal, uSunDirection));
  vec3 nightLights = vec3(1.0, 0.8, 0.4) * landFactor * smoothstep(0.4, 0.6, detailNoise);
  
  vec3 finalColor = surfaceColor * (lightIntensity + 0.05) + vec3(specular) * 0.5;
  finalColor += nightLights * nightMask * 0.5;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const cloudFragmentShader = `
uniform float uTime;
uniform vec3 uSunDirection;
varying vec3 vNormal;
varying vec3 vPosition;

${noiseGLSL}

void main() {
  // Moving noise
  float noiseVal = snoise(vPosition * 0.12 + vec3(uTime * 0.05, 0.0, 0.0));
  float detail = snoise(vPosition * 0.4 + vec3(uTime * 0.02, 0.0, 0.0));
  
  float cloudDensity = smoothstep(0.2, 0.6, noiseVal + detail * 0.3);
  
  vec3 normal = normalize(vNormal);
  float lightIntensity = max(dot(normal, uSunDirection), 0.0);
  
  // Cloud shadow hint on self (fake volume)
  vec3 cloudColor = vec3(1.0);
  
  gl_FragColor = vec4(cloudColor * (lightIntensity + 0.2), cloudDensity * 0.9);
}
`;

const atmosphereFragmentShader = `
uniform vec3 uColor;
varying vec3 vNormal;

void main() {
  vec3 normal = normalize(vNormal);
  float intensity = pow(0.6 - dot(normal, vec3(0, 0, 1.0)), 3.0);
  gl_FragColor = vec4(uColor, 1.0) * intensity * 1.5;
}
`;

export const Earth: React.FC = () => {
  const earthRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  
  const sunDirection = useMemo(() => new Vector3(1, 0.5, 1).normalize(), []);

  // Uniforms
  const earthUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSunDirection: { value: sunDirection }
  }), [sunDirection]);
  
  const cloudUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSunDirection: { value: sunDirection }
  }), [sunDirection]);
  
  const atmosphereUniforms = useMemo(() => ({
    uColor: { value: new Color('#4488ff') }
  }), []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Rotate Meshes
    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.01;
      // Update shader uniforms
      (earthRef.current.material as ShaderMaterial).uniforms.uTime.value = time;
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * 0.015;
       (cloudsRef.current.material as ShaderMaterial).uniforms.uTime.value = time;
    }
  });

  return (
    <group position={[0, 0, -50]} rotation={[0, 0, 0.4]}> {/* Tilted axis */}
      
      {/* 1. Surface */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[20, 64, 64]} />
        <shaderMaterial
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={earthUniforms}
        />
      </mesh>
      
      {/* 2. Clouds */}
      <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[20, 64, 64]} />
        <shaderMaterial
          vertexShader={earthVertexShader} // Reuse standard vertex shader
          fragmentShader={cloudFragmentShader}
          uniforms={cloudUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* 3. Atmosphere Glow (Outer Rim) */}
      <mesh ref={atmosphereRef} scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[20, 32, 32]} />
        <shaderMaterial
            vertexShader={earthVertexShader}
            fragmentShader={atmosphereFragmentShader}
            uniforms={atmosphereUniforms}
            transparent
            blending={AdditiveBlending}
            side={BackSide} 
        />
      </mesh>
    </group>
  );
};