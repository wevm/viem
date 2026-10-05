// Depth stress (TS2589 class): tuple-typed batch calls were the classic v2
// "type instantiation is excessively deep" trigger.
import { Actions, Client, http, publicActions } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({ chain: mainnet, transport: http() }).extend(
  publicActions(),
)

export function readAll() {
  return Actions.multicall(client, {
    calls: [
      { to: '0x0000000000000000000000000000000000000001', value: 1n },
      { to: '0x0000000000000000000000000000000000000002', value: 2n },
      { to: '0x0000000000000000000000000000000000000003', value: 3n },
      { to: '0x0000000000000000000000000000000000000004', value: 4n },
      { to: '0x0000000000000000000000000000000000000005', value: 5n },
      { to: '0x0000000000000000000000000000000000000006', value: 6n },
      { to: '0x0000000000000000000000000000000000000007', value: 7n },
      { to: '0x0000000000000000000000000000000000000008', value: 8n },
      { to: '0x0000000000000000000000000000000000000009', value: 9n },
      { to: '0x000000000000000000000000000000000000000a', value: 10n },
    ],
  })
}
