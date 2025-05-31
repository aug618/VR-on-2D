/* global FaceMesh, Camera */ // 声明 MediaPipe 的全局变量
import { params as appParams } from './config.js'; // 使用别名以避免与局部变量冲突
import { eyePosition, targetPosition } from './sceneElements.js'; // 导入共享的3D向量

export function initializeMediaPipe(videoElement) {
    // onResults 函数现在是此模块的一部分
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
            // FOCAL_LENGTH_PX 会在每次 onResults 调用时使用最新的 appParams.fov
            const FOCAL_LENGTH_PX = (videoElement.videoWidth / 2) / Math.tan((appParams.fov / 2) * Math.PI / 180);
            
            // --- DEBUG LOGGING START ---
            // console.log(`Video Width: ${videoElement.videoWidth}, FOV: ${appParams.fov}, Calculated Focal Length (px): ${FOCAL_LENGTH_PX.toFixed(2)}`);
            // console.log(`Iris Pixel Width: ${irisPixelWidth.toFixed(2)}`);
            // --- DEBUG LOGGING END ---

            let rawDepth = (FOCAL_LENGTH_PX * KNOWN_IRIS_DIAMETER_MM) / (irisPixelWidth * 10); // irisPixelWidth * 10 for mm to cm conversion if KNOWN_IRIS_DIAMETER_MM is in mm
            
            // --- DEBUG LOGGING START ---
            // console.log(`Raw Depth (cm) before clamping: ${rawDepth.toFixed(2)}`);
            // --- DEBUG LOGGING END ---

            let depth = Math.max(appParams.minDepth, Math.min(appParams.maxDepth, rawDepth));
            
            // --- DEBUG LOGGING START ---
            // console.log(`Clamped Depth (cm): ${depth.toFixed(2)}, minDepth: ${appParams.minDepth}, maxDepth: ${appParams.maxDepth}`);
            // --- DEBUG LOGGING END ---

            const finalZ = depth * appParams.depthMultiplier;
            
            const eyeCenterX = (rightIrisLeft.x + rightIrisRight.x) / 2;
            const eyeCenterY = (rightIrisLeft.y + rightIrisRight.y) / 2;
            
            let x = (eyeCenterX * videoElement.videoWidth - videoElement.videoWidth / 2) * finalZ / FOCAL_LENGTH_PX;
            let y = (eyeCenterY * videoElement.videoHeight - videoElement.videoHeight / 2) * finalZ / FOCAL_LENGTH_PX;
            
            eyePosition.set(x, -y, finalZ); // 直接更新导入的 eyePosition
            
            appParams.eyeX = parseFloat(x.toFixed(2));
            appParams.eyeY = parseFloat((-y).toFixed(2));
            appParams.eyeZ = parseFloat(finalZ.toFixed(2)); // finalZ 是最终用于显示和相机定位的深度
            
            // --- DEBUG LOGGING START ---
            // console.log(`Final Z (after multiplier): ${finalZ.toFixed(2)}, depthMultiplier: ${appParams.depthMultiplier}`);
            // --- DEBUG LOGGING END ---
            
            targetPosition.set( // 直接更新导入的 targetPosition
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
