import { Client, http, publicActions, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

type Equal<left, right> =
  (<value>() => value extends left ? 1 : 2) extends <
    value,
  >() => value extends right ? 1 : 2
    ? true
    : false

type Expect<condition extends true> = condition

const extended = mainnet.extend({ extra: 'extra' })
const chained = extended.extend({ more: 123 })
const extendedTypes: [
  Expect<Equal<typeof extended.id, 1>>,
  Expect<Equal<typeof extended.name, 'Ethereum'>>,
  Expect<Equal<typeof extended.extra, 'extra'>>,
  Expect<Equal<typeof chained.extra, 'extra'>>,
  Expect<Equal<typeof chained.more, 123>>,
] = [true, true, true, true, true]
void extendedTypes
;(async () => {
  const client = Client.create({
    chain: mainnet,
    transport: http('https://ethereum-rpc.publicnode.com'),
  }).extend(publicActions())

  const webSocketClient = Client.create({
    chain: mainnet,
    transport: webSocket('wss://mainnet.gateway.tenderly.co'),
  }).extend(publicActions())

  await client.block.getNumber()
  await webSocketClient.block.getNumber()

  process.exit(0)
})()
