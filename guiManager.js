import GUI from 'lil-gui';

export function setupGUI(params, callbacks) {
    const gui = new GUI();
    gui.add(params, 'movementMultiplier', 0, 5).name('左右/上下灵敏度');
    gui.add(params, 'depthMultiplier', 0.1, 5.0).name('深度敏感度');
    gui.add(params, 'minDepth', 10, 50).name('最小深度');
    gui.add(params, 'maxDepth', 50, 150).name('最大深度');
    gui.add(params, 'smoothingFactor', 0.01, 0.5).name('平滑系数');

    const coordFolder = gui.addFolder('虹膜中心坐标 (相对于摄像头)');
    // --- 关于坐标显示和渲染效果的说明 ---
    // 1. X坐标值的正负号 和 视觉效果修正:
    //    此GUI直接显示 `params.eyeX` 的值。
    //    您期望：当眼睛（虚拟摄像机）向右移动时，能看到前方物体（如人物模型）的左侧。
    //
    //    如果实际情况仍然是：眼睛向右移动，却看到了物体的右侧，
    //    这几乎可以断定：在 `mediaPipeHandler.js` 文件中，
    //    当您的眼睛向视频画面右侧移动时，用于设置 `eyePosition.x` (以及 `params.eyeX`)
    //    的那个X坐标值的符号是错误的。
    //
    //    请聚焦于 `mediaPipeHandler.js` 文件中计算场景X坐标的部分：
    //    A. 找到类似这样的行:
    //       `let x = (eyeCenterX * videoElement.videoWidth - videoElement.videoWidth / 2) * finalZ / FOCAL_LENGTH_PX;`
    //    B. 然后找到使用这个 `x` (或类似变量) 来设置 `eyePosition` 和 `params.eyeX` 的行，例如:
    //       `eyePosition.set(x, -y, finalZ);`
    //       `params.eyeX = parseFloat(x.toFixed(2));`
    //
    //    C. **进行实验**：
    //       如果当前是 `eyePosition.set(x, ...)` 和 `params.eyeX = ...parseFloat(x...).toString()`，
    //       请将其改为 `eyePosition.set(-x, ...)` 和 `params.eyeX = ...parseFloat((-x)...).toString()`.
    //
    //       如果当前已经是 `eyePosition.set(-x, ...)` 和 `params.eyeX = ...parseFloat((-x)...).toString()`，
    //       请将其改回 `eyePosition.set(x, ...)` 和 `params.eyeX = ...parseFloat((x)...).toString()`.
    //
    //    目标是：当您的物理眼睛向右移动时，`params.eyeX` 在此GUI中显示为正数，
    //    并且您在3D场景中能看到前方物体的左侧。这通常需要 `eyePosition.x` 在您右移时为正。
    //
    // 2. 渲染画面的移动方向 (底层投影逻辑):
    //    `main.js` 文件中的 `updateOffAxisProjection` 函数的逻辑通常是正确的，无需修改。
    coordFolder.add(params, 'eyeX').name('X坐标 (cm)').listen().disable();
    coordFolder.add(params, 'eyeY').name('Y坐标 (cm)').listen().disable();
    coordFolder.add(params, 'eyeZ').name('Z坐标/深度 (cm)').listen().disable();

    const screenFolder = gui.addFolder('屏幕校准');
    screenFolder.add(params, 'screenWidth', 20, 60).name('屏幕宽度(cm)');
    screenFolder.add(params, 'screenHeight', 10, 40).name('屏幕高度(cm)');
    screenFolder.add(params, 'cameraToScreenDistance', 0.1, 2).name('摄像头到屏幕距离(cm)');
    screenFolder.onChange(() => {
        callbacks.createVirtualScreen();
        callbacks.updateBackgroundGrid(); // 当屏幕参数变化时，也更新背景网格
    });

    gui.add(params, 'fov', 40, 90).name('摄像头FOV (度)');

    const tunnelFolder = gui.addFolder('背景隧道');
    tunnelFolder.add(params, 'tunnelLength', 50, 1000).name('隧道长度').onChange(callbacks.updateBackgroundGrid);
    tunnelFolder.add(params, 'gridCellSize', 1, 50).name('网格单元大小').onChange(callbacks.updateBackgroundGrid);
    tunnelFolder.addColor(params, 'gridColor').name('网格颜色').onChange(callbacks.updateBackgroundGrid);
    tunnelFolder.add(params, 'showFloorGrid').name('显示地面网格').onChange(callbacks.updateBackgroundGrid);
    tunnelFolder.add(params, 'showCeilingGrid').name('显示顶面网格').onChange(callbacks.updateBackgroundGrid);
    tunnelFolder.add(params, 'showWallGrids').name('显示侧墙网格').onChange(callbacks.updateBackgroundGrid);

    const fogFolder = gui.addFolder('雾效');
    fogFolder.addColor(params, 'fogColor').name('雾颜色').onChange(callbacks.setupFog);
    fogFolder.add(params, 'fogNear', 1, 300).name('雾起始距离').onChange(callbacks.setupFog);
    fogFolder.add(params, 'fogFar', 50, 1000).name('雾终止距离').onChange(callbacks.setupFog);

    // 线条控制面板
    const lineFolder = gui.addFolder('线条效果');
    lineFolder.add(params, 'lineFogNear', 50, 500).name('线条雾起始距离').onChange(() => {
        if (callbacks.updateLineMaterials) callbacks.updateLineMaterials();
    });
    lineFolder.add(params, 'lineFogFar', 100, 800).name('线条雾终止距离').onChange(() => {
        if (callbacks.updateLineMaterials) callbacks.updateLineMaterials();
    });
    lineFolder.add(params, 'lineWidth', 0.5, 5.0).name('线条粗细').onChange(() => {
        if (callbacks.updateLineMaterials) callbacks.updateLineMaterials();
    });
    lineFolder.add(params, 'lineOpacity', 0, 1).name('线条透明度').onChange(() => {
        if (callbacks.updateLineMaterials) callbacks.updateLineMaterials();
    });
    lineFolder.add(params, 'lineBrightness', 0.5, 5.0).name('线条亮度').onChange(() => {
        if (callbacks.updateLineMaterials) callbacks.updateLineMaterials();
    });

    // 目标对象控制面板
    const targetsFolder = gui.addFolder('圆环目标控制');
    targetsFolder.add(params, 'showAllTargets').name('显示所有目标').onChange((value) => {
        callbacks.setAllTargetsVisibility(value);
        // 同步更新所有单个目标的显示状态
        Object.keys(params.targets).forEach(key => {
            if (key.startsWith('show_target_')) {
                params.targets[key] = value;
            }
        });
    });

    // 添加重播动画按钮
    targetsFolder.add({
        replayAnimation: () => {
            if (callbacks.replaySpawnAnimation) {
                callbacks.replaySpawnAnimation();
            }
        }
    }, 'replayAnimation').name('重播喷射动画');

    // 为每个目标创建控制项
    if (callbacks.getTargetsData) {
        const targetsData = callbacks.getTargetsData();
        targetsData.forEach((targetData, index) => {
            const targetFolder = targetsFolder.addFolder(`目标 ${index + 1}`);
            
            // 初始化目标参数
            const showKey = `show_target_${index}`;
            const xKey = `target_${index}_x`;
            const yKey = `target_${index}_y`;
            const zKey = `target_${index}_z`;
            
            if (!params.targets[showKey]) {
                params.targets[showKey] = true;
                params.targets[xKey] = targetData.pos.x;
                params.targets[yKey] = targetData.pos.y;
                params.targets[zKey] = targetData.pos.z;
            }
            
            // 显示/隐藏控制
            targetFolder.add(params.targets, showKey).name('显示').onChange((value) => {
                callbacks.updateTargetVisibility(index, value);
            });
            
            // 位置控制
            targetFolder.add(params.targets, xKey, -50, 50, 0.1).name('X坐标').onChange((value) => {
                callbacks.updateTargetPosition(index, value, params.targets[yKey], params.targets[zKey]);
            });
            
            targetFolder.add(params.targets, yKey, -50, 50, 0.1).name('Y坐标').onChange((value) => {
                callbacks.updateTargetPosition(index, params.targets[xKey], value, params.targets[zKey]);
            });
            
            targetFolder.add(params.targets, zKey, -100, 100, 0.1).name('Z坐标').onChange((value) => {
                callbacks.updateTargetPosition(index, params.targets[xKey], params.targets[yKey], value);
            });
            
            // 重置位置按钮
            targetFolder.add({
                reset: () => {
                    params.targets[xKey] = targetData.pos.x;
                    params.targets[yKey] = targetData.pos.y;
                    params.targets[zKey] = targetData.pos.z;
                    callbacks.updateTargetPosition(index, targetData.pos.x, targetData.pos.y, targetData.pos.z);
                }
            }, 'reset').name('重置位置');
        });
    }

    // 界面控制面板
    const interfaceFolder = gui.addFolder('界面显示');
    interfaceFolder.add(params, 'showTextOverlay').name('显示文字标签').onChange((value) => {
        if (callbacks.updateTextOverlayVisibility) {
            callbacks.updateTextOverlayVisibility(value);
        }
    });

    // 如果其他模块不需要GUI实例，则无需返回
    // return gui; 
}
