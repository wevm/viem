import { assertType, describe, expect, it, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { holesky, zkSync } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { createClient } from '../../index.js'
import { wait } from '../../utils/wait.js'
import type { ZkSyncTransactionReceipt } from '../../zksync/types/transaction.js'
import { getBlock } from './getBlock.js'
import { getTransaction } from './getTransaction.js'
import { getTransactionReceipt } from './getTransactionReceipt.js'

const client = anvilMainnet.getClient()

test('gets transaction receipt', async () => {
  const transaction = await getTransaction(client, {
    blockNumber: anvilMainnet.forkBlockNumber - 1n,
    index: 0,
  })
  const receipt = await getTransactionReceipt(client, {
    hash: transaction.hash,
  })
  assertType<TransactionReceipt>(receipt)
  expect(receipt).toMatchInlineSnapshot(`
    {
      "blockHash": "0x72e938fa6ab225be2ce940db9aea7d670b50b3320b8deaeea1084ab645a1db81",
      "blockNumber": 19808249n,
      "contractAddress": null,
      "cumulativeGasUsed": 21000n,
      "effectiveGasPrice": 12213557505n,
      "from": "0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88",
      "gasUsed": 21000n,
      "logs": [],
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "status": "success",
      "to": "0x1f7366d3f39a8c74b72fdf7b0825f9b6cdf3a23c",
      "transactionHash": "0x886b09ecc2a01291717ca3171135fb4917c5c263bab02b570b04699c20643bc4",
      "transactionIndex": 0,
      "type": "legacy",
    }
  `)
})

test('gets transaction receipt (4844)', async () => {
  const client = createClient({
    chain: holesky,
    transport: http(),
  })
  const receipt = await getTransactionReceipt(client, {
    hash: '0x2ad52593fd11478bc0771a48361250220e93123a772e9f316ad8e87d05abe33a',
  })
  assertType<TransactionReceipt>(receipt)
  expect(receipt).toMatchInlineSnapshot(`
    {
      "blobGasPrice": 18391084153n,
      "blobGasUsed": 262144n,
      "blockHash": "0xea4b9a0d4ddeb927ddca9d1ebbb8b0e623ffc7a8b1b62990ba2d1c4aac1f23b6",
      "blockNumber": 1117041n,
      "contractAddress": null,
      "cumulativeGasUsed": 17555099n,
      "effectiveGasPrice": 1262418454n,
      "from": "0xcb98643b8786950f0461f3b0edf99d88f274574d",
      "gasUsed": 21000n,
      "logs": [],
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "status": "success",
      "to": "0x0000000000000000000000000000000000000000",
      "transactionHash": "0x2ad52593fd11478bc0771a48361250220e93123a772e9f316ad8e87d05abe33a",
      "transactionIndex": 57,
      "type": "eip4844",
    }
  `)
})

test('chain w/ custom block type', async () => {
  const client = createPublicClient({
    chain: zkSync,
    transport: http(),
  })
  const receipt = await getTransactionReceipt(client, {
    hash: '0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29',
  })

  assertType<ZkSyncTransactionReceipt>(receipt)
  expect(receipt).toMatchInlineSnapshot(`
    {
      "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
      "blockNumber": 16628100n,
      "contractAddress": null,
      "cumulativeGasUsed": 0n,
      "effectiveGasPrice": 250000000n,
      "from": "0xe665ced18b0998ede7236da308e311e9261dc984",
      "gasUsed": 445896n,
      "l1BatchNumber": 273767n,
      "l1BatchTxIndex": 177n,
      "l2ToL1Logs": [],
      "logs": [
        {
          "address": "0x000000000000000000000000000000000000800a",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x00000000000000000000000000000000000000000000000000017b3627a0a300",
          "l1BatchNumber": 273767n,
          "logIndex": 0,
          "logType": null,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x000000000000000000000000e665ced18b0998ede7236da308e311e9261dc984",
            "0x0000000000000000000000000000000000000000000000000000000000008001",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 0,
        },
        {
          "address": "0x000000000000000000000000000000000000800a",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x00000000000000000000000000000000000000000000000000013949fc5ebec8",
          "l1BatchNumber": 273767n,
          "logIndex": 1,
          "logType": null,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x000000000000000000000000e665ced18b0998ede7236da308e311e9261dc984",
            "0x00000000000000000000000054de43b6ba21a5553697a2b78338e046dd7e0278",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 1,
        },
        {
          "address": "0x54de43b6ba21a5553697a2b78338e046dd7e0278",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
          "l1BatchNumber": 273767n,
          "logIndex": 2,
          "logType": null,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x000000000000000000000000e665ced18b0998ede7236da308e311e9261dc984",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 2,
        },
        {
          "address": "0x000000000000000000000000000000000000800a",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x0000000000000000000000000000000000000000000000000001228d38402ec8",
          "l1BatchNumber": 273767n,
          "logIndex": 3,
          "logType": null,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x00000000000000000000000054de43b6ba21a5553697a2b78338e046dd7e0278",
            "0x0000000000000000000000009b896c0e23220469c7ae69cb4bbae391eaa4c8da",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 3,
        },
        {
          "address": "0x000000000000000000000000000000000000800a",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x0000000000000000000000000000000000000000000000000001228d38402ec8",
          "l1BatchNumber": 273767n,
          "logIndex": 4,
          "logType": null,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000009b896c0e23220469c7ae69cb4bbae391eaa4c8da",
            "0x000000000000000000000000042b8289c97896529ec2fe49ba1a8b9c956a86cc",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 4,
        },
        {
          "address": "0x9923573104957bf457a3c4df0e21c8b389dd43df",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x0000000000000000000000000000000000000000000000000000e523da9a7ec8",
          "l1BatchNumber": 273767n,
          "logIndex": 5,
          "logType": null,
          "removed": false,
          "topics": [
            "0xdf21c415b78ed2552cc9971249e32a053abce6087a0ae0fbf3f78db5174a3493",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 5,
        },
        {
          "address": "0x042b8289c97896529ec2fe49ba1a8b9c956a86cc",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000002200010000000000000000000000000000000000000000000000000000000000030d40000000000000000000000000000000000000000000000000000000000000",
          "l1BatchNumber": 273767n,
          "logIndex": 6,
          "logType": null,
          "removed": false,
          "topics": [
            "0xb0c632f55f1e1b3b2c3d82f41ee4716bb4c00f0f5d84cdafc141581bb8757a4f",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 6,
        },
        {
          "address": "0xcb7ad38d45ab5bcf5880b0fa851263c29582c18a",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x000000000000000000000000000000000000000000000000000000000000009e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001400000000000000000000000054de43b6ba21a5553697a2b78338e046dd7e027800000000000000000000000000000000000000000000000000003d695da5b000",
          "l1BatchNumber": 273767n,
          "logIndex": 7,
          "logType": null,
          "removed": false,
          "topics": [
            "0x4e41ee13e03cd5e0446487b524fdc48af6acf26c074dacdbdfb6b574b42c8146",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 7,
        },
        {
          "address": "0x042b8289c97896529ec2fe49ba1a8b9c956a86cc",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000d400000000000022d300a554de43b6ba21a5553697a2b78338e046dd7e0278009e921b486cc33580af7d8208df1619383470d5dcbe000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000014e665ced18b0998ede7236da308e311e9261dc984000000000000000000000000000000000000000000000000",
          "l1BatchNumber": 273767n,
          "logIndex": 8,
          "logType": null,
          "removed": false,
          "topics": [
            "0xe9bded5f24a4168e4f3bf44e00298c993b22376aad8c58c7dda9718a54cbea82",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 8,
        },
        {
          "address": "0x54de43b6ba21a5553697a2b78338e046dd7e0278",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000014e665ced18b0998ede7236da308e311e9261dc984000000000000000000000000",
          "l1BatchNumber": 273767n,
          "logIndex": 9,
          "logType": null,
          "removed": false,
          "topics": [
            "0x39a4c66499bcf4b56d79f0dde8ed7a9d4925a0df55825206b2b8531e202be0d0",
            "0x000000000000000000000000000000000000000000000000000000000000009e",
            "0x000000000000000000000000e665ced18b0998ede7236da308e311e9261dc984",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 9,
        },
        {
          "address": "0x000000000000000000000000000000000000800a",
          "blockHash": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
          "blockNumber": 16628100n,
          "data": "0x000000000000000000000000000000000000000000000000000115d39774af00",
          "l1BatchNumber": 273767n,
          "logIndex": 10,
          "logType": null,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000000000000000000000000000000000000000008001",
            "0x000000000000000000000000e665ced18b0998ede7236da308e311e9261dc984",
          ],
          "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
          "transactionIndex": 0,
          "transactionLogIndex": 10,
        },
      ],
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "root": "0xc621ee95e2d4ab65ecf499805dba770b20297c64029816b18c618fc49fe3d748",
      "status": "success",
      "to": "0x54de43b6ba21a5553697a2b78338e046dd7e0278",
      "transactionHash": "0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29",
      "transactionIndex": 0,
      "type": "legacy",
    }
  `)
})

describe('e2e', () => {
  const sourceAccount = accounts[0]
  const targetAccount = accounts[1]

  it('gets transaction receipt', async () => {
    const block = await getBlock(client)

    const maxFeePerGas = block.baseFeePerGas! + parseGwei('10')
    const maxPriorityFeePerGas = parseGwei('10')

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas,
      maxPriorityFeePerGas,
    })

    expect(await getTransaction(client, { hash })).toBeDefined()
    await expect(() =>
      getTransactionReceipt(client, {
        hash,
      }),
    ).rejects.toThrowError('Transaction receipt with hash')
    await mine(client, { blocks: 1 })
    await wait(500)

    const {
      blockHash,
      blockNumber,
      effectiveGasPrice,
      transactionHash,
      ...receipt
    } = await getTransactionReceipt(client, {
      hash,
    })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(effectiveGasPrice).toBeDefined()
    expect(transactionHash).toBeDefined()
    expect(receipt).toMatchInlineSnapshot(`
      {
        "blobGasPrice": 1n,
        "contractAddress": null,
        "cumulativeGasUsed": 21000n,
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "gasUsed": 21000n,
        "logs": [],
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "root": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "status": "success",
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "transactionIndex": 0,
        "type": "eip1559",
      }
    `)
  })
})

test('throws if transaction not found', async () => {
  await expect(
    getTransactionReceipt(client, {
      hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98a',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionReceiptNotFoundError: Transaction receipt with hash "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98a" could not be found. The Transaction may not be processed on a block yet.

    Version: viem@x.y.z]
  `)
})
