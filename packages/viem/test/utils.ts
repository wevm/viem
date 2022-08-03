import { vi } from 'vitest'

import { local } from '../src/chains'
import { accountProvider as accountProvider_ } from '../src/providers/account'
import { jsonRpcProvider } from '../src/providers/network'
import { injectedProvider } from '../src/providers/wallet'
import { rpc } from '../src/utils/rpc'

export const accountAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

vi.stubGlobal('window', {
  ethereum: {
    on: vi.fn((message, listener) => {
      if (message === 'accountsChanged') {
        listener([accountAddress])
      }
    }),
    removeListener: vi.fn(() => null),
    request: vi.fn(async ({ method, params }: any) => {
      if (method === 'eth_requestAccounts') {
        return [accountAddress]
      }

      const { result } = await rpc.http(local.rpcUrls.public, {
        body: {
          method,
          params,
        },
      })
      return result
    }),
  },
})

export const networkProvider = jsonRpcProvider({
  chain: local,
})

export const walletProvider = injectedProvider({ chains: [local] })

export const accountProvider = accountProvider_(walletProvider!, {
  address: accountAddress,
})
