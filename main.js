import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'lil-gui'; // 导入 lil-gui

// =======================================================================
// --- 艺术总监最终控制面板 (你可以安全地调整这里的数值) ---
// =======================================================================
const params = {
    movementMultiplier: 2.5,
    modelScale: 0.6,
    rotationX: 20,
    rotationY: 35,
    modelY: 2,
    modelZ: 8,
    fov: 60,
    smoothingFactor: 0.1
};

// =======================================================================
// --- 创建并配置 GUI ---
// =======================================================================
const gui = new GUI();
gui.add(params, 'movementMultiplier', 0, 5).name('左右/上下灵敏度');
gui.add(params, 'smoothingFactor', 0.01, 0.5).name('平滑系数');
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
let model; // 将model提升为全局变量，方便在animate中访问

// --- Three.js 场景设置 ---
const canvas = document.querySelector('#main_canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera();
camera.position.set(0, 0, 40); 
camera.projectionMatrixAutoUpdate = false;

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// 添加虚拟屏幕辅助框
const screenWidth = 34.5;
const screenHeight = 19.4;
const screenZ = 0;
const screenGeometry = new THREE.BoxGeometry(screenWidth, screenHeight, 0.1);
const screenHelper = new THREE.BoxHelper(new THREE.Mesh(screenGeometry));
screenHelper.material.color.set(0xffffff);
screenHelper.position.z = screenZ;
scene.add(screenHelper);

// 加载模型
const loader = new GLTFLoader();
loader.load('models/scene.gltf', (gltf) => {
    model = gltf.scene; // 赋值给全局变量
    scene.add(model);
});

// --- MediaPipe Face Mesh 设置 ---
const videoElement = document.getElementsByClassName('input_video')[0];

function onResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const rightIrisLeft = landmarks[473];
        const rightIrisRight = landmarks[468];
        const irisPixelWidth = Math.sqrt(
            Math.pow(rightIrisLeft.x * videoElement.videoWidth - rightIrisRight.x * videoElement.videoWidth, 2) +
            Math.pow(rightIrisLeft.y * videoElement.videoHeight - rightIrisRight.y * videoElement.videoHeight, 2)
        );
        const KNOWN_IRIS_DIAMETER_MM = 11.7;
        const FOCAL_LENGTH_PX = (videoElement.videoWidth / 2) / Math.tan((params.fov / 2) * Math.PI / 180);
        let depth = (FOCAL_LENGTH_PX * KNOWN_IRIS_DIAMETER_MM) / (irisPixelWidth * 10);
        depth = Math.max(20, Math.min(60, depth));
        const finalZ = 45 - (depth - 25) * 0.8; 
        const eyeCenterX = (rightIrisLeft.x + rightIrisRight.x) / 2;
        const eyeCenterY = (rightIrisLeft.y + rightIrisRight.y) / 2;
        let x = (eyeCenterX * videoElement.videoWidth - videoElement.videoWidth / 2) * finalZ / FOCAL_LENGTH_PX;
        let y = (eyeCenterY * videoElement.videoHeight - videoElement.videoHeight / 2) * finalZ / FOCAL_LENGTH_PX;
        eyePosition.set(-x, -y, finalZ);
    }
}

const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
faceMesh.onResults(onResults);

const mpCamera = new Camera(videoElement, {
    onFrame: async () => { await faceMesh.send({ image: videoElement }); },
    width: 1280,
    height: 720
});
mpCamera.start();

// --- 最终的动画循环 ---
function animate() {
    requestAnimationFrame(animate);

    // 在动画循环中，实时从GUI参数更新模型状态
    if (model) {
        model.scale.set(params.modelScale, params.modelScale, params.modelScale);
        model.rotation.set(
            params.rotationX * Math.PI / 180,
            params.rotationY * Math.PI / 180,
            0
        );
        model.position.set(0, params.modelY, params.modelZ);
    }
    
    // 更新相机目标位置
    targetPosition.set(
        eyePosition.x * params.movementMultiplier,
        eyePosition.y * params.movementMultiplier,
        eyePosition.z
    );

    // 平滑移动相机
    camera.position.lerp(targetPosition, params.smoothingFactor); 
    
    // 检查并更新渲染器尺寸
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
    }
    
    // 计算并应用偏轴投影矩阵
    const near = 0.1; 
    const far = 1000;
    const eyeZ = camera.position.z;
    const left = (-screenWidth / 2 - camera.position.x) * (near / eyeZ);
    const right = (screenWidth / 2 - camera.position.x) * (near / eyeZ);
    const top = (screenHeight / 2 - camera.position.y) * (near / eyeZ);
    const bottom = (-screenHeight / 2 - camera.position.y) * (near / eyeZ);
    
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

    renderer.render(scene, camera);
}

animate();