import { Client, http } from 'viem'
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

test('error: no chain', async () => {
  const client = Client.create({
    chain: undefined,
    transport: http('http://127.0.0.1:0'),
  })

  await expect(
    Actions.zone.getEncryptionKey(client, { zoneId: 7 }),
  ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: `chain` is required.]')
})
