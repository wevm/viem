import { AbiEvent, Hex, Secp256k1, Value } from 'ox'
import { AccountConfig, Channel } from 'ox/tempo'
import { Abis, Account, Actions } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, chain, feeToken, getClient } from '~test/tempoAccounts.js'

const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const payer = accounts[0]
const payee = accounts[1]
const client = getClient()
const token = feeToken

/**
 * Whether the test chain accepts configurable voucher signers (T15, TIP-1166).
 * Earlier forks reject a registered configurable signer with `RootKeyRetired`.
 */
const signerSnapshots =
  Number(/^T(\d+)$/.exec(process.env.VITE_TEMPO_HARDFORK ?? '')?.[1]) >= 15

let signerId = 0

describe('getOpenSalt', () => {
  test('behavior: configurable signer without a commitment', async () => {
    const signer = await setupSigner({ commit: false })

    const [salt_1, salt_2] = await Promise.all([
      Actions.channel.getOpenSalt(client, { signer }),
      Actions.channel.getOpenSalt(client, { signer: signer.address }),
    ])

    expect(salt_1).toMatch(/^0x[0-9a-f]{64}$/)
    expect(salt_1).not.toBe(zeroHash)
    expect(salt_2).not.toBe(salt_1)
  })

  test('behavior: configurable signer with a commitment', async () => {
    const signer = await setupSigner()

    const [byAccount, byAddress] = await Promise.all([
      Actions.channel.getOpenSalt(client, { signer }),
      Actions.channel.getOpenSalt(client, { signer: signer.address }),
    ])

    expect(byAccount).toBe(AccountConfig.getCommitment(signer.config))
    expect(byAddress).toBe(byAccount)
  })

  test('behavior: root account', async () => {
    const salt = await Actions.channel.getOpenSalt(client, { signer: payer })

    expect(salt).toMatch(/^0x[0-9a-f]{64}$/)
    expect(salt).not.toBe(zeroHash)
  })
})

describe('open', () => {
  test.runIf(signerSnapshots)(
    'behavior: authorized signer defaults salt to its commitment',
    async () => {
      const signer = await setupSigner()
      const commitment = AccountConfig.getCommitment(signer.config)

      const { receipt, ...opened } = await Actions.channel.openSync(client, {
        authorizedSigner: signer,
        deposit: Value.from('1', 6),
        payee: payee.address,
        token,
      })

      expect(receipt.status).toBe('success')
      expect(opened.authorizedSigner).toBe(signer.address)
      expect(opened.salt).toBe(commitment)
      expect(opened.channelId).toBe(
        Channel.computeId(toChannel(opened), { chainId: chain.id }),
      )
      expect(
        AbiEvent.extractLogs(Abis.tip20ChannelReserve, receipt.logs, {
          eventName: 'SignerSnapshotCached',
          strict: true,
        }).map((log) => log.args),
      ).toEqual([
        { channelId: opened.channelId, commitment, signer: signer.address },
      ])
    },
  )

  test.runIf(signerSnapshots)(
    'behavior: account defaults salt to its commitment',
    async () => {
      const signer = await setupSigner()

      const { receipt, ...opened } = await Actions.channel.openSync(
        getClient({ account: signer }),
        {
          deposit: Value.from('1', 6),
          payee: payee.address,
          token,
        },
      )

      expect(receipt.status).toBe('success')
      expect(opened.payer).toBe(signer.address)
      expect(opened.salt).toBe(AccountConfig.getCommitment(signer.config))
    },
  )

  test.runIf(signerSnapshots)(
    "behavior: access key defaults salt to its parent's commitment",
    async () => {
      const signer = await setupSigner()
      const accessKey = Account.fromSecp256k1(Secp256k1.randomPrivateKey(), {
        access: signer,
      })
      await Actions.accessKey.authorizeSync(client, {
        account: signer,
        accessKey,
      })

      const { receipt, ...opened } = await Actions.channel.openSync(
        getClient({ account: accessKey }),
        {
          deposit: Value.from('1', 6),
          payee: payee.address,
          token,
        },
      )

      expect(receipt.status).toBe('success')
      expect(opened.payer).toBe(signer.address)
      expect(opened.salt).toBe(AccountConfig.getCommitment(signer.config))
    },
  )

  test.runIf(signerSnapshots)(
    'behavior: unregistered account defaults salt to its initial commitment',
    async () => {
      const signer = await setupSigner({ commit: false })
      const commitment = AccountConfig.getCommitment(signer.config)
      expect(
        await Actions.accounts.getConfigCommitment(client, {
          account: signer.address,
        }),
      ).toBe(zeroHash)

      // The open registers the account (TIP-1107) before the channel reserve runs.
      const { receipt, ...opened } = await Actions.channel.openSync(
        getClient({ account: signer }),
        {
          deposit: Value.from('1', 6),
          payee: payee.address,
          token,
        },
      )

      expect(receipt.status).toBe('success')
      expect(opened.payer).toBe(signer.address)
      expect(opened.salt).toBe(commitment)
      expect(
        await Actions.accounts.getConfigCommitment(client, {
          account: signer.address,
        }),
      ).toBe(commitment)
    },
  )

  test('behavior: configurable signer without a commitment', async () => {
    const signer = await setupSigner({ commit: false })

    const { receipt, ...opened } = await Actions.channel.openSync(client, {
      authorizedSigner: signer,
      deposit: Value.from('1', 6),
      payee: payee.address,
      token,
    })

    expect(receipt.status).toBe('success')
    expect(opened.authorizedSigner).toBe(signer.address)
    expect(opened.salt).toMatch(/^0x[0-9a-f]{64}$/)
    expect(opened.salt).not.toBe(zeroHash)
  })

  test('behavior: explicit salt wins', async () => {
    const signer = await setupSigner({ commit: false })
    const salt = Hex.fromNumber(0x1166, { size: 32 })

    const { receipt, ...opened } = await Actions.channel.openSync(client, {
      authorizedSigner: signer,
      deposit: Value.from('1', 6),
      payee: payee.address,
      salt,
      token,
    })

    expect(receipt.status).toBe('success')
    expect(opened.salt).toBe(salt)
  })

  test.runIf(signerSnapshots)('error: salt not signer commitment', async () => {
    const signer = await setupSigner()

    const error = await Actions.channel
      .openSync(client, {
        authorizedSigner: signer.address,
        deposit: Value.from('1', 6),
        payee: payee.address,
        salt: zeroHash,
        token,
      })
      .catch((error) => error)

    expect(error).toBeInstanceOf(
      Actions.channel.ChannelSaltNotSignerCommitmentError,
    )
    expect({
      commitment: error.commitment,
      signer: error.signer,
    }).toEqual({
      commitment: AccountConfig.getCommitment(signer.config),
      signer: signer.address,
    })
  })
})

