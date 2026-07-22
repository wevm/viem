import type { Address, Hex, TransactionReceipt } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, EarnShares, http } from 'viem/tempo'
import { zoneModerato } from 'viem/tempo/zones'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const address =
  '0x0000000000000000000000000000000000000001' satisfies Address.Address
const hash = `0x${'01'.repeat(32)}` as Hex.Hex

const client = Client.create({
  chain: tempoLocalnet,
  transport: http(),
})
const clientWithAccount = Client.create({
  account,
  chain: tempoLocalnet,
  transport: http(),
})
const zoneClientWithAccount = Client.create({
  account,
  chain: zoneModerato(7),
  transport: http(),
})

test('exit-safe policy actions preserve account and result types', async () => {
  const options = {
    accessAdministrator: address,
    initialMembers: [address],
    shareToken: address,
  } as const

  // @ts-expect-error account required when the client has none
  await Actions.earn.configureExitSafePolicy(client, options)
  await Actions.earn.configureExitSafePolicy(client, {
    ...options,
    account: address,
  })
  const result = await Actions.earn.configureExitSafePolicy(
    clientWithAccount,
    options,
  )
  expectTypeOf(result.policy).toEqualTypeOf<Actions.earn.ExitSafePolicy>()
  expectTypeOf(result.policy.transferPolicyId).toEqualTypeOf<bigint>()
  expectTypeOf(
    result.receipts,
  ).toEqualTypeOf<Actions.earn.ExitSafePolicyReceipts>()
  expectTypeOf(Actions.earn.alwaysAllowPolicyId).toEqualTypeOf<bigint>()

  const decorated =
    await clientWithAccount.earn.configureExitSafePolicy(options)
  expectTypeOf(
    decorated,
  ).toEqualTypeOf<Actions.earn.configureExitSafePolicy.ReturnType>()

  expectTypeOf(
    await clientWithAccount.earn.validateExitSafePolicy({
      accessAdministrator: address,
      policy: result.policy,
      requiredMembers: [address],
      shareToken: address,
    }),
  ).toEqualTypeOf<void>()
})

test('getVault narrows union and nested fields', async () => {
  const vault = await Actions.earn.getVault(client, { vault: address })

  expectTypeOf(vault).toEqualTypeOf<Actions.earn.getVault.ReturnType>()
  expectTypeOf(vault.assetToken).toEqualTypeOf<Address.Address>()
  expectTypeOf(vault.shareToken).toEqualTypeOf<Address.Address>()
  expectTypeOf(vault).not.toHaveProperty('asset')
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

  Actions.earn.getVault.calls({ engine: address, vault: address })
})

test('getPosition requires an account only without a client account', async () => {
  await Actions.earn.getPosition(client, { account: address, vault: address })
  // @ts-expect-error account required when the client has none
  await Actions.earn.getPosition(client, { vault: address })
  await Actions.earn.getPosition(clientWithAccount, { vault: address })

  const position = await Actions.earn.getPosition(clientWithAccount, {
    vault: address,
  })
  expectTypeOf(position).toEqualTypeOf<Actions.earn.getPosition.ReturnType>()
  expectTypeOf(position.assetToken).toEqualTypeOf<Address.Address>()
  expectTypeOf(position.shareToken).toEqualTypeOf<Address.Address>()
  expectTypeOf(position).not.toHaveProperty('asset')
  expectTypeOf(position.value).toEqualTypeOf<bigint>()
})

test('getFeeState claimable shares stay optional', async () => {
  const feeState = await Actions.earn.getFeeState(client, { vault: address })

  expectTypeOf(feeState.claimableShares).toEqualTypeOf<bigint | undefined>()
  expectTypeOf(feeState.config).toEqualTypeOf<Actions.earn.FeeConfig>()
  expectTypeOf(feeState.preview).toEqualTypeOf<Actions.earn.FeePreview>()
  expectTypeOf(feeState.configId).toEqualTypeOf<bigint>()
})

