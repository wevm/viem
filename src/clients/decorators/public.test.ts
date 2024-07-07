import { describe, expect, test } from 'vitest'

import {
  smartAccountConfig,
  usdcContractConfig,
  wagmiContractConfig,
} from '~test/src/abis.js'
import { accounts, address, typedData } from '~test/src/constants.js'
import { getBlockNumber } from '../../actions/public/getBlockNumber.js'
import { parseEther } from '../../utils/unit/parseEther.js'

import { Mock4337AccountFactory07 } from '~contracts/generated.js'
import { anvilMainnet } from '~test/src/anvil.js'
import { deployMock4337Account_07 } from '~test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { signMessage } from '../../accounts/utils/signMessage.js'
import {
  mine,
  reset,
  sendTransaction,
  signTransaction,
  simulateContract,
  writeContract,
} from '../../actions/index.js'
import { base } from '../../chains/index.js'
import { pad } from '../../utils/index.js'
import { createSiweMessage } from '../../utils/siwe/createSiweMessage.js'
import { wait } from '../../utils/wait.js'
import { createPublicClient } from '../createPublicClient.js'
import { http } from '../transports/http.js'
import { publicActions } from './public.js'

const client = anvilMainnet.getClient().extend(publicActions)

test('default', async () => {
  expect(publicActions(client)).toMatchInlineSnapshot(`
    {
      "call": [Function],
      "createBlockFilter": [Function],
      "createContractEventFilter": [Function],
      "createEventFilter": [Function],
      "createPendingTransactionFilter": [Function],
      "estimateContractGas": [Function],
      "estimateFeesPerGas": [Function],
      "estimateGas": [Function],
      "estimateMaxPriorityFeePerGas": [Function],
      "getBalance": [Function],
      "getBlobBaseFee": [Function],
      "getBlock": [Function],
      "getBlockNumber": [Function],
      "getBlockTransactionCount": [Function],
      "getBytecode": [Function],
      "getChainId": [Function],
      "getCode": [Function],
      "getContractEvents": [Function],
      "getEip712Domain": [Function],
      "getEnsAddress": [Function],
      "getEnsAvatar": [Function],
      "getEnsName": [Function],
      "getEnsResolver": [Function],
      "getEnsText": [Function],
      "getFeeHistory": [Function],
      "getFilterChanges": [Function],
      "getFilterLogs": [Function],
      "getGasPrice": [Function],
      "getLogs": [Function],
      "getProof": [Function],
      "getStorageAt": [Function],
      "getTransaction": [Function],
      "getTransactionConfirmations": [Function],
      "getTransactionCount": [Function],
      "getTransactionReceipt": [Function],
      "multicall": [Function],
      "prepareTransactionRequest": [Function],
      "readContract": [Function],
      "sendRawTransaction": [Function],
      "simulateContract": [Function],
      "uninstallFilter": [Function],
      "verifyMessage": [Function],
      "verifySiweMessage": [Function],
      "verifyTypedData": [Function],
      "waitForTransactionReceipt": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
      "watchContractEvent": [Function],
      "watchEvent": [Function],
      "watchPendingTransactions": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('call', async () => {
    const { data } = await client.call({
      data: '0x06fdde03',
      account: accounts[0].address,
      to: wagmiContractConfig.address,
    })
    expect(data).toMatchInlineSnapshot(
      '"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('createBlockFilter', async () => {
    expect(await client.createBlockFilter()).toBeDefined()
  })

  test('createContractEventFilter', async () => {
    expect(
      await client.createContractEventFilter({
        abi: usdcContractConfig.abi,
      }),
    ).toBeDefined()
  })

  test('createEventFilter', async () => {
    expect(await client.createEventFilter()).toBeDefined()
  })

  test('createPendingTransactionFilter', async () => {
    expect(await client.createPendingTransactionFilter()).toBeDefined()
  })

  test('estimateContractGas', async () => {
    expect(
      await client.estimateContractGas({
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69436n],
      }),
    ).toEqual(56584n)
  })

  test('estimateGas', async () => {
    expect(
      await client.estimateGas({
        account: accounts[0].address,
        to: accounts[1].address,
        value: parseEther('1'),
      }),
    ).toEqual(21000n)
  })

  test('getBalance', async () => {
    expect(await client.getBalance({ address: accounts[5].address })).toEqual(
      10000000000000000000000n,
    )
  })

  test('getBlobBaseFee', async () => {
    expect(await client.getBlobBaseFee()).toBeDefined()
  })

  test('getBlock', async () => {
    expect(
      await client.getBlock({
        blockNumber: anvilMainnet.forkBlockNumber,
      }),
    ).toBeDefined()
  })

  test('getBlockNumber', async () => {
    expect(await client.getBlockNumber()).toBeDefined()
  })

  test('getBlockTransactionCount', async () => {
    expect(await client.getBlockTransactionCount()).toBeDefined()
  })

  test('getCode', async () => {
    expect(
      await client.getCode({ address: wagmiContractConfig.address }),
    ).toBeDefined()
  })

  test('getChainId', async () => {
    expect(await client.getChainId()).toBeDefined()
  })

  test('getContractEvents', async () => {
    expect(
      await client.getContractEvents({ abi: wagmiContractConfig.abi }),
    ).toBeDefined()
  })

  test('getEip712Domain', async () => {
    const { factoryAddress } = await deployMock4337Account_07()

    const { result: address, request } = await simulateContract(client, {
      account: accounts[0].address,
      abi: Mock4337AccountFactory07.abi,
      address: factoryAddress,
      functionName: 'createAccount',
      args: [accounts[0].address, pad('0x0')],
    })
    await writeContract(client, request)
    await mine(client, { blocks: 1 })

    const { domain, ...rest } = await client.getEip712Domain({ address })
    const { verifyingContract, ...restDomain } = domain
    expect(verifyingContract).toBeDefined()
    expect(rest).toMatchInlineSnapshot(`
      {
        "extensions": [],
        "fields": "0x0f",
      }
    `)
    expect(restDomain).toMatchInlineSnapshot(`
      {
        "chainId": 1,
        "name": "Mock4337Account",
        "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "version": "1",
      }
    `)
  })

  test(
    'getEnsAddress',
    async () => {
      const blockNumber = await getBlockNumber(client)
      await reset(client, {
        blockNumber: 19_258_213n,
        jsonRpcUrl: anvilMainnet.forkUrl,
      })
      expect(await client.getEnsAddress({ name: 'jxom.eth' })).toBeDefined()
      await reset(client, {
        blockNumber: blockNumber,
        jsonRpcUrl: anvilMainnet.forkUrl,
      })
    },
    { timeout: 20_000 },
  )

  test(
    'getEnsAvatar',
    async () => {
      const blockNumber = await getBlockNumber(client)
      await reset(client, {
        blockNumber: 19_258_213n,
        jsonRpcUrl: anvilMainnet.forkUrl,
      })
      expect(await client.getEnsAvatar({ name: 'jxom.eth' })).toBeDefined()
      await reset(client, {
        blockNumber: blockNumber,
        jsonRpcUrl: anvilMainnet.forkUrl,
      })
    },
    { timeout: 20_000 },
  )

  test(
    'getEnsName',
    async () => {
      const blockNumber = await getBlockNumber(client)
      await reset(client, {
        blockNumber: 19_258_213n,
        jsonRpcUrl: anvilMainnet.forkUrl,
      })
      expect(
        await client.getEnsName({ address: address.vitalik }),
      ).toBeDefined()
      await reset(client, {
        blockNumber: blockNumber,
        jsonRpcUrl: anvilMainnet.forkUrl,
      })
    },
    { timeout: 20_000 },
  )

  test(
    'getEnsResolver',
    async () => {
      const blockNumber = await getBlockNumber(client)
      await reset(client, {
        blockNumber: 19_258_213n,
        jsonRpcUrl: anvilMainnet.forkUrl,
      })
      expect(await client.getEnsResolver({ name: 'jxom.eth' })).toBeDefined()
      await reset(client, {
        blockNumber: blockNumber,
        jsonRpcUrl: anvilMainnet.forkUrl,
      })
    },
    { timeout: 20_000 },
  )

  test(
    'getEnsText',
    async () => {
      const blockNumber = await getBlockNumber(client)
      await reset(client, {
        blockNumber: 19_258_213n,
        jsonRpcUrl: anvilMainnet.forkUrl,
      })
      expect(
        await client.getEnsText({ name: 'jxom.eth', key: 'com.twitter' }),
      ).toBeDefined()
      await reset(client, {
        blockNumber: blockNumber,
        jsonRpcUrl: anvilMainnet.forkUrl,
      })
    },
    { timeout: 20_000 },
  )

  test('getFeeHistory', async () => {
    expect(
      await client.getFeeHistory({
        blockCount: 4,
        blockNumber: anvilMainnet.forkBlockNumber,
        rewardPercentiles: [0, 50, 100],
      }),
    ).toBeDefined()
  })

  test('estimateFeesPerGas', async () => {
    expect(await client.estimateFeesPerGas()).toBeDefined()
  })

  test('getFilterChanges', async () => {
    const filter = await client.createPendingTransactionFilter()
    expect(
      await client.getFilterChanges({
        filter,
      }),
    ).toBeDefined()
  })

  test('getFilterLogs', async () => {
    const filter = await client.createEventFilter()
    expect(
      await client.getFilterLogs({
        filter,
      }),
    ).toBeDefined()
  })

  test('getGasPrice', async () => {
    expect(await client.getGasPrice()).toBeDefined()
  })

  test('getProof', async () => {
    const client = createPublicClient({
      chain: base,
      transport: http(),
    })

    expect(
      await client.getProof({
        address: '0x4200000000000000000000000000000000000016',
        storageKeys: [
          '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
        ],
      }),
    ).toBeDefined()
  })

  test('getLogs', async () => {
    expect(await client.getLogs()).toBeDefined()
  })

  test('estimateMaxPriorityFeePerGas', async () => {
    expect(await client.estimateMaxPriorityFeePerGas()).toBeDefined()
  })

  test('getStorageAt', async () => {
    expect(
      await client.getStorageAt({
        address: wagmiContractConfig.address,
        slot: '0x0',
      }),
    ).toBeDefined()
  })

  test('getTransaction', async () => {
    expect(
      await client.getTransaction({
        blockNumber: 15131999n,
        index: 69,
      }),
    ).toBeDefined()
  })

  test('getTransactionConfirmations', async () => {
    const hash = await sendTransaction(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
    await mine(client, { blocks: 1 })
    const transactionReceipt = await client.getTransactionReceipt({
      hash,
    })
    expect(
      await client.getTransactionConfirmations({
        transactionReceipt,
      }),
    ).toBe(1n)
  })

  test('getTransactionCount', async () => {
    expect(
      await client.getTransactionCount({
        address: accounts[0].address,
      }),
    ).toBeDefined()
  })

  test('getTransactionReceipt', async () => {
    expect(
      await client.getTransactionReceipt({
        hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b',
      }),
    ).toBeDefined()
  })

  test('multicall', async () => {
    expect(
      await client.multicall({
        blockNumber: anvilMainnet.forkBlockNumber,
        contracts: [
          {
            ...usdcContractConfig,
            functionName: 'totalSupply',
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
        ],
        multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
      }),
    ).toBeDefined()
  })

  test('prepareTransactionRequest', async () => {
    expect(
      await client.prepareTransactionRequest({
        account: accounts[6].address,
        to: accounts[7].address,
        value: parseEther('1'),
      }),
    ).toBeDefined()
  })

  test('sendRawTransaction', async () => {
    const request = await client.prepareTransactionRequest({
      account: privateKeyToAccount(accounts[0].privateKey),
      to: accounts[1].address,
      value: parseEther('1'),
    })
    const serializedTransaction = await signTransaction(client, request)
    expect(
      await client.sendRawTransaction({
        serializedTransaction,
      }),
    ).toBeDefined()
  })

  test('readContract', async () => {
    expect(
      await client.readContract({
        ...wagmiContractConfig,
        functionName: 'balanceOf',
        args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
      }),
    ).toBeDefined()
  })

  test('simulateContract', async () => {
    expect(
      await client.simulateContract({
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69435n],
      }),
    ).toBeDefined()
  })

  test('verifyMessage', async () => {
    expect(
      await client.verifyMessage({
        address: smartAccountConfig.address,
        message: 'This is a test message for viem!',
        signature:
          '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      }),
    ).toBe(true)
  })

  test('verifySiweMessage', async () => {
    const account = accounts[0]
    const message = createSiweMessage({
      address: account.address,
      chainId: 1,
      domain: 'example.com',
      nonce: 'foobarbaz',
      uri: 'https://example.com/path',
      version: '1',
    })
    const signature = await signMessage({
      message,
      privateKey: account.privateKey,
    })

    expect(
      await client.verifySiweMessage({
        message,
        signature,
      }),
    ).toBe(true)
  })

  test('verifyTypedData', async () => {
    expect(
      await client.verifyTypedData({
        ...typedData.basic,
        primaryType: 'Mail',
        address: smartAccountConfig.address,
        signature:
          '0x79d756d805073dc97b7bc885b0d56ddf319a2599530fe1e178c2a7de5be88980068d24f20a79b318ea0a84d33ae06f93db77e4235e5d9eeb8b1d7a63922ada3e1c',
      }),
    ).toBe(true)
  })

  test('uninstallFilter', async () => {
    const filter = await client.createPendingTransactionFilter()
    expect(await client.uninstallFilter({ filter })).toBeDefined()
  })

  test('waitForTransactionReceipt', async () => {
    const hash = await sendTransaction(client, {
      account: accounts[6].address,
      to: accounts[7].address,
      value: parseEther('1'),
    })
    await mine(client, { blocks: 1 })
    await wait(200)
    const { status } = await client.waitForTransactionReceipt({
      hash,
    })
    expect(status).toBe('success')
  })

  test('watchBlockNumber', async () => {
    const unwatch = client.watchBlockNumber({
      onBlockNumber: () => {},
    })
    expect(unwatch).toBeDefined()
  })

  test('watchBlocks', async () => {
    const unwatch = client.watchBlocks({
      onBlock: () => {},
    })
    expect(unwatch).toBeDefined()
  })

  test('watchContractEvent', async () => {
    const unwatch = client.watchContractEvent({
      abi: wagmiContractConfig.abi,
      onLogs: () => {},
    })
    expect(unwatch).toBeDefined()
  })

  test('watchEvent', async () => {
    const unwatch = client.watchEvent({
      onLogs: () => {},
    })
    expect(unwatch).toBeDefined()
  })

  test('watchPendingTransactions', async () => {
    const unwatch = client.watchPendingTransactions({
      onTransactions: () => {},
    })
    expect(unwatch).toBeDefined()
  })
})
