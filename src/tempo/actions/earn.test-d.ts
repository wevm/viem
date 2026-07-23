import type { Address } from 'abitype'
import type { Hex } from 'ox'
import { EarnShares } from 'ox/tempo'
import { expectTypeOf, test } from 'vitest'
import type * as internal_Token from '../../actions/token/internal.js'
import { tempoModerato } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { decorator } from '../Decorator.js'
import type { TransactionReceipt } from '../Transaction.js'
import { zoneModerato } from '../zones/zone.js'
import * as earnActions from './earn.js'
import type * as zoneActions from './zone.js'

const address = '0x0000000000000000000000000000000000000001' as Address
const hash = `0x${'01'.repeat(32)}` as Hex.Hex

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
const zoneClientWithAccount = createClient({
  account: address,
  chain: zoneModerato(7),
  transport,
})
const decoratedZoneClient = zoneClientWithAccount.extend(decorator())

test('exit-safe policy actions preserve account and result types', async () => {
  const parameters = {
    accessAdministrator: address,
    initialMembers: [address],
    earnToken: address,
  } as const

  // @ts-expect-error account required when the client has none
  await earnActions.configureExitSafePolicy(client, parameters)
  await earnActions.configureExitSafePolicy(client, {
    ...parameters,
    account: address,
  })
  const result = await earnActions.configureExitSafePolicy(
    clientWithAccount,
    parameters,
  )
  expectTypeOf(result.policy).toEqualTypeOf<earnActions.ExitSafePolicy>()
  expectTypeOf(result.policy.transferPolicyId).toEqualTypeOf<bigint>()
  expectTypeOf(
    result.receipts,
  ).toEqualTypeOf<earnActions.ExitSafePolicyReceipts>()
  expectTypeOf(earnActions.alwaysAllowPolicyId).toEqualTypeOf<bigint>()

  const decorated =
    await decoratedClient.earn.configureExitSafePolicy(parameters)
  expectTypeOf(
    decorated,
  ).toEqualTypeOf<earnActions.configureExitSafePolicy.ReturnValue>()

  expectTypeOf(
    await decoratedClient.earn.validateExitSafePolicy({
      accessAdministrator: address,
      policy: result.policy,
      requiredMembers: [address],
      earnToken: address,
    }),
  ).toEqualTypeOf<void>()
})

test('getVault narrows union and nested fields', async () => {
  const vault = await earnActions.getVault(client, { vault: address })

  expectTypeOf(vault).toEqualTypeOf<earnActions.getVault.ReturnValue>()
  expectTypeOf(vault.assetToken).toEqualTypeOf<Address>()
  expectTypeOf(vault.earnToken).toEqualTypeOf<Address>()
  expectTypeOf(vault).not.toHaveProperty('asset')
  expectTypeOf(vault.engineMigrationMode).toEqualTypeOf<
    'operatorEnabled' | 'userOnly'
  >()
  expectTypeOf(vault.capabilities).toEqualTypeOf<{
    asyncRedeem: boolean
    exactWithdraw: boolean
    inKindDeposit: boolean
    redeem: boolean
  }>()
  expectTypeOf(vault.engine.totalAssets).toEqualTypeOf<bigint>()
  expectTypeOf(vault.openRedeemRequestCount).toEqualTypeOf<bigint>()

  earnActions.getVault.calls({
    earnFees: address,
    engine: address,
    vault: address,
  })
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
  expectTypeOf(position.assetToken).toEqualTypeOf<Address>()
  expectTypeOf(position.earnToken).toEqualTypeOf<Address>()
  expectTypeOf(position).not.toHaveProperty('asset')
  expectTypeOf(position.value).toEqualTypeOf<bigint>()
})

test('getFeeState claimable shares stay optional', async () => {
  const feeState = await earnActions.getFeeState(client, { vault: address })

  expectTypeOf(feeState.claimableEarn).toEqualTypeOf<bigint | undefined>()
  expectTypeOf(feeState.config).toEqualTypeOf<earnActions.FeeConfig>()
  expectTypeOf(feeState.preview).toEqualTypeOf<earnActions.FeePreview>()
  expectTypeOf(feeState.configId).toEqualTypeOf<bigint>()
})

