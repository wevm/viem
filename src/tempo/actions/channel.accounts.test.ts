import { AccountConfig } from 'ox/tempo'
import { parseEventLogs, parseUnits, toHex, zeroHash } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { Abis, Channel } from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  chain,
  feeToken,
  getClient,
  setupToken,
} from '~test/tempo/config.js'
import * as Account from '../Account.js'
import * as actions from './index.js'

const payer = accounts[0]
const payee = accounts[1]

const payerClient = getClient({
  account: payer,
  chain: chain.extend({ feeToken }),
})

/**
 * Whether the test chain accepts configurable voucher signers (T15, TIP-1166).
 * Earlier forks reject a registered configurable signer with `RootKeyRetired`.
 */
const signerSnapshots =
  Number(/^T(\d+)$/.exec(import.meta.env.VITE_TEMPO_HARDFORK ?? '')?.[1]) >= 15

let token: `0x${string}`
let signerId = 0

beforeAll(async () => {
  ;({ token } = await setupToken(payerClient, {
    name: 'Channel Signer Test',
    symbol: 'CST',
  }))
})

describe('getOpenSalt', () => {
  test('behavior: configurable signer without a commitment', async () => {
    const signer = await setupSigner({ commit: false })

    const [salt_1, salt_2] = await Promise.all([
      actions.channel.getOpenSalt(payerClient, { signer }),
      actions.channel.getOpenSalt(payerClient, { signer: signer.address }),
    ])

    expect(salt_1).toMatch(/^0x[0-9a-f]{64}$/)
    expect(salt_1).not.toBe(zeroHash)
    expect(salt_2).not.toBe(salt_1)
  })

  test('behavior: configurable signer with a commitment', async () => {
    const signer = await setupSigner()

    const [byAccount, byAddress] = await Promise.all([
      actions.channel.getOpenSalt(payerClient, { signer }),
      actions.channel.getOpenSalt(payerClient, { signer: signer.address }),
    ])

    expect(byAccount).toBe(AccountConfig.getCommitment(signer.config))
    expect(byAddress).toBe(byAccount)
  })

  test('behavior: root account', async () => {
    const salt = await actions.channel.getOpenSalt(payerClient, {
      signer: payer,
    })

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

      const { receipt, ...opened } = await actions.channel.openSync(
        payerClient,
        {
          authorizedSigner: signer,
          deposit: parseUnits('1', 6),
          payee: payee.address,
          token,
        },
      )

      expect(receipt.status).toBe('success')
      expect(opened.authorizedSigner).toBe(signer.address)
      expect(opened.salt).toBe(commitment)
      expect(opened.channelId).toBe(
        Channel.computeId(toChannel(opened), { chainId: chain.id }),
      )
      if (signerSnapshots)
        expect(
          parseEventLogs({
            abi: Abis.tip20ChannelReserve,
            eventName: 'SignerSnapshotCached',
            logs: receipt.logs,
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
      await actions.token.transferSync(payerClient, {
        amount: parseUnits('10', 6),
        to: signer.address,
        token,
      })

      const { receipt, ...opened } = await actions.channel.openSync(
        getClient({ account: signer, chain: chain.extend({ feeToken }) }),
        {
          deposit: parseUnits('1', 6),
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
      const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
        access: signer,
      })
      await actions.accessKey.authorizeSync(getClient(), {
        account: signer,
        accessKey,
      })
      await actions.token.transferSync(payerClient, {
        amount: parseUnits('10', 6),
        to: signer.address,
        token,
      })

      const { receipt, ...opened } = await actions.channel.openSync(
        getClient({ account: accessKey, chain: chain.extend({ feeToken }) }),
        {
          deposit: parseUnits('1', 6),
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
      await actions.token.transferSync(payerClient, {
        amount: parseUnits('10', 6),
        to: signer.address,
        token,
      })
      const commitment = AccountConfig.getCommitment(signer.config)
      expect(
        await actions.accounts.getConfigCommitment(payerClient, {
          account: signer.address,
        }),
      ).toBe(zeroHash)

      // The open registers the account (TIP-1107) before the channel reserve runs.
      const { receipt, ...opened } = await actions.channel.openSync(
        getClient({ account: signer, chain: chain.extend({ feeToken }) }),
        {
          deposit: parseUnits('1', 6),
          payee: payee.address,
          token,
        },
      )

      expect(receipt.status).toBe('success')
      expect(opened.payer).toBe(signer.address)
      expect(opened.salt).toBe(commitment)
      expect(
        await actions.accounts.getConfigCommitment(payerClient, {
          account: signer.address,
        }),
      ).toBe(commitment)
    },
  )

  test('behavior: configurable signer without a commitment', async () => {
    const signer = await setupSigner({ commit: false })

    const { receipt, ...opened } = await actions.channel.openSync(payerClient, {
      authorizedSigner: signer,
      deposit: parseUnits('1', 6),
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
    const salt = toHex(0x1166, { size: 32 })

    const { receipt, ...opened } = await actions.channel.openSync(payerClient, {
      authorizedSigner: signer,
      deposit: parseUnits('1', 6),
      payee: payee.address,
      salt,
      token,
    })

    expect(receipt.status).toBe('success')
    expect(opened.salt).toBe(salt)
  })

  test.runIf(signerSnapshots)('error: salt not signer commitment', async () => {
    const signer = await setupSigner()

    const error = await actions.channel
      .openSync(payerClient, {
        authorizedSigner: signer.address,
        deposit: parseUnits('1', 6),
        payee: payee.address,
        salt: zeroHash,
        token,
      })
      .catch((error) => error)

    expect(error).toBeInstanceOf(
      actions.channel.ChannelSaltNotSignerCommitmentError,
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
    const { receipt: _, ...opened } = await actions.channel.openSync(
      payerClient,
      {
        authorizedSigner: signer,
        deposit: parseUnits('1', 6),
        payee: payee.address,
        token,
      },
    )
    await actions.accounts.updateConfigSync(getClient(), {
      account: signer,
      currentConfig: signer.config,
      nextConfig: { owners: signer.config.owners, threshold: 1 },
    })

    const error = await actions.channel
      .topUpSync(payerClient, {
        additionalDeposit: parseUnits('1', 6),
        channel: toChannel(opened),
      })
      .catch((error) => error)

    expect(error).toBeInstanceOf(
      actions.channel.ChannelSignerConfigChangedError,
    )
    expect(error.signer).toBe(signer.address)
  })
})

/**
 * Funds a new configurable account and, by default, commits its first config.
 * A committed signer is returned as an account of its committed config.
 */
async function setupSigner(parameters: { commit?: boolean } = {}) {
  const { commit = true } = parameters
  signerId += 1
  const owners = [accounts[17], accounts[18]]
  const salt = toHex(0x116600 + signerId, { size: 32 })
  const signer = Account.fromConfig({
    address: 'infer',
    owners,
    salt,
    threshold: 2,
  })
  await actions.token.transferSync(payerClient, {
    amount: { formatted: '100' },
    to: signer.address,
    token: feeToken,
  })
  if (!commit) return signer
  const { config } = await actions.accounts.updateConfigSync(getClient(), {
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

function toChannel(opened: Channel.from.Value & Record<string, unknown>) {
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
