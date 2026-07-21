import type { Address } from 'abitype'
import { EarnShares } from 'ox/tempo'
import { expectTypeOf, test } from 'vitest'
import type * as internal_Token from '../../actions/token/internal.js'
import { tempoModerato } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { decorator } from '../Decorator.js'
import type { TransactionReceipt } from '../Transaction.js'
import * as earnActions from './earn.js'

const address = '0x0000000000000000000000000000000000000001' as Address

const transport = custom({
  async request() {
    return null
  },
})
const client = createClient({
  chain: tempoModerato,
  transport,
})
const clientWithAccount = createClient({
  account: address,
  chain: tempoModerato,
  transport,
})
const decoratedClient = clientWithAccount.extend(decorator())

test('getVault narrows union and nested fields', async () => {
  const vault = await earnActions.getVault(client, { vault: address })

  expectTypeOf(vault).toEqualTypeOf<earnActions.getVault.ReturnValue>()
  expectTypeOf(vault.engineMigrationMode).toEqualTypeOf<
    'operatorEnabled' | 'userOnly'
  >()
  expectTypeOf(vault.capabilities).toEqualTypeOf<{
    asyncRedeem: boolean
    exactWithdraw: boolean
    inKindDeposit: boolean
    syncRedeem: boolean
  }>()
  expectTypeOf(vault.engine.totalAssets).toEqualTypeOf<bigint>()
  expectTypeOf(vault.pendingRedeemCount).toEqualTypeOf<bigint>()

  earnActions.getVault.calls({ engine: address, vault: address })
})

test('getPosition requires an account only without a client account', async () => {
  await earnActions.getPosition(client, { account: address, vault: address })
  // @ts-expect-error account required when the client has none
  await earnActions.getPosition(client, { vault: address })
  await earnActions.getPosition(clientWithAccount, { vault: address })

  const position = await earnActions.getPosition(clientWithAccount, {
    vault: address,
  })
  expectTypeOf(position).toEqualTypeOf<earnActions.getPosition.ReturnValue>()
  expectTypeOf(position.value).toEqualTypeOf<bigint>()
})

test('getFeeState claimable shares stay optional', async () => {
  const feeState = await earnActions.getFeeState(client, { vault: address })

  expectTypeOf(feeState.claimableShares).toEqualTypeOf<bigint | undefined>()
  expectTypeOf(feeState.config).toEqualTypeOf<earnActions.FeeConfig>()
  expectTypeOf(feeState.preview).toEqualTypeOf<earnActions.FeePreview>()
  expectTypeOf(feeState.configId).toEqualTypeOf<bigint>()
})

test('quote reads return bigint amounts', async () => {
  const amountOut = await earnActions.getRedeemQuote(client, {
    amountIn: 1n,
    vault: address,
  })
  const amountIn = await earnActions.getWithdrawQuote(client, {
    amountOut: 1n,
    vault: address,
  })

  expectTypeOf(amountOut).toEqualTypeOf<bigint>()
  expectTypeOf(amountIn).toEqualTypeOf<bigint>()
  expectTypeOf(earnActions).not.toHaveProperty('previewRedeem')
  expectTypeOf(earnActions).not.toHaveProperty('previewWithdraw')
  expectTypeOf(decoratedClient.earn).not.toHaveProperty('previewRedeem')
  expectTypeOf(decoratedClient.earn).not.toHaveProperty('previewWithdraw')
})

