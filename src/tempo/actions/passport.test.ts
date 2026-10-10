import { AbiFunction, Hex, TypedData } from 'ox'
import { createClient, custom } from 'viem'
import { MultisigConfig, Passport, ZkSignature } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, getClient, nodeEnv } from '~test/tempo/config.js'
import * as Abis from '../Abis.js'
import { nativeMultisig, nativeMultisigFactory } from '../Addresses.js'
import * as actions from './index.js'

// The Key Publisher precompile activates at T14.
const hardfork = import.meta.env.VITE_TEMPO_HARDFORK
const supported = nodeEnv === 'localnet' && (!hardfork || hardfork === 'Tnext')

const client = getClient({ account: accounts[0] })

const issuer = Passport.hashIssuer('UTO')
const keyHash = Passport.getRoot({
  leaves: [Passport.hashLeaf(`0x${'c1'.repeat(256)}`)],
})
const addressSeed = Passport.getAddressSeed({
  birthDate: '740812',
  documentNumber: 'L898902C3',
  salt: `0x${'01'.repeat(31)}`,
})
// Proof checks are stubbed: `verifyProof` accepts only the expected public input.
const proof = `0x${'04'.repeat(256)}` as const

// The ZK test image has no native multisig precompile, so its commitment read is stubbed.
function withCommitment(commitment: Hex.Hex) {
  const getConfigCommitment = AbiFunction.fromAbi(
    Abis.nativeMultisig,
    'getConfigCommitment',
  )
  return createClient({
    chain: client.chain,
    transport: custom({
      async request({ method, params }) {
        const [call] = (params ?? []) as [{ to?: string }]
        if (
          method === 'eth_call' &&
          call?.to?.toLowerCase() === nativeMultisig.toLowerCase()
        )
          return AbiFunction.encodeResult(getConfigCommitment, commitment)
        return client.request({ method, params } as never)
      },
    }),
  })
}
const uncommitted = withCommitment(`0x${'00'.repeat(32)}`)

async function setup(salt: number) {
  const { publisherId } = await actions.keyPublisher.createSync(client, {
    keys: [{ issuer, keyHashes: [keyHash] }],
    salt: Hex.fromNumber(salt, { size: 32 }),
  })
  const binding = {
    addressSeed,
    issuedAt: Math.floor(Date.now() / 1000),
    issuer,
    keyHash,
    proof,
    publisherId,
    scheme: Passport.scheme,
  } satisfies ZkSignature.MessageSignature
  const config = MultisigConfig.from({
    owners: [
      { owner: accounts[0].address, weight: 2 },
      { owner: ZkSignature.getAddress(binding), weight: 1 },
    ],
    threshold: 2,
  })
  const account = MultisigConfig.getAddress(config, {
    factory: nativeMultisigFactory,
  })
  const publicInput = Passport.getPublicInput({
    ...binding,
    payload: TypedData.getSignPayload(
      Passport.getBindingTypedData({ account, chainId: client.chain.id }),
    ),
  })
  const verifyProof = (parameters: { proof: Hex.Hex; publicInput: Hex.Hex }) =>
    parameters.proof === proof && parameters.publicInput === publicInput
  return { account, binding, config, publisherId, verifyProof }
}

