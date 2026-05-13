import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createWaterSurface() {
  const geometry = new THREE.PlaneGeometry(46, 46, 150, 150);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColorShallow: { value: new THREE.Color(0x7feaff) },
      uColorDeep: { value: new THREE.Color(0x067da7) },
      uOpacity: { value: 0.50 },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        vUv = uv;
        vec3 p = position;

        float w1 = sin(p.x * 1.7 + uTime * 0.75) * 0.035;
        float w2 = sin(p.y * 2.5 + uTime * 1.08) * 0.025;
        float w3 = sin((p.x + p.y) * 1.15 + uTime * 0.52) * 0.020;
        float w4 = sin((p.x - p.y) * 3.10 + uTime * 1.55) * 0.010;

        float wave = w1 + w2 + w3 + w4;
        p.z += wave;
        vWave = wave;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      uniform vec3 uColorShallow;
      uniform vec3 uColorDeep;
      uniform float uOpacity;
      varying vec2 vUv;
      varying float vWave;

      void main() {
        float highlight = smoothstep(0.012, 0.065, vWave);
        float ripple = sin(vUv.x * 64.0 + vUv.y * 21.0) * 0.5 + 0.5;
        ripple *= 0.035;

        vec3 color = mix(uColorDeep, uColorShallow, vUv.y * 0.85 + 0.15);
        color += highlight * 0.36;
        color += ripple;

        float edgeX = smoothstep(0.00, 0.08, vUv.x) * smoothstep(1.00, 0.92, vUv.x);
        float edgeY = smoothstep(0.00, 0.08, vUv.y) * smoothstep(1.00, 0.92, vUv.y);
        float edgeFade = edgeX * edgeY;

        gl_FragColor = vec4(color, uOpacity * edgeFade);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "FloodWaterSurface_MVP";
  mesh.visible = false;
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  return mesh;
}

export function updateWaterSurface(water, elapsedTime) {
  if (!water?.material?.uniforms) return;
  water.material.uniforms.uTime.value = elapsedTime;
}
