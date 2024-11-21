import { assertType, describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { BatchCallDelegation } from '../../../contracts/generated.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { deploy } from '../../../test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { celo, holesky } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import { signAuthorization } from '../../experimental/index.js'
import { createClient, encodeFunctionData } from '../../index.js'
import type { Transaction } from '../../types/transaction.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { getBlock } from './getBlock.js'
import { getTransaction } from './getTransaction.js'

const client = anvilMainnet.getClient()

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('gets transaction', async () => {
  const transaction = await getTransaction(client, {
    blockNumber: 15131999n,
    index: 69,
  })
  assertType<Transaction>(transaction)
  expect(transaction).toMatchInlineSnapshot(`
    {
      "accessList": [],
      "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
      "blockNumber": 15131999n,
      "chainId": 1,
      "from": "0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e",
      "gas": 100000n,
      "gasPrice": 11789405161n,
      "hash": "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b",
      "input": "0x23b872dd000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0000000000000000000000000f16e9b0d03470827a95cdfd0cb8a8a3b46969b910000000000000000000000000000000000000000000000000000002b3b6fb3d0",
      "maxFeePerGas": 30309666435n,
      "maxPriorityFeePerGas": 1000000000n,
      "nonce": 513116,
      "r": "0x5e49a7bd0534c6b6d3bbe581659424d3747f920d40ce56e48d26e5d94aac32ca",
      "s": "0x1746abe27b7c4f00bda1ec714ac1f7083e9025b6ca3b2248e439a173e4ab55e0",
      "to": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
      "transactionIndex": 69,
      "type": "eip1559",
      "typeHex": "0x2",
      "v": 1n,
      "value": 0n,
      "yParity": 1,
    }
  `)
})

test('gets transaction (legacy)', async () => {
  const transaction = await getTransaction(client, {
    blockNumber: 15131999n,
    index: 0,
  })
  expect(transaction).toMatchInlineSnapshot(`
    {
      "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
      "blockNumber": 15131999n,
      "chainId": 1,
      "from": "0x47a6b2f389cf4bb6e4b69411c87ae82371daf87e",
      "gas": 200000n,
      "gasPrice": 57000000000n,
      "hash": "0x31a326e4190db96a0c12ef2f2aee6d4566635deb78a3c3497af208b8b7039f22",
      "input": "0xa9059cbb00000000000000000000000001cc0c6c6c57707f89ab0c9a0c22139c501ffba50000000000000000000000000000000000000000000000064cf7d4e7b36a8000",
      "nonce": 3,
      "r": "0x36b5c1f8f70e845a35784b4e18807af88c36fd4958bc71e7dab3b99293531f73",
      "s": "0x5e1a25ed16877580921003749f54d0a14981cd989c293c202a382f43d87b2c47",
      "to": "0x3d382228c54736d831fac2748f4734d9177c7332",
      "transactionIndex": 0,
      "type": "legacy",
      "typeHex": "0x0",
      "v": 37n,
      "value": 0n,
    }
  `)
})

test('gets transaction (eip2930)', async () => {
  const block = await getBlock(client)

  await setBalance(client, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })

  const hash = await sendTransaction(client, {
    accessList: [{ address: targetAccount.address, storageKeys: [] }],
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
    gasPrice: BigInt((block.baseFeePerGas ?? 0n) * 2n),
  })

  const transaction = await getTransaction(client, {
    hash,
  })
  expect(Object.keys(transaction)).toMatchInlineSnapshot(`
    [
      "type",
      "chainId",
      "nonce",
      "gasPrice",
      "gas",
      "to",
      "value",
      "accessList",
      "input",
      "r",
      "s",
      "yParity",
      "v",
      "hash",
      "blockHash",
      "blockNumber",
      "transactionIndex",
      "from",
      "typeHex",
    ]
  `)
  expect(transaction.type).toMatchInlineSnapshot('"eip2930"')
  expect(transaction.from).toMatchInlineSnapshot(
    `"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"`,
  )
  expect(transaction.gas).toBeDefined()
  expect(transaction.to).toMatchInlineSnapshot(
    `"0x70997970c51812dc3a010c7d01b50e0d17dc79c8"`,
  )
  expect(transaction.value).toMatchInlineSnapshot('1000000000000000000n')
})

