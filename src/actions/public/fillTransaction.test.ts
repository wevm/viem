import { expect, test } from 'vitest'
import { Delegation } from '../../../contracts/generated.js'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { deploy } from '../../../test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { encodeFunctionData, nonceManager } from '../../utils/index.js'
import { signAuthorization } from '../wallet/signAuthorization.js'
import { fillTransaction } from './fillTransaction.js'

const client = anvilMainnet.getClient({ account: true })

test('default', async () => {
  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "raw": "0x02f0018203b9843b9aca00849c18478a8252a89400000000000000000000000000000000000000008084deadbeefc0808080",
      "transaction": {
        "accessList": [],
        "chainId": 1,
        "data": "0xdeadbeef",
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "gas": 21160n,
        "gasPrice": 3142604248n,
        "hash": "0xe9612dfada2688d94ed86c7cb20d85d31880a5f7affe51f2bb08fd6641be74a1",
        "input": "0xdeadbeef",
        "maxFeePerGas": 3142604248n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x0000000000000000000000000000000000000000",
        "type": "eip1559",
        "typeHex": "0x2",
        "value": 0n,
      },
    }
  `)
})

test.skip('args: authorizationList', async () => {
  const eoa = privateKeyToAccount(accounts[1].privateKey)

  const { contractAddress } = await deploy(client, {
    abi: Delegation.abi,
    bytecode: Delegation.bytecode.object,
  })

  const authorization = await signAuthorization(client, {
    account: eoa,
    contractAddress: contractAddress!,
  })

  expect(
    await fillTransaction(client, {
      authorizationList: [authorization],
    }),
  ).toBeDefined()
})

test('args: gas', async () => {
  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    gas: 50000n,
  })

  expect(result.transaction.gas).toBe(50000n)
})

test('args: gasPrice', async () => {
  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    gasPrice: 20000000000n,
    type: 'legacy',
  })

  expect(result.transaction.gasPrice).toBe(20000000000n)
})

test('args: maxFeePerGas', async () => {
  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    maxFeePerGas: 50000000000n,
  })

  expect(result.transaction.maxFeePerGas).toBe(50000000000n)
})

test('args: maxPriorityFeePerGas', async () => {
  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    maxPriorityFeePerGas: 2000000000n,
    maxFeePerGas: 50000000000n,
  })

  expect(result.transaction.maxPriorityFeePerGas).toBe(2000000000n)
})

test('args: nonce', async () => {
  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    nonce: 1000,
  })

  expect(result.transaction.nonce).toBe(1000)
})

test('behavior: fee multiplier applied when maxFeePerGas not provided', async () => {
  // Get baseline transaction with default multiplier (1.2)
  const baseline = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  // Get transaction with custom multiplier (1.5) and no maxFeePerGas provided
  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    chain: {
      ...anvilMainnet.chain,
      fees: {
        baseFeeMultiplier: 1.5,
      },
    },
  })

  // maxFeePerGas should be multiplied by the custom multiplier
  // Baseline uses multiplier 1.2, custom uses 1.5
  // So custom = baseline * (1.5 / 1.2) = baseline * 1.25
  expect(result.transaction.maxFeePerGas).toBeGreaterThan(
    baseline.transaction.maxFeePerGas!,
  )
  expect(result.transaction.maxFeePerGas).toBe(
    (baseline.transaction.maxFeePerGas! * 15n) / 12n + 1n,
  )
})

test('behavior: fee multiplier not applied when maxFeePerGas provided', async () => {
  const customMaxFeePerGas = 50000000000n

  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    maxFeePerGas: customMaxFeePerGas,
    chain: {
      ...anvilMainnet.chain,
      fees: {
        baseFeeMultiplier: 1.5,
      },
    },
  })

  // maxFeePerGas should be exactly what we provided, not multiplied
  expect(result.transaction.maxFeePerGas).toBe(customMaxFeePerGas)
})

test('behavior: fee multiplier not applied when gasPrice provided', async () => {
  const customGasPrice = 20000000000n

  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    gasPrice: customGasPrice,
    type: 'legacy',
    chain: {
      ...anvilMainnet.chain,
      fees: {
        baseFeeMultiplier: 1.5,
      },
    },
  })

  // gasPrice should be exactly what we provided, not multiplied
  expect(result.transaction.gasPrice).toBe(customGasPrice)
})

test('behavior: fee multiplier function (sync)', async () => {
  // Get baseline transaction with default multiplier (1.2)
  const baseline = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  // Get transaction with custom multiplier function (1.5) and no maxFeePerGas provided
  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    chain: {
      ...anvilMainnet.chain,
      fees: {
        baseFeeMultiplier() {
          return 1.5
        },
      },
    } as typeof anvilMainnet.chain,
  })

  // maxFeePerGas should be multiplied by the custom multiplier function result
  // Baseline uses multiplier 1.2, custom uses 1.5
  // So custom = baseline * (1.5 / 1.2) = baseline * 1.25
  expect(result.transaction.maxFeePerGas).toBeGreaterThan(
    baseline.transaction.maxFeePerGas!,
  )
  expect(result.transaction.maxFeePerGas).toBe(
    (baseline.transaction.maxFeePerGas! * 15n) / 12n + 1n,
  )
})

test('behavior: fee multiplier function (async)', async () => {
  // Get baseline transaction with default multiplier (1.2)
  const baseline = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  // Get transaction with custom async multiplier function (1.5) and no maxFeePerGas provided
  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    chain: {
      ...anvilMainnet.chain,
      fees: {
        async baseFeeMultiplier() {
          return 1.5
        },
      },
    } as typeof anvilMainnet.chain,
  })

  // maxFeePerGas should be multiplied by the custom multiplier function result
  // Baseline uses multiplier 1.2, custom uses 1.5
  // So custom = baseline * (1.5 / 1.2) = baseline * 1.25
  expect(result.transaction.maxFeePerGas).toBeGreaterThan(
    baseline.transaction.maxFeePerGas!,
  )
  expect(result.transaction.maxFeePerGas).toBe(
    (baseline.transaction.maxFeePerGas! * 15n) / 12n + 1n,
  )
})

test('behavior: error when fee multiplier less than 1', async () => {
  await expect(
    fillTransaction(client, {
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
      chain: {
        ...anvilMainnet.chain,
        fees: {
          baseFeeMultiplier: 0.8,
        },
      },
    }),
  ).rejects.toThrow('`baseFeeMultiplier` must be greater than 1.')
})

test('behavior: nonceManager', async () => {
  const alice = privateKeyToAccount(accounts[5].privateKey)
  const bob = privateKeyToAccount(accounts[6].privateKey)

  const [result_1, result_2, result_3, result_4, result_5] = await Promise.all([
    fillTransaction(client, {
      account: alice,
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
      nonceManager,
    }),
    fillTransaction(client, {
      account: bob,
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
      nonceManager,
    }),
    fillTransaction(client, {
      account: alice,
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
      nonceManager,
    }),
    fillTransaction(client, {
      account: alice,
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
      nonceManager,
    }),
    fillTransaction(client, {
      account: bob,
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
      nonceManager,
    }),
  ])

  // Each account should have sequential nonces
  expect(result_1.transaction.nonce).toBeDefined()
  expect(result_2.transaction.nonce).toBeDefined()
  expect(result_3.transaction.nonce).toBe(result_1.transaction.nonce + 1)
  expect(result_4.transaction.nonce).toBe(result_1.transaction.nonce + 2)
  expect(result_5.transaction.nonce).toBe(result_2.transaction.nonce + 1)

  const result_6 = await fillTransaction(client, {
    account: alice,
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    nonceManager,
  })
  const result_7 = await fillTransaction(client, {
    account: alice,
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    nonceManager,
  })

  expect(result_6.transaction.nonce).toBe(result_1.transaction.nonce + 3)
  expect(result_7.transaction.nonce).toBe(result_1.transaction.nonce + 4)
})

test('behavior: nonceManager not used when no account', async () => {
  // When no account is provided, nonceManager should not be used
  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    nonceManager,
  })

  // Should use the node's nonce, not nonceManager
  expect(result.transaction.nonce).toBeDefined()
})

test('behavior: nonceManager not used when explicit nonce provided', async () => {
  const alice = privateKeyToAccount(accounts[7].privateKey)

  const explicitNonce = 999

  const result = await fillTransaction(client, {
    account: alice,
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    nonce: explicitNonce,
    nonceManager,
  })

  // Should use the explicit nonce, not nonceManager
  expect(result.transaction.nonce).toBe(explicitNonce)
})

test('error: revert', async () => {
  await expect(
    fillTransaction(client, {
      account: accounts[0].address,
      data: encodeFunctionData({
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        args: [420n],
      }),
      to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [TransactionExecutionError: Execution reverted with reason: Token ID is taken.

    Request Arguments:
      chain:  Ethereum (Local) (id: 1)
      to:     0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      data:   0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4

    Details: execution reverted: Token ID is taken
    Version: viem@x.y.z]
  `,
  )
})
