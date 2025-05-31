import * as THREE from 'three';

const targetsData = [
    // 主要的突出目标 (参考 "spatial commerce" 图片)
    { pos: new THREE.Vector3(-1, 3.5, -23), colors: [0xffd700, 0xffa500, 0xff4500, 0x333333], initialRadius: 6.5, radiusShrinkFactor: 0.15, discHeight: 0.4, line: 60, lineColor: 0xffffff },
    // 周围较小的目标 - 确保 lineColor 足够亮
    { pos: new THREE.Vector3(16, 7, -38), colors: [0x00fa9a, 0x00ced1, 0x20b2aa], initialRadius: 2.8, radiusShrinkFactor: 0.2, discHeight: 0.3, line: 35, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(-13, -6, -42), colors: [0x1e90ff, 0x4169e1, 0x0000cd], initialRadius: 3.2, radiusShrinkFactor: 0.18, discHeight: 0.35, line: 40, lineColor: 0xf0f0f0 },
    { pos: new THREE.Vector3(9, -11, -53), colors: [0xff69b4, 0xff1493, 0xc71585], initialRadius: 3.0, radiusShrinkFactor: 0.22, discHeight: 0.3, line: 45, lineColor: 0xffffff },
    { pos: new THREE.Vector3(22, 2, -65), colors: [0xadff2f, 0x7cfc00], initialRadius: 2.5, radiusShrinkFactor: 0.25, discHeight: 0.25, line: 50, lineColor: 0xdcdcdc },
    { pos: new THREE.Vector3(-20, 12, -33), colors: [0xffdead, 0xf4a460], initialRadius: 2.9, radiusShrinkFactor: 0.2, discHeight: 0.3, line: 30, lineColor: 0xf5f5f5 },
    { pos: new THREE.Vector3(2, 16, -48), colors: [0xda70d6, 0xba55d3], initialRadius: 2.7, radiusShrinkFactor: 0.18, discHeight: 0.3, line: 42, lineColor: 0xffffff },
    { pos: new THREE.Vector3(-7, 11, -58), colors: [0x98fb98, 0x3cb371], initialRadius: 3.0, radiusShrinkFactor: 0.2, discHeight: 0.32, line: 48, lineColor: 0xf8f8f8 },
    { pos: new THREE.Vector3(12, 5, -75), colors: [0xff7f50, 0xff6347], initialRadius: 2.6, radiusShrinkFactor: 0.22, discHeight: 0.28, line: 55, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(-27, -10, -40), colors: [0x87cefa, 0x00bfff], initialRadius: 3.1, radiusShrinkFactor: 0.19, discHeight: 0.33, line: 38, lineColor: 0xf0f0f0 },
    { pos: new THREE.Vector3(24, -14, -55), colors: [0xffb6c1, 0xff69b4], initialRadius: 2.8, radiusShrinkFactor: 0.21, discHeight: 0.3, line: 46, lineColor: 0xffffff },
    { pos: new THREE.Vector3(6, -3, -20), colors: [0x40e0d0, 0x008080], initialRadius: 2.0, radiusShrinkFactor: 0.2, discHeight: 0.25, line: 25, lineColor: 0xf5f5f5 },
    { pos: new THREE.Vector3(-10, -9, -29), colors: [0xffc0cb, 0xff69b4], initialRadius: 2.2, radiusShrinkFactor: 0.18, discHeight: 0.28, line: 28, lineColor: 0xf8f8f8 },
    { pos: new THREE.Vector3(18, 15, -60), colors: [0xdda0dd, 0xda70d6], initialRadius: 2.4, radiusShrinkFactor: 0.2, discHeight: 0.3, line: 40, lineColor: 0xeeeeee },
    { pos: new THREE.Vector3(-15, 1, -70), colors: [0xb0e0e6, 0xadd8e6], initialRadius: 2.3, radiusShrinkFactor: 0.22, discHeight: 0.32, line: 52, lineColor: 0xf0f0f0 },
];

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
        const discMaterial = new THREE.MeshBasicMaterial({ color: discColors[i] });
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
    const lineMaterial = new THREE.LineBasicMaterial({ color: lineColor, linewidth: 1.5, fog: true });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    targetGroup.add(line);
    
    return targetGroup;
}

export function setupTargetScene(scene) {
    targetsData.forEach(data => {
        const target = createTargetObject(
            data.pos,
            data.colors,
            data.initialRadius,
            data.radiusShrinkFactor,
            data.discHeight,
            data.line,
            data.lineColor
        );
        scene.add(target);
    });
}
