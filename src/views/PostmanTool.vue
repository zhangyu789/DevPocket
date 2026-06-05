<template>
  <div class="space-y-4">
    <h2 class="tool-header">🚀 简易接口调试工具</h2>

    <div class="tool-card space-y-4">
      <!-- Method + URL -->
      <div class="flex gap-2">
        <select v-model="method" class="input-field w-32 font-mono font-semibold">
          <option v-for="m in methods" :key="m" :value="m" :class="methodColor(m)">{{ m }}</option>
        </select>
        <input v-model="url" class="input-field flex-1 font-mono" placeholder="https://jsonplaceholder.typicode.com/posts/1" />
        <button @click="sendRequest" :disabled="loading" class="btn-primary shrink-0">
          {{ loading ? '请求中...' : '发送' }}
        </button>
      </div>

      <!-- Tabs: Headers / Body -->
      <div class="flex gap-1 border-b border-gray-200 dark:border-slate-700">
        <button
          v-for="tab in ['headers', 'body']" :key="tab"
          @click="activeTab = tab"
          :class="['px-4 py-2 text-sm font-medium border-b-2 transition-colors', activeTab === tab ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300']"
        >{{ tab === 'headers' ? 'Headers' : 'Body' }}</button>
      </div>

      <!-- Headers -->
      <div v-if="activeTab === 'headers'" class="space-y-2">
        <div v-for="(header, i) in headers" :key="i" class="flex gap-2">
          <input v-model="header.key" class="input-field flex-1 text-sm" placeholder="Header Key" />
          <input v-model="header.value" class="input-field flex-1 text-sm" placeholder="Header Value" />
          <button @click="headers.splice(i, 1)" class="text-red-400 hover:text-red-500 px-2">✕</button>
        </div>
        <button @click="headers.push({ key: '', value: '' })" class="btn-secondary btn-sm">+ 添加 Header</button>
      </div>

      <!-- Body -->
      <div v-if="activeTab === 'body'">
        <div class="flex gap-2 mb-2">
          <select v-model="bodyType" class="text-xs bg-gray-100 dark:bg-slate-700 rounded px-2 py-1 text-gray-600 dark:text-gray-400">
            <option value="json">JSON</option>
            <option value="form">Form Data</option>
            <option value="raw">Raw Text</option>
          </select>
        </div>
        <textarea v-model="bodyContent" class="textarea-field h-40" placeholder='{"key": "value"}' spellcheck="false"></textarea>
      </div>
    </div>

    <!-- Response -->
    <div v-if="response" class="tool-card space-y-3">
      <div class="flex items-center gap-3 flex-wrap">
        <span :class="['px-2 py-1 rounded text-sm font-bold', statusColor]">
          {{ response.status }} {{ response.statusText }}
        </span>
        <span class="text-sm text-gray-500">耗时: {{ response.duration }}ms</span>
        <CopyButton :text="response.body" />
      </div>

      <!-- Response headers -->
      <details class="text-sm">
        <summary class="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">响应头</summary>
        <div class="mt-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
          <div v-for="(value, key) in response.headers" :key="key">
            <span class="text-primary-500">{{ key }}</span>: {{ value }}
          </div>
        </div>
      </details>

      <!-- Response body -->
      <div>
        <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">响应体</label>
        <pre class="textarea-field h-80 overflow-auto whitespace-pre-wrap text-xs">{{ response.formattedBody || response.body }}</pre>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400">
      ⚠️ {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
const method = ref('GET')
const url = ref('')
const activeTab = ref('headers')
const bodyType = ref('json')
const bodyContent = ref('')
const headers = ref([
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Accept', value: 'application/json' },
])
const loading = ref(false)
const response = ref(null)
const error = ref('')

function methodColor(m) {
  const colors = { GET: 'text-green-600', POST: 'text-blue-600', PUT: 'text-amber-600', DELETE: 'text-red-600', PATCH: 'text-purple-600' }
  return colors[m] || 'text-gray-600'
}

const statusColor = computed(() => {
  if (!response.value) return ''
  const s = response.value.status
  if (s >= 200 && s < 300) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
  if (s >= 300 && s < 400) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
  if (s >= 400 && s < 500) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
  return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
})

import { computed } from 'vue'

async function sendRequest() {
  if (!url.value.trim()) { error.value = '请输入 URL'; return }
  error.value = ''
  response.value = null
  loading.value = true

  const startTime = performance.now()
  try {
    const fetchHeaders = {}
    headers.value.forEach(h => {
      if (h.key.trim()) fetchHeaders[h.key] = h.value
    })

    const options = { method: method.value, headers: fetchHeaders }

    if (['POST', 'PUT', 'PATCH'].includes(method.value) && bodyContent.value.trim()) {
      if (bodyType.value === 'json') {
        fetchHeaders['Content-Type'] = 'application/json'
        options.body = bodyContent.value
      } else if (bodyType.value === 'form') {
        const formData = new URLSearchParams()
        try {
          const obj = JSON.parse(bodyContent.value)
          Object.entries(obj).forEach(([k, v]) => formData.append(k, v))
        } catch {
          formData.append('data', bodyContent.value)
        }
        options.body = formData.toString()
        fetchHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
      } else {
        options.body = bodyContent.value
      }
    }

    const res = await fetch(url.value, options)
    const duration = Math.round(performance.now() - startTime)
    const resHeaders = {}
    res.headers.forEach((v, k) => { resHeaders[k] = v })
    const body = await res.text()

    let formattedBody = ''
    try {
      formattedBody = JSON.stringify(JSON.parse(body), null, 2)
    } catch {}

    response.value = {
      status: res.status,
      statusText: res.statusText,
      duration,
      headers: resHeaders,
      body,
      formattedBody,
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
