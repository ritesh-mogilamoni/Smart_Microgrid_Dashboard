import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, ZoomIn, X } from 'lucide-react';

// =========================================================================
// PROCEDURAL CANVAS TEXTURE GENERATORS (Realistic PCB & Component Artwork)
// =========================================================================

function createWorkbenchTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0b1626';
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.strokeStyle = '#152438';
  ctx.lineWidth = 1;
  for (let i = 0; i < 1024; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
  }

  ctx.strokeStyle = '#1e334f';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 1024; i += 160) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
  }

  ctx.fillStyle = '#0e1d32';
  ctx.roundRect?.(60, 120, 904, 784, 16);
  ctx.fill();
  ctx.strokeStyle = '#253e60';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#07101c';
  for (let x = 100; x <= 924; x += 40) {
    for (let y = 160; y <= 864; y += 40) {
      ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('SMART MICROGRID TEST FIXTURE #01', 90, 155);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createSolarPanelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#14274e';
  ctx.fillRect(0, 0, 1024, 1024);

  const cellW = 490, cellH = 240, gap = 14;
  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 4; row++) {
      const cx = 15 + col * (cellW + gap);
      const cy = 15 + row * (cellH + gap);

      ctx.fillStyle = '#102244';
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy); ctx.lineTo(cx + cellW - 20, cy);
      ctx.lineTo(cx + cellW, cy + 20); ctx.lineTo(cx + cellW, cy + cellH - 20);
      ctx.lineTo(cx + cellW - 20, cy + cellH); ctx.lineTo(cx + 20, cy + cellH);
      ctx.lineTo(cx, cy + cellH - 20); ctx.lineTo(cx, cy + 20);
      ctx.closePath(); ctx.fill();

      const grad = ctx.createLinearGradient(cx, cy, cx + cellW, cy + cellH);
      grad.addColorStop(0, 'rgba(56,189,248,0.08)');
      grad.addColorStop(1, 'rgba(3,10,25,0.4)');
      ctx.fillStyle = grad; ctx.fill();

      ctx.strokeStyle = 'rgba(226,232,240,0.35)';
      ctx.lineWidth = 1;
      for (let y = cy + 12; y < cy + cellH - 10; y += 14) {
        ctx.beginPath(); ctx.moveTo(cx + 8, y); ctx.lineTo(cx + cellW - 8, y); ctx.stroke();
      }

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(cx + cellW * 0.33 - 3, cy + 4, 6, cellH - 8);
      ctx.fillRect(cx + cellW * 0.67 - 3, cy + 4, 6, cellH - 8);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

function createEsp32PcbTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, 512, 1024);

  ctx.strokeStyle = '#2d2212'; ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(80 + (i % 5) * 60, 400 + i * 20);
    ctx.lineTo(120 + (i % 4) * 70, 500 + i * 20);
    ctx.lineTo(40 + (i % 6) * 70, 700 + i * 15);
    ctx.stroke();
  }

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('ESP32 DEVKIT V1', 130, 440);
  ctx.font = '14px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('ESP-WROOM-32 CHIP', 160, 470);
  ctx.fillText('Wi-Fi + BLUETOOTH', 165, 495);

  const leftPins = ['3V3','GND','D15','D2','D4','RX2','TX2','D5','D18','D19','D21','RX0','TX0','D22','D23'];
  ctx.font = 'bold 15px monospace'; ctx.fillStyle = '#f8fafc';
  leftPins.forEach((pin, i) => {
    const y = 200 + i * 52;
    ctx.fillText(pin, 48, y);
    ctx.fillStyle = '#d97706';
    ctx.beginPath(); ctx.arc(24, y - 4, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0d14';
    ctx.beginPath(); ctx.arc(24, y - 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f8fafc';
  });

  const rightPins = ['VIN','GND','D13','D12','D14','D27','D26','D25','D33','D32','D35','D34','VN','VP','EN'];
  rightPins.forEach((pin, i) => {
    const y = 200 + i * 52;
    ctx.fillText(pin, 400, y);
    ctx.fillStyle = '#d97706';
    ctx.beginPath(); ctx.arc(488, y - 4, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0d14';
    ctx.beginPath(); ctx.arc(488, y - 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f8fafc';
  });

  ctx.fillStyle = '#38bdf8'; ctx.fillText('◄ SDA', 100, 720); ctx.fillText('◄ SCL', 340, 512);
  ctx.fillStyle = '#14b8a6'; ctx.fillText('◄ RELAY', 315, 564);

  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
  ctx.strokeRect(180, 890, 152, 90);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px monospace';
  ctx.fillText('USB UART', 205, 945);

  return new THREE.CanvasTexture(canvas);
}

function createEspShieldTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#d1d5db'; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  for (let i = 0; i < 512; i += 4) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
  }

  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 38px sans-serif'; ctx.fillText('ESPRESSIF', 140, 120);
  ctx.font = 'bold 32px monospace'; ctx.fillText('ESP-WROOM-32', 125, 180);
  ctx.font = '20px monospace';
  ctx.fillText('FCC ID: 2AC7Z-ESPWROOM32', 100, 240);
  ctx.fillText('IC: 21098-ESPWROOM32', 130, 280);
  ctx.fillText('CE 0700   RoHS', 160, 330);

  ctx.fillStyle = '#111827'; ctx.fillRect(360, 360, 100, 100);
  ctx.fillStyle = '#d1d5db';
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if ((r + c) % 2 === 0) ctx.fillRect(365 + c * 18, 365 + r * 18, 16, 16);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

function createInaPcbTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#581c87'; ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 36px monospace'; ctx.fillText('INA219', 180, 120);
  ctx.font = 'bold 22px monospace';
  ctx.fillText('Zerø-Drift Bi-dir', 130, 160);
  ctx.fillText('I2C Power Monitor', 135, 195);
  ctx.font = 'bold 28px monospace'; ctx.fillText('Vin+   Vin-', 150, 450);

  const pins = ['VCC','GND','SCL','SDA'];
  pins.forEach((p, i) => ctx.fillText(p, 60 + i * 110, 60));

  ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 3;
  ctx.strokeRect(170, 260, 172, 80);
  ctx.fillText('R100 SHUNT', 178, 310);

  return new THREE.CanvasTexture(canvas);
}

function createRelayCubeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0284c7'; ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px sans-serif'; ctx.fillText('SONGLE', 145, 100);
  ctx.font = 'bold 34px monospace'; ctx.fillText('SRD-05VDC-SL-C', 105, 160);
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('10A 250VAC   10A 125VAC', 75, 230);
  ctx.fillText('10A 30VDC    10A 28VDC', 85, 280);

  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(160, 380, 20, 0, Math.PI * 2); ctx.stroke();
  ctx.moveTo(300, 360); ctx.lineTo(340, 360); ctx.lineTo(380, 340); ctx.stroke();
  ctx.font = 'bold 22px monospace'; ctx.fillText('NO  COM  NC', 180, 460);

  return new THREE.CanvasTexture(canvas);
}

