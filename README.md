src/README.md
// 1. Import modules.
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// 3. Consume an action!
const blockNumber = await client.getBlockNumber();
