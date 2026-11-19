# Custom models

No models are required for phase one. Phase two will initially build National Park from local Three.js primitives, instanced foliage, shaders, and lighting.

To replace a complete scene later, add a GLB here and set that location's `scene.asset` to `{ mode: 'gltf', modelUrl: '/assets/models/national-park.glb' }`, adjusting the URL for the deployment base path. Use metres and Y-up orientation. Preserve a validated spawn, bounds, and collider representation. The future SceneHost must handle model loading, failure, disposal, and fallback; a configured model URL alone does not implement a loader.
