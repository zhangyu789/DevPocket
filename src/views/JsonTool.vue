<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="tool-header">📐 JSON 格式化与压缩</h2>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400">
      ⚠️ {{ error }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入 JSON</label>
          <div class="flex gap-2">
            <button @click="loadSample" class="btn-secondary btn-sm">示例</button>
            <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
          </div>
        </div>
        <textarea
          v-model="input"
          class="textarea-field h-80"
          placeholder='粘贴 JSON 字符串，例如：{"name":"DevPocket"}'
          spellcheck="false"
        ></textarea>
      </div>

      <!-- Output -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输出结果</label>
            <select v-model="indentSize" class="text-xs bg-gray-100 dark:bg-slate-700 rounded px-2 py-1 text-gray-600 dark:text-gray-400">
              <option :value="2">缩进: 2空格</option>
              <option :value="4">缩进: 4空格</option>
              <option :value="tabChar">缩进: Tab</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button @click="formatJson" class="btn-primary btn-sm">格式化</button>
            <button @click="minifyJson" class="btn-secondary btn-sm">压缩</button>
            <CopyButton :text="output" />
          </div>
        </div>
        <pre class="textarea-field h-80 overflow-auto whitespace-pre-wrap" v-html="highlightedOutput"></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('')
const output = ref('')
const error = ref('')
const indentSize = ref(2)
const tabChar = '\t'

function formatJson() {
  error.value = ''
  if (!input.value.trim()) { output.value = ''; return }
  try {
    const obj = JSON.parse(input.value)
    output.value = JSON.stringify(obj, null, indentSize.value)
  } catch (e) {
    error.value = e.message
    output.value = ''
  }
}

function minifyJson() {
  error.value = ''
  if (!input.value.trim()) { output.value = ''; return }
  try {
    const obj = JSON.parse(input.value)
    output.value = JSON.stringify(obj)
  } catch (e) {
    error.value = e.message
    output.value = ''
  }
}

function loadSample() {
  input.value = JSON.stringify({
    name: "DevPocket",
    version: "1.0.0",
    description: "开发者工具箱",
    features: ["JSON格式化", "Base64编解码", "正则测试"],
    author: { name: "Developer", email: "dev@example.com" },
    active: true,
    config: { maxItems: 100, debug: false }
  })
  formatJson()
}

const highlightedOutput = computed(() => {
  if (!output.value) return ''
  return output.value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"([^"]+)"(?=\s*:)/g, '<span style="color:#6366f1">"$1"</span>')
    .replace(/:\s*"([^"]*)"/g, ': <span style="color:#22c55e">"$1"</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:#f59e0b">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span style="color:#ef4444">$1</span>')
    .replace(/:\s*(null)/g, ': <span style="color:#94a3b8">$1</span>')
})
</script>
