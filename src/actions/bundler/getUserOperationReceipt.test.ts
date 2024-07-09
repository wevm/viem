import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../test/src/bundler.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../test/src/smartAccounts.js'
import { mine } from '../../actions/index.js'
import { parseEther, parseGwei, stringify } from '../../utils/index.js'
import { getUserOperationReceipt } from './getUserOperationReceipt.js'
import { sendUserOperation } from './sendUserOperation.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient()

const fees = {
  maxFeePerGas: parseGwei('7'),
  maxPriorityFeePerGas: parseGwei('1'),
} as const

describe('entryPointVersion: 0.7', async () => {
  const [account] = await getSmartAccounts_07()

  test('default', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    await bundlerClient.request<any>({
      method: 'debug_bundler_sendBundleNow',
      params: [],
    })
    await mine(client, {
      blocks: 1,
    })

    const receipt = await getUserOperationReceipt(bundlerClient, {
      hash,
    })

    expect(
      JSON.parse(
        stringify(receipt, (key, value) => {
          if (key === 'blockHash') return '...'
          return value
        }),
      ),
    ).toMatchInlineSnapshot(
      `
      {
        "actualGasCost": "1179837663474897",
        "actualGasUsed": "235413",
        "entryPoint": "0x0000000071727de22e5e9d8baf0edac6f37da032",
        "logs": [
          {
            "address": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
            "blockHash": "...",
            "blockNumber": "19868027",
            "data": "0x",
            "logIndex": 0,
            "topics": [
              "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            ],
            "transactionHash": "0x8a36eb2a67af057ee1b162f7c5e1acaaf1f11bd8c993d8142fd043ab7ecb59ae",
            "transactionIndex": 0,
          },
          {
            "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
            "blockHash": "...",
            "blockNumber": "19868027",
            "data": "0x000000000000000000000000fb6dab6200b8958c2655c3747708f82243d3f32e0000000000000000000000000000000000000000000000000000000000000000",
            "logIndex": 1,
            "topics": [
              "0xd51a9c61267aa6196961883ecf5ff2da6619c37dac0fa92122513fb32c032d2d",
              "0x5ab163e9b2f30549274c7c567ca0696edf9ef1aa476d9784d22974468fdb24d8",
              "0x000000000000000000000000e911628bf8428c23f179a07b081325cae376de1f",
            ],
            "transactionHash": "0x8a36eb2a67af057ee1b162f7c5e1acaaf1f11bd8c993d8142fd043ab7ecb59ae",
            "transactionIndex": 0,
          },
          {
            "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
            "blockHash": "...",
            "blockNumber": "19868027",
            "data": "0x0000000000000000000000000000000000000000000000000009b7e62c0ff400",
            "logIndex": 2,
            "topics": [
              "0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4",
              "0x000000000000000000000000e911628bf8428c23f179a07b081325cae376de1f",
            ],
            "transactionHash": "0x8a36eb2a67af057ee1b162f7c5e1acaaf1f11bd8c993d8142fd043ab7ecb59ae",
            "transactionIndex": 0,
          },
          {
            "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
            "blockHash": "...",
            "blockNumber": "19868027",
            "data": "0x",
            "logIndex": 3,
            "topics": [
              "0xbb47ee3e183a558b1a2ff0874b079f3fc5478b7454eacf2bfc5af2ff5878f972",
            ],
            "transactionHash": "0x8a36eb2a67af057ee1b162f7c5e1acaaf1f11bd8c993d8142fd043ab7ecb59ae",
            "transactionIndex": 0,
          },
        ],
        "nonce": "0x0",
        "receipt": {
          "blockHash": "...",
          "blockNumber": "19868027",
          "contractAddress": null,
          "cumulativeGasUsed": "222361",
          "effectiveGasPrice": "5011777869",
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "gasUsed": "222361",
          "logs": [
            {
              "address": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
              "blockHash": "...",
              "blockNumber": "19868027",
              "data": "0x",
              "logIndex": 0,
              "topics": [
                "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              ],
              "transactionHash": "0x8a36eb2a67af057ee1b162f7c5e1acaaf1f11bd8c993d8142fd043ab7ecb59ae",
              "transactionIndex": 0,
            },
            {
              "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
              "blockHash": "...",
              "blockNumber": "19868027",
              "data": "0x000000000000000000000000fb6dab6200b8958c2655c3747708f82243d3f32e0000000000000000000000000000000000000000000000000000000000000000",
              "logIndex": 1,
              "topics": [
                "0xd51a9c61267aa6196961883ecf5ff2da6619c37dac0fa92122513fb32c032d2d",
                "0x5ab163e9b2f30549274c7c567ca0696edf9ef1aa476d9784d22974468fdb24d8",
                "0x000000000000000000000000e911628bf8428c23f179a07b081325cae376de1f",
              ],
              "transactionHash": "0x8a36eb2a67af057ee1b162f7c5e1acaaf1f11bd8c993d8142fd043ab7ecb59ae",
              "transactionIndex": 0,
            },
            {
              "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
              "blockHash": "...",
              "blockNumber": "19868027",
              "data": "0x0000000000000000000000000000000000000000000000000009b7e62c0ff400",
              "logIndex": 2,
              "topics": [
                "0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4",
                "0x000000000000000000000000e911628bf8428c23f179a07b081325cae376de1f",
              ],
              "transactionHash": "0x8a36eb2a67af057ee1b162f7c5e1acaaf1f11bd8c993d8142fd043ab7ecb59ae",
              "transactionIndex": 0,
            },
            {
              "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
              "blockHash": "...",
              "blockNumber": "19868027",
              "data": "0x",
              "logIndex": 3,
              "topics": [
                "0xbb47ee3e183a558b1a2ff0874b079f3fc5478b7454eacf2bfc5af2ff5878f972",
              ],
              "transactionHash": "0x8a36eb2a67af057ee1b162f7c5e1acaaf1f11bd8c993d8142fd043ab7ecb59ae",
              "transactionIndex": 0,
            },
            {
              "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
              "blockHash": "...",
              "blockNumber": "19868027",
              "data": "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000004310e5cd2f4d10000000000000000000000000000000000000000000000000000000000039795",
              "logIndex": 4,
              "topics": [
                "0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f",
                "0x5ab163e9b2f30549274c7c567ca0696edf9ef1aa476d9784d22974468fdb24d8",
                "0x000000000000000000000000e911628bf8428c23f179a07b081325cae376de1f",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
              ],
              "transactionHash": "0x8a36eb2a67af057ee1b162f7c5e1acaaf1f11bd8c993d8142fd043ab7ecb59ae",
              "transactionIndex": 0,
            },
          ],
          "logsBloom": "0x00000400000000000000000000000000000000000000000000800000000200000008000000000000000000010000000000000000000000000000020000000000000000000000000020000000000000000041000000000000000000000000200000040000020800000000000100400800000000000000000000000001000200400000000000000040000000000000000000000200000400000000000000000000000000000000000000400000000100000000000000000000000002000000000000000000000000600001000000000000000000002000000000000000000020000040000000000000000000000000000000000000100000000000000000000008",
          "status": "success",
          "to": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
          "transactionHash": "0x8a36eb2a67af057ee1b162f7c5e1acaaf1f11bd8c993d8142fd043ab7ecb59ae",
          "transactionIndex": 0,
          "type": null,
        },
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "success": true,
        "userOpHash": "0x5ab163e9b2f30549274c7c567ca0696edf9ef1aa476d9784d22974468fdb24d8",
      }
    `,
    )
  })

  test('error: receipt not found', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    await expect(() =>
      getUserOperationReceipt(bundlerClient, {
        hash,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationReceiptNotFoundError: User Operation receipt with hash "0x71188c6207d26b66e5bd03e05b04196b963ad26ec6ce91d234aef3af607cddf7" could not be found. The User Operation may not have been processed yet.

      Version: viem@x.y.z]
    `)
  })
})

describe('entryPointVersion: 0.6', async () => {
  const [account] = await getSmartAccounts_06()

  test('default', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    await bundlerClient.request<any>({
      method: 'debug_bundler_sendBundleNow',
      params: [],
    })
    await mine(client, {
      blocks: 1,
    })

    const receipt = await getUserOperationReceipt(bundlerClient, {
      hash,
    })

    expect(
      JSON.parse(
        stringify(receipt, (key, value) => {
          if (key === 'blockHash') return '...'
          return value
        }),
      ),
    ).toMatchInlineSnapshot(
      `
      {
        "actualGasCost": "1056441756495442",
        "actualGasUsed": "233843",
        "entryPoint": "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
        "logs": [
          {
            "address": "0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce",
            "blockHash": "...",
            "blockNumber": "19868028",
            "data": "0x",
            "logIndex": 0,
            "topics": [
              "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            ],
            "transactionHash": "0x438dc0448f17a78d4c840e5e8930ea4b1766b728be6ca4de557a8c89f92324e3",
            "transactionIndex": 0,
          },
          {
            "address": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
            "blockHash": "...",
            "blockNumber": "19868028",
            "data": "0x000000000000000000000000abebe9a2d62af9a89e86eb208b51321e748640c30000000000000000000000000000000000000000000000000000000000000000",
            "logIndex": 1,
            "topics": [
              "0xd51a9c61267aa6196961883ecf5ff2da6619c37dac0fa92122513fb32c032d2d",
              "0x18ec62f37f468e6987274030c2f9854ecefdd9d3d435a559c453748c38c8b4c1",
              "0x0000000000000000000000006edf7db791fc4d438d4a683e857b2fe1a84947ce",
            ],
            "transactionHash": "0x438dc0448f17a78d4c840e5e8930ea4b1766b728be6ca4de557a8c89f92324e3",
            "transactionIndex": 0,
          },
          {
            "address": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
            "blockHash": "...",
            "blockNumber": "19868028",
            "data": "0x0000000000000000000000000000000000000000000000000009cc9a54322c00",
            "logIndex": 2,
            "topics": [
              "0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4",
              "0x0000000000000000000000006edf7db791fc4d438d4a683e857b2fe1a84947ce",
            ],
            "transactionHash": "0x438dc0448f17a78d4c840e5e8930ea4b1766b728be6ca4de557a8c89f92324e3",
            "transactionIndex": 0,
          },
          {
            "address": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
            "blockHash": "...",
            "blockNumber": "19868028",
            "data": "0x",
            "logIndex": 3,
            "topics": [
              "0xbb47ee3e183a558b1a2ff0874b079f3fc5478b7454eacf2bfc5af2ff5878f972",
            ],
            "transactionHash": "0x438dc0448f17a78d4c840e5e8930ea4b1766b728be6ca4de557a8c89f92324e3",
            "transactionIndex": 0,
          },
        ],
        "nonce": "0x0",
        "receipt": {
          "blockHash": "...",
          "blockNumber": "19868028",
          "contractAddress": null,
          "cumulativeGasUsed": "224927",
          "effectiveGasPrice": "4517739494",
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "gasUsed": "224927",
          "logs": [
            {
              "address": "0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce",
              "blockHash": "...",
              "blockNumber": "19868028",
              "data": "0x",
              "logIndex": 0,
              "topics": [
                "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              ],
              "transactionHash": "0x438dc0448f17a78d4c840e5e8930ea4b1766b728be6ca4de557a8c89f92324e3",
              "transactionIndex": 0,
            },
            {
              "address": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
              "blockHash": "...",
              "blockNumber": "19868028",
              "data": "0x000000000000000000000000abebe9a2d62af9a89e86eb208b51321e748640c30000000000000000000000000000000000000000000000000000000000000000",
              "logIndex": 1,
              "topics": [
                "0xd51a9c61267aa6196961883ecf5ff2da6619c37dac0fa92122513fb32c032d2d",
                "0x18ec62f37f468e6987274030c2f9854ecefdd9d3d435a559c453748c38c8b4c1",
                "0x0000000000000000000000006edf7db791fc4d438d4a683e857b2fe1a84947ce",
              ],
              "transactionHash": "0x438dc0448f17a78d4c840e5e8930ea4b1766b728be6ca4de557a8c89f92324e3",
              "transactionIndex": 0,
            },
            {
              "address": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
              "blockHash": "...",
              "blockNumber": "19868028",
              "data": "0x0000000000000000000000000000000000000000000000000009cc9a54322c00",
              "logIndex": 2,
              "topics": [
                "0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4",
                "0x0000000000000000000000006edf7db791fc4d438d4a683e857b2fe1a84947ce",
              ],
              "transactionHash": "0x438dc0448f17a78d4c840e5e8930ea4b1766b728be6ca4de557a8c89f92324e3",
              "transactionIndex": 0,
            },
            {
              "address": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
              "blockHash": "...",
              "blockNumber": "19868028",
              "data": "0x",
              "logIndex": 3,
              "topics": [
                "0xbb47ee3e183a558b1a2ff0874b079f3fc5478b7454eacf2bfc5af2ff5878f972",
              ],
              "transactionHash": "0x438dc0448f17a78d4c840e5e8930ea4b1766b728be6ca4de557a8c89f92324e3",
              "transactionIndex": 0,
            },
            {
              "address": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
              "blockHash": "...",
              "blockNumber": "19868028",
              "data": "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000003c0d4039f2e520000000000000000000000000000000000000000000000000000000000039173",
              "logIndex": 4,
              "topics": [
                "0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f",
                "0x18ec62f37f468e6987274030c2f9854ecefdd9d3d435a559c453748c38c8b4c1",
                "0x0000000000000000000000006edf7db791fc4d438d4a683e857b2fe1a84947ce",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
              ],
              "transactionHash": "0x438dc0448f17a78d4c840e5e8930ea4b1766b728be6ca4de557a8c89f92324e3",
              "transactionIndex": 0,
            },
          ],
          "logsBloom": "0x010004000010000000000000000000000000000000000000008000000000000000080000000000000002000100000000001000000000000000000200000000000000001000000000000000000000000000010000000000000000000000002004000000800a0000000000000100000800000000000000000000000000100200400000000000000000000000000000000000000200000400000040000000000000000000000000000000400000000000000000000000000000000002000004000000000000000000200001000000000000000200002000000000000000000020000040000000000000000000000000000000000000000000000000000000000000",
          "status": "success",
          "to": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
          "transactionHash": "0x438dc0448f17a78d4c840e5e8930ea4b1766b728be6ca4de557a8c89f92324e3",
          "transactionIndex": 0,
          "type": null,
        },
        "sender": "0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce",
        "success": true,
        "userOpHash": "0x18ec62f37f468e6987274030c2f9854ecefdd9d3d435a559c453748c38c8b4c1",
      }
    `,
    )
  })
})
