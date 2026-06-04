import * as THREE from 'three';

/** Full loop length: parcels rest on the ground until this elapses, then the drop replays. */
const CYCLE_SECONDS = 30;

/** Pause before the first parcel drops. */
const DROP1_DELAY = 0.65;
const DROP1_DURATION = 0.34;
/** After parcel A lands, wait before B falls. */
const GAP_AFTER_FIRST = 0.42;
const DROP2_DURATION = 0.38;
const BOUNCE_DURATION = 0.16;

const COLORS = {
  cardboard: 0xb88a55,
  cardboardLight: 0xd4b07a,
  cardboardDark: 0x8a6538,
  seam: 0x6f5230,
  tape: 0xd4bc92,
  tapeShadow: 0xa89068,
  label: 0xe6dfd0,
  labelInk: 0x8a8078,
  ambient: 0x5ee4a8,
};

const REST = {
  a: { x: -0.3, y: 0, z: 0.1 },
  b: { x: 0.38, y: 0.09, z: -0.1, rotZ: Math.PI / 2, rotX: 0.14 },
} as const;

const START_A = { x: REST.a.x, y: 2.35, z: REST.a.z, rotX: 0, rotY: 0, rotZ: 0 };
const START_B = { x: 0.02, y: 2.55, z: -0.42, rotX: 0.5, rotY: 0.08, rotZ: 0.05 };

const cardboardTextures: THREE.CanvasTexture[] = [];

function flatMaterial(color: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    color,
    flatShading: true,
  });
}

function cardboardMaterial(seed: number): THREE.MeshLambertMaterial {
  if (!cardboardTextures[seed]) {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const base = seed === 0 ? '#c4a06a' : '#b89462';
    const stripe = seed === 0 ? 'rgba(60,40,20,0.07)' : 'rgba(40,30,15,0.09)';

    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 5) {
      ctx.fillStyle = y % 10 === 0 ? stripe : 'rgba(255,255,255,0.035)';
      ctx.fillRect(0, y, size, 2);
    }

    for (let x = 0; x < size; x += 18) {
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      ctx.fillRect(x, 0, 1, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.2, 1.2);
    texture.colorSpace = THREE.SRGBColorSpace;
    cardboardTextures[seed] = texture;
  }

  return new THREE.MeshLambertMaterial({
    map: cardboardTextures[seed],
    flatShading: true,
  });
}

function addEdges(mesh: THREE.Mesh, color: number, opacity = 0.5): THREE.LineSegments {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

function addShippingLabel(
  group: THREE.Group,
  face: 'front' | 'side',
  width: number,
  height: number,
  depth: number,
): void {
  const labelW = width * 0.42;
  const labelH = height * 0.32;
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(labelW, labelH),
    flatMaterial(COLORS.label),
  );

  const pad = 0.006;
  if (face === 'front') {
    label.position.set(width * 0.06, height * 0.04, depth / 2 + pad);
  } else {
    label.rotation.y = Math.PI / 2;
    label.position.set(width / 2 + pad, height * 0.04, -depth * 0.08);
  }
  group.add(label);

  const ink = flatMaterial(COLORS.labelInk);
  const barX = face === 'front' ? width * 0.06 - labelW * 0.32 : width / 2 + pad;
  const barZ = face === 'front' ? depth / 2 + pad + 0.002 : -depth * 0.08;
  const barY = height * 0.04 - labelH * 0.22;

  for (let i = 0; i < 7; i++) {
    const bar = new THREE.Mesh(
      new THREE.PlaneGeometry(0.012, labelH * 0.38),
      ink,
    );
    if (face === 'front') {
      bar.position.set(barX + i * 0.028, barY, barZ);
    } else {
      bar.rotation.y = Math.PI / 2;
      bar.position.set(barX, barY, barZ + i * 0.028);
    }
    group.add(bar);
  }

  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(labelW * 0.7, 0.008),
    ink,
  );
  if (face === 'front') {
    line.position.set(width * 0.06, height * 0.04 + labelH * 0.28, depth / 2 + pad + 0.001);
  } else {
    line.rotation.y = Math.PI / 2;
    line.position.set(width / 2 + pad + 0.001, height * 0.04 + labelH * 0.28, -depth * 0.08);
  }
  group.add(line);
}

