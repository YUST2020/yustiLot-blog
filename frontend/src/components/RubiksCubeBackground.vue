<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
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
let globalRotAxis = new THREE.Vector3(0.5, 1, 0.2).normalize();
// 目标自转轴会随时间缓慢漂移，形成不规律的自然轨迹
let driftAxis = new THREE.Vector3(0.5, 1, 0.2).normalize();
let driftTime = 0;
let speedPhase = 0; // 自转速度起伏的相位，随帧积累
let autoRotateTimer: number | null = null; // 链式调度下一次随机旋转的定时器
let lastMove: { axis: string; layer: number; dir: number } | null = null; // 上一次随机旋转，用于避免互逆重复
const ROTATION_SPEED = 700;

// 随机打乱节奏：间隔与时长随机化 + 链式调度，避免等拍子的机械感
const MOVE_INTERVAL_MIN = 900;  // 两次随机旋转的最小间隔（ms）
const MOVE_INTERVAL_MAX = 2000; // 最大间隔（ms）
const MOVE_DURATION_MIN = 550;  // 单次层旋转的最短时长（ms）
const MOVE_DURATION_MAX = 900;  // 最长时长（ms）

// Rotation smoothing
const RESTORING_ROT_SPEED = 0.012; // 恢复期转速（放缓，避免突兀）
const NORMAL_ROT_SPEED = 0.006;    // 正常自转速度（起伏的基准值）
let currentRotSpeed = NORMAL_ROT_SPEED;
let currentRotAxis = new THREE.Vector3(0, 1, 0);

// Raycaster for interaction
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let isDraggingCube = false;
// Hover 判定用包围球：覆盖当前扩散状态，指针落在方块间隙仍视为悬停，
// 避免扩散后 hover 反复通断导致间距循环涨缩；也比逐方块三角形射线检测便宜得多
const CUBE_CORE_RADIUS = TOTAL_SIZE * Math.sqrt(3) + 0.5; // 27 块紧贴时的外接半径 + 余量
const hoverSphere = new THREE.Sphere(new THREE.Vector3(), CUBE_CORE_RADIUS);

// Hover 交互：悬停时减速自转并平滑膨胀，叠加呼吸脉动；
// 间距在 1 秒内扩到最大，抖动自扩散尾段启动并渐强，满 3 秒保持间距直接爆炸重组
const HOVER_ROT_SPEED = 0.0008;          // 悬停时的自转速度（约为正常速度的 1/6）
const HOVER_SCALE_TARGET = 1.12;         // 悬停时整体放大目标
const NORMAL_SCALE_TARGET = 1;           // 离开时的还原目标
const SCALE_LERP_FACTOR = 0.08;          // scale 平滑过渡系数
const HOVER_BREATHE_AMPLITUDE = 0.012;   // 悬停时呼吸脉动幅度
const HOVER_REASSEMBLE_MS = 3000;        // 持续悬停多久后触发重组
const HOVER_SPREAD_RAMP_MS = 1000;       // 间距从 0 扩到最大所需时间
const TREMBLE_START_MS = 600;            // 抖动启动时刻（与扩散尾段重叠，扩满时抖动已可见）
const HOVER_MAX_SPREAD = 0.42;           // 间距最大放大系数
const SPREAD_LERP_FACTOR = 0.12;         // 间距平滑过渡系数
const HOVER_TREMBLE_AMPLITUDE = 0.02;    // 抖动阶段方块径向颤动幅度
const TREMBLE_FREQ = 0.032;              // 颤动角频率（≈5Hz）
let isHovered = false;
let currentScale = 1;
let targetScale = 1;
let hoverDuration = 0;                   // 连续悬停时长（ms）
let currentSpread = 0;                   // 当前间距放大系数（0 = 紧贴网格）
let lastFrameTime: number | null = null; // 上一帧时间戳，用于计算帧间隔

