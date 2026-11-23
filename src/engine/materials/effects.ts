import { Color, ShaderMaterial, UniformsLib, UniformsUtils } from "three";

const noiseGlsl = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return s;
  }
`;

const worldVertex = /* glsl */ `
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

/**
 * Molten lava: flowing crust cells over a glowing core. Output exceeds 1.0 in
 * the hot cracks so the bloom pass makes them glow.
 */
export function createLavaMaterial() {
  return new ShaderMaterial({
    fog: true,
    uniforms: UniformsUtils.merge([UniformsLib.fog, { uTime: { value: 0 } }]),
    vertexShader: worldVertex,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vWorld;
      ${noiseGlsl}
      #include <fog_pars_fragment>
      void main() {
        vec2 p = vWorld.xz * 0.12;
        vec2 flow = vec2(fbm(p + uTime * 0.03), fbm(p + 4.1 - uTime * 0.025));
        float n = fbm(p * 2.0 + flow * 1.6 + uTime * 0.02);
        float cracks = smoothstep(0.42, 0.58, n);
        float pulse = 0.85 + 0.15 * sin(uTime * 1.3 + n * 9.0);
        vec3 crust = vec3(0.09, 0.05, 0.04) * (0.6 + n);
        vec3 hot = mix(vec3(1.6, 0.35, 0.05), vec3(3.2, 1.6, 0.35), smoothstep(0.6, 0.85, n));
        vec3 col = mix(hot * pulse, crust, cracks);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
  });
}

/** A sea of clouds seen from above, drifting slowly; fades out toward the horizon. */
export function createCloudSeaMaterial(opts: { tint: string; shadow: string; light: string }) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTime: { value: 0 },
      uTint: { value: new Color(opts.tint) },
      uShadow: { value: new Color(opts.shadow) },
      uLight: { value: new Color(opts.light) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uTint;
      uniform vec3 uShadow;
      uniform vec3 uLight;
      varying vec3 vWorld;
      ${noiseGlsl}
      void main() {
        vec2 p = vWorld.xz * 0.006 + vec2(uTime * 0.004, uTime * 0.0015);
        float d = fbm(p) * 0.7 + fbm(p * 3.1 - uTime * 0.003) * 0.3;
        float puff = smoothstep(0.32, 0.72, d);
        vec3 col = mix(uShadow, uLight, smoothstep(0.4, 0.8, d));
        col = mix(col, uTint, 0.25);
        float dist = length(vWorld.xz);
        float horizon = 1.0 - smoothstep(600.0, 1400.0, dist);
        gl_FragColor = vec4(col, mix(0.55, 0.97, puff) * horizon);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
