import { Actions, Client, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { Provider, RpcResponse } from 'viem/utils'

let id = 0

const provider = Provider.from({
  async request({ method, params }: { method: string; params?: unknown }) {
    const response = await fetch('http://anvil:8545', {
      body: JSON.stringify({
        id: ++id,
        jsonrpc: '2.0',
        method,
        params: params ?? [],
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    return RpcResponse.parse(await response.json())
  },
})

const client = Client.create({
  chain: mainnet,
  transport: custom(provider),
})

export function example() {
  return Actions.address.getBalance(client, {
    address: '0x5151515151515151515151515151515151515151',
  })
}
