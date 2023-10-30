import { http, createPublicClient, stringify } from 'viem'
import { mainnet, optimism, polygonMainnet } from 'viem/chains'

const publicClients = [
  createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  createPublicClient({
    chain: polygonMainnet,
    transport: http(),
  }),
  createPublicClient({
    chain: optimism,
    transport: http(),
  }),
]

export default await Promise.all(
  publicClients.flatMap(async (client) =>
    [
      `<h2>${client.chain?.name}</h2>`,
      `<div>Current Block Number: ${await client.getBlockNumber()}</div>`,
      `<div>Client: <pre><code>${stringify(
        client,
        null,
        2,
      )}</code></pre></div>`,
    ].join('\n'),
  ),
)
