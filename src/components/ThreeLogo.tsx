import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface ThreeLogoProps {
  size?: number;
  className?: string;
  interactive?: boolean;
}

export const ThreeLogo: React.FC<ThreeLogoProps> = ({
  size = 64,
  className = '',
  interactive = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0xbbf246, 0x062822, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xbbf246, 1.8);
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    // Root Group
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    // Materials
    // Teal Top Half (Pharmly Dark Green)
    const tealMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x062822,
      metalness: 0.25,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Lime Bottom Half (Pharmly Neon Accent)
    const limeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xbbf246,
      metalness: 0.15,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    });

    // Gold/Silver Divider Ring
    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
    });

    // Outer Orbit Ring Material
    const orbitMaterial = new THREE.MeshStandardMaterial({
      color: 0xbbf246,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.75,
    });

    // 1. Capsule Top (Teal dome + cylinder)
    const capTopGeo = new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const capTopMesh = new THREE.Mesh(capTopGeo, tealMaterial);
    capTopMesh.position.y = 0.55;

    const bodyTopGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.55, 32, 1, true);
    const bodyTopMesh = new THREE.Mesh(bodyTopGeo, tealMaterial);
    bodyTopMesh.position.y = 0.275;

    // 2. Capsule Bottom (Lime dome + cylinder)
    const capBottomGeo = new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
    const capBottomMesh = new THREE.Mesh(capBottomGeo, limeMaterial);
    capBottomMesh.position.y = -0.55;

    const bodyBottomGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.55, 32, 1, true);
    const bodyBottomMesh = new THREE.Mesh(bodyBottomGeo, limeMaterial);
    bodyBottomMesh.position.y = -0.275;

    // 3. Center Metallic Bevel Ring
    const centerRingGeo = new THREE.TorusGeometry(0.865, 0.04, 16, 48);
    centerRingGeo.rotateX(Math.PI / 2);
    const centerRingMesh = new THREE.Mesh(centerRingGeo, ringMaterial);

    // 4. Letter "P" / Cross Inset Emblem on front face
    const crossHGeo = new THREE.BoxGeometry(0.55, 0.14, 0.1);
    const crossVGeo = new THREE.BoxGeometry(0.14, 0.55, 0.1);
    const crossH = new THREE.Mesh(crossHGeo, ringMaterial);
    const crossV = new THREE.Mesh(crossVGeo, ringMaterial);
    crossH.position.set(0, 0.25, 0.83);
    crossV.position.set(0, 0.25, 0.83);

    // Capsule sub-group
    const capsuleGroup = new THREE.Group();
    capsuleGroup.add(capTopMesh);
    capsuleGroup.add(bodyTopMesh);
    capsuleGroup.add(capBottomMesh);
    capsuleGroup.add(bodyBottomMesh);
    capsuleGroup.add(centerRingMesh);
    capsuleGroup.add(crossH);
    capsuleGroup.add(crossV);

    // Tilt capsule slightly for iconic dynamic silhouette
    capsuleGroup.rotation.z = Math.PI / 5;
    capsuleGroup.rotation.x = Math.PI / 10;
    logoGroup.add(capsuleGroup);

    // 5. Outer Sync Orbit Rings (Three planetary rings for multi-device connectivity)
    const orbit1Geo = new THREE.TorusGeometry(1.65, 0.02, 16, 64);
    orbit1Geo.rotateX(Math.PI / 3);
    const orbit1Mesh = new THREE.Mesh(orbit1Geo, orbitMaterial);
    logoGroup.add(orbit1Mesh);

    const orbit2Geo = new THREE.TorusGeometry(1.95, 0.015, 16, 64);
    orbit2Geo.rotateY(Math.PI / 3.5);
    const orbit2Mesh = new THREE.Mesh(orbit2Geo, orbitMaterial);
    logoGroup.add(orbit2Mesh);

    // Small orbiting micro-particle sphere
    const satelliteGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const satelliteMesh = new THREE.Mesh(satelliteGeo, ringMaterial);
    logoGroup.add(satelliteMesh);

    // Contact ground shadow plane
    const shadowGeo = new THREE.PlaneGeometry(2.5, 2.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.6;
    scene.add(shadowMesh);

    // Mouse Tracking State
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    if (interactive) {
      window.addEventListener('mousemove', handlePointerMove);
    }

    // Animation Loop
    let animationFrameId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Continuous gentle rotation
      capsuleGroup.rotation.y = elapsed * 0.7;
      orbit1Mesh.rotation.z = elapsed * 0.45;
      orbit2Mesh.rotation.x = elapsed * -0.35;

      // Position satellite on orbit
      satelliteMesh.position.x = Math.cos(elapsed * 1.5) * 1.65;
      satelliteMesh.position.z = Math.sin(elapsed * 1.5) * 1.65;
      satelliteMesh.position.y = Math.sin(elapsed * 2.0) * 0.4;

      // Smooth pointer parallax damping
      targetRotY = mouseX * 0.6;
      targetRotX = -mouseY * 0.4;
      logoGroup.rotation.y += (targetRotY - logoGroup.rotation.y) * 0.08;
      logoGroup.rotation.x += (targetRotX - logoGroup.rotation.x) * 0.08;

      // Subtle breathing floating motion
      logoGroup.position.y = Math.sin(elapsed * 1.8) * 0.08;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handlePointerMove);
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // Cleanup geometries & materials
      capTopGeo.dispose();
      bodyTopGeo.dispose();
      capBottomGeo.dispose();
      bodyBottomGeo.dispose();
      centerRingGeo.dispose();
      crossHGeo.dispose();
      crossVGeo.dispose();
      orbit1Geo.dispose();
      orbit2Geo.dispose();
      satelliteGeo.dispose();
      shadowGeo.dispose();

      tealMaterial.dispose();
      limeMaterial.dispose();
      ringMaterial.dispose();
      orbitMaterial.dispose();
      shadowMat.dispose();
      renderer.dispose();
    };
  }, [size, interactive]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
    />
  );
};
