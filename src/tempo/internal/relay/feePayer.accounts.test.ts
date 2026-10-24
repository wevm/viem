import { Hex, Rlp, Signature } from 'ox'
import {
  AccountConfig,
  KeyAuthorization,
  SignatureEnvelope,
  TxEnvelopeTempo,
} from 'ox/tempo'
import { generatePrivateKey } from 'viem/accounts'
import { Account, Actions, Addresses, Relay, Transaction } from 'viem/tempo'
import { expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'

const userAccount = Tempo.accounts[9]!
const feePayerAccount = Tempo.accounts[0]!
const recipient = Tempo.accounts[7]!

const caller = Tempo.getClient({ chain: Tempo.chain })
const transfer = Actions.token.transfer.call(caller, {
  amount: 1n,
  to: recipient.address,
  token: Tempo.addresses.alphaUsd,
})
const relay = Relay.create({
  client: caller,
  plugins: [Relay.feePayer({ account: feePayerAccount })],
})

test('sponsors a configurable fee-payer handoff without an encoded sender', async () => {
  const { account, serialized } = await configurableHandoff({
    config: configurableConfig([userAccount.address], 1),
    owners: [userAccount],
  })
  // Fee-payer serialization writes the `0x00` marker instead of a sender for configurable signatures.
  expect(
    (Rlp.toHex(Hex.slice(serialized, 1)) as readonly Hex.Hex[])[11],
  ).toMatchInlineSnapshot(`"0x00"`)

  const result = (await relay.request({
    method: 'eth_signRawTransaction',
    params: [serialized],
  })) as `0x76${string}`
  expect(Transaction.deserialize(result).from).toBe(account)
})

test('rejects configurable approvals below quorum', async () => {
  const { serialized } = await configurableHandoff({
    config: configurableConfig([userAccount.address, recipient.address], 2),
    owners: [userAccount],
  })

  await expect(
    relay.request({ method: 'eth_signRawTransaction', params: [serialized] }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Configurable account approvals do not reach quorum.]`,
  )
})

test('rejects a configurable signature from a non-owner', async () => {
  const { serialized } = await configurableHandoff({
    config: configurableConfig([recipient.address], 1),
    owners: [userAccount],
  })

  await expect(
    relay.request({ method: 'eth_signRawTransaction', params: [serialized] }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Invalid operation approval: signature is from non-owner 0x9ac4fdc8e5d72aaade30f9ff52d392d60c68a64a.]`,
  )
})

test('rejects a configurable config that does not derive its account', async () => {
  const { serialized } = await configurableHandoff({
    account: `0x${'ab'.repeat(20)}`,
    config: configurableConfig([userAccount.address], 1),
    owners: [userAccount],
  })

  await expect(
    relay.request({ method: 'eth_signRawTransaction', params: [serialized] }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Initial account config does not match the configurable account.]`,
  )
})

test('sponsors a same-transaction authorization its configurable owners approved', async () => {
  const { serialized, victim } = await configurableKeyAuthorization({
    config: configurableConfig([userAccount.address], 1),
    signer: userAccount,
  })

  const result = (await relay.request({
    method: 'eth_signRawTransaction',
    params: [serialized],
  })) as `0x76${string}`
  expect(Transaction.deserialize(result).from).toBe(victim)
})

test('rejects a same-transaction authorization a non-owner signed for a configurable account', async () => {
  const { serialized } = await configurableKeyAuthorization({
    config: configurableConfig([recipient.address], 1),
    signer: userAccount,
  })

  await expect(
    relay.request({ method: 'eth_signRawTransaction', params: [serialized] }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Invalid operation approval: signature is from non-owner 0x9ac4fdc8e5d72aaade30f9ff52d392d60c68a64a.]`,
  )
})

/** Returns a version-zero configurable account config with equally weighted owners. */
function configurableConfig(
  owners: readonly `0x${string}`[],
  threshold: number,
): AccountConfig.Config {
  return {
    owners: owners.map((owner) => ({ owner, weight: 1 })),
    salt: `0x${'00'.repeat(32)}`,
    threshold,
    version: 0n,
  }
}

/** Returns a fee-payer handoff signed by `owners` for a configurable account derived from `config`. */
// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function configurableHandoff(options: configurableHandoff.Options) {
  const { config, owners } = options
  const account =
    options.account ??
    AccountConfig.getAddress(config, {
      factory: Addresses.configurableAccountRecoveryFactory,
    })
  const envelope = TxEnvelopeTempo.from({
    calls: [transfer],
    chainId: Tempo.chain.id,
    feePayerSignature: null,
    gas: 100_000n,
    maxFeePerGas: 20_000_000_000n,
    maxPriorityFeePerGas: 1n,
    nonce: 0n,
    nonceKey: 0n,
    validBefore: Math.floor(Date.now() / 1000) + 600,
  })
  const hash = AccountConfig.getSignPayload({
    account,
    config,
    payload: TxEnvelopeTempo.getSignPayload(envelope),
  })
  const signature = SignatureEnvelope.from({
    account,
    config,
    signatures: await Promise.all(
      owners.map(async (owner) => ({
        signature: Signature.from(await owner.sign({ hash })),
        type: 'secp256k1' as const,
      })),
    ),
    type: 'configurable',
  })
  return {
    account,
    serialized: TxEnvelopeTempo.serialize(envelope, {
      format: 'feePayer',
      signature,
    }),
  }
}