test('gets transaction (eip4844)', async () => {
  const client = createClient({
    chain: holesky,
    transport: http(),
  })
  const transaction = await getTransaction(client, {
    hash: '0x2ad52593fd11478bc0771a48361250220e93123a772e9f316ad8e87d05abe33a',
  })
  expect(transaction).toMatchInlineSnapshot(`
    {
      "accessList": [],
      "blobVersionedHashes": [
        "0x012580b7683c14cc7540be305587b0eec4e7ec739094213ca080e2526c9237c4",
        "0x01243c18a024c835cce144b3b6b0eb878b7820c7c7b7d9feff80080d76519c45",
      ],
      "blockHash": "0xea4b9a0d4ddeb927ddca9d1ebbb8b0e623ffc7a8b1b62990ba2d1c4aac1f23b6",
      "blockNumber": 1117041n,
      "chainId": 17000,
      "from": "0xcb98643b8786950f0461f3b0edf99d88f274574d",
      "gas": 21000n,
      "gasPrice": 1262418454n,
      "hash": "0x2ad52593fd11478bc0771a48361250220e93123a772e9f316ad8e87d05abe33a",
      "input": "0x",
      "maxFeePerBlobGas": 30000000000n,
      "maxFeePerGas": 1594475499n,
      "maxPriorityFeePerGas": 369627615n,
      "nonce": 8,
      "r": "0xbab20bc88be122f86584c3150fd351018ba15e0346d2e62ced9851c02a0caaa2",
      "s": "0x6da45371fa04d5a8759ed24f462642fc187a1f1062589f30f0c1bb57f60338f6",
      "to": "0x0000000000000000000000000000000000000000",
      "transactionIndex": 57,
      "type": "eip4844",
      "typeHex": "0x3",
      "v": 1n,
      "value": 0n,
      "yParity": 1,
    }
  `)
})

test('gets transaction (eip7702)', async () => {
  const authority = privateKeyToAccount(accounts[1].privateKey)

  const { contractAddress } = await deploy(client, {
    abi: BatchCallDelegation.abi,
    bytecode: BatchCallDelegation.bytecode.object,
  })

  const authorization = await signAuthorization(client, {
    account: authority,
    contractAddress: contractAddress!,
  })

  const hash = await sendTransaction(client, {
    account: authority,
    authorizationList: [authorization],
    data: encodeFunctionData({
      abi: BatchCallDelegation.abi,
      functionName: 'execute',
      args: [
        [
          {
            to: '0x0000000000000000000000000000000000000000',
            data: '0x',
            value: parseEther('1'),
          },
        ],
      ],
    }),
  })

  await mine(client, { blocks: 1 })

  const transaction = await getTransaction(client, {
    hash,
  })
  expect(transaction).toBeDefined()
})

test('chain w/ custom block type', async () => {
  const client = createPublicClient({
    chain: celo,
    transport: http(),
  })

  const transaction = await getTransaction(client, {
    blockNumber: 16628100n,
    index: 0,
  })

  expect(transaction).toMatchInlineSnapshot(`
    {
      "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
      "blockNumber": 16628100n,
      "chainId": undefined,
      "ethCompatible": false,
      "feeCurrency": null,
      "from": "0x045d685d23e8aa34dc408a66fb408f20dc84d785",
      "gas": 1527520n,
      "gasPrice": 2999683966n,
      "gatewayFee": 0n,
      "gatewayFeeRecipient": null,
      "hash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
      "input": "0x389ec778",
      "nonce": 697201,
      "r": "0xf507fb8fa33ffd05a7f26c980bbb8271aa113affc8f192feba87abe26549bda1",
      "s": "0x7971c7b15ab4475ce6256da0bdf62ca1d1e491be8a03fe7637289f98c166f521",
      "to": "0xb86d682b1b6bf20d8d54f55c48f848b9487dec37",
      "transactionIndex": 0,
      "type": "legacy",
      "typeHex": "0x0",
      "v": 84475n,
      "value": 0n,
    }
  `)
})

