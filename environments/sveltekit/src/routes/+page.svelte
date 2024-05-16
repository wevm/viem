<script>
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const promise = getBlockNumber()
async function getBlockNumber() {
  const client = createPublicClient({
    chain: mainnet,
    transport: webSocket(
      'wss://eth-mainnet.g.alchemy.com/v2/4iIl6mDHqX3GFrpzmfj2Soirf3MPoAcH',
    ),
  })

  await client.getBlockNumber()
}
</script>

<div>server: success</div>
<p>
	{#await promise}
		Loading...
	{:then blockNumber}
		client: success
	{:catch error}
		Error: {error.message}.
	{/await}
</p>