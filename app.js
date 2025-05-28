// WonkaVision 主程序
class WonkaVision {
    constructor() {
        // 基础元素
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('threejs-canvas');        this.statusEl = document.getElementById('status');
        this.eyePositionEl = document.getElementById('eye-position');
        this.distanceEl = document.getElementById('distance');
        this.eyeDistanceEl = document.getElementById('eye-distance');
          // Three.js 相关
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cube = null;
        this.sphere = null;
        this.torus = null;
        
        // 眼部追踪相关
        this.faceMesh = null;
        this.eyePosition = { x: 0, y: 0, z: 50 }; // 默认眼睛位置(cm)
        this.isTracking = false;
        
        // 屏幕参数 (这里使用估算值，实际项目中需要校准)
        this.screenWidth = 35.3; // 屏幕宽度 (cm) - 大概值
        this.screenHeight = 20.8; // 屏幕高度 (cm) - 大概值
        this.screenDistance = 0.5; // 屏幕到摄像头的距离 (cm) - 估算值
        
        // 初始化
        this.init();
    }
    
    async init() {
        this.updateStatus('正在初始化...', 'status');
        
        try {
            // 1. 初始化Three.js场景
            await this.initThreeJS();
            this.updateStatus('Three.js初始化完成', 'status');
            
            // 2. 初始化摄像头
            await this.initCamera();
            this.updateStatus('摄像头初始化完成', 'status');
            
            // 3. 初始化人脸检测
            await this.initFaceMesh();
            this.updateStatus('人脸检测初始化完成', 'status');
            
            // 4. 开始渲染循环
            this.startRenderLoop();
            this.updateStatus('系统运行中 - 请看向摄像头', 'status');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.updateStatus('初始化失败: ' + error.message, 'error');
        }
    }
      // 初始化Three.js场景
    async initThreeJS() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e); // 深蓝紫色背景
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding; // 改善颜色显示
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // 更好的色调映射
        this.renderer.toneMappingExposure = 1.0;
        
        // 创建摄像机 (使用正交投影作为基础，后面会改为离轴透视)
        this.camera = new THREE.PerspectiveCamera(
            50, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        
        // 添加更好的灯光设置
        // 环境光 - 提供基础照明
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // 主光源 - 从右上方照射
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(15, 15, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);
        
        // 补充光源 - 从左侧照射，减少阴影过暗
        const fillLight = new THREE.DirectionalLight(0x7c7cff, 0.3);
        fillLight.position.set(-10, 5, 5);
        this.scene.add(fillLight);        
        // 创建演示物体 - 一个会"弹出"屏幕的立方体
        const cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
        const cubeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff4757,    // 鲜艳的红色
            shininess: 100,
            specular: 0x222222
        });
        this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.cube.position.set(0, 0, -10); // 放在屏幕"后面"
        this.cube.castShadow = true;
        this.scene.add(this.cube);
        
        // 创建一个球体作为对比
        const sphereGeometry = new THREE.SphereGeometry(3, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x3742fa,    // 鲜艳的蓝色
            shininess: 100,
            specular: 0x111111
        });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.sphere.position.set(-8, 0, 5); // 放在屏幕"前面"
        this.sphere.castShadow = true;
        this.scene.add(this.sphere);
        
        // 添加一个圆环作为额外的视觉参考
        const torusGeometry = new THREE.TorusGeometry(4, 1.5, 16, 100);
        const torusMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2ed573,    // 鲜艳的绿色
            shininess: 80
        });
        this.torus = new THREE.Mesh(torusGeometry, torusMaterial);
        this.torus.position.set(8, 0, -5);
        this.torus.castShadow = true;
        this.scene.add(this.torus);
        
        // 添加一个地面来显示阴影
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf1f2f6,    // 浅灰色地面
            transparent: true,
            opacity: 0.8
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -10;
        plane.receiveShadow = true;
        this.scene.add(plane);
        
        // 添加参考网格 - 更清晰的网格
        const gridHelper = new THREE.GridHelper(50, 50, 0x70a1ff, 0xa4b0be);
        gridHelper.position.y = -9.9; // 稍微高于地面避免重叠
        this.scene.add(gridHelper);
        
        console.log('Three.js场景初始化完成');
    }
    
    // 初始化摄像头
    async initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            this.video.srcObject = stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    resolve();
                };
            });
        } catch (error) {
            throw new Error('无法访问摄像头: ' + error.message);
        }
    }
    
    // 初始化MediaPipe人脸检测
    async initFaceMesh() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });
        
        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        this.faceMesh.onResults((results) => {
            this.processFaceResults(results);
        });
        
        // 创建摄像头处理器
        this.camera_processor = new Camera(this.video, {
            onFrame: async () => {
                await this.faceMesh.send({ image: this.video });
            },
            width: 640,
            height: 480
        });
        
        this.camera_processor.start();
    }
    
    // 处理人脸检测结果
    processFaceResults(results) {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            
            // 获取眼睛关键点 (使用右眼)
            // MediaPipe的人脸关键点索引:
            // 右眼中心: 33, 右眼内角: 133, 右眼外角: 362
            // 左眼中心: 263, 左眼内角: 362, 左眼外角: 398
            
            const rightEyeCenter = landmarks[33];
            const leftEyeCenter = landmarks[263];
            
            // 使用右眼进行追踪 (可以改为左眼或双眼平均)
            const eyeLandmark = rightEyeCenter;
            
            // 将标准化坐标转换为实际坐标
            const videoWidth = this.video.videoWidth;
            const videoHeight = this.video.videoHeight;
            
            const eyeX = eyeLandmark.x * videoWidth;
            const eyeY = eyeLandmark.y * videoHeight;
              // 改进的深度估算 (基于眼睛间距)
            const eyeDistance = Math.abs(rightEyeCenter.x - leftEyeCenter.x) * videoWidth;
            
            // 根据眼睛间距估算Z距离 (改进版本)
            // 正常人眼间距约6.5cm，这里做更精确的转换
            // 使用更合理的基准距离和缩放因子
            let estimatedDistance;
            if (eyeDistance > 0) {
                // 基于相机焦距的简化模型：距离 = (实际眼间距 * 图像焦距) / 图像中眼间距
                // 这里使用经验值进行校准
                estimatedDistance = (6.5 * 400) / eyeDistance; // 400是经验焦距值
            } else {
                estimatedDistance = 60; // 默认距离
            }
            
            // 转换为屏幕坐标系
            // 将摄像头坐标转换为相对于屏幕中心的坐标
            const screenCenterX = window.innerWidth / 2;
            const screenCenterY = window.innerHeight / 2;
            
            // 简化的坐标转换 (实际项目中需要摄像头内参校准)
            const eyeScreenX = (eyeX - videoWidth / 2) / videoWidth * this.screenWidth;
            const eyeScreenY = -(eyeY - videoHeight / 2) / videoHeight * this.screenHeight;
            
            // 放宽距离限制，允许更近的距离
            const eyeScreenZ = Math.max(10, Math.min(200, estimatedDistance)); // 允许10-200cm范围
              this.eyePosition = {
                x: eyeScreenX,
                y: eyeScreenY,
                z: eyeScreenZ
            };
            
            // 保存原始眼间距用于调试
            this.rawEyeDistance = eyeDistance;
            this.rawEstimatedDistance = estimatedDistance;
            
            this.isTracking = true;
            this.updateEyePositionDisplay();
            
        } else {
            this.isTracking = false;
        }
    }
    
    // 更新相机位置以实现"窗户"效果
    updateCameraForWindowEffect() {
        if (!this.isTracking) return;
        
        // 设置相机位置为眼睛位置
        this.camera.position.set(
            this.eyePosition.x,
            this.eyePosition.y,
            this.eyePosition.z
        );
        
        // 相机看向屏幕中心 (0, 0, 0)
        this.camera.lookAt(0, 0, 0);
        
        // 实现离轴透视投影
        this.setupOffAxisProjection();
    }
    
    // 设置离轴透视投影
    setupOffAxisProjection() {
        const near = 0.1;
        const far = 1000;
        
        // 屏幕边界 (相对于屏幕中心)
        const left = -this.screenWidth / 2;
        const right = this.screenWidth / 2;
        const bottom = -this.screenHeight / 2;
        const top = this.screenHeight / 2;
        const screenZ = 0; // 屏幕在Z=0平面
        
        // 眼睛位置
        const eyeX = this.eyePosition.x;
        const eyeY = this.eyePosition.y;
        const eyeZ = this.eyePosition.z;
        
        // 计算离轴投影参数
        const frustumLeft = left * near / (eyeZ - screenZ) - eyeX * near / (eyeZ - screenZ);
        const frustumRight = right * near / (eyeZ - screenZ) - eyeX * near / (eyeZ - screenZ);
        const frustumBottom = bottom * near / (eyeZ - screenZ) - eyeY * near / (eyeZ - screenZ);
        const frustumTop = top * near / (eyeZ - screenZ) - eyeY * near / (eyeZ - screenZ);
        
        // 更新相机投影矩阵
        this.camera.projectionMatrix.makePerspective(
            frustumLeft, frustumRight,
            frustumBottom, frustumTop,
            near, far
        );
        this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
    }
      // 开始渲染循环
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // 让物体有一些动画效果
            if (this.cube) {
                this.cube.rotation.x += 0.01;
                this.cube.rotation.y += 0.01;
            }
            
            if (this.sphere) {
                this.sphere.position.y = Math.sin(Date.now() * 0.002) * 3;
            }
            
            // 圆环的旋转动画
            if (this.torus) {
                this.torus.rotation.x += 0.02;
                this.torus.rotation.y += 0.01;
            }
            
            // 根据眼睛位置更新相机
            this.updateCameraForWindowEffect();
            
            // 渲染场景
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }
    
    // 更新状态显示
    updateStatus(message, type = 'status') {
        this.statusEl.textContent = message;
        this.statusEl.className = type;
    }    // 更新眼睛位置显示
    updateEyePositionDisplay() {
        if (this.isTracking) {
            this.eyePositionEl.textContent = 
                `X:${this.eyePosition.x.toFixed(1)} Y:${this.eyePosition.y.toFixed(1)}`;
            this.distanceEl.textContent = `${this.eyePosition.z.toFixed(1)}cm`;
            this.eyeDistanceEl.textContent = `${this.rawEyeDistance ? this.rawEyeDistance.toFixed(1) : '-'}px`;
        } else {
            this.eyePositionEl.textContent = '未检测';
            this.distanceEl.textContent = '-';
            this.eyeDistanceEl.textContent = '-';
        }
    }
    
    // 处理窗口大小变化
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// 页面加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new WonkaVision();
    
    // 处理窗口大小变化
    window.addEventListener('resize', () => {
        app.handleResize();
    });
    
    // 调试信息
    console.log('WonkaVision应用已启动');
    console.log('请确保允许摄像头权限并将脸部置于摄像头视野内');
});