/**
 * Shipping-style cardboard parcel: corrugated body, lid flaps, packing tape, address label.
 */
function createParcel(
  width: number,
  height: number,
  depth: number,
  options: { labelFace: 'front' | 'side'; mapSeed: 0 | 1 },
): THREE.Group {
  const group = new THREE.Group();
  const bodyH = height * 0.86;
  const lidH = height * 0.14;
  const bodyY = -height * 0.07;

  const bodyMat = cardboardMaterial(options.mapSeed);
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, bodyH, depth), bodyMat);
  body.position.y = bodyY;
  group.add(body);
  group.add(addEdges(body, COLORS.cardboardDark, 0.45));

  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.99, lidH, depth * 0.99),
    flatMaterial(COLORS.cardboardLight),
  );
  lid.position.y = bodyY + bodyH / 2 + lidH / 2 - 0.004;
  group.add(lid);

  const seamMat = flatMaterial(COLORS.seam);
  const topY = bodyY + bodyH / 2 + lidH - 0.002;
  const flapL = new THREE.Mesh(new THREE.BoxGeometry(width * 0.49, 0.01, depth * 0.97), seamMat);
  flapL.position.set(-width * 0.245, topY, 0);
  const flapR = flapL.clone();
  flapR.position.x = width * 0.245;
  group.add(flapL, flapR);

  const tapeMat = flatMaterial(COLORS.tape);
  const tapeEdge = flatMaterial(COLORS.tapeShadow);
  const tapeY = topY + 0.012;

  const tapeAcross = new THREE.Mesh(new THREE.BoxGeometry(width * 1.03, 0.024, depth * 0.5), tapeMat);
  tapeAcross.position.y = tapeY;
  group.add(tapeAcross);

  const tapeAlong = new THREE.Mesh(new THREE.BoxGeometry(width * 0.48, 0.024, depth * 1.03), tapeMat);
  tapeAlong.position.y = tapeY + 0.002;
  group.add(tapeAlong);

  const sideTape = new THREE.Mesh(new THREE.BoxGeometry(0.024, bodyH * 0.94, depth * 1.01), tapeMat);
  sideTape.position.set(width / 2 + 0.01, bodyY, 0);
  group.add(sideTape);

  const sideTapeEdge = new THREE.Mesh(new THREE.BoxGeometry(0.008, bodyH * 0.94, depth * 1.015), tapeEdge);
  sideTapeEdge.position.set(width / 2 + 0.022, bodyY, 0.001);
  group.add(sideTapeEdge);

  const cornerW = 0.028;
  const cornerMat = flatMaterial(COLORS.cardboardDark);
  for (const [x, z] of [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ] as const) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(cornerW, bodyH, cornerW), cornerMat);
    post.position.set(x * (width / 2 - cornerW / 2), bodyY, z * (depth / 2 - cornerW / 2));
    group.add(post);
  }

  const bottomSkirt = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.01, 0.018, depth * 1.01),
    flatMaterial(COLORS.cardboardDark),
  );
  bottomSkirt.position.y = bodyY - bodyH / 2 - 0.006;
  group.add(bottomSkirt);

  addShippingLabel(group, options.labelFace, width, height, depth);

  return group;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Distance fallen under constant acceleration from rest: fraction = (t/T)² */
function gravityProgress(elapsed: number, duration: number): number {
  const u = Math.min(1, Math.max(0, elapsed / duration));
  return u * u;
}

/** Small damped bounce after impact. */
function bounceOffset(sinceImpact: number): number {
  if (sinceImpact <= 0 || sinceImpact > BOUNCE_DURATION) {
    return 0;
  }
  const t = sinceImpact / BOUNCE_DURATION;
  return 0.07 * Math.sin(t * Math.PI) * (1 - t);
}

type Pose = { x: number; y: number; z: number; rotX: number; rotY: number; rotZ: number };

