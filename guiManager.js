import GUI from 'lil-gui';

export function setupGUI(params, callbacks) {
    const gui = new GUI();
    gui.add(params, 'movementMultiplier', 0, 5).name('左右/上下灵敏度');
    gui.add(params, 'depthMultiplier', 0.1, 5.0).name('深度敏感度');
    gui.add(params, 'minDepth', 10, 50).name('最小深度');
    gui.add(params, 'maxDepth', 50, 150).name('最大深度');
    gui.add(params, 'smoothingFactor', 0.01, 0.5).name('平滑系数');

    const coordFolder = gui.addFolder('虹膜中心坐标 (相对于摄像头)');
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

    // 如果其他模块不需要GUI实例，则无需返回
    // return gui; 
}
