import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { prefersReducedMotion } from '../lib/gsap';
import { pointer } from '../lib/pointer';

// The HX-07: "Jet" by jeremy (CC BY 3.0, via Poly Pizza), repainted in the team's livery.
// The model is normalised so its nose points along +X and it is LENGTH units long.
//
// Nothing here is driven by discrete tweens. The section writes three numbers into `motion` as the page
// scrolls (enter, progress through the parts, exit), and every frame the craft is damped towards the
// pose those numbers describe. However fast or unevenly the reader scrolls, the craft only glides.

export type CraftMotion = { enter: number; progress: number; exit: number };

const MODEL_URL = '/models/hx07.glb';
const LENGTH = 4.15;
const MODEL_YAW = Math.PI / 2; // the source model's nose points along +Z
const ION = '#93f1f7';

// Livery, by the source model's material names.
const LIVERY: Record<string, { color: string; roughness: number; metalness: number }> = {
  '455A64': { color: '#f26a1b', roughness: 0.45, metalness: 0.1 }, // upper hull: sunrise orange
  '78909C': { color: '#24272b', roughness: 0.55, metalness: 0.15 }, // underside, nose, pods: graphite
  '80DEEA': { color: '#4fc3d4', roughness: 0.15, metalness: 0.4 }, // canopy
  '1A1A1A': { color: '#0b0b0b', roughness: 0.6, metalness: 0.2 }, // intakes and nozzles
};

// One pose per part, in list order. The yaw keeps increasing, so moving down the list turns the craft
// in one continuous direction instead of swinging back and forth.
const VIEWS: [number, number, number][] = [
  [0.18, -0.42, 0.06], // hull: the full flank
  [0.22, 2.55, -0.04], // ion drive: from behind
  [1.08, 3.6, 0.02], // radiators: from above, wings spread
  [0.3, 5.2, 0.06], // cockpit: nose three-quarter
  [-0.82, 5.86, 0.12], // xenon tank: the belly pods
];
const DRIVE = 1; // index of the ion drive view, where the exhaust burns brightest

// Hold on each pose for a moment, then glide to the next.
const dwell = (f: number) => {
  const u = Math.min(1, Math.max(0, (f - 0.16) / 0.68));
  return u * u * (3 - 2 * u);
};

function useShip() {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  return useMemo(() => {
    const model = gltf.scene.clone(true);
    model.rotation.y = MODEL_YAW;
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const repaint = (m: THREE.Material) => {
        const next = (m as THREE.MeshStandardMaterial).clone();
        const paint = LIVERY[m.name];
        if (paint) {
          next.color.set(paint.color);
          next.roughness = paint.roughness;
          next.metalness = paint.metalness;
        }
        return next;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(repaint) : repaint(mesh.material);
    });
    const holder = new THREE.Group();
    holder.add(model);
    holder.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(holder);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    const s = LENGTH / size.x;
    holder.scale.setScalar(s);
    return { holder, size: size.multiplyScalar(s) };
  }, [gltf]);
}

function Ship({ motion }: { motion: { current: CraftMotion } }) {
  const flight = useRef<THREE.Group>(null!);
  const pose = useRef<THREE.Group>(null!);
  const float = useRef<THREE.Group>(null!);
  const plumes = useRef<THREE.Group>(null!);
  const reduced = prefersReducedMotion();
  const { holder, size } = useShip();
  const damp = THREE.MathUtils.damp;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const k = reduced ? 1000 : 5.5; // damping rate: higher snaps, lower drifts
    const { enter, progress, exit } = motion.current;
    const n = VIEWS.length;

    // Pose: where along the list of parts the reader is.
    const t = Math.min(Math.max(progress, 0), 1) * (n - 1);
    const i = Math.min(Math.floor(t), n - 2);
    const f = dwell(t - i);
    const a = VIEWS[i];
    const b = VIEWS[i + 1];
    const p = pose.current;
    p.rotation.x = damp(p.rotation.x, a[0] + (b[0] - a[0]) * f, k, dt);
    p.rotation.y = damp(p.rotation.y, a[1] + (b[1] - a[1]) * f, k, dt);
    p.rotation.z = damp(p.rotation.z, a[2] + (b[2] - a[2]) * f, k, dt);

    // Flight: in from the right as the section arrives, up and away to the left as it leaves. The
    // arrival is spread over the whole climb of the section into view, so it reads as a fly-in.
    const en = Math.min(Math.max(enter, 0), 1);
    const e = en * en * (3 - 2 * en);
    const x = Math.min(Math.max(exit, 0), 1);
    const g = flight.current;
    g.position.x = damp(g.position.x, (1 - e) * 7 - x * x * 9, k, dt);
    g.position.y = damp(g.position.y, (1 - e) * -1.4 + x * 2.2, k, dt);
    g.rotation.z = damp(g.rotation.z, (1 - e) * 0.55 - x * 0.45, k, dt);
    g.rotation.y = damp(g.rotation.y, (1 - e) * -0.7 + x * 0.5, k, dt);
    const scale = 0.72 + 0.28 * e;
    g.scale.setScalar(damp(g.scale.x, scale, k, dt));

    // Exhaust: brightest on the drive view and while the craft is flying in or out.
    const burn = Math.exp(-((t - DRIVE) ** 2) / 0.22) * 1.8 + (1 - e) * 1.4 + x * 1.4;
    const pl = plumes.current;
    pl.scale.x = damp(pl.scale.x, 1 + burn, k, dt);

    if (reduced) return;
    const time = state.clock.elapsedTime;
    const fl = float.current;
    fl.position.y = Math.sin(time * 0.9) * 0.07;
    fl.rotation.z = damp(fl.rotation.z, pointer.y * 0.12 + Math.sin(time * 0.6) * 0.02, 3, dt);
    fl.rotation.y = damp(fl.rotation.y, pointer.x * 0.25, 3, dt);
    const flicker = 0.9 + Math.sin(time * 31) * 0.05 + Math.sin(time * 17) * 0.05;
    pl.scale.y = pl.scale.z = flicker;
  });

  const rear = -size.x / 2;
  return (
    <group ref={flight}>
      <group ref={float}>
        <group ref={pose} rotation={VIEWS[0]}>
          <primitive object={holder} />
          <group ref={plumes} position={[rear + 0.12, PLUME_Y * size.y, 0]}>
            {PLUME_Z.map((z) => (
              <mesh key={z} position={[-0.5, 0, z * size.z]} rotation={[0, 0, Math.PI / 2]}>
                <coneGeometry args={[PLUME_R * size.y, 1, 32, 1, true]} />
                <meshBasicMaterial
                  color={ION}
                  transparent
                  opacity={0.42}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

// Where the two nozzles sit, as fractions of the craft's height and wingspan (set from renders).
const PLUME_Y = -0.02;
const PLUME_Z = [-0.055, 0.055];
const PLUME_R = 0.11;

export default function CraftCanvas({ motion, visible }: { motion: { current: CraftMotion }; visible: boolean }) {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 9.8], fov: 34 }}
      frameloop={visible ? 'always' : 'never'}
      aria-hidden="true"
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 5]} intensity={2.6} color="#fff3e2" />
      <directionalLight position={[-6, -2, -5]} intensity={1.4} color={ION} />
      <directionalLight position={[0, -5, 3]} intensity={0.5} color="#ffffff" />
      <Ship motion={motion} />
    </Canvas>
  );
}