// Bloom 辉光：日间阈值抬到 1 且强度压低，避免白色受光面出现光晕；夜间明显（炫酷）
const BLOOM_CONFIG = {
  day:   { strength: 0.18, radius: 0.4, threshold: 1.0 },
  night: { strength: 0.7,  radius: 0.6, threshold: 0.25 }
};
// 粒子星尘：近景细尘 + 远景星尘双层，填满魔方与外围之间的空旷带
const PARTICLE_COLORS = {
  day: 0xc9a227,   // 日间用暖金，在浅背景上也能看见
  night: 0x9ec5ff  // 夜间冷蓝白
};
interface DustFieldConfig {
  count: number;
  rMin: number;   // 距中心最小半径（近景层用于避开魔方本体）
  rMax: number;   // 包络半径（越界反弹）
  size: number;   // 点大小（sizeAttenuation 生效）
  spin: number;   // 整层自转角速度（近景快、远景慢，形成视差层次）
  opacityDay: number;
  opacityNight: number;
}
const DUST_FIELDS: DustFieldConfig[] = [
  { count: 700, rMin: 2.6, rMax: 10, size: 0.07, spin: 0.0006, opacityDay: 0.8, opacityNight: 0.55 },   // 近景细尘
  { count: 1100, rMin: 6, rMax: 16, size: 0.13, spin: 0.00035, opacityDay: 0.95, opacityNight: 0.85 },  // 中景星尘（大颗粒主力）
  { count: 240, rMin: 8, rMax: 18, size: 0.26, spin: 0.00025, opacityDay: 0.45, opacityNight: 0.5 },    // 远景大光斑（bokeh）
];

// 主题背景色：日间清透冷灰蓝（衬托糖彩贴色），夜间深炭
const BG_COLOR = {
  day: 0xeef1f6,
  night: 0x121212
};

// 后处理 / 粒子
let composer: EffectComposer;
let bloomPass: UnrealBloomPass;
interface DustField {
  points: THREE.Points;
  material: THREE.PointsMaterial;
  velocities: Float32Array;
  config: DustFieldConfig;
}
let dustFields: DustField[] = [];
let particleTexture: THREE.CanvasTexture | null = null;

// 滚动驱动视差：魔方随滚动上移 + 微缩，形成层次
const PARALLAX_LERP = 0.08;       // 视差平滑系数
const PARALLAX_LIFT = 3.5;        // 滚动一屏魔方向上抬升量
const PARALLAX_SHRINK = 0.35;     // 滚动一屏魔方缩小比例
const PARALLAX_ROTATE = 1.2;      // 滚动一屏额外旋转弧度
let targetScrollProgress = 0;
let currentScrollProgress = 0;
let targetVisibility = 1;         // Hero section 可见度 0~1
let currentVisibility = 1;

// 统一管理延迟任务：卸载时一并清理，避免回调在组件销毁后触发（如重建自动旋转定时器）
const pendingTimers = new Set<number>();
const defer = (fn: () => void, ms: number) => {
  const id = window.setTimeout(() => {
    pendingTimers.delete(id);
    fn();
  }, ms);
  pendingTimers.add(id);
};

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

// 把 60fps 基准的每帧插值系数换算为当前帧间隔下的等效系数，高刷屏上节奏保持一致
const frameLerp = (k: number, dtScale: number) => 1 - Math.pow(1 - k, dtScale);

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
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
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

  // 5.5 粒子星尘
  createParticles();

  // 5.6 后处理（Bloom 辉光）
  createComposer();

  // 6. Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = false; // We use custom global rotation
  controls.enablePan = false;
  controls.enableZoom = false;
  // 拖拽期间挂起随机打乱，避免与手动旋转互相干扰
  controls.addEventListener('start', () => { isDraggingCube = true; });
  controls.addEventListener('end', () => { isDraggingCube = false; });

  // Adjust target based on screen size
  updateCameraTarget();

  // 7. Interaction（需在 animate 启动前初始化，供 checkHover 使用）
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初始化时校准视差与可见度

  // 8. Animation Loop
  animate();

  // 9. Intro Animation
  performIntroAnimation();

  // 10. Initial Theme
  updateThemeColors();
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
            initialX: x, initialY: y, initialZ: z,
            // 当前逻辑网格坐标（层旋转会置换方块，hover 扩散以此为基准）
            gridX: x, gridY: y, gridZ: z,
            // 蓄力微颤的随机相位，避免 27 块同频抖动
            wobblePhase: Math.random() * Math.PI * 2
        };
        
        globalRotationGroup.add(cube);
        cubes.push(cube);
      }
    }
  }
};

