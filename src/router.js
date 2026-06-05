import JsonTool from './views/JsonTool.vue'
import Base64Tool from './views/Base64Tool.vue'
import CodeFormatTool from './views/CodeFormatTool.vue'
import RegexTool from './views/RegexTool.vue'
import TimestampTool from './views/TimestampTool.vue'
import QrcodeTool from './views/QrcodeTool.vue'
import PasswordTool from './views/PasswordTool.vue'
import PostmanTool from './views/PostmanTool.vue'
import ImageTool from './views/ImageTool.vue'
import A11yTool from './views/A11yTool.vue'

export const routes = [
  { path: '/', redirect: '/json' },
  { path: '/json', name: 'json', component: JsonTool, meta: { title: 'JSON 格式化', icon: '📐', group: 'text' } },
  { path: '/base64', name: 'base64', component: Base64Tool, meta: { title: 'Base64 编解码', icon: '🔐', group: 'text' } },
  { path: '/code-format', name: 'code-format', component: CodeFormatTool, meta: { title: '代码美化压缩', icon: '🎨', group: 'text' } },
  { path: '/regex', name: 'regex', component: RegexTool, meta: { title: '正则测试器', icon: '🔍', group: 'text' } },
  { path: '/timestamp', name: 'timestamp', component: TimestampTool, meta: { title: '时间戳转换', icon: '🕐', group: 'time' } },
  { path: '/qrcode', name: 'qrcode', component: QrcodeTool, meta: { title: '二维码生成', icon: '📱', group: 'time' } },
  { path: '/password', name: 'password', component: PasswordTool, meta: { title: '密码生成器', icon: '🔑', group: 'time' } },
  { path: '/postman', name: 'postman', component: PostmanTool, meta: { title: '接口调试', icon: '🚀', group: 'advanced' } },
  { path: '/image', name: 'image', component: ImageTool, meta: { title: '图片处理', icon: '🖼️', group: 'advanced' } },
  { path: '/a11y', name: 'a11y', component: A11yTool, meta: { title: '无障碍辅助', icon: '♿', group: 'advanced' } },
]

export const toolGroups = {
  text: { label: '文本与代码', icon: '📝' },
  time: { label: '时间与数据', icon: '⏰' },
  advanced: { label: '进阶与多媒体', icon: '⚡' },
}
