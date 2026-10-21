import * as THREE from 'three'

/**
 * Material de las pantallas del stand: muestra una foto en blanco y negro
 * y la lleva a color con `uSaturation` (0 = B/N, 1 = color). `uPower` simula el encendido.
 */
export function createScreenMaterial(map: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: map },
      uSaturation: { value: 0 },
      uPower: { value: 0 },
      uHover: { value: 0 },
      uImageAspect: { value: 4 / 3 },
      uPlaneAspect: { value: 4 / 3 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uSaturation;
      uniform float uPower;
      uniform float uHover;
      uniform float uImageAspect;
      uniform float uPlaneAspect;
      varying vec2 vUv;
      void main() {
        // cover: recorta la foto para llenar la pantalla
        vec2 uv = vUv;
        float r = uPlaneAspect / uImageAspect;
        if (r > 1.0) uv.y = (uv.y - 0.5) / r + 0.5; else uv.x = (uv.x - 0.5) * r + 0.5;
        uv = (uv - 0.5) * (1.0 - 0.04 * uHover) + 0.5;
        vec3 c = texture2D(uMap, uv).rgb;
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        vec3 col = mix(vec3(l), c, uSaturation);
        // viñeta suave del panel LED
        vec2 q = vUv - 0.5;
        col *= 1.0 - dot(q, q) * 0.35;
        col *= mix(0.04, 1.05, uPower);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `,
  })
}
