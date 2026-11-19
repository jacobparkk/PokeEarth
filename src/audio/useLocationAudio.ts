import { useCallback, useEffect, useState } from 'react';
import type { Location } from '../data/regions';
import { AudioEngine } from './AudioEngine';
export function useLocationAudio(location: Location | null) {
  const [engine] = useState(() => new AudioEngine());
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState('Sound starts when you enter');
  useEffect(() => { engine.onStatus = setStatus; return () => { engine.onStatus = () => {}; engine.dispose(); }; }, [engine]);
  useEffect(() => { engine.setPreferences(volume, muted); }, [engine, volume, muted]);
  useEffect(() => { void engine.setLocation(location); }, [engine, location]);
  const unlock = useCallback(() => { void engine.unlock(); }, [engine]);
  const toggleMute = useCallback(() => { void engine.unlock(); setMuted(value => !value); }, [engine]);
  return { volume, setVolume, muted, toggleMute, unlock, status };
}
