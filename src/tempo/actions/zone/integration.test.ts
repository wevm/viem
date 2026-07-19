import * as tempo from '~test/tempo.js'
import * as tempoZone from '~test/tempoZone.js'
import { AbiEvent, AbiFunction, PublicKey, Secp256k1 } from 'ox'
import { Actions as CoreActions } from 'viem'
import { Actions } from 'viem/tempo'
import { Abis as ZoneAbis } from 'viem/tempo/zones'
import { describe, expect, test } from 'vitest'

const parentClient = tempo.getClient()
const account = parentClient.account
const zoneClient = tempoZone.getClient({ account })
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

      if (!tempoZone.factoryAddress)
        throw new Error('Zone factory address is unavailable.')
      const verifier = await CoreActions.contract.read(parentClient, {
        abi: ZoneAbis.zoneFactory,
        address: tempoZone.factoryAddress,
        functionName: 'verifier',
      })
      const genesisTempoBlockNumber = BigInt(
        await parentClient.request({ method: 'eth_blockNumber' }),
      )
      const unconfiguredZoneReceipt = await CoreActions.contract.writeSync(
        parentClient,
        {
          abi: ZoneAbis.zoneFactory,
          address: tempoZone.factoryAddress,
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
        },
      )
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

      const status = await Actions.zone.waitForDepositStatus(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: deposit.receipt.blockNumber,
        timeout: 30_000,
      })
      expect(status).toMatchObject({
        processed: true,
        tempoBlockNumber: deposit.receipt.blockNumber,
      })
      expect(status.zoneProcessedThrough).toBeGreaterThanOrEqual(
        deposit.receipt.blockNumber,
      )
      expect(status.deposits[0]).toMatchObject({
        amount: 1_000_000n,
        kind: 'regular',
        recipient: account.address.toLowerCase(),
        sender: account.address.toLowerCase(),
        status: 'processed',
      })
      await expect(
        Actions.zone.getDepositStatus(zoneClient, {
          tempoBlockNumber: deposit.receipt.blockNumber,
        }),
      ).resolves.toMatchObject({ processed: true })

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
      await expect(
        Actions.zone.waitForDepositStatus(zoneClient, {
          pollingInterval: 100,
          tempoBlockNumber: encryptedDeposit.receipt.blockNumber,
          timeout: 30_000,
        }),
      ).resolves.toMatchObject({ processed: true })

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
    'provisions and stops an independent zone once',
    { retry: 0, timeout: 150_000 },
    async () => {
      if (!tempoZone.factoryAddress)
        throw new Error('Zone factory address is unavailable.')
      const secondary = tempo.defineZone({
        factoryAddress: tempoZone.factoryAddress,
        privateKey: tempo.accounts[2].privateKey,
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
