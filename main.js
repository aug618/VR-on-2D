import GUI from 'lil-gui';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// =======================================================================
// --- 艺术总监最终控制面板 ---
// =======================================================================
const params = {
    movementMultiplier: 2.5,
    depthMultiplier: 2.0,
    minDepth: 15,
    maxDepth: 80,
    modelScale: 0.6,
    rotationX: 20,
    rotationY: 35,
    modelY: 2,
    modelZ: 8,
    fov: 60,
    smoothingFactor: 0.1,
    // 屏幕物理参数（修正）
    screenWidth: 34.5,        // 屏幕实际宽度(cm)
    screenHeight: 19.4,       // 屏幕实际高度(cm)
    cameraToScreenDistance: 0.5 // 摄像头在屏幕上方的距离(cm)
};

// =======================================================================
// --- 创建并配置 GUI ---
// =======================================================================
const gui = new GUI();
gui.add(params, 'movementMultiplier', 0, 5).name('左右/上下灵敏度');
gui.add(params, 'depthMultiplier', 0.1, 5.0).name('深度敏感度');
gui.add(params, 'minDepth', 10, 50).name('最小深度');
gui.add(params, 'maxDepth', 50, 150).name('最大深度');
gui.add(params, 'smoothingFactor', 0.01, 0.5).name('平滑系数');

// 屏幕校准参数
const screenFolder = gui.addFolder('屏幕校准');
screenFolder.add(params, 'screenWidth', 20, 60).name('屏幕宽度(cm)');
screenFolder.add(params, 'screenHeight', 10, 40).name('屏幕高度(cm)');
screenFolder.add(params, 'cameraToScreenDistance', 0.1, 2).name('摄像头到屏幕距离(cm)');

// 模型调整
const modelFolder = gui.addFolder('模型调整');
modelFolder.add(params, 'modelScale', 0.1, 2.0).name('大小');
modelFolder.add(params, 'rotationX', -90, 90).name('向前倾斜 (度)');
modelFolder.add(params, 'rotationY', -90, 90).name('朝向观众 (度)');
modelFolder.add(params, 'modelY', -10, 20).name('垂直位置');
modelFolder.add(params, 'modelZ', -10, 20).name('前后位置');

gui.add(params, 'fov', 40, 90).name('摄像头FOV (度)');

// --- 全局变量 ---
const eyePosition = new THREE.Vector3();
const targetPosition = new THREE.Vector3();
let model;
let screenMesh;

// --- Three.js 场景设置 ---
const canvas = document.querySelector('#main_canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// 重要：虚拟摄像机代表用户眼睛，初始位置在摄像头前方50cm
const camera = new THREE.PerspectiveCamera();
camera.position.set(0, 0, 50);  // 用户眼睛的默认位置
camera.projectionMatrixAutoUpdate = false;

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(5, 10, -25);
scene.add(directionalLight);

// 创建虚拟屏幕（位于网络摄像头下方）
function createVirtualScreen() {
    // 移除旧屏幕
    if (screenMesh) {
        scene.remove(screenMesh);
    }
    
    const screenGeometry = new THREE.BoxGeometry(params.screenWidth, params.screenHeight, 0.1);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    
    // 修正：屏幕在网络摄像头（世界原点）下方
    screenMesh.position.set(0, -params.cameraToScreenDistance-params.screenHeight/2, 0);
    scene.add(screenMesh);
}

// 初始创建屏幕
createVirtualScreen();

// 监听屏幕参数变化
screenFolder.onChange(() => {
    createVirtualScreen();
});

// 加载模型
const loader = new GLTFLoader();
loader.load('models/scene.gltf', (gltf) => {
    model = gltf.scene;
    // 模型位置：在屏幕后方
    model.position.set(0, -params.cameraToScreenDistance - params.modelY, -Math.abs(params.modelZ));
    scene.add(model);
});

// --- MediaPipe Face Mesh 设置 ---
const videoElement = document.getElementsByClassName('input_video')[0];

function onResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const rightIrisLeft = landmarks[473];
        const rightIrisRight = landmarks[468];
        
        // 计算虹膜像素宽度
        const irisPixelWidth = Math.sqrt(
            Math.pow(rightIrisLeft.x * videoElement.videoWidth - rightIrisRight.x * videoElement.videoWidth, 2) +
            Math.pow(rightIrisLeft.y * videoElement.videoHeight - rightIrisRight.y * videoElement.videoHeight, 2)
        );
        
        const KNOWN_IRIS_DIAMETER_MM = 11.7;
        const FOCAL_LENGTH_PX = (videoElement.videoWidth / 2) / Math.tan((params.fov / 2) * Math.PI / 180);
        
        // 计算深度（眼睛到网络摄像头的距离）
        let rawDepth = (FOCAL_LENGTH_PX * KNOWN_IRIS_DIAMETER_MM) / (irisPixelWidth * 10);
        let depth = Math.max(params.minDepth, Math.min(params.maxDepth, rawDepth));
        const finalZ = depth * params.depthMultiplier;
        
        // 计算眼睛中心点
        const eyeCenterX = (rightIrisLeft.x + rightIrisRight.x) / 2;
        const eyeCenterY = (rightIrisLeft.y + rightIrisRight.y) / 2;
        
        // 转换为世界坐标（相对于网络摄像头）
        let x = (eyeCenterX * videoElement.videoWidth - videoElement.videoWidth / 2) * finalZ / FOCAL_LENGTH_PX;
        let y = (eyeCenterY * videoElement.videoHeight - videoElement.videoHeight / 2) * finalZ / FOCAL_LENGTH_PX;
        
        // 设置眼睛位置（相对于网络摄像头）
        eyePosition.set(x, -y, finalZ);
        
        // 更新虚拟摄像机目标位置
        targetPosition.set(
            eyePosition.x * params.movementMultiplier,
            eyePosition.y * params.movementMultiplier,
            eyePosition.z
        );
    }
}

