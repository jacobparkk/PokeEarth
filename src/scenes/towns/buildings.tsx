"use client";

import { useMemo } from "react";
import { gableRoof, hipRoof } from "../shared/roofs";
import { Gatehouse } from "../shared/Gatehouse";
import type { BuildingKind, BuildingStyle } from "./types";

/*
 * Procedural stand-ins for every building kind. Each is authored in local
 * space matching FOOTPRINTS in resolve.ts: centred on the origin with the
 * front door facing +z (except the gatehouse, whose front faces −z).
 */

const S = { castShadow: true, receiveShadow: true } as const;

function Box({ size, at, color, rough = 0.85, emissive, emissiveIntensity }: {
  size: [number, number, number];
  at: [number, number, number];
  color: string;
  rough?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={at} {...S}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} emissive={emissive ?? "#000000"} emissiveIntensity={emissiveIntensity ?? 0} />
    </mesh>
  );
}

function Window({ at, w = 1.2, h = 1.0, glow = 0.35, frame = "#ffffff" }: { at: [number, number, number]; w?: number; h?: number; glow?: number; frame?: string }) {
  return (
    <group position={at}>
      <Box size={[w + 0.18, h + 0.18, 0.06]} at={[0, 0, -0.01]} color={frame} />
      <Box size={[w, h, 0.07]} at={[0, 0, 0.01]} color="#cfe6f0" rough={0.2} emissive="#ffd9a0" emissiveIntensity={glow} />
      <Box size={[0.06, h, 0.08]} at={[0, 0, 0.03]} color={frame} />
    </group>
  );
}

/* ----------------------------------------------------------- western house */

export function GableHouse({ style }: { style?: BuildingStyle }) {
  const W = 8, D = 6.5, H = 3.3;
  const wall = style?.wall ?? "#f1e7cf";
  const roofColor = style?.roof ?? "#b9493b";
  const trim = style?.trim ?? "#ffffff";
  const roof = useMemo(() => gableRoof(W, D, 2.4, 0.5), []);
  return (
    <group>
      <Box size={[W + 0.3, 0.4, D + 0.3]} at={[0, 0.2, 0]} color="#a59a85" />
      <Box size={[W, H, D]} at={[0, 0.4 + H / 2, 0]} color={wall} rough={0.9} />
      <mesh geometry={roof} position-y={0.4 + H} {...S}>
        <meshStandardMaterial color={roofColor} roughness={0.7} />
      </mesh>
      {/* Chimney */}
      <Box size={[0.7, 1.8, 0.7]} at={[W * 0.28, H + 1.9, -D * 0.18]} color="#9b8f7c" />
      {/* Door, step and canopy */}
      <Box size={[1.2, 2.15, 0.08]} at={[0, 0.4 + 1.08, D / 2 + 0.04]} color="#6b4630" rough={0.7} />
      <Box size={[0.08, 0.08, 0.06]} at={[0.42, 1.5, D / 2 + 0.1]} color="#d9b45a" rough={0.3} />
      <Box size={[1.8, 0.2, 0.9]} at={[0, 0.1, D / 2 + 0.45]} color="#bdb39f" />
      <Box size={[1.8, 0.1, 0.8]} at={[0, 2.85, D / 2 + 0.4]} color={roofColor} />
      <Window at={[-2.4, 2.0, D / 2 + 0.03]} frame={trim} />
      <Window at={[2.4, 2.0, D / 2 + 0.03]} frame={trim} />
      {/* Side and back windows */}
      <group rotation-y={Math.PI / 2}>
        <Window at={[0, 2.0, W / 2 + 0.03]} frame={trim} w={1} />
      </group>
      <group rotation-y={-Math.PI / 2}>
        <Window at={[0, 2.0, W / 2 + 0.03]} frame={trim} w={1} />
      </group>
      <group rotation-y={Math.PI}>
        <Window at={[-1.8, 2.0, D / 2 + 0.03]} frame={trim} />
        <Window at={[1.8, 2.0, D / 2 + 0.03]} frame={trim} />
      </group>
    </group>
  );
}

/* --------------------------------------------------------- Ecruteak machiya */

