import * as THREE from 'three';

const targetsData = [
    // 虚拟屏幕前的目标 (会从屏幕中冲出来) - Z坐标为正值
    { pos: new THREE.Vector3(-6.8, -13.6, 8.1), colors: [0xffff00, 0xff8c00, 0xff4500, 0xff0000], initialRadius: 1.1, radiusShrinkFactor: 0.15, discHeight: 0.3, line: 65, lineColor: 0xffffff },
    { pos: new THREE.Vector3(-1.4, -5.4, 32.4), colors: [0x00ff00, 0x00ff7f, 0x00ffff, 0x0080ff], initialRadius: 1.0, radiusShrinkFactor: 0.2, discHeight: 0.25, line: 70, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(1.3, -8.1, -13.6), colors: [0x0080ff, 0x4169e1, 0x8a2be2, 0xff1493], initialRadius: 1.1, radiusShrinkFactor: 0.18, discHeight: 0.28, line: 60, lineColor: 0xf0f0f0 },
    { pos: new THREE.Vector3(6.7, -14.9, 0), colors: [0xff1493, 0xff69b4, 0xffc0cb, 0xffff80], initialRadius: 0.9, radiusShrinkFactor: 0.2, discHeight: 0.25, line: 68, lineColor: 0xffffff },
    { pos: new THREE.Vector3(-8.1, -10, 10.8), colors: [0x32cd32, 0x7fff00, 0xadff2f, 0x80ff00], initialRadius: 1.0, radiusShrinkFactor: 0.16, discHeight: 0.3, line: 75, lineColor: 0xf8f8f8 },
    
    // 虚拟屏幕后的目标 (会显得有深度) - Z坐标为负值
    { pos: new THREE.Vector3(2.7, -17.6, -32.5), colors: [0xff6347, 0xff4500, 0xdc143c, 0x8b0000], initialRadius: 1.4, radiusShrinkFactor: 0.15, discHeight: 0.32, line: 80, lineColor: 0xffffff },
    { pos: new THREE.Vector3(-5.4, -12.2, -81.2), colors: [0x9370db, 0x8a2be2, 0x9400d3, 0x4b0082], initialRadius: 1.3, radiusShrinkFactor: 0.18, discHeight: 0.3, line: 85, lineColor: 0xdcdcdc },
    { pos: new THREE.Vector3(8.1, -6, -86.7), colors: [0x00ced1, 0x20b2aa, 0x008b8b, 0x2f4f4f], initialRadius: 1.4, radiusShrinkFactor: 0.16, discHeight: 0.33, line: 90, lineColor: 0xf5f5f5 },
    { pos: new THREE.Vector3(-12, -17.6, -32.5), colors: [0xffd700, 0xffa500, 0xff8c00, 0xffa500], initialRadius: 1.3, radiusShrinkFactor: 0.17, discHeight: 0.31, line: 78, lineColor: 0xffffff },
    { pos: new THREE.Vector3(4, -11, -86.7), colors: [0xff0080, 0xff1493, 0xff69b4, 0xffc0cb], initialRadius: 1.5, radiusShrinkFactor: 0.15, discHeight: 0.34, line: 95, lineColor: 0xf8f8f8 },
    { pos: new THREE.Vector3(-15, -7, -32), colors: [0x00ff80, 0x32cd32, 0x228b22, 0x006400], initialRadius: 1.2, radiusShrinkFactor: 0.19, discHeight: 0.3, line: 88, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(13, -17, -45), colors: [0x4080ff, 0x1e90ff, 0x0000ff, 0x000080], initialRadius: 1.6, radiusShrinkFactor: 0.14, discHeight: 0.35, line: 100, lineColor: 0xf0f0f0 },
    
    // 接近屏幕的目标
    { pos: new THREE.Vector3(-15, -9.5, -32), colors: [0xff8000, 0xff6347, 0xff4500, 0xdc143c], initialRadius: 0.8, radiusShrinkFactor: 0.22, discHeight: 0.22, line: 55, lineColor: 0xf5f5f5 },
    { pos: new THREE.Vector3(6.7, -17, -70.4), colors: [0x80ff00, 0x7fff00, 0x32cd32, 0x228b22], initialRadius: 0.9, radiusShrinkFactor: 0.2, discHeight: 0.24, line: 58, lineColor: 0xf8f8f8 },
    { pos: new THREE.Vector3(-2, -13, -5), colors: [0x8000ff, 0x9400d3, 0x8a2be2, 0x4b0082], initialRadius: 0.9, radiusShrinkFactor: 0.18, discHeight: 0.25, line: 62, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(9.5, -9.5, 0), colors: [0x00ff40, 0x00ff7f, 0x3cb371, 0x228b22], initialRadius: 1.0, radiusShrinkFactor: 0.17, discHeight: 0.26, line: 65, lineColor: 0xf0f0f0 },
    { pos: new THREE.Vector3(-13.6, -2.7, -13.6), colors: [0xff0040, 0xff1493, 0xc71585, 0x8b008b], initialRadius: 0.9, radiusShrinkFactor: 0.19, discHeight: 0.24, line: 60, lineColor: 0xffffff },
    
    // 增加更多分散的目标
    { pos: new THREE.Vector3(9, -5, -15), colors: [0x40ff80, 0x00ff7f, 0x3cb371, 0x2e8b57], initialRadius: 1.7, radiusShrinkFactor: 0.13, discHeight: 0.36, line: 105, lineColor: 0xf8f8f8 },
    { pos: new THREE.Vector3(-5, -16, -37.9), colors: [0xff4080, 0xff69b4, 0xffc0cb, 0xffb6c1], initialRadius: 1.4, radiusShrinkFactor: 0.16, discHeight: 0.32, line: 92, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(14, -18, -50), colors: [0x8040ff, 0x9370db, 0xdda0dd, 0xd8bfd8], initialRadius: 1.5, radiusShrinkFactor: 0.15, discHeight: 0.33, line: 98, lineColor: 0xf0f0f0 },
    { pos: new THREE.Vector3(-6.8, -4.1, -51.5), colors: [0x40ffff, 0x00ced1, 0x87ceeb, 0x87cefa], initialRadius: 1.8, radiusShrinkFactor: 0.12, discHeight: 0.37, line: 110, lineColor: 0xffffff },
];

