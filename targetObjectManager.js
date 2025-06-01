import * as THREE from 'three';
import { params } from './config.js';

const targetsData = [
    // 虚拟屏幕前的目标 (会从屏幕中冲出来) - Z坐标为正值
    { pos: new THREE.Vector3(-6.8, -12.2, 8.1), colors: [0xffff00, 0xff8c00, 0xff4500, 0xdc143c], initialRadius: 0.9, discHeight: 0.3, line: 65, lineColor: 0xffffff },
    { pos: new THREE.Vector3(-1.4, -5.4, 32.4), colors: [0xf8ce0e,0xea6d04 , 0xe90826, 0x8e0c64], initialRadius: 0.6, discHeight: 0.25, line: 70, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(1.3, -8.1, -27.1), colors: [0x0080ff, 0x4169e1, 0x8a2be2, 0xff1493], initialRadius: 1.1, discHeight: 0.28, line: 60, lineColor: 0xf0f0f0 },
    { pos: new THREE.Vector3(6.7, -14.9, 0), colors: [0xff1493, 0xff69b4, 0xffc0cb, 0x32cd32], initialRadius: 0.9, discHeight: 0.25, line: 68, lineColor: 0xffffff },
    { pos: new THREE.Vector3(-8.1, -9.5, -8.2), colors: [0x32cd32, 0x7fff00, 0xadff2f, 0xffff00], initialRadius: 1.0, discHeight: 0.3, line: 75, lineColor: 0xf8f8f8 },
    
    // 虚拟屏幕后的目标 (会显得有深度) - Z坐标为负值
    { pos: new THREE.Vector3(2.7, -17.6, -32.5), colors: [0xff6347, 0xff4500, 0xdc143c, 0x8b0000], initialRadius: 1.4, discHeight: 0.32, line: 80, lineColor: 0xffffff },
    { pos: new THREE.Vector3(-5.4, -12.2, -10.9), colors: [0x9370db, 0x8a2be2, 0x9400d3, 0x4b0082], initialRadius: 1.0, discHeight: 0.3, line: 85, lineColor: 0xdcdcdc },
    { pos: new THREE.Vector3(8.1, -6, -86.7), colors: [0x00ced1, 0x20b2aa, 0x008b8b, 0x006666], initialRadius: 1.4, discHeight: 0.33, line: 90, lineColor: 0xf5f5f5 },
    { pos: new THREE.Vector3(2.7, -2.7, -67.7), colors: [0xffd700, 0xffa500, 0xff8c00, 0xff6347], initialRadius: 1.3, discHeight: 0.31, line: 78, lineColor: 0xffffff },
    { pos: new THREE.Vector3(6.7, -11, -86.7), colors: [0xff0080, 0xff1493, 0xff69b4, 0xffc0cb], initialRadius: 1.5, discHeight: 0.34, line: 95, lineColor: 0xf8f8f8 },
    { pos: new THREE.Vector3(-10.8, -7, -32), colors: [0x00ff80, 0x32cd32, 0x228b22, 0x006400], initialRadius: 0.9, discHeight: 0.3, line: 88, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(10.8, -13.6, -100), colors: [0x4080ff, 0x1e90ff, 0x0000ff, 0x000080], initialRadius: 1.6, discHeight: 0.35, line: 100, lineColor: 0xf0f0f0 },
    
    // 接近屏幕的目标
    { pos: new THREE.Vector3(-9.5, -9.5, -92.1), colors: [0xff8000, 0xff6347, 0xff4500, 0xb22222], initialRadius: 0.8, discHeight: 0.22, line: 55, lineColor: 0xf5f5f5 },
    { pos: new THREE.Vector3(9.5, -17.6, -94.8), colors: [0x80ff00, 0x7fff00, 0x32cd32, 0x228b22], initialRadius: 0.9, discHeight: 0.24, line: 58, lineColor: 0xf8f8f8 },
    { pos: new THREE.Vector3(-2, -19, -54.2), colors: [0x8000ff, 0x9400d3, 0x8a2be2, 0x663399], initialRadius: 0.9, discHeight: 0.25, line: 62, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(10.8, -9.5, 0), colors: [0x00ff40, 0x00ff7f, 0x3cb371, 0x2e8b57], initialRadius: 1.0, discHeight: 0.26, line: 65, lineColor: 0xf0f0f0 },
    { pos: new THREE.Vector3(-12.2, -2.7, -13.6), colors: [0xff0040, 0xff1493, 0xc71585, 0x8b0040], initialRadius: 0.9, discHeight: 0.24, line: 60, lineColor: 0xffffff },
    
    // 增加更多分散的目标
    { pos: new THREE.Vector3(9, -5, -19), colors: [0x40ff80, 0x00ff7f, 0x3cb371, 0x20b2aa], initialRadius: 1.3, discHeight: 0.36, line: 105, lineColor: 0xf8f8f8 },
    { pos: new THREE.Vector3(-5, -14.9, -46.1), colors: [0xff4080, 0xff69b4, 0xffc0cb, 0xffb6c1], initialRadius: 1.0, discHeight: 0.32, line: 92, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(14, -18, -50), colors: [0x8040ff, 0x9370db, 0xdda0dd, 0xd8bfd8], initialRadius: 1.1, discHeight: 0.33, line: 98, lineColor: 0xf0f0f0 },
    { pos: new THREE.Vector3(-6.8, -4.1, -51.5), colors: [0x40ffff, 0x00ced1, 0x87ceeb, 0x87cefa], initialRadius: 1.4, discHeight: 0.37, line: 110, lineColor: 0xffffff },
];