describe.runIf(supported)('verify', () => {
  test('default', async () => {
    const { account, binding, config, verifyProof } = await setup(1000)
    expect(
      await actions.passport.verify(uncommitted, {
        account,
        binding,
        config,
        verifyProof,
      }),
    ).toBe(true)
  })

  test('behavior: serialized binding', async () => {
    const { account, binding, config, verifyProof } = await setup(1001)
    expect(
      await actions.passport.verify(uncommitted, {
        account,
        binding: ZkSignature.serializeMessage(binding),
        config,
        verifyProof,
      }),
    ).toBe(true)
  })

  test('behavior: proof rejected', async () => {
    const { account, binding, config } = await setup(1002)
    expect(
      await actions.passport.verify(uncommitted, {
        account,
        binding,
        config,
        verifyProof: () => false,
      }),
    ).toBe(false)
  })

  test('behavior: binding names another account', async () => {
    const { binding, config, verifyProof } = await setup(1003)
    const other = MultisigConfig.from({ ...config, threshold: 1 })
    expect(
      await actions.passport.verify(uncommitted, {
        account: MultisigConfig.getAddress(other, {
          factory: nativeMultisigFactory,
        }),
        binding,
        config: other,
        verifyProof,
      }),
    ).toBe(false)
  })

  test('behavior: passport is not an owner', async () => {
    const { binding } = await setup(1004)
    const config = MultisigConfig.from({
      owners: [{ owner: accounts[0].address, weight: 1 }],
      threshold: 1,
    })
    const account = MultisigConfig.getAddress(config, {
      factory: nativeMultisigFactory,
    })
    const publicInput = Passport.getPublicInput({
      ...binding,
      payload: TypedData.getSignPayload(
        Passport.getBindingTypedData({ account, chainId: client.chain.id }),
      ),
    })
    expect(
      await actions.passport.verify(uncommitted, {
        account,
        binding,
        config,
        verifyProof: (parameters) => parameters.publicInput === publicInput,
      }),
    ).toBe(false)
  })

  test('behavior: configuration does not derive the account', async () => {
    const { account, binding, config, verifyProof } = await setup(1005)
    expect(
      await actions.passport.verify(uncommitted, {
        account,
        binding,
        config: MultisigConfig.from({
          ...config,
          salt: `0x${'09'.repeat(32)}`,
        }),
        verifyProof,
      }),
    ).toBe(false)
  })

  test('behavior: root revoked', async () => {
    const { account, binding, config, publisherId, verifyProof } =
      await setup(1007)
    await actions.keyPublisher.revokeKeySync(client, {
      issuer,
      keyHash,
      publisherId,
    })
    expect(
      await actions.passport.verify(uncommitted, {
        account,
        binding,
        config,
        verifyProof,
      }),
    ).toBe(false)
  })

  test('behavior: root never listed', async () => {
    const { account, binding, config } = await setup(1008)
    expect(
      await actions.passport.verify(uncommitted, {
        account,
        binding: { ...binding, publisherId: `0x${'07'.repeat(32)}` },
        config,
        verifyProof: () => true,
      }),
    ).toBe(false)
  })

  test('behavior: issued in the future', async () => {
    const { account, binding, config } = await setup(1009)
    expect(
      await actions.passport.verify(uncommitted, {
        account,
        binding: { ...binding, issuedAt: binding.issuedAt + 3600 },
        config,
        verifyProof: () => true,
      }),
    ).toBe(false)
  })

  test('behavior: another scheme', async () => {
    const { account, binding, config } = await setup(1010)
    expect(
      await actions.passport.verify(uncommitted, {
        account,
        binding: { ...binding, scheme: 1 },
        config,
        verifyProof: () => true,
      }),
    ).toBe(false)
  })

  test('behavior: malformed binding', async () => {
    const { account, config, verifyProof } = await setup(1011)
    expect(
      await actions.passport.verify(uncommitted, {
        account,
        binding: '0x01',
        config,
        verifyProof,
      }),
    ).toBe(false)
  })

  test('behavior: updated account with the current configuration', async () => {
    const { account, binding, config, verifyProof } = await setup(1012)
    expect(
      await actions.passport.verify(
        withCommitment(MultisigConfig.getCommitment(config)),
        { account, binding, config, verifyProof },
      ),
    ).toBe(true)
  })

  test('behavior: updated account with a stale configuration', async () => {
    const { account, binding, config, verifyProof } = await setup(1013)
    expect(
      await actions.passport.verify(withCommitment(`0x${'0a'.repeat(32)}`), {
        account,
        binding,
        config,
        verifyProof,
      }),
    ).toBe(false)
  })
})