describe('args: hash', () => {
  test('gets transaction by hash', async () => {
    const transaction = await getTransaction(client, {
      hash: '0x886df53066105ebe390f3efcb4a523d7178597da84dfaa1bbc524e2b20b5650c',
    })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "blockNumber": 15131999n,
        "chainId": 1,
        "from": "0x0926218bdafe613a4152628d14a762b6718741b9",
        "gas": 70000n,
        "gasPrice": 10939430701n,
        "hash": "0x886df53066105ebe390f3efcb4a523d7178597da84dfaa1bbc524e2b20b5650c",
        "input": "0x23b872dd0000000000000000000000000e7aeefe352dc961aaeeb32eb97fecd8a3f014f80000000000000000000000000926218bdafe613a4152628d14a762b6718741b9000000000000000000000000000000000000000000000000000000003fc6e780",
        "maxFeePerGas": 10939430701n,
        "maxPriorityFeePerGas": 10939430701n,
        "nonce": 4,
        "r": "0xe7dc7a0b7db15dba318fea7ad3dcbbc2170e5d52566c2e2785f7740f3ac1529d",
        "s": "0x1b2687608968ecb67230bbf7944199560fa2b3cffe9cc2b1c024e1c8f86a9e08",
        "to": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "transactionIndex": 98,
        "type": "eip1559",
        "typeHex": "0x2",
        "v": 1n,
        "value": 0n,
        "yParity": 1,
      }
    `)
  })

  test('throws if transaction not found', async () => {
    await expect(
      getTransaction(client, {
        hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionNotFoundError: Transaction with hash "0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d" could not be found.

      Version: viem@x.y.z]
    `)
  })
})

describe('args: blockHash', () => {
  test('blockHash: gets transaction by block hash & index', async () => {
    const transaction = await getTransaction(client, {
      blockHash:
        '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d',
      index: 5,
    })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "blockNumber": 15131999n,
        "chainId": undefined,
        "from": "0xb14f54018284f5964097506219e2fd4c1783ca55",
        "gas": 35859n,
        "gasPrice": 21000000000n,
        "hash": "0x082395f55b04a9ee09fc341ed0c10f0289786057fbb7153584cad85b6abf7737",
        "input": "0xa9059cbb000000000000000000000000a471cffe40390a01e82245db590aff6233cc3f060000000000000000000000000000000000000000000004e8de652b3188049000",
        "nonce": 0,
        "r": "0xb5793da381688e5e52e519044a0faead359109f47493e90a5424d2f7cfc8c448",
        "s": "0x56a18fe5d653f59838ffd9659da41c8f87826a2c26429165adb2284f50a4d5d8",
        "to": "0x554ffc77f4251a9fb3c0e3590a6a205f8d4e067d",
        "transactionIndex": 5,
        "type": "legacy",
        "typeHex": "0x0",
        "v": 28n,
        "value": 0n,
      }
    `)
  }, 10000)

  test('blockHash: throws if transaction not found', async () => {
    const { hash: blockHash } = await getBlock(client, {
      blockNumber: anvilMainnet.forkBlockNumber - 69n,
    })
    if (!blockHash) throw new Error('no block hash found')

    await expect(
      getTransaction(client, {
        blockHash,
        index: 420,
      }),
    ).rejects.toThrowError('Transaction at block hash')
  })
})

describe('args: blockNumber', () => {
  test('gets transaction by block number & index', async () => {
    const transaction = await getTransaction(client, {
      blockNumber: 15131999n,
      index: 5,
    })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "blockNumber": 15131999n,
        "chainId": undefined,
        "from": "0xb14f54018284f5964097506219e2fd4c1783ca55",
        "gas": 35859n,
        "gasPrice": 21000000000n,
        "hash": "0x082395f55b04a9ee09fc341ed0c10f0289786057fbb7153584cad85b6abf7737",
        "input": "0xa9059cbb000000000000000000000000a471cffe40390a01e82245db590aff6233cc3f060000000000000000000000000000000000000000000004e8de652b3188049000",
        "nonce": 0,
        "r": "0xb5793da381688e5e52e519044a0faead359109f47493e90a5424d2f7cfc8c448",
        "s": "0x56a18fe5d653f59838ffd9659da41c8f87826a2c26429165adb2284f50a4d5d8",
        "to": "0x554ffc77f4251a9fb3c0e3590a6a205f8d4e067d",
        "transactionIndex": 5,
        "type": "legacy",
        "typeHex": "0x0",
        "v": 28n,
        "value": 0n,
      }
    `)
  }, 10000)

  test('throws if transaction not found', async () => {
    await expect(
      getTransaction(client, {
        blockNumber: 15131999n,
        index: 420,
      }),
    ).rejects.toThrowError(
      'Transaction at block number "15131999" at index "420" could not be found.',
    )
  })
})

describe('args: blockTag', () => {
  test('gets transaction by block tag & index', async () => {
    await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    })

    await mine(client, { blocks: 1 })
    await wait(200)

    const transaction = await getTransaction(client, {
      blockTag: 'latest',
      index: 0,
    })
    expect(transaction).toBeDefined()
  }, 10000)
})
