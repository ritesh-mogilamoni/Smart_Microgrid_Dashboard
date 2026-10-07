import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { LatestState } from '../types/microgrid';
import { RotateCw, ZoomIn, X } from 'lucide-react';

interface ComponentInfo {
  name: string;
  func: string;
  conn: string;
  state: string;
}

interface Hardware3DViewerProps {
  latest: LatestState;
}

export const Hardware3DViewer: React.FC<Hardware3DViewerProps> = ({ latest }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [activeComponent, setActiveComponent] = useState<ComponentInfo | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const lcdCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lcdTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const relayArmRef = useRef<THREE.Group | null>(null);
  const relayLedRef = useRef<THREE.Mesh | null>(null);
  const loadBulbRef = useRef<THREE.Mesh | null>(null);
  const loadLightRef = useRef<THREE.PointLight | null>(null);
  const loadWireRef = useRef<THREE.Mesh | null>(null);

  const interactiveObjectsRef = useRef<{ [key: string]: THREE.Object3D }>({});

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 360; // Clean, slightly shorter height

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07111f);

    // 2. Camera: Isometric view
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 6.8);
    camera.lookAt(0, 0.2, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.2, 0);
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 3.5;
    controls.maxDistance = 12;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(6, 12, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
    fillLight.position.set(-6, 5, -4);
    scene.add(fillLight);

    // 6. Workbench Surface
    const benchGeo = new THREE.BoxGeometry(13.5, 0.3, 7.5);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x0f1c2e,
      roughness: 0.5,
      metalness: 0.2,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.y = -0.15;
    bench.receiveShadow = true;
    scene.add(bench);

    const grid = new THREE.GridHelper(13, 22, 0x1e2e48, 0x142033);
    grid.position.y = 0.01;
    scene.add(grid);

    const interactiveMap: { [key: string]: THREE.Object3D } = {};

    // 1. SOLAR PV PANEL (Left)
    const solarGroup = new THREE.Group();
    solarGroup.position.set(-4.2, 0.3, 0.2);
    solarGroup.rotation.x = -Math.PI / 7;
    solarGroup.name = 'solar_pv';

    const sFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.12, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
    );
    sFrame.castShadow = true;
    solarGroup.add(sFrame);

    const pvCells = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.05, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x172554, roughness: 0.2, metalness: 0.5 })
    );
    pvCells.position.y = 0.05;
    solarGroup.add(pvCells);

    for (let x = -0.75; x <= 0.75; x += 0.5) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.02, 3.1),
        new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
      );
      line.position.set(x, 0.08, 0);
      solarGroup.add(line);
    }
    scene.add(solarGroup);
    interactiveMap['solar_pv'] = solarGroup;

    // 2. INA219 SENSOR
    const inaGroup = new THREE.Group();
    inaGroup.position.set(-2.0, 0.15, 0.4);
    inaGroup.name = 'ina219_sensor';

    const inaPcb = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.08, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.5 })
    );
    inaPcb.castShadow = true;
    inaGroup.add(inaPcb);

    const inaTerm = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.4 })
    );
    inaTerm.position.set(0, 0.26, 0.55);
    inaGroup.add(inaTerm);

    const shunt = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.08, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.2 })
    );
    shunt.position.set(0, 0.08, -0.2);
    inaGroup.add(shunt);

    scene.add(inaGroup);
    interactiveMap['ina219_sensor'] = inaGroup;

    // 3. ESP32 DevKit V1 (Center)
    const espGroup = new THREE.Group();
    espGroup.position.set(0, 0.2, 0.4);
    espGroup.name = 'esp32_devkit';

    const espPcb = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.08, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.7 })
    );
    espPcb.castShadow = true;
    espGroup.add(espPcb);

    const rfShield = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.16, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.9, roughness: 0.15 })
    );
    rfShield.position.set(0, 0.11, -0.7);
    espGroup.add(rfShield);

    const antenna = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.04, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.6, roughness: 0.3 })
    );
    antenna.position.set(0, 0.05, -1.75);
    espGroup.add(antenna);

    const headerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const hLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 3.6), headerMat);
    hLeft.position.set(-1.05, 0.18, 0);
    const hRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 3.6), headerMat);
    hRight.position.set(1.05, 0.18, 0);
    espGroup.add(hLeft, hRight);

    const redLed = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    redLed.position.set(0.5, 0.1, 1.4);
    const blueLed = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    blueLed.position.set(-0.5, 0.1, 1.4);
    espGroup.add(redLed, blueLed);

    scene.add(espGroup);
    interactiveMap['esp32_devkit'] = espGroup;

    // 4. 5V RELAY MODULE
    const relayGroup = new THREE.Group();
    relayGroup.position.set(2.3, 0.16, 0.4);
    relayGroup.name = 'relay_module';

    const rPcb = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.08, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 })
    );
    rPcb.castShadow = true;
    relayGroup.add(rPcb);

    const rCube = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.9, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3 })
    );
    rCube.position.set(0, 0.48, 0.15);
    rCube.castShadow = true;
    relayGroup.add(rCube);

    const rTerm = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x166534 })
    );
    rTerm.position.set(0, 0.28, 1.1);
    relayGroup.add(rTerm);

    const contactArmGroup = new THREE.Group();
    contactArmGroup.position.set(0, 1.0, 0.15);
    const contactBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
    );
    contactBar.position.z = 0.3;
    contactArmGroup.add(contactBar);
    relayGroup.add(contactArmGroup);
    relayArmRef.current = contactArmGroup;

    const rLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.2 })
    );
    rLed.position.set(-0.55, 0.15, -0.9);
    relayGroup.add(rLed);
    relayLedRef.current = rLed;

    scene.add(relayGroup);
    interactiveMap['relay_module'] = relayGroup;

    // 5. 5V DC LOAD
    const loadGroup = new THREE.Group();
    loadGroup.position.set(4.3, 0.2, 0.4);
    loadGroup.name = 'dc_load';

    const socket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })
    );
    socket.position.y = 0.2;
    loadGroup.add(socket);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfef08a,
        emissiveIntensity: 1.0,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85,
      })
    );
    bulb.position.y = 0.75;
    loadGroup.add(bulb);
    loadBulbRef.current = bulb;

    const loadLight = new THREE.PointLight(0xfef08a, 2.0, 5);
    loadLight.position.set(4.3, 1.0, 0.4);
    scene.add(loadLight);
    loadLightRef.current = loadLight;

    scene.add(loadGroup);
    interactiveMap['dc_load'] = loadGroup;

    // 6. 16x2 LCD DISPLAY (Top Center)
    const lcdGroup = new THREE.Group();
    lcdGroup.position.set(0, 0.4, -2.1);
    lcdGroup.rotation.x = -Math.PI / 10;
    lcdGroup.name = 'lcd_display';

    const lcdPcb = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.1, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 })
    );
    lcdPcb.castShadow = true;
    lcdGroup.add(lcdPcb);

    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.18, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.4 })
    );
    bezel.position.y = 0.1;
    lcdGroup.add(bezel);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    lcdCanvasRef.current = canvas;

    const lcdTexture = new THREE.CanvasTexture(canvas);
    lcdTextureRef.current = lcdTexture;

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.3),
      new THREE.MeshBasicMaterial({ map: lcdTexture })
    );
    screenMesh.position.set(0, 0.2, 0);
    screenMesh.rotation.x = -Math.PI / 2;
    lcdGroup.add(screenMesh);

    scene.add(lcdGroup);
    interactiveMap['lcd_display'] = lcdGroup;

    interactiveObjectsRef.current = interactiveMap;

    // 7. WIRING
    const buildWire = (points: THREE.Vector3[], color: number) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.035, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
      return new THREE.Mesh(tubeGeo, tubeMat);
    };

    scene.add(buildWire([
      new THREE.Vector3(-3.1, 0.25, 0.1),
      new THREE.Vector3(-2.7, 0.45, 0.3),
      new THREE.Vector3(-2.1, 0.35, 0.45),
    ], 0xef4444)); // Red
    scene.add(buildWire([
      new THREE.Vector3(-3.1, 0.25, -0.1),
      new THREE.Vector3(-2.7, 0.4, 0.1),
      new THREE.Vector3(-1.9, 0.35, 0.45),
    ], 0x1e293b)); // Black

    scene.add(buildWire([
      new THREE.Vector3(-1.5, 0.2, 0.4),
      new THREE.Vector3(-1.1, 0.45, 0.3),
      new THREE.Vector3(-0.8, 0.3, 0.2),
    ], 0x38bdf8)); // Cyan SDA

    scene.add(buildWire([
      new THREE.Vector3(0.8, 0.3, 0.3),
      new THREE.Vector3(1.4, 0.5, 0.3),
      new THREE.Vector3(1.9, 0.25, 0.3),
    ], 0x14b8a6)); // Teal signal

    const loadWireCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.7, 0.3, 0.7),
      new THREE.Vector3(3.5, 0.45, 0.5),
      new THREE.Vector3(4.0, 0.28, 0.4),
    ]);
    const loadWireMesh = new THREE.Mesh(
      new THREE.TubeGeometry(loadWireCurve, 24, 0.04, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
    );
    scene.add(loadWireMesh);
    loadWireRef.current = loadWireMesh;

    // Raycast click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const targetMeshes: THREE.Object3D[] = [];
      Object.values(interactiveObjectsRef.current).forEach((grp) => {
        grp.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            targetMeshes.push(child);
          }
        });
      });

      const intersects = raycaster.intersectObjects(targetMeshes, false);
      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && hitObj.parent && hitObj.parent !== scene) {
          if (hitObj.name && interactiveObjectsRef.current[hitObj.name]) {
            break;
          }
          hitObj = hitObj.parent;
        }

        if (hitObj?.name) {
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

    let animId: number;
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

  const showComponentDetails = (id: string) => {
    switch (id) {
      case 'solar_pv':
        setActiveComponent({
          name: 'Solar PV Panel (6V, 3W)',
          func: 'Renewable DC power generator for monitored microgrid branch.',
          conn: 'Bus output connected to INA219 Vin+ and Ground',
          state: `${latest.voltage.toFixed(2)} V output`,
        });
        break;
      case 'ina219_sensor':
        setActiveComponent({
          name: 'INA219 Power Monitor',
          func: '12-bit digital sensor for bus voltage and shunt current.',
          conn: 'I2C Bus: SDA (GPIO 21), SCL (GPIO 22)',
          state: `V: ${latest.voltage.toFixed(2)} V | I: ${latest.current.toFixed(2)} A`,
        });
        break;
      case 'esp32_devkit':
        setActiveComponent({
          name: 'ESP32 DevKit V1',
          func: 'Edge controller executing Eq. 2 fault detection and relay drive.',
          conn: 'GPIO 21/22 (I2C), GPIO 26 (Relay Control)',
          state: `Power: ${latest.power.toFixed(2)} W | Status: ${latest.faultStatus}`,
        });
        break;
      case 'relay_module':
        setActiveComponent({
          name: '5V Load Isolation Relay',
          func: 'Electromechanical switch isolating DC load upon abnormal state.',
          conn: 'Signal: GPIO 26 | Load: COM & NC terminals',
          state: latest.relayState === 'CONNECTED' ? 'CLOSED (Normal Path)' : 'OPEN (Tripped / Isolated)',
        });
        break;
      case 'dc_load':
        setActiveComponent({
          name: '5V DC Load (LED Lamp)',
          func: 'Electrical load receiving regulated solar power.',
          conn: 'Connected through 5V Relay isolation contacts',
          state: latest.relayState === 'CONNECTED' ? 'Active (5V Powered)' : 'Isolated (0V Cutoff)',
        });
        break;
      case 'lcd_display':
        setActiveComponent({
          name: '16×2 Character LCD',
          func: 'Local display for voltage, current, power, and state.',
          conn: 'I2C Backpack: GPIO 21 / GPIO 22',
          state: `V:${latest.voltage.toFixed(2)}V I:${latest.current.toFixed(2)}A`,
        });
        break;
      default:
        setActiveComponent(null);
    }
  };

  useEffect(() => {
    if (lcdCanvasRef.current && lcdTextureRef.current) {
      const ctx = lcdCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#061408';
        ctx.fillRect(0, 0, 512, 160);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 42px monospace';
        const line1 = `V:${latest.voltage.toFixed(2)}V I:${latest.current.toFixed(2)}A`;
        const line2 = `P:${latest.power.toFixed(2)}W ${latest.faultStatus === 'NORMAL' ? 'STAT: NORMAL' : 'TRIP: FAULT'}`;
        ctx.fillText(line1, 24, 60);
        ctx.fillText(line2, 24, 124);
        lcdTextureRef.current.needsUpdate = true;
      }
    }

    const isConnected = latest.relayState === 'CONNECTED';

    if (relayArmRef.current) {
      relayArmRef.current.rotation.x = isConnected ? 0 : -Math.PI / 4;
    }

    if (relayLedRef.current) {
      const mat = relayLedRef.current.material as THREE.MeshStandardMaterial;
      mat.color.setHex(isConnected ? 0x22c55e : 0xef4444);
      mat.emissive.setHex(isConnected ? 0x22c55e : 0xef4444);
    }

    if (loadBulbRef.current && loadLightRef.current) {
      const bulbMat = loadBulbRef.current.material as THREE.MeshStandardMaterial;
      if (isConnected) {
        bulbMat.color.setHex(0xfef08a);
        bulbMat.emissive.setHex(0xfef08a);
        loadLightRef.current.intensity = 2.0;
      } else {
        bulbMat.color.setHex(0x334155);
        bulbMat.emissive.setHex(0x000000);
        loadLightRef.current.intensity = 0;
      }
    }

    if (loadWireRef.current) {
      const wireMat = loadWireRef.current.material as THREE.MeshStandardMaterial;
      wireMat.color.setHex(isConnected ? 0xf59e0b : 0x1e293b);
    }
  }, [latest]);

  return (
    <div className="bg-[#111f33] border border-[#1e2e48] rounded-lg p-4 relative">
      {/* Simplified Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1e2e48]">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Interactive Hardware Model
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any component to inspect pinout and live telemetry
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
              autoRotate
                ? 'bg-[#1e2e48] text-[#38bdf8] border-[#38bdf8]'
                : 'bg-[#18283f] text-slate-300 border-[#1e2e48] hover:bg-[#1e2e48]'
            }`}
          >
            <RotateCw className="w-3 h-3" />
            <span>Turntable</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 text-slate-400 text-[11px] bg-[#0a1424] px-2 py-1 rounded border border-[#1e2e48]">
            <ZoomIn className="w-3 h-3" />
            <span>Click & Drag to Rotate</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative mt-3">
        <div
          ref={containerRef}
          className="w-full h-[360px] rounded cursor-grab active:cursor-grabbing bg-[#07111f] border border-[#1e2e48]"
        />

        {/* Smaller, focused info popup */}
        {activeComponent && (
          <div className="absolute top-4 left-4 max-w-xs w-full bg-[#0a1424]/95 border border-[#1e2e48] rounded-lg p-3 shadow-xl backdrop-blur text-xs z-10 animate-in fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1e2e48]">
              <span className="font-semibold text-[#38bdf8]">{activeComponent.name}</span>
              <button
                onClick={() => setActiveComponent(null)}
                className="p-1 rounded hover:bg-[#1e2e48] text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-2 space-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-400">Function: </span>
                <span className="text-slate-200">{activeComponent.func}</span>
              </div>
              <div>
                <span className="text-slate-400">Connection: </span>
                <span className="text-[#14b8a6] font-mono">{activeComponent.conn}</span>
              </div>
              <div className="pt-1 border-t border-[#1e2e48]">
                <span className="text-slate-400">Current State: </span>
                <span className="font-mono text-[#f59e0b] font-semibold">{activeComponent.state}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
