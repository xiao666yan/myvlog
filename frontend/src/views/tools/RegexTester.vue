<template>
  <div class="regex-tester-container">
    <div class="header">
      <h1>正则表达式测试</h1>
      <div class="actions">
        <button @click="testRegex" class="btn primary">测试匹配</button>
        <button @click="clear" class="btn danger">清空</button>
      </div>
    </div>

    <div class="editor-area">
      <!-- Regex Pattern Input -->
      <div class="panel config-panel">
        <div class="input-group">
          <span class="label">正则表达式</span>
          <div class="regex-input-wrapper">
            <span class="slash">/</span>
            <input 
              v-model="regexPattern" 
              type="text" 
              placeholder="在此输入正则表达式..."
              @input="autoTest"
            />
            <span class="slash">/</span>
            <input 
              v-model="regexFlags" 
              type="text" 
              placeholder="flags (g, i, m...)" 
              class="flags-input"
              @input="autoTest"
            />
          </div>
        </div>
        <div class="flags-options">
          <label><input type="checkbox" v-model="flags.g" @change="updateFlags"> Global (g)</label>
          <label><input type="checkbox" v-model="flags.i" @change="updateFlags"> Case Insensitive (i)</label>
          <label><input type="checkbox" v-model="flags.m" @change="updateFlags"> Multiline (m)</label>
        </div>
      </div>

      <div class="split-view">
        <!-- Test String Input -->
        <div class="panel input-panel">
          <div class="panel-header">
            <span>测试文本</span>
          </div>
          <textarea 
            v-model="testString" 
            placeholder="在此输入待测试的文本..."
            spellcheck="false"
            @input="autoTest"
          ></textarea>
        </div>
        
        <!-- Matches Output -->
        <div class="panel output-panel">
          <div class="panel-header">
            <span>匹配结果</span>
            <span v-if="error" class="error-msg">{{ error }}</span>
            <span v-else-if="matches.length > 0" class="match-count">找到 {{ matches.length }} 处匹配</span>
            <span v-else class="no-match">无匹配</span>
          </div>
          <div class="results-container" v-html="highlightedResult"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';

const regexPattern = ref('');
const regexFlags = ref('g');
const testString = ref('');
const error = ref('');
const matches = ref([]);

const flags = reactive({
  g: true,
  i: false,
  m: false,
  s: false,
  u: false,
  y: false
});

// Watch flags object changes and update text input
const updateFlags = () => {
  let f = '';
  if (flags.g) f += 'g';
  if (flags.i) f += 'i';
  if (flags.m) f += 'm';
  if (flags.s) f += 's';
  if (flags.u) f += 'u';
  if (flags.y) f += 'y';
  regexFlags.value = f;
  testRegex();
};

// Watch text input for flags and update checkboxes
watch(regexFlags, (newVal) => {
  flags.g = newVal.includes('g');
  flags.i = newVal.includes('i');
  flags.m = newVal.includes('m');
  flags.s = newVal.includes('s');
  flags.u = newVal.includes('u');
  flags.y = newVal.includes('y');
  testRegex();
});

const highlightedResult = computed(() => {
  if (!testString.value) return '';
  if (error.value || !regexPattern.value) return escapeHtml(testString.value);
  if (matches.value.length === 0) return escapeHtml(testString.value);

  let result = '';
  let lastIndex = 0;
  const text = testString.value;

  matches.value.forEach(match => {
    // Append text before match
    result += escapeHtml(text.substring(lastIndex, match.index));
    // Append highlighted match
    result += `<span class="highlight">${escapeHtml(match[0])}</span>`;
    lastIndex = match.index + match[0].length;
  });

  // Append remaining text
  result += escapeHtml(text.substring(lastIndex));
  return result.replace(/\n/g, '<br>');
});

const escapeHtml = (text) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const testRegex = () => {
  error.value = '';
  matches.value = [];
  
  if (!regexPattern.value) return;

  try {
    const re = new RegExp(regexPattern.value, regexFlags.value);
    const text = testString.value;
    
    if (!text) return;

    // Reset lastIndex for global searches just in case, though new RegExp handles it
    // If global flag is not set, match() returns the first match with extra props
    // If global flag is set, match() returns array of strings (no index), so use matchAll or exec loop
    
    const localMatches = [];
    if (regexFlags.value.includes('g')) {
      const iter = text.matchAll(re);
      for (const match of iter) {
        localMatches.push(match);
      }
    } else {
      const match = text.match(re);
      if (match) {
        localMatches.push(match);
      }
    }
    matches.value = localMatches;

  } catch (e) {
    error.value = '无效的正则表达式: ' + e.message;
  }
};

const autoTest = () => {
  testRegex();
};

const clear = () => {
  regexPattern.value = '';
  testString.value = '';
  matches.value = [];
  error.value = '';
};

// Initialize
testRegex();
</script>

<style scoped>
.regex-tester-container {
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
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.header h1 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn.primary { background-color: #42b983; color: white; }
.btn.primary:hover { background-color: #3aa876; }

.btn.danger { background-color: #ff4757; color: white; }
.btn.danger:hover { background-color: #ff6b81; }

.editor-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.panel {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.config-panel {
  padding: 16px;
  gap: 12px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.regex-input-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 4px 12px;
  font-family: monospace;
  font-size: 1.1rem;
}

.regex-input-wrapper input {
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: inherit;
}

.regex-input-wrapper input[type="text"]:first-of-type {
  flex: 1;
  padding: 8px 4px;
}

.flags-input {
  width: 100px;
  border-left: 1px solid var(--border-color) !important;
  padding-left: 8px !important;
  color: #42b983 !important;
}

.slash {
  color: var(--text-secondary);
  font-weight: bold;
}

.flags-options {
  display: flex;
  gap: 16px;
  margin-left: 80px; /* Align with input start roughly */
}

.flags-options label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-size: 0.9rem;
}

.split-view {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.input-panel, .output-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.error-msg { color: #ff4757; font-size: 0.9rem; }
.match-count { color: #42b983; font-size: 0.9rem; }
.no-match { color: var(--text-secondary); font-size: 0.9rem; }

textarea {
  flex: 1;
  padding: 16px;
  border: none;
  resize: none;
  background: transparent;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
}

.results-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--text-primary);
}

:deep(.highlight) {
  background-color: rgba(66, 185, 131, 0.2);
  border-bottom: 2px solid #42b983;
  border-radius: 2px;
}
</style>
