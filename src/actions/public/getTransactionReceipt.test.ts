import { assertType, describe, expect, it, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { holesky, zksync } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import type { ZksyncTransactionReceipt } from '../../zksync/types/transaction.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { createClient } from '../../index.js'
import { wait } from '../../utils/wait.js'
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
      "blockHash": "0xa93b995575bda48d4cf45a4f72593a48a744786b5e32e5ff92a21372f7a60875",
      "blockNumber": 19868019n,
      "contractAddress": null,
      "cumulativeGasUsed": 86221n,
      "effectiveGasPrice": 9036579667n,
      "from": "0xae2fc483527b8ef99eb5d9b44875f005ba1fae13",
      "gasUsed": 86221n,
      "logs": [
        {
          "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          "blockHash": "0xa93b995575bda48d4cf45a4f72593a48a744786b5e32e5ff92a21372f7a60875",
          "blockNumber": 19868019n,
          "data": "0x000000000000000000000000000000000000000000000008994d2b6873000000",
          "logIndex": 0,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000006b75d8af000000e20b7a7ddf000ba900b4009a80",
            "0x0000000000000000000000005ced44f03ff443bbe14d8ea23bc24425fb89e3ed",
          ],
          "transactionHash": "0x985ca9ceaecc90bded8a892e45e2127eab09746cd7dffee057fba12ee066e161",
          "transactionIndex": 0,
        },
        {
          "address": "0x594daad7d77592a2b97b725a7ad59d7e188b5bfa",
          "blockHash": "0xa93b995575bda48d4cf45a4f72593a48a744786b5e32e5ff92a21372f7a60875",
          "blockNumber": 19868019n,
          "data": "0x0000000000000000000000000000000000000000015c7fc50000000000000000",
          "logIndex": 1,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000005ced44f03ff443bbe14d8ea23bc24425fb89e3ed",
            "0x0000000000000000000000006b75d8af000000e20b7a7ddf000ba900b4009a80",
          ],
          "transactionHash": "0x985ca9ceaecc90bded8a892e45e2127eab09746cd7dffee057fba12ee066e161",
          "transactionIndex": 0,
        },
        {
          "address": "0x5ced44f03ff443bbe14d8ea23bc24425fb89e3ed",
          "blockHash": "0xa93b995575bda48d4cf45a4f72593a48a744786b5e32e5ff92a21372f7a60875",
          "blockNumber": 19868019n,
          "data": "0x000000000000000000000000000000000000000005ff6ad38106c3459dba67a900000000000000000000000000000000000000000000002e5eb2e56308fd8231",
          "logIndex": 2,
          "removed": false,
          "topics": [
            "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1",
          ],
          "transactionHash": "0x985ca9ceaecc90bded8a892e45e2127eab09746cd7dffee057fba12ee066e161",
          "transactionIndex": 0,
        },
        {
          "address": "0x5ced44f03ff443bbe14d8ea23bc24425fb89e3ed",
          "blockHash": "0xa93b995575bda48d4cf45a4f72593a48a744786b5e32e5ff92a21372f7a60875",
          "blockNumber": 19868019n,
          "data": "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008994d2b68730000000000000000000000000000000000000000000000015c7fc500000000000000000000000000000000000000000000000000000000000000000000000000000000",
          "logIndex": 3,
          "removed": false,
          "topics": [
            "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
            "0x0000000000000000000000006b75d8af000000e20b7a7ddf000ba900b4009a80",
            "0x0000000000000000000000006b75d8af000000e20b7a7ddf000ba900b4009a80",
          ],
          "transactionHash": "0x985ca9ceaecc90bded8a892e45e2127eab09746cd7dffee057fba12ee066e161",
          "transactionIndex": 0,
        },
      ],
      "logsBloom": "0x00200000000000000800000080000000000000000000000000000000000000000000008000000020000000000000000002000000088000000000000000020000000000000000000000000008000000200000000000000000000000000000000000000000000000000000000000000000000000000000000080000010000000000000000000000000000000000000000400000800000000080000004000000000000000000000000000000000000000000000000000004000000000000800000008000002000000000000040000000000000000000000001000000000000000000000200000000000000000000000000000000000000000000000000000000000",
      "status": "success",
      "to": "0x6b75d8af000000e20b7a7ddf000ba900b4009a80",
      "transactionHash": "0x985ca9ceaecc90bded8a892e45e2127eab09746cd7dffee057fba12ee066e161",
      "transactionIndex": 0,
      "type": "eip1559",
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
    chain: zksync,
    transport: http(),
  })
  const receipt = await getTransactionReceipt(client, {
    hash: '0x835ac2ecd4e2b6e3e8dae1804f8f33d3c307b657bc90563bd9f4b4b3e4d49a29',
  })

  assertType<ZksyncTransactionReceipt>(receipt)
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
          "blockTimestamp": "0x652ec6f8",
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
          "blockTimestamp": "0x652ec6f8",
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
          "blockTimestamp": "0x652ec6f8",
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
          "blockTimestamp": "0x652ec6f8",
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
          "blockTimestamp": "0x652ec6f8",
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
          "blockTimestamp": "0x652ec6f8",
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
          "blockTimestamp": "0x652ec6f8",
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
          "blockTimestamp": "0x652ec6f8",
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
          "blockTimestamp": "0x652ec6f8",
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
          "blockTimestamp": "0x652ec6f8",
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
          "blockTimestamp": "0x652ec6f8",
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
      "logsBloom": "0x10880004000400000000000000000000000040000000020000000000000400120000000000100000000080000001000000000000000000000000000000804000004000101002040000000008000000200000000000000000001000000000080000840000020000000000100000000800000000020100000000000010000000000000000400000000000004000040000000000000280000000000002000000000000000004000120000000200000000000000000000000000000000200000800000001002008008000000000000000000000000200000800000000000000020001800000000000000000000001000000000000000000000000000000000000000",
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
