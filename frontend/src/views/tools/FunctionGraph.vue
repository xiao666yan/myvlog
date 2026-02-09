<template>
  <div class="function-graph-container">
    <div class="header">
      <h1>函数图像绘制</h1>
      <div class="actions">
        <button @click="draw" class="btn primary">绘制</button>
        <button @click="resetView" class="btn secondary">复位</button>
        <button @click="clear" class="btn danger">清空</button>
      </div>
    </div>

    <div class="workspace">
      <div class="controls-panel">
        <div class="input-group">
          <label>函数表达式 f(x) =</label>
          <input 
            v-model="expression" 
            @keyup.enter="draw"
            placeholder="例如: x * x 或 Math.sin(x)"
            type="text"
          />
          <div class="help-text">
            支持 JS 语法，如: x*x, Math.sin(x), Math.pow(x, 2)
          </div>
        </div>

        <div class="color-picker">
          <label>线条颜色:</label>
          <input type="color" v-model="lineColor" />
        </div>
        
        <div class="input-group">
            <label>常用函数:</label>
            <div class="quick-btns">
                <button @click="setExp('x')">x</button>
                <button @click="setExp('x*x')">x²</button>
                <button @click="setExp('Math.sin(x)')">sin(x)</button>
                <button @click="setExp('Math.cos(x)')">cos(x)</button>
                <button @click="setExp('Math.sqrt(x)')">√x</button>
                <button @click="setExp('Math.log(x)')">ln(x)</button>
            </div>
        </div>
      </div>
      
      <div class="canvas-wrapper" ref="canvasWrapper">
        <canvas 
          ref="canvas" 
          @mousedown="startDrag" 
          @mousemove="onDrag" 
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
          @wheel.prevent="onWheel"
        ></canvas>
        <div class="coordinates-info" v-if="hoverInfo">
            x: {{ hoverInfo.x.toFixed(2) }}, y: {{ hoverInfo.y.toFixed(2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';

const expression = ref('Math.sin(x)');
const lineColor = ref('#42b983');
const canvas = ref(null);
const canvasWrapper = ref(null);
const hoverInfo = ref(null);

// Viewport state
const scale = ref(40); // pixels per unit
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const lastMousePos = ref({ x: 0, y: 0 });

const setExp = (exp) => {
    expression.value = exp;
    draw();
};

const resetView = () => {
    scale.value = 40;
    offsetX.value = canvas.value.width / 2;
    offsetY.value = canvas.value.height / 2;
    draw();
};

const clear = () => {
    expression.value = '';
    const ctx = canvas.value.getContext('2d');
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    drawGrid(ctx);
};

const drawGrid = (ctx) => {
    const w = canvas.value.width;
    const h = canvas.value.height;
    
    ctx.clearRect(0, 0, w, h);
    
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical lines
    const startCol = Math.floor((-offsetX.value) / scale.value);
    const endCol = Math.floor((w - offsetX.value) / scale.value);

    for (let i = startCol; i <= endCol; i++) {
        const x = i * scale.value + offsetX.value;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }

    // Horizontal lines
    const startRow = Math.floor((-offsetY.value) / scale.value);
    const endRow = Math.floor((h - offsetY.value) / scale.value);

    for (let i = startRow; i <= endRow; i++) {
        const y = i * scale.value + offsetY.value;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Axes
    ctx.beginPath();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X Axis
    if (offsetY.value >= 0 && offsetY.value <= h) {
        ctx.moveTo(0, offsetY.value);
        ctx.lineTo(w, offsetY.value);
    }
    
    // Y Axis
    if (offsetX.value >= 0 && offsetX.value <= w) {
        ctx.moveTo(offsetX.value, 0);
        ctx.lineTo(offsetX.value, h);
    }
    ctx.stroke();
    
    // Numbers
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X numbers
    for (let i = startCol; i <= endCol; i++) {
        if (i === 0) continue;
        const x = i * scale.value + offsetX.value;
        ctx.fillText(i.toString(), x, offsetY.value + 15);
    }
    
    // Y numbers
    ctx.textAlign = 'right';
    for (let i = startRow; i <= endRow; i++) {
        if (i === 0) continue;
        const y = i * scale.value + offsetY.value;
        // Logic: y axis goes down in canvas, but up in math. 
        // We typically treat canvas y as -math y relative to center.
        // Actually let's just draw standard canvas grid first, then map math y to it.
        // If center is (cx, cy), math (0,0) is at (cx, cy).
        // Math point (x, y) -> Canvas (cx + x*scale, cy - y*scale)
        // So grid line i corresponds to math y = -i (if we calculate purely by row index from top)
        // Let's stick to standard math coordinates:
        // Grid line at canvas y corresponds to math Y = (offsetY - y) / scale
        // For the loop `i`, `y = i * scale + offsetY`.
        // So `i * scale = y - offsetY`.
        // Math Y = -(y - offsetY) / scale = - (i * scale) / scale = -i.
        ctx.fillText((-i).toString(), offsetX.value - 5, y + 4);
    }
    
    // Origin
    ctx.fillText('0', offsetX.value - 5, offsetY.value + 15);
};

const draw = () => {
    if (!canvas.value) return;
    const ctx = canvas.value.getContext('2d');
    const w = canvas.value.width;
    const h = canvas.value.height;

    drawGrid(ctx);

    if (!expression.value.trim()) return;

    ctx.beginPath();
    ctx.strokeStyle = lineColor.value;
    ctx.lineWidth = 2;

    let func;
    try {
        // Create a safe-ish function
        // We can inject commonly used Math functions into the scope if we use 'with' or just prepending 'Math.' is annoying.
        // Let's try to allow "sin(x)" by replacing common tokens or just use 'with(Math){ return ... }'
        // 'with' is deprecated/strict mode forbidden. 
        // Simplest is to ask user to use Math. or just pre-define var names.
        // Let's accept raw JS for now as per placeholder.
        func = new Function('x', `return ${expression.value};`);
    } catch (e) {
        return; // Invalid syntax
    }

    let first = true;
    for (let cx = 0; cx < w; cx++) {
        // Canvas x -> Math x
        const mathX = (cx - offsetX.value) / scale.value;
        
        let mathY;
        try {
            mathY = func(mathX);
        } catch (e) {
            continue;
        }

        if (isNaN(mathY) || !isFinite(mathY)) continue;

        // Math y -> Canvas y
        const cy = offsetY.value - mathY * scale.value;

        // Clip huge values
        if (cy < -h || cy > 2 * h) {
            first = true; // Lift pen
            continue;
        }

        if (first) {
            ctx.moveTo(cx, cy);
            first = false;
        } else {
            ctx.lineTo(cx, cy);
        }
    }
    ctx.stroke();
};

// Interaction
const startDrag = (e) => {
    isDragging.value = true;
    lastMousePos.value = { x: e.clientX, y: e.clientY };
};

const onDrag = (e) => {
    // Calculate mouse coordinates in math space for display
    if (canvas.value) {
        const rect = canvas.value.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const mathX = (cx - offsetX.value) / scale.value;
        const mathY = (offsetY.value - cy) / scale.value;
        hoverInfo.value = { x: mathX, y: mathY };
    }

    if (!isDragging.value) return;
    const dx = e.clientX - lastMousePos.value.x;
    const dy = e.clientY - lastMousePos.value.y;
    
    offsetX.value += dx;
    offsetY.value += dy;
    
    lastMousePos.value = { x: e.clientX, y: e.clientY };
    requestAnimationFrame(draw);
};

const stopDrag = () => {
    isDragging.value = false;
};

const onWheel = (e) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = scale.value * delta;
    
    // Zoom towards mouse
    const rect = canvas.value.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // (mouseX - offsetX) / scale = mathX
    // We want mathX to stay at mouseX after zoom
    // mouseX = mathX * newScale + newOffsetX
    // newOffsetX = mouseX - mathX * newScale
    //            = mouseX - ((mouseX - offsetX) / scale) * newScale
    
    const mathX = (mouseX - offsetX.value) / scale.value;
    const mathY = (offsetY.value - mouseY) / scale.value; // Remember Y is inverted

    // Update scale
    if (newScale > 1 && newScale < 500) {
        scale.value = newScale;
        
        // Recalculate offsets to keep mouse position fixed in math space
        offsetX.value = mouseX - mathX * scale.value;
        offsetY.value = mouseY + mathY * scale.value;
        
        draw();
    }
};

const initCanvas = () => {
    if (canvasWrapper.value && canvas.value) {
        canvas.value.width = canvasWrapper.value.clientWidth;
        canvas.value.height = canvasWrapper.value.clientHeight;
        resetView();
    }
};

onMounted(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
});

// Watch for expression changes to redraw (debounce could be added)
// watch(expression, draw); 
</script>

<style scoped>
.function-graph-container {
  padding: 24px;
  max-width: 1100px;
  height: calc(100vh - 104px);
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 1.5rem;
  color: var(--text-primary);
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.9; }
.primary { background-color: var(--primary-color, #42b983); color: white; }
.secondary { background-color: #64748b; color: white; }
.danger { background-color: #ef4444; color: white; }

.workspace {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
}

.controls-panel {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 500;
  color: var(--text-secondary);
}

.input-group input[type="text"] {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--input-bg);
  color: var(--text-primary);
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quick-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.quick-btns button {
    padding: 4px 8px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.quick-btns button:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.canvas-wrapper {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background-color: #fff; /* Graph background usually white */
}

/* Dark mode adjustment for canvas bg if needed, but white is standard for paper */
:deep(.dark) .canvas-wrapper {
    background-color: #1f2937;
}

canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.coordinates-info {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
}
</style>
