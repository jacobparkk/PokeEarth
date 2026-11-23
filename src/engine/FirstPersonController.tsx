"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, MathUtils, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { easeInOutCubic } from "@/lib/mapCamera";
import type { CameraPose, GroundCameraConfig } from "@/types/world";
import { resolveCollisions, type Collider } from "./collision";
import { playerInput, resetPlayerInput, useSceneRuntime } from "./runtime";

interface FirstPersonControllerProps {
  ground: GroundCameraConfig;
  aerial: CameraPose;
  descentDurationMs: number;
  colliders: readonly Collider[];
  /** False while the exit curtain is closing: the camera holds still. */
  enabled: boolean;
  /** Optional terrain height lookup; flat ground when omitted. */
  groundHeight?: (x: number, z: number) => number;
  /** Called every frame with the player's feet position (for grass parting, etc.). */
  onPlayerMove?: (x: number, z: number) => void;
}

const PLAYER_RADIUS = 0.35;
const MOUSE_SENSITIVITY = 0.0022;
const DRAG_SENSITIVITY = 0.0045;
const TOUCH_SENSITIVITY = 0.006;
const MAX_PITCH = MathUtils.degToRad(85);
const ACCELERATION = 10;
const BOB_AMPLITUDE = 0.045;

const FORWARD_KEYS = ["KeyW", "ArrowUp"];
const BACK_KEYS = ["KeyS", "ArrowDown"];
const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];
const SPRINT_KEYS = ["ShiftLeft", "ShiftRight"];
const MOVEMENT_KEYS = new Set([...FORWARD_KEYS, ...BACK_KEYS, ...LEFT_KEYS, ...RIGHT_KEYS, ...SPRINT_KEYS]);

const anyHeld = (codes: string[]) => codes.some((c) => playerInput.keys.has(c));

/**
 * First-person camera controller.
 *
 * 1. Descent: swoops from the location's aerial pose (matching the end of the
 *    map dive) down to eye level along a Bézier curve while slerping rotation.
 * 2. Walking: WASD / arrows (+Shift to run) or a virtual joystick; mouse look
 *    with pointer lock (click), drag-to-look without lock, or touch drag.
 *    Movement is smoothed, collides with circles/boxes and is clamped to bounds.
 */
