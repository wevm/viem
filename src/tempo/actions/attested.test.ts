import { P256, PublicKey } from 'ox'
import { keccak256 } from 'viem'
import { Addresses } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import * as actions from './index.js'

// Inputs of the node's registry tests: tempoxyz/tempo@c507923,
// `crates/precompiles/src/attested_key_registry/mod.rs` (`OWNER`, `GUARDIAN`, `LIFETIME`,
// `create_call`, `program_key`, `dev_measurement`), and the dev PCRs of
// `docs/exp/attested-signers/CONTRACT.md`.
const owner = `0x${'01'.repeat(20)}` as const
const guardian = `0x${'02'.repeat(20)}` as const
const salt = `0x${'55'.repeat(32)}` as const
const policyId = `0x${'a1'.repeat(32)}` as const
// `DEV_MEASUREMENT`, which tempoxyz/id `services/attested-signer/src/encoding.rs`
// (`dev_policy_id_and_measurement`) asserts as `0x79415a84…`.
const measurement = keccak256(
  `0x${'01'.repeat(48)}${'02'.repeat(48)}${'03'.repeat(48)}`,
)
// `program_key(1)`: the P256 key of the private key `[1; 32]`.
const programKey = PublicKey.toHex(
  P256.getPublicKey({ privateKey: `0x${'01'.repeat(32)}` }),
)

