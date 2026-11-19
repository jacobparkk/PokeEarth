# Custom models

National Park currently renders local Three.js primitives, instanced foliage, shaders, and lighting. No model files are required.

To replace a complete scene later, add a GLB here and set that location's `scene.asset` to `{ mode: 'gltf', modelUrl: '/assets/models/national-park.glb' }`, adjusting the URL for the deployment base path. Use metres and Y-up orientation. Preserve a validated spawn, bounds, and collider representation.

Add a GLB renderer inside SceneHost with loading, error, disposal, and procedural fallback handling. The current procedural renderer does not read model URLs; configuring one alone does not install a loader.
