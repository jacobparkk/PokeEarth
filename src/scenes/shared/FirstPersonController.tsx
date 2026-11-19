import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Quaternion, Vector3, Euler } from 'three';
import type { Location } from '../../data/regions';
import { moveWithCollisions, movementVector, smoothstep, type Collider } from './movement';
export type TouchMovement = { forward: number; right: number };
interface Props {
  location: Location;
  phase: 'loading' | 'entering' | 'exploring';
  colliders: readonly Collider[];
  touchMovement: MutableRefObject<TouchMovement>;
  onEntered: () => void;
}
export function FirstPersonController({ location, phase, colliders, touchMovement, onEntered }: Props) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());
  const angles = useRef({ yaw: location.camera.player.yaw, pitch: location.camera.player.pitch });
  const elapsed = useRef(0);
  const done = useRef(false);
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const poses = useRef({ start: new Vector3(...location.camera.overview.position), middle: new Vector3(...location.camera.arrival.position), end: new Vector3(...location.camera.player.position), target: new Vector3(...location.camera.arrival.target), endRotation: new Quaternion().setFromEuler(new Euler(location.camera.player.pitch, location.camera.player.yaw, 0, 'YXZ')), lookRotation: new Quaternion() });
  useEffect(() => {
    camera.position.copy(poses.current.start);
    camera.lookAt(...location.camera.overview.target);
    camera.rotation.order = 'YXZ';
  }, [camera, location]);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', 'National Park 3D view. WASD or arrow keys to move. Drag to look. Escape returns to map.');
    const clear = () => { keys.current.clear(); touchMovement.current = { forward: 0, right: 0 }; };
    const active = phase === 'exploring';
    if (active) canvas.focus({ preventScroll: true });
    const editing = (target: EventTarget | null) => target instanceof Element && !!target.closest('input,textarea,select,button');
    const keydown = (event: KeyboardEvent) => {
      if (!active || editing(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)) { event.preventDefault(); keys.current.add(event.code); }
    };
    const keyup = (event: KeyboardEvent) => { keys.current.delete(event.code); };
    let dragging: number | null = null;
    let lastX = 0, lastY = 0;
    const down = (event: PointerEvent) => {
      if (!active || event.button !== 0 || document.pointerLockElement === canvas) return;
      canvas.focus({ preventScroll: true }); dragging = event.pointerId; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      const locked = document.pointerLockElement === canvas;
      if (!active || (!locked && dragging !== event.pointerId)) return;
      const dx = locked ? event.movementX : event.clientX - lastX;
      const dy = locked ? event.movementY : event.clientY - lastY;
      angles.current.yaw -= dx * 0.003;
      angles.current.pitch = Math.max(-1.35, Math.min(1.35, angles.current.pitch - dy * 0.003));
      lastX = event.clientX; lastY = event.clientY;
    };
    const up = () => { dragging = null; };
    const blur = () => { clear(); up(); };
    window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup);
    window.addEventListener('blur', blur); document.addEventListener('visibilitychange', blur);
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up);
    return () => {
      clear(); if (document.pointerLockElement === canvas) document.exitPointerLock();
      window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', blur);
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('lostpointercapture', up);
    };
  }, [phase, gl, touchMovement]);
  useFrame((_, delta) => {
    if (phase === 'entering' && !done.current) {
      elapsed.current += Math.min(delta, 0.05);
      const t = reduced.current ? 1 : Math.min(elapsed.current / 3.6, 1);
      const p = poses.current;
      if (t < 0.55) {
        camera.position.lerpVectors(p.start, p.middle, smoothstep(t / 0.55));
        camera.lookAt(p.target);
      } else {
        const u = smoothstep((t - 0.55) / 0.45);
        camera.position.lerpVectors(p.middle, p.end, u);
        camera.lookAt(p.target);
        p.lookRotation.copy(camera.quaternion);
        camera.quaternion.slerpQuaternions(p.lookRotation, p.endRotation, u);
      }
      if (t === 1) { done.current = true; camera.position.copy(p.end); camera.quaternion.copy(p.endRotation); onEntered(); }
    }
    if (phase !== 'exploring' || document.hidden) return;
    const pressed = (a: string, b: string) => Number(keys.current.has(a) || keys.current.has(b));
    const forward = pressed('KeyW','ArrowUp') - pressed('KeyS','ArrowDown') + touchMovement.current.forward;
    const right = pressed('KeyD','ArrowRight') - pressed('KeyA','ArrowLeft') + touchMovement.current.right;
    const movement = movementVector(forward, right, angles.current.yaw, location.camera.player.walkSpeed, delta);
    const { min, max } = location.scene.bounds;
    const next = moveWithCollisions(camera.position, movement, colliders, { minX: min[0], maxX: max[0], minZ: min[2], maxZ: max[2] });
    camera.position.set(next.x, location.camera.player.position[1], next.z);
    camera.rotation.set(angles.current.pitch, angles.current.yaw, 0, 'YXZ');
    // Read-only diagnostics make movement and collision behavior observable in browser checks.
    gl.domElement.dataset.position = `${next.x.toFixed(3)},${next.z.toFixed(3)}`;
  });
  return null;
}