test('decorated earn reads preserve shapes', async () => {
  const vault = await decoratedClient.earn.getVault({ vault: address })
  expectTypeOf(vault).toEqualTypeOf<earnActions.getVault.ReturnValue>()

  const position = await decoratedClient.earn.getPosition({ vault: address })
  expectTypeOf(position).toEqualTypeOf<earnActions.getPosition.ReturnValue>()

  const feeState = await decoratedClient.earn.getFeeState({ vault: address })
  expectTypeOf(feeState).toEqualTypeOf<earnActions.getFeeState.ReturnValue>()

  expectTypeOf(
    await decoratedClient.earn.getRedeemQuote({ amountIn: 1n, vault: address }),
  ).toEqualTypeOf<bigint>()
  expectTypeOf(
    await decoratedClient.earn.getWithdrawQuote({
      amountOut: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<bigint>()
})

test('minimumOutput lives on EarnShares, not the earn family', () => {
  expectTypeOf(EarnShares.minimumOutput).toEqualTypeOf<
    (expected: bigint, slippageBps: bigint) => bigint
  >()
  expectTypeOf(earnActions).not.toHaveProperty('minimumOutput')
  expectTypeOf(decoratedClient.earn).not.toHaveProperty('minimumOutput')
})

test('write amounts accept AmountInput; resolved bounds stay bigint', async () => {
  expectTypeOf<
    earnActions.deposit.Args['amountIn']
  >().toEqualTypeOf<internal_Token.AmountInput>()
  expectTypeOf<
    earnActions.redeem.Args['amountIn']
  >().toEqualTypeOf<internal_Token.AmountInput>()
  expectTypeOf<
    earnActions.withdrawExact.Args['amountOut']
  >().toEqualTypeOf<internal_Token.AmountInput>()
  expectTypeOf<
    Extract<
      earnActions.deposit.call.Args,
      { minAmountOut: bigint }
    >['minAmountOut']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Extract<
      earnActions.depositShares.call.Args,
      { minAmountOut: bigint }
    >['minAmountOut']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    earnActions.depositShares.Args['amountIn']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Extract<
      earnActions.redeem.call.Args,
      { minAmountOut: bigint }
    >['minAmountOut']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Extract<
      earnActions.withdrawExact.call.Args,
      { maxAmountIn: bigint }
    >['maxAmountIn']
  >().toEqualTypeOf<bigint>()

  await earnActions.deposit(clientWithAccount, {
    amountIn: { decimals: 6, formatted: '100' },
    minAmountOut: 1n,
    vault: address,
  })
  await earnActions.deposit(clientWithAccount, {
    amountIn: 1n,
    // @ts-expect-error bounds derive from quotes and stay bigint
    minAmountOut: { formatted: '1' },
    vault: address,
  })
})

test('write args and sync results use recipient', () => {
  expectTypeOf<earnActions.deposit.Args>().toHaveProperty('recipient')
  expectTypeOf<earnActions.depositShares.Args>().toHaveProperty('recipient')
  expectTypeOf<earnActions.redeem.Args>().toHaveProperty('recipient')
  expectTypeOf<earnActions.withdrawExact.Args>().toHaveProperty('recipient')
  expectTypeOf<earnActions.deposit.Args>().not.toHaveProperty('receiver')
  expectTypeOf<earnActions.depositShares.Args>().not.toHaveProperty('receiver')
  expectTypeOf<earnActions.redeem.Args>().not.toHaveProperty('receiver')
  expectTypeOf<earnActions.withdrawExact.Args>().not.toHaveProperty('receiver')
  expectTypeOf<earnActions.depositSync.ReturnValue>().toHaveProperty(
    'recipient',
  )
  expectTypeOf<earnActions.depositSharesSync.ReturnValue>().toHaveProperty(
    'recipient',
  )
  expectTypeOf<earnActions.redeemSync.ReturnValue>().toHaveProperty('recipient')
  expectTypeOf<earnActions.withdrawExactSync.ReturnValue>().toHaveProperty(
    'recipient',
  )
  expectTypeOf<earnActions.depositSync.ReturnValue>().not.toHaveProperty(
    'receiver',
  )
  expectTypeOf<earnActions.depositSharesSync.ReturnValue>().not.toHaveProperty(
    'receiver',
  )
  expectTypeOf<earnActions.redeemSync.ReturnValue>().not.toHaveProperty(
    'receiver',
  )
  expectTypeOf<earnActions.withdrawExactSync.ReturnValue>().not.toHaveProperty(
    'receiver',
  )
})

test('bound branches are exclusive OneOf unions', async () => {
  await earnActions.deposit(clientWithAccount, {
    amountIn: 1n,
    minAmountOut: 1n,
    vault: address,
  })
  await earnActions.deposit(clientWithAccount, {
    amountIn: 1n,
    amountOut: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.deposit(clientWithAccount, {
    amountIn: 1n,
    amountOut: 1n,
    minAmountOut: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `slippageBps` requires `amountOut`
  await earnActions.deposit(clientWithAccount, {
    amountIn: 1n,
    slippageBps: 50,
    vault: address,
  })
  await earnActions.deposit(clientWithAccount, {
    amountIn: 1n,
    amountOut: 1n,
    // @ts-expect-error `slippageBps` is a plain number of basis points
    slippageBps: 50n,
    vault: address,
  })

  await earnActions.depositShares(clientWithAccount, {
    minAmountOut: 1n,
    vault: address,
    amountIn: 1n,
    tokenIn: address,
  })
  await earnActions.depositShares(clientWithAccount, {
    amountOut: 1n,
    slippageBps: 30,
    vault: address,
    amountIn: 1n,
    tokenIn: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.depositShares(clientWithAccount, {
    amountOut: 1n,
    minAmountOut: 1n,
    slippageBps: 30,
    vault: address,
    amountIn: 1n,
    tokenIn: address,
  })
  // @ts-expect-error `tokenIn` is required on the plain action
  await earnActions.depositShares(clientWithAccount, {
    minAmountOut: 1n,
    vault: address,
    amountIn: 1n,
  })

  await earnActions.redeem(clientWithAccount, {
    minAmountOut: 1n,
    amountIn: 1n,
    vault: address,
  })
  await earnActions.redeem(clientWithAccount, {
    amountOut: 1n,
    amountIn: 1n,
    slippageBps: 50,
    vault: address,
  })
  await earnActions.redeem(clientWithAccount, {
    amountIn: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.redeem(clientWithAccount, {
    minAmountOut: 1n,
    amountIn: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.redeem(clientWithAccount, {
    amountOut: 1n,
    minAmountOut: 1n,
    amountIn: 1n,
    slippageBps: 50,
    vault: address,
  })

  await earnActions.withdrawExact(clientWithAccount, {
    amountOut: 1n,
    maxAmountIn: 1n,
    vault: address,
  })
  await earnActions.withdrawExact(clientWithAccount, {
    amountOut: 1n,
    slippageBps: 50,
    vault: address,
  })
  await earnActions.withdrawExact(clientWithAccount, {
    amountOut: 1n,
    amountIn: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.withdrawExact(clientWithAccount, {
    amountOut: 1n,
    maxAmountIn: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.withdrawExact(clientWithAccount, {
    amountOut: 1n,
    amountIn: 1n,
    maxAmountIn: 1n,
    slippageBps: 50,
    vault: address,
  })
})

test('builders require explicit tokens and recipient', () => {
  earnActions.deposit.calls({
    amountIn: 1n,
    tokenIn: address,
    amountOut: 1n,
    recipient: address,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `tokenIn` is required on the builder
  earnActions.deposit.calls({
    amountIn: 1n,
    minAmountOut: 1n,
    recipient: address,
    vault: address,
  })
  // @ts-expect-error `recipient` is required on the builder
  earnActions.deposit.calls({
    amountIn: 1n,
    tokenIn: address,
    minAmountOut: 1n,
    vault: address,
  })

  earnActions.depositShares.calls({
    engine: address,
    amountOut: 1n,
    recipient: address,
    slippageBps: 50,
    vault: address,
    amountIn: 1n,
    tokenIn: address,
  })
  // @ts-expect-error `engine` and `tokenIn` are required on the builder
  earnActions.depositShares.calls({
    minAmountOut: 1n,
    recipient: address,
    vault: address,
    amountIn: 1n,
  })

  earnActions.redeem.calls({
    amountOut: 1n,
    recipient: address,
    tokenIn: address,
    amountIn: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `tokenIn` is required on the builder
  earnActions.redeem.calls({
    minAmountOut: 1n,
    recipient: address,
    amountIn: 1n,
    vault: address,
  })

  earnActions.withdrawExact.calls({
    amountOut: 1n,
    amountIn: 1n,
    recipient: address,
    tokenIn: address,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `tokenIn` is required on the builder
  earnActions.withdrawExact.calls({
    amountOut: 1n,
    maxAmountIn: 1n,
    recipient: address,
    vault: address,
  })
})

test('builder bounds are exclusive OneOf unions', () => {
  earnActions.deposit.call({
    amountIn: 1n,
    amountOut: 1n,
    recipient: address,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  earnActions.deposit.call({
    amountIn: 1n,
    amountOut: 1n,
    minAmountOut: 1n,
    recipient: address,
    slippageBps: 50,
    vault: address,
  })

  earnActions.depositShares.call({
    amountOut: 1n,
    recipient: address,
    slippageBps: 50,
    vault: address,
    amountIn: 1n,
  })

  earnActions.redeem.call({
    amountOut: 1n,
    recipient: address,
    amountIn: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error builders require `amountOut` with `slippageBps`
  earnActions.redeem.call({
    recipient: address,
    amountIn: 1n,
    slippageBps: 50,
    vault: address,
  })

  earnActions.withdrawExact.call({
    amountOut: 1n,
    amountIn: 1n,
    recipient: address,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  earnActions.withdrawExact.call({
    amountOut: 1n,
    amountIn: 1n,
    maxAmountIn: 1n,
    recipient: address,
    slippageBps: 50,
    vault: address,
  })
})

test('actions do not take builder-only args', async () => {
  await earnActions.deposit(clientWithAccount, {
    amountIn: 1n,
    // @ts-expect-error `tokenIn` only exists on the builder
    tokenIn: address,
    minAmountOut: 1n,
    vault: address,
  })
  await earnActions.depositShares(clientWithAccount, {
    // @ts-expect-error `engine` only exists on the builder; the action reads it live
    engine: address,
    minAmountOut: 1n,
    vault: address,
    amountIn: 1n,
    tokenIn: address,
  })
  await earnActions.redeem(clientWithAccount, {
    minAmountOut: 1n,
    // @ts-expect-error `tokenIn` only exists on the builder
    tokenIn: address,
    amountIn: 1n,
    vault: address,
  })
})

test('sync writes spread event args with the receipt', async () => {
  const deposit = await earnActions.depositSync(clientWithAccount, {
    amountIn: 1n,
    minAmountOut: 1n,
    vault: address,
  })
  expectTypeOf(deposit).toEqualTypeOf<earnActions.depositSync.ReturnValue>()
  expectTypeOf(deposit.amount).toEqualTypeOf<bigint>()
  expectTypeOf(deposit.shares).toEqualTypeOf<bigint>()
  expectTypeOf(deposit.receipt).toEqualTypeOf<TransactionReceipt>()

  const inKind = await earnActions.depositSharesSync(clientWithAccount, {
    minAmountOut: 1n,
    vault: address,
    amountIn: 1n,
    tokenIn: address,
  })
  expectTypeOf(inKind.earnShares).toEqualTypeOf<bigint>()
  expectTypeOf(inKind.receivedVenueShares).toEqualTypeOf<bigint>()
  expectTypeOf(inKind.requestedVenueShares).toEqualTypeOf<bigint>()

  const exit = await earnActions.redeemSync(clientWithAccount, {
    minAmountOut: 1n,
    amountIn: 1n,
    vault: address,
  })
  expectTypeOf(exit.amount).toEqualTypeOf<bigint>()
  expectTypeOf(exit.shares).toEqualTypeOf<bigint>()

  const exact = await earnActions.withdrawExactSync(clientWithAccount, {
    amountOut: 1n,
    maxAmountIn: 1n,
    vault: address,
  })
  expectTypeOf(exact.amount).toEqualTypeOf<bigint>()
  expectTypeOf(exact.sharesBurned).toEqualTypeOf<bigint>()
})

test('decorated earn writes preserve shapes', async () => {
  expectTypeOf(
    await decoratedClient.earn.deposit({
      amountIn: 1n,
      minAmountOut: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<earnActions.deposit.ReturnValue>()
  expectTypeOf(
    await decoratedClient.earn.redeem({
      minAmountOut: 1n,
      amountIn: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<earnActions.redeem.ReturnValue>()

  const sync = await decoratedClient.earn.withdrawExactSync({
    amountOut: 1n,
    maxAmountIn: 1n,
    vault: address,
  })
  expectTypeOf(sync.sharesBurned).toEqualTypeOf<bigint>()

  // Builders and extraction surface on the decorated key.
  decoratedClient.earn.deposit.calls({
    amountIn: 1n,
    tokenIn: address,
    minAmountOut: 1n,
    recipient: address,
    vault: address,
  })
  decoratedClient.earn.deposit.extractEvent([], { vault: address })
})