// =========================================================================
// MAIN 3D HARDWARE VIEWER COMPONENT
// =========================================================================

export const Hardware3DViewer = ({ latest }) => {
  const containerRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const lcdCanvasRef = useRef(null);
  const lcdTextureRef = useRef(null);

  const filamentMeshRef = useRef(null);
  const bulbLightRef = useRef(null);
  const relayLedRef = useRef(null);
  const relayArmRef = useRef(null);
  const loadWireMeshRef = useRef(null);
  const highlightedGroupRef = useRef(null);
  const interactiveObjectsRef = useRef({});

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 370;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07111f);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 6.4);
    camera.lookAt(0, 0.25, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.25, 0);
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 3.2;
    controls.maxDistance = 11;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    rimLight.position.set(-6, 6, -5);
    scene.add(rimLight);

    const solarSun = new THREE.DirectionalLight(0xfff7ed, 0.8);
    solarSun.position.set(-8, 9, 3);
    scene.add(solarSun);

    const benchMatTexture = createWorkbenchTexture();
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(13.6, 0.25, 7.6),
      new THREE.MeshStandardMaterial({ map: benchMatTexture, roughness: 0.6, metalness: 0.15 })
    );
    bench.position.y = -0.125;
    bench.receiveShadow = true;
    scene.add(bench);

    const mtlSolder = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.9, roughness: 0.2 });
    const mtlBrass = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.3 });
    const mtlBlackPlastic = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const mtlTerminalGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45 });

    const addHexStandoffs = (parent, w, d) => {
      const standoffGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.14, 6);
      const screwGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12);
      const halfW = w / 2 - 0.14, halfD = d / 2 - 0.14;
      [[-halfW, halfD],[halfW, halfD],[-halfW, -halfD],[halfW, -halfD]].forEach(([cx, cz]) => {
        const standoff = new THREE.Mesh(standoffGeo, mtlBrass);
        standoff.position.set(cx, -0.07, cz);
        const screw = new THREE.Mesh(screwGeo, mtlSolder);
        screw.position.set(cx, 0.045, cz);
        parent.add(standoff, screw);
      });
    };

    const interactiveMap = {};

    // 1. SOLAR PV PANEL
    const solarGroup = new THREE.Group();
    solarGroup.position.set(-4.3, 0.38, 0.2);
    solarGroup.rotation.x = -Math.PI / 7.5;
    solarGroup.name = 'solar_pv';

    const alFrameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
    const alFrame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.14, 3.5), alFrameMat);
    alFrame.castShadow = true;
    solarGroup.add(alFrame);

    const cellsMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.32, 0.04, 3.32),
      new THREE.MeshStandardMaterial({ map: createSolarPanelTexture(), roughness: 0.15, metalness: 0.4 })
    );
    cellsMesh.position.y = 0.06;
    solarGroup.add(cellsMesh);

    const jBox = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.25, 0.6), mtlBlackPlastic);
    jBox.position.set(0, -0.15, 0);
    solarGroup.add(jBox);

    const standLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3), alFrameMat);
    standLegL.position.set(-0.9, -0.4, -0.6);
    standLegL.rotation.x = Math.PI / 4;
    const standLegR = standLegL.clone();
    standLegR.position.x = 0.9;
    solarGroup.add(standLegL, standLegR);
    scene.add(solarGroup);
    interactiveMap['solar_pv'] = solarGroup;

    // 2. INA219
    const inaGroup = new THREE.Group();
    inaGroup.position.set(-2.1, 0.2, 0.4);
    inaGroup.name = 'ina219_sensor';

    const inaPcb = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.08, 1.8),
      new THREE.MeshStandardMaterial({ map: createInaPcbTexture(), roughness: 0.5 })
    );
    inaPcb.castShadow = true;
    inaGroup.add(inaPcb);
    addHexStandoffs(inaGroup, 1.4, 1.8);

    const inaTerm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.52, 0.55), mtlTerminalGreen);
    inaTerm.position.set(0, 0.28, 0.55);
    inaGroup.add(inaTerm);

    [-0.22, 0.22].forEach((sx) => {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), mtlSolder);
      screw.position.set(sx, 0.55, 0.55);
      inaGroup.add(screw);
    });

    const shuntBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.22), new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3 }));
    shuntBody.position.set(0, 0.08, -0.15);
    inaGroup.add(shuntBody);

    const icChip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.3), mtlBlackPlastic);
    icChip.position.set(0, 0.07, 0.15);
    inaGroup.add(icChip);

    const inaHeader = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.16), mtlBlackPlastic);
    inaHeader.position.set(0, 0.14, -0.75);
    inaGroup.add(inaHeader);
    for (let px = -0.45; px <= 0.45; px += 0.18) {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.03), mtlBrass);
      pin.position.set(px, 0.24, -0.75);
      inaGroup.add(pin);
    }
    scene.add(inaGroup);
    interactiveMap['ina219_sensor'] = inaGroup;

    // 3. ESP32 DevKit
    const espGroup = new THREE.Group();
    espGroup.position.set(0.0, 0.2, 0.4);
    espGroup.name = 'esp32_devkit';

    const espPcb = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.08, 4.2),
      new THREE.MeshStandardMaterial({ map: createEsp32PcbTexture(), roughness: 0.65 })
    );
    espPcb.castShadow = true;
    espGroup.add(espPcb);
    addHexStandoffs(espGroup, 2.4, 4.2);

    const espShield = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.18, 1.9),
      new THREE.MeshStandardMaterial({ map: createEspShieldTexture(), metalness: 0.85, roughness: 0.2 })
    );
    espShield.position.set(0, 0.12, -0.65);
    espShield.castShadow = true;
    espGroup.add(espShield);

    const antennaTrace = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.45), new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.75, roughness: 0.25 }));
    antennaTrace.position.set(0, 0.05, -1.8);
    espGroup.add(antennaTrace);

    const usbShell = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.24, 0.55), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 }));
    usbShell.position.set(0, 0.14, 2.05);
    espGroup.add(usbShell);

    const vReg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.4), mtlBlackPlastic);
    vReg.position.set(-0.6, 0.09, 1.1);
    const vRegTab = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.15), mtlSolder);
    vRegTab.position.set(-0.6, 0.06, 1.35);
    espGroup.add(vReg, vRegTab);

    [-0.65, 0.65].forEach((bx) => {
      const btnBase = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.25), mtlBlackPlastic);
      btnBase.position.set(bx, 0.08, 1.85);
      const btnCap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12), mtlSolder);
      btnCap.position.set(bx, 0.15, 1.85);
      espGroup.add(btnBase, btnCap);
    });

    const leftHeader = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.38, 3.8), mtlBlackPlastic);
    leftHeader.position.set(-1.1, 0.2, 0);
    const rightHeader = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.38, 3.8), mtlBlackPlastic);
    rightHeader.position.set(1.1, 0.2, 0);
    espGroup.add(leftHeader, rightHeader);

    const pwrLed = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.07), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    pwrLed.position.set(0.5, 0.06, 1.4);
    const wifiLed = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.07), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    wifiLed.position.set(-0.5, 0.06, 1.4);
    espGroup.add(pwrLed, wifiLed);
    scene.add(espGroup);
    interactiveMap['esp32_devkit'] = espGroup;

    // 4. RELAY MODULE
    const relayGroup = new THREE.Group();
    relayGroup.position.set(2.3, 0.2, 0.4);
    relayGroup.name = 'relay_module';

    const rPcb = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 2.9), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }));
    rPcb.castShadow = true;
    relayGroup.add(rPcb);
    addHexStandoffs(relayGroup, 1.9, 2.9);

    const rCube = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.95, 1.65),
      new THREE.MeshStandardMaterial({ map: createRelayCubeTexture(), roughness: 0.35 })
    );
    rCube.position.set(0, 0.5, 0.15);
    rCube.castShadow = true;
    relayGroup.add(rCube);

    const rTerm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.52, 0.55), mtlTerminalGreen);
    rTerm.position.set(0, 0.28, 1.15);
    relayGroup.add(rTerm);

    [-0.45, 0, 0.45].forEach((sx) => {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), mtlSolder);
      screw.position.set(sx, 0.55, 1.15);
      relayGroup.add(screw);
    });

    const opto = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.35), mtlBlackPlastic);
    opto.position.set(0.6, 0.08, -0.6);
    relayGroup.add(opto);

    const rArm = new THREE.Group();
    rArm.position.set(0, 1.05, 0.15);
    const rArmBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.55), mtlBrass);
    rArmBar.position.z = 0.28;
    rArm.add(rArmBar);
    relayGroup.add(rArm);
    relayArmRef.current = rArm;

    const rLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.3 })
    );
    rLed.position.set(-0.6, 0.14, -0.95);
    relayGroup.add(rLed);
    relayLedRef.current = rLed;
    scene.add(relayGroup);
    interactiveMap['relay_module'] = relayGroup;

    // 5. DC LOAD (BULB)
    const loadGroup = new THREE.Group();
    loadGroup.position.set(4.4, 0.2, 0.4);
    loadGroup.name = 'dc_load';

    const fixtureBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 0.4, 24), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.35 }));
    fixtureBase.position.y = 0.2;
    fixtureBase.castShadow = true;
    loadGroup.add(fixtureBase);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.3 }));
    collar.position.y = 0.48;
    loadGroup.add(collar);

    const bulbGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 28, 28),
      new THREE.MeshPhysicalMaterial({ color: 0xfef08a, transmission: 0.88, opacity: 0.9, transparent: true, roughness: 0.08, reflectivity: 0.8 })
    );
    bulbGlass.position.y = 0.88;
    loadGroup.add(bulbGlass);

    const filament = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.03, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 2.0 })
    );
    filament.position.y = 0.88;
    filament.rotation.x = Math.PI / 2;
    loadGroup.add(filament);
    filamentMeshRef.current = filament;

    const loadLight = new THREE.PointLight(0xfef08a, 2.2, 5.5);
    loadLight.position.set(4.4, 1.1, 0.4);
    scene.add(loadLight);
    bulbLightRef.current = loadLight;
    scene.add(loadGroup);
    interactiveMap['dc_load'] = loadGroup;

    // 6. LCD DISPLAY
    const lcdGroup = new THREE.Group();
    lcdGroup.position.set(0.0, 0.42, -2.1);
    lcdGroup.rotation.x = -Math.PI / 10;
    lcdGroup.name = 'lcd_display';

    const lcdPcb = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.09, 2.3), new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.55 }));
    lcdPcb.castShadow = true;
    lcdGroup.add(lcdPcb);
    addHexStandoffs(lcdGroup, 4.7, 2.3);

    const lcdBezel = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.18, 1.7), new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.6, roughness: 0.35 }));
    lcdBezel.position.y = 0.1;
    lcdGroup.add(lcdBezel);

    const lcdCanvas = document.createElement('canvas');
    lcdCanvas.width = 512; lcdCanvas.height = 160;
    lcdCanvasRef.current = lcdCanvas;

    const lcdTexture = new THREE.CanvasTexture(lcdCanvas);
    lcdTextureRef.current = lcdTexture;

    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 1.35), new THREE.MeshBasicMaterial({ map: lcdTexture }));
    screenMesh.position.set(0, 0.2, 0);
    screenMesh.rotation.x = -Math.PI / 2;
    lcdGroup.add(screenMesh);
    scene.add(lcdGroup);
    interactiveMap['lcd_display'] = lcdGroup;

    interactiveObjectsRef.current = interactiveMap;

    // 7. WIRING
    const createRoutedWireWithBoots = (pts, color) => {
      const group = new THREE.Group();
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.034, 8, false);
      const wireMesh = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.38 }));
      group.add(wireMesh);
      const bootGeo = new THREE.BoxGeometry(0.09, 0.24, 0.09);
      const startBoot = new THREE.Mesh(bootGeo, mtlBlackPlastic);
      startBoot.position.copy(pts[0]);
      const endBoot = new THREE.Mesh(bootGeo, mtlBlackPlastic);
      endBoot.position.copy(pts[pts.length - 1]);
      group.add(startBoot, endBoot);
      scene.add(group);
      return wireMesh;
    };

    createRoutedWireWithBoots([new THREE.Vector3(-3.1,0.28,0.1), new THREE.Vector3(-2.65,0.35,0.25), new THREE.Vector3(-2.15,0.32,0.45)], 0xef4444);
    createRoutedWireWithBoots([new THREE.Vector3(-3.1,0.28,-0.1), new THREE.Vector3(-2.65,0.3,0.1), new THREE.Vector3(-1.95,0.32,0.45)], 0x1e293b);
    createRoutedWireWithBoots([new THREE.Vector3(-1.5,0.25,0.4), new THREE.Vector3(-1.05,0.38,0.3), new THREE.Vector3(-0.8,0.28,0.2)], 0x38bdf8);
    createRoutedWireWithBoots([new THREE.Vector3(-1.5,0.25,0.2), new THREE.Vector3(-1.05,0.34,0.1), new THREE.Vector3(-0.8,0.28,0.4)], 0xf59e0b);
    createRoutedWireWithBoots([new THREE.Vector3(0.8,0.28,0.3), new THREE.Vector3(1.45,0.42,0.3), new THREE.Vector3(1.95,0.28,0.3)], 0x14b8a6);

    const loadWireCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(2.7,0.3,0.7), new THREE.Vector3(3.55,0.4,0.5), new THREE.Vector3(4.1,0.28,0.4)]);
    const loadWireMesh = new THREE.Mesh(new THREE.TubeGeometry(loadWireCurve, 28, 0.038, 8, false), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 }));
    scene.add(loadWireMesh);
    loadWireMeshRef.current = loadWireMesh;

    // Raycast Click Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const targetMeshes = [];
      Object.values(interactiveObjectsRef.current).forEach((grp) => {
        grp.traverse((child) => { if (child.isMesh) targetMeshes.push(child); });
      });

      const intersects = raycaster.intersectObjects(targetMeshes, false);
      if (intersects.length > 0) {
        let hitObj = intersects[0].object;
        while (hitObj && hitObj.parent && hitObj.parent !== scene) {
          if (hitObj.name && interactiveObjectsRef.current[hitObj.name]) break;
          hitObj = hitObj.parent;
        }
        if (hitObj?.name) {
          if (highlightedGroupRef.current) highlightedGroupRef.current.position.y -= 0.08;
          const targetGrp = interactiveObjectsRef.current[hitObj.name];
          if (targetGrp) { targetGrp.position.y += 0.08; highlightedGroupRef.current = targetGrp; }
          showComponentDetails(hitObj.name);
        }
      }
    };

    renderer.domElement.addEventListener('click', handlePointerDown);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const newW = containerRef.current.clientWidth;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newW, height);
    };
    window.addEventListener('resize', handleResize);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 0.6;
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handlePointerDown);
      cancelAnimationFrame(animId);
      if (rendererRef.current?.domElement) {
        rendererRef.current.domElement.remove();
        rendererRef.current.dispose();
      }
    };
  }, [autoRotate]);

  const showComponentDetails = (id) => {
    switch (id) {
      case 'solar_pv':
        setActiveComponent({ name: 'Solar PV Panel (6V, 3W)', func: 'Renewable DC power generator for monitored microgrid branch.', conn: 'Bus output connected to INA219 Vin+ and Ground', state: `${latest.voltage.toFixed(2)} V output` });
        break;
      case 'ina219_sensor':
        setActiveComponent({ name: 'INA219 Power Monitor', func: '12-bit digital sensor measuring bus voltage and shunt current over I2C.', conn: 'I2C Bus: SDA (GPIO 21), SCL (GPIO 22)', state: `V: ${latest.voltage.toFixed(2)} V | I: ${latest.current.toFixed(2)} A` });
        break;
      case 'esp32_devkit':
        setActiveComponent({ name: 'ESP32 DevKit V1', func: 'Edge controller executing fault detection and relay drive.', conn: 'GPIO 21/22 (I2C), GPIO 26 (Relay Control)', state: `Power: ${latest.power.toFixed(2)} W | Status: ${latest.faultStatus}` });
        break;
      case 'relay_module':
        setActiveComponent({ name: '5V Load Isolation Relay', func: 'Electromechanical switch isolating DC load upon abnormal condition.', conn: 'Signal: GPIO 26 | Load: COM & NC terminals', state: latest.relayState === 'CONNECTED' ? 'CLOSED (Normal Path)' : 'OPEN (Tripped / Isolated)' });
        break;
      case 'dc_load':
        setActiveComponent({ name: '5V DC Load (LED Lamp)', func: 'Electrical load receiving regulated solar branch power.', conn: 'Connected through 5V Relay isolation contacts', state: latest.relayState === 'CONNECTED' ? 'Active (5V Powered)' : 'Isolated (0V Cutoff)' });
        break;
      case 'lcd_display':
        setActiveComponent({ name: '16×2 Character LCD (HD44780)', func: 'Local display for voltage, current, power, and state.', conn: 'I2C Backpack: GPIO 21 / GPIO 22', state: `V:${latest.voltage.toFixed(2)}V I:${latest.current.toFixed(2)}A` });
        break;
      default:
        setActiveComponent(null);
    }
  };

  useEffect(() => {
    if (lcdCanvasRef.current && lcdTextureRef.current) {
      const ctx = lcdCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#061408'; ctx.fillRect(0, 0, 512, 160);
        ctx.fillStyle = '#22c55e'; ctx.font = 'bold 42px monospace';
        ctx.fillText(`V:${latest.voltage.toFixed(2)}V I:${latest.current.toFixed(2)}A`, 24, 60);
        ctx.fillText(`P:${latest.power.toFixed(2)}W ${latest.faultStatus === 'NORMAL' ? 'STAT: NORMAL' : 'TRIP: FAULT'}`, 24, 124);
        lcdTextureRef.current.needsUpdate = true;
      }
    }

    const isConnected = latest.relayState === 'CONNECTED';

    if (relayArmRef.current) relayArmRef.current.rotation.x = isConnected ? 0 : -Math.PI / 4;

    if (relayLedRef.current) {
      const mat = relayLedRef.current.material;
      mat.color.setHex(isConnected ? 0x22c55e : 0xef4444);
      mat.emissive.setHex(isConnected ? 0x22c55e : 0xef4444);
    }

    if (filamentMeshRef.current && bulbLightRef.current) {
      const filMat = filamentMeshRef.current.material;
      if (isConnected) {
        filMat.color.setHex(0xfef08a);
        filMat.emissive.setHex(0xfef08a);
        filMat.emissiveIntensity = 2.0;
        bulbLightRef.current.intensity = 2.2;
      } else {
        filMat.color.setHex(0x334155);
        filMat.emissive.setHex(0x000000);
        filMat.emissiveIntensity = 0;
        bulbLightRef.current.intensity = 0;
      }
    }

    if (loadWireMeshRef.current) {
      loadWireMeshRef.current.material.color.setHex(isConnected ? 0xf59e0b : 0x1e293b);
    }
  }, [latest]);

  return (
    <div className="bg-[#111f33] border border-[#1e2e48] rounded-lg p-4 relative">
      <div className="flex items-center justify-between pb-2 border-b border-[#1e2e48]">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Interactive Hardware Model</h2>
          <p className="text-xs text-slate-400 mt-0.5">Engineering prototype setup (PV ➔ INA219 ➔ ESP32 ➔ Relay ➔ Load)</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
              autoRotate ? 'bg-[#1e2e48] text-[#38bdf8] border-[#38bdf8]' : 'bg-[#18283f] text-slate-300 border-[#1e2e48] hover:bg-[#1e2e48]'
            }`}
          >
            <RotateCw className="w-3 h-3" /><span>Turntable</span>
          </button>
          <div className="hidden sm:flex items-center gap-1 text-slate-400 text-[11px] bg-[#0a1424] px-2 py-1 rounded border border-[#1e2e48]">
            <ZoomIn className="w-3 h-3" /><span>Click to Inspect • Drag to Rotate</span>
          </div>
        </div>
      </div>

      <div className="relative mt-3">
        <div ref={containerRef} className="w-full h-[370px] rounded cursor-grab active:cursor-grabbing bg-[#07111f] border border-[#1e2e48]" />

        {activeComponent && (
          <div className="absolute top-4 left-4 max-w-xs w-full bg-[#0a1424]/95 border border-[#1e2e48] rounded-lg p-3 shadow-xl backdrop-blur text-xs z-10">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1e2e48]">
              <span className="font-semibold text-[#38bdf8]">{activeComponent.name}</span>
              <button
                onClick={() => {
                  if (highlightedGroupRef.current) { highlightedGroupRef.current.position.y -= 0.08; highlightedGroupRef.current = null; }
                  setActiveComponent(null);
                }}
                className="p-1 rounded hover:bg-[#1e2e48] text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2 space-y-1.5 text-[11px]">
              <div><span className="text-slate-400">Function: </span><span className="text-slate-200">{activeComponent.func}</span></div>
              <div><span className="text-slate-400">Connection: </span><span className="text-[#14b8a6] font-mono">{activeComponent.conn}</span></div>
              <div className="pt-1 border-t border-[#1e2e48]"><span className="text-slate-400">Current State: </span><span className="font-mono text-[#f59e0b] font-semibold">{activeComponent.state}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
