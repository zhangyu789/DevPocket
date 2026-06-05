<template>
  <div class="space-y-4">
    <h2 class="tool-header">🎨 代码美化与压缩</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输入代码</label>
            <select v-model="language" class="text-xs bg-gray-100 dark:bg-slate-700 rounded px-2 py-1 text-gray-600 dark:text-gray-400">
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button @click="loadSample" class="btn-secondary btn-sm">示例</button>
            <button @click="input = ''" class="btn-secondary btn-sm">清空</button>
          </div>
        </div>
        <textarea v-model="input" class="textarea-field h-80" placeholder="粘贴代码..." spellcheck="false"></textarea>
      </div>

      <!-- Output -->
      <div class="tool-card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">输出结果</label>
          <div class="flex gap-2">
            <button @click="formatCode" class="btn-primary btn-sm">美化</button>
            <button @click="minifyCode" class="btn-secondary btn-sm">压缩</button>
            <CopyButton :text="output" />
          </div>
        </div>
        <textarea v-model="output" class="textarea-field h-80" readonly spellcheck="false"></textarea>
        <div v-if="codeError" class="mt-2 text-sm text-red-500">{{ codeError }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('')
const output = ref('')
const language = ref('javascript')
const codeError = ref('')

async function formatCode() {
  codeError.value = ''
  if (!input.value.trim()) { output.value = ''; return }
  try {
    const prettier = await import('prettier')
    const parser = language.value === 'html' ? 'html' : language.value === 'css' ? 'css' : 'babel'
    const result = await prettier.format(input.value, {
      parser,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
      plugins: await getPrettierPlugins(),
    })
    output.value = result
  } catch (e) {
    codeError.value = e.message
    output.value = ''
  }
}

async function getPrettierPlugins() {
  const plugins = []
  try {
    const babel = await import('prettier/plugins/babel')
    plugins.push(babel.default || babel)
  } catch {}
  try {
    const estree = await import('prettier/plugins/estree')
    plugins.push(estree.default || estree)
  } catch {}
  try {
    const html = await import('prettier/plugins/html')
    plugins.push(html.default || html)
  } catch {}
  try {
    const css = await import('prettier/plugins/postcss')
    plugins.push(css.default || css)
  } catch {}
  return plugins
}

function minifyCode() {
  codeError.value = ''
  if (!input.value.trim()) { output.value = ''; return }
  try {
    let code = input.value
    // Basic minification
    if (language.value === 'javascript') {
      code = code
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}();,=+\-*/<>!&|?:])\s*/g, '$1')
        .trim()
    } else if (language.value === 'css') {
      code = code
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\n/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .trim()
    } else {
      code = code
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim()
    }
    output.value = code
  } catch (e) {
    codeError.value = e.message
  }
}

function loadSample() {
  if (language.value === 'javascript') {
    input.value = `function fibonacci(n){if(n<=1)return n;let a=0,b=1;for(let i=2;i<=n;i++){const temp=a+b;a=b;b=temp;}return b;}const result=fibonacci(10);console.log("Fibonacci(10) =",result);`
  } else if (language.value === 'css') {
    input.value = `.container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:2rem;background-color:#f5f5f5;}.title{font-size:2rem;font-weight:bold;color:#333;margin-bottom:1rem;}`
  } else {
    input.value = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>DevPocket</title></head><body><div class="container"><h1 class="title">Hello DevPocket</h1><p>A developer toolbox.</p></div></body></html>`
  }
}
</script>
