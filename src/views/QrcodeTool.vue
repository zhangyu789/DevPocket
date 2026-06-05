<template>
  <div class="space-y-4">
    <h2 class="tool-header">📱 二维码生成器</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="tool-card space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">输入内容</label>
          <textarea v-model="qrContent" class="textarea-field h-24" placeholder="输入 URL 或文本内容..."></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">前景色</label>
            <div class="flex items-center gap-2">
              <input type="color" v-model="fgColor" class="w-10 h-10 rounded cursor-pointer border-0" />
              <input v-model="fgColor" class="input-field text-sm font-mono" />
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">背景色</label>
            <div class="flex items-center gap-2">
              <input type="color" v-model="bgColor" class="w-10 h-10 rounded cursor-pointer border-0" />
              <input v-model="bgColor" class="input-field text-sm font-mono" />
            </div>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">尺寸: {{ qrSize }}px</label>
          <input type="range" v-model.number="qrSize" min="100" max="500" step="50" class="w-full" />
        </div>

        <div>
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Logo 嵌入 (可选)</label>
          <input type="file" accept="image/*" @change="handleLogoChange" class="input-field text-sm" />
          <div v-if="logoSrc" class="mt-2 flex items-center gap-2">
            <img :src="logoSrc" class="w-10 h-10 rounded border" />
            <button @click="logoSrc = ''; logoFile = null" class="text-xs text-red-500 hover:underline">移除</button>
          </div>
        </div>

        <button @click="generateQR" class="btn-primary w-full">生成二维码</button>
      </div>

      <!-- Output -->
      <div class="tool-card flex flex-col items-center justify-center">
        <div v-if="qrDataUrl" class="space-y-4 text-center">
          <img :src="qrDataUrl" :style="{ width: qrSize + 'px', height: qrSize + 'px' }" class="rounded-lg border border-gray-200 dark:border-slate-600" />
          <div class="flex gap-2 justify-center">
            <button @click="downloadQR('png')" class="btn-primary btn-sm">下载 PNG</button>
            <button @click="downloadQR('svg')" class="btn-secondary btn-sm">下载 SVG</button>
          </div>
        </div>
        <div v-else class="text-gray-400 dark:text-gray-500">
          输入内容后点击"生成二维码"
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QRCode from 'qrcode'

const qrContent = ref('https://github.com')
const fgColor = ref('#000000')
const bgColor = ref('#ffffff')
const qrSize = ref(250)
const qrDataUrl = ref('')
const logoSrc = ref('')
const logoFile = ref(null)
const svgData = ref('')

function handleLogoChange(e) {
  const file = e.target.files[0]
  if (file) {
    logoFile.value = file
    const reader = new FileReader()
    reader.onload = (ev) => { logoSrc.value = ev.target.result }
    reader.readAsDataURL(file)
  }
}

async function generateQR() {
  if (!qrContent.value.trim()) return
  try {
    // Generate canvas
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, qrContent.value, {
      width: qrSize.value,
      margin: 2,
      color: {
        dark: fgColor.value,
        light: bgColor.value,
      }
    })

    // Draw logo if present
    if (logoSrc.value) {
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve) => {
        img.onload = resolve
        img.src = logoSrc.value
      })
      const logoSize = canvas.width * 0.2
      const x = (canvas.width - logoSize) / 2
      const y = (canvas.height - logoSize) / 2
      ctx.fillStyle = bgColor.value
      ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8)
      ctx.drawImage(img, x, y, logoSize, logoSize)
    }

    qrDataUrl.value = canvas.toDataURL('image/png')

    // Also generate SVG
    svgData.value = await QRCode.toString(qrContent.value, {
      type: 'svg',
      width: qrSize.value,
      margin: 2,
      color: {
        dark: fgColor.value,
        light: bgColor.value,
      }
    })
  } catch (e) {
    console.error('QR generation failed:', e)
  }
}

function downloadQR(format) {
  if (format === 'png') {
    const a = document.createElement('a')
    a.href = qrDataUrl.value
    a.download = 'devpocket-qrcode.png'
    a.click()
  } else if (format === 'svg' && svgData.value) {
    const blob = new Blob([svgData.value], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'devpocket-qrcode.svg'
    a.click()
    URL.revokeObjectURL(url)
  }
}

// Auto generate on mount
generateQR()
</script>
