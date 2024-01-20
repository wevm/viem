import { describe, expect, test, vi } from 'vitest'

import { Payable } from '~test/contracts/generated.js'
import { wagmiContractConfig } from '~test/src/abis.js'
import { accounts, localHttpUrl } from '~test/src/constants.js'
import {
  anvilChain,
  deployPayable,
  publicClient,
  testClient,
  walletClient,
  walletClientWithAccount,
} from '~test/src/utils.js'
import { optimism } from '../../chains/index.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import { getTransaction } from '../public/getTransaction.js'
import { simulateContract } from '../public/simulateContract.js'
import { mine } from '../test/mine.js'

import { writeContract } from './writeContract.js'

test('default', async () => {
  expect(
    await writeContract(walletClient, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('inferred account', async () => {
  expect(
    await writeContract(walletClientWithAccount, {
      ...wagmiContractConfig,
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('client chain mismatch', async () => {
  const walletClient = createWalletClient({
    chain: optimism,
    transport: http(localHttpUrl),
  })
  await expect(() =>
    writeContract(walletClient, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – OP Mainnet).

    Current Chain ID:  1
    Expected Chain ID: 10 – OP Mainnet
     
    Request Arguments:
      from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      data:  0x1249c58b

    Version: viem@1.0.2]
  `)
})

test('no chain', async () => {
  const walletClient = createWalletClient({
    transport: http(localHttpUrl),
  })
  await expect(() =>
    // @ts-expect-error
    writeContract(walletClient, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: No chain was provided to the request.
    Please provide a chain with the \`chain\` argument on the Action, or by supplying a \`chain\` to WalletClient.

    Request Arguments:
      from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      data:  0x1249c58b

    Version: viem@1.0.2]
  `)
})

describe('args: chain', () => {
  test('default', async () => {
    const walletClient = createWalletClient({
      transport: http(localHttpUrl),
    })

    expect(
      await writeContract(walletClient, {
        ...wagmiContractConfig,
        account: accounts[0].address,
        functionName: 'mint',
        chain: anvilChain,
      }),
    ).toBeDefined()
  })

  test('chain mismatch', async () => {
    await expect(() =>
      writeContract(walletClient, {
        ...wagmiContractConfig,
        account: accounts[0].address,
        functionName: 'mint',
        chain: optimism,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionExecutionError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – OP Mainnet).

      Current Chain ID:  1
      Expected Chain ID: 10 – OP Mainnet
       
      Request Arguments:
        chain:  OP Mainnet (id: 10)
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:   0x1249c58b

      Version: viem@1.0.2]
    `)
  })
})

test('args: dataSuffix', async () => {
  const spy = vi.spyOn(walletClient, 'sendTransaction')
  await writeContract(walletClient, {
    ...wagmiContractConfig,
    account: accounts[0].address,
    functionName: 'mint',
    dataSuffix: '0x12345678',
  })
  expect(spy).toHaveBeenCalledWith({
    account: accounts[0].address,
    data: '0x1249c58b12345678',
    to: wagmiContractConfig.address,
  })
})

test('args: value', async () => {
  const { contractAddress } = await deployPayable()

  const hash_1 = await writeContract(walletClientWithAccount, {
    abi: Payable.abi,
    address: contractAddress!,
    functionName: 'pay',
  })
  const hash_2 = await writeContract(walletClientWithAccount, {
    abi: Payable.abi,
    address: contractAddress!,
    functionName: 'pay',
    value: 1n,
  })

  expect((await getTransaction(publicClient, { hash: hash_1 })).value).toBe(0n)
  expect((await getTransaction(publicClient, { hash: hash_2 })).value).toBe(1n)
})

test('overloaded function', async () => {
  expect(
    await writeContract(walletClient, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
      args: [69420n],
    }),
  ).toBeDefined()
})

test('w/ simulateContract', async () => {
  const { request } = await simulateContract(publicClient, {
    ...wagmiContractConfig,
    account: accounts[0].address,
    functionName: 'mint',
    args: [],
  })
  expect(await writeContract(walletClient, request)).toBeDefined()

  await mine(testClient, { blocks: 1 })

  expect(
    await simulateContract(publicClient, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('w/ simulateContract (overloaded)', async () => {
  const { request } = await simulateContract(publicClient, {
    ...wagmiContractConfig,
    account: accounts[0].address,
    functionName: 'mint',
    args: [69421n],
  })
  expect(await writeContract(walletClient, request)).toBeDefined()

  await mine(testClient, { blocks: 1 })

  await expect(() =>
    simulateContract(publicClient, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
      args: [69421n],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
    Token ID is taken

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint(uint256 tokenId)
      args:          (69421)
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/simulateContract
    Version: viem@1.0.2]
  `)
})

test('w/ simulateContract (args chain mismatch)', async () => {
  const { request } = await simulateContract(publicClient, {
    ...wagmiContractConfig,
    account: accounts[0].address,
    functionName: 'mint',
    args: [],
    chain: optimism,
  })
  await expect(() =>
    writeContract(walletClient, request),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – OP Mainnet).

    Current Chain ID:  1
    Expected Chain ID: 10 – OP Mainnet
     
    Request Arguments:
      chain:  OP Mainnet (id: 10)
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:     0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      data:   0x1249c58b

    Version: viem@1.0.2]
  `)
})

test('w/ simulateContract (client chain mismatch)', async () => {
  const walletClient = createWalletClient({
    chain: optimism,
    transport: http(localHttpUrl),
  })
  const { request } = await simulateContract(publicClient, {
    ...wagmiContractConfig,
    account: accounts[0].address,
    functionName: 'mint',
    args: [],
  })
  await expect(() =>
    writeContract(walletClient, request),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – OP Mainnet).

    Current Chain ID:  1
    Expected Chain ID: 10 – OP Mainnet
     
    Request Arguments:
      from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      data:  0x1249c58b

    Version: viem@1.0.2]
  `)
})