// 径向渐变圆形贴图：实心大核 + 陡峭边缘衰减，小尺寸粒子也保有可见核心；
// 若核太小，浅色背景下柔和高透明点会整个“化”进背景里
const createParticleTexture = () => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.45, 'rgba(255, 255, 255, 0.85)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

// 粒子星尘：近景细尘 + 远景星尘双层球形分布，缓慢漂移
const createParticles = () => {
  particleTexture = createParticleTexture();

  dustFields = DUST_FIELDS.map(config => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.count * 3);
    const velocities = new Float32Array(config.count * 3);

    for (let i = 0; i < config.count; i++) {
      const r = config.rMin + Math.random() * (config.rMax - config.rMin);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      // 缓慢漂移速度
      velocities[i * 3]     = (Math.random() - 0.5) * 0.008;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.008;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: PARTICLE_COLORS.day,
      size: config.size,
      map: particleTexture,
      transparent: true,
      opacity: config.opacityDay,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    return { points, material, velocities, config };
  });
};

// 后处理：RenderPass → UnrealBloomPass → OutputPass
const createComposer = () => {
  const isDark = colorMode.value === 'dark';
  const cfg = isDark ? BLOOM_CONFIG.night : BLOOM_CONFIG.day;

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    cfg.strength,
    cfg.radius,
    cfg.threshold
  );
  composer.addPass(bloomPass);

  // OutputPass 统一处理色调映射与色彩空间转换
  composer.addPass(new OutputPass());
  composer.setSize(window.innerWidth, window.innerHeight);
};

// 材质缓存：同色面共享实例，27 块 × 6 面 = 162 个材质收敛为 7 个，
// 减少每帧 uniform 上传与材质状态切换；颜色/质感统一由 updateThemeColors 维护
let materialCache = new Map<string, THREE.MeshPhysicalMaterial>();

const getFaceMaterial = (colorKey: string) => {
  const cached = materialCache.get(colorKey);
  if (cached) return cached;
  const mat = new THREE.MeshPhysicalMaterial({ roughness: 0.6, metalness: 0.0, clearcoat: 0.0 });
  mat.userData = { colorKey };
  materialCache.set(colorKey, mat);
  return mat;
};

const createMaterials = (x: number, y: number, z: number) => {
  // Order: Right(x+), Left(x-), Top(y+), Bottom(y-), Front(z+), Back(z-)
  const faces = [
    x === 1 ? 'R' : 'CORE',
    x === -1 ? 'L' : 'CORE',
    y === 1 ? 'U' : 'CORE',
    y === -1 ? 'D' : 'CORE',
    z === 1 ? 'F' : 'CORE',
    z === -1 ? 'B' : 'CORE'
  ];
  return faces.map(key => getFaceMaterial(key));
};

const updateThemeColors = () => {
  if (!scene) return;
  const isDark = colorMode.value === 'dark';
  const colors = isDark ? THEME_COLORS.night : THEME_COLORS.day;
  const bgColor = isDark ? BG_COLOR.night : BG_COLOR.day;
  
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

  // Update Cube Colors：夜间开启轻微自发光，让贴色面在 Bloom 下产生辉光
  // 白色面（U）任何模式下都不自发光、roughness 拉满，保持哑光无反光
  const getEmissiveIntensity = (key: string) => {
    if (!isDark) return 0;
    if (key === 'U') return 0;
    return key === 'D' ? 0.08 : 0.22;
  };
  // 夜间提高 roughness，让高光更柔和分散，降低反光刺眼感
  const targetRoughness = isDark ? 0.85 : 0.6;
  materialCache.forEach(m => {
    const key = m.userData.colorKey as keyof typeof colors;
    m.roughness = key === 'U' ? 1 : targetRoughness;
    m.color.setHex(colors[key]);
    m.emissive.setHex(colors[key]);
    m.emissiveIntensity = getEmissiveIntensity(key);
  });

  // Bloom 参数切换
  const cfg = isDark ? BLOOM_CONFIG.night : BLOOM_CONFIG.day;
  if (bloomPass) {
    bloomPass.strength = cfg.strength;
    bloomPass.radius = cfg.radius;
    bloomPass.threshold = cfg.threshold;
  }

  // 粒子颜色与混合模式切换：日间用 NormalBlending 才能在浅背景上可见
  dustFields.forEach(({ material, config }) => {
    material.color.setHex(isDark ? PARTICLE_COLORS.night : PARTICLE_COLORS.day);
    material.opacity = isDark ? config.opacityNight : config.opacityDay;
    material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    material.depthWrite = false;
  });
};

