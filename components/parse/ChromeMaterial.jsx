'use client';

export default function ChromeMaterial({ selected = false, root = false }) {
  const live = selected || root;
  return (
    <meshPhysicalMaterial
      color={live ? '#d8dbe0' : '#9a9a9a'}
      metalness={1}
      roughness={live ? 0.045 : 0.28}
      envMapIntensity={live ? 2.4 : 0.7}
      clearcoat={live ? 1 : 0.2}
      clearcoatRoughness={live ? 0.04 : 0.4}
      reflectivity={1}
      ior={1.7}
      specularIntensity={1}
    />
  );
}

export function WireMaterial() {
  return (
    <shaderMaterial
      transparent
      depthWrite={false}
      vertexShader={`
        varying vec3 vN;
        varying vec3 vV;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vN = normalize(mat3(modelMatrix) * normal);
          vV = cameraPosition - w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `}
      fragmentShader={`
        varying vec3 vN;
        varying vec3 vV;
        void main() {
          float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.2);
          vec2 p = gl_FragCoord.xy;
          float hatch = step(0.5, fract((p.x + p.y) * 0.25));
          float fill = 0.12 + rim * 0.78 + hatch * 0.08;
          gl_FragColor = vec4(vec3(0.9), mix(0.45, 1.0, fill));
        }
      `}
    />
  );
}
