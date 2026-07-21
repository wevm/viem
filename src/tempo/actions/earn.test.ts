import { TokenRole } from 'ox/tempo'
import {
  type Address,
  encodeFunctionData,
  isAddressEqual,
  parseUnits,
} from 'viem'
import {
  getBlockNumber,
  readContract,
  sendTransactionSync,
  simulateContract,
  waitForTransactionReceipt,
  writeContractSync,
} from 'viem/actions'
import { Abis, Actions, EarnShares } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, getClient, setupToken } from '~test/tempo/config.js'
import { deployEarnStack } from '~test/tempo/earn.js'
import * as EarnContracts from '~test/tempo/earnContracts.js'

const account = accounts[0]
const client = getClient({ account })

// Run-once stack shared by the read suites: a fresh asset keeps balances
// deterministic, and one deposit gives the suites a live position.
let stackPromise: ReturnType<typeof deployStackWithPosition> | undefined
function setup() {
  stackPromise ??= deployStackWithPosition()
  return stackPromise
}
async function deployStackWithPosition() {
  const stack = await setupStack()
  await approve({
    amount: parseUnits('100', 6),
    spender: stack.adapter,
    token: stack.asset,
  })
  await writeContractSync(client, {
    abi: Abis.vaultAdapter,
    address: stack.adapter,
    args: [parseUnits('100', 6), account.address, 1n],
    functionName: 'deposit',
  })
  return stack
}

// Fresh stack per write test: writes mutate balances and adapter state.
async function setupStack() {
  const { token: asset } = await setupToken(client)
  return deployEarnStack(client, { asset })
}

// The asset, EarnToken, and venue share token all expose the same `approve`.
async function approve(options: {
  amount: bigint
  spender: Address
  token: Address
}) {
  await writeContractSync(client, {
    abi: Abis.tip20,
    address: options.token,
    args: [options.spender, options.amount],
    functionName: 'approve',
  })
}

// Acquires venue shares straight from the ERC-4626 venue for in-kind entry.
async function acquireVenueShares(
  stack: Awaited<ReturnType<typeof deployEarnStack>>,
  assets: bigint,
) {
  await approve({ amount: assets, spender: stack.venue, token: stack.asset })
  await writeContractSync(client, {
    abi: EarnContracts.simple4626Vault.abi,
    address: stack.venue,
    args: [assets, account.address],
    functionName: 'deposit',
  })
}

describe('deployEarnStack', () => {
  test('default', async () => {
    const stack = await deployEarnStack(client)

    const [engine, shareToken, issuer] = await Promise.all([
      readContract(client, {
        abi: Abis.vaultAdapter,
        address: stack.adapter,
        functionName: 'engine',
      }),
      readContract(client, {
        abi: Abis.vaultAdapter,
        address: stack.adapter,
        functionName: 'shareToken',
      }),
      // The factory wires the adapter as the EarnToken's sole issuer.
      readContract(client, {
        abi: Abis.tip20,
        address: stack.shareToken,
        args: [stack.adapter, TokenRole.serialize('issuer')],
        functionName: 'hasRole',
      }),
    ])

    expect(isAddressEqual(engine, stack.engine)).toBe(true)
    expect(isAddressEqual(shareToken, stack.shareToken)).toBe(true)
    expect(issuer).toBe(true)
  })
})

