import type { EIP1193Provider } from '../types/eip1193.js'

declare global {
  interface Window {
    ethereum?: EIP1193Provider | undefined
  }
}
