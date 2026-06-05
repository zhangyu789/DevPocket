<template>
  <div class="space-y-4">
    <h2 class="tool-header">🕐 时间戳转换器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Timestamp -> Date -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">时间戳 → 日期时间</h3>
        <div class="flex gap-2">
          <input v-model="timestampInput" class="input-field font-mono" placeholder="输入时间戳（秒或毫秒）" />
          <button @click="convertToDate" class="btn-primary btn-sm shrink-0">转换</button>
        </div>
        <div v-if="convertedDate" class="space-y-2">
          <div class="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">标准时间</span>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm">{{ convertedDate.standard }}</span>
              <CopyButton :text="convertedDate.standard" />
            </div>
          </div>
          <div class="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">ISO 格式</span>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm">{{ convertedDate.iso }}</span>
              <CopyButton :text="convertedDate.iso" />
            </div>
          </div>
          <div class="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">本地格式</span>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm">{{ convertedDate.local }}</span>
              <CopyButton :text="convertedDate.local" />
            </div>
          </div>
        </div>
      </div>

      <!-- Date -> Timestamp -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">日期时间 → 时间戳</h3>
        <input v-model="dateInput" type="datetime-local" class="input-field" step="1" />
        <div class="flex gap-2">
          <button @click="convertToTimestamp" class="btn-primary btn-sm">转换</button>
          <button @click="useCurrentTime" class="btn-secondary btn-sm">当前时间</button>
        </div>
        <div v-if="convertedTimestamp !== null" class="space-y-2">
          <div class="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">秒级时间戳</span>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm">{{ convertedTimestamp.seconds }}</span>
              <CopyButton :text="String(convertedTimestamp.seconds)" />
            </div>
          </div>
          <div class="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">毫秒级时间戳</span>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm">{{ convertedTimestamp.milliseconds }}</span>
              <CopyButton :text="String(convertedTimestamp.milliseconds)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Current time -->
    <div class="tool-card">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">当前时间</h3>
          <p class="font-mono text-lg text-primary-500">{{ currentTime }}</p>
          <p class="font-mono text-sm text-gray-500 mt-1">时间戳: {{ currentTimestamp }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="copyCurrentTimestamp" class="btn-secondary btn-sm">复制时间戳</button>
          <button @click="refreshTime" class="btn-primary btn-sm">刷新</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CopyButton from '../components/CopyButton.vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

const timestampInput = ref('')
const convertedDate = ref(null)
const dateInput = ref('')
const convertedTimestamp = ref(null)
const currentTime = ref('')
const currentTimestamp = ref(0)

let timer = null

function convertToDate() {
  if (!timestampInput.value.trim()) return
  let ts = Number(timestampInput.value.trim())
  if (isNaN(ts)) {
    convertedDate.value = null
    return
  }
  // Auto-detect seconds vs milliseconds
  if (ts < 1e12) ts *= 1000
  const date = new Date(ts)
  convertedDate.value = {
    standard: date.toLocaleString('zh-CN', { hour12: false }),
    iso: date.toISOString(),
    local: date.toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }
}

function convertToTimestamp() {
  if (!dateInput.value) return
  const date = new Date(dateInput.value)
  convertedTimestamp.value = {
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime(),
  }
}

function useCurrentTime() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  dateInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  convertToTimestamp()
}

function refreshTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', { hour12: false })
  currentTimestamp.value = Math.floor(now.getTime() / 1000)
}

function copyCurrentTimestamp() {
  navigator.clipboard.writeText(String(currentTimestamp.value))
  show('时间戳已复制', 'success')
}

onMounted(() => {
  refreshTime()
  timer = setInterval(refreshTime, 1000)
  useCurrentTime()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
