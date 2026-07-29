<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Tween, Group, Easing } from '@tweenjs/tween.js';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useColorMode } from '@/composables/useColorMode';

const containerRef = ref<HTMLElement | null>(null);
const colorMode = useColorMode();

// --- Configuration ---
const CUBE_SIZE = 1;
const SPACING = 0.02;
const TOTAL_SIZE = CUBE_SIZE + SPACING;

// Theme Colors
const THEME_COLORS = {
  day: {
    U: 0xffffff, // White
    D: 0xffeaa7, // Pastel Yellow
    F: 0xff7675, // Pastel Red/Pink
    B: 0xa29bfe, // Pastel Purple
    L: 0x55efc4, // Pastel Green/Mint
    R: 0x74b9ff, // Pastel Blue
    CORE: 0xdfe6e9 // Light Grey
  },
  night: {
    U: 0xbdc3c7, // Concrete Grey
    D: 0xf39c12, // Orange Peel
    F: 0xc0392b, // Pomegranate
    B: 0x8e44ad, // Wisteria Purple
    L: 0x27ae60, // Nephritis
    R: 0x2980b9, // Belize Hole
    CORE: 0x2d3436 // Midnight Blue/Grey
  }
};

// Global variables (scoped to component instance)
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let cubes: THREE.Mesh[] = [];
let globalRotationGroup: THREE.Group;
let tweenGroup: Group;
let animationId: number;
let isAnimating = false;
let isRestoring = false;

// Lights
let ambientLight: THREE.AmbientLight;
let dirLight: THREE.DirectionalLight;
let fillLight: THREE.DirectionalLight;
let topLight: THREE.DirectionalLight;

// Auto Rotation Logic
let isGlobalRotating = false;
let globalRotAxis = new THREE.Vector3(0, 1, 0);
let targetGlobalRotAxis = new THREE.Vector3(0.5, 1, 0.2).normalize();
let autoInterval: any = null;
const ROTATION_SPEED = 700;

// Rotation smoothing
const RESTORING_ROT_SPEED = 0.02; // Faster during restore
const NORMAL_ROT_SPEED = 0.005;   // Normal idle speed
let currentRotSpeed = NORMAL_ROT_SPEED;
let currentRotAxis = new THREE.Vector3(0, 1, 0);

// Raycaster for interaction
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let isDraggingCube = false; 

// Initialize Three.js
const init = () => {
  if (!containerRef.value) return;

  // 1. Scene
  scene = new THREE.Scene();
  // Fog
  scene.fog = new THREE.FogExp2(0xffffff, 0.02); 

  // 2. Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  
  // Adjust initial position based on screen width to manage size
  if (window.innerWidth < 768) {
      camera.position.set(6, 5, 8); // Closer on mobile
  } else {
      camera.position.set(8, 6.5, 10.5); // Further on desktop (makes it look smaller)
  }
  
  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  containerRef.value.appendChild(renderer.domElement);

  // 4. Lights
  ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
  dirLight.position.set(10, 20, 15);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.radius = 4;
  scene.add(dirLight);

  fillLight = new THREE.DirectionalLight(0xeebbff, 1.0);
  fillLight.position.set(-10, 0, -10);
  scene.add(fillLight);

  topLight = new THREE.DirectionalLight(0xffffff, 0.5);
  topLight.position.set(0, 10, 0);
  scene.add(topLight);

  // 5. Build Cube
  tweenGroup = new Group();
  createRubiksCube();

  // 6. Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = false; // We use custom global rotation
  controls.enablePan = false;
  controls.enableZoom = false; 
  
  // Adjust target based on screen size
  updateCameraTarget();

  // 7. Animation Loop
  animate();

  // 8. Intro Animation
  performIntroAnimation();

  // 9. Initial Theme
  updateThemeColors();

  // 10. Interaction
  if (containerRef.value) {
    containerRef.value.addEventListener('dblclick', explodeAndRestore);
  }
};

const createRubiksCube = () => {
  globalRotationGroup = new THREE.Group();
  scene.add(globalRotationGroup);

  const geometry = new RoundedBoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, 4, 0.15);

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const materials = createMaterials(x, y, z);
        const cube = new THREE.Mesh(geometry, materials);
        
        cube.position.set(x * TOTAL_SIZE, y * TOTAL_SIZE, z * TOTAL_SIZE);
        cube.castShadow = true;
        cube.receiveShadow = true;
        
        cube.userData = { 
            isCube: true,
            initialX: x, initialY: y, initialZ: z 
        };
        
        globalRotationGroup.add(cube);
        cubes.push(cube);
      }
    }
  }
};

