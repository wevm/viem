import type { EIP1193Provider } from './eip1193.js'

declare global {
  interface Window {
    ethereum?: EIP1193Provider | undefined
  }
}
