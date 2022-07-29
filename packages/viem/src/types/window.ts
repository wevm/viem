import {
  ConnectedRequests,
  Events,
  InjectedFlags,
  InjectedRequests,
  PublicRequests,
} from './ethereum-provider'

type WindowProvider = PublicRequests &
  ConnectedRequests &
  InjectedRequests &
  Events &
  InjectedFlags

declare global {
  interface Window {
    ethereum?: WindowProvider
  }
}