function setPose(pkg: THREE.Group, pose: Pose, extraY = 0): void {
  pkg.position.set(pose.x, pose.y + extraY, pose.z);
  pkg.rotation.set(pose.rotX, pose.rotY, pose.rotZ);
}

function applyFall(
  pkg: THREE.Group,
  start: Pose,
  end: Pose,
  fallElapsed: number,
  fallDuration: number,
): number {
  if (fallElapsed < 0) {
    setPose(pkg, start);
    return -1;
  }

  const g = gravityProgress(fallElapsed, fallDuration);

  if (fallElapsed >= fallDuration) {
    const sinceImpact = fallElapsed - fallDuration;
    setPose(pkg, end, bounceOffset(sinceImpact));
    return sinceImpact;
  }

  setPose(pkg, {
    x: lerp(start.x, end.x, g),
    y: lerp(start.y, end.y, g),
    z: lerp(start.z, end.z, g),
    rotX: lerp(start.rotX, end.rotX, g),
    rotY: lerp(start.rotY, end.rotY, g),
    rotZ: lerp(start.rotZ, end.rotZ, g),
  });

  return -1;
}

function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
      child.geometry.dispose();
      const mat = child.material;
      const materials = Array.isArray(mat) ? mat : [mat];
      materials.forEach((m) => {
        if (m.map) {
          m.map.dispose();
        }
        m.dispose();
      });
    }
  });
  cardboardTextures.forEach((tex) => tex.dispose());
  cardboardTextures.length = 0;
}

function applyParcelMotion(
  pkgA: THREE.Group,
  pkgB: THREE.Group,
  elapsed: number,
  reducedMotion: boolean,
): void {
  const endA: Pose = { ...REST.a, rotX: 0, rotY: 0, rotZ: 0 };
  const endB: Pose = {
    x: REST.b.x,
    y: REST.b.y,
    z: REST.b.z,
    rotX: REST.b.rotX,
    rotY: 0,
    rotZ: REST.b.rotZ,
  };

  if (reducedMotion) {
    setPose(pkgA, endA);
    setPose(pkgB, endB);
    return;
  }

  const t = elapsed % CYCLE_SECONDS;
  const drop2Start = DROP1_DELAY + DROP1_DURATION + GAP_AFTER_FIRST;

  const fallAElapsed = t - DROP1_DELAY;
  applyFall(pkgA, START_A, endA, fallAElapsed, DROP1_DURATION);

  if (t < drop2Start) {
    setPose(pkgB, START_B);
    return;
  }

  const fallBElapsed = t - drop2Start;
  applyFall(pkgB, START_B, endB, fallBElapsed, DROP2_DURATION);
}

export function initGrabHeroScene(canvas: HTMLCanvasElement): () => void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0.12, 0.42, 3.05);
  camera.lookAt(0.55, 0.02, 0);

  scene.add(new THREE.AmbientLight(0x99aabb, 0.65));
  const key = new THREE.DirectionalLight(COLORS.ambient, 0.85);
  key.position.set(2, 4, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xfff0cc, 0.5);
  fill.position.set(-2, 2, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.2);
  rim.position.set(0, 3, -2);
  scene.add(rim);

  const stage = new THREE.Group();
  stage.position.set(0.55, -0.2, 0);
  scene.add(stage);

  const pkgA = createParcel(0.54, 0.46, 0.4, { labelFace: 'front', mapSeed: 0 });
  const pkgB = createParcel(0.48, 0.4, 0.52, { labelFace: 'side', mapSeed: 1 });
  stage.add(pkgA, pkgB);

  const resize = () => {
    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? 480;
    const height = parent?.clientHeight ?? 360;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const ro = new ResizeObserver(resize);
  if (canvas.parentElement) {
    ro.observe(canvas.parentElement);
  }
  resize();

  const clock = new THREE.Clock();
  let frameId = 0;

  const animate = () => {
    frameId = requestAnimationFrame(animate);
    applyParcelMotion(pkgA, pkgB, clock.getElapsedTime(), reducedMotion);
    renderer.render(scene, camera);
  };

  animate();

  return () => {
    cancelAnimationFrame(frameId);
    ro.disconnect();
    renderer.dispose();
    disposeObject(scene);
  };
}
