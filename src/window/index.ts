import type * as Provider from 'ox/Provider'

declare global {
  interface Window {
    ethereum?: Provider.Provider | undefined
  }
}
