import GUI from 'lil-gui';

export function setupGUI(params, callbacks) {
    const gui = new GUI();
    
    // 基本控制
    gui.add(params, 'movementMultiplier', 0, 5).name('左右/上下灵敏度');
    gui.add(params, 'depthMultiplier', 0.1, 5.0).name('深度敏感度');
    gui.add(params, 'minDepth', 10, 50).name('最小深度');
    gui.add(params, 'maxDepth', 50, 150).name('最大深度');
    gui.add(params, 'smoothingFactor', 0.01, 0.5).name('平滑系数');

    // 坐标显示
    const coordFolder = gui.addFolder('虹膜中心坐标 (相对于摄像头)');
    coordFolder.add(params, 'eyeX').name('X坐标 (cm)').listen().disable();
    coordFolder.add(params, 'eyeY').name('Y坐标 (cm)').listen().disable();
    coordFolder.add(params, 'eyeZ').name('Z坐标/深度 (cm)').listen().disable();

    // 屏幕校准
    const screenFolder = gui.addFolder('屏幕校准');
    screenFolder.add(params, 'screenWidth', 20, 60).name('屏幕宽度(cm)');
    screenFolder.add(params, 'screenHeight', 10, 40).name('屏幕高度(cm)');
    screenFolder.add(params, 'cameraToScreenDistance', 0.1, 2).name('摄像头到屏幕距离(cm)');
    screenFolder.onChange(() => {
        callbacks.createVirtualScreen();
        callbacks.updateBackgroundGrid();
    });

    gui.add(params, 'fov', 1, 90).name('摄像头FOV (度)');

    // 背景隧道
    const tunnelFolder = gui.addFolder('背景隧道');
    tunnelFolder.add(params, 'tunnelLength', 50, 1000).name('隧道长度').onChange(callbacks.updateBackgroundGrid);
    tunnelFolder.add(params, 'gridCellSize', 1, 50).name('网格单元大小').onChange(callbacks.updateBackgroundGrid);
    tunnelFolder.addColor(params, 'gridColor').name('网格颜色').onChange(callbacks.updateBackgroundGrid);
    tunnelFolder.add(params, 'showFloorGrid').name('显示地面网格').onChange(callbacks.updateBackgroundGrid);
    tunnelFolder.add(params, 'showCeilingGrid').name('显示顶面网格').onChange(callbacks.updateBackgroundGrid);
    tunnelFolder.add(params, 'showWallGrids').name('显示侧墙网格').onChange(callbacks.updateBackgroundGrid);

    // 雾效
    const fogFolder = gui.addFolder('雾效');
    fogFolder.addColor(params, 'fogColor').name('雾颜色').onChange(callbacks.setupFog);
    fogFolder.add(params, 'fogNear', 1, 300).name('雾起始距离').onChange(callbacks.setupFog);
    fogFolder.add(params, 'fogFar', 50, 1000).name('雾终止距离').onChange(callbacks.setupFog);

    // 线条控制
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

    // 目标对象控制
    const targetsFolder = gui.addFolder('圆环目标控制');
    targetsFolder.add(params, 'showAllTargets').name('显示所有目标').onChange((value) => {
        callbacks.setAllTargetsVisibility(value);
        Object.keys(params.targets).forEach(key => {
            if (key.startsWith('show_target_')) {
                params.targets[key] = value;
            }
        });
    });

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
            
            targetFolder.add(params.targets, showKey).name('显示').onChange((value) => {
                callbacks.updateTargetVisibility(index, value);
            });
            
            targetFolder.add(params.targets, xKey, -50, 50, 0.1).name('X坐标').onChange((value) => {
                callbacks.updateTargetPosition(index, value, params.targets[yKey], params.targets[zKey]);
            });
            
            targetFolder.add(params.targets, yKey, -50, 50, 0.1).name('Y坐标').onChange((value) => {
                callbacks.updateTargetPosition(index, params.targets[xKey], value, params.targets[zKey]);
            });
            
            targetFolder.add(params.targets, zKey, -100, 100, 0.1).name('Z坐标').onChange((value) => {
                callbacks.updateTargetPosition(index, params.targets[xKey], params.targets[yKey], value);
            });
            
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

    // 界面控制
    const interfaceFolder = gui.addFolder('界面显示');
    interfaceFolder.add(params, 'showTextOverlay').name('显示文字标签').onChange((value) => {
        if (callbacks.updateTextOverlayVisibility) {
            callbacks.updateTextOverlayVisibility(value);
        }
    });
}
