function loadDrawing(dataUrl) {
    const img = new Image();
    img.onload = () => {
        context.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
}