// 用当前（已取整的）位置同步方块逻辑网格坐标，作为 hover 扩散的基准
const syncGridPosition = (cube: THREE.Mesh) => {
  cube.userData.gridX = Math.round(cube.position.x / TOTAL_SIZE);
  cube.userData.gridY = Math.round(cube.position.y / TOTAL_SIZE);
  cube.userData.gridZ = Math.round(cube.position.z / TOTAL_SIZE);
};

const getExplodedState = () => {
  // 入场散落幅度收敛，避免飞太远导致合并过程突兀
  const r = 2.5 + Math.random() * 2.5;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;

  return {
    pos: {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi)
    },
    rot: {
      x: (Math.random() - 0.5) * Math.PI * 2.5,
      y: (Math.random() - 0.5) * Math.PI * 2.5,
      z: (Math.random() - 0.5) * Math.PI * 2.5
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
  defer(() => assembleCube(1800, Easing.Quintic.Out), 150);
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

    defer(() => assembleCube(1800, Easing.Quintic.Out), 500);
};

const assembleCube = (duration = 1800, easing = Easing.Quintic.Out) => {
  let completedCount = 0;

  cubes.forEach((cube, index) => {
    const targetPos = {
      x: cube.userData.initialX * TOTAL_SIZE,
      y: cube.userData.initialY * TOTAL_SIZE,
      z: cube.userData.initialZ * TOTAL_SIZE
    };

    // 错峰延迟：按索引轻微错开启动，避免 27 块同时归位的机械感
    const delay = (index % 9) * 40;

    new Tween(cube.position)
      .group(tweenGroup)
      .to(targetPos, duration)
      .delay(delay)
      .easing(easing)
      .start();

    new Tween(cube.rotation)
      .group(tweenGroup)
      .to({ x: 0, y: 0, z: 0 }, duration)
      .delay(delay)
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
    defer(startAutoRotate, 500);
    // 重组回到初始排布，同步逻辑网格坐标
    cubes.forEach(cube => syncGridPosition(cube));
};

const startAutoRotate = () => {
    stopAutoRotate();
    isGlobalRotating = true;
    scheduleNextMove();
};

const stopAutoRotate = () => {
    if (autoRotateTimer !== null) {
        window.clearTimeout(autoRotateTimer);
        autoRotateTimer = null;
    }
    isGlobalRotating = false;
};

// 链式调度：上一次旋转结束后才安排下一次，间隔随机，节奏不再机械
const scheduleNextMove = () => {
    if (!isGlobalRotating) return;
    if (autoRotateTimer !== null) window.clearTimeout(autoRotateTimer);
    autoRotateTimer = window.setTimeout(tryRandomMove, randomBetween(MOVE_INTERVAL_MIN, MOVE_INTERVAL_MAX));
};

const tryRandomMove = () => {
    autoRotateTimer = null;
    if (!isGlobalRotating) return;
    // 后台标签页 rAF 已停，不发起新旋转；忙碌（旋转中/重组/拖拽/悬停蓄力）时短候重试
    if (document.hidden || isAnimating || isRestoring || isDraggingCube || isHovered) {
        autoRotateTimer = window.setTimeout(tryRandomMove, 300);
        return;
    }
    doRandomMove();
};

const doRandomMove = () => {
    const axes = ['x', 'y', 'z'];
    const layers = [-1, 0, 1];
    const dirs = [1, -1];

    let axis = '';
    let layer = 0;
    let dir = 0;
    // 避开上一次的同轴同层（含互逆），防止“转过去又立刻转回来”的无效观感
    do {
        axis = axes[Math.floor(Math.random() * axes.length)]!;
        layer = layers[Math.floor(Math.random() * layers.length)]!;
        dir = dirs[Math.floor(Math.random() * dirs.length)]!;
    } while (lastMove && lastMove.axis === axis && lastMove.layer === layer);
    lastMove = { axis, layer, dir };

    rotateLayer(axis, layer, dir, randomBetween(MOVE_DURATION_MIN, MOVE_DURATION_MAX), scheduleNextMove);
};

const rotateLayer = (axis: string, layer: number, dir: number, duration = ROTATION_SPEED, onComplete: (() => void) | null = null) => {
    if (isAnimating) return;
    isAnimating = true;

    // 按逻辑网格坐标选块：不依赖世界坐标近似匹配，间距扩散/衰减期间也能正确命中
    const gridKey = `grid${axis.toUpperCase()}`;
    const targetCubes = cubes.filter(cube => cube.userData[gridKey] === layer);

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
            // 90° 层旋转与均匀扩散缩放可交换：旋转后位置 ≈ 新网格 × 当前扩散系数，
            // 按该系数吸附，避免旋转结束瞬间从扩散态跳回紧贴网格造成间距突变
            const spreadFactor = 1 + currentSpread;
            targetCubes.forEach(cube => {
                globalRotationGroup.attach(cube);

                cube.userData.gridX = Math.round(cube.position.x / (TOTAL_SIZE * spreadFactor));
                cube.userData.gridY = Math.round(cube.position.y / (TOTAL_SIZE * spreadFactor));
                cube.userData.gridZ = Math.round(cube.position.z / (TOTAL_SIZE * spreadFactor));
                cube.position.set(
                    cube.userData.gridX * TOTAL_SIZE * spreadFactor,
                    cube.userData.gridY * TOTAL_SIZE * spreadFactor,
                    cube.userData.gridZ * TOTAL_SIZE * spreadFactor
                );

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

const onPointerMove = (event: PointerEvent) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
};

// 滚动进度：视差限定第一屏 0~1；可见度根据 Hero 实际位置算，滚出视口则完全消失
const onScroll = () => {
  const vh = window.innerHeight;
  targetScrollProgress = Math.min(Math.max(window.scrollY / vh, 0), 1);

  // containerRef 是 fixed，取父级 Hero section 的实际可见度
  const hero = containerRef.value?.parentElement;
  if (hero) {
    const rect = hero.getBoundingClientRect();
    // Hero 底边相对视口的位置：完全可见时 = vh，滚出时 ≤ 0
    const visible = Math.min(Math.max(rect.bottom / vh, 0), 1);
    targetVisibility = visible;
  }
};

// 检测鼠标是否悬停在魔方上：包围球随扩散与整体缩放同步放大
const checkHover = () => {
  raycaster.setFromCamera(mouse, camera);
  const groupScale = globalRotationGroup ? globalRotationGroup.scale.x : 1;
  hoverSphere.center.copy(globalRotationGroup.position);
  hoverSphere.radius = CUBE_CORE_RADIUS * (1 + currentSpread) * groupScale;
  // 恢复/爆炸阶段不触发 hover，避免视觉干扰
  const hovered = raycaster.ray.intersectsSphere(hoverSphere) && !isRestoring;
  if (hovered !== isHovered) {
    isHovered = hovered;
    targetScale = hovered ? HOVER_SCALE_TARGET : NORMAL_SCALE_TARGET;
    if (containerRef.value) {
      containerRef.value.style.cursor = hovered ? 'grab' : '';
    }
  }
};

const animate = (time?: number) => {
  animationId = requestAnimationFrame(animate);
  tweenGroup.update(time);
  controls.update();

  // 悬停检测
  checkHover();

  // 帧间隔（ms），钳制避免切后台回来时瞬间累积满悬停时长
  const now = time ?? 0;
  if (lastFrameTime === null) lastFrameTime = now;
  const dt = Math.min(now - lastFrameTime, 100);
  lastFrameTime = now;
  // 帧率归一化：以 60fps 一帧为基准，让转速与过渡节奏在高刷屏上保持一致
  const dtScale = dt / (1000 / 60);

  // 悬停蓄力：1 秒内间距扩到最大，抖动自扩散尾段启动并渐强，满 3 秒保持间距直接爆炸重组
  if (isHovered && !isRestoring) {
    hoverDuration += dt;
  } else {
    hoverDuration = 0;
  }
  if (hoverDuration >= HOVER_REASSEMBLE_MS && !isAnimating && !isRestoring) {
    explodeAndRestore();
  }

  // 扩散曲线：缓出，约 1 秒快速到达最大间距
  const rampProgress = Math.min(hoverDuration / HOVER_SPREAD_RAMP_MS, 1);
  const spreadRatio = 1 - Math.pow(1 - rampProgress, 3);
  // 抖动强度：在扩散尾段启动并线性渐强，间距扩满时抖动已可见，无空窗期
  const trembleRatio = Math.min(
    Math.max((hoverDuration - TREMBLE_START_MS) / (HOVER_REASSEMBLE_MS - TREMBLE_START_MS), 0),
    1
  );
  const trembleStrength = trembleRatio;
  const charging = isHovered && !isRestoring;
  const targetSpread = charging ? spreadRatio * HOVER_MAX_SPREAD : 0;
  currentSpread += (targetSpread - currentSpread) * frameLerp(SPREAD_LERP_FACTOR, dtScale);

  // 应用间距：以逻辑网格为基准外扩。层旋转中的方块写在 pivot 局部系（= 旋转前网格），
  // 经 pivot 旋转变换后自动落在正确位置，保证旋转进行中扩散依然连续；仅重组期间交给 tween
  if (!isRestoring) {
    if (currentSpread > 0.0005) {
      cubes.forEach(cube => {
        const wobble = charging
          ? Math.sin(now * TREMBLE_FREQ + cube.userData.wobblePhase) * HOVER_TREMBLE_AMPLITUDE * trembleStrength
          : 0;
        const factor = 1 + currentSpread + wobble;
        cube.position.set(
          cube.userData.gridX * TOTAL_SIZE * factor,
          cube.userData.gridY * TOTAL_SIZE * factor,
          cube.userData.gridZ * TOTAL_SIZE * factor
        );
      });
    } else if (currentSpread !== 0) {
      // 完全收回后吸附回网格，消除浮点残差
      currentSpread = 0;
      cubes.forEach(cube => {
        cube.position.set(
          cube.userData.gridX * TOTAL_SIZE,
          cube.userData.gridY * TOTAL_SIZE,
          cube.userData.gridZ * TOTAL_SIZE
        );
      });
    }
  }

  // Custom Global Rotation Logic
  if (globalRotationGroup) {
    // 自转轴缓慢漂移：主分量（Y）保持主导且恒正，次分量做小幅起伏
    // 避免 sin/cos 过零反向导致的左右抖动感；恢复期沿用同一轴向只调转速，避免轴向甩动
    if (isGlobalRotating) {
        driftTime += 0.0015 * dtScale;
        driftAxis.set(
          0.25 + Math.sin(driftTime) * 0.15,   // X: 0.10~0.40，恒正
          1,                                    // Y: 主导分量，恒为 1
          0.15 + Math.cos(driftTime * 0.7) * 0.10 // Z: 0.05~0.25，恒正
        ).normalize();
        globalRotAxis.lerp(driftAxis, frameLerp(0.02, dtScale)).normalize();
        speedPhase += 0.0006 * dtScale;
    }
    const targetAxis = globalRotAxis;
    // 常速自转带缓急起伏：两个不同周期（约 10s / 24s）的正弦叠加，±35% 波动，
    // 既不匀速呆板、也不会规律到像节拍器；悬停减速与恢复提速不受影响
    const normalSpeed = NORMAL_ROT_SPEED * (
      1 + Math.sin(speedPhase) * 0.22 + Math.sin(speedPhase * 0.43 + 2.1) * 0.13
    );
    // 悬停时大幅减速自转，聚焦感；恢复期提速归位
    const targetSpeed = isRestoring
        ? RESTORING_ROT_SPEED
        : (isHovered ? HOVER_ROT_SPEED : normalSpeed);

    // 轴向与转速都用较大 lerp 系数平滑过渡，避免状态切换时的跳变
    currentRotAxis.lerp(targetAxis, frameLerp(0.04, dtScale)).normalize();
    currentRotSpeed += (targetSpeed - currentRotSpeed) * frameLerp(0.03, dtScale);

    globalRotationGroup.rotateOnWorldAxis(currentRotAxis, currentRotSpeed * dtScale);

    // 膨胀过渡：平滑接近目标 scale，悬停时叠加呼吸脉动增加灵动感
    currentScale += (targetScale - currentScale) * frameLerp(SCALE_LERP_FACTOR, dtScale);
    let displayScale = currentScale;
    if (isHovered) {
      displayScale += Math.sin((time ?? 0) * 0.004) * HOVER_BREATHE_AMPLITUDE;
    }

    // 滚动视差：平滑跟随滚动进度，魔方上移 + 微缩远去 + 额外旋转
    currentScrollProgress += (targetScrollProgress - currentScrollProgress) * frameLerp(PARALLAX_LERP, dtScale);
    const lift = currentScrollProgress * PARALLAX_LIFT;
    const shrink = 1 - currentScrollProgress * PARALLAX_SHRINK;
    globalRotationGroup.position.y = lift;
    globalRotationGroup.scale.setScalar(displayScale * shrink);
    globalRotationGroup.rotation.z = currentScrollProgress * PARALLAX_ROTATE;

    // 滚出第一屏后整体淡出并放行点击，避免遮挡下方内容
    if (containerRef.value) {
      currentVisibility += (targetVisibility - currentVisibility) * frameLerp(PARALLAX_LERP, dtScale);
      const opacity = Math.max(0, Math.min(1, currentVisibility));
      containerRef.value.style.opacity = String(opacity);
      containerRef.value.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
    }
  }

  // 粒子漂移：在球形空间内缓慢游走，越界则反弹回包络范围；各层转速不同形成视差层次
  dustFields.forEach(({ points, velocities, config }) => {
    const positions = points.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < config.count; i++) {
      const ix = i * 3;
      positions[ix]     += velocities[ix] * dtScale;
      positions[ix + 1] += velocities[ix + 1] * dtScale;
      positions[ix + 2] += velocities[ix + 2] * dtScale;

      // 距离过远则反向，收回包络球内
      const dx = positions[ix], dy = positions[ix + 1], dz = positions[ix + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist > config.rMax || dist < config.rMin) {
        velocities[ix]     *= -1;
        velocities[ix + 1] *= -1;
        velocities[ix + 2] *= -1;
      }
    }
    points.geometry.attributes.position.needsUpdate = true;
    points.rotation.y += config.spin * dtScale;
  });

  // 改用后处理管线渲染
  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
};

const onWindowResize = () => {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (composer) composer.setSize(window.innerWidth, window.innerHeight);
  
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
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('scroll', onScroll);
  cancelAnimationFrame(animationId);
  if (tweenGroup) tweenGroup.removeAll();
  stopAutoRotate();
  pendingTimers.forEach((id) => window.clearTimeout(id));
  pendingTimers.clear();
  // 释放粒子资源
  dustFields.forEach(({ points, material }) => {
    points.geometry.dispose();
    material.dispose();
  });
  dustFields = [];
  particleTexture?.dispose();
  // 释放后处理
  if (composer) composer.dispose();
  if (renderer) {
    renderer.dispose();
  }
  // Dispose geometries and materials
  cubes.forEach(cube => cube.geometry.dispose());
  materialCache.forEach(m => m.dispose());
  materialCache.clear();
});
</script>

<template>
  <div ref="containerRef" class="w-full h-full fixed inset-0 z-0"></div>
</template>

<style scoped>
/* Ensure the canvas doesn't block clicks if we want the content to be clickable */
/* But if we want the cube to be rotatable, we need pointer-events. */
/* The layout in index.vue puts content in a z-10 container. */
/* So the background (z-0) will only receive clicks where the content doesn't cover it. */
</style>
