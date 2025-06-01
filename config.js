export const params = {
    movementMultiplier: 2.5,
    depthMultiplier: 1.0,     // 深度乘数，会影响最终显示的深度值
    minDepth: 15,             // 摄像头到眼睛的最小原始深度(cm)。如果 rawDepth < minDepth, 则 depth = minDepth.
                              // 结合 depthMultiplier: 15 * 2.0 = 30cm. 这可能是卡在30cm的原因。
    maxDepth: 100,             // 摄像头到眼睛的最大原始深度(cm)
    fov: 20,                  // !!! 关键参数：摄像头的水平视野角度。
                              // 此值对深度计算的准确性至关重要。如果设置为一个非摄像头物理规格的值（例如这里的20）
                              // 后能得到准确的深度测量，表明它正作为校准因子，可能在补偿
                              // KNOWN_IRIS_DIAMETER_MM 的个体差异或 MediaPipe 检测特征的有效尺寸。
    smoothingFactor: 0.1,
    // 屏幕物理参数（修正）
    screenWidth: 34.5,        // 屏幕实际宽度(cm)
    screenHeight: 19.4,       // 屏幕实际高度(cm)
    cameraToScreenDistance: 0.5, // 摄像头在屏幕上方的距离(cm)
    // 坐标显示参数
    eyeX: 0,
    eyeY: 0,
    eyeZ: 0,
    // 背景隧道网格参数
    tunnelLength: 120,    // 大幅缩短隧道长度，使网格在雾效中快速消失
    gridCellSize: 4,       // 网格单元的期望边长 (用于计算密度)
    gridColor: 0xffffff,    // 网格线颜色
    showFloorGrid: true,
    showCeilingGrid: true,
    showWallGrids: true,
    // 雾效参数 - 微调以平衡网格消失和目标可见性
    fogColor: 0x000000,     // 雾的颜色 (应与背景色匹配)
    fogNear: 20,            // 稍微推远雾的起始距离
    fogFar: 90,             // 适度增加雾的终止距离
    
    // 线条雾效和外观控制参数
    lineFogNear: 50,       // 线条开始受雾效影响的距离
    lineFogFar: 390,        // 线条完全被雾遮挡的距离
    lineWidth: 2.0,         // 线条粗细（降低默认值，因为现在是半径）
    lineOpacity: 1.0,       // 线条透明度
    lineBrightness: 3.0,    // 线条亮度倍数（降低默认值）
    
    // 目标对象控制参数
    showAllTargets: true,
    targets: {}, // 将在运行时填充每个目标的显示状态和位置
    
    // 文字覆盖层控制参数
    showTextOverlay: true,
    
    // 动画控制参数
    replayAnimation: function() {} // 占位函数，将在GUI中被替换
};
