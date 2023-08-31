import { http, createPublicClient, stringify } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const [blockNumber, block, blockWithNumber, blockSafe, blockWithHash] =
  await Promise.all([
    client.getBlockNumber(),
    client.getBlock(),
    client.getBlock({ blockNumber: 6942069n }),
    client.getBlock({ blockTag: 'safe' }),
    client.getBlock({
      blockHash:
        '0xe9577fb1db37cb137c7a4a70666d2923b1b0a245befe3bf04d3ead3cc261ac0d',
    }),
  ])

export default [
  `Block number: ${blockNumber}`,
  `Block: 
    <details>
      <summary>View</summary>
      <pre><code>${stringify(block, null, 2)}</code></pre>
    </details>
  `,
  `Block at number: ${blockWithNumber.number}:
    <details>
      <summary>View</summary>
      <pre><code>${stringify(blockWithNumber, null, 2)}</code></pre>
    </details>
  `,
  `Block at tag safe: ${blockSafe.number}:
    <details>
      <summary>View</summary>
      <pre><code>${stringify(blockSafe, null, 2)}</code></pre>
    </details>
  `,
  `Block at hash: ${blockWithHash.number}:
    <details>
      <summary>View</summary>
      <pre><code>${stringify(blockWithHash, null, 2)}</code></pre>
    </details>
  `,
]
