import * as THREE from 'three';
// MediaPipe的 FaceMesh 和 Camera 是通过CDN脚本全局加载的，此处不通过ES6模块导入

import { params } from './config.js';
import {
    canvas, renderer, scene, camera,
    eyePosition, targetPosition, backgroundGridGroup
} from './sceneElements.js';
import { setupGUI } from './guiManager.js';
import { setupFog } from './fogManager.js';
import { updateBackgroundGrid } from './backgroundGridManager.js';
import { createVirtualScreen } from './virtualScreenManager.js';
import { setupTargetScene, updateTargetVisibility, updateTargetPosition, setAllTargetsVisibility, getTargetsData } from './targetObjectManager.js';
import { initializeMediaPipe } from './mediaPipeHandler.js';

// --- Video Element ---
const videoElement = document.getElementsByClassName('input_video')[0];

// --- Initial Setup Calls ---
// 这些函数现在从各自的模块中导入
setupFog(scene, params);
updateBackgroundGrid(scene, params, backgroundGridGroup);
createVirtualScreen(scene, params);
setupTargetScene(scene); // targetsData 现在是 targetObjectManager 的一部分

// --- GUI Setup ---
// GUI设置函数也从模块导入，并传入所需的回调
setupGUI(params, {
    updateBackgroundGrid: () => updateBackgroundGrid(scene, params, backgroundGridGroup),
    setupFog: () => setupFog(scene, params),
    createVirtualScreen: () => createVirtualScreen(scene, params),
    updateTargetVisibility: updateTargetVisibility,
    updateTargetPosition: updateTargetPosition,
    setAllTargetsVisibility: setAllTargetsVisibility,
    getTargetsData: getTargetsData
});

// --- MediaPipe Initialization ---
// onResults 函数的逻辑已移至 mediaPipeHandler.js
initializeMediaPipe(videoElement); // 传递 videoElement；其他依赖项由 mediaPipeHandler 内部导入

// --- Off-Axis Projection ---
// 此函数依赖于 camera (从 sceneElements.js 导入) 和 params (从 config.js 导入)
function updateOffAxisProjection() {
    const near = 0.1;
    const far = 1000;
    
    const screenCenterX = 0;
    const screenCenterY = -(params.cameraToScreenDistance + params.screenHeight / 2);
    const screenCenterZ = 0;
    
    const screenLeft = screenCenterX - params.screenWidth / 2 - camera.position.x;
    const screenRight = screenCenterX + params.screenWidth / 2 - camera.position.x;
    const screenTop = screenCenterY + params.screenHeight / 2 - camera.position.y;
    const screenBottom = screenCenterY - params.screenHeight / 2 - camera.position.y;
    const screenDistance = Math.abs(camera.position.z - screenCenterZ);
    
    const left = screenLeft * near / screenDistance;
    const right = screenRight * near / screenDistance;
    const top = screenTop * near / screenDistance;
    const bottom = screenBottom * near / screenDistance;
    
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

// --- Animation Loop ---
function animate() {
    // targetPosition 由 mediaPipeHandler 更新 (通过导入的 sceneElements.targetPosition)
    camera.position.lerp(targetPosition, params.smoothingFactor);
    
    updateOffAxisProjection();
    
    // 调整渲染器尺寸
    const currentCanvas = renderer.domElement; // renderer 从 sceneElements.js 导入
    const width = currentCanvas.clientWidth;
    const height = currentCanvas.clientHeight;
    if (currentCanvas.width !== width || currentCanvas.height !== height) {
        renderer.setSize(width, height, false);
        // 对于偏轴投影，camera.aspect 不是直接使用的，但如果恢复到标准 PerspectiveCamera，则需要更新
    }
    
    renderer.render(scene, camera); // scene 和 camera 从 sceneElements.js 导入
    requestAnimationFrame(animate);
}

// --- Start Animation ---
animate();