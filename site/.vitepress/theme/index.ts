import SvgImage from './components/SvgImage.vue'
import './index.css'
import defaultTheme from 'vitepress/theme'

export default {
  ...defaultTheme,
  enhanceApp({ app }) {
    app.component('SvgImage', SvgImage)
  },
}