test('quote reads return bigint amounts', async () => {
  const redeemCall = Actions.earn.getRedeemQuote.call({
    shareAmount: 1n,
    vault: address,
  })
  const withdrawCall = Actions.earn.getWithdrawQuote.call({
    assetAmount: 1n,
    vault: address,
  })
  const assetAmount = await Actions.earn.getRedeemQuote(client, {
    shareAmount: 1n,
    vault: address,
  })
  const shareAmount = await Actions.earn.getWithdrawQuote(client, {
    assetAmount: 1n,
    vault: address,
  })

  expectTypeOf(redeemCall.functionName).toEqualTypeOf<'previewRedeem'>()
  expectTypeOf(withdrawCall.functionName).toEqualTypeOf<'previewWithdraw'>()
  expectTypeOf(assetAmount).toEqualTypeOf<bigint>()
  expectTypeOf(shareAmount).toEqualTypeOf<bigint>()
  expectTypeOf(Actions.earn).not.toHaveProperty('previewRedeem')
  expectTypeOf(Actions.earn).not.toHaveProperty('previewWithdraw')
  expectTypeOf(clientWithAccount.earn).not.toHaveProperty('previewRedeem')
  expectTypeOf(clientWithAccount.earn).not.toHaveProperty('previewWithdraw')
})

