<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔑 安全密码生成器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card space-y-4">
        <!-- Generated password -->
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">生成的密码</label>
          <div class="flex gap-2">
            <div class="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg font-mono text-lg break-all select-all">
              {{ password }}
            </div>
            <CopyButton :text="password" />
          </div>
        </div>

        <!-- Strength indicator -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-500">密码强度</span>
            <span :class="['text-xs font-semibold', strengthColor]">{{ strengthLabel }}</span>
          </div>
          <div class="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              :class="['h-full rounded-full transition-all duration-300', strengthBarColor]"
              :style="{ width: strengthPercent + '%' }"
            ></div>
          </div>
        </div>

        <!-- Length -->
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            密码长度: {{ length }}
          </label>
          <input type="range" v-model.number="length" min="8" max="64" step="1" class="w-full" />
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>8</span><span>64</span>
          </div>
        </div>

        <!-- Options -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">字符类型</label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="useUppercase" class="w-4 h-4 rounded text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">大写字母 (A-Z)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="useLowercase" class="w-4 h-4 rounded text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">小写字母 (a-z)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="useNumbers" class="w-4 h-4 rounded text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">数字 (0-9)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="useSymbols" class="w-4 h-4 rounded text-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">特殊符号 (!@#$%^&*)</span>
          </label>
        </div>

        <button @click="generate" class="btn-primary w-full">生成密码</button>
      </div>

      <!-- History -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">生成历史</label>
          <button @click="history = []" class="btn-secondary btn-sm">清空</button>
        </div>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="(item, i) in history"
            :key="i"
            class="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2"
          >
            <span class="font-mono text-sm break-all">{{ item }}</span>
            <CopyButton :text="item" />
          </div>
          <div v-if="history.length === 0" class="text-center text-gray-400 text-sm py-4">
            暂无历史记录
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const length = ref(16)
const useUppercase = ref(true)
const useLowercase = ref(true)
const useNumbers = ref(true)
const useSymbols = ref(true)
const password = ref('')
const history = ref([])

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function generate() {
  let chars = ''
  const required = []
  if (useUppercase.value) { chars += UPPERCASE; required.push(UPPERCASE) }
  if (useLowercase.value) { chars += LOWERCASE; required.push(LOWERCASE) }
  if (useNumbers.value) { chars += NUMBERS; required.push(NUMBERS) }
  if (useSymbols.value) { chars += SYMBOLS; required.push(SYMBOLS) }

  if (!chars) {
    password.value = ''
    return
  }

  // Ensure at least one character from each selected type
  let result = required.map(set => set[Math.floor(Math.random() * set.length)]).join('')
  
  // Fill the rest
  while (result.length < length.value) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }

  // Shuffle
  result = result.split('').sort(() => Math.random() - 0.5).join('')
  password.value = result
  
  // Add to history (keep last 20)
  history.value.unshift(result)
  if (history.value.length > 20) history.value.pop()
}

const strength = computed(() => {
  if (!password.value) return 0
  let score = 0
  if (password.value.length >= 8) score++
  if (password.value.length >= 12) score++
  if (password.value.length >= 16) score++
  if (/[a-z]/.test(password.value)) score++
  if (/[A-Z]/.test(password.value)) score++
  if (/[0-9]/.test(password.value)) score++
  if (/[^a-zA-Z0-9]/.test(password.value)) score++
  return score
})

const strengthPercent = computed(() => Math.min((strength.value / 7) * 100, 100))
const strengthLabel = computed(() => {
  if (strength.value <= 2) return '弱'
  if (strength.value <= 4) return '中'
  if (strength.value <= 5) return '强'
  return '非常强'
})
const strengthColor = computed(() => {
  if (strength.value <= 2) return 'text-red-500'
  if (strength.value <= 4) return 'text-yellow-500'
  if (strength.value <= 5) return 'text-green-500'
  return 'text-green-600'
})
const strengthBarColor = computed(() => {
  if (strength.value <= 2) return 'bg-red-500'
  if (strength.value <= 4) return 'bg-yellow-500'
  if (strength.value <= 5) return 'bg-green-500'
  return 'bg-green-600'
})

onMounted(() => generate())
</script>
