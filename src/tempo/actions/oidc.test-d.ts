import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  Actions,
  createClient,
  http,
  Oidc,
  PublicKey,
  type ZkSignature,
} from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

type ReturnValue = {
  credential: ZkSignature.Credential
  nonce: string
  token: string
}

const client = createClient({ chain: tempoLocalnet, transport: http() })
const { publicKey } = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

test('prove returns the credential, nonce, and token for either form', async () => {
  const prepared = Oidc.prepare({ publicKey: PublicKey.fromHex(publicKey) })

  expectTypeOf(
    await client.oidc.prove({ ...prepared, token: 'a.b.c' }),
  ).toEqualTypeOf<ReturnValue>()
  expectTypeOf(
    await Actions.oidc.prove(client, {
      getToken: ({ nonce }) => nonce,
      publicKey,
    }),
  ).toEqualTypeOf<ReturnValue>()
  expectTypeOf(
    await client.oidc.prove({
      getToken: async ({ nonce }) => nonce,
      publicKey: PublicKey.fromHex(publicKey),
      validUntil: 1,
    }),
  ).toEqualTypeOf<ReturnValue>()
})

test('prove rejects mixed forms', () => {
  const prepared = Oidc.prepare({ publicKey: PublicKey.fromHex(publicKey) })

  // @ts-expect-error Prepared values and `getToken` are exclusive.
  client.oidc.prove({ ...prepared, getToken: () => '', token: 'a.b.c' })
  // @ts-expect-error A token callback needs the access key's public key.
  client.oidc.prove({ getToken: () => '' })
})
