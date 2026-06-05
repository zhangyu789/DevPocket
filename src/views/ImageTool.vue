<template>
  <div class="space-y-4">
    <h2 class="tool-header">🖼️ 本地图片处理器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Upload area -->
      <div class="tool-card space-y-4">
        <div
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          :class="['border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer', dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-slate-600']"
          @click="$refs.fileInput.click()"
        >
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" class="hidden" />
          <p class="text-gray-500 dark:text-gray-400 mb-2">拖拽图片到此处，或点击选择</p>
          <p class="text-xs text-gray-400">支持 PNG, JPG, WebP 等格式</p>
        </div>

        <!-- Preview -->
        <div v-if="originalSrc" class="space-y-3">
          <div class="flex gap-4">
            <div class="flex-1">
              <p class="text-xs text-gray-500 mb-1">原图预览</p>
              <img :src="originalSrc" class="max-h-48 rounded-lg border border-gray-200 dark:border-slate-600 object-contain" />
            </div>
            <div v-if="processedSrc" class="flex-1">
              <p class="text-xs text-gray-500 mb-1">处理后预览</p>
              <img :src="processedSrc" class="max-h-48 rounded-lg border border-gray-200 dark:border-slate-600 object-contain" />
            </div>
          </div>
          <div class="text-xs text-gray-500 space-y-1">
            <p>文件名: {{ fileInfo.name }}</p>
            <p>原始大小: {{ formatSize(fileInfo.size) }}</p>
            <p v-if="processedSize !== null">处理后大小: {{ formatSize(processedSize) }}</p>
            <p>尺寸: {{ fileInfo.width }} x {{ fileInfo.height }}</p>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="tool-card space-y-4">
        <!-- Compression -->
        <div>
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">图片压缩</h3>
          <div class="flex items-center gap-3">
            <label class="text-sm text-gray-600 dark:text-gray-400 shrink-0">质量:</label>
            <input type="range" v-model.number="quality" min="0.1" max="1" step="0.05" class="flex-1" />
            <span class="text-sm font-mono text-gray-600 dark:text-gray-400 w-12 text-right">{{ Math.round(quality * 100) }}%</span>
          </div>
          <button @click="compressImage" :disabled="!originalSrc" class="btn-primary btn-sm mt-2">压缩图片</button>
        </div>

        <!-- Format conversion -->
        <div>
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">格式转换</h3>
          <div class="flex gap-2">
            <button @click="convertImage('image/webp')" :disabled="!originalSrc" class="btn-secondary btn-sm">转为 WebP</button>
            <button @click="convertImage('image/png')" :disabled="!originalSrc" class="btn-secondary btn-sm">转为 PNG</button>
            <button @click="convertImage('image/jpeg')" :disabled="!originalSrc" class="btn-secondary btn-sm">转为 JPG</button>
          </div>
        </div>

        <!-- Watermark -->
        <div>
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">添加水印</h3>
          <input v-model="watermarkText" class="input-field mb-2" placeholder="输入水印文字" />
          <div class="flex gap-2">
            <select v-model="watermarkPosition" class="input-field w-32">
              <option value="bottom-right">右下角</option>
              <option value="bottom-left">左下角</option>
              <option value="top-right">右上角</option>
              <option value="top-left">左上角</option>
              <option value="center">居中</option>
            </select>
            <button @click="addWatermark" :disabled="!originalSrc || !watermarkText" class="btn-primary btn-sm">添加水印</button>
          </div>
        </div>

        <!-- Download -->
        <div v-if="processedSrc">
          <button @click="downloadImage" class="btn-primary w-full">下载处理后图片</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

const dragOver = ref(false)
const originalSrc = ref('')
const processedSrc = ref('')
const originalFile = ref(null)
const fileInfo = ref({ name: '', size: 0, width: 0, height: 0 })
const processedSize = ref(null)
const quality = ref(0.7)
const watermarkText = ref('')
const watermarkPosition = ref('bottom-right')

function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) loadImage(file)
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) loadImage(file)
}

function loadImage(file) {
  originalFile.value = file
  fileInfo.value.name = file.name
  fileInfo.value.size = file.size

  const reader = new FileReader()
  reader.onload = (e) => {
    originalSrc.value = e.target.result
    const img = new Image()
    img.onload = () => {
      fileInfo.value.width = img.width
      fileInfo.value.height = img.height
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
  processedSrc.value = ''
  processedSize.value = null
}

function getImageCanvas() {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve({ canvas, ctx, img })
    }
    img.src = originalSrc.value
  })
}

async function compressImage() {
  try {
    const { canvas } = await getImageCanvas()
    canvas.toBlob(
      (blob) => {
        processedSrc.value = URL.createObjectURL(blob)
        processedSize.value = blob.size
        show('压缩完成', 'success')
      },
      'image/jpeg',
      quality.value
    )
  } catch (e) {
    show('压缩失败: ' + e.message, 'error')
  }
}

async function convertImage(mimeType) {
  try {
    const { canvas } = await getImageCanvas()
    canvas.toBlob(
      (blob) => {
        processedSrc.value = URL.createObjectURL(blob)
        processedSize.value = blob.size
        const ext = mimeType.split('/')[1]
        show(`已转换为 ${ext.toUpperCase()}`, 'success')
      },
      mimeType,
      0.9
    )
  } catch (e) {
    show('转换失败: ' + e.message, 'error')
  }
}

async function addWatermark() {
  try {
    const { canvas, ctx, img } = await getImageCanvas()
    const fontSize = Math.max(16, Math.min(img.width, img.height) * 0.05)
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = 2

    const text = watermarkText.value
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width
    const textHeight = fontSize
    const padding = fontSize

    let x, y
    const pos = watermarkPosition.value
    if (pos === 'top-left') { x = padding; y = padding + textHeight }
    else if (pos === 'top-right') { x = canvas.width - textWidth - padding; y = padding + textHeight }
    else if (pos === 'bottom-left') { x = padding; y = canvas.height - padding }
    else if (pos === 'bottom-right') { x = canvas.width - textWidth - padding; y = canvas.height - padding }
    else { x = (canvas.width - textWidth) / 2; y = (canvas.height + textHeight) / 2 }

    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)

    canvas.toBlob((blob) => {
      processedSrc.value = URL.createObjectURL(blob)
      processedSize.value = blob.size
      show('水印已添加', 'success')
    })
  } catch (e) {
    show('添加水印失败: ' + e.message, 'error')
  }
}

function downloadImage() {
  if (!processedSrc.value) return
  const a = document.createElement('a')
  a.href = processedSrc.value
  a.download = 'devpocket-processed.png'
  a.click()
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>
