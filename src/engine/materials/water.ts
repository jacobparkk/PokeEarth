import { Color, ShaderMaterial, UniformsLib, UniformsUtils, Vector2, Vector3 } from "three";

/**
 * Stylised still-water surface (fountain basins, ponds): concentric ripples,
 * fresnel sky tint and a sun glint. Animate by advancing `uniforms.uTime`.
 */
export function createWaterMaterial(opts: {
  center: [number, number];
  radius: number;
  deep: string;
  shallow: string;
  sky: string;
  sunDir: Vector3;
  rippleSpeed?: number;
}) {
  return new ShaderMaterial({
    transparent: true,
    fog: true,
    uniforms: UniformsUtils.merge([
      UniformsLib.fog,
      {
        uTime: { value: 0 },
        uCenter: { value: new Vector2(opts.center[0], opts.center[1]) },
        uRadius: { value: opts.radius },
        uDeep: { value: new Color(opts.deep) },
        uShallow: { value: new Color(opts.shallow) },
        uSky: { value: new Color(opts.sky) },
        uSunDir: { value: opts.sunDir.clone().normalize() },
        uSpeed: { value: opts.rippleSpeed ?? 1 },
      },
    ]),
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      #include <fog_pars_vertex>
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vec4 mvPosition = viewMatrix * world;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uCenter;
      uniform float uRadius;
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      uniform vec3 uSky;
      uniform vec3 uSunDir;
      uniform float uSpeed;
      varying vec3 vWorld;
      #include <fog_pars_fragment>
      void main() {
        vec2 rel = vWorld.xz - uCenter;
        float r = length(rel);
        float t = uTime * uSpeed;
        // Rings spreading from the falling water plus two cross-hatched wind wavelets.
        float ring = sin(r * 7.0 - t * 4.0) * (1.0 - smoothstep(0.0, uRadius, r) * 0.6);
        float chop = sin(vWorld.x * 3.1 + t * 1.7) * sin(vWorld.z * 2.7 - t * 1.3);
        vec2 dir = rel / max(r, 1e-3);
        vec3 n = normalize(vec3(dir.x * ring * 0.12 + chop * 0.05, 1.0, dir.y * ring * 0.12 - chop * 0.05));
        vec3 viewDir = normalize(cameraPosition - vWorld);
        float fresnel = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 3.0);
        vec3 col = mix(uDeep, uShallow, 0.45 + 0.25 * ring);
        col = mix(col, uSky, clamp(fresnel * 0.85, 0.0, 0.85));
        float glint = pow(max(dot(reflect(-uSunDir, n), viewDir), 0.0), 90.0);
        col += vec3(1.0, 0.92, 0.75) * glint * 2.2;
        // Foam where the curtain hits the basin edge.
        float foam = smoothstep(uRadius * 0.86, uRadius, r) * (0.5 + 0.5 * sin(t * 6.0 + r * 30.0));
        col = mix(col, vec3(0.95), foam * 0.25);
        gl_FragColor = vec4(col, 0.88);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
  });
}

/** Falling water sheet on an open cylinder: scrolling streaks that fade at the bottom. */
export function createWaterfallMaterial(color: string) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: true,
    uniforms: UniformsUtils.merge([UniformsLib.fog, { uTime: { value: 0 }, uColor: { value: new Color(color) } }]),
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      #include <fog_pars_vertex>
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      #include <fog_pars_fragment>
      void main() {
        float streak = sin(vUv.x * 220.0 + sin(vUv.x * 37.0) * 3.0) * 0.5 + 0.5;
        float flow = fract(vUv.y * 3.0 + uTime * 1.8 + streak * 0.35);
        float a = mix(0.18, 0.55, streak) * (0.65 + 0.35 * flow);
        a *= smoothstep(0.0, 0.18, vUv.y);           // fade into the splash
        a *= 1.0 - smoothstep(0.92, 1.0, vUv.y) * 0.4;
        gl_FragColor = vec4(uColor + streak * 0.12, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
  });
}

/**
 * Open sea that begins at `shoreZ` and extends toward +z. The waterline
 * surges back and forth over the beach with a foam band, and swells roll in.
 */
export function createSeaMaterial(opts: { shoreZ: number; deep: string; shallow: string; sky: string; sunDir: Vector3 }) {
  return new ShaderMaterial({
    transparent: true,
    fog: true,
    uniforms: UniformsUtils.merge([
      UniformsLib.fog,
      {
        uTime: { value: 0 },
        uShore: { value: opts.shoreZ },
        uDeep: { value: new Color(opts.deep) },
        uShallow: { value: new Color(opts.shallow) },
        uSky: { value: new Color(opts.sky) },
        uSunDir: { value: opts.sunDir.clone().normalize() },
      },
    ]),
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      #include <fog_pars_vertex>
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vec4 mvPosition = viewMatrix * world;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uShore;
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      uniform vec3 uSky;
      uniform vec3 uSunDir;
      varying vec3 vWorld;
      #include <fog_pars_fragment>
      void main() {
        float surge = sin(uTime * 0.55) * 1.1 + sin(uTime * 1.3 + vWorld.x * 0.08) * 0.35;
        float waterline = uShore - 1.2 + surge;
        float d = vWorld.z - waterline;
        if (d < 0.0) discard;
        float swell = sin(vWorld.z * 0.45 - uTime * 1.4 + sin(vWorld.x * 0.05) * 2.0);
        float chop = sin(vWorld.x * 1.7 + uTime * 1.9) * sin(vWorld.z * 1.3 - uTime * 1.2);
        vec3 n = normalize(vec3(chop * 0.08, 1.0, swell * 0.12 + chop * 0.05));
        vec3 viewDir = normalize(cameraPosition - vWorld);
        float fresnel = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 3.0);
        float depth = smoothstep(0.0, 22.0, d);
        vec3 col = mix(uShallow, uDeep, depth);
        col = mix(col, uSky, clamp(fresnel * 0.8, 0.0, 0.8));
        col += vec3(1.0, 0.93, 0.8) * pow(max(dot(reflect(-uSunDir, n), viewDir), 0.0), 120.0) * 2.0;
        // Foam at the waterline plus a second line where each swell breaks.
        float foam = 1.0 - smoothstep(0.0, 1.4, d);
        float breakLine = smoothstep(0.75, 1.0, swell) * (1.0 - smoothstep(4.0, 12.0, d));
        col = mix(col, vec3(0.97), clamp(foam * 0.85 + breakLine * 0.35, 0.0, 1.0));
        float alpha = mix(0.55, 0.95, smoothstep(0.0, 3.0, d));
        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
  });
}
