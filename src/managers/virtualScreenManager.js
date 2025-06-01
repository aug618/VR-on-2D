import * as THREE from 'three';

let screenMesh = null;

export function createVirtualScreen(scene, screenParams) {
    if (screenMesh) {
        scene.remove(screenMesh);
        if (screenMesh.geometry) screenMesh.geometry.dispose();
        if (screenMesh.material) screenMesh.material.dispose();
        screenMesh = null;
    }
    
    const points = [
        new THREE.Vector3(-screenParams.screenWidth/2, -screenParams.screenHeight/2, 0),
        new THREE.Vector3(screenParams.screenWidth/2, -screenParams.screenHeight/2, 0),
        new THREE.Vector3(screenParams.screenWidth/2, screenParams.screenHeight/2, 0),
        new THREE.Vector3(-screenParams.screenWidth/2, screenParams.screenHeight/2, 0),
        new THREE.Vector3(-screenParams.screenWidth/2, -screenParams.screenHeight/2, 0)
    ];
    
    const screenGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const screenMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.15
    });
    screenMesh = new THREE.Line(screenGeometry, screenMaterial);
    
    screenMesh.position.set(0, -screenParams.cameraToScreenDistance - screenParams.screenHeight/2, 0);
    scene.add(screenMesh);
}
