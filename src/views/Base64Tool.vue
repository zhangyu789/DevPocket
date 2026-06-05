<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔐 Base64 编解码</h2>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button
        v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600']"
      >{{ tab.label }}</button>
    </div>

    <!-- Text <-> Base64 -->
    <div v-if="activeTab === 'text'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">原始文本</label>
          <button @click="textInput = ''" class="btn-secondary btn-sm">清空</button>
        </div>
        <textarea v-model="textInput" class="textarea-field h-60" placeholder="输入要编码的文本..."></textarea>
      </div>
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Base64 结果</label>
          <div class="flex gap-2">
            <button @click="encodeText" class="btn-primary btn-sm">编码 →</button>
            <button @click="decodeText" class="btn-secondary btn-sm">← 解码</button>
            <CopyButton :text="base64Output" />
          </div>
        </div>
        <textarea v-model="base64Output" class="textarea-field h-60" placeholder="Base64 编码结果..."></textarea>
        <div v-if="textError" class="mt-2 text-sm text-red-500">{{ textError }}</div>
      </div>
    </div>

    <!-- Image <-> Base64 -->
    <div v-if="activeTab === 'image'" class="space-y-4">
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">图片转 Base64</label>
        </div>
        <div
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          :class="['border-2 border-dashed rounded-lg p-8 text-center transition-colors', dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-slate-600']"
        >
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" class="hidden" />
          <p class="text-gray-500 dark:text-gray-400 mb-2">拖拽图片到此处，或</p>
          <button @click="$refs.fileInput.click()" class="btn-primary btn-sm">选择图片</button>
        </div>
        <div v-if="imagePreview" class="mt-4 space-y-3">
          <img :src="imagePreview" class="max-h-40 rounded-lg border border-gray-200 dark:border-slate-600" />
          <div class="flex items-center gap-2">
            <CopyButton :text="imageBase64" />
            <span class="text-xs text-gray-400">{{ imageBase64.length }} 字符</span>
          </div>
          <textarea :value="imageBase64" class="textarea-field h-24 text-xs" readonly></textarea>
        </div>
      </div>

      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Base64 转图片</label>
        </div>
        <textarea v-model="base64ImageInput" class="textarea-field h-24" placeholder="粘贴 Base64 图片字符串（含或不含 Data URI 前缀均可）"></textarea>
        <div v-if="decodedImageSrc" class="mt-3 space-y-3">
          <img :src="decodedImageSrc" class="max-h-40 rounded-lg border border-gray-200 dark:border-slate-600" />
          <button @click="downloadImage" class="btn-primary btn-sm">下载图片</button>
        </div>
        <div v-if="imageDecodeError" class="mt-2 text-sm text-red-500">{{ imageDecodeError }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const tabs = [
  { key: 'text', label: '文本编解码' },
  { key: 'image', label: '图片互转' },
]
const activeTab = ref('text')

// Text <-> Base64
const textInput = ref('')
const base64Output = ref('')
const textError = ref('')

function encodeText() {
  textError.value = ''
  try {
    base64Output.value = btoa(unescape(encodeURIComponent(textInput.value)))
  } catch (e) {
    textError.value = '编码失败: ' + e.message
  }
}

function decodeText() {
  textError.value = ''
  try {
    textInput.value = decodeURIComponent(escape(atob(base64Output.value)))
  } catch (e) {
    textError.value = '解码失败: 输入不是有效的 Base64 字符串'
  }
}

// Image <-> Base64
const dragOver = ref(false)
const fileInput = ref(null)
const imagePreview = ref('')
const imageBase64 = ref('')
const base64ImageInput = ref('')
const imageDecodeError = ref('')

function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) processImageFile(file)
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) processImageFile(file)
}

function processImageFile(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
    imageBase64.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const decodedImageSrc = ref('')

// watch base64ImageInput
import { watch } from 'vue'
watch(base64ImageInput, (val) => {
  imageDecodeError.value = ''
  decodedImageSrc.value = ''
  if (!val.trim()) return
  let src = val.trim()
  if (!src.startsWith('data:')) {
    src = 'data:image/png;base64,' + src
  }
  const img = new Image()
  img.onload = () => { decodedImageSrc.value = src }
  img.onerror = () => { imageDecodeError.value = '无法解析为图片，请检查 Base64 字符串' }
  img.src = src
})

function downloadImage() {
  if (!decodedImageSrc.value) return
  const a = document.createElement('a')
  a.href = decodedImageSrc.value
  a.download = 'devpocket-decoded.png'
  a.click()
}
</script>
