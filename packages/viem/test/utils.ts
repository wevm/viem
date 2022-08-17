import { local } from '../src/chains'
import { accountProvider as accountProvider_ } from '../src/providers/account'
import { httpProvider, webSocketProvider } from '../src/providers/network'
import { anvilProvider } from '../src/providers/test'
import { externalProvider } from '../src/providers/wallet'
import { rpc } from '../src/utils/rpc'

export const accounts = [
  {
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x976ea74026e726554db657fa54763abd0c3a0aa9',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x14dc79964da2c08b23698b3d3cc7ca32193d9955',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f',
    balance: 10000000000000000000000n,
  },
  {
    address: '0xa0ee7a142d267c1f36714e4a8f75612f20a79720',
    balance: 10000000000000000000000n,
  },
] as const

export const initialBlockNumber = 15132000

export const networkProvider =
  process.env.VITE_NETWORK_PROVIDER_MODE === 'webSocket'
    ? webSocketProvider({
        chain: local,
      })
    : httpProvider({
        chain: local,
      })

export const walletProvider = externalProvider(
  {
    on: (message, listener) => {
      if (message === 'accountsChanged') {
        listener([accounts[0].address] as any)
      }
    },
    removeListener: () => null,
    request: async ({ method, params }: any) => {
      if (method === 'eth_requestAccounts') {
        return [accounts[0].address]
      }

      const { result } = await rpc.http(local.rpcUrls.default.http, {
        body: {
          method,
          params,
        },
      })
      return result
    },
  },
  { chains: [local] },
)

export const accountProvider = accountProvider_(walletProvider!, {
  address: accounts[0].address,
})

export const testProvider = anvilProvider({ chain: local })
