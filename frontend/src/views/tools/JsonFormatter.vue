<template>
  <div class="json-formatter-container">
    <div class="header">
      <h1>JSON 格式化工具</h1>
      <div class="actions">
        <button @click="formatJson" class="btn primary">格式化</button>
        <button @click="minifyJson" class="btn secondary">压缩</button>
        <button @click="clear" class="btn danger">清空</button>
        <button @click="copyOutput" class="btn success">复制结果</button>
      </div>
    </div>

    <div class="editor-area">
      <div class="panel input-panel">
        <div class="panel-header">
          <span>输入 JSON</span>
          <span v-if="error" class="error-msg">{{ error }}</span>
        </div>
        <textarea 
          v-model="inputJson" 
          placeholder="在此粘贴 JSON..."
          spellcheck="false"
        ></textarea>
      </div>
      
      <div class="panel output-panel">
        <div class="panel-header">
          <span>格式化结果</span>
        </div>
        <textarea 
          v-model="outputJson" 
          readonly 
          placeholder="结果将显示在这里..."
          spellcheck="false"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { showMessage } from '@/utils/message';

const inputJson = ref('');
const outputJson = ref('');
const error = ref('');

const formatJson = () => {
  error.value = '';
  if (!inputJson.value.trim()) return;

  try {
    const obj = JSON.parse(inputJson.value);
    outputJson.value = JSON.stringify(obj, null, 2);
  } catch (e) {
    error.value = '无效的 JSON 格式: ' + e.message;
  }
};

const minifyJson = () => {
  error.value = '';
  if (!inputJson.value.trim()) return;

  try {
    const obj = JSON.parse(inputJson.value);
    outputJson.value = JSON.stringify(obj);
  } catch (e) {
    error.value = '无效的 JSON 格式: ' + e.message;
  }
};

const clear = () => {
  inputJson.value = '';
  outputJson.value = '';
  error.value = '';
};

const copyOutput = async () => {
  if (!outputJson.value) return;
  try {
    await navigator.clipboard.writeText(outputJson.value);
    showMessage('已复制到剪贴板');
  } catch (err) {
    console.error('Failed to copy:', err);
    showMessage('复制失败', 'error');
  }
};
</script>

<style scoped>
.json-formatter-container {
  padding: 24px;
  max-width: 1100px;
  height: calc(100vh - 104px); /* 64px header + 20px top + 20px bottom */
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

.btn:hover {
  opacity: 0.9;
}

.primary { background-color: var(--primary-color, #42b983); color: white; }
.secondary { background-color: #64748b; color: white; }
.danger { background-color: #ef4444; color: white; }
.success { background-color: #3b82f6; color: white; }

.editor-area {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0; /* Important for nested flex scroll */
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--card-bg);
}

.panel-header {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  color: var(--text-secondary);
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
}

textarea {
  flex: 1;
  width: 100%;
  padding: 16px;
  border: none;
  resize: none;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  outline: none;
}

textarea:focus {
  background-color: var(--input-bg);
}
</style>