const createMaterials = (x: number, y: number, z: number) => {
  const materials: THREE.MeshPhysicalMaterial[] = [];
  const baseProps = {
    roughness: 0.6,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
  };

  const currentColors = colorMode.value === 'dark' ? THEME_COLORS.night : THEME_COLORS.day;

  // Order: Right(x+), Left(x-), Top(y+), Bottom(y-), Front(z+), Back(z-)
  const faces = [
    { key: x === 1 ? 'R' : 'CORE' },
    { key: x === -1 ? 'L' : 'CORE' },
    { key: y === 1 ? 'U' : 'CORE' },
    { key: y === -1 ? 'D' : 'CORE' },
    { key: z === 1 ? 'F' : 'CORE' },
    { key: z === -1 ? 'B' : 'CORE' }
  ];

  faces.forEach(face => {
    // @ts-ignore
    const color = currentColors[face.key];
    const mat = new THREE.MeshPhysicalMaterial({ 
      ...baseProps, 
      color: color
    });
    mat.userData = { colorKey: face.key };
    materials.push(mat);
  });
  
  return materials;
};

const updateThemeColors = () => {
  if (!scene) return;
  const isDark = colorMode.value === 'dark';
  const colors = isDark ? THEME_COLORS.night : THEME_COLORS.day;
  const bgColor = isDark ? 0x121212 : 0xfdfcf0; // Matching the demo's CSS vars
  
  scene.background = new THREE.Color(bgColor);
  if (scene.fog) {
      // @ts-ignore
      scene.fog.color.setHex(bgColor);
  }

  // Update Lights
  if (ambientLight) ambientLight.intensity = isDark ? 0.4 : 0.9;
  if (dirLight) dirLight.intensity = isDark ? 1.0 : 1.8;
  if (fillLight) fillLight.intensity = isDark ? 0.5 : 1.0;
  if (topLight) topLight.intensity = isDark ? 0.2 : 0.5;

  // Update Cube Colors
  cubes.forEach(cube => {
    if (Array.isArray(cube.material)) {
      cube.material.forEach(mat => {
        const m = mat as THREE.MeshPhysicalMaterial;
        if (m.userData.colorKey) {
          // @ts-ignore
          m.color.setHex(colors[m.userData.colorKey]);
        }
      });
    }
  });
};

const getExplodedState = () => {
  const r = 3 + Math.random() * 3;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;

  return {
    pos: {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi)
    },
    rot: {
      x: (Math.random() - 0.5) * Math.PI * 3,
      y: (Math.random() - 0.5) * Math.PI * 3,
      z: (Math.random() - 0.5) * Math.PI * 3
    }
  };
};

const performIntroAnimation = () => {
  // Set restoring flag for rotation
  isRestoring = true;
  
  // 1. Scatter
  cubes.forEach(cube => {
    const state = getExplodedState();
    
    cube.position.set(state.pos.x, state.pos.y, state.pos.z);
    cube.rotation.set(state.rot.x, state.rot.y, state.rot.z);
  });
  
  // 2. Assemble
  setTimeout(() => {
    assembleCube(1500, Easing.Cubic.Out);
  }, 100);
};

const explodeAndRestore = () => {
    if (isAnimating || isRestoring) return;
    isRestoring = true;
    stopAutoRotate();
    
    // Explode
    cubes.forEach(cube => {
        const state = getExplodedState();

        new Tween(cube.position)
            .group(tweenGroup)
            .to(state.pos, 600)
            .easing(Easing.Exponential.Out)
            .start();

        new Tween(cube.rotation)
            .group(tweenGroup)
            .to(state.rot, 600)
            .easing(Easing.Exponential.Out)
            .start();
    });

    setTimeout(() => {
        assembleCube(1500, Easing.Cubic.Out);
    }, 500);
};

const assembleCube = (duration = 1500, easing = Easing.Cubic.Out) => {
  let completedCount = 0;
  
  cubes.forEach(cube => {
    const targetPos = {
      x: cube.userData.initialX * TOTAL_SIZE,
      y: cube.userData.initialY * TOTAL_SIZE,
      z: cube.userData.initialZ * TOTAL_SIZE
    };
    
    new Tween(cube.position)
      .group(tweenGroup)
      .to(targetPos, duration)
      .easing(easing)
      .start();
    
    new Tween(cube.rotation)
      .group(tweenGroup)
      .to({ x: 0, y: 0, z: 0 }, duration)
      .easing(easing)
      .onComplete(() => {
        completedCount++;
        if (completedCount === cubes.length) {
            onAssembleComplete();
        }
      })
      .start();
  });
};

