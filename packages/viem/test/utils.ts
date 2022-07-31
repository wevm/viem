import { vi } from 'vitest'

import { local } from '../src/chains'
import { jsonRpcProvider } from '../src/providers/network'
import { injectedProvider } from '../src/providers/wallet/injectedProvider'

vi.stubGlobal('window', {
  ethereum: {
    on: vi.fn((message, listener) => {
      if (message === 'accountsChanged') {
        listener(['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'])
      }
    }),
    removeListener: vi.fn(() => null),
    request: vi.fn(async ({ method, params }: any) => {
      if (method === 'eth_requestAccounts') {
        return ['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac']
      }
      return networkProvider.request({ method, params })
    }),
  },
})

export const networkProvider = jsonRpcProvider({
  url: local.rpcUrls.public,
})

export const walletProvider = injectedProvider()
