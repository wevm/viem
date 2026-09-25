import { FundingSource, KeyAuthorization, SignatureEnvelope } from 'ox/tempo'
import { describe, expect, test } from 'vitest'
import * as Account from './Account.js'
import * as Addresses from './Addresses.js'
import * as KeyAuthorizationManager from './KeyAuthorizationManager.js'

const owner = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const key = Account.fromP256(
  '0x5c878151adef73f88b1c360d33e9bf9dd1b6e2e0e07bc555fc33cb8cf6bc9b28',
  { access: owner },
)
const inline = {
  admins: ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' as const],
  rules: {
    maxSlippageBps: 100,
    sources: {
      [Addresses.pathUsd]: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
    },
  },
}

describe('signKeyAuthorization', () => {
  test.each([1n, inline])(
    'preserves and signs policy %#',
    async (fundingPolicy) => {
      const parameters = { chainId: 1337n, fundingPolicy }
      const direct = await owner.signKeyAuthorization(key, parameters)
      const standalone = await Account.signKeyAuthorization(owner, {
        ...parameters,
        key,
      })
      expect(standalone).toEqual(direct)
      expect(direct.fundingPolicy).toEqual(fundingPolicy)
      const payload = KeyAuthorization.getSignPayload(direct)
      expect(
        Account.getKeyAuthorizationSignPayload(owner, { ...parameters, key }),
      ).toBe(payload)
      expect(
        SignatureEnvelope.verify(direct.signature, {
          payload,
          address: owner.address,
        }),
      ).toBe(true)
      expect(
        KeyAuthorization.getSignPayload({ ...direct, fundingPolicy: 2n }),
      ).not.toBe(payload)
      expect(
        KeyAuthorization.deserialize(KeyAuthorization.serialize(direct))
          .fundingPolicy,
      ).toEqual(fundingPolicy)
    },
  )
})

describe('KeyAuthorizationManager.memory', () => {
  test('retains policy data after RPC rehydration', async () => {
    const manager = KeyAuthorizationManager.memory()
    const authorization = await owner.signKeyAuthorization(key, {
      chainId: 1337n,
      fundingPolicy: inline,
    })
    const identity = {
      address: owner.address,
      accessKey: key.accessKeyAddress,
      chainId: 1337,
    }
    const restored = KeyAuthorization.fromRpc(
      KeyAuthorization.toRpc(authorization),
    )
    await manager.set(identity, restored)
    expect((await manager.get(identity))?.fundingPolicy).toEqual(inline)
    await manager.remove(identity)
    expect(await manager.get(identity)).toBeUndefined()
  })
})
