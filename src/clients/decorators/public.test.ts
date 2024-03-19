import { describe, expect, test } from 'vitest'

import {
  smartAccountConfig,
  usdcContractConfig,
  wagmiContractConfig,
} from '~test/src/abis.js'
import {
  accounts,
  address,
  forkBlockNumber,
  typedData,
} from '~test/src/constants.js'
import {
  publicClient,
  setBlockNumber,
  testClient,
  walletClient,
} from '~test/src/utils.js'
import { getBlockNumber } from '../../actions/public/getBlockNumber.js'
import { parseEther } from '../../utils/unit/parseEther.js'

import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { base } from '../../chains/index.js'
import { wait } from '../../utils/wait.js'
import { createPublicClient } from '../createPublicClient.js'
import { http } from '../transports/http.js'
import { publicActions } from './public.js'

test('default', async () => {
  expect(publicActions(publicClient)).toMatchInlineSnapshot(`
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
      "getContractEvents": [Function],
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
    const { data } = await publicClient.call({
      data: '0x06fdde03',
      account: accounts[0].address,
      to: wagmiContractConfig.address,
    })
    expect(data).toMatchInlineSnapshot(
      '"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000"',
    )
  })

  test('createBlockFilter', async () => {
    expect(await publicClient.createBlockFilter()).toBeDefined()
  })

  test('createContractEventFilter', async () => {
    expect(
      await publicClient.createContractEventFilter({
        abi: usdcContractConfig.abi,
      }),
    ).toBeDefined()
  })

  test('createEventFilter', async () => {
    expect(await publicClient.createEventFilter()).toBeDefined()
  })

  test('createPendingTransactionFilter', async () => {
    expect(await publicClient.createPendingTransactionFilter()).toBeDefined()
  })

  test('estimateContractGas', async () => {
    expect(
      await publicClient.estimateContractGas({
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69436n],
      }),
    ).toEqual(56584n)
  })

  test('estimateGas', async () => {
    expect(
      await publicClient.estimateGas({
        account: accounts[0].address,
        to: accounts[1].address,
        value: parseEther('1'),
      }),
    ).toEqual(21000n)
  })

  test('getBalance', async () => {
    expect(
      await publicClient.getBalance({ address: accounts[5].address }),
    ).toEqual(10000000000000000000000n)
  })

  test.skip('getBlobBaseFee', async () => {
    expect(await publicClient.getBlobBaseFee()).toBeDefined()
  })

  test('getBlock', async () => {
    expect(
      await publicClient.getBlock({ blockNumber: forkBlockNumber }),
    ).toBeDefined()
  })

  test('getBlockNumber', async () => {
    expect(await publicClient.getBlockNumber()).toBeDefined()
  })

  test('getBlockTransactionCount', async () => {
    expect(await publicClient.getBlockTransactionCount()).toBeDefined()
  })

  test('getBytecode', async () => {
    expect(
      await publicClient.getBytecode({ address: wagmiContractConfig.address }),
    ).toBeDefined()
  })

  test('getChainId', async () => {
    expect(await publicClient.getChainId()).toBeDefined()
  })

  test('getContractEvents', async () => {
    expect(
      await publicClient.getContractEvents({ abi: wagmiContractConfig.abi }),
    ).toBeDefined()
  })

  test(
    'getEnsAddress',
    async () => {
      const blockNumber = await getBlockNumber(publicClient)
      await setBlockNumber(19_258_213n)
      expect(
        await publicClient.getEnsAddress({ name: 'jxom.eth' }),
      ).toBeDefined()
      await setBlockNumber(blockNumber)
    },
    { timeout: 20_000 },
  )

  test(
    'getEnsAvatar',
    async () => {
      const blockNumber = await getBlockNumber(publicClient)
      await setBlockNumber(19_258_213n)
      expect(
        await publicClient.getEnsAvatar({ name: 'jxom.eth' }),
      ).toBeDefined()
      await setBlockNumber(blockNumber)
    },
    { timeout: 20_000 },
  )

  test(
    'getEnsName',
    async () => {
      const blockNumber = await getBlockNumber(publicClient)
      await setBlockNumber(19_258_213n)
      expect(
        await publicClient.getEnsName({ address: address.vitalik }),
      ).toBeDefined()
      await setBlockNumber(blockNumber)
    },
    { timeout: 20_000 },
  )

  test(
    'getEnsResolver',
    async () => {
      const blockNumber = await getBlockNumber(publicClient)
      await setBlockNumber(19_258_213n)
      expect(
        await publicClient.getEnsResolver({ name: 'jxom.eth' }),
      ).toBeDefined()
      await setBlockNumber(blockNumber)
    },
    { timeout: 20_000 },
  )

  test(
    'getEnsText',
    async () => {
      const blockNumber = await getBlockNumber(publicClient)
      await setBlockNumber(19_258_213n)
      expect(
        await publicClient.getEnsText({ name: 'jxom.eth', key: 'com.twitter' }),
      ).toBeDefined()
      await setBlockNumber(blockNumber)
    },
    { timeout: 20_000 },
  )

  test('getFeeHistory', async () => {
    expect(
      await publicClient.getFeeHistory({
        blockCount: 4,
        blockNumber: forkBlockNumber,
        rewardPercentiles: [0, 50, 100],
      }),
    ).toBeDefined()
  })

  test('estimateFeesPerGas', async () => {
    expect(await publicClient.estimateFeesPerGas()).toBeDefined()
  })

  test('getFilterChanges', async () => {
    const filter = await publicClient.createPendingTransactionFilter()
    expect(
      await publicClient.getFilterChanges({
        filter,
      }),
    ).toBeDefined()
  })

  test('getFilterLogs', async () => {
    const filter = await publicClient.createEventFilter()
    expect(
      await publicClient.getFilterLogs({
        filter,
      }),
    ).toBeDefined()
  })

  test('getGasPrice', async () => {
    expect(await publicClient.getGasPrice()).toBeDefined()
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
    expect(await publicClient.getLogs()).toBeDefined()
  })

  test('estimateMaxPriorityFeePerGas', async () => {
    expect(await publicClient.estimateMaxPriorityFeePerGas()).toBeDefined()
  })

  test('getStorageAt', async () => {
    expect(
      await publicClient.getStorageAt({
        address: wagmiContractConfig.address,
        slot: '0x0',
      }),
    ).toBeDefined()
  })

  test('getTransaction', async () => {
    expect(
      await publicClient.getTransaction({
        blockNumber: 15131999n,
        index: 69,
      }),
    ).toBeDefined()
  })

  test('getTransactionConfirmations', async () => {
    const hash = await walletClient.sendTransaction({
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
    await testClient.mine({ blocks: 1 })
    const transactionReceipt = await publicClient.getTransactionReceipt({
      hash,
    })
    expect(
      await publicClient.getTransactionConfirmations({
        transactionReceipt,
      }),
    ).toBe(1n)
  })

  test('getTransactionCount', async () => {
    expect(
      await publicClient.getTransactionCount({
        address: accounts[0].address,
      }),
    ).toBeDefined()
  })

  test('getTransactionReceipt', async () => {
    expect(
      await publicClient.getTransactionReceipt({
        hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b',
      }),
    ).toBeDefined()
  })

  test('multicall', async () => {
    expect(
      await publicClient.multicall({
        blockNumber: forkBlockNumber,
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
      await publicClient.prepareTransactionRequest({
        account: accounts[6].address,
        to: accounts[7].address,
        value: parseEther('1'),
      }),
    ).toBeDefined()
  })

  test('sendRawTransaction', async () => {
    const request = await publicClient.prepareTransactionRequest({
      account: privateKeyToAccount(accounts[0].privateKey),
      to: accounts[1].address,
      value: parseEther('1'),
    })
    const serializedTransaction = await walletClient.signTransaction(request)
    expect(
      await publicClient.sendRawTransaction({
        serializedTransaction,
      }),
    ).toBeDefined()
  })

  test('readContract', async () => {
    expect(
      await publicClient.readContract({
        ...wagmiContractConfig,
        functionName: 'balanceOf',
        args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
      }),
    ).toBeDefined()
  })

  test('simulateContract', async () => {
    expect(
      await publicClient.simulateContract({
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69435n],
      }),
    ).toBeDefined()
  })

  test('verifyMessage', async () => {
    expect(
      await publicClient.verifyMessage({
        address: smartAccountConfig.address,
        message: 'This is a test message for viem!',
        signature:
          '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      }),
    ).toBe(true)
  })

  test('verifyTypedData', async () => {
    expect(
      await publicClient.verifyTypedData({
        ...typedData.basic,
        primaryType: 'Mail',
        address: smartAccountConfig.address,
        signature:
          '0x79d756d805073dc97b7bc885b0d56ddf319a2599530fe1e178c2a7de5be88980068d24f20a79b318ea0a84d33ae06f93db77e4235e5d9eeb8b1d7a63922ada3e1c',
      }),
    ).toBe(true)
  })

  test('uninstallFilter', async () => {
    const filter = await publicClient.createPendingTransactionFilter()
    expect(await publicClient.uninstallFilter({ filter })).toBeDefined()
  })

  test('waitForTransactionReceipt', async () => {
    const hash = await walletClient.sendTransaction({
      account: accounts[6].address,
      to: accounts[7].address,
      value: parseEther('1'),
    })
    await testClient.mine({ blocks: 1 })
    await wait(200)
    const { status } = await publicClient.waitForTransactionReceipt({
      hash,
    })
    expect(status).toBe('success')
  })

  test('watchBlockNumber', async () => {
    const unwatch = publicClient.watchBlockNumber({
      onBlockNumber: () => {},
    })
    expect(unwatch).toBeDefined()
  })

  test('watchBlocks', async () => {
    const unwatch = publicClient.watchBlocks({
      onBlock: () => {},
    })
    expect(unwatch).toBeDefined()
  })

  test('watchContractEvent', async () => {
    const unwatch = publicClient.watchContractEvent({
      abi: wagmiContractConfig.abi,
      onLogs: () => {},
    })
    expect(unwatch).toBeDefined()
  })

  test('watchEvent', async () => {
    const unwatch = publicClient.watchEvent({
      onLogs: () => {},
    })
    expect(unwatch).toBeDefined()
  })

  test('watchPendingTransactions', async () => {
    const unwatch = publicClient.watchPendingTransactions({
      onTransactions: () => {},
    })
    expect(unwatch).toBeDefined()
  })
})