const onAssembleComplete = () => {
    isRestoring = false;
    // Round positions to avoid float errors
    cubes.forEach(cube => {
        cube.position.x = Math.round(cube.position.x / TOTAL_SIZE) * TOTAL_SIZE;
        cube.position.y = Math.round(cube.position.y / TOTAL_SIZE) * TOTAL_SIZE;
        cube.position.z = Math.round(cube.position.z / TOTAL_SIZE) * TOTAL_SIZE;
        cube.rotation.set(0, 0, 0);
        cube.updateMatrix();
    });

    // Start auto rotate
    setTimeout(() => {
        startAutoRotate();
    }, 500);
};

const startAutoRotate = () => {
    if (autoInterval) clearInterval(autoInterval);
    isGlobalRotating = true;
    
    autoInterval = setInterval(() => {
        if (!isAnimating && !isRestoring && !isDraggingCube) {
            doRandomMove();
        }
    }, 1500);
};

const stopAutoRotate = () => {
    if (autoInterval) clearInterval(autoInterval);
    isGlobalRotating = false;
};

const doRandomMove = () => {
    const axes = ['x', 'y', 'z'];
    const layers = [-1, 0, 1];
    const dirs = [1, -1];

    const axis = axes[Math.floor(Math.random() * axes.length)];
    const layer = layers[Math.floor(Math.random() * layers.length)];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];

    rotateLayer(axis!, layer!, dir!);
};

const rotateLayer = (axis: string, layer: number, dir: number, duration = ROTATION_SPEED, onComplete: (() => void) | null = null) => {
    if (isAnimating) return;
    isAnimating = true;

    // Find cubes in layer
    const targetCubes = cubes.filter(cube => {
        // @ts-ignore
        const pos = cube.position[axis];
        return Math.abs(pos - layer * TOTAL_SIZE) < 0.1;
    });

    if (targetCubes.length === 0) {
        isAnimating = false;
        if(onComplete) onComplete();
        return;
    }

    const pivot = new THREE.Object3D();
    pivot.rotation.set(0, 0, 0);
    globalRotationGroup.add(pivot);

    targetCubes.forEach(cube => {
        pivot.attach(cube);
    });

    const targetRotation = { value: 0 };
    const endRotation = dir * Math.PI / 2;

    new Tween(targetRotation)
        .group(tweenGroup)
        .to({ value: endRotation }, duration)
        .easing(Easing.Back.Out)
        .onUpdate(() => {
            // @ts-ignore
            pivot.rotation[axis] = targetRotation.value;
        })
        .onComplete(() => {
            targetCubes.forEach(cube => {
                globalRotationGroup.attach(cube);
                
                // Round positions/rotations
                cube.position.x = Math.round(cube.position.x / TOTAL_SIZE) * TOTAL_SIZE;
                cube.position.y = Math.round(cube.position.y / TOTAL_SIZE) * TOTAL_SIZE;
                cube.position.z = Math.round(cube.position.z / TOTAL_SIZE) * TOTAL_SIZE;
                
                cube.rotation.x = Math.round(cube.rotation.x / (Math.PI/2)) * (Math.PI/2);
                cube.rotation.y = Math.round(cube.rotation.y / (Math.PI/2)) * (Math.PI/2);
                cube.rotation.z = Math.round(cube.rotation.z / (Math.PI/2)) * (Math.PI/2);
                
                cube.updateMatrix();
            });

            globalRotationGroup.remove(pivot);
            isAnimating = false;
            
            if (onComplete) onComplete();
        })
        .start();
};