test('quote reads return bigint amounts', async () => {
  const redeemCall = earnActions.getRedeemQuote.call({
    earnAmount: 1n,
    vault: address,
  })
  const withdrawCall = earnActions.getWithdrawQuote.call({
    assetAmount: 1n,
    vault: address,
  })
  const assetAmount = await earnActions.getRedeemQuote(client, {
    earnAmount: 1n,
    vault: address,
  })
  const earnAmount = await earnActions.getWithdrawQuote(client, {
    assetAmount: 1n,
    vault: address,
  })

  expectTypeOf(redeemCall.functionName).toEqualTypeOf<'previewRedeem'>()
  expectTypeOf(withdrawCall.functionName).toEqualTypeOf<'previewWithdraw'>()
  expectTypeOf(assetAmount).toEqualTypeOf<bigint>()
  expectTypeOf(earnAmount).toEqualTypeOf<bigint>()
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
    await decoratedClient.earn.getRedeemQuote({
      earnAmount: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<bigint>()
  expectTypeOf(
    await decoratedClient.earn.getWithdrawQuote({
      assetAmount: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<bigint>()
})

test('minimumOutput lives on EarnShares, not the earn family', () => {
  expectTypeOf(EarnShares.minimumOutput).toEqualTypeOf<
    (expectedAmount: bigint, slippageBps: number) => bigint
  >()
  expectTypeOf(earnActions).not.toHaveProperty('minimumOutput')
  expectTypeOf(decoratedClient.earn).not.toHaveProperty('minimumOutput')
})

test('write amounts accept AmountInput; resolved bounds stay bigint', async () => {
  expectTypeOf<
    earnActions.deposit.Args['assetAmount']
  >().toEqualTypeOf<internal_Token.AmountInput>()
  expectTypeOf<
    earnActions.redeem.Args['earnAmount']
  >().toEqualTypeOf<internal_Token.AmountInput>()
  expectTypeOf<
    earnActions.withdrawExact.Args['assetAmount']
  >().toEqualTypeOf<internal_Token.AmountInput>()
  expectTypeOf<
    Extract<
      earnActions.deposit.call.Args,
      { earnAmountMin: bigint }
    >['earnAmountMin']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Extract<
      earnActions.depositVenueShares.call.Args,
      { earnAmountMin: bigint }
    >['earnAmountMin']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    earnActions.depositVenueShares.Args['venueShares']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Extract<
      earnActions.redeem.call.Args,
      { assetAmountMin: bigint }
    >['assetAmountMin']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Extract<
      earnActions.withdrawExact.call.Args,
      { earnAmountMax: bigint }
    >['earnAmountMax']
  >().toEqualTypeOf<bigint>()

  await earnActions.deposit(clientWithAccount, {
    assetAmount: { decimals: 6, formatted: '100' },
    earnAmountMin: 1n,
    vault: address,
  })
  await earnActions.deposit(clientWithAccount, {
    assetAmount: 1n,
    // @ts-expect-error bounds derive from quotes and stay bigint
    earnAmountMin: { formatted: '1' },
    vault: address,
  })
})

test('write args and sync results use recipient', () => {
  expectTypeOf<earnActions.deposit.Args>().toHaveProperty('recipient')
  expectTypeOf<earnActions.depositVenueShares.Args>().toHaveProperty(
    'recipient',
  )
  expectTypeOf<earnActions.redeem.Args>().toHaveProperty('recipient')
  expectTypeOf<earnActions.withdrawExact.Args>().toHaveProperty('recipient')
  expectTypeOf<earnActions.deposit.Args>().not.toHaveProperty('receiver')
  expectTypeOf<earnActions.depositVenueShares.Args>().not.toHaveProperty(
    'receiver',
  )
  expectTypeOf<earnActions.redeem.Args>().not.toHaveProperty('receiver')
  expectTypeOf<earnActions.withdrawExact.Args>().not.toHaveProperty('receiver')
  expectTypeOf<earnActions.depositSync.ReturnValue>().toHaveProperty(
    'recipient',
  )
  expectTypeOf<earnActions.depositVenueSharesSync.ReturnValue>().toHaveProperty(
    'recipient',
  )
  expectTypeOf<earnActions.redeemSync.ReturnValue>().toHaveProperty('recipient')
  expectTypeOf<earnActions.withdrawExactSync.ReturnValue>().toHaveProperty(
    'recipient',
  )
  expectTypeOf<earnActions.depositSync.ReturnValue>().not.toHaveProperty(
    'receiver',
  )
  expectTypeOf<earnActions.depositVenueSharesSync.ReturnValue>().not.toHaveProperty(
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
    assetAmount: 1n,
    earnAmountMin: 1n,
    vault: address,
  })
  await earnActions.deposit(clientWithAccount, {
    assetAmount: 1n,
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.deposit(clientWithAccount, {
    assetAmount: 1n,
    earnAmount: 1n,
    earnAmountMin: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `slippageBps` requires `earnAmount`
  await earnActions.deposit(clientWithAccount, {
    assetAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  await earnActions.deposit(clientWithAccount, {
    assetAmount: 1n,
    earnAmount: 1n,
    // @ts-expect-error `slippageBps` is a plain number of basis points
    slippageBps: 50n,
    vault: address,
  })

  await earnActions.depositVenueShares(clientWithAccount, {
    earnAmountMin: 1n,
    vault: address,
    venueShares: 1n,
    venueShareToken: address,
  })
  await earnActions.depositVenueShares(clientWithAccount, {
    earnAmount: 1n,
    slippageBps: 30,
    vault: address,
    venueShares: 1n,
    venueShareToken: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.depositVenueShares(clientWithAccount, {
    earnAmount: 1n,
    earnAmountMin: 1n,
    slippageBps: 30,
    vault: address,
    venueShares: 1n,
    venueShareToken: address,
  })
  // @ts-expect-error `venueShareToken` is required on the plain action
  await earnActions.depositVenueShares(clientWithAccount, {
    earnAmountMin: 1n,
    vault: address,
    venueShares: 1n,
  })

  await earnActions.redeem(clientWithAccount, {
    assetAmountMin: 1n,
    earnAmount: 1n,
    vault: address,
  })
  await earnActions.redeem(clientWithAccount, {
    assetAmount: 1n,
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  await earnActions.redeem(clientWithAccount, {
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.redeem(clientWithAccount, {
    assetAmountMin: 1n,
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.redeem(clientWithAccount, {
    assetAmount: 1n,
    assetAmountMin: 1n,
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })

  await earnActions.withdrawExact(clientWithAccount, {
    assetAmount: 1n,
    earnAmountMax: 1n,
    vault: address,
  })
  await earnActions.withdrawExact(clientWithAccount, {
    assetAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  await earnActions.withdrawExact(clientWithAccount, {
    assetAmount: 1n,
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.withdrawExact(clientWithAccount, {
    assetAmount: 1n,
    earnAmountMax: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await earnActions.withdrawExact(clientWithAccount, {
    assetAmount: 1n,
    earnAmount: 1n,
    earnAmountMax: 1n,
    slippageBps: 50,
    vault: address,
  })
})

test('builders require explicit tokens and recipient', () => {
  earnActions.deposit.calls({
    assetAmount: 1n,
    assetToken: address,
    recipient: address,
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `assetToken` is required on the builder
  earnActions.deposit.calls({
    assetAmount: 1n,
    recipient: address,
    earnAmountMin: 1n,
    vault: address,
  })
  // @ts-expect-error `recipient` is required on the builder
  earnActions.deposit.calls({
    assetAmount: 1n,
    assetToken: address,
    earnAmountMin: 1n,
    vault: address,
  })

  earnActions.depositVenueShares.calls({
    earnAmount: 1n,
    engine: address,
    recipient: address,
    slippageBps: 50,
    vault: address,
    venueShares: 1n,
    venueShareToken: address,
  })
  // @ts-expect-error `engine` and `venueShareToken` are required on the builder
  earnActions.depositVenueShares.calls({
    earnAmountMin: 1n,
    recipient: address,
    vault: address,
    venueShares: 1n,
  })

  earnActions.redeem.calls({
    assetAmount: 1n,
    recipient: address,
    earnAmount: 1n,
    earnToken: address,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `earnToken` is required on the builder
  earnActions.redeem.calls({
    assetAmountMin: 1n,
    recipient: address,
    earnAmount: 1n,
    vault: address,
  })

  earnActions.withdrawExact.calls({
    assetAmount: 1n,
    recipient: address,
    earnAmount: 1n,
    earnToken: address,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `earnToken` is required on the builder
  earnActions.withdrawExact.calls({
    assetAmount: 1n,
    recipient: address,
    earnAmountMax: 1n,
    vault: address,
  })
})

test('builder bounds are exclusive OneOf unions', () => {
  earnActions.deposit.call({
    assetAmount: 1n,
    recipient: address,
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  earnActions.deposit.call({
    assetAmount: 1n,
    recipient: address,
    earnAmount: 1n,
    earnAmountMin: 1n,
    slippageBps: 50,
    vault: address,
  })

  earnActions.depositVenueShares.call({
    earnAmount: 1n,
    recipient: address,
    slippageBps: 50,
    vault: address,
    venueShares: 1n,
  })

  earnActions.redeem.call({
    assetAmount: 1n,
    recipient: address,
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error builders require `assetAmount` with `slippageBps`
  earnActions.redeem.call({
    recipient: address,
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })

  earnActions.withdrawExact.call({
    assetAmount: 1n,
    recipient: address,
    earnAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  earnActions.withdrawExact.call({
    assetAmount: 1n,
    recipient: address,
    earnAmount: 1n,
    earnAmountMax: 1n,
    slippageBps: 50,
    vault: address,
  })
})

test('actions do not take builder-only args', async () => {
  await earnActions.deposit(clientWithAccount, {
    assetAmount: 1n,
    // @ts-expect-error `assetToken` only exists on the builder
    assetToken: address,
    earnAmountMin: 1n,
    vault: address,
  })
  await earnActions.depositVenueShares(clientWithAccount, {
    // @ts-expect-error `engine` only exists on the builder; the action reads it live
    engine: address,
    earnAmountMin: 1n,
    vault: address,
    venueShares: 1n,
    venueShareToken: address,
  })
  await earnActions.redeem(clientWithAccount, {
    assetAmountMin: 1n,
    // @ts-expect-error `earnToken` only exists on the builder
    earnToken: address,
    earnAmount: 1n,
    vault: address,
  })
})

test('sync writes spread event args with the receipt', async () => {
  const deposit = await earnActions.depositSync(clientWithAccount, {
    assetAmount: 1n,
    earnAmountMin: 1n,
    vault: address,
  })
  expectTypeOf(deposit).toEqualTypeOf<earnActions.depositSync.ReturnValue>()
  expectTypeOf(deposit.assetAmount).toEqualTypeOf<bigint>()
  expectTypeOf(deposit.earnAmount).toEqualTypeOf<bigint>()
  expectTypeOf(deposit.receipt).toEqualTypeOf<TransactionReceipt>()

  const inKind = await earnActions.depositVenueSharesSync(clientWithAccount, {
    earnAmountMin: 1n,
    vault: address,
    venueShares: 1n,
    venueShareToken: address,
  })
  expectTypeOf(inKind.earnAmount).toEqualTypeOf<bigint>()
  expectTypeOf(inKind.receivedVenueShares).toEqualTypeOf<bigint>()
  expectTypeOf(inKind.venueShares).toEqualTypeOf<bigint>()

  const exit = await earnActions.redeemSync(clientWithAccount, {
    assetAmountMin: 1n,
    earnAmount: 1n,
    vault: address,
  })
  expectTypeOf(exit.assetAmount).toEqualTypeOf<bigint>()
  expectTypeOf(exit.earnAmount).toEqualTypeOf<bigint>()

  const exact = await earnActions.withdrawExactSync(clientWithAccount, {
    assetAmount: 1n,
    earnAmountMax: 1n,
    vault: address,
  })
  expectTypeOf(exact.assetAmount).toEqualTypeOf<bigint>()
  expectTypeOf(exact.earnAmount).toEqualTypeOf<bigint>()
})

test('decorated earn writes preserve shapes', async () => {
  expectTypeOf(
    await decoratedClient.earn.deposit({
      assetAmount: 1n,
      earnAmountMin: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<earnActions.deposit.ReturnValue>()
  expectTypeOf(
    await decoratedClient.earn.redeem({
      assetAmountMin: 1n,
      earnAmount: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<earnActions.redeem.ReturnValue>()

  const sync = await decoratedClient.earn.withdrawExactSync({
    assetAmount: 1n,
    earnAmountMax: 1n,
    vault: address,
  })
  expectTypeOf(sync.earnAmount).toEqualTypeOf<bigint>()

  // Builders and extraction surface on the decorated key.
  decoratedClient.earn.deposit.calls({
    assetAmount: 1n,
    assetToken: address,
    recipient: address,
    earnAmountMin: 1n,
    vault: address,
  })
  decoratedClient.earn.deposit.extractEvent([], { vault: address })
})

test('zone deposit bounds and recipients are required', async () => {
  expectTypeOf<
    earnActions.privateDeposit.prepare.Args['vaultAssetAmountMin']
  >().toEqualTypeOf<bigint | undefined>()
  await earnActions.privateDeposit.prepare(client, {
    actionId: hash,
    assetAmount: 1n,
    callbackGas: 9_999_999n,
    fallbackRecipient: address,
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    recoveryRecipient: address,
    returnMemo: hash,
    earnAmountMin: 1n,
    vaultAssetAmountMin: 1n,
    withdrawalMemo: hash,
  })
  await earnActions.privateDeposit.prepare(client, {
    assetAmount: 1n,
    assetToken: address,
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    recoveryRecipient: address,
    earnAmount: 1n,
    slippageBps: 50,
    vaultAssetAmountMin: 1n,
  })
  // @ts-expect-error bare slippage cannot quote a Zone deposit
  await earnActions.privateDeposit.prepare(client, {
    assetAmount: 1n,
    earnRouter: address,
    recipient: address,
    recoveryRecipient: address,
    slippageBps: 50,
  })
  // @ts-expect-error `recipient` is required
  await earnActions.privateDeposit.prepare(client, {
    assetAmount: 1n,
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recoveryRecipient: address,
    earnAmountMin: 1n,
  })
  // @ts-expect-error `recoveryRecipient` is required
  await earnActions.privateDeposit.prepare(client, {
    assetAmount: 1n,
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    earnAmountMin: 1n,
  })
})

test('zone redeem supports live and explicit output bounds', async () => {
  await earnActions.privateRedeem.prepare(client, {
    assetAmountMin: 1n,
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    recoveryRecipient: address,
    earnAmount: 1n,
  })
  await earnActions.privateRedeem.prepare(client, {
    assetAmount: 1n,
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    recoveryRecipient: address,
    earnAmount: 1n,
    slippageBps: 50,
  })
  await earnActions.privateRedeem.prepare(client, {
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    recoveryRecipient: address,
    earnAmount: 1n,
    slippageBps: 50,
  })
  await earnActions.privateRedeem.prepare(client, {
    assetAmountMin: 1n,
    assetToken: address,
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    recoveryRecipient: address,
    earnAmount: 1n,
  })
  await earnActions.privateRedeem.prepare(client, {
    assetAmount: 1n,
    assetToken: address,
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    recoveryRecipient: address,
    earnAmount: 1n,
    slippageBps: 50,
  })
  // @ts-expect-error explicit `assetToken` needs an explicit or quoted bound
  await earnActions.privateRedeem.prepare(client, {
    assetToken: address,
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    recoveryRecipient: address,
    earnAmount: 1n,
    slippageBps: 50,
  })
})

test('prepared zone requests compose with Zone withdrawals', async () => {
  expectTypeOf<earnActions.privateDeposit.prepare.ReturnValue>().toMatchTypeOf<zoneActions.requestWithdrawal.Args>()
  expectTypeOf<earnActions.privateRedeem.prepare.ReturnValue>().toMatchTypeOf<zoneActions.requestWithdrawal.Args>()

  const prepared = {} as earnActions.privateDeposit.prepare.ReturnValue
  expectTypeOf(prepared.actionId).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(prepared.chainId).toEqualTypeOf<number>()
  expectTypeOf(prepared.fromBlock).toEqualTypeOf<bigint>()
  expectTypeOf(prepared.memo).toEqualTypeOf<Hex.Hex | undefined>()
  expectTypeOf(prepared.zoneId).toEqualTypeOf<number>()
  expectTypeOf(earnActions.privateDeposit.calls(prepared)).toEqualTypeOf<
    ReturnType<typeof zoneActions.requestWithdrawal.calls>
  >()

  const hash = await earnActions.privateDeposit(zoneClientWithAccount, prepared)
  expectTypeOf(hash).toEqualTypeOf<earnActions.privateDeposit.ReturnValue>()
  const sync = await earnActions.privateDepositSync(
    zoneClientWithAccount,
    prepared,
  )
  expectTypeOf(sync).toEqualTypeOf<earnActions.privateDepositSync.ReturnValue>()
  expectTypeOf(sync.senderTag).toEqualTypeOf<Hex.Hex>()
})

test('decorated zone earn actions preserve helpers and results', async () => {
  const prepared = await decoratedClient.earn.privateDeposit.prepare({
    assetAmount: 1n,
    assetToken: address,
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    recoveryRecipient: address,
    earnAmountMin: 1n,
    vaultAssetAmountMin: 1n,
  })
  expectTypeOf(
    prepared,
  ).toEqualTypeOf<earnActions.privateDeposit.prepare.ReturnValue>()
  decoratedZoneClient.earn.privateDeposit.calls(prepared)
  expectTypeOf(
    await decoratedZoneClient.earn.privateDeposit(prepared),
  ).toEqualTypeOf<earnActions.privateDeposit.ReturnValue>()
  const depositSync =
    await decoratedZoneClient.earn.privateDepositSync(prepared)
  expectTypeOf(depositSync.senderTag).toEqualTypeOf<Hex.Hex>()

  const deposit = await decoratedClient.earn.waitForPrivateDeposit({
    actionId: prepared.actionId,
    fromBlock: prepared.fromBlock,
    earnRouter: address,
  })
  expectTypeOf(
    deposit,
  ).toEqualTypeOf<earnActions.waitForPrivateDeposit.ReturnType>()

  const redeem = await decoratedClient.earn.privateRedeem.prepare({
    adapter: address,
    earnRouter: address,
    zoneId: 1,
    recipient: address,
    recoveryRecipient: address,
    earnAmount: 1n,
    slippageBps: 50,
  })
  decoratedZoneClient.earn.privateRedeem.calls(redeem)
  expectTypeOf(
    await decoratedZoneClient.earn.privateRedeem(redeem),
  ).toEqualTypeOf<earnActions.privateRedeem.ReturnValue>()
  const redeemSync = await decoratedZoneClient.earn.privateRedeemSync(redeem)
  expectTypeOf(redeemSync.senderTag).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(
    await decoratedClient.earn.waitForPrivateRedeem({
      actionId: redeem.actionId,
      fromBlock: redeem.fromBlock,
      earnRouter: address,
    }),
  ).toEqualTypeOf<earnActions.waitForPrivateRedeem.ReturnType>()
})
