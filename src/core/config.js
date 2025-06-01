export const params = {
    // 追踪参数
    movementMultiplier: 2.5,
    depthMultiplier: 1.0,
    minDepth: 15,
    maxDepth: 100,
    fov: 20,
    smoothingFactor: 0.1,
    
    // 屏幕校准
    screenWidth: 34.5,
    screenHeight: 19.4,
    cameraToScreenDistance: 0.5,
    
    // 坐标显示
    eyeX: 0,
    eyeY: 0,
    eyeZ: 0,
    
    // 背景设置
    tunnelLength: 120,
    gridCellSize: 4,
    gridColor: 0xffffff,
    showFloorGrid: true,
    showCeilingGrid: true,
    showWallGrids: true,
    
    // 雾效参数
    fogColor: 0x000000,
    fogNear: 20,
    fogFar: 90,
    
    // 线条效果
    lineFogNear: 50,
    lineFogFar: 390,
    lineWidth: 2.0,
    lineOpacity: 1.0,
    lineBrightness: 3.0,
    
    // 目标控制
    showAllTargets: true,
    targets: {},
    
    // 界面控制
    showTextOverlay: true
};