describe('deposit', () => {
  test('default', async () => {
    const stack = await setupStack()

    const hash = await Actions.earn.deposit(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: EarnShares.minimumOutput(parseUnits('100', 6), 50n),
      vault: stack.adapter,
    })
    const receipt = await waitForTransactionReceipt(client, { hash })

    const { args } = Actions.earn.deposit.extractEvent(receipt.logs, {
      vault: stack.adapter,
    })
    const { caller, receiver, ...eventArgs } = args
    expect(isAddressEqual(caller, account.address)).toBe(true)
    expect(isAddressEqual(receiver, account.address)).toBe(true)
    expect(eventArgs).toMatchInlineSnapshot(`
      {
        "assets": 100000000n,
        "shares": 100000000n,
      }
    `)
  })

  test('behavior: mints to an explicit recipient', async () => {
    const stack = await setupStack()

    const { recipient, shares } = await Actions.earn.depositSync(client, {
      amountIn: parseUnits('50', 6),
      minAmountOut: 1n,
      recipient: accounts[2].address,
      vault: stack.adapter,
    })

    expect(isAddressEqual(recipient, accounts[2].address)).toBe(true)
    const balance = await readContract(client, {
      abi: Abis.tip20,
      address: stack.shareToken,
      args: [accounts[2].address],
      functionName: 'balanceOf',
    })
    expect(balance).toBe(shares)
  })

  test('behavior: calls pairs an exact asset approval with the deposit', () => {
    const asset = `0x${'bb'.repeat(20)}` as const
    const recipient = `0x${'cc'.repeat(20)}` as const
    const vault = `0x${'aa'.repeat(20)}` as const

    const calls = Actions.earn.deposit.calls({
      amountIn: 100_000_000n,
      minAmountOut: 99_500_000n,
      recipient,
      tokenIn: asset,
      vault,
    })

    expect(calls).toHaveLength(2)
    expect(isAddressEqual(calls[0].address, asset)).toBe(true)
    expect(calls[0].functionName).toBe('approve')
    expect(calls[0].args).toEqual([vault, 100_000_000n])
    expect(encodeFunctionData(calls[0] as never).slice(0, 10)).toBe(
      '0x095ea7b3',
    )
    expect(calls[1].address).toBe(vault)
    expect(calls[1].functionName).toBe('deposit')
    expect(calls[1].args).toEqual([100_000_000n, recipient, 99_500_000n])
    expect(encodeFunctionData(calls[1] as never).slice(0, 10)).toBe(
      '0xbc157ac1',
    )
  })

  test('behavior: calls floors a caller-supplied quote', () => {
    const [, call] = Actions.earn.deposit.calls({
      amountIn: 100_000_000n,
      amountOut: 100_000_000n,
      recipient: `0x${'cc'.repeat(20)}`,
      slippageBps: 50,
      tokenIn: `0x${'bb'.repeat(20)}`,
      vault: `0x${'aa'.repeat(20)}`,
    })

    expect(call.args?.[2]).toBe(99_500_000n)
  })

  test('behavior: calls converts a formatted amount with explicit decimals', () => {
    const calls = Actions.earn.deposit.calls({
      amountIn: { decimals: 6, formatted: '100' },
      minAmountOut: 1n,
      recipient: `0x${'cc'.repeat(20)}`,
      tokenIn: `0x${'bb'.repeat(20)}`,
      vault: `0x${'aa'.repeat(20)}`,
    })

    expect(calls[0].args?.[1]).toBe(100_000_000n)
    expect(calls[1].args?.[0]).toBe(100_000_000n)
  })

  test('error: calls requires decimals for a formatted amount', () => {
    expect(() =>
      Actions.earn.deposit.calls({
        amountIn: { formatted: '100' },
        minAmountOut: 1n,
        recipient: `0x${'cc'.repeat(20)}`,
        tokenIn: `0x${'bb'.repeat(20)}`,
        vault: `0x${'aa'.repeat(20)}`,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('behavior: estimates gas and simulates', async () => {
    const stack = await setupStack()
    await approve({
      amount: parseUnits('100', 6),
      spender: stack.adapter,
      token: stack.asset,
    })

    const gas = await Actions.earn.deposit.estimateGas(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    expect(gas).toBeGreaterThan(0n)

    const { result } = await Actions.earn.deposit.simulate(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    expect(result).toBe(parseUnits('100', 6))
  })

  // Batched sends surface reverts opaquely, so named reverts assert through
  // `.simulate`, which decodes contract errors and shares the bound resolution.
  test('error: zero minAmountOut', async () => {
    const stack = await setupStack()

    await expect(
      Actions.earn.deposit.simulate(client, {
        amountIn: 100n,
        minAmountOut: 0n,
        vault: stack.adapter,
      }),
    ).rejects.toThrow('ZeroMinimumShares')
  })

  test('behavior: slippageBps floors a caller-supplied quote', async () => {
    const stack = await setupStack()

    const { shares } = await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      amountOut: parseUnits('100', 6),
      slippageBps: 50,
      vault: stack.adapter,
    })

    expect(shares).toBe(parseUnits('100', 6))
  })

  test('error: minimum shares not met', async () => {
    const stack = await setupStack()
    // Simulation covers the adapter call only, so the pull needs an allowance.
    await approve({
      amount: parseUnits('100', 6),
      spender: stack.adapter,
      token: stack.asset,
    })

    await expect(
      Actions.earn.deposit.simulate(client, {
        amountIn: parseUnits('100', 6),
        minAmountOut: parseUnits('100', 6) + 1n,
        vault: stack.adapter,
      }),
    ).rejects.toThrow('MinimumSharesNotMet')
  })

  test('error: slippageBps bound reverts when donated yield moves the rate', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    // Donated yield raises the venue rate, so a stale 1:1 quote over-asks.
    await stack.donate(parseUnits('50', 6))

    await approve({
      amount: parseUnits('100', 6),
      spender: stack.adapter,
      token: stack.asset,
    })
    await expect(
      Actions.earn.deposit.simulate(client, {
        amountIn: parseUnits('100', 6),
        amountOut: parseUnits('100', 6),
        slippageBps: 50,
        vault: stack.adapter,
      }),
    ).rejects.toThrow('MinimumSharesNotMet')
    // The atomic plain action hits the same revert at gas estimation.
    await expect(
      Actions.earn.deposit(client, {
        amountIn: parseUnits('100', 6),
        amountOut: parseUnits('100', 6),
        slippageBps: 50,
        vault: stack.adapter,
      }),
    ).rejects.toThrow()
  })

  test('error: deposits paused', async () => {
    const stack = await setupStack()
    // Pause through the operator seat; the public pause action lands with the
    // operator family.
    await writeContractSync(client, {
      abi: Abis.vaultAdapter,
      address: stack.adapter,
      args: [true],
      functionName: 'setDepositsPaused',
    })

    await expect(
      Actions.earn.deposit.simulate(client, {
        amountIn: 100n,
        minAmountOut: 1n,
        vault: stack.adapter,
      }),
    ).rejects.toThrow('DepositsPaused')
  })
})

describe('depositSync', () => {
  test('default', async () => {
    const stack = await setupStack()

    const { caller, receipt, recipient, ...result } =
      await Actions.earn.depositSync(client, {
        amountIn: parseUnits('100', 6),
        minAmountOut: EarnShares.minimumOutput(parseUnits('100', 6), 50n),
        vault: stack.adapter,
      })

    expect(receipt.status).toBe('success')
    expect(isAddressEqual(caller, account.address)).toBe(true)
    expect(isAddressEqual(recipient, account.address)).toBe(true)
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "shares": 100000000n,
      }
    `)
    // A foreign emitting address is rejected by the event filter.
    expect(() =>
      Actions.earn.deposit.extractEvent(receipt.logs, { vault: stack.engine }),
    ).toThrowErrorMatchingInlineSnapshot(
      '[Error: `Deposited` event not found.]',
    )
  })

  test('behavior: formatted amount resolves decimals from a live asset read', async () => {
    const stack = await setupStack()

    const { amount } = await Actions.earn.depositSync(client, {
      amountIn: { formatted: '25' },
      minAmountOut: 1n,
      vault: stack.adapter,
    })

    expect(amount).toBe(parseUnits('25', 6))
  })
})

describe('depositShares', () => {
  test('default', async () => {
    // In-kind entry: a venue shareholder enters Earn without exiting the venue.
    const stack = await setupStack()
    await acquireVenueShares(stack, parseUnits('500', 6))

    const hash = await Actions.earn.depositShares(client, {
      minAmountOut: EarnShares.minimumOutput(parseUnits('500', 6), 30n),
      vault: stack.adapter,
      amountIn: parseUnits('500', 6),
      tokenIn: stack.venue,
    })
    const receipt = await waitForTransactionReceipt(client, { hash })

    const { args } = Actions.earn.depositShares.extractEvent(receipt.logs, {
      vault: stack.adapter,
    })
    const { caller, receiver, ...eventArgs } = args
    expect(isAddressEqual(caller, account.address)).toBe(true)
    expect(isAddressEqual(receiver, account.address)).toBe(true)
    expect(eventArgs).toMatchInlineSnapshot(`
      {
        "earnShares": 500000000n,
        "receivedVenueShares": 500000000n,
        "requestedVenueShares": 500000000n,
      }
    `)
  })

  test('behavior: manual calls composition against a resolved engine', async () => {
    const stack = await setupStack()
    await acquireVenueShares(stack, parseUnits('500', 6))

    const receipt = await sendTransactionSync(client, {
      calls: Actions.earn.depositShares.calls({
        engine: stack.engine,
        minAmountOut: EarnShares.minimumOutput(parseUnits('500', 6), 30n),
        recipient: account.address,
        vault: stack.adapter,
        amountIn: parseUnits('500', 6),
        tokenIn: stack.venue,
      }),
    })

    const { args } = Actions.earn.depositShares.extractEvent(receipt.logs, {
      vault: stack.adapter,
    })
    expect(args.earnShares).toBe(parseUnits('500', 6))
  })

  test('behavior: slippageBps floors a caller-supplied quote', async () => {
    const stack = await setupStack()
    await acquireVenueShares(stack, parseUnits('500', 6))

    const { earnShares } = await Actions.earn.depositSharesSync(client, {
      amountOut: parseUnits('500', 6),
      slippageBps: 30,
      vault: stack.adapter,
      amountIn: parseUnits('500', 6),
      tokenIn: stack.venue,
    })

    expect(earnShares).toBe(parseUnits('500', 6))
  })

  test('behavior: calls approves the engine, not the adapter', () => {
    const engine = `0x${'ee'.repeat(20)}` as const
    const recipient = `0x${'cc'.repeat(20)}` as const
    const vault = `0x${'aa'.repeat(20)}` as const
    const tokenIn = `0x${'dd'.repeat(20)}` as const

    const calls = Actions.earn.depositShares.calls({
      engine,
      minAmountOut: 1n,
      recipient,
      vault,
      amountIn: 500n,
      tokenIn,
    })

    expect(calls).toHaveLength(2)
    expect(calls[0].address).toBe(tokenIn)
    expect(calls[0].functionName).toBe('approve')
    expect(calls[0].args).toEqual([engine, 500n])
    expect(calls[1].address).toBe(vault)
    expect(calls[1].functionName).toBe('depositShares')
    expect(calls[1].args).toEqual([500n, recipient, 1n])
    expect(encodeFunctionData(calls[1] as never).slice(0, 10)).toBe(
      '0x4778421a',
    )
  })

  test('behavior: calls floors a caller-supplied quote', () => {
    const [, call] = Actions.earn.depositShares.calls({
      engine: `0x${'ee'.repeat(20)}`,
      amountOut: 500n,
      recipient: `0x${'cc'.repeat(20)}`,
      slippageBps: 100,
      vault: `0x${'aa'.repeat(20)}`,
      amountIn: 500n,
      tokenIn: `0x${'dd'.repeat(20)}`,
    })

    expect(call.args?.[2]).toBe(495n)
  })

  test('error: zero minAmountOut', async () => {
    const stack = await setupStack()

    await expect(
      Actions.earn.depositShares.simulate(client, {
        minAmountOut: 0n,
        vault: stack.adapter,
        amountIn: 100n,
        tokenIn: stack.venue,
      }),
    ).rejects.toThrow('ZeroMinimumShares')
  })
})

describe('depositSharesSync', () => {
  test('default', async () => {
    const stack = await setupStack()
    await acquireVenueShares(stack, parseUnits('500', 6))

    const { caller, receipt, recipient, ...result } =
      await Actions.earn.depositSharesSync(client, {
        minAmountOut: EarnShares.minimumOutput(parseUnits('500', 6), 30n),
        vault: stack.adapter,
        amountIn: parseUnits('500', 6),
        tokenIn: stack.venue,
      })

    expect(receipt.status).toBe('success')
    expect(isAddressEqual(caller, account.address)).toBe(true)
    expect(isAddressEqual(recipient, account.address)).toBe(true)
    expect(result).toMatchInlineSnapshot(`
      {
        "earnShares": 500000000n,
        "receivedVenueShares": 500000000n,
        "requestedVenueShares": 500000000n,
      }
    `)
  })
})

describe('getFeeState', () => {
  test('default', async () => {
    const stack = await setup()

    const { config, ...feeState } = await Actions.earn.getFeeState(client, {
      vault: stack.adapter,
    })

    expect(config.excess.enabled).toBe(false)
    expect(config.fixedFees).toEqual([])
    expect(feeState).toMatchInlineSnapshot(`
      {
        "configId": 1n,
        "feesActive": false,
        "highWaterMark": 0n,
        "preview": {
          "activeAssets": 0n,
          "allocations": [],
          "excessFeeAssets": 0n,
          "fixedFeeAssets": 0n,
          "positiveAccrualAssets": 0n,
          "postFeeValuePerShare": 0n,
          "preFeeValuePerShare": 0n,
          "targetValuePerShare": 0n,
          "totalFeeAssets": 0n,
          "totalFeeShares": 0n,
        },
        "targetBase": 0n,
      }
    `)
  })

  test('behavior: includes claimable shares for a recipient', async () => {
    const stack = await setup()

    const { claimableShares } = await Actions.earn.getFeeState(client, {
      recipient: account.address,
      vault: stack.adapter,
    })

    expect(claimableShares).toBe(0n)
  })

  test('behavior: omits claimable shares without a recipient', async () => {
    const stack = await setup()

    const feeState = await Actions.earn.getFeeState(client, {
      vault: stack.adapter,
    })

    expect('claimableShares' in feeState).toBe(false)
  })
})

describe('getPosition', () => {
  test('default', async () => {
    const stack = await setup()

    const { asset, shareToken, ...position } = await Actions.earn.getPosition(
      client,
      { vault: stack.adapter },
    )

    expect(isAddressEqual(asset, stack.asset)).toBe(true)
    expect(isAddressEqual(shareToken, stack.shareToken)).toBe(true)
    expect(position).toMatchInlineSnapshot(`
      {
        "assetAllowance": 0n,
        "assetBalance": 9900000000n,
        "shareAllowance": 0n,
        "shareBalance": 100000000n,
        "value": 100000000n,
      }
    `)
  })

  test('behavior: explicit account overrides the client account', async () => {
    const stack = await setup()

    const position = await Actions.earn.getPosition(client, {
      account: accounts[1].address,
      vault: stack.adapter,
    })

    expect(position.shareBalance).toBe(0n)
    expect(position.value).toBe(0n)
  })

  test('error: no account', async () => {
    const stack = await setup()
    const accountlessClient = getClient()

    await expect(
      Actions.earn.getPosition(accountlessClient, {
        vault: stack.adapter,
      } as never),
    ).rejects.toThrowError(
      'Could not find an Account to execute with this Action.',
    )
  })
})

describe('getVault', () => {
  test('default', async () => {
    const stack = await setup()

    const {
      asset,
      asyncJanitor,
      emergencyGuardian,
      engine,
      operator,
      shareToken,
      ...vault
    } = await Actions.earn.getVault(client, { vault: stack.adapter })
    const { address, ...engineMeta } = engine

    expect(isAddressEqual(asset, stack.asset)).toBe(true)
    expect(isAddressEqual(asyncJanitor, stack.seats.asyncJanitor.address)).toBe(
      true,
    )
    expect(
      isAddressEqual(emergencyGuardian, stack.seats.emergencyGuardian.address),
    ).toBe(true)
    expect(isAddressEqual(address, stack.engine)).toBe(true)
    expect(isAddressEqual(operator, account.address)).toBe(true)
    expect(isAddressEqual(shareToken, stack.shareToken)).toBe(true)
    expect(engineMeta).toMatchInlineSnapshot(`
      {
        "name": "Tempo Earn Test Vault",
        "symbol": "teTEST",
        "totalAssets": 100000000n,
      }
    `)
    expect(vault).toMatchInlineSnapshot(`
      {
        "capabilities": {
          "asyncRedeem": false,
          "exactWithdraw": true,
          "inKindDeposit": true,
          "syncRedeem": true,
        },
        "depositsPaused": false,
        "engineMigrationMode": "operatorEnabled",
        "engineShares": 100000000n,
        "feesActive": false,
        "isSynced": true,
        "pendingRedeemCount": 0n,
        "shareSupply": 100000000n,
      }
    `)
  })

  test('behavior: user-only migration mode', async () => {
    const stack = await deployEarnStack(client, {
      controls: { migrationMode: 'userOnly' },
    })

    const vault = await Actions.earn.getVault(client, { vault: stack.adapter })

    expect(vault.engineMigrationMode).toBe('userOnly')
  })

  test('behavior: calls tuple targets the adapter and resolved engine', () => {
    const engine = `0x${'ee'.repeat(20)}` as const
    const vault = `0x${'aa'.repeat(20)}` as const

    const calls = Actions.earn.getVault.calls({ engine, vault })

    expect(calls).toHaveLength(20)
    // Adapter reads come first, engine reads after.
    expect(calls.slice(0, 13).every((call) => call.address === vault)).toBe(
      true,
    )
    expect(calls.slice(13).every((call) => call.address === engine)).toBe(true)
    expect(calls[0].functionName).toBe('asset')
    expect(encodeFunctionData(calls[0] as never)).toBe('0x38d52e0f')
    expect(calls[1].functionName).toBe('engine')
    expect(encodeFunctionData(calls[1] as never)).toBe('0xc9d4623f')
    expect(calls[13].functionName).toBe('totalAssets')
    expect(encodeFunctionData(calls[13] as never)).toBe('0x01e1d114')
    // ERC-165 probes for the four optional engine capabilities.
    for (const call of calls.slice(16))
      expect(call.functionName).toBe('supportsInterface')
    expect(calls[16].args).toEqual(['0xa1a6a1d7']) // IVaultEngineAsync
    expect(calls[17].args).toEqual(['0x0adfb0b9']) // IVaultEngineExactWithdraw
    expect(calls[18].args).toEqual(['0x7d28a2f2']) // IVaultEngineShares
    expect(calls[19].args).toEqual(['0x370457f4']) // IVaultEngineSync
    expect(encodeFunctionData(calls[16] as never).slice(0, 10)).toBe(
      '0x01ffc9a7',
    )
  })
})

describe('minimumOutput', () => {
  test('default', () => {
    expect(EarnShares.minimumOutput(1_000_000n, 50n)).toBe(995_000n)
  })

  test('behavior: zero slippage keeps the expected output', () => {
    expect(EarnShares.minimumOutput(1_000_000n, 0n)).toBe(1_000_000n)
  })

  test('behavior: floors the bound to 1n', () => {
    expect(EarnShares.minimumOutput(10n, 9_999n)).toBe(1n)
  })

  test('error: zero expected', () => {
    expect(() =>
      EarnShares.minimumOutput(0n, 50n),
    ).toThrowErrorMatchingInlineSnapshot(
      `[EarnShares.InvalidExpectedOutputError: Expected output \`0\` must be greater than zero.]`,
    )
  })

  test('error: invalid slippage', () => {
    expect(() =>
      EarnShares.minimumOutput(1_000_000n, 10_000n),
    ).toThrowErrorMatchingInlineSnapshot(`
      [EarnShares.InvalidSlippageError: Slippage tolerance \`10000\` is invalid.

      Slippage must be at least 0 and below 10000 basis points.]
    `)
  })
})

describe('getRedeemQuote', () => {
  test('default', async () => {
    const stack = await setup()

    const amount = await Actions.earn.getRedeemQuote(client, {
      amountIn: parseUnits('100', 6),
      vault: stack.adapter,
    })

    expect(amount).toMatchInlineSnapshot(`100000000n`)
  })

  test('behavior: zero shares value zero assets', async () => {
    const stack = await setup()

    const amount = await Actions.earn.getRedeemQuote(client, {
      amountIn: 0n,
      vault: stack.adapter,
    })

    expect(amount).toBe(0n)
  })
})

describe('getWithdrawQuote', () => {
  test('default', async () => {
    const stack = await setup()

    const shares = await Actions.earn.getWithdrawQuote(client, {
      amountOut: parseUnits('40', 6),
      vault: stack.adapter,
    })

    expect(shares).toMatchInlineSnapshot(`40000000n`)
  })
})

describe('redeem', () => {
  test('default', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    // Injected yield moves the venue rate so the exit pays above the entry.
    await stack.donate(parseUnits('50', 6))

    const amountOut = await Actions.earn.getRedeemQuote(client, {
      amountIn: parseUnits('100', 6),
      vault: stack.adapter,
    })
    // No manual approve: the plain action embeds the exact approval leg.
    const hash = await Actions.earn.redeem(client, {
      minAmountOut: EarnShares.minimumOutput(amountOut, 50n),
      amountIn: parseUnits('100', 6),
      vault: stack.adapter,
    })
    const receipt = await waitForTransactionReceipt(client, { hash })

    const { args } = Actions.earn.redeem.extractEvent(receipt.logs, {
      vault: stack.adapter,
    })
    const { caller, receiver, ...eventArgs } = args
    expect(isAddressEqual(caller, account.address)).toBe(true)
    expect(isAddressEqual(receiver, account.address)).toBe(true)
    expect(eventArgs).toMatchInlineSnapshot(`
      {
        "assets": 150000000n,
        "shares": 100000000n,
      }
    `)
  })

  test('behavior: calls pairs an exact share approval with the redeem', () => {
    const recipient = `0x${'cc'.repeat(20)}` as const
    const shareToken = `0x${'dd'.repeat(20)}` as const
    const vault = `0x${'aa'.repeat(20)}` as const

    const calls = Actions.earn.redeem.calls({
      minAmountOut: 99n,
      recipient,
      amountIn: 100n,
      tokenIn: shareToken,
      vault,
    })

    expect(calls).toHaveLength(2)
    expect(calls[0].address).toBe(shareToken)
    expect(calls[0].functionName).toBe('approve')
    expect(calls[0].args).toEqual([vault, 100n])
    expect(calls[1].address).toBe(vault)
    expect(calls[1].functionName).toBe('redeem')
    expect(calls[1].args).toEqual([100n, recipient, 99n])
    expect(encodeFunctionData(calls[1] as never).slice(0, 10)).toBe(
      '0xd8780161',
    )
  })

  test('behavior: calls floors a caller-supplied quote', () => {
    const [, call] = Actions.earn.redeem.calls({
      amountOut: 100n,
      recipient: `0x${'cc'.repeat(20)}`,
      amountIn: 100n,
      tokenIn: `0x${'dd'.repeat(20)}`,
      slippageBps: 100,
      vault: `0x${'aa'.repeat(20)}`,
    })

    expect(call.args?.[2]).toBe(99n)
  })

  test('behavior: forwards caller-supplied amountOut', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    await approve({
      amount: parseUnits('40', 6),
      spender: stack.adapter,
      token: stack.shareToken,
    })

    const amountOut = parseUnits('39', 6)
    const { request } = await Actions.earn.redeem.simulate(client, {
      amountOut,
      amountIn: parseUnits('40', 6),
      slippageBps: 50,
      vault: stack.adapter,
    })

    expect(request.args?.[2]).toBe(EarnShares.minimumOutput(amountOut, 50n))
  })

  test('behavior: slippageBps floors a live preview', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    await stack.donate(parseUnits('50', 6))

    const { amount } = await Actions.earn.redeemSync(client, {
      amountIn: parseUnits('100', 6),
      slippageBps: 50,
      vault: stack.adapter,
    })

    expect(amount).toBe(parseUnits('150', 6))
  })

  test('behavior: forwards the live preview floor as the onchain bound', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    // Donated yield moves the rate; the resolved bound must floor the moved
    // quote, not the entry rate.
    await stack.donate(parseUnits('50', 6))
    await approve({
      amount: parseUnits('100', 6),
      spender: stack.adapter,
      token: stack.shareToken,
    })

    const quote = await Actions.earn.getRedeemQuote(client, {
      amountIn: parseUnits('100', 6),
      vault: stack.adapter,
    })
    const { request } = await Actions.earn.redeem.simulate(client, {
      amountIn: parseUnits('100', 6),
      slippageBps: 50,
      vault: stack.adapter,
    })

    expect(request.args?.[2]).toBe(EarnShares.minimumOutput(quote, 50n))
  })

  test('error: slippageBps floor reverts when the rate moves between quote and execution', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    await approve({
      amount: parseUnits('100', 6),
      spender: stack.adapter,
      token: stack.shareToken,
    })
    const staleBlock = await getBlockNumber(client)
    // Donated yield moves the rate; the demo venue rate only rises, so
    // executing at the pre-donate block realizes the adverse ordering.
    await stack.donate(parseUnits('50', 6))

    const quote = await Actions.earn.getRedeemQuote(client, {
      amountIn: parseUnits('100', 6),
      vault: stack.adapter,
    })
    await expect(
      simulateContract(client, {
        ...Actions.earn.redeem.call({
          minAmountOut: EarnShares.minimumOutput(quote, 50n),
          recipient: account.address,
          amountIn: parseUnits('100', 6),
          vault: stack.adapter,
        }),
        blockNumber: staleBlock,
      }),
    ).rejects.toThrow('MinimumAssetsNotMet')
  })

  test('error: zero minAmountOut', async () => {
    const stack = await setupStack()

    await expect(
      Actions.earn.redeem.simulate(client, {
        minAmountOut: 0n,
        amountIn: 100n,
        vault: stack.adapter,
      }),
    ).rejects.toThrow('ZeroMinimumAssets')
  })

  test('error: minimum assets not met', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    // Simulation covers the adapter call only, so the pull needs an allowance.
    await approve({
      amount: parseUnits('100', 6),
      spender: stack.adapter,
      token: stack.shareToken,
    })

    await expect(
      Actions.earn.redeem.simulate(client, {
        minAmountOut: parseUnits('100', 6) + 1n,
        amountIn: parseUnits('100', 6),
        vault: stack.adapter,
      }),
    ).rejects.toThrow('MinimumAssetsNotMet')
  })
})

