import { expect, test } from 'vitest'
import { getTransactionReceipt } from '../../../actions/index.js'
import { http, createClient } from '../../../index.js'
import { sepolia } from '../../index.js'
import { optimismSepolia } from '../chains.js'
import { getL2Output, getWithdrawalMessages } from '../index.js'
import { buildProveWithdrawal } from './buildProveWithdrawal.js'

const client_opSepolia = createClient({
  chain: optimismSepolia,
  transport: http(),
})
const client_sepolia = createClient({
  chain: sepolia,
  transport: http(),
})

test('default', async () => {
  const receipt = await getTransactionReceipt(client_opSepolia, {
    hash: '0xbbdd0957a82a057a76b5f093de251635ac4ddc6e2d0c4aa7fbf82d73e4e11039',
  })

  const [message] = getWithdrawalMessages(receipt)
  const output = await getL2Output(client_sepolia, {
    l2BlockNumber: receipt.blockNumber,
    targetChain: client_opSepolia.chain,
  })

  const request = await buildProveWithdrawal(client_opSepolia, {
    message,
    output,
  })
  expect(request).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "l2OutputIndex": 43877n,
      "outputRootProof": {
        "latestBlockhash": "0x1428133c8180d573f6f6e1ccba0468b6e743d9c00eee5f925f274ead32f0197c",
        "messagePasserStorageRoot": "0xf77101f9c58eb285afa8aeb5acaf1004411b0c6c787cff61776d5e1b0e1c01da",
        "stateRoot": "0x7ef237cf5ef549b77cc263ed5543aaa07677670b1aceb2cc215139cd052170dc",
        "version": "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
      "withdrawalProof": [
        "0xf90211a01c31c2dadad950ae4f3486dfbb41c4cfd973465a34cca4da9bd89c167fcdcf3aa0cd055ecef27912c265db807ebece3a5d9174cdbf665714daf19c5d3d711ba9c9a0c6b556a9b7c3c88cb2a69e0f0737c53b2902e8bfe561f9e3bd71dd497e6a655da09ddaeeb154bf6a83a6952ce0c419d272c25f971c5aeac74a833bccfdfb23583ba057ec0bddb0e9afab0a5ae722fbe824b5972a6fc311223cdb67dcd4d3d62dfdfea098f6d7fbccef7045aa561cc9ae82e21bb39ecd12738c52993509b13a22f48f86a0597e0de33a4bc4e95a70d2433d2c40a7e6a6e034f827e21eb85f722ecfa6ce69a0f23516779067e4634c342252587b3601a6211b378bf155a8a32f03c9b9cb0b1ea021ec6dd87f927766f36e826935b641302ed36d1830a0e83783b613f3abbb74c2a0ff3fd8cc7739dc25bccc3bbfdcde40e2cee590b1bb9a926aa43cc5c93b4f50cea0662246bcadf4581a4fb0b7f8eb32d597025ebd4488ea30c54f3e58bd74e5fc05a0d6e8d04428d8e7c79ec320553ad287d620312f2b4312b392706f7ff9de22419fa0778e336da404c79a52d8b558beb8e3f7c13f0539c73f6c63fe30ae86f2795136a01bc19b93695d347a22c80258769ccd980c3435fbe01da74b14b9da2672e31f81a00ca3c762a00448feb943dd1e87476cda7ea5fe4b83758750978d12b21de89053a08a744a413bee573896c1573e8795d64a2825304df05a4030909ab29244cd097080",
        "0xf8d1a07c07a884e0779437a19688221f7efcfbe73c0c807960b821ac2345caec175bc3a06835f269b93f9de0d4227c10d7cc46dd78b1a826f4d3e6eed555f2a4fd58bd22a0de3c4e340ca2b8ef66f6dffadc36b8463b43b9b6eed6969a2bb70eaf4ac2c1c680808080808080808080a00f7219d2aabb29ae7f4e3ed07e3a3a81e9c2cda21dc90ee68c48661be50d4629a0ff33a994d497bad05ec9f0a0031f365c3d29afaff118f5c6aea119e72e635882a0e2ec74a1d78014b4a535ead41623ece58208900c855a4bd10892c2b8ab93f08f80",
        "0xe2a0205a060037c8d2c720d49d0b138f733fc197bd2cc2baabd4782859490aeca56201",
      ],
      "withdrawalTransaction": {
        "data": "0x",
        "gasLimit": 21000n,
        "nonce": 1766847064778384329583297500742918515827483896875618958121606201292619876n,
        "sender": "0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6",
        "target": "0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6",
        "value": 69n,
      },
    }
  `)
})
