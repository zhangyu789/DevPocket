<template>
  <div class="space-y-4">
    <h2 class="tool-header">♿ 网页无障碍辅助</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Font size control -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">🔤 全局字体大小调节</h3>
        <div class="flex items-center justify-center gap-4 py-4">
          <button @click="decreaseFontSize" class="w-12 h-12 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-2xl font-bold transition-colors">
            A-
          </button>
          <div class="text-center">
            <div class="text-4xl font-bold text-primary-500">{{ fontSizePercent }}%</div>
            <div class="text-xs text-gray-400 mt-1">当前字体大小</div>
          </div>
          <button @click="increaseFontSize" class="w-12 h-12 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl text-2xl font-bold transition-colors">
            A+
          </button>
        </div>
        <button @click="resetFontSize" class="btn-secondary w-full">重置为默认大小</button>
        <div class="text-xs text-gray-400 text-center">
          快捷键: Ctrl + / Ctrl - 调节字体大小
        </div>
      </div>

      <!-- Reading mode -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">📖 阅读模式</h3>
        <div class="space-y-3">
          <button
            @click="toggleHighContrast"
            :class="['w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors', highContrast ? 'bg-yellow-400 text-black' : 'bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700']"
          >
            <span class="text-lg">🌓</span>
            <span class="text-sm font-medium">{{ highContrast ? '关闭高对比度' : '开启高对比度' }}</span>
          </button>

          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">护眼背景色</label>
            <div class="flex gap-2">
              <button
                v-for="color in eyeCareColors"
                :key="color.name"
                @click="applyEyeCareColor(color)"
                :class="['w-10 h-10 rounded-lg border-2 transition-all', activeEyeCareColor === color.name ? 'border-primary-500 scale-110' : 'border-gray-200 dark:border-slate-600']"
                :style="{ backgroundColor: color.bg }"
                :title="color.name"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Screen reader -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">🔊 屏幕朗读</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          选中文本后点击"朗读选中文本"按钮，或直接输入文本进行朗读。
        </p>
        <textarea v-model="ttsText" class="textarea-field h-24" placeholder="输入要朗读的文本，或选中文本后点击朗读..."></textarea>
        <div class="flex gap-2">
          <button @click="speakText" :disabled="speaking" class="btn-primary btn-sm flex-1">
            {{ speaking ? '朗读中...' : '朗读' }}
          </button>
          <button @click="stopSpeaking" :disabled="!speaking" class="btn-secondary btn-sm">停止</button>
        </div>
        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-600 dark:text-gray-400 shrink-0">语速:</label>
          <input type="range" v-model.number="speechRate" min="0.5" max="2" step="0.1" class="flex-1" />
          <span class="text-xs text-gray-400 w-8">{{ speechRate }}x</span>
        </div>
        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-600 dark:text-gray-400 shrink-0">音调:</label>
          <input type="range" v-model.number="speechPitch" min="0.5" max="2" step="0.1" class="flex-1" />
          <span class="text-xs text-gray-400 w-8">{{ speechPitch }}</span>
        </div>
        <div class="text-xs text-gray-400">
          💡 提示：你也可以在页面任何位置选中文本，然后点击"朗读选中文本"
        </div>
      </div>

      <!-- Accessibility info -->
      <div class="tool-card space-y-4">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">ℹ️ 无障碍功能说明</h3>
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex gap-2">
            <span class="text-lg">🔤</span>
            <p><strong>字体调节</strong>：支持放大/缩小页面字体，方便视力不佳的用户阅读。</p>
          </div>
          <div class="flex gap-2">
            <span class="text-lg">🌓</span>
            <p><strong>高对比度</strong>：使用高对比度配色方案，增强文字与背景的区分度。</p>
          </div>
          <div class="flex gap-2">
            <span class="text-lg">🌿</span>
            <p><strong>护眼模式</strong>：提供多种护眼背景色，减少长时间阅读的眼部疲劳。</p>
          </div>
          <div class="flex gap-2">
            <span class="text-lg">🔊</span>
            <p><strong>屏幕朗读</strong>：使用 Web Speech API 朗读文本，支持调节语速和音调。</p>
          </div>
          <div class="flex gap-2">
            <span class="text-lg">⌨️</span>
            <p><strong>键盘导航</strong>：支持 Tab 键和快捷键操作，无需鼠标即可使用。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

// Font size
const fontSizePercent = ref(100)
let originalFontSize = ''

function increaseFontSize() {
  fontSizePercent.value = Math.min(200, fontSizePercent.value + 10)
  applyFontSize()
}

function decreaseFontSize() {
  fontSizePercent.value = Math.max(60, fontSizePercent.value - 10)
  applyFontSize()
}

function resetFontSize() {
  fontSizePercent.value = 100
  applyFontSize()
  show('字体大小已重置', 'success')
}

function applyFontSize() {
  document.documentElement.style.fontSize = fontSizePercent.value + '%'
}

// High contrast
const highContrast = ref(false)

function toggleHighContrast() {
  highContrast.value = !highContrast.value
  document.documentElement.classList.toggle('high-contrast', highContrast.value)
  show(highContrast.value ? '高对比度已开启' : '高对比度已关闭', 'success')
}

// Eye care colors
const eyeCareColors = [
  { name: '默认', bg: 'transparent', style: '' },
  { name: '绿豆沙', bg: '#c7edcc', style: 'filter: sepia(0.1) hue-rotate(50deg) saturate(0.8)' },
  { name: '暖黄', bg: '#faf5e4', style: 'filter: sepia(0.15) saturate(0.9)' },
  { name: '浅蓝', bg: '#dce2f1', style: 'filter: hue-rotate(200deg) saturate(0.5) brightness(1.05)' },
  { name: '浅灰', bg: '#e8e8e8', style: 'filter: grayscale(0.3) brightness(1.05)' },
]
const activeEyeCareColor = ref('默认')

function applyEyeCareColor(color) {
  activeEyeCareColor.value = color.name
  document.documentElement.style.filter = color.style || ''
  show(`已切换至${color.name}模式`, 'success')
}

// Text-to-speech
const ttsText = ref('')
const speaking = ref(false)
const speechRate = ref(1)
const speechPitch = ref(1)

function speakText() {
  if (!('speechSynthesis' in window)) {
    show('您的浏览器不支持语音合成', 'error')
    return
  }

  // Get selected text or use input text
  const selection = window.getSelection()?.toString()
  const text = selection || ttsText.value

  if (!text.trim()) {
    show('请输入或选中文本后再朗读', 'error')
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = speechRate.value
  utterance.pitch = speechPitch.value
  utterance.onstart = () => { speaking.value = true }
  utterance.onend = () => { speaking.value = false }
  utterance.onerror = () => { speaking.value = false }
  window.speechSynthesis.speak(utterance)
}

function stopSpeaking() {
  window.speechSynthesis.cancel()
  speaking.value = false
}

// Keyboard shortcuts
function handleKeydown(e) {
  if (e.ctrlKey && e.key === '=') {
    e.preventDefault()
    increaseFontSize()
  } else if (e.ctrlKey && e.key === '-') {
    e.preventDefault()
    decreaseFontSize()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  originalFontSize = document.documentElement.style.fontSize
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  // Reset on leave
  document.documentElement.style.fontSize = originalFontSize
  document.documentElement.style.filter = ''
  document.documentElement.classList.remove('high-contrast')
  window.speechSynthesis?.cancel()
})
</script>

<style scoped>
.high-contrast :deep(*) {
  filter: contrast(1.5) !important;
}
</style>