describe('topUp', () => {
  test.runIf(signerSnapshots)('error: signer config changed', async () => {
    const signer = await setupSigner()
    const { receipt: _, ...opened } = await Actions.channel.openSync(client, {
      authorizedSigner: signer,
      deposit: Value.from('1', 6),
      payee: payee.address,
      token,
    })
    await Actions.accounts.updateConfigSync(client, {
      account: signer,
      currentConfig: signer.config,
      nextConfig: { owners: signer.config.owners, threshold: 1 },
    })

    const error = await Actions.channel
      .topUpSync(client, {
        additionalDeposit: Value.from('1', 6),
        channel: toChannel(opened),
      })
      .catch((error) => error)

    expect(error).toBeInstanceOf(
      Actions.channel.ChannelSignerConfigChangedError,
    )
    expect(error.signer).toBe(signer.address)
  })
})

/**
 * Funds a new configurable account and, by default, commits its first config.
 * A committed signer is returned as an account of its committed config.
 */
async function setupSigner(options: { commit?: boolean | undefined } = {}) {
  const { commit = true } = options
  signerId += 1
  const owners = [accounts[17], accounts[18]]
  const salt = Hex.fromNumber(0x116600 + signerId, { size: 32 })
  const signer = Account.fromConfig({
    address: 'infer',
    owners,
    salt,
    threshold: 2,
  })
  await Actions.token.transferSync(client, {
    amount: { formatted: '100' },
    to: signer.address,
    token: feeToken,
  })
  if (!commit) return signer
  const { config } = await Actions.accounts.updateConfigSync(client, {
    account: signer,
    currentConfig: signer.config,
    nextConfig: {
      owners: signer.config.owners,
      threshold: signer.config.threshold,
    },
  })
  return Account.fromConfig({
    address: signer.address,
    owners,
    salt,
    threshold: 2,
    version: config.version,
  })
}

function toChannel(opened: Channel.from.Value) {
  return Channel.from({
    authorizedSigner: opened.authorizedSigner,
    expiringNonceHash: opened.expiringNonceHash,
    operator: opened.operator,
    payee: opened.payee,
    payer: opened.payer,
    salt: opened.salt,
    token: opened.token,
  })
}
