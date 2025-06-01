let overlayContainer = null;

export function createTextOverlay() {
    // 如果已存在，先移除
    if (overlayContainer) {
        document.body.removeChild(overlayContainer);
    }
    
    // 创建覆盖层容器
    overlayContainer = document.createElement('div');
    overlayContainer.id = 'text-overlay';
    overlayContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
        font-family: 'Arial', 'Helvetica', sans-serif;
        color: white;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    `;
    
    // 创建左上角文字
    const topLeftText = document.createElement('div');
    topLeftText.textContent = 'spatial';
    topLeftText.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        font-size: 32px;
        font-weight: normal;
        letter-spacing: 1px;
        opacity: 0.9;
    `;
    
    const topLeftTextSecond = document.createElement('div');
    topLeftTextSecond.textContent = 'commercial';
    topLeftTextSecond.style.cssText = `
        position: absolute;
        top: 60px;
        left: 20px;
        font-size: 32px;
        font-weight: normal;
        letter-spacing: 1px;
        opacity: 0.9;
    `;
    
    // 创建右下角文字
    const bottomRightText = document.createElement('div');
    bottomRightText.textContent = 'Targets';
    bottomRightText.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 20px;
        font-size: 110px;
        font-weight: normal;
        letter-spacing: 2px;
        opacity: 0.9;
    `;
    
    // 添加到容器
    overlayContainer.appendChild(topLeftText);
    overlayContainer.appendChild(topLeftTextSecond);
    overlayContainer.appendChild(bottomRightText);
    
    // 添加到页面
    document.body.appendChild(overlayContainer);
}

export function removeTextOverlay() {
    if (overlayContainer && overlayContainer.parentNode) {
        overlayContainer.parentNode.removeChild(overlayContainer);
        overlayContainer = null;
    }
}

export function updateTextOverlayVisibility(visible) {
    if (overlayContainer) {
        overlayContainer.style.display = visible ? 'block' : 'none';
    }
}
