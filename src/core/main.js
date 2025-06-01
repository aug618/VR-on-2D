import * as THREE from 'three';
import { params } from './config.js';
import {
    canvas, renderer, scene, camera,
    eyePosition, targetPosition, backgroundGridGroup
} from './sceneElements.js';
import { setupGUI } from '../ui/guiManager.js';
import { setupFog } from '../managers/fogManager.js';
import { updateBackgroundGrid } from '../managers/backgroundGridManager.js';
import { createVirtualScreen } from '../managers/virtualScreenManager.js';
import { setupTargetScene, updateTargetVisibility, updateTargetPosition, setAllTargetsVisibility, getTargetsData, updateSpawnAnimation, updateLineMaterials, replaySpawnAnimation } from '../managers/targetObjectManager.js';
import { initializeMediaPipe } from '../tracking/mediaPipeHandler.js';
import { createTextOverlay, updateTextOverlayVisibility } from '../managers/textOverlayManager.js';

const videoElement = document.getElementsByClassName('input_video')[0];

// 初始化场景
setupFog(scene, params);
updateBackgroundGrid(scene, params, backgroundGridGroup);
createVirtualScreen(scene, params);
setupTargetScene(scene);
createTextOverlay();

// 设置GUI控制面板
setupGUI(params, {
    updateBackgroundGrid: () => updateBackgroundGrid(scene, params, backgroundGridGroup),
    setupFog: () => setupFog(scene, params),
    createVirtualScreen: () => createVirtualScreen(scene, params),
    updateTargetVisibility,
    updateTargetPosition,
    setAllTargetsVisibility,
    getTargetsData,
    updateLineMaterials,
    updateTextOverlayVisibility,
    replaySpawnAnimation
});

// 初始化MediaPipe
initializeMediaPipe(videoElement);

// 离轴投影更新
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

// 主动画循环
function animate() {
    camera.position.lerp(targetPosition, params.smoothingFactor);
    updateSpawnAnimation();
    updateOffAxisProjection();
    
    const currentCanvas = renderer.domElement;
    const width = currentCanvas.clientWidth;
    const height = currentCanvas.clientHeight;
    if (currentCanvas.width !== width || currentCanvas.height !== height) {
        renderer.setSize(width, height, false);
    }
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