declare namespace configurableHandoff {
  type Options = {
    /** Account named by the signature; defaults to the address `config` derives. */
    account?: `0x${string}` | undefined
    /** Account configuration witness carried by the signature. */
    config: AccountConfig.Config
    /** Accounts whose approvals the signature carries. */
    owners: readonly {
      sign: (options: { hash: Hex.Hex }) => Promise<Hex.Hex>
    }[]
  }
}

/** Returns a keychain handoff whose same-transaction key authorization `signer` approves for the account `config` derives. */
// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function configurableKeyAuthorization(
  options: configurableKeyAuthorization.Options,
) {
  const { config, signer } = options
  const victim = AccountConfig.getAddress(config, {
    factory: Addresses.configurableAccountRecoveryFactory,
  })
  const accessKey = Account.fromSecp256k1(generatePrivateKey())
  const unsigned = KeyAuthorization.from({
    account: victim,
    address: accessKey.address,
    chainId: BigInt(Tempo.chain.id),
    type: 'secp256k1',
  })
  const keyAuthorization = KeyAuthorization.from({
    ...unsigned,
    signature: SignatureEnvelope.from({
      account: victim,
      config,
      signatures: [
        {
          signature: Signature.from(
            await signer.sign({
              hash: AccountConfig.getSignPayload({
                account: victim,
                config,
                payload: KeyAuthorization.getSignPayload(unsigned),
              }),
            }),
          ),
          type: 'secp256k1',
        },
      ],
      type: 'configurable',
    }),
  })
  const envelope = TxEnvelopeTempo.from({
    calls: [transfer],
    chainId: Tempo.chain.id,
    feePayerSignature: null,
    gas: 1_000_000n,
    keyAuthorization,
    maxFeePerGas: 20_000_000_000n,
    maxPriorityFeePerGas: 1n,
    nonce: 0n,
    nonceKey: 1n,
    validBefore: Math.floor(Date.now() / 1000) + 600,
  })
  const signature = SignatureEnvelope.from({
    inner: {
      signature: Signature.from(
        await accessKey.sign({
          hash: TxEnvelopeTempo.getSignPayload(envelope, { from: victim }),
        }),
      ),
      type: 'secp256k1',
    },
    type: 'keychain',
    userAddress: victim,
    version: 'v2',
  })

  return {
    serialized: TxEnvelopeTempo.serialize(envelope, {
      format: 'feePayer',
      sender: victim,
      signature,
    }),
    victim,
  }
}

declare namespace configurableKeyAuthorization {
  type Options = {
    /** Account configuration witness carried by the authorization signature. */
    config: AccountConfig.Config
    /** Account whose approval the authorization signature carries. */
    signer: { sign: (options: { hash: Hex.Hex }) => Promise<Hex.Hex> }
  }
}