let targetObjects = []; // 存储创建的目标对象
let animationStartTime = 0; // 动画开始时间
let isAnimationActive = true; // 动画是否激活

// 创建自定义线条着色器材质（保留用于备用）
function createCustomLineMaterial(color, params) {
    const vertexShader = `
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            
            vec4 viewPosition = viewMatrix * worldPosition;
            vViewPosition = viewPosition.xyz;
            
            gl_Position = projectionMatrix * viewPosition;
        }
    `;
    
    const fragmentShader = `
        uniform vec3 color;
        uniform float fogNear;
        uniform float fogFar;
        uniform vec3 fogColor;
        uniform float opacity;
        uniform float brightness;
        
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        
        void main() {
            // 计算到摄像机的距离
            float distance = length(vViewPosition);
            
            // 计算雾效因子
            float fogFactor = 1.0;
            if (distance > fogNear) {
                fogFactor = 1.0 - smoothstep(fogNear, fogFar, distance);
            }
            
            // 应用亮度和雾效
            vec3 finalColor = color * brightness;
            finalColor = mix(fogColor, finalColor, fogFactor);
            
            gl_FragColor = vec4(finalColor, opacity * fogFactor);
        }
    `;
    
    return new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(color) },
            fogNear: { value: params.lineFogNear },
            fogFar: { value: params.lineFogFar },
            fogColor: { value: new THREE.Color(params.fogColor) },
            opacity: { value: params.lineOpacity },
            brightness: { value: params.lineBrightness }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true
    });
}

// 更新线条材质参数的函数
export function updateLineMaterials() {
    targetObjects.forEach(target => {
        // 找到线条对象（现在是圆柱体）
        const lineObject = target.children.find(child => child.userData && child.userData.isTargetLine);
        if (lineObject) {
            // 更新材质参数
            if (lineObject.material.uniforms) {
                lineObject.material.uniforms.fogNear.value = params.lineFogNear;
                lineObject.material.uniforms.fogFar.value = params.lineFogFar;
                lineObject.material.uniforms.fogColor.value.set(params.fogColor);
                lineObject.material.uniforms.opacity.value = params.lineOpacity;
                lineObject.material.uniforms.brightness.value = params.lineBrightness;
            }
            
            // 更新线条粗细 - 重新创建几何体
            const lineLength = lineObject.userData.originalLength;
            const newRadius = params.lineWidth * 0.01; // 将lineWidth转换为合适的半径
            
            // 销毁旧几何体
            if (lineObject.geometry) {
                lineObject.geometry.dispose();
            }
            
            // 创建新几何体
            lineObject.geometry = new THREE.CylinderGeometry(
                newRadius, 
                newRadius, 
                lineLength, 
                8 // 使用8边形，足够圆滑且性能好
            );
        }
    });
}

// (模块内部使用)
function createTargetObject(position, discColors, initialRadius, discHeight, lineLength, lineColor) {
    const targetGroup = new THREE.Group();
    targetGroup.position.copy(position);
    // 旋转圆柱体，使其面向Z轴方向（圆面朝前）
    targetGroup.rotation.x = Math.PI / 2;

    // 创建4个同心实心圆柱体，都在同一高度
    const radiusStep = initialRadius / 4; // 平均分配半径给4个圆环
    
    for (let i = 0; i < 4; i++) {
        const currentRadius = initialRadius - (i * radiusStep * 0.8); // 外径递减
        
        // 使用实心圆柱体，增加分段数提高圆度，增加厚度
        const discGeometry = new THREE.CylinderGeometry(
            currentRadius, 
            currentRadius, 
            discHeight * 2.5, // 增加厚度到原来的两倍
            64 // 大幅增加径向分段数，使其更圆
        );
        
        // 大幅提高荧光亮度
        const originalColor = new THREE.Color(discColors[i]);
        const brightenedColor = originalColor.clone().multiplyScalar(1.2); // 提高亮度到120%
        
        const discMaterial = new THREE.MeshPhongMaterial({ 
            color: brightenedColor,
            fog: false, // 禁用雾效影响，保持圆环清晰
            transparent: false,
            emissive: brightenedColor.clone().multiplyScalar(0.6), // 大幅增强自发光，类似荧光
            shininess: 50, // 增加光泽度
            specular: 0x666666 // 增强镜面反射
        });
        const discMesh = new THREE.Mesh(discGeometry, discMaterial);
        
        // 圆柱体朝Z轴方向摆放，所有圆柱体都在同一位置
        discMesh.position.y = 0;
        targetGroup.add(discMesh);
    }

    // 使用圆柱体几何体替代线条，以实现可控粗细
    const actualLineLength = lineLength * 3.0;
    const lineRadius = params.lineWidth * 0.01; // 将lineWidth参数转换为半径
    
    const lineGeometry = new THREE.CylinderGeometry(
        lineRadius, 
        lineRadius, 
        actualLineLength, 
        8 // 8边形圆柱体，足够圆滑
    );
    
    // 使用自定义着色器材质
    const lineColorBrightened = new THREE.Color(lineColor);
    const lineMaterial = createCustomLineMaterial(lineColorBrightened, params);
    const line = new THREE.Mesh(lineGeometry, lineMaterial); // 改为Mesh而不是Line
    
    // 设置线条位置 - 圆柱体的中心点应该在圆环下方
    line.position.y = -actualLineLength / 2;
    
    // 标记这是目标线条，并存储原始长度
    line.userData = { 
        isTargetLine: true, 
        originalLength: actualLineLength 
    };
    
    targetGroup.add(line);
    
    // 设置初始动画状态
    targetGroup.scale.set(0.1, 0.1, 0.1); // 初始很小
    targetGroup.visible = false; // 初始不可见
    
    return targetGroup;
}

