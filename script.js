
let img = new Image();
let canvas = document.getElementById('mainCanvas');
let ctx = canvas.getContext('2d');
let previewCanvas = document.getElementById('previewCanvas');
let previewCtx = previewCanvas.getContext('2d');

let isDragging = false;
let startX, startY;
let cropX = 0, cropY = 0, cropSize = 100;
let finalSize = 256;
let scale = 1;


previewCanvas.width = 120;
previewCanvas.height = 120;


document.getElementById('fileInput').addEventListener('change', handleFileSelect);

const uploadArea = document.querySelector('.upload-area');
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        loadImage(files[0]);
    }
});

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        loadImage(file);
    }
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        img.onload = function() {
            setupCanvas();
            updateImageInfo(file);
            document.getElementById('editorSection').style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updateImageInfo(file) {
    const sizeKB = Math.round(file.size / 1024);
    document.getElementById('imageInfo').textContent = `${img.width} × ${img.height}px`;
    document.getElementById('fileSize').textContent = `${sizeKB} KB`;
}

function setupCanvas() {
    const maxWidth = 600;
    const maxHeight = 400;
    
    let canvasWidth = img.width;
    let canvasHeight = img.height;
    scale = 1;
    
    if (canvasWidth > maxWidth) {
        scale = maxWidth / canvasWidth;
        canvasWidth = maxWidth;
        canvasHeight = img.height * scale;
    }
    
    if (canvasHeight > maxHeight) {
        scale = maxHeight / img.height;
        canvasHeight = maxHeight;
        canvasWidth = img.width * scale;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    

    cropSize = Math.min(canvasWidth, canvasHeight) * 0.7;
    cropX = (canvasWidth - cropSize) / 2;
    cropY = (canvasHeight - cropSize) / 2;
    
    updateInputs();
    redraw();
    setupMouseEvents();
}

function setupMouseEvents() {
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseleave', endDrag);
}

function startDrag(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x >= cropX && x <= cropX + cropSize && y >= cropY && y <= cropY + cropSize) {
        isDragging = true;
        startX = x - cropX;
        startY = y - cropY;
        canvas.style.cursor = 'move';
    }
}

function drag(e) {
    if (!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    cropX = Math.max(0, Math.min(canvas.width - cropSize, x - startX));
    cropY = Math.max(0, Math.min(canvas.height - cropSize, y - startY));
    
    updateInputs();
    redraw();
}

function endDrag() {
    isDragging = false;
    canvas.style.cursor = 'crosshair';
}

function updateInputs() {
    document.getElementById('cropX').value = Math.round(cropX / scale);
    document.getElementById('cropY').value = Math.round(cropY / scale);
    document.getElementById('cropSize').value = Math.round(cropSize / scale);
}

function updateCrop() {
    cropX = Math.max(0, parseInt(document.getElementById('cropX').value || 0) * scale);
    cropY = Math.max(0, parseInt(document.getElementById('cropY').value || 0) * scale);
    cropSize = Math.max(10, parseInt(document.getElementById('cropSize').value || 100) * scale);
    

    cropX = Math.min(canvas.width - cropSize, cropX);
    cropY = Math.min(canvas.height - cropSize, cropY);
    
    redraw();
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropX, cropY, cropSize, cropSize);
    ctx.globalCompositeOperation = 'source-over';
    

    ctx.strokeStyle = '#007acc';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropSize, cropSize);
    
    updatePreview();
}

function updatePreview() {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = cropSize / scale;
    tempCanvas.height = cropSize / scale;
    
    tempCtx.drawImage(img, 
        cropX / scale, cropY / scale, cropSize / scale, cropSize / scale,
        0, 0, tempCanvas.width, tempCanvas.height
    );
    
    previewCtx.drawImage(tempCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
    
    document.getElementById('cropInfo').innerHTML = `
        Zone: ${Math.round(cropSize/scale)} × ${Math.round(cropSize/scale)}px<br>
        Position: ${Math.round(cropX/scale)}, ${Math.round(cropY/scale)}<br>
        Sortie: ${finalSize} × ${finalSize}px
    `;
    
    document.getElementById('downloadBtn').disabled = false;
}

function setSize(size) {
    finalSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    updatePreview();
}

function resetCrop() {
    cropSize = Math.min(canvas.width, canvas.height) * 0.7;
    cropX = (canvas.width - cropSize) / 2;
    cropY = (canvas.height - cropSize) / 2;
    updateInputs();
    redraw();
}

function downloadImage() {
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    finalCanvas.width = finalSize;
    finalCanvas.height = finalSize;
    
    finalCtx.drawImage(img,
        cropX / scale, cropY / scale, cropSize / scale, cropSize / scale,
        0, 0, finalSize, finalSize
    );
    
    finalCanvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `image-${finalSize}x${finalSize}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.92);
}