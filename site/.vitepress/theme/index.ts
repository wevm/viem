import SvgImage from './components/SvgImage.vue'
import defaultTheme from 'vitepress/theme'

import './index.css'

export default {
  ...defaultTheme,
  enhanceApp({ app }) {
    app.component('SvgImage', SvgImage)
  },
}