const animate = (time?: number) => {
  animationId = requestAnimationFrame(animate);
  tweenGroup.update(time);
  controls.update();
  
  // Custom Global Rotation Logic
  if (globalRotationGroup) {
    let targetAxis: THREE.Vector3;
    let targetSpeed: number;

    if (isRestoring) {
        // During restore: Rotate around Z axis at faster speed
        targetAxis = new THREE.Vector3(0, 0, 1);
        targetSpeed = RESTORING_ROT_SPEED;
    } else {
        // Normal state: Rotate around custom axis at normal speed
        // Update the custom axis lerp
        if (isGlobalRotating) {
            globalRotAxis.lerp(targetGlobalRotAxis, 0.05).normalize();
        }
        targetAxis = globalRotAxis;
        targetSpeed = NORMAL_ROT_SPEED;
    }

    // Smoothly interpolate current axis and speed
    currentRotAxis.lerp(targetAxis, 0.05).normalize();
    // Simple lerp for scalar
    currentRotSpeed += (targetSpeed - currentRotSpeed) * 0.05;

    // Apply rotation
    globalRotationGroup.rotateOnWorldAxis(currentRotAxis, currentRotSpeed);
  }
  
  renderer.render(scene, camera);
};

const onWindowResize = () => {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Adjust distance on resize
  if (window.innerWidth < 768) {
      // Don't drastically change position during resize if not needed, 
      // but ensuring consistent size is good.
      // We can check if distance is "far" and bring it closer, or vice versa.
      // Simple way: just updateCameraTarget handles the offset, 
      // but we might want to tween the camera position too if we want dynamic sizing.
  }
  
  updateCameraTarget();
};

const updateCameraTarget = () => {
    if (!controls) return;
    // If width > 768 (md breakpoint), shift target to right so object appears on left
    // We must use the tweenGroup for the animation to run, as only tweenGroup.update() is called in loop
    if (window.innerWidth >= 768) {
        // Shift camera position to the right to make the object appear on the left
        // The object is at (0,0,0). To make it appear left, we need to look at a point to the right of it (positive X)
        // OR move the camera to the right.
        
        // Wait, OrbitControls rotates AROUND the target. 
        // If we want the cube (at 0,0,0) to be the center of rotation, the target MUST be (0,0,0).
        // To make the cube appear on the LEFT of the screen, we need to offset the CAMERA's view, or use view offset.
        // But simply moving the camera position relative to the target is enough if we just want initial placement.
        // HOWEVER, user wants "manual drag rotation center is the cube". So controls.target MUST be (0,0,0).
        
        // To achieve "cube on left", we can use setViewOffset on the camera.
        // fullWidth, fullHeight, x, y, width, height
        // effectively shifting the lens.
        
        // Let's reset target to 0,0,0 so rotation is correct
        new Tween(controls.target)
            .group(tweenGroup)
            .to({ x: 0, y: 0, z: 0 }, 500)
            .easing(Easing.Cubic.Out)
            .start();

        // Use setViewOffset to shift the viewport
        // We want the center of the scene (0,0,0) to be at roughly 25% width (left side)
        // So we pretend the screen is wider.
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Shift amount: positive x moves the image to the left (so object moves left)
        // No, wait. setViewOffset(fullW, fullH, x, y, w, h)
        // To shift the object to the left, we need to shift the view window to the RIGHT.
        // x offset is the x-coordinate of the top-left corner of the sub-rect
        // If x is positive, we are looking at a window shifted to the right, so the center (0,0) appears to the left.
        
        camera.setViewOffset(w, h, w * 0.25, 0, w, h);
        
    } else {
        // Reset
        new Tween(controls.target)
            .group(tweenGroup)
            .to({ x: 0, y: 0, z: 0 }, 500)
            .easing(Easing.Cubic.Out)
            .start();
            
        camera.clearViewOffset();
    }
    
    camera.updateProjectionMatrix();
};

watch(() => colorMode.value, () => {
  updateThemeColors();
});

onMounted(() => {
  init();
  window.addEventListener('resize', onWindowResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
  if (containerRef.value) {
    containerRef.value.removeEventListener('dblclick', explodeAndRestore);
  }
  cancelAnimationFrame(animationId);
  if (tweenGroup) tweenGroup.removeAll();
  if (autoInterval) clearInterval(autoInterval);
  if (renderer) {
    renderer.dispose();
  }
  // Dispose geometries and materials
  cubes.forEach(cube => {
    cube.geometry.dispose();
    if (Array.isArray(cube.material)) {
      cube.material.forEach(m => m.dispose());
    }
  });
});
</script>

<template>
  <div ref="containerRef" class="w-full h-full absolute inset-0 z-0"></div>
</template>

<style scoped>
/* Ensure the canvas doesn't block clicks if we want the content to be clickable */
/* But if we want the cube to be rotatable, we need pointer-events. */
/* The layout in index.vue puts content in a z-10 container. */
/* So the background (z-0) will only receive clicks where the content doesn't cover it. */
</style>