let targetObjects = []; // 存储创建的目标对象

// (模块内部使用)
function createTargetObject(position, discColors, initialRadius, radiusShrinkFactor, discHeight, lineLength, lineColor) {
    const targetGroup = new THREE.Group();
    targetGroup.position.copy(position);
    targetGroup.rotation.x = Math.PI / 2;

    let currentRadius = initialRadius;
    let accumulatedYOffset = 0; 

    for (let i = 0; i < discColors.length; i++) {
        if (currentRadius <= 0.01) break; 

        const discGeometry = new THREE.CylinderGeometry(
            currentRadius, currentRadius, discHeight, 32
        );
        // 增强圆环的亮度和可见性，减少雾效的影响
        const discMaterial = new THREE.MeshBasicMaterial({ 
            color: discColors[i],
            fog: false, // 禁用雾效影响，保持圆环清晰
            transparent: false,
            emissive: discColors[i], // 添加自发光效果
            emissiveIntensity: 0.3 // 适度的自发光强度
        });
        const discMesh = new THREE.Mesh(discGeometry, discMaterial);
        
        discMesh.position.y = accumulatedYOffset + discHeight / 2;
        targetGroup.add(discMesh);

        accumulatedYOffset += discHeight; 
        currentRadius *= (1 - radiusShrinkFactor); 
    }

    const linePoints = [];
    linePoints.push(new THREE.Vector3(0, 0, 0)); 
    linePoints.push(new THREE.Vector3(0, -lineLength, 0));

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    // 增强连接线的可见性，使其穿透雾效
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: lineColor, 
        linewidth: 3.0, // 进一步增加线宽
        fog: false, // 禁用雾效影响，保持线条清晰
        transparent: true,
        opacity: 0.95 // 高不透明度
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    targetGroup.add(line);
    
    return targetGroup;
}

export function setupTargetScene(scene) {
    targetsData.forEach((data, index) => {
        const target = createTargetObject(
            data.pos,
            data.colors,
            data.initialRadius,
            data.radiusShrinkFactor,
            data.discHeight,
            data.line,
            data.lineColor
        );
        target.userData = { index: index, originalPosition: data.pos.clone() };
        targetObjects.push(target);
        scene.add(target);
    });
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
