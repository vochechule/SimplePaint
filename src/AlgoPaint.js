import { useRef, useState, useEffect } from 'react';

export default function AlgoPaint() {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('pencil');
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [isDashed, setIsDashed] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isFloodFill, setIsFloodFill] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const preview = previewRef.current;
    const previewCtx = preview.getContext('2d');
    previewCtx.clearRect(0, 0, preview.width, preview.height);
  }, []);

  function drawPixel(ctx, x, y, customColor = color) {
    ctx.fillStyle = customColor;
    const size = tool === 'eraser' ? brushSize * 3 : brushSize; // 3x bigger for eraser
    ctx.fillRect(x, y, size, size);
  }

  function floodFill(startX, startY, currentColor) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    startX = Math.floor(startX);
    startY = Math.floor(startY);
    if (startX < 0 || startY < 0 || startX >= width || startY >= height) return;

    const startPos = (startY * width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];

    if (
      startR === currentColor.r &&
      startG === currentColor.g &&
      startB === currentColor.b
    ) {
      return;
    }

    const pixelStack = [[startX, startY]];

    while (pixelStack.length) {
      const [x, y] = pixelStack.pop();
      let newY = y;
      let pixelPos = (newY * width + x) * 4;

      while (
        newY >= 0 &&
        matchStartColor(pixelPos, data, startR, startG, startB)
      ) {
        newY--;
        pixelPos -= width * 4;
      }

      newY++;
      pixelPos += width * 4;

      let reachLeft = false;
      let reachRight = false;

      while (
        newY < height &&
        matchStartColor(pixelPos, data, startR, startG, startB)
      ) {
        colorPixel(pixelPos, data, currentColor);

        if (x > 0) {
          const leftPos = pixelPos - 4;
          if (
            matchStartColor(leftPos, data, startR, startG, startB) &&
            !reachLeft
          ) {
            pixelStack.push([x - 1, newY]);
            reachLeft = true;
          } else if (!matchStartColor(leftPos, data, startR, startG, startB)) {
            reachLeft = false;
          }
        }

        if (x < width - 1) {
          const rightPos = pixelPos + 4;
          if (
            matchStartColor(rightPos, data, startR, startG, startB) &&
            !reachRight
          ) {
            pixelStack.push([x + 1, newY]);
            reachRight = true;
          } else if (
            !matchStartColor(rightPos, data, startR, startG, startB)
          ) {
            reachRight = false;
          }
        }

        newY++;
        pixelPos += width * 4;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function matchStartColor(pos, data, r, g, b) {
    return data[pos] === r && data[pos + 1] === g && data[pos + 2] === b;
  }

  function colorPixel(pos, data, { r, g, b }) {
    data[pos] = r;
    data[pos + 1] = g;
    data[pos + 2] = b;
    data[pos + 3] = 255;
  }

  function drawLine(ctx, x1, y1, x2, y2) {
    ctx.setLineDash(isDashed ? [5, 5] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = tool === 'eraser' ? 'white' : color;
    ctx.lineWidth = brushSize;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawRect(ctx, x1, y1, x2, y2) {
    drawLine(ctx, x1, y1, x2, y1);
    drawLine(ctx, x2, y1, x2, y2);
    drawLine(ctx, x2, y2, x1, y2);
    drawLine(ctx, x1, y2, x1, y1);
  }

  function drawPolygon(ctx, points) {
    if (points.length < 2) return;

    for (let i = 0; i < points.length - 1; i++) {
      drawLine(ctx, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }

    if (points.length >= 3) {
      drawLine(ctx, points[points.length - 1].x, points[points.length - 1].y, points[0].x, points[0].y);
    }
  }

  function drawCircle(ctx, xc, yc, radius) {
    let x = 0;
    let y = radius;
    let d = 1 - radius;

    while (x <= y) {
      const colorToUse = tool === 'eraser' ? 'white' : color;
      drawPixel(ctx, xc + x, yc + y, colorToUse);
      drawPixel(ctx, xc - x, yc + y, colorToUse);
      drawPixel(ctx, xc + x, yc - y, colorToUse);
      drawPixel(ctx, xc - x, yc - y, colorToUse);
      drawPixel(ctx, xc + y, yc + x, colorToUse);
      drawPixel(ctx, xc - y, yc + x, colorToUse);
      drawPixel(ctx, xc + y, yc - x, colorToUse);
      drawPixel(ctx, xc - y, yc - x, colorToUse);

      if (d < 0) {
        d += 2 * x + 3;
      } else {
        d += 2 * (x - y) + 5;
        y--;
      }
      x++;
    }
  }

  function snapTo45Degrees(x, y) {
    const angle = Math.atan2(y, x);
    const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
    const length = Math.sqrt(x * x + y * y);
    return {
      x: Math.cos(snappedAngle) * length,
      y: Math.sin(snappedAngle) * length,
    };
  }

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === 'polygon') {
      if (!isDrawingPolygon) {
        setPolygonPoints([{ x: offsetX, y: offsetY }]);
        setIsDrawingPolygon(true);
      } else {
        setPolygonPoints([...polygonPoints, { x: offsetX, y: offsetY }]);
      }
    } else {
      setStartPos({ x: offsetX, y: offsetY });
      setIsDrawing(true);
      const ctx = previewRef.current.getContext('2d');
      ctx.clearRect(0, 0, previewRef.current.width, previewRef.current.height);
      if (tool === 'pencil' || tool === 'eraser') {
        const mainCtx = canvasRef.current.getContext('2d');
        drawPixel(mainCtx, offsetX, offsetY, tool === 'eraser' ? 'white' : color);
      }
    }
  };

  const draw = (e) => {
    if (!isDrawing && tool !== 'polygon') return;

    const previewCtx = previewRef.current.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;

    previewCtx.clearRect(0, 0, previewRef.current.width, previewRef.current.height);

    if (tool === 'polygon' && isDrawingPolygon) {
      const tempPoints = [...polygonPoints, { x: offsetX, y: offsetY }];
      drawPolygon(previewCtx, tempPoints);
    } else if (tool === 'pencil' || tool === 'eraser') {
      const mainCtx = canvasRef.current.getContext('2d');
      drawPixel(mainCtx, offsetX, offsetY, tool === 'eraser' ? 'white' : color);
    } else {
      const { x: startX, y: startY } = startPos;
      let snappedX = offsetX;
      let snappedY = offsetY;

      if (isSnapping) {
        const snappedEnd = snapTo45Degrees(offsetX - startX, offsetY - startY);
        snappedX = startX + snappedEnd.x;
        snappedY = startY + snappedEnd.y;
      }

      // eslint-disable-next-line default-case
      switch (tool) {
        case 'line':
          drawLine(previewCtx, startX, startY, snappedX, snappedY);
          break;
        case 'rectangle':
          drawRect(previewCtx, startX, startY, snappedX, snappedY);
          break;
        case 'circle':
          const radius = Math.sqrt(Math.pow(snappedX - startX, 2) + Math.pow(snappedY - startY, 2));
          drawCircle(previewCtx, startX, startY, radius);
          break;
      }
    }
  };
  
  const stopDrawing = (e) => {
    if (tool === 'polygon') return;

    const ctx = canvasRef.current.getContext('2d');
    const previewCtx = previewRef.current.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;

    if (isFloodFill) {
      const currentColor = {
        r: parseInt(color.slice(1, 3), 16),
        g: parseInt(color.slice(3, 5), 16),
        b: parseInt(color.slice(5, 7), 16),
      };
      floodFill(offsetX, offsetY, currentColor);
    } else {
      let snappedX = offsetX;
      let snappedY = offsetY;

      if (isSnapping) {
        const snappedEnd = snapTo45Degrees(offsetX - startPos.x, offsetY - startPos.y);
        snappedX = startPos.x + snappedEnd.x;
        snappedY = startPos.y + snappedEnd.y;
      }

      // eslint-disable-next-line default-case
      switch (tool) {
        case 'line':
          drawLine(ctx, startPos.x, startPos.y, snappedX, snappedY);
          break;
        case 'rectangle':
          drawRect(ctx, startPos.x, startPos.y, snappedX, snappedY);
          break;
        case 'circle':
          const radius = Math.sqrt(Math.pow(snappedX - startPos.x, 2) + Math.pow(snappedY - startPos.y, 2));
          drawCircle(ctx, startPos.x, startPos.y, radius);
          break;
      }
    }

    previewCtx.clearRect(0, 0, previewRef.current.width, previewRef.current.height);
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div>
      <div>
        <select
          value={tool}
          onChange={(e) => {
            setTool(e.target.value);
            if (e.target.value !== 'polygon') {
              setPolygonPoints([]);
              setIsDrawingPolygon(false);
            }
            setIsFloodFill(e.target.value === 'floodFill');
          }}
        >
          <option value="pencil">Pencil</option>
          <option value="eraser">Eraser</option>
          <option value="line">Line</option>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="polygon">Polygon</option>
          <option value="floodFill">Flood Fill</option>
        </select>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input
          type="range"
          min="1"
          max="10"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
        />
        <button onClick={clearCanvas}>Clear</button>
        <label>
          <input type="checkbox" checked={isDashed} onChange={(e) => setIsDashed(e.target.checked)} />
          Dashed Lines
        </label>
        <label>
          <input type="checkbox" checked={isSnapping} onChange={(e) => setIsSnapping(e.target.checked)} />
          Enable 45° Snapping
        </label>
      </div>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={1400}
          height={800}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onDoubleClick={() => {
            if (tool === 'polygon' && isDrawingPolygon) {
              const ctx = canvasRef.current.getContext('2d');
              drawPolygon(ctx, polygonPoints);
              setPolygonPoints([]);
              setIsDrawingPolygon(false);
            }
          }}
          style={{ border: '1px solid black', position: 'absolute', pointerEvents: 'auto' }}
        />
        <canvas
          ref={previewRef}
          width={1400}
          height={800}
          style={{ border: '1px solid black', position: 'absolute', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}
