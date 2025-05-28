import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- 全局变量 ---
const eyePosition = new THREE.Vector3();
// 【FIX 2: 数据平滑】创建一个目标位置向量，用于平滑过渡
const targetPosition = new THREE.Vector3(); 

// --- UI元素 ---
const fovSlider = document.getElementById('fov-slider');
const fovValueSpan = document.getElementById('fov-value');
let FOV_DEGREES = parseFloat(fovSlider.value);

fovSlider.addEventListener('input', (event) => {
    FOV_DEGREES = parseFloat(event.target.value);
    fovValueSpan.textContent = FOV_DEGREES;
});

const movementMultiplier = 4.0;

// --- Three.js 场景设置 ---
const canvas = document.querySelector('#main_canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera();
// 【FIX 3: 调整取景】将相机初始位置向后移动，留出更多空间
camera.position.set(0, 0, 40); 
camera.projectionMatrixAutoUpdate = false;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const screenWidth = 34.5;
const screenHeight = 19.4;
const screenZ = 0;
const screenGeometry = new THREE.BoxGeometry(screenWidth, screenHeight, 0.1);
const screenHelper = new THREE.BoxHelper(new THREE.Mesh(screenGeometry));
screenHelper.material.color.set(0xffffff);
screenHelper.position.z = screenZ;
scene.add(screenHelper);

const loader = new GLTFLoader();
loader.load('models/scene.gltf', (gltf) => {
    const model = gltf.scene;
    // 【FIX 3: 调整取景】再次缩小模型，让它更精致
    model.scale.set(0.5, 0.5, 0.5); 
    model.position.set(0, 0, 10);
    model.rotation.set(Math.PI / 8, Math.PI / 6, 0); 
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
        const FOCAL_LENGTH_PX = (videoElement.videoWidth / 2) / Math.tan((FOV_DEGREES / 2) * Math.PI / 180);
        let depth = (FOCAL_LENGTH_PX * KNOWN_IRIS_DIAMETER_MM) / (irisPixelWidth * 10);
        const eyeCenterX = (rightIrisLeft.x + rightIrisRight.x) / 2;
        const eyeCenterY = (rightIrisLeft.y + rightIrisRight.y) / 2;
        let x = (eyeCenterX * videoElement.videoWidth - videoElement.videoWidth / 2) * depth / FOCAL_LENGTH_PX;
        let y = (eyeCenterY * videoElement.videoHeight - videoElement.videoHeight / 2) * depth / FOCAL_LENGTH_PX;
        depth = Math.max(20, Math.min(60, depth)); // 调整深度范围以匹配更远的相机

        // 【FIX 1: 纠正方向】在x坐标前加负号，以解决摄像头镜像问题
        eyePosition.set(-x, -y, depth);
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
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
    }

    // 更新目标位置
    targetPosition.set(
        eyePosition.x * movementMultiplier,
        eyePosition.y * movementMultiplier,
        eyePosition.z
    );

    // 【FIX 2: 数据平滑】使用lerp让相机平滑地移动到目标位置，消除抖动
    // 0.1是平滑系数，值越小越平滑，但延迟越高
    camera.position.lerp(targetPosition, 0.1); 

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