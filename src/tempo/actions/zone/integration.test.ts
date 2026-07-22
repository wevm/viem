import * as tempo from '~test/tempo.js'
import { deployEarnGateway, deployEarnStack } from '~test/tempo/earn.js'
import * as tempoZone from '~test/tempoZone.js'
import {
  AbiEvent,
  AbiFunction,
  AbiParameters,
  Address,
  Hash,
  PublicKey,
  Secp256k1,
  Value,
} from 'ox'
import { Actions as CoreActions } from 'viem'
import { Account, Abis, Actions } from 'viem/tempo'
import { Abis as ZoneAbis } from 'viem/tempo/zones'
import { describe, expect, test } from 'vitest'

const parentClient = tempo.getClient()
const account = parentClient.account
const zoneAdmin = Account.fromSecp256k1(tempo.zoneAdminKey)
const zoneAdminClient = tempo.getClient({ account: zoneAdmin })
const zoneClient = tempoZone.getClient({ account })
const hardfork = process.env.VITE_TEMPO_HARDFORK
const legacyZoneCallback = hardfork === 'T7' || hardfork === 'T8'
const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

describe.skipIf(Boolean(process.env.OFFLINE))('local zone', () => {
  test(
    'supports deposits, status reads, and withdrawals',
    { retry: 0, timeout: 150_000 },
    async () => {
      if (!tempoZone.portalAddress)
        throw new Error('Zone portal address is unavailable.')

      const authorization = await Actions.zone.signAuthorizationToken(
        zoneClient,
        { zoneId: tempoZone.zoneId },
      )
      expect(authorization.authentication.zoneId).toBe(tempoZone.zoneId)

      const authorizationInfo =
        await Actions.zone.getAuthorizationTokenInfo(zoneClient)
      expect(authorizationInfo.account.toLowerCase()).toBe(
        account.address.toLowerCase(),
      )
      expect(authorizationInfo.expiresAt).toBeGreaterThan(0n)

      const zoneInfo = await Actions.zone.getZoneInfo(zoneClient)
      expect(zoneInfo).toMatchObject({
        chainId: tempoZone.chain.id,
        zoneId: tempoZone.zoneId,
      })
      expect(zoneInfo.sequencers.length).toBeGreaterThan(0)
      expect(zoneInfo.tempoBlockNumber).toBeGreaterThanOrEqual(0n)

      const encryptionKey = await Actions.zone.getEncryptionKey(parentClient, {
        portalAddress: tempoZone.portalAddress,
        zoneId: tempoZone.zoneId,
      })
      expect(encryptionKey.keyIndex).toBeGreaterThanOrEqual(0n)
      expect(encryptionKey.publicKey.x).toMatch(/^0x[\da-f]{64}$/)
      expect([2, 3]).toContain(encryptionKey.publicKey.prefix)

      const preparedRecipient =
        await Actions.zone.encryptedDeposit.prepareRecipient(parentClient, {
          portalAddress: tempoZone.portalAddress,
          recipient: account.address,
          zoneId: tempoZone.zoneId,
        })
      expect(preparedRecipient).toMatchObject({
        chainId: parentClient.chain.id,
        keyIndex: encryptionKey.keyIndex,
        portalAddress: tempoZone.portalAddress,
        zoneId: tempoZone.zoneId,
      })
      expect(preparedRecipient.encrypted.ciphertext).toMatch(/^0x[\da-f]+$/)

      const { factoryAddress } = tempoZone
      if (!factoryAddress)
        throw new Error('Zone factory address is unavailable.')
      const rpcInfo = (await zoneClient.request({
        method: 'zone_getZoneInfo',
        params: [],
      })) as Actions.zone.getZoneInfo.RpcReturnType
      const unconfiguredZoneReceipt =
        'sequencers' in rpcInfo
          ? await CoreActions.contract.writeSync(zoneAdminClient, {
              abi: ZoneAbis.zoneFactory,
              address: factoryAddress,
              args: [
                {
                  admin: account.address,
                  initialToken: tempo.pathUsd,
                  rpcUrl: 'http://127.0.0.1:0',
                  sequencers: [account.address],
                  threshold: 1,
                },
              ],
              functionName: 'createZone',
              gas: 20_000_000n,
            })
          : await (async () => {
              const verifier = await CoreActions.contract.read(parentClient, {
                abi: ZoneAbis.zoneFactory,
                address: factoryAddress,
                functionName: 'verifier',
              })
              const genesisTempoBlockNumber = BigInt(
                await parentClient.request({ method: 'eth_blockNumber' }),
              )
              return CoreActions.contract.writeSync(parentClient, {
                abi: ZoneAbis.zoneFactory,
                address: factoryAddress,
                args: [
                  {
                    admin: account.address,
                    initialToken: tempo.pathUsd,
                    rpcUrl: 'http://127.0.0.1:0',
                    sequencer: account.address,
                    verifier,
                    zoneParams: {
                      genesisBlockHash: zeroHash,
                      genesisTempoBlockHash: zeroHash,
                      genesisTempoBlockNumber,
                    },
                  },
                ],
                functionName: 'createZone',
                gas: 20_000_000n,
              })
            })()
      const [zoneCreated] = AbiEvent.extractLogs(
        ZoneAbis.zoneFactory,
        unconfiguredZoneReceipt.logs,
        { eventName: 'ZoneCreated' },
      )
      if (!zoneCreated) throw new Error('ZoneCreated event is unavailable.')
      await expect(
        Actions.zone.getEncryptionKey(parentClient, {
          portalAddress: zoneCreated.args.portal,
          zoneId: Number(zoneCreated.args.zoneId),
        }),
      ).rejects.toThrow('No sequencer encryption key configured.')

      const deposit = await Actions.zone.depositSync(parentClient, {
        amount: 1_000_000n,
        portalAddress: tempoZone.portalAddress,
        token: tempo.pathUsd,
        zoneId: tempoZone.zoneId,
      })
      expect(deposit.receipt.status).toBe('success')
      const depositTransaction = await CoreActions.transaction.get(
        parentClient,
        { hash: deposit.receipt.transactionHash },
      )
      const depositCall = depositTransaction.calls?.[1]
      if (!depositCall?.data) throw new Error('Deposit call is unavailable.')
      const depositArgs = AbiFunction.decodeData(
        AbiFunction.fromAbi(ZoneAbis.zonePortal, 'deposit'),
        depositCall.data,
      )
      expect(depositArgs[4]).toBe(account.address)

      const imported = await Actions.zone.waitForTempoBlock(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: deposit.receipt.blockNumber,
        timeout: 30_000,
      })
      expect(imported.tempoBlockNumber).toBeGreaterThanOrEqual(
        deposit.receipt.blockNumber,
      )

      const encryptedDeposit = await Actions.zone.encryptedDepositSync(
        parentClient,
        {
          amount: 1_000_000n,
          pollingInterval: 100,
          portalAddress: tempoZone.portalAddress,
          timeout: 30_000,
          token: tempo.pathUsd,
          zoneId: tempoZone.zoneId,
        },
      )
      expect(encryptedDeposit.receipt.status).toBe('success')
      const encryptedDepositTransaction = await CoreActions.transaction.get(
        parentClient,
        { hash: encryptedDeposit.receipt.transactionHash },
      )
      const encryptedDepositCall = encryptedDepositTransaction.calls?.[1]
      if (!encryptedDepositCall?.data)
        throw new Error('Encrypted deposit call is unavailable.')
      const encryptedDepositArgs = AbiFunction.decodeData(
        AbiFunction.fromAbi(ZoneAbis.zonePortal, 'depositEncrypted'),
        encryptedDepositCall.data,
      )
      expect(encryptedDepositArgs[4]).toBe(account.address)
      const encryptedImported = await Actions.zone.waitForTempoBlock(
        zoneClient,
        {
          pollingInterval: 100,
          tempoBlockNumber: encryptedDeposit.receipt.blockNumber,
          timeout: 30_000,
        },
      )
      expect(encryptedImported.tempoBlockNumber).toBeGreaterThanOrEqual(
        encryptedDeposit.receipt.blockNumber,
      )

      await expect(
        Actions.zone.getWithdrawalFee(zoneClient),
      ).resolves.toBeGreaterThanOrEqual(0n)
      await expect(
        Actions.zone.getWithdrawalFee(zoneClient, {
          callbackGas: 100_000n,
        }),
      ).resolves.toBeGreaterThanOrEqual(0n)

      const token = zoneInfo.zoneTokens[0]
      if (!token) throw new Error('Zone token is unavailable.')

      const preparedWithdrawal = await Actions.zone.requestWithdrawal.prepare(
        zoneClient,
        {
          amount: 10_000n,
          callbackGas: 100_000n,
          token,
        },
      )
      expect(preparedWithdrawal).toMatchObject({
        amount: 10_000n,
        callbackGas: 100_000n,
        data: '0x',
        fallbackRecipient: account.address,
        memo: zeroHash,
        to: account.address,
        token,
      })
      expect(preparedWithdrawal.request).toMatchObject({
        type: 'tempo',
      })
      expect(preparedWithdrawal.request.calls).toHaveLength(2)
      const feePerGas =
        preparedWithdrawal.request.maxFeePerGas ??
        preparedWithdrawal.request.gasPrice
      if (typeof feePerGas !== 'bigint')
        throw new Error('Prepared fee per gas is unavailable.')
      expect(preparedWithdrawal.maxFee).toBe(
        (preparedWithdrawal.request.gas * feePerGas + 1_000_000_000_000n - 1n) /
          1_000_000_000_000n,
      )
      const withdrawalHash = await CoreActions.transaction.send(
        zoneClient,
        preparedWithdrawal.request,
      )
      await expect(
        CoreActions.transaction.waitForReceipt(zoneClient, {
          checkReplacement: false,
          hash: withdrawalHash,
        }).receipt,
      ).resolves.toMatchObject({ status: 'success' })

      const { publicKey } = Secp256k1.createKeyPair()
      const revealTo = PublicKey.toHex(PublicKey.compress(publicKey))
      const verifiableWithdrawal =
        await Actions.zone.requestVerifiableWithdrawalSync(zoneClient, {
          amount: 10_000n,
          pollingInterval: 100,
          revealTo,
          token,
        })
      expect(verifiableWithdrawal.receipt.status).toBe('success')
    },
  )

  test(
    'deposits and redeems through an Earn gateway',
    { retry: 0, timeout: 480_000 },
    async () => {
      if (!tempoZone.portalAddress)
        throw new Error('Zone portal address is unavailable.')

      const portalAddress = tempoZone.portalAddress
      const recoveryRecipient = tempo.accounts[2].address
      await Actions.zone.signAuthorizationToken(zoneClient, {
        zoneId: tempoZone.zoneId,
      })

      const stack = await deployEarnStack(parentClient, {
        asset: tempo.pathUsd,
      })
      await Actions.token.transferSync(parentClient, {
        amount: Value.from('100', 6),
        to: zoneAdmin.address,
        token: tempo.pathUsd,
      })
      const { gateway } = await deployEarnGateway(parentClient, {
        adapter: stack.adapter,
        defaultSwapper: account.address,
        legacyCallback: legacyZoneCallback,
        owner: account.address,
        portalClient: zoneAdminClient,
        zonePortal: portalAddress,
      })

      const callbackGas = 10_000_000n
      // Exercise a non-default value below the Zone callback gas ceiling.
      const callbackGasOverride = callbackGas - 1n
      const withdrawalFee = await Actions.zone.getWithdrawalFee(zoneClient, {
        callbackGas,
      })
      const assetAmount = Value.from('10', 6)
      const assetDepositAmount =
        assetAmount + withdrawalFee * 2n + Value.from('10', 6)
      const assetDeposit = await Actions.zone.depositSync(parentClient, {
        amount: assetDepositAmount,
        portalAddress,
        token: stack.asset,
        zoneId: tempoZone.zoneId,
      })
      await Actions.zone.waitForTempoBlock(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: assetDeposit.receipt.blockNumber,
      })

      const swappedDeposit = await Actions.earn.privateDeposit.prepare(
        parentClient,
        {
          assetAmount: 1n,
          assetToken: tempo.alphaUsd,
          gateway,
          recipient: account.address,
          recoveryRecipient,
          shareAmountMin: 2n,
        },
      )
      const [swappedDepositCallback] = AbiParameters.decode(
        Abis.zoneGatewayCallbackData,
        swappedDeposit.data,
      )
      expect(swappedDepositCallback).toMatchObject({
        flow: 0,
        minOutputAmount: 0n,
        minVaultAssets: 0n,
        minVaultShares: 2n,
      })
      expect(
        Address.isEqual(swappedDepositCallback.outputToken, stack.shareToken),
      ).toBe(true)

      const boundedSwappedDeposit = await Actions.earn.privateDeposit.prepare(
        parentClient,
        {
          assetAmount: 1n,
          assetToken: tempo.alphaUsd,
          gateway,
          recipient: account.address,
          recoveryRecipient,
          shareAmountMin: 4n,
          vaultAssetAmountMin: 3n,
        },
      )
      const [boundedSwappedDepositCallback] = AbiParameters.decode(
        Abis.zoneGatewayCallbackData,
        boundedSwappedDeposit.data,
      )
      expect(boundedSwappedDepositCallback).toMatchObject({
        flow: 0,
        minOutputAmount: 0n,
        minVaultAssets: 3n,
        minVaultShares: 4n,
      })

      const depositActionId = Hash.keccak256('0x01')
      const depositReturnMemo = Hash.keccak256('0x02')
      const depositWithdrawalMemo = Hash.keccak256('0x03')
      const preparedDeposit = await Actions.earn.privateDeposit.prepare(
        parentClient,
        {
          actionId: depositActionId,
          assetAmount,
          callbackGas: callbackGasOverride,
          fallbackRecipient: recoveryRecipient,
          gateway,
          recipient: account.address,
          recoveryRecipient,
          returnMemo: depositReturnMemo,
          shareAmountMin: 1n,
          vaultAssetAmountMin: 2n,
          withdrawalMemo: depositWithdrawalMemo,
        },
      )
      expect(preparedDeposit).toMatchObject({
        actionId: depositActionId,
        callbackGas: callbackGasOverride,
        chainId: parentClient.chain.id,
        fallbackRecipient: recoveryRecipient,
        memo: depositWithdrawalMemo,
        zoneId: tempoZone.zoneId,
      })
      const [depositCallback] = AbiParameters.decode(
        Abis.zoneGatewayCallbackData,
        preparedDeposit.data,
      )
      expect(depositCallback).toMatchObject({
        actionId: depositActionId,
        flow: 0,
        minOutputAmount: 0n,
        minVaultAssets: assetAmount,
        minVaultShares: 1n,
      })
      expect(
        Address.isEqual(depositCallback.outputToken, stack.shareToken),
      ).toBe(true)
      expect(
        Address.isEqual(depositCallback.refundRecipient, recoveryRecipient),
      ).toBe(true)
      await expect(
        Actions.earn.privateDeposit(zoneClient, {
          ...preparedDeposit,
          zoneId: preparedDeposit.zoneId + 1,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Prepared Zone request Zone ID does not match client chain.]`,
      )
      const acceptedDeposit = await Actions.earn.privateDepositSync(
        zoneClient,
        preparedDeposit,
      )
      expect(acceptedDeposit.receipt.status).toBe('success')

      const deposit = await Actions.earn.waitForPrivateDeposit(parentClient, {
        actionId: preparedDeposit.actionId,
        fromBlock: preparedDeposit.fromBlock,
        gateway,
        pollingInterval: 100,
      })
      expect(deposit.actionId).toBe(preparedDeposit.actionId)
      expect(deposit.inputAmount).toBe(assetAmount)
      expect(Address.isEqual(deposit.inputToken, stack.asset)).toBe(true)
      expect(deposit.shares).toBe(assetAmount)
      expect(deposit.vaultAssets).toBe(assetAmount)

      await Actions.zone.waitForTempoBlock(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: deposit.tempoBlockNumber,
      })
      const shareBalance = await Actions.token.getBalance(zoneClient, {
        account: account.address,
        token: stack.shareToken,
      })
      expect(shareBalance.amount).toBe(deposit.shares)

      const swappedRedeem = await Actions.earn.privateRedeem.prepare(
        parentClient,
        {
          assetAmountMin: 2n,
          assetToken: tempo.alphaUsd,
          gateway,
          recipient: account.address,
          recoveryRecipient,
          shareAmount: 1n,
        },
      )
      const [swappedRedeemCallback] = AbiParameters.decode(
        Abis.zoneGatewayCallbackData,
        swappedRedeem.data,
      )
      expect(swappedRedeemCallback).toMatchObject({
        flow: 1,
        minOutputAmount: 2n,
        minVaultAssets: 1n,
        minVaultShares: 0n,
      })
      expect(
        Address.isEqual(swappedRedeemCallback.outputToken, tempo.alphaUsd),
      ).toBe(true)

      const redeemActionId = Hash.keccak256('0x04')
      const redeemReturnMemo = Hash.keccak256('0x05')
      const redeemWithdrawalMemo = Hash.keccak256('0x06')
      const preparedRedeem = await Actions.earn.privateRedeem.prepare(
        parentClient,
        {
          actionId: redeemActionId,
          callbackGas: callbackGasOverride,
          fallbackRecipient: recoveryRecipient,
          gateway,
          recipient: account.address,
          recoveryRecipient,
          returnMemo: redeemReturnMemo,
          shareAmount: shareBalance.amount,
          slippageBps: 0,
          withdrawalMemo: redeemWithdrawalMemo,
        },
      )
      expect(preparedRedeem).toMatchObject({
        actionId: redeemActionId,
        callbackGas: callbackGasOverride,
        chainId: parentClient.chain.id,
        fallbackRecipient: recoveryRecipient,
        memo: redeemWithdrawalMemo,
        zoneId: tempoZone.zoneId,
      })
      const [redeemCallback] = AbiParameters.decode(
        Abis.zoneGatewayCallbackData,
        preparedRedeem.data,
      )
      expect(redeemCallback).toMatchObject({
        actionId: redeemActionId,
        flow: 1,
        minOutputAmount: 0n,
        minVaultAssets: assetAmount,
        minVaultShares: 0n,
      })
      expect(Address.isEqual(redeemCallback.outputToken, stack.asset)).toBe(
        true,
      )
      expect(
        Address.isEqual(redeemCallback.refundRecipient, recoveryRecipient),
      ).toBe(true)
      const acceptedRedeem = await Actions.earn.privateRedeemSync(
        zoneClient,
        preparedRedeem,
      )
      expect(acceptedRedeem.receipt.status).toBe('success')

      const redeem = await Actions.earn.waitForPrivateRedeem(parentClient, {
        actionId: preparedRedeem.actionId,
        fromBlock: preparedRedeem.fromBlock,
        gateway,
        pollingInterval: 100,
      })
      expect(redeem.actionId).toBe(preparedRedeem.actionId)
      expect(Address.isEqual(redeem.outputToken, stack.asset)).toBe(true)
      expect(redeem.outputAmount).toBe(assetAmount)
      expect(redeem.shares).toBe(deposit.shares)
      expect(redeem.vaultAssets).toBe(assetAmount)

      await Actions.zone.waitForTempoBlock(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: redeem.tempoBlockNumber,
      })
      const [assetBalance, finalShareBalance] = await Promise.all([
        Actions.token.getBalance(zoneClient, {
          account: account.address,
          token: stack.asset,
        }),
        Actions.token.getBalance(zoneClient, {
          account: account.address,
          token: stack.shareToken,
        }),
      ])
      expect(assetBalance.amount).toBeGreaterThanOrEqual(assetAmount)
      expect(finalShareBalance.amount).toBe(0n)
    },
  )

  test(
    'provisions and stops an independent zone once',
    { retry: 0, timeout: 150_000 },
    async () => {
      if (!tempoZone.factoryAddress)
        throw new Error('Zone factory address is unavailable.')
      const secondary = tempo.defineZone({
        factoryAddress: tempoZone.factoryAddress,
      })

      try {
        const [zone, sameZone] = await Promise.all([
          secondary.start(),
          secondary.start(),
        ])
        expect(sameZone).toBe(zone)
        expect(zone.factoryAddress).toBe(tempoZone.factoryAddress)
        expect(zone.zoneId).not.toBe(tempoZone.zoneId)
        expect(zone.chainId).not.toBe(tempoZone.chain.id)
        expect(zone.portalAddress).not.toBe(tempoZone.portalAddress)

        const response = await fetch(zone.rpcUrl, {
          body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'eth_chainId',
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })
        await expect(response.json()).resolves.toMatchObject({
          result: `0x${zone.chainId.toString(16)}`,
        })

        await Promise.all([secondary.stop(), secondary.stop()])

        await Actions.zone.signAuthorizationToken(zoneClient, {
          zoneId: tempoZone.zoneId,
        })
        await expect(
          Actions.zone.getZoneInfo(zoneClient),
        ).resolves.toMatchObject({ zoneId: tempoZone.zoneId })
      } finally {
        await secondary.stop()
      }
    },
  )
})