// 设置偏轴投影
function updateOffAxisProjection() {
    const near = 0.1;
    const far = 1000;
    
    // 屏幕位置：相对于网络摄像头（世界原点）
    const screenCenterX = 0;
    const screenCenterY = -(params.cameraToScreenDistance + params.screenHeight / 2);
    const screenCenterZ = 0;
    
    // 计算屏幕边界（相对于用户眼睛/虚拟摄像机位置）
    const screenLeft = screenCenterX - params.screenWidth / 2 - camera.position.x;
    const screenRight = screenCenterX + params.screenWidth / 2 - camera.position.x;
    const screenTop = screenCenterY + params.screenHeight / 2 - camera.position.y;
    const screenBottom = screenCenterY - params.screenHeight / 2 - camera.position.y;
    const screenDistance = Math.abs(camera.position.z - screenCenterZ);
    
    // 计算视锥体参数
    const left = screenLeft * near / screenDistance;
    const right = screenRight * near / screenDistance;
    const top = screenTop * near / screenDistance;
    const bottom = screenBottom * near / screenDistance;
    
    // 手动构建偏轴投影矩阵
    const M = camera.projectionMatrix.elements;
    const x_ = 2 * near / (right - left);
    const y_ = 2 * near / (top - bottom);
    const a = (right + left) / (right - left);
    const b = (top + bottom) / (top - bottom);
    const c = -(far + near) / (far - near);
    const d = -2 * far * near / (far - near);
    
    M[0] = x_; M[4] = 0;  M[8] = a;   M[12] = 0;
    M[1] = 0;  M[5] = y_; M[9] = b;   M[13] = 0;
    M[2] = 0;  M[6] = 0;  M[10] = c;  M[14] = d;
    M[3] = 0;  M[7] = 0;  M[11] = -1; M[15] = 0;
}

// --- 动画循环 ---
function animate() {
    // 平滑移动虚拟摄像机到用户眼睛位置
    camera.position.lerp(targetPosition, params.smoothingFactor);
    
    // 更新偏轴投影
    updateOffAxisProjection();
    
    // 更新模型状态
    if (model) {
        model.scale.set(params.modelScale, params.modelScale, params.modelScale);
        model.rotation.set(
            params.rotationX * Math.PI / 180,
            params.rotationY * Math.PI / 180,
            0
        );
        // 模型位置：在屏幕后方
        const screenCenterY = -(params.cameraToScreenDistance + params.screenHeight / 2);
        model.position.set(
            0, 
            screenCenterY + params.modelY, 
            -Math.abs(params.modelZ)
        );
    }
    
    // 调整渲染器尺寸
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
    }
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// --- MediaPipe 初始化 ---
const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});

cameraUtils.start();
animate();