export function setupTargetScene(scene) {
    targetsData.forEach((data, index) => {
        const target = createTargetObject(
            data.pos,
            data.colors,
            data.initialRadius,
            data.discHeight,
            data.line,
            data.lineColor
        );
        target.userData = { 
            index: index, 
            originalPosition: data.pos.clone(),
            animationDelay: index * 0.15, // 每个目标延迟0.15秒出现
            hasAnimated: false
        };
        targetObjects.push(target);
        scene.add(target);
    });
    
    // 启动动画
    startSpawnAnimation();
}

// 启动喷射动画
function startSpawnAnimation() {
    animationStartTime = Date.now();
    isAnimationActive = true;
}

// 更新动画状态
export function updateSpawnAnimation() {
    if (!isAnimationActive) return;
    
    const currentTime = Date.now();
    const elapsedTime = (currentTime - animationStartTime) / 1000; // 转换为秒
    let allAnimationsComplete = true;
    
    targetObjects.forEach(target => {
        const userData = target.userData;
        const animationStartDelay = userData.animationDelay;
        const targetElapsedTime = elapsedTime - animationStartDelay;
        
        if (targetElapsedTime >= 0 && !userData.hasAnimated) {
            target.visible = true;
            
            // 动画持续时间
            const animationDuration = 3.0;
            
            if (targetElapsedTime < animationDuration) {
                // 使用缓出函数创建喷射效果
                const progress = targetElapsedTime / animationDuration;
                const easeOut = 1 - Math.pow(1 - progress, 3); // 三次缓出
                
                // 从远处（更远的Z位置）喷射过来
                const startZ = userData.originalPosition.z - 150; // 从更远处开始
                const currentZ = startZ + (userData.originalPosition.z - startZ) * easeOut;
                
                // 缩放动画：从小到正常大小，带有弹跳效果
                let scaleProgress = progress;
                if (progress > 0.7) {
                    // 在最后30%的时间里添加弹跳效果
                    const bounceProgress = (progress - 0.7) / 0.3;
                    scaleProgress = 1 + Math.sin(bounceProgress * Math.PI * 2) * 0.2 * (1 - bounceProgress);
                }
                
                const scale = 0.1 + (1.0 - 0.1) * scaleProgress;
                
                target.position.set(
                    userData.originalPosition.x,
                    userData.originalPosition.y,
                    currentZ
                );
                target.scale.set(scale, scale, scale);
                
                allAnimationsComplete = false;
            } else {
                // 动画完成，设置到最终位置和大小
                target.position.copy(userData.originalPosition);
                target.scale.set(1, 1, 1);
                userData.hasAnimated = true;
            }
        } else if (targetElapsedTime < 0) {
            allAnimationsComplete = false;
        }
    });
    
    if (allAnimationsComplete) {
        isAnimationActive = false;
    }
}

export function updateTargetVisibility(index, visible) {
    if (targetObjects[index]) {
        targetObjects[index].visible = visible;
    }
}

export function updateTargetPosition(index, x, y, z) {
    if (targetObjects[index]) {
        targetObjects[index].position.set(x, y, z);
    }
}

export function setAllTargetsVisibility(visible) {
    targetObjects.forEach(target => {
        target.visible = visible;
    });
}

export function getTargetsData() {
    return targetsData;
}

export function getTargetObjects() {
    return targetObjects;
}

// 重播动画功能
export function replaySpawnAnimation() {
    // 重置所有目标的动画状态
    targetObjects.forEach(target => {
        target.userData.hasAnimated = false;
        target.visible = false;
        target.scale.set(0.1, 0.1, 0.1);
        // 重置到原始位置
        target.position.copy(target.userData.originalPosition);
    });
    
    // 重新启动动画
    startSpawnAnimation();
}
