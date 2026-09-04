import { AbiParameters, PublicKey, Secp256k1 } from 'ox'
import { Client, custom } from 'viem'
import { Actions } from 'viem/tempo'
import { expect, test } from 'vitest'

const portalAddress = '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac'

test('calls', () => {
  const calls = Actions.zone.getEncryptionKey.calls({ portalAddress })
  expect(
    calls.map(({ data, functionName, to }) => ({ data, functionName, to })),
  ).toMatchInlineSnapshot(`
    [
      {
        "data": "0x4256ce38",
        "functionName": "encryptionKeyCount",
        "to": "0x3F5296303400B56271b476F5A0B9cBF74350D6Ac",
      },
      {
        "data": "0x3488ce0d",
        "functionName": "sequencerEncryptionKey",
        "to": "0x3F5296303400B56271b476F5A0B9cBF74350D6Ac",
      },
    ]
  `)
})

test.each([false, true])(
  'reads an encryption key without a chain (appended address: %s)',
  async (appendedAddress) => {
    const publicKey = PublicKey.compress(
      Secp256k1.getPublicKey({
        privateKey:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
      }),
    )
    const keyData = AbiParameters.encode(
      AbiParameters.from(
        appendedAddress ? 'bytes32, uint8, address' : 'bytes32, uint8',
      ),
      appendedAddress
        ? [
            publicKey.x,
            publicKey.prefix,
            '0x0000000000000000000000000000000000000001',
          ]
        : [publicKey.x, publicKey.prefix],
    )
    const client = Client.create({
      transport: custom({
        async request({ method }) {
          if (method !== 'eth_call')
            throw new Error(`Unexpected method: ${method}`)
          return AbiParameters.encode(
            AbiParameters.from('(bool success, bytes returnData)[]'),
            [
              [
                {
                  success: true,
                  returnData: AbiParameters.encode(
                    AbiParameters.from('uint256'),
                    [1n],
                  ),
                },
                { success: true, returnData: keyData },
              ],
            ],
          )
        },
      }),
    })
    const result = await Actions.zone.getEncryptionKey(client, { zoneId: 7 })
    expect(result.keyIndex).toBe(0n)
    expect(result.publicKey).toEqual(publicKey)
  },
)