export function FirstPersonController({
  ground,
  aerial,
  descentDurationMs,
  colliders,
  enabled,
  groundHeight,
  onPlayerMove,
}: FirstPersonControllerProps) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const canvas = useThree((s) => s.gl.domElement);
  const setPhase = useSceneRuntime((s) => s.setPhase);
  const setPointerLocked = useSceneRuntime((s) => s.setPointerLocked);

  const sim = useRef({
    phase: "descending" as "descending" | "walking",
    t: 0,
    yaw: MathUtils.degToRad(ground.yawDeg),
    pitch: MathUtils.degToRad(ground.pitchDeg),
    pos: new Vector3(ground.spawn[0], ground.spawn[1], ground.spawn[2]),
    vel: new Vector3(),
    bobPhase: 0,
    startPos: new Vector3(),
    control: new Vector3(),
    endPos: new Vector3(),
    startQuat: new Quaternion(),
    endQuat: new Quaternion(),
  });
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) resetPlayerInput();
  }, [enabled]);

  /* -------------------------------------------------- descent setup */

  useLayoutEffect(() => {
    const s = sim.current;
    resetPlayerInput();
    camera.rotation.order = "YXZ";
    camera.position.set(aerial.position[0], aerial.position[1], aerial.position[2]);
    camera.lookAt(aerial.lookAt[0], aerial.lookAt[1], aerial.lookAt[2]);
    camera.fov = aerial.fov;
    camera.near = 0.1;
    camera.far = Math.max(camera.far, 1000);
    camera.updateProjectionMatrix();

    const feetY = groundHeight ? groundHeight(ground.spawn[0], ground.spawn[2]) : ground.spawn[1];
    s.pos.set(ground.spawn[0], feetY, ground.spawn[2]);
    s.startPos.copy(camera.position);
    s.startQuat.copy(camera.quaternion);
    s.endPos.set(ground.spawn[0], feetY + ground.eyeHeight, ground.spawn[2]);
    s.endQuat.setFromEuler(new Euler(s.pitch, s.yaw, 0, "YXZ"));
    // Control point keeps the swoop high over gates and tree lines, then levels out.
    s.control.set(
      (s.startPos.x + s.endPos.x) / 2,
      s.endPos.y + 10,
      (s.startPos.z + s.endPos.z) / 2,
    );
    s.phase = "descending";
    s.t = 0;
    setPhase("descending");
  }, [camera, aerial, ground, groundHeight, setPhase]);

  /* -------------------------------------------------- input */

  useEffect(() => {
    const isTyping = (e: KeyboardEvent) =>
      e.target instanceof HTMLElement && (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e) || e.metaKey || e.ctrlKey || !MOVEMENT_KEYS.has(e.code)) return;
      playerInput.keys.add(e.code);
      if (e.code.startsWith("Arrow")) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      playerInput.keys.delete(e.code);
    };
    const onBlur = () => resetPlayerInput();

    let drag: { id: number; x: number; y: number; moved: number; touch: boolean } | null = null;

    const onPointerDown = (e: PointerEvent) => {
      if (!enabledRef.current || document.pointerLockElement === canvas) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, touch: e.pointerType !== "mouse" };
      canvas.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      const k = drag.touch ? TOUCH_SENSITIVITY : DRAG_SENSITIVITY;
      playerInput.lookYaw -= dx * k;
      playerInput.lookPitch -= dy * k;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const wasClick = drag.moved < 5 && !drag.touch;
      drag = null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      // A clean mouse click (not a drag) grabs the pointer for FPS-style look.
      if (wasClick && enabledRef.current && sim.current.phase === "walking") {
        try {
          const result = canvas.requestPointerLock() as unknown;
          if (result instanceof Promise) result.catch(() => undefined);
        } catch {
          /* Pointer lock unavailable (e.g. iframe sandbox): drag-to-look keeps working. */
        }
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas || !enabledRef.current) return;
      playerInput.lookYaw -= e.movementX * MOUSE_SENSITIVITY;
      playerInput.lookPitch -= e.movementY * MOUSE_SENSITIVITY;
    };
    const onLockChange = () => setPointerLocked(document.pointerLockElement === canvas);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onLockChange);
    canvas.style.touchAction = "none";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onLockChange);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      resetPlayerInput();
    };
  }, [canvas, setPointerLocked]);

  // Release the mouse as soon as the exit transition starts.
  useEffect(() => {
    if (!enabled && document.pointerLockElement === canvas) document.exitPointerLock();
  }, [enabled, canvas]);

  /* -------------------------------------------------- simulation */

  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const wish = useRef(new Vector3());

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const s = sim.current;

    if (s.phase === "descending") {
      s.t = Math.min(1, s.t + (dt * 1000) / Math.max(1, descentDurationMs));
      const u = easeInOutCubic(s.t);
      const a = 1 - u;
      camera.position.set(
        a * a * s.startPos.x + 2 * a * u * s.control.x + u * u * s.endPos.x,
        a * a * s.startPos.y + 2 * a * u * s.control.y + u * u * s.endPos.y,
        a * a * s.startPos.z + 2 * a * u * s.control.z + u * u * s.endPos.z,
      );
      camera.quaternion.slerpQuaternions(s.startQuat, s.endQuat, u);
      camera.fov = MathUtils.lerp(aerial.fov, ground.fov, u);
      camera.updateProjectionMatrix();
      if (s.t >= 1) {
        s.phase = "walking";
        camera.rotation.set(s.pitch, s.yaw, 0, "YXZ");
        playerInput.lookYaw = 0;
        playerInput.lookPitch = 0;
        setPhase("walking");
      }
      onPlayerMove?.(s.pos.x, s.pos.z);
      return;
    }

    // Look
    s.yaw += playerInput.lookYaw;
    s.pitch = MathUtils.clamp(s.pitch + playerInput.lookPitch, -MAX_PITCH, MAX_PITCH);
    playerInput.lookYaw = 0;
    playerInput.lookPitch = 0;

    // Move
    const active = enabledRef.current;
    let f = 0;
    let r = 0;
    if (active) {
      f = (anyHeld(FORWARD_KEYS) ? 1 : 0) - (anyHeld(BACK_KEYS) ? 1 : 0) + playerInput.joystick.y;
      r = (anyHeld(RIGHT_KEYS) ? 1 : 0) - (anyHeld(LEFT_KEYS) ? 1 : 0) + playerInput.joystick.x;
      const len = Math.hypot(f, r);
      if (len > 1) {
        f /= len;
        r /= len;
      }
    }
    const sprinting = active && (anyHeld(SPRINT_KEYS) || playerInput.sprint);
    const speed = ground.walkSpeed * (sprinting ? ground.sprintMultiplier : 1);

    forward.current.set(-Math.sin(s.yaw), 0, -Math.cos(s.yaw));
    right.current.set(Math.cos(s.yaw), 0, -Math.sin(s.yaw));
    wish.current
      .copy(forward.current)
      .multiplyScalar(f * speed)
      .addScaledVector(right.current, r * speed);
    s.vel.lerp(wish.current, 1 - Math.exp(-ACCELERATION * dt));

    s.pos.addScaledVector(s.vel, dt);
    resolveCollisions(s.pos, PLAYER_RADIUS, colliders);
    s.pos.x = MathUtils.clamp(s.pos.x, ground.bounds.min[0], ground.bounds.max[0]);
    s.pos.z = MathUtils.clamp(s.pos.z, ground.bounds.min[1], ground.bounds.max[1]);
    // Follow the terrain, easing over steps and slopes instead of snapping.
    const targetY = groundHeight ? groundHeight(s.pos.x, s.pos.z) : ground.spawn[1];
    s.pos.y += (targetY - s.pos.y) * (1 - Math.exp(-16 * dt));

    // Head bob scales with speed and settles smoothly when stopping.
    const planarSpeed = Math.hypot(s.vel.x, s.vel.z);
    s.bobPhase += planarSpeed * dt * 1.9;
    const bobWeight = MathUtils.clamp(planarSpeed / ground.walkSpeed, 0, 1.4);
    const bob = Math.sin(s.bobPhase * Math.PI) * BOB_AMPLITUDE * bobWeight;

    camera.position.set(s.pos.x, s.pos.y + ground.eyeHeight + bob, s.pos.z);
    camera.rotation.set(s.pitch, s.yaw, 0, "YXZ");
    onPlayerMove?.(s.pos.x, s.pos.z);
  });

  return null;
}