describe('call', () => {
  test('cancelProposal', () => {
    const { abi: _, ...call } = actions.attested.cancelProposal.call({
      entry: measurement,
      policyId,
    })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
          "0x79415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd69",
          false,
        ],
        "data": "0xf60d8581a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a179415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd690000000000000000000000000000000000000000000000000000000000000000",
        "functionName": "cancelProposal",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('cancelProposal: anchor', () => {
    const { args } = actions.attested.cancelProposal.call({
      entry: measurement,
      isAnchor: true,
      policyId,
    })
    expect(args[2]).toMatchInlineSnapshot(`true`)
  })

  test('computePolicyId', () => {
    const { abi: _, ...call } = actions.attested.computePolicyId.call({
      creator: owner,
      salt,
    })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0x0101010101010101010101010101010101010101",
          "0x5555555555555555555555555555555555555555555555555555555555555555",
        ],
        "data": "0xd9954df400000000000000000000000001010101010101010101010101010101010101015555555555555555555555555555555555555555555555555555555555555555",
        "functionName": "computePolicyId",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('createPolicy', () => {
    const { abi: _, ...call } = actions.attested.createPolicy.call({
      delay: 0,
      guardian,
      maxKeyLifetime: 3_600,
      measurements: [measurement],
      owner,
      salt,
      scheme: 0xfe,
    })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0x5555555555555555555555555555555555555555555555555555555555555555",
          254,
          "0x0101010101010101010101010101010101010101",
          "0x0202020202020202020202020202020202020202",
          0n,
          3600n,
          [
            "0x79415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd69",
          ],
          [],
        ],
        "data": "0x132f2ec3555555555555555555555555555555555555555555555555555555555555555500000000000000000000000000000000000000000000000000000000000000fe0000000000000000000000000101010101010101010101010101010101010101000000000000000000000000020202020202020202020202020202020202020200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e1000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000000179415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd690000000000000000000000000000000000000000000000000000000000000000",
        "functionName": "createPolicy",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('createPolicy: defaults', () => {
    const { args } = actions.attested.createPolicy.call({
      delay: 86_400,
      maxKeyLifetime: 600,
      measurements: [measurement],
      owner,
      salt,
      scheme: 1,
    })
    expect(args).toMatchInlineSnapshot(`
      [
        "0x5555555555555555555555555555555555555555555555555555555555555555",
        1,
        "0x0101010101010101010101010101010101010101",
        "0x0000000000000000000000000000000000000000",
        86400n,
        600n,
        [
          "0x79415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd69",
        ],
        [],
      ]
    `)
  })

  test('getKeyValidUntil', () => {
    const { abi: _, ...call } = actions.attested.getKeyValidUntil.call({
      policyId,
      programKey,
    })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
          "0x6ff03b949241ce1dadd43519e6960e0a85b41a69a05c328103aa2bce1594ca16",
          "0x3c4f753a55bf01dc53f6c0b0c7eee78b40c6ff7d25a96e2282b989cef71c144a",
        ],
        "data": "0x89c45cf8a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a16ff03b949241ce1dadd43519e6960e0a85b41a69a05c328103aa2bce1594ca163c4f753a55bf01dc53f6c0b0c7eee78b40c6ff7d25a96e2282b989cef71c144a",
        "functionName": "keyValidUntil",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('getMeasurementActiveAt', () => {
    const { abi: _, ...call } = actions.attested.getMeasurementActiveAt.call({
      measurement,
      policyId,
    })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
          "0x79415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd69",
        ],
        "data": "0xe9324bd1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a179415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd69",
        "functionName": "measurementActiveAt",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('getPolicy', () => {
    const { abi: _, ...call } = actions.attested.getPolicy.call({ policyId })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
        ],
        "data": "0x115f746ca1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
        "functionName": "policy",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('pause', () => {
    const { abi: _, ...call } = actions.attested.pause.call({ policyId })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
        ],
        "data": "0xed56531aa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
        "functionName": "pause",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('proposeMeasurement', () => {
    const { abi: _, ...call } = actions.attested.proposeMeasurement.call({
      measurement,
      policyId,
    })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
          "0x79415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd69",
        ],
        "data": "0x013baaa5a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a179415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd69",
        "functionName": "proposeMeasurement",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('registerKey', () => {
    const { abi: _, ...call } = actions.attested.registerKey.call({
      document: '0xd284',
      policyId,
      programKey,
      slot: 3,
    })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
          3,
          "0xd284",
          "0x6ff03b949241ce1dadd43519e6960e0a85b41a69a05c328103aa2bce1594ca16",
          "0x3c4f753a55bf01dc53f6c0b0c7eee78b40c6ff7d25a96e2282b989cef71c144a",
          0n,
        ],
        "data": "0xd2932210a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000c06ff03b949241ce1dadd43519e6960e0a85b41a69a05c328103aa2bce1594ca163c4f753a55bf01dc53f6c0b0c7eee78b40c6ff7d25a96e2282b989cef71c144a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002d284000000000000000000000000000000000000000000000000000000000000",
        "functionName": "registerKey",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('registerKey: program key without prefix', () => {
    const prefixed = actions.attested.registerKey.call({
      document: '0xd284',
      lifetime: 300,
      policyId,
      programKey,
      slot: 0,
    })
    const unprefixed = actions.attested.registerKey.call({
      document: '0xd284',
      lifetime: 300,
      policyId,
      programKey: `0x${programKey.slice(4)}`,
      slot: 0,
    })
    expect(unprefixed.args).toEqual(prefixed.args)
  })

  test('removeMeasurement', () => {
    const { abi: _, ...call } = actions.attested.removeMeasurement.call({
      measurement,
      policyId,
    })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
          "0x79415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd69",
        ],
        "data": "0x7056429aa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a179415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd69",
        "functionName": "removeMeasurement",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('revokeKeys', () => {
    const { abi: _, ...call } = actions.attested.revokeKeys.call({ policyId })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
        ],
        "data": "0x030b10fda1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
        "functionName": "revokeKeys",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('setMaxKeyLifetime', () => {
    const { abi: _, ...call } = actions.attested.setMaxKeyLifetime.call({
      maxKeyLifetime: 3_600,
      policyId,
    })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
          3600n,
        ],
        "data": "0xb0c48e3ea1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a10000000000000000000000000000000000000000000000000000000000000e10",
        "functionName": "setMaxKeyLifetime",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })

  test('unpause', () => {
    const { abi: _, ...call } = actions.attested.unpause.call({ policyId })
    expect(call).toMatchInlineSnapshot(`
      {
        "address": "0xA77e570000000000000000000000000000000000",
        "args": [
          "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
        ],
        "data": "0x2f4dae9fa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
        "functionName": "unpause",
        "to": "0xA77e570000000000000000000000000000000000",
      }
    `)
  })
})

test('registry address', () => {
  expect(Addresses.attestedKeyRegistry).toMatchInlineSnapshot(
    `"0xA77e570000000000000000000000000000000000"`,
  )
})
