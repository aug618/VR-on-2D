import * as THREE from 'three';

function createCustomGrid(width, depth, divisionsW, divisionsD, color) {
    const points = [];
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    const stepW = width / divisionsW;
    const stepD = depth / divisionsD;

    for (let i = 0; i <= divisionsW; i++) {
        const x = -halfWidth + i * stepW;
        points.push(new THREE.Vector3(x, 0, -halfDepth));
        points.push(new THREE.Vector3(x, 0, halfDepth));
    }

    for (let j = 0; j <= divisionsD; j++) {
        const z = -halfDepth + j * stepD;
        points.push(new THREE.Vector3(-halfWidth, 0, z));
        points.push(new THREE.Vector3(halfWidth, 0, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: color, 
        fog: true,
        transparent: true
    });
    return new THREE.LineSegments(geometry, material);
}

export function updateBackgroundGrid(scene, params, backgroundGridGroupInstance) {
    // 清理旧网格
    while (backgroundGridGroupInstance.children.length > 0) {
        const child = backgroundGridGroupInstance.children[0];
        backgroundGridGroupInstance.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
    }

    const color = new THREE.Color(params.gridColor);
    const length = params.tunnelLength;
    const width = params.screenWidth;
    const height = params.screenHeight;
    const cellSize = params.gridCellSize;

    if (cellSize <= 0) return; 

    backgroundGridGroupInstance.position.y = -(params.cameraToScreenDistance + params.screenHeight / 2);
    backgroundGridGroupInstance.position.x = 0;
    backgroundGridGroupInstance.position.z = 0;

    const divisionsL = Math.max(1, Math.round(length / cellSize));
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
}