describe('redeemSync', () => {
  test('default', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })

    const { caller, receipt, recipient, ...result } =
      await Actions.earn.redeemSync(client, {
        minAmountOut: EarnShares.minimumOutput(parseUnits('40', 6), 50n),
        amountIn: parseUnits('40', 6),
        vault: stack.adapter,
      })

    expect(receipt.status).toBe('success')
    expect(isAddressEqual(caller, account.address)).toBe(true)
    expect(isAddressEqual(recipient, account.address)).toBe(true)
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 40000000n,
        "shares": 40000000n,
      }
    `)
  })
})

describe('withdrawExact', () => {
  test('default', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    const needed = await Actions.earn.getWithdrawQuote(client, {
      amountOut: parseUnits('40', 6),
      vault: stack.adapter,
    })

    // No manual approve: the plain action embeds the burn-cap approval leg.
    const hash = await Actions.earn.withdrawExact(client, {
      amountOut: parseUnits('40', 6),
      maxAmountIn: needed,
      vault: stack.adapter,
    })
    const receipt = await waitForTransactionReceipt(client, { hash })

    const { args } = Actions.earn.withdrawExact.extractEvent(receipt.logs, {
      vault: stack.adapter,
    })
    const { caller, receiver, ...eventArgs } = args
    expect(isAddressEqual(caller, account.address)).toBe(true)
    expect(isAddressEqual(receiver, account.address)).toBe(true)
    expect(eventArgs).toMatchInlineSnapshot(`
      {
        "assets": 40000000n,
        "sharesBurned": 40000000n,
      }
    `)
  })

  test('behavior: calls approves maxAmountIn, so a residual approval may remain', () => {
    const recipient = `0x${'cc'.repeat(20)}` as const
    const shareToken = `0x${'dd'.repeat(20)}` as const
    const vault = `0x${'aa'.repeat(20)}` as const

    const calls = Actions.earn.withdrawExact.calls({
      amountOut: 40n,
      maxAmountIn: 42n,
      recipient,
      tokenIn: shareToken,
      vault,
    })

    expect(calls).toHaveLength(2)
    expect(calls[0].address).toBe(shareToken)
    expect(calls[0].functionName).toBe('approve')
    // The approval covers the burn cap, not the exact asset amount.
    expect(calls[0].args).toEqual([vault, 42n])
    expect(calls[1].address).toBe(vault)
    expect(calls[1].functionName).toBe('withdrawExact')
    expect(calls[1].args).toEqual([40n, recipient, 42n])
    expect(encodeFunctionData(calls[1] as never).slice(0, 10)).toBe(
      '0x06eebf59',
    )
  })

  test('behavior: calls raises a caller-supplied quote', () => {
    const calls = Actions.earn.withdrawExact.calls({
      amountOut: 40n,
      amountIn: 100n,
      recipient: `0x${'cc'.repeat(20)}`,
      tokenIn: `0x${'dd'.repeat(20)}`,
      slippageBps: 50,
      vault: `0x${'aa'.repeat(20)}`,
    })

    expect(calls[0].args?.[1]).toBe(101n)
    expect(calls[1].args?.[2]).toBe(101n)
  })

  test('error: calls rejects invalid slippageBps', () => {
    expect(() =>
      Actions.earn.withdrawExact.call({
        amountOut: 40n,
        amountIn: 100n,
        recipient: `0x${'cc'.repeat(20)}`,
        slippageBps: 10_000,
        vault: `0x${'aa'.repeat(20)}`,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[EarnShares.InvalidSlippageError: Slippage tolerance \`10000\` is invalid.

Slippage must be at least 0 and below 10000 basis points.]`,
    )
  })

  test('behavior: forwards caller-supplied amountIn', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    await approve({
      amount: parseUnits('100', 6),
      spender: stack.adapter,
      token: stack.shareToken,
    })

    const amountIn = parseUnits('41', 6)
    const { request } = await Actions.earn.withdrawExact.simulate(client, {
      amountOut: parseUnits('40', 6),
      amountIn,
      slippageBps: 50,
      vault: stack.adapter,
    })

    expect(request.args?.[2]).toBe(41_205_000n)
  })

  test('behavior: slippageBps raises a live quote into a ceiling burn cap', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })

    const { amount, sharesBurned } = await Actions.earn.withdrawExactSync(
      client,
      {
        amountOut: parseUnits('40', 6),
        slippageBps: 50,
        vault: stack.adapter,
      },
    )

    expect(amount).toBe(parseUnits('40', 6))
    expect(sharesBurned).toBe(parseUnits('40', 6))
    // The cap approval is ceil(40e6 * 1.005) = 40.2e6; unburned headroom stays approved.
    const allowance = await readContract(client, {
      abi: Abis.tip20,
      address: stack.shareToken,
      args: [account.address, stack.adapter],
      functionName: 'allowance',
    })
    expect(allowance).toBe(200_000n)
  })

  test('error: exceeds max shares', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    const needed = await Actions.earn.getWithdrawQuote(client, {
      amountOut: parseUnits('40', 6),
      vault: stack.adapter,
    })

    await expect(
      Actions.earn.withdrawExact.simulate(client, {
        amountOut: parseUnits('40', 6),
        maxAmountIn: needed - 1n,
        vault: stack.adapter,
      }),
    ).rejects.toThrow('ExceedsMaxShares')
  })

  test('error: residual backing', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    // Contributed backing adds venue shares without minting EarnToken, so a
    // rounded-up full-supply burn would strand venue dust.
    await approve({
      amount: parseUnits('50', 6),
      spender: stack.adapter,
      token: stack.asset,
    })
    await writeContractSync(client, {
      abi: Abis.vaultAdapter,
      address: stack.adapter,
      args: [parseUnits('50', 6)],
      functionName: 'contribute',
    })

    await expect(
      Actions.earn.withdrawExact.simulate(client, {
        amountOut: parseUnits('150', 6) - 1n,
        maxAmountIn: parseUnits('100', 6),
        vault: stack.adapter,
      }),
    ).rejects.toThrow('ResidualBacking')
  })
})

describe('withdrawExactSync', () => {
  test('default', async () => {
    const stack = await setupStack()
    await Actions.earn.depositSync(client, {
      amountIn: parseUnits('100', 6),
      minAmountOut: 1n,
      vault: stack.adapter,
    })
    const needed = await Actions.earn.getWithdrawQuote(client, {
      amountOut: parseUnits('40', 6),
      vault: stack.adapter,
    })

    const { caller, receipt, recipient, ...result } =
      await Actions.earn.withdrawExactSync(client, {
        amountOut: parseUnits('40', 6),
        maxAmountIn: needed,
        vault: stack.adapter,
      })

    expect(receipt.status).toBe('success')
    expect(isAddressEqual(caller, account.address)).toBe(true)
    expect(isAddressEqual(recipient, account.address)).toBe(true)
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 40000000n,
        "sharesBurned": 40000000n,
      }
    `)
  })
})
