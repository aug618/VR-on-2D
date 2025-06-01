import * as THREE from 'three';
import { params } from './config.js';

export const canvas = document.querySelector('#main_canvas');
export const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
export const scene = new THREE.Scene();
scene.background = new THREE.Color(params.fogColor);

export const camera = new THREE.PerspectiveCamera();
camera.position.set(0, 0, 50);
camera.projectionMatrixAutoUpdate = false;

export const eyePosition = new THREE.Vector3();
export const targetPosition = new THREE.Vector3();

export const backgroundGridGroup = new THREE.Group();
scene.add(backgroundGridGroup);

// 光源设置
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 10, -25);
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 100);
pointLight1.position.set(-20, 10, 20);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 80);
pointLight2.position.set(20, -10, -20);
scene.add(pointLight2);
