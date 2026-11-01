import { P256, PublicKey } from 'ox'
import { keccak256 } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { describe, expect, test } from 'vitest'
import { accounts, chain, feeToken, getClient } from '~test/tempo/config.js'
import * as actions from './index.js'

// Runs against a node with the Attested Key Registry (tempoxyz/tempo#8821, gated on T14).
// VITE_TEMPO_ACCOUNTS=true VITE_TEMPO_ATTESTED=true VITE_TEMPO_TAG=pr-8821 \
//   pnpm test --project tempo-accounts src/tempo/actions/attested.accounts.test.ts
const enabled = import.meta.env.VITE_TEMPO_ATTESTED === 'true'

const account = accounts[0]
const client = getClient({ account, chain: chain.extend({ feeToken }) })

// The dev scheme of the node, which accepts documents from the public dev root on chain 1337 only.
const schemeNitroDev = 0xfe
// `DEV_MEASUREMENT`, as tempoxyz/id `services/attested-signer/src/encoding.rs`
// (`dev_policy_id_and_measurement`) asserts it.
const measurement =
  '0x79415a8460aad0c8ae8d2eb4b4c7a7cb2d4d546b453e170add25071572b0fd69'
const otherMeasurement = keccak256('0x01')

function randomSalt() {
  return generatePrivateKey()
}

describe.runIf(enabled)('attested', () => {
  test('computePolicyId', async () => {
    // Vector from tempoxyz/id `services/attested-signer/src/encoding.rs`
    // (`dev_policy_id_and_measurement`).
    await expect(
      actions.attested.computePolicyId(client, {
        creator: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        salt: '0x47f68d242efeca60f5fed1c5436bcb5a5e4f5d4af98e8a29ca67af4c9060b907',
      }),
    ).resolves.toBe(
      '0xadbe28853696826a0cd6f2dcc61811025e4d954b6be3912b44aa51ae65a0339c',
    )
  })

  test('createPolicySync + getPolicy', async () => {
    const salt = randomSalt()

    const { policyId, receipt, ...result } =
      await actions.attested.createPolicySync(client, {
        delay: 0,
        maxKeyLifetime: 3_600,
        measurements: [measurement],
        salt,
        scheme: schemeNitroDev,
      })

    expect(receipt.status).toBe('success')
    expect(policyId).toBe(
      await actions.attested.computePolicyId(client, {
        creator: account.address,
        salt,
      }),
    )
    expect(result).toEqual({
      creator: account.address,
      delay: 0n,
      guardian: '0x0000000000000000000000000000000000000000',
      maxKeyLifetime: 3_600n,
      owner: account.address,
      scheme: schemeNitroDev,
    })
    expect(
      await actions.attested.getPolicy(client, { policyId }),
    ).toMatchInlineSnapshot(`
      {
        "delay": 0,
        "epoch": 0,
        "guardian": "0x0000000000000000000000000000000000000000",
        "maxKeyLifetime": 3600,
        "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "paused": false,
        "pendingDelay": 0,
        "pendingDelayAt": 0,
        "pendingMaxKeyLifetime": 0,
        "pendingMaxKeyLifetimeAt": 0,
        "scheme": 254,
      }
    `)
  })

  test('proposeMeasurementSync + cancelProposalSync', async () => {
    const { policyId } = await actions.attested.createPolicySync(client, {
      delay: 3_600,
      maxKeyLifetime: 3_600,
      measurements: [measurement],
      salt: randomSalt(),
      scheme: schemeNitroDev,
    })

    const { activeAt } = await actions.attested.proposeMeasurementSync(client, {
      measurement: otherMeasurement,
      policyId,
    })
    const block = await client.request({
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    })
    expect(Number(activeAt)).toBeGreaterThanOrEqual(
      Number(block!.timestamp) + 3_600 - 1,
    )
    expect(
      await actions.attested.getMeasurementActiveAt(client, {
        measurement: otherMeasurement,
        policyId,
      }),
    ).toBe(Number(activeAt))

    const { entry, isAnchor } = await actions.attested.cancelProposalSync(
      client,
      { entry: otherMeasurement, policyId },
    )
    expect({ entry, isAnchor }).toEqual({
      entry: otherMeasurement,
      isAnchor: false,
    })
    expect(
      await actions.attested.getMeasurementActiveAt(client, {
        measurement: otherMeasurement,
        policyId,
      }),
    ).toBe(0)
  })

  test('removeMeasurementSync + revokeKeysSync', async () => {
    const { policyId } = await actions.attested.createPolicySync(client, {
      delay: 0,
      maxKeyLifetime: 3_600,
      measurements: [measurement, otherMeasurement],
      salt: randomSalt(),
      scheme: schemeNitroDev,
    })

    const removed = await actions.attested.removeMeasurementSync(client, {
      measurement: otherMeasurement,
      policyId,
    })
    expect(removed.epoch).toBe(1n)

    const revoked = await actions.attested.revokeKeysSync(client, { policyId })
    expect(revoked.epoch).toBe(2n)
    expect((await actions.attested.getPolicy(client, { policyId })).epoch).toBe(
      2,
    )
  })

  test('pauseSync + unpauseSync', async () => {
    const { policyId } = await actions.attested.createPolicySync(client, {
      delay: 0,
      maxKeyLifetime: 3_600,
      measurements: [measurement],
      salt: randomSalt(),
      scheme: schemeNitroDev,
    })

    expect(
      (await actions.attested.pauseSync(client, { policyId })).paused,
    ).toBe(true)
    expect(
      (await actions.attested.getPolicy(client, { policyId })).paused,
    ).toBe(true)
    expect(
      (await actions.attested.unpauseSync(client, { policyId })).paused,
    ).toBe(false)
  })

  test('setMaxKeyLifetimeSync: a decrease applies at once', async () => {
    const { policyId } = await actions.attested.createPolicySync(client, {
      delay: 3_600,
      maxKeyLifetime: 3_600,
      measurements: [measurement],
      salt: randomSalt(),
      scheme: schemeNitroDev,
    })

    const { newMaxKeyLifetime } = await actions.attested.setMaxKeyLifetimeSync(
      client,
      {
        maxKeyLifetime: 600,
        policyId,
      },
    )

    expect(newMaxKeyLifetime).toBe(600n)
    expect(
      (await actions.attested.getPolicy(client, { policyId })).maxKeyLifetime,
    ).toBe(600)
  })

  test('registerKey: an invalid document reverts', async () => {
    const { policyId } = await actions.attested.createPolicySync(client, {
      delay: 0,
      maxKeyLifetime: 3_600,
      measurements: [measurement],
      salt: randomSalt(),
      scheme: schemeNitroDev,
    })
    const programKey = PublicKey.toHex(
      P256.getPublicKey({ privateKey: P256.randomPrivateKey() }),
    )

    await expect(
      actions.attested.registerKeySync(client, {
        document: '0xd284',
        policyId,
        programKey,
        slot: 0,
      }),
    ).rejects.toThrow('InvalidAttestation')
    expect(
      await actions.attested.getKeyValidUntil(client, { policyId, programKey }),
    ).toBe(0)
  })
})
