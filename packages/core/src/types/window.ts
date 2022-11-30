import { Events, Requests } from './eip1193'

type WindowProvider = Requests & Events

declare global {
  interface Window {
    ethereum?: WindowProvider
  }
}
