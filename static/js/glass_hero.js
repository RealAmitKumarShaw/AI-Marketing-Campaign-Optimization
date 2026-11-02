/**
 * AI Marketing Intelligence Platform — Facet "Designed in Glass"
 * Three.js 0.169.0 3D Smoked-Glass Hero Component
 * Member 4: Optimization, Recommendation & Web Dashboard
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

class SmokedGlassHero {
  constructor(canvasId = 'heroWebglCanvas', containerId = 'glassHeroContainer') {
    this.canvas = document.getElementById(canvasId);
    this.container = document.getElementById(containerId);

    if (!this.canvas || !this.container) {
      console.warn('SmokedGlassHero: Canvas or container not found.');
      return;
    }

    // Performance & Preference flags
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = window.innerWidth < 768;
    this.isIntersecting = true;
    this.animationFrameId = null;

    // Interaction State
    this.mouse = new THREE.Vector2(0, 0);
    this.mouseNDC = new THREE.Vector2(-999, -999);
    this.targetClusterRotation = new THREE.Vector2(0, 0);
    this.currentClusterRotation = new THREE.Vector2(0, 0);
    this.hoveredShard = null;
    this.isShattered = false;
    this.shatterProgress = 0; // 0 = assembled, 1 = shattered
    this.shatterTarget = 0;

    // Clock
    this.clock = new THREE.Clock();

    // Init
    this.initScene();
    this.initLights();
    this.initGlassShards();
    this.initEvents();
    this.initIntersectionObserver();

    // Start loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  initScene() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 0, this.isMobile ? 7.8 : 6.4);

    // 3. Renderer with ACES Filmic tone mapping
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: !this.isMobile,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.error('WebGL initialization failed:', e);
      document.body.classList.add('no-webgl');
      return;
    }

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // 4. Room Environment for reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv).texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 5. Raycaster
    this.raycaster = new THREE.Raycaster();
  }

  initLights() {
    // Soft Ambient Fill
    const ambientLight = new THREE.AmbientLight(0x0f111a, 1.2);
    this.scene.add(ambientLight);

    // Dynamic Cursor Tracking PointLight (Lavender #AA88FF)
    this.cursorLight = new THREE.PointLight(0xaa88ff, 4.0, 12, 1.5);
    this.cursorLight.position.set(0, 0, 3.5);
    this.scene.add(this.cursorLight);

    // Lower-Right Emerald Rim Light (#36D67E)
    const emeraldRimLight = new THREE.PointLight(0x36d67e, 2.8, 10, 1.8);
    emeraldRimLight.position.set(3.2, -2.2, 1.8);
    this.scene.add(emeraldRimLight);

    // Upper-Left Subtle Cyan Fill Light (#38BDF8)
    const cyanLight = new THREE.PointLight(0x38bdf8, 2.0, 10, 2.0);
    cyanLight.position.set(-3.2, 2.5, 1.5);
    this.scene.add(cyanLight);

    // Soft Directional Key Light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(2, 4, 5);
    this.scene.add(dirLight);
  }

  // Creates rounded polygon shapes with silky rounded corners
  createRoundedPolygonShape(points, radius = 0.08) {
    const shape = new THREE.Shape();
    const len = points.length;

    for (let i = 0; i < len; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % len];
      const p0 = points[(i - 1 + len) % len];

      // Vectors
      const v01 = new THREE.Vector2(p1[0] - p0[0], p1[1] - p0[1]).normalize();
      const v12 = new THREE.Vector2(p2[0] - p1[0], p2[1] - p1[1]).normalize();

      const startPt = [
        p1[0] - v01.x * radius,
        p1[1] - v01.y * radius,
      ];
      const endPt = [
        p1[0] + v12.x * radius,
        p1[1] + v12.y * radius,
      ];

      if (i === 0) {
        shape.moveTo(startPt[0], startPt[1]);
      } else {
        shape.lineTo(startPt[0], startPt[1]);
      }
      shape.quadraticCurveTo(p1[0], p1[1], endPt[0], endPt[1]);
    }

    shape.closePath();
    return shape;
  }

  initGlassShards() {
    this.clusterGroup = new THREE.Group();
    this.scene.add(this.clusterGroup);
    this.shardMeshes = [];

    // Master Smoked Glass Material
    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0e1017),
      emissive: new THREE.Color(0x030408),
      roughness: 0.16,
      metalness: 0.05,
      transmission: 0.91,
      ior: 1.54,
      thickness: 2.2,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      attenuationColor: new THREE.Color(0x1a122e), // Subtle lavender-tinted charcoal absorption
      attenuationDistance: 1.3,
      iridescence: 0.45,
      iridescenceIOR: 1.33,
      iridescenceThicknessRange: [100, 420],
      clearcoat: 0.95,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 1.0,
      reflectivity: 0.8,
    });

    // Extrude Settings for Physical Thickness & Beveled Edges
    const extrudeSettings = {
      depth: 0.28,
      bevelEnabled: true,
      bevelSegments: this.isMobile ? 2 : 4,
      bevelThickness: 0.07,
      bevelSize: 0.05,
      bevelOffset: 0,
      curveSegments: this.isMobile ? 8 : 16,
    };

    // Shard Definitions (Irregular Interlocking Facets forming a central shield)
    const shardsData = [
      // 0: Center Primary Facet
      {
        id: 'center_facet',
        points: [[-0.9, 0.7], [0.9, 0.7], [1.1, -0.6], [0, -1.2], [-1.1, -0.6]],
        center: [0, 0, 0],
        explosionDir: [0, 0.1, 1.5],
        angularSpeed: [0.3, 0.2, 0.1],
        stagger: 0.0,
      },
      // 1: Top Right Shard
      {
        id: 'top_right_facet',
        points: [[0.1, 0.0], [1.3, 0.4], [1.5, 1.5], [0.3, 1.4]],
        center: [1.05, 0.85, 0.06],
        explosionDir: [1.2, 1.0, 1.2],
        angularSpeed: [0.5, -0.4, 0.3],
        stagger: 0.08,
      },
      // 2: Top Left Shard
      {
        id: 'top_left_facet',
        points: [[-1.3, 0.4], [-0.1, 0.0], [-0.3, 1.4], [-1.5, 1.5]],
        center: [-1.05, 0.85, 0.04],
        explosionDir: [-1.2, 1.0, 1.1],
        angularSpeed: [-0.4, 0.5, -0.2],
        stagger: 0.09,
      },
      // 3: Far Right Wing
      {
        id: 'right_wing_facet',
        points: [[0.0, 0.7], [1.1, 0.3], [1.3, -0.8], [0.1, -0.5]],
        center: [1.35, -0.15, -0.04],
        explosionDir: [1.6, -0.2, 0.9],
        angularSpeed: [0.4, 0.6, -0.3],
        stagger: 0.14,
      },
      // 4: Far Left Wing
      {
        id: 'left_wing_facet',
        points: [[-1.1, 0.3], [0.0, 0.7], [-0.1, -0.5], [-1.3, -0.8]],
        center: [-1.35, -0.15, -0.03],
        explosionDir: [-1.6, -0.2, 0.95],
        angularSpeed: [-0.4, -0.5, 0.3],
        stagger: 0.15,
      },
      // 5: Bottom Right Point
      {
        id: 'bottom_right_facet',
        points: [[-0.2, 0.5], [1.0, 0.1], [0.6, -1.1], [-0.3, -0.4]],
        center: [0.75, -1.05, 0.05],
        explosionDir: [0.9, -1.4, 1.3],
        angularSpeed: [0.6, -0.3, 0.4],
        stagger: 0.12,
      },
      // 6: Bottom Left Point
      {
        id: 'bottom_left_facet',
        points: [[-1.0, 0.1], [0.2, 0.5], [0.3, -0.4], [-0.6, -1.1]],
        center: [-0.75, -1.05, 0.03],
        explosionDir: [-0.9, -1.4, 1.25],
        angularSpeed: [-0.5, 0.4, -0.4],
        stagger: 0.13,
      },
      // 7: Top Crown Spike
      {
        id: 'crown_facet',
        points: [[-0.7, 0.0], [0.7, 0.0], [0.0, 0.9]],
        center: [0, 1.65, 0.02],
        explosionDir: [0, 1.8, 1.4],
        angularSpeed: [0.2, 0.1, 0.5],
        stagger: 0.18,
      },
    ];

    shardsData.forEach((data, index) => {
      const shape = this.createRoundedPolygonShape(data.points, 0.06);
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center();

      // Individual material clone so hover highlights don't affect all shards
      const mat = this.glassMaterial.clone();

      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(data.center[0], data.center[1], data.center[2]);

      // Custom tracking state
      mesh.userData = {
        id: data.id,
        index: index,
        homePosition: mesh.position.clone(),
        homeRotation: mesh.rotation.clone(),
        currentOffset: new THREE.Vector3(0, 0, 0),
        targetOffset: new THREE.Vector3(0, 0, 0),
        currentTilt: new THREE.Vector2(0, 0),
        targetTilt: new THREE.Vector2(0, 0),
        explosionDir: new THREE.Vector3(...data.explosionDir),
        angularSpeed: new THREE.Vector3(...data.angularSpeed),
        stagger: data.stagger,
        baseIridescence: 0.45,
        targetIridescence: 0.45,
      };

      this.clusterGroup.add(mesh);
      this.shardMeshes.push(mesh);
    });

    // Slight initial tilt for dynamic posture
    this.clusterGroup.rotation.x = 0.08;
    this.clusterGroup.rotation.y = -0.05;
  }

  initEvents() {
    // Mouse Move & Hover
    window.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      // Mouse NDC for Three.js raycasting (-1 to 1)
      this.mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Mouse for cluster tilt
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Target cluster rotation
      if (!this.prefersReducedMotion && !this.isShattered) {
        this.targetClusterRotation.y = this.mouse.x * 0.25;
        this.targetClusterRotation.x = -this.mouse.y * 0.22;
      }

      // Cursor light positioning in 3D
      if (this.cursorLight) {
        this.cursorLight.position.x = this.mouse.x * 3.5;
        this.cursorLight.position.y = this.mouse.y * 2.5;
      }

      // DOM Cursor follower
      const glow = document.getElementById('cursorGlow');
      if (glow) {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      }
    });

    // Touch Support for mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.container.getBoundingClientRect();
        this.mouseNDC.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouseNDC.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        if (!this.prefersReducedMotion && !this.isShattered) {
          this.targetClusterRotation.y = this.mouse.x * 0.2;
          this.targetClusterRotation.x = -this.mouse.y * 0.18;
        }
      }
    }, { passive: true });

    // Window Resize
    window.addEventListener('resize', () => {
      if (!this.renderer || !this.camera) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.isMobile = window.innerWidth < 768;

      this.camera.aspect = width / height;
      this.camera.position.z = this.isMobile ? 7.8 : 6.4;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Primary Buttons trigger Cinematic Shatter
    const btnExplore = document.getElementById('btnExploreDashboard');
    if (btnExplore) {
      btnExplore.addEventListener('click', (e) => {
        e.preventDefault();
        this.triggerShatterTransition('#dashboardOverview');
      });
    }

    const btnOptimize = document.getElementById('btnHeroOptimize');
    if (btnOptimize) {
      btnOptimize.addEventListener('click', (e) => {
        // If on same page with optimizer section, smooth transition, else allow navigation
        const targetEl = document.getElementById('campaignOptimizerSection') || document.getElementById('dashboardOverview');
        if (targetEl) {
          e.preventDefault();
          this.triggerShatterTransition(targetEl);
        }
      });
    }

    // Reassemble Glass Button
    const btnReturn = document.getElementById('btnReturnToHero');
    if (btnReturn) {
      btnReturn.addEventListener('click', () => {
        this.reassembleGlass();
      });
    }
  }

  initIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isIntersecting = entry.isIntersecting;
          if (this.isIntersecting && !this.animationFrameId) {
            this.clock.start();
            this.animate();
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(this.container);
  }

  // Raycasting to detect hovered glass shard
  checkRaycast() {
    if (this.isShattered || !this.raycaster) return;

    this.raycaster.setFromCamera(this.mouseNDC, this.camera);
    const intersects = this.raycaster.intersectObjects(this.shardMeshes, false);

    if (intersects.length > 0) {
      const hitShard = intersects[0].object;

      if (this.hoveredShard !== hitShard) {
        // Unhover previous
        if (this.hoveredShard) {
          this.resetShardHover(this.hoveredShard);
        }
        // Hover new
        this.hoveredShard = hitShard;
        this.applyShardHover(hitShard);
      }
    } else {
      if (this.hoveredShard) {
        this.resetShardHover(this.hoveredShard);
        this.hoveredShard = null;
      }
    }
  }

  applyShardHover(shard) {
    // Lift forward along Z and tilt slightly
    shard.userData.targetOffset.set(0, 0, 0.42);
    shard.userData.targetTilt.set(
      (this.mouseNDC.y * 0.15),
      (this.mouseNDC.x * 0.15)
    );
    shard.userData.targetIridescence = 0.85;

    // Enhance emissive lavender highlight
    shard.material.emissive.setHex(0x1a0f30);
    shard.material.roughness = 0.12;

    document.body.style.cursor = 'pointer';
  }

  resetShardHover(shard) {
    shard.userData.targetOffset.set(0, 0, 0);
    shard.userData.targetTilt.set(0, 0);
    shard.userData.targetIridescence = shard.userData.baseIridescence;

    shard.material.emissive.setHex(0x030408);
    shard.material.roughness = 0.16;

    document.body.style.cursor = 'default';
  }

  // Cinematic 3D Glass Shatter
  triggerShatterTransition(targetSelectorOrElement) {
    if (this.prefersReducedMotion) {
      // Direct jump for reduced motion
      this.scrollToTarget(targetSelectorOrElement);
      return;
    }

    this.isShattered = true;
    this.shatterTarget = 1.0;

    // Fade out overlay
    const overlay = document.querySelector('.glass-hero-overlay');
    if (overlay) overlay.classList.add('hero-shattered');

    // Show floating Return button
    const btnReturn = document.getElementById('btnReturnToHero');
    if (btnReturn) btnReturn.classList.remove('d-none');

    // Smooth scroll to target after brief stagger
    setTimeout(() => {
      this.scrollToTarget(targetSelectorOrElement);
    }, 450);
  }

  reassembleGlass() {
    this.isShattered = false;
    this.shatterTarget = 0.0;

    // Restore hero overlay
    const overlay = document.querySelector('.glass-hero-overlay');
    if (overlay) overlay.classList.remove('hero-shattered');

    // Hide Return button
    const btnReturn = document.getElementById('btnReturnToHero');
    if (btnReturn) btnReturn.classList.add('d-none');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToTarget(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  animate() {
    if (!this.isIntersecting) {
      this.animationFrameId = null;
      return;
    }

    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Raycast detection
    this.checkRaycast();

    // 2. Smooth cluster tilt lerp
    this.currentClusterRotation.x += (this.targetClusterRotation.x - this.currentClusterRotation.x) * (delta * 4.5);
    this.currentClusterRotation.y += (this.targetClusterRotation.y - this.currentClusterRotation.y) * (delta * 4.5);

    // Subtle gentle breathing float when not shattered
    const floatY = Math.sin(elapsedTime * 1.2) * 0.04;
    const floatRoll = Math.cos(elapsedTime * 0.9) * 0.015;

    this.clusterGroup.rotation.x = this.currentClusterRotation.x + (this.isShattered ? 0 : floatY);
    this.clusterGroup.rotation.y = this.currentClusterRotation.y;
    this.clusterGroup.rotation.z = floatRoll;

    // 3. Shatter progress lerp
    this.shatterProgress += (this.shatterTarget - this.shatterProgress) * (delta * 3.8);

    // 4. Update individual shards
    for (let i = 0; i < this.shardMeshes.length; i++) {
      const shard = this.shardMeshes[i];
      const ud = shard.userData;

      // Shatter calculations with stagger
      const effectiveShatter = Math.max(0, Math.min(1, (this.shatterProgress - ud.stagger * 0.5) / 0.8));

      // Home position + hover offset + shatter explosion
      const explosionOffset = ud.explosionDir.clone().multiplyScalar(effectiveShatter * 3.4);
      const targetPos = ud.homePosition.clone().add(ud.currentOffset).add(explosionOffset);

      // Lerp position with spring damping
      shard.position.lerp(targetPos, delta * 6.5);

      // Shard hover offset lerp
      ud.currentOffset.lerp(ud.targetOffset, delta * 8.0);
      ud.currentTilt.lerp(ud.targetTilt, delta * 8.0);

      // Rotations
      if (effectiveShatter > 0.001) {
        shard.rotation.x = ud.homeRotation.x + (ud.angularSpeed.x * effectiveShatter * 2.5);
        shard.rotation.y = ud.homeRotation.y + (ud.angularSpeed.y * effectiveShatter * 2.5);
        shard.rotation.z = ud.homeRotation.z + (ud.angularSpeed.z * effectiveShatter * 2.0);
      } else {
        shard.rotation.x = ud.homeRotation.x + ud.currentTilt.x;
        shard.rotation.y = ud.homeRotation.y + ud.currentTilt.y;
        shard.rotation.z = ud.homeRotation.z;
      }

      // Iridescence interpolation
      if (shard.material.iridescence !== undefined) {
        shard.material.iridescence += (ud.targetIridescence - shard.material.iridescence) * (delta * 6.0);
      }
    }

    // 5. Render
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.shardMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.glassMaterial.dispose();
    this.renderer.dispose();
  }
}

// Global auto-mount on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('heroWebglCanvas');
  if (canvas) {
    window.glassHero = new SmokedGlassHero('heroWebglCanvas', 'glassHeroContainer');
  }
});

export default SmokedGlassHero;
