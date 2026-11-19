"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { getAudioManager } from "@/audio/AudioManager";

/** Moves the Web Audio listener with the camera so spatial ambience (fountains, waves) pans and attenuates. */
export function AudioListenerSync() {
  const forward = useRef(new Vector3());
  useFrame(({ camera }) => {
    const audio = getAudioManager();
    if (!audio) return;
    camera.getWorldDirection(forward.current);
    audio.setListener(
      [camera.position.x, camera.position.y, camera.position.z],
      [forward.current.x, forward.current.y, forward.current.z],
    );
  });
  return null;
}
