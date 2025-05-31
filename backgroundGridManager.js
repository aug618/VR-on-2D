import * as THREE from 'three';

// 自定义网格生成函数 (模块内部使用)
function createCustomGrid(width, depth, divisionsW, divisionsD, color) {
    const points = [];
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    const stepW = width / divisionsW;
    const stepD = depth / divisionsD;

    // Lines along Depth (local Z)
    for (let i = 0; i <= divisionsW; i++) {
        const x = -halfWidth + i * stepW;
        points.push(new THREE.Vector3(x, 0, -halfDepth));
        points.push(new THREE.Vector3(x, 0, halfDepth));
    }

    // Lines along Width (local X)
    for (let j = 0; j <= divisionsD; j++) {
        const z = -halfDepth + j * stepD;
        points.push(new THREE.Vector3(-halfWidth, 0, z));
        points.push(new THREE.Vector3(halfWidth, 0, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // 确保网格线材质完全受雾效影响，使远处网格消失
    const material = new THREE.LineBasicMaterial({ 
        color: color, 
        fog: true,
        transparent: true // 增加透明度支持，配合雾效
    });
    return new THREE.LineSegments(geometry, material);
}

export function updateBackgroundGrid(scene, params, backgroundGridGroupInstance) { // gridParams is the full params object
    // 清理旧的网格
    while (backgroundGridGroupInstance.children.length > 0) {
        const child = backgroundGridGroupInstance.children[0];
        backgroundGridGroupInstance.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (typeof child.material.dispose === 'function') {
                child.material.dispose();
            }
        }
    }

    const color = new THREE.Color(params.gridColor);
    const length = params.tunnelLength;
    // 使用屏幕尺寸作为隧道的宽度和高度
    const width = params.screenWidth;
    const height = params.screenHeight;
    const cellSize = params.gridCellSize;

    if (cellSize <= 0) return; 

    // 根据屏幕参数调整 backgroundGridGroupInstance 的 Y 位置
    // 使其 Y 轴中心与虚拟屏幕的 Y 轴中心对齐
    backgroundGridGroupInstance.position.y = -(params.cameraToScreenDistance + params.screenHeight / 2);
    // X 和 Z 位置保持为0，因为屏幕和隧道开口都以世界原点为中心（X轴）或从Z=0开始
    backgroundGridGroupInstance.position.x = 0;
    backgroundGridGroupInstance.position.z = 0;


    // 计算各个方向上的格数
    const divisionsL = Math.max(1, Math.round(length / cellSize)); // 沿隧道长度方向
    const divisionsW = Math.max(1, Math.round(width / cellSize));
    const divisionsH = Math.max(1, Math.round(height / cellSize));
    
    const tunnelCenterZ = -length / 2;

    if (params.showFloorGrid) {
        const floorGrid = createCustomGrid(width, length, divisionsW, divisionsL, color);
        floorGrid.position.y = -height / 2;
        floorGrid.position.z = tunnelCenterZ;
        backgroundGridGroupInstance.add(floorGrid);
    }

    if (params.showCeilingGrid) {
        const ceilingGrid = createCustomGrid(width, length, divisionsW, divisionsL, color);
        ceilingGrid.position.y = height / 2;
        ceilingGrid.position.z = tunnelCenterZ;
        backgroundGridGroupInstance.add(ceilingGrid);
    }

    if (params.showWallGrids) {
        const leftWallGrid = createCustomGrid(height, length, divisionsH, divisionsL, color);
        leftWallGrid.rotation.z = Math.PI / 2;
        leftWallGrid.position.x = -width / 2;
        leftWallGrid.position.z = tunnelCenterZ;
        backgroundGridGroupInstance.add(leftWallGrid);

        const rightWallGrid = createCustomGrid(height, length, divisionsH, divisionsL, color);
        rightWallGrid.rotation.z = Math.PI / 2;
        rightWallGrid.position.x = width / 2;
        rightWallGrid.position.z = tunnelCenterZ;
        backgroundGridGroupInstance.add(rightWallGrid);
    }
    // backgroundGridGroupInstance 已在 sceneElements.js 中添加到 scene
}
