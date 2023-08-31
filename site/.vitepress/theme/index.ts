import defaultTheme from 'vitepress/theme'
import SvgImage from './components/SvgImage.vue'

import './index.css'

export default {
  ...defaultTheme,
  enhanceApp({ app }) {
    app.component('SvgImage', SvgImage)
  },
}
