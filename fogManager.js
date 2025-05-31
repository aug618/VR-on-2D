import * as THREE from 'three';

export function setupFog(scene, fogParams) {
    scene.background.set(fogParams.fogColor); // 确保背景色与雾色一致
    if (fogParams.fogNear < fogParams.fogFar) { // 仅当near < far时设置雾
        scene.fog = new THREE.Fog(fogParams.fogColor, fogParams.fogNear, fogParams.fogFar);
    } else {
        scene.fog = null; // 如果参数不合法，则移除雾
    }
}