export function Machiya({ style }: { style?: BuildingStyle }) {
  const W = 7, D = 6, H1 = 2.7, H2 = 2.3;
  const wood = style?.wall ?? "#4e3626";
  const tile = style?.roof ?? "#3a3d44";
  const roof = useMemo(() => gableRoof(W, D, 1.5, 0.8), []);
  const eave = useMemo(() => hipRoof(D / 2 + 0.7, D / 2 - 0.2, 0.45), []);
  const slats = Array.from({ length: 13 }, (_, i) => -2.6 + i * 0.43);
  return (
    <group>
      <Box size={[W + 0.2, 0.3, D + 0.2]} at={[0, 0.15, 0]} color="#8c8070" />
      {/* Ground floor: dark timber with a lattice front */}
      <Box size={[W, H1, D]} at={[0, 0.3 + H1 / 2, 0]} color={wood} rough={0.8} />
      {slats.filter((x) => Math.abs(x) > 0.75).map((x) => (
        <Box key={x} size={[0.08, H1 - 0.5, 0.1]} at={[x, 0.3 + H1 / 2, D / 2 + 0.05]} color="#2e2018" />
      ))}
      {/* Warm interior glow behind the lattice and a doorway with a cloth curtain */}
      <Box size={[W - 1, H1 - 0.6, 0.04]} at={[0, 0.3 + H1 / 2, D / 2 + 0.01]} color="#3a2a1e" emissive="#ffb35c" emissiveIntensity={0.45} />
      <Box size={[1.3, 2.2, 0.06]} at={[0, 1.4, D / 2 + 0.06]} color="#1d1612" />
      <Box size={[1.4, 0.7, 0.04]} at={[0, 2.2, D / 2 + 0.12]} color="#2f4f7a" rough={0.9} />
      {/* Intermediate eave between floors */}
      <mesh geometry={eave} position={[0, 0.3 + H1 - 0.1, 0]} scale={[W / D, 1, 1]} {...S}>
        <meshStandardMaterial color={tile} roughness={0.6} />
      </mesh>
      {/* Upper floor: white plaster with a slatted window */}
      <Box size={[W - 0.4, H2, D - 0.4]} at={[0, 0.3 + H1 + H2 / 2, 0]} color="#ece3d2" rough={0.95} />
      <Box size={[2.4, 0.8, 0.06]} at={[0, 0.3 + H1 + H2 / 2, D / 2 - 0.17]} color="#3a2a1e" emissive="#ffb35c" emissiveIntensity={0.3} />
      {[-0.9, -0.3, 0.3, 0.9].map((x) => (
        <Box key={x} size={[0.06, 0.8, 0.08]} at={[x, 0.3 + H1 + H2 / 2, D / 2 - 0.13]} color="#2e2018" />
      ))}
      <mesh geometry={roof} position-y={0.3 + H1 + H2} {...S}>
        <meshStandardMaterial color={tile} roughness={0.55} />
      </mesh>
      <Box size={[W + 1.7, 0.18, 0.3]} at={[0, 0.3 + H1 + H2 + 1.5, 0]} color="#2b2d33" />
      {/* Paper lantern by the door */}
      <mesh position={[1.1, 2.45, D / 2 + 0.35]}>
        <sphereGeometry args={[0.24, 12, 10]} />
        <meshStandardMaterial color="#ffe2b0" emissive="#ff9a3c" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

/* ----------------------------------------------------------------- the lab */

export function LabBuilding({ style }: { style?: BuildingStyle }) {
  const W = 12, D = 8, H = 4.2;
  const wall = style?.wall ?? "#f3f2ec";
  const accent = style?.roof ?? "#5a7894";
  return (
    <group>
      <Box size={[W + 0.4, 0.45, D + 0.4]} at={[0, 0.22, 0]} color="#9a9a94" />
      <Box size={[W, H, D]} at={[0, 0.45 + H / 2, 0]} color={wall} rough={0.6} />
      {/* Window band */}
      <Box size={[W - 1.2, 1.1, 0.08]} at={[0, 2.6, D / 2 + 0.04]} color="#bfe2f2" rough={0.15} emissive="#cfeeff" emissiveIntensity={0.35} />
      {[-4, -2, 2, 4].map((x) => (
        <Box key={x} size={[0.12, 1.1, 0.1]} at={[x, 2.6, D / 2 + 0.06]} color={accent} />
      ))}
      {/* Flat roof with parapet and plant */}
      <Box size={[W + 0.3, 0.35, D + 0.3]} at={[0, 0.45 + H + 0.17, 0]} color={accent} rough={0.5} />
      <Box size={[2.4, 1.0, 1.6]} at={[-3.2, 0.45 + H + 0.85, -1.4]} color="#c9cbcc" rough={0.4} />
      {/* Satellite dish and antenna */}
      <group position={[3.4, 0.45 + H + 0.35, -1.2]}>
        <Box size={[0.15, 1.2, 0.15]} at={[0, 0.6, 0]} color="#7d8288" />
        <mesh position={[0, 1.4, 0.15]} rotation-x={-0.7} castShadow>
          <sphereGeometry args={[0.95, 20, 10, 0, Math.PI * 2, 0, 0.8]} />
          <meshStandardMaterial color="#e7e9ea" side={2} roughness={0.35} metalness={0.2} />
        </mesh>
      </group>
      <Box size={[0.06, 2.6, 0.06]} at={[-5.2, 0.45 + H + 1.6, 3]} color="#7d8288" />
      {/* Entrance: glass double doors under a canopy, with a sign */}
      <Box size={[2.4, 2.5, 0.08]} at={[0, 1.7, D / 2 + 0.05]} color="#9fd2e6" rough={0.1} emissive="#cfeeff" emissiveIntensity={0.25} />
      <Box size={[0.08, 2.5, 0.1]} at={[0, 1.7, D / 2 + 0.09]} color={accent} />
      <Box size={[3.6, 0.15, 1.4]} at={[0, 3.25, D / 2 + 0.7]} color={accent} />
      <Box size={[2.8, 0.55, 0.1]} at={[0, 3.75, D / 2 + 0.06]} color={accent} />
      <Box size={[3.2, 0.2, 1.2]} at={[0, 0.1, D / 2 + 0.6]} color="#c4c4bc" />
    </group>
  );
}

/* --------------------------------------------------------------- pagodas */

interface PagodaProps {
  tiers: number;
  base: number;
  tierHeight: number;
  body: string;
  roof: string;
  trim: string;
  ruined?: boolean;
}

function Pagoda({ tiers, base, tierHeight, body, roof, trim, ruined = false }: PagodaProps) {
  const levels = useMemo(
    () =>
      Array.from({ length: tiers }, (_, i) => {
        const half = (base / 2) * (1 - i * 0.065);
        return { i, half, y: 1.4 + i * tierHeight, roof: hipRoof(half + 1.5, half * 0.55, tierHeight * 0.32) };
      }),
    [tiers, base, tierHeight],
  );
  const top = 1.4 + tiers * tierHeight;
  return (
    <group>
      {/* Stone platform with steps */}
      <Box size={[base + 4, 1.4, base + 4]} at={[0, 0.7, 0]} color={ruined ? "#5b544c" : "#a89c86"} rough={0.95} />
      <Box size={[4, 0.7, 2]} at={[0, 0.35, base / 2 + 3]} color={ruined ? "#5b544c" : "#a89c86"} />
      {levels.map(({ i, half, y, roof: roofGeo }) => {
        const broken = ruined && i === tiers - 1;
        const tilt = ruined ? (i % 2 ? 0.035 : -0.025) : 0;
        return (
          <group key={i} position-y={y} rotation-z={tilt}>
            <Box size={[half * 1.6, tierHeight * 0.68, half * 1.6]} at={[0, (tierHeight * 0.68) / 2, 0]} color={body} rough={0.8} />
            {/* Corner pillars and a balcony rail */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
              <Box key={`${sx}${sz}`} size={[0.35, tierHeight * 0.68, 0.35]} at={[sx! * half * 0.82, (tierHeight * 0.68) / 2, sz! * half * 0.82]} color={ruined ? "#1c1714" : "#7a2418"} />
            ))}
            {!ruined && (
              <Box size={[half * 1.2, tierHeight * 0.35, 0.06]} at={[0, tierHeight * 0.34, half * 0.8 + 0.01]} color="#3a2a1e" emissive="#ffb35c" emissiveIntensity={0.55} />
            )}
            {!broken && (
              <mesh geometry={roofGeo} position-y={tierHeight * 0.66} {...S}>
                <meshStandardMaterial color={roof} roughness={0.6} />
              </mesh>
            )}
            {!broken && <Box size={[half * 2 + 3.1, 0.12, 0.12]} at={[0, tierHeight * 0.66 + 0.02, half + 1.5]} color={trim} rough={0.4} />}
            {broken &&
              [-0.8, -0.2, 0.5, 0.9].map((x, k) => (
                <Box key={k} size={[0.3, tierHeight * (0.8 + k * 0.25), 0.3]} at={[x * half, tierHeight * 0.68 + 0.5, (k % 2 ? 1 : -1) * half * 0.6]} color="#1c1714" />
              ))}
          </group>
        );
      })}
      {!ruined ? (
        <group position-y={top}>
          <Box size={[0.5, 1.2, 0.5]} at={[0, 0.6, 0]} color={trim} rough={0.3} />
          <mesh position-y={3.2} castShadow>
            <cylinderGeometry args={[0.08, 0.16, 4.2, 8]} />
            <meshStandardMaterial color={trim} metalness={0.7} roughness={0.3} />
          </mesh>
          {[1.8, 2.5, 3.2, 3.9].map((h) => (
            <mesh key={h} position-y={h}>
              <torusGeometry args={[0.32, 0.06, 6, 16]} />
              <meshStandardMaterial color={trim} metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          <mesh position-y={5.5}>
            <sphereGeometry args={[0.28, 12, 10]} />
            <meshStandardMaterial color="#ffd36a" emissive="#ffb23c" emissiveIntensity={1.2} metalness={0.6} />
          </mesh>
        </group>
      ) : (
        // Charred debris and a faint ember glow around the base.
        <group>
          {[[-6, 0.3, 4], [5, 0.25, -5], [6.5, 0.2, 3], [-4, 0.2, -6]].map(([x, y, z], k) => (
            <mesh key={k} position={[x!, 1.4 + y!, z!]} rotation={[0.2 * k, k, 0.1]} castShadow>
              <boxGeometry args={[2.4, 0.35, 0.4]} />
              <meshStandardMaterial color="#1e1916" roughness={1} />
            </mesh>
          ))}
          <mesh position={[0, 2.0, 0]}>
            <sphereGeometry args={[1.2, 12, 8]} />
            <meshStandardMaterial color="#2a1a12" emissive="#ff5a1f" emissiveIntensity={0.35} transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function BellTower() {
  return <Pagoda tiers={9} base={11} tierHeight={3.6} body="#b5452f" roof="#3f4a4f" trim="#d9a441" />;
}

export function BurnedTower() {
  return <Pagoda tiers={3} base={12} tierHeight={4.2} body="#2d2621" roof="#1e1b19" trim="#3a302a" ruined />;
}

/* ---------------------------------------------------------- dance theater */

export function WoodenHall({ style }: { style?: BuildingStyle }) {
  const W = 14, D = 11, H = 4.6;
  const pillar = style?.trim ?? "#a8321f";
  const roofColor = style?.roof ?? "#3c4148";
  const roof = useMemo(() => hipRoof(Math.max(W, D) / 2 + 1.6, 1.2, 3.4), []);
  const cols: [number, number][] = [];
  for (let x = -W / 2; x <= W / 2 + 0.01; x += W / 6) {
    cols.push([x, -D / 2], [x, D / 2]);
  }
  for (let z = -D / 2 + D / 4; z < D / 2; z += D / 4) {
    cols.push([-W / 2, z], [W / 2, z]);
  }
  return (
    <group>
      <Box size={[W + 2, 1.0, D + 2]} at={[0, 0.5, 0]} color="#9c907a" rough={0.95} />
      <Box size={[4, 0.5, 1.6]} at={[0, 0.25, D / 2 + 1.7]} color="#9c907a" />
      <Box size={[W - 1, H - 0.4, D - 1]} at={[0, 1 + (H - 0.4) / 2, 0]} color="#d8c7a4" rough={0.9} />
      {/* Glowing paper screens on the front */}
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <Box key={x} size={[2.4, 2.8, 0.06]} at={[x, 2.6, (D - 1) / 2 + 0.04]} color="#f4ead2" emissive="#ffc074" emissiveIntensity={0.6} />
      ))}
      {cols.map(([x, z], i) => (
        <mesh key={i} position={[x, 1 + H / 2, z]} castShadow>
          <cylinderGeometry args={[0.24, 0.26, H, 10]} />
          <meshStandardMaterial color={pillar} roughness={0.6} />
        </mesh>
      ))}
      <Box size={[W + 0.8, 0.4, D + 0.8]} at={[0, 1 + H + 0.2, 0]} color="#5a3c28" />
      <mesh geometry={roof} position-y={1 + H + 0.4} scale={[1, 1, D / W + 0.08]} {...S}>
        <meshStandardMaterial color={roofColor} roughness={0.55} />
      </mesh>
      <Box size={[3.4, 0.9, 0.12]} at={[0, 1 + H - 0.6, D / 2 + 0.1]} color="#3a2a1e" />
    </group>
  );
}

/** Pick the procedural component for a building kind. */
export function ProceduralBuilding({ kind, style }: { kind: BuildingKind; style?: BuildingStyle }) {
  switch (kind) {
    case "gable-house":
      return <GableHouse style={style} />;
    case "machiya":
      return <Machiya style={style} />;
    case "lab-building":
      return <LabBuilding style={style} />;
    case "gatehouse":
      return <Gatehouse />;
    case "nine-tier-pagoda":
      return <BellTower />;
    case "ruined-pagoda":
      return <BurnedTower />;
    case "wooden-hall":
      return <WoodenHall style={style} />;
  }
}
