import * as THREE from 'three';
import { params } from './config.js'; // 用于初始背景色等

export const canvas = document.querySelector('#main_canvas');
export const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
export const scene = new THREE.Scene();
scene.background = new THREE.Color(params.fogColor); // 使用配置中的雾颜色作为初始背景色

export const camera = new THREE.PerspectiveCamera(); // FOV, aspect, near, far 将在后续设置或更新
camera.position.set(0, 0, 50);  // 用户眼睛的默认位置
camera.projectionMatrixAutoUpdate = false;

export const eyePosition = new THREE.Vector3();
export const targetPosition = new THREE.Vector3();

export const backgroundGridGroup = new THREE.Group(); // 用于存放所有背景网格
scene.add(backgroundGridGroup); // 预先将组添加到场景

// 添加光源 - 增强立体感
const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // 降低环境光强度
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 10, -25);
directionalLight.castShadow = false; // 关闭阴影以提高性能
scene.add(directionalLight);

// 添加额外的点光源增强立体感
const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 100);
pointLight1.position.set(-20, 10, 20);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 80);
pointLight2.position.set(20, -10, -20);
scene.add(pointLight2);
