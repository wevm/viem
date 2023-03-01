import defaultTheme from 'vitepress/theme'
import './index.css'
import SvgImage from './components/SvgImage.vue'

export default {
  ...defaultTheme,
  enhanceApp({ app }) {
    app.component('SvgImage', SvgImage)
  },
}
