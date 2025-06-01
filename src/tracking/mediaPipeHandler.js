/* global FaceMesh, Camera */
import { params as appParams } from '../core/config.js';
import { eyePosition, targetPosition } from '../core/sceneElements.js';

export function initializeMediaPipe(videoElement) {
    function onResults(results) {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            const rightIrisLeft = landmarks[473];
            const rightIrisRight = landmarks[468];
            
            const irisPixelWidth = Math.sqrt(
                Math.pow(rightIrisLeft.x * videoElement.videoWidth - rightIrisRight.x * videoElement.videoWidth, 2) +
                Math.pow(rightIrisLeft.y * videoElement.videoHeight - rightIrisRight.y * videoElement.videoHeight, 2)
            );
            
            const KNOWN_IRIS_DIAMETER_MM = 11.7;
            const FOCAL_LENGTH_PX = (videoElement.videoWidth / 2) / Math.tan((appParams.fov / 2) * Math.PI / 180);

            let rawDepth = (FOCAL_LENGTH_PX * KNOWN_IRIS_DIAMETER_MM) / (irisPixelWidth * 10);
            let depth = Math.max(appParams.minDepth, Math.min(appParams.maxDepth, rawDepth));
            const finalZ = depth * appParams.depthMultiplier;
            
            const eyeCenterX = (rightIrisLeft.x + rightIrisRight.x) / 2;
            const eyeCenterY = (rightIrisLeft.y + rightIrisRight.y) / 2;
            
            let x = (eyeCenterX * videoElement.videoWidth - videoElement.videoWidth / 2) * finalZ / FOCAL_LENGTH_PX;
            let y = (eyeCenterY * videoElement.videoHeight - videoElement.videoHeight / 2) * finalZ / FOCAL_LENGTH_PX;
            
            eyePosition.set(-x, -y, finalZ);
            
            appParams.eyeX = parseFloat((-x).toFixed(2));
            appParams.eyeY = parseFloat((-y).toFixed(2));
            appParams.eyeZ = parseFloat(finalZ.toFixed(2));
            
            targetPosition.set(
                eyePosition.x * appParams.movementMultiplier,
                eyePosition.y * appParams.movementMultiplier,
                eyePosition.z
            );
        }
    }

    const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);

    const cameraUtils = new Camera(videoElement, {
        onFrame: async () => {
            await faceMesh.send({ image: videoElement });
        },
        width: 1280,
        height: 720
    });

    cameraUtils.start();
}