test('decorated earn reads preserve shapes', async () => {
  const vault = await clientWithAccount.earn.getVault({ vault: address })
  expectTypeOf(vault).toEqualTypeOf<Actions.earn.getVault.ReturnType>()

  const position = await clientWithAccount.earn.getPosition({ vault: address })
  expectTypeOf(position).toEqualTypeOf<Actions.earn.getPosition.ReturnType>()

  const feeState = await clientWithAccount.earn.getFeeState({ vault: address })
  expectTypeOf(feeState).toEqualTypeOf<Actions.earn.getFeeState.ReturnType>()

  expectTypeOf(
    await clientWithAccount.earn.getRedeemQuote({
      shareAmount: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<bigint>()
  expectTypeOf(
    await clientWithAccount.earn.getWithdrawQuote({
      assetAmount: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<bigint>()
})

test('minimumOutput lives on EarnShares, not the earn family', () => {
  expectTypeOf(EarnShares.minimumOutput).toEqualTypeOf<
    (expectedAmount: bigint, slippageBps: number) => bigint
  >()
  expectTypeOf(Actions.earn).not.toHaveProperty('minimumOutput')
  expectTypeOf(clientWithAccount.earn).not.toHaveProperty('minimumOutput')
})

test('write amounts accept AmountInput; resolved bounds stay bigint', async () => {
  expectTypeOf<Actions.earn.deposit.Args['assetAmount']>().toEqualTypeOf<
    Actions.token.approve.Args['amount']
  >()
  expectTypeOf<Actions.earn.redeem.Args['shareAmount']>().toEqualTypeOf<
    Actions.token.approve.Args['amount']
  >()
  expectTypeOf<Actions.earn.withdrawExact.Args['assetAmount']>().toEqualTypeOf<
    Actions.token.approve.Args['amount']
  >()
  expectTypeOf<
    Extract<
      Actions.earn.deposit.call.Args,
      { shareAmountMin: bigint }
    >['shareAmountMin']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Extract<
      Actions.earn.depositShares.call.Args,
      { earnShareAmountMin: bigint }
    >['earnShareAmountMin']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Actions.earn.depositShares.Args['venueShareAmount']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Extract<
      Actions.earn.redeem.call.Args,
      { assetAmountMin: bigint }
    >['assetAmountMin']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Extract<
      Actions.earn.withdrawExact.call.Args,
      { shareAmountMax: bigint }
    >['shareAmountMax']
  >().toEqualTypeOf<bigint>()

  await Actions.earn.deposit(clientWithAccount, {
    assetAmount: { decimals: 6, formatted: '100' },
    shareAmountMin: 1n,
    vault: address,
  })
  await Actions.earn.deposit(clientWithAccount, {
    assetAmount: 1n,
    // @ts-expect-error bounds derive from quotes and stay bigint
    shareAmountMin: { formatted: '1' },
    vault: address,
  })
})

test('write args and sync results use recipient', () => {
  expectTypeOf<Actions.earn.deposit.Args>().toHaveProperty('recipient')
  expectTypeOf<Actions.earn.depositShares.Args>().toHaveProperty('recipient')
  expectTypeOf<Actions.earn.redeem.Args>().toHaveProperty('recipient')
  expectTypeOf<Actions.earn.withdrawExact.Args>().toHaveProperty('recipient')
  expectTypeOf<Actions.earn.deposit.Args>().not.toHaveProperty('receiver')
  expectTypeOf<Actions.earn.depositShares.Args>().not.toHaveProperty('receiver')
  expectTypeOf<Actions.earn.redeem.Args>().not.toHaveProperty('receiver')
  expectTypeOf<Actions.earn.withdrawExact.Args>().not.toHaveProperty('receiver')
  expectTypeOf<Actions.earn.depositSync.ReturnType>().toHaveProperty(
    'recipient',
  )
  expectTypeOf<Actions.earn.depositSharesSync.ReturnType>().toHaveProperty(
    'recipient',
  )
  expectTypeOf<Actions.earn.redeemSync.ReturnType>().toHaveProperty('recipient')
  expectTypeOf<Actions.earn.withdrawExactSync.ReturnType>().toHaveProperty(
    'recipient',
  )
  expectTypeOf<Actions.earn.depositSync.ReturnType>().not.toHaveProperty(
    'receiver',
  )
  expectTypeOf<Actions.earn.depositSharesSync.ReturnType>().not.toHaveProperty(
    'receiver',
  )
  expectTypeOf<Actions.earn.redeemSync.ReturnType>().not.toHaveProperty(
    'receiver',
  )
  expectTypeOf<Actions.earn.withdrawExactSync.ReturnType>().not.toHaveProperty(
    'receiver',
  )
})

test('bound branches are exclusive OneOf unions', async () => {
  await Actions.earn.deposit(clientWithAccount, {
    assetAmount: 1n,
    shareAmountMin: 1n,
    vault: address,
  })
  await Actions.earn.deposit(clientWithAccount, {
    assetAmount: 1n,
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await Actions.earn.deposit(clientWithAccount, {
    assetAmount: 1n,
    shareAmount: 1n,
    shareAmountMin: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `slippageBps` requires `shareAmount`
  await Actions.earn.deposit(clientWithAccount, {
    assetAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  await Actions.earn.deposit(clientWithAccount, {
    assetAmount: 1n,
    shareAmount: 1n,
    // @ts-expect-error `slippageBps` is a plain number of basis points
    slippageBps: 50n,
    vault: address,
  })

  await Actions.earn.depositShares(clientWithAccount, {
    earnShareAmountMin: 1n,
    vault: address,
    venueShareAmount: 1n,
    venueShareToken: address,
  })
  await Actions.earn.depositShares(clientWithAccount, {
    earnShareAmount: 1n,
    slippageBps: 30,
    vault: address,
    venueShareAmount: 1n,
    venueShareToken: address,
  })
  // @ts-expect-error branches cannot mix
  await Actions.earn.depositShares(clientWithAccount, {
    earnShareAmount: 1n,
    earnShareAmountMin: 1n,
    slippageBps: 30,
    vault: address,
    venueShareAmount: 1n,
    venueShareToken: address,
  })
  // @ts-expect-error `venueShareToken` is required on the plain action
  await Actions.earn.depositShares(clientWithAccount, {
    earnShareAmountMin: 1n,
    vault: address,
    venueShareAmount: 1n,
  })

  await Actions.earn.redeem(clientWithAccount, {
    assetAmountMin: 1n,
    shareAmount: 1n,
    vault: address,
  })
  await Actions.earn.redeem(clientWithAccount, {
    assetAmount: 1n,
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  await Actions.earn.redeem(clientWithAccount, {
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await Actions.earn.redeem(clientWithAccount, {
    assetAmountMin: 1n,
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await Actions.earn.redeem(clientWithAccount, {
    assetAmount: 1n,
    assetAmountMin: 1n,
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })

  await Actions.earn.withdrawExact(clientWithAccount, {
    assetAmount: 1n,
    shareAmountMax: 1n,
    vault: address,
  })
  await Actions.earn.withdrawExact(clientWithAccount, {
    assetAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  await Actions.earn.withdrawExact(clientWithAccount, {
    assetAmount: 1n,
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await Actions.earn.withdrawExact(clientWithAccount, {
    assetAmount: 1n,
    shareAmountMax: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  await Actions.earn.withdrawExact(clientWithAccount, {
    assetAmount: 1n,
    shareAmount: 1n,
    shareAmountMax: 1n,
    slippageBps: 50,
    vault: address,
  })
})

test('builders require explicit tokens and recipient', () => {
  expectTypeOf<
    Parameters<typeof Actions.earn.deposit.calls>[0]['assetToken']
  >().toEqualTypeOf<Address.Address>()

  Actions.earn.deposit.calls({
    assetAmount: 1n,
    assetToken: address,
    recipient: address,
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `assetToken` is required on the builder
  Actions.earn.deposit.calls({
    assetAmount: 1n,
    recipient: address,
    shareAmountMin: 1n,
    vault: address,
  })
  // @ts-expect-error `recipient` is required on the builder
  Actions.earn.deposit.calls({
    assetAmount: 1n,
    assetToken: address,
    shareAmountMin: 1n,
    vault: address,
  })
  Actions.earn.deposit.calls({
    assetAmount: 1n,
    // @ts-expect-error `assetToken` accepts contract addresses only
    assetToken: 1n,
    recipient: address,
    shareAmountMin: 1n,
    vault: address,
  })

  Actions.earn.depositShares.calls({
    earnShareAmount: 1n,
    engine: address,
    recipient: address,
    slippageBps: 50,
    vault: address,
    venueShareAmount: 1n,
    venueShareToken: address,
  })
  // @ts-expect-error `engine` and `venueShareToken` are required on the builder
  Actions.earn.depositShares.calls({
    earnShareAmountMin: 1n,
    recipient: address,
    vault: address,
    venueShareAmount: 1n,
  })

  Actions.earn.redeem.calls({
    assetAmount: 1n,
    recipient: address,
    shareAmount: 1n,
    shareToken: address,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `shareToken` is required on the builder
  Actions.earn.redeem.calls({
    assetAmountMin: 1n,
    recipient: address,
    shareAmount: 1n,
    vault: address,
  })

  Actions.earn.withdrawExact.calls({
    assetAmount: 1n,
    recipient: address,
    shareAmount: 1n,
    shareToken: address,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error `shareToken` is required on the builder
  Actions.earn.withdrawExact.calls({
    assetAmount: 1n,
    recipient: address,
    shareAmountMax: 1n,
    vault: address,
  })
})

test('builder bounds are exclusive OneOf unions', () => {
  Actions.earn.deposit.call({
    assetAmount: 1n,
    recipient: address,
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  Actions.earn.deposit.call({
    assetAmount: 1n,
    recipient: address,
    shareAmount: 1n,
    shareAmountMin: 1n,
    slippageBps: 50,
    vault: address,
  })

  Actions.earn.depositShares.call({
    earnShareAmount: 1n,
    recipient: address,
    slippageBps: 50,
    vault: address,
    venueShareAmount: 1n,
  })

  Actions.earn.redeem.call({
    assetAmount: 1n,
    recipient: address,
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error builders require `assetAmount` with `slippageBps`
  Actions.earn.redeem.call({
    recipient: address,
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })

  Actions.earn.withdrawExact.call({
    assetAmount: 1n,
    recipient: address,
    shareAmount: 1n,
    slippageBps: 50,
    vault: address,
  })
  // @ts-expect-error branches cannot mix
  Actions.earn.withdrawExact.call({
    assetAmount: 1n,
    recipient: address,
    shareAmount: 1n,
    shareAmountMax: 1n,
    slippageBps: 50,
    vault: address,
  })
})

test('actions do not take builder-only args', async () => {
  await Actions.earn.deposit(clientWithAccount, {
    assetAmount: 1n,
    // @ts-expect-error `assetToken` only exists on the builder
    assetToken: address,
    shareAmountMin: 1n,
    vault: address,
  })
  await Actions.earn.depositShares(clientWithAccount, {
    // @ts-expect-error `engine` only exists on the builder; the action reads it live
    engine: address,
    earnShareAmountMin: 1n,
    vault: address,
    venueShareAmount: 1n,
    venueShareToken: address,
  })
  await Actions.earn.redeem(clientWithAccount, {
    assetAmountMin: 1n,
    // @ts-expect-error `shareToken` only exists on the builder
    shareToken: address,
    shareAmount: 1n,
    vault: address,
  })
})

test('sync writes spread event args with the receipt', async () => {
  const deposit = await Actions.earn.depositSync(clientWithAccount, {
    assetAmount: 1n,
    shareAmountMin: 1n,
    vault: address,
  })
  expectTypeOf(deposit).toEqualTypeOf<Actions.earn.depositSync.ReturnType>()
  expectTypeOf(deposit.assetAmount).toEqualTypeOf<bigint>()
  expectTypeOf(deposit.shareAmount).toEqualTypeOf<bigint>()
  expectTypeOf(
    deposit.receipt,
  ).toEqualTypeOf<TransactionReceipt.TransactionReceipt>()

  const inKind = await Actions.earn.depositSharesSync(clientWithAccount, {
    earnShareAmountMin: 1n,
    vault: address,
    venueShareAmount: 1n,
    venueShareToken: address,
  })
  expectTypeOf(inKind.earnShareAmount).toEqualTypeOf<bigint>()
  expectTypeOf(inKind.receivedVenueShareAmount).toEqualTypeOf<bigint>()
  expectTypeOf(inKind.venueShareAmount).toEqualTypeOf<bigint>()

  const exit = await Actions.earn.redeemSync(clientWithAccount, {
    assetAmountMin: 1n,
    shareAmount: 1n,
    vault: address,
  })
  expectTypeOf(exit.assetAmount).toEqualTypeOf<bigint>()
  expectTypeOf(exit.shareAmount).toEqualTypeOf<bigint>()

  const exact = await Actions.earn.withdrawExactSync(clientWithAccount, {
    assetAmount: 1n,
    shareAmountMax: 1n,
    vault: address,
  })
  expectTypeOf(exact.assetAmount).toEqualTypeOf<bigint>()
  expectTypeOf(exact.shareAmount).toEqualTypeOf<bigint>()
})

test('decorated earn writes preserve shapes', async () => {
  expectTypeOf(
    await clientWithAccount.earn.deposit({
      assetAmount: 1n,
      shareAmountMin: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<Actions.earn.deposit.ReturnType>()
  expectTypeOf(
    await clientWithAccount.earn.redeem({
      assetAmountMin: 1n,
      shareAmount: 1n,
      vault: address,
    }),
  ).toEqualTypeOf<Actions.earn.redeem.ReturnType>()

  const sync = await clientWithAccount.earn.withdrawExactSync({
    assetAmount: 1n,
    shareAmountMax: 1n,
    vault: address,
  })
  expectTypeOf(sync.shareAmount).toEqualTypeOf<bigint>()

  // Builders and extraction surface on the decorated key.
  clientWithAccount.earn.deposit.calls({
    assetAmount: 1n,
    assetToken: address,
    recipient: address,
    shareAmountMin: 1n,
    vault: address,
  })
  clientWithAccount.earn.deposit.extractEvent([], { vault: address })
})

test('zone deposit bounds and recipients are required', async () => {
  expectTypeOf<
    Actions.earn.privateDeposit.prepare.Args['vaultAssetAmountMin']
  >().toEqualTypeOf<bigint | undefined>()
  expectTypeOf<
    Actions.earn.privateDeposit.prepare.Args['assetToken']
  >().toEqualTypeOf<Address.Address | undefined>()
  await Actions.earn.privateDeposit.prepare(client, {
    actionId: hash,
    assetAmount: 1n,
    callbackGas: 9_999_999n,
    fallbackRecipient: address,
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    returnMemo: hash,
    shareAmountMin: 1n,
    vaultAssetAmountMin: 1n,
    withdrawalMemo: hash,
  })
  await Actions.earn.privateDeposit.prepare(client, {
    assetAmount: 1n,
    assetToken: address,
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    shareAmount: 1n,
    slippageBps: 50,
    vaultAssetAmountMin: 1n,
  })
  // @ts-expect-error bare slippage cannot quote a Zone deposit
  await Actions.earn.privateDeposit.prepare(client, {
    assetAmount: 1n,
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    slippageBps: 50,
  })
  // @ts-expect-error `recipient` is required
  await Actions.earn.privateDeposit.prepare(client, {
    assetAmount: 1n,
    gateway: address,
    recoveryRecipient: address,
    shareAmountMin: 1n,
  })
  // @ts-expect-error `recoveryRecipient` is required
  await Actions.earn.privateDeposit.prepare(client, {
    assetAmount: 1n,
    gateway: address,
    recipient: address,
    shareAmountMin: 1n,
  })
})

test('zone redeem supports live and explicit output bounds', async () => {
  expectTypeOf<
    Actions.earn.privateRedeem.prepare.Options['assetToken']
  >().toEqualTypeOf<Address.Address | undefined>()
  await Actions.earn.privateRedeem.prepare(client, {
    assetAmountMin: 1n,
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    shareAmount: 1n,
  })
  await Actions.earn.privateRedeem.prepare(client, {
    assetAmount: 1n,
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    shareAmount: 1n,
    slippageBps: 50,
  })
  await Actions.earn.privateRedeem.prepare(client, {
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    shareAmount: 1n,
    slippageBps: 50,
  })
  await Actions.earn.privateRedeem.prepare(client, {
    assetAmountMin: 1n,
    assetToken: address,
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    shareAmount: 1n,
  })
  await Actions.earn.privateRedeem.prepare(client, {
    assetAmount: 1n,
    assetToken: address,
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    shareAmount: 1n,
    slippageBps: 50,
  })
  // @ts-expect-error explicit `assetToken` needs an explicit or quoted bound
  await Actions.earn.privateRedeem.prepare(client, {
    assetToken: address,
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    shareAmount: 1n,
    slippageBps: 50,
  })
})

test('prepared zone requests compose with Zone withdrawals', async () => {
  expectTypeOf<Actions.earn.privateDeposit.prepare.ReturnType>().toMatchTypeOf<Actions.zone.requestWithdrawal.Args>()
  expectTypeOf<Actions.earn.privateRedeem.prepare.ReturnType>().toMatchTypeOf<Actions.zone.requestWithdrawal.Args>()

  const prepared = {} as Actions.earn.privateDeposit.prepare.ReturnType
  expectTypeOf(prepared.actionId).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(prepared.chainId).toEqualTypeOf<number>()
  expectTypeOf(prepared.fromBlock).toEqualTypeOf<bigint>()
  expectTypeOf(prepared.memo).toEqualTypeOf<Hex.Hex | undefined>()
  expectTypeOf(prepared.zoneId).toEqualTypeOf<number>()
  expectTypeOf(Actions.earn.privateDeposit.calls(prepared)).toEqualTypeOf<
    ReturnType<typeof Actions.zone.requestWithdrawal.calls>
  >()

  const hash = await Actions.earn.privateDeposit(
    zoneClientWithAccount,
    prepared,
  )
  expectTypeOf(hash).toEqualTypeOf<Actions.earn.privateDeposit.ReturnType>()
  const sync = await Actions.earn.privateDepositSync(
    zoneClientWithAccount,
    prepared,
  )
  expectTypeOf(sync).toEqualTypeOf<Actions.earn.privateDepositSync.ReturnType>()
  expectTypeOf(sync.senderTag).toEqualTypeOf<Hex.Hex>()
})

test('decorated zone earn actions preserve helpers and results', async () => {
  const prepared = await clientWithAccount.earn.privateDeposit.prepare({
    assetAmount: 1n,
    assetToken: address,
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    shareAmountMin: 1n,
    vaultAssetAmountMin: 1n,
  })
  expectTypeOf(
    prepared,
  ).toEqualTypeOf<Actions.earn.privateDeposit.prepare.ReturnType>()
  zoneClientWithAccount.earn.privateDeposit.calls(prepared)
  expectTypeOf(
    await zoneClientWithAccount.earn.privateDeposit(prepared),
  ).toEqualTypeOf<Actions.earn.privateDeposit.ReturnType>()
  const depositSync =
    await zoneClientWithAccount.earn.privateDepositSync(prepared)
  expectTypeOf(depositSync.senderTag).toEqualTypeOf<Hex.Hex>()

  const deposit = await clientWithAccount.earn.waitForPrivateDeposit({
    actionId: prepared.actionId,
    fromBlock: prepared.fromBlock,
    gateway: address,
  })
  expectTypeOf(
    deposit,
  ).toEqualTypeOf<Actions.earn.waitForPrivateDeposit.ReturnType>()

  const redeem = await clientWithAccount.earn.privateRedeem.prepare({
    gateway: address,
    recipient: address,
    recoveryRecipient: address,
    shareAmount: 1n,
    slippageBps: 50,
  })
  zoneClientWithAccount.earn.privateRedeem.calls(redeem)
  expectTypeOf(
    await zoneClientWithAccount.earn.privateRedeem(redeem),
  ).toEqualTypeOf<Actions.earn.privateRedeem.ReturnType>()
  const redeemSync = await zoneClientWithAccount.earn.privateRedeemSync(redeem)
  expectTypeOf(redeemSync.senderTag).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(
    await clientWithAccount.earn.waitForPrivateRedeem({
      actionId: redeem.actionId,
      fromBlock: redeem.fromBlock,
      gateway: address,
    }),
  ).toEqualTypeOf<Actions.earn.waitForPrivateRedeem.ReturnType>()
})
