import type { Events, Requests } from './eip1193.js'

type WindowProvider = Requests & Events

declare global {
  interface Window {
    ethereum?: WindowProvider
  }
}
