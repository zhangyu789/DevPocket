<template>
  <div class="space-y-4">
    <h2 class="tool-header">🔍 正则表达式测试器</h2>

    <div class="tool-card space-y-4">
      <!-- Regex input -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">正则表达式</label>
          <div class="flex gap-2">
            <span class="flex items-center px-3 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-400 font-mono">/</span>
            <input v-model="regexStr" class="input-field font-mono" placeholder="输入正则表达式，如：\d+" />
            <span class="flex items-center px-3 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-400 font-mono">/</span>
            <input v-model="flags" class="input-field w-20 font-mono text-center" placeholder="gi" />
          </div>
        </div>
      </div>

      <!-- Regex error -->
      <div v-if="regexError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 text-sm text-red-600 dark:text-red-400">
        ⚠️ {{ regexError }}
      </div>

      <!-- Test text -->
      <div>
        <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">测试文本</label>
        <textarea v-model="testText" class="textarea-field h-40" placeholder="输入测试文本..."></textarea>
      </div>

      <!-- Match results -->
      <div v-if="matches.length > 0">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">
            匹配结果 ({{ matches.length }} 个匹配)
          </label>
          <CopyButton :text="matches.map(m => m[0]).join('\n')" />
        </div>
        <div class="space-y-2">
          <div
            v-for="(match, i) in matches"
            :key="i"
            class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded font-mono">
                #{{ i + 1 }}
              </span>
              <span class="font-mono text-green-600 dark:text-green-400">{{ match[0] }}</span>
              <span class="text-xs text-gray-400">位置: {{ match.index }}</span>
            </div>
            <div v-if="match.length > 1" class="ml-6 flex flex-wrap gap-2">
              <span
                v-for="(group, gi) in match.slice(1)"
                :key="gi"
                class="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-mono"
              >
                组{{ gi + 1 }}: {{ group ?? '(未匹配)' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="regexStr && testText && !regexError" class="text-sm text-gray-400">
        无匹配结果
      </div>

      <!-- Highlighted text -->
      <div v-if="highlightedText">
        <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">高亮预览</label>
        <div class="textarea-field min-h-[60px] whitespace-pre-wrap" v-html="highlightedText"></div>
      </div>
    </div>

    <!-- Common templates -->
    <div class="tool-card">
      <label class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block">常用正则模板</label>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <button
          v-for="tpl in templates"
          :key="tpl.name"
          @click="applyTemplate(tpl)"
          class="text-left px-3 py-2 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ tpl.name }}</div>
          <div class="text-xs font-mono text-gray-400 mt-0.5">{{ tpl.regex }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const regexStr = ref('')
const flags = ref('g')
const testText = ref('')
const regexError = ref('')

const matches = computed(() => {
  if (!regexStr.value || !testText.value) return []
  try {
    const regex = new RegExp(regexStr.value, flags.value)
    const results = []
    let match
    if (flags.value.includes('g')) {
      while ((match = regex.exec(testText.value)) !== null) {
        results.push(match)
        if (match[0].length === 0) regex.lastIndex++
      }
    } else {
      match = regex.exec(testText.value)
      if (match) results.push(match)
    }
    return results
  } catch {
    return []
  }
})

const highlightedText = computed(() => {
  if (!regexStr.value || !testText.value || matches.value.length === 0) return ''
  const text = testText.value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // Re-run regex on escaped text is complex, so let's do position-based highlighting
  let result = ''
  let lastIndex = 0
  const sortedMatches = [...matches.value].sort((a, b) => a.index - b.index)
  
  for (const match of sortedMatches) {
    const rawBefore = testText.value.slice(lastIndex, match.index)
    const rawMatch = testText.value.slice(match.index, match.index + match[0].length)
    result += escapeHtml(rawBefore)
    result += `<mark class="bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-200 rounded px-0.5">${escapeHtml(rawMatch)}</mark>`
    lastIndex = match.index + match[0].length
  }
  result += escapeHtml(testText.value.slice(lastIndex))
  return result
})

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

watch([regexStr, flags], () => {
  regexError.value = ''
  if (!regexStr.value) return
  try {
    new RegExp(regexStr.value, flags.value)
  } catch (e) {
    regexError.value = e.message
  }
})

const templates = [
  { name: '邮箱', regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  { name: '手机号', regex: '1[3-9]\\d{9}', flags: 'g' },
  { name: 'IP地址', regex: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', flags: 'g' },
  { name: 'URL', regex: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-.,@?^=%&:/~+#]*', flags: 'g' },
  { name: '身份证号', regex: '\\d{17}[\\dXx]', flags: 'g' },
  { name: '中文字符', regex: '[\\u4e00-\\u9fa5]+', flags: 'g' },
  { name: 'HTML标签', regex: '<[^>]+>', flags: 'g' },
  { name: '日期格式', regex: '\\d{4}[-/]\\d{2}[-/]\\d{2}', flags: 'g' },
  { name: '数字', regex: '-?\\d+\\.?\\d*', flags: 'g' },
]

function applyTemplate(tpl) {
  regexStr.value = tpl.regex
  flags.value = tpl.flags || 'g'
}
</script>
