import * as THREE from 'three';

export function setupFog(scene, fogParams) {
    scene.background.set(fogParams.fogColor);
    if (fogParams.fogNear < fogParams.fogFar) {
        scene.fog = new THREE.Fog(fogParams.fogColor, fogParams.fogNear, fogParams.fogFar);
    } else {
        scene.fog = null;
    }
}
