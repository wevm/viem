import { P256 } from 'ox'
import { Actions as CoreActions } from 'viem'
import { Account, Actions, http, Relay, withRelay } from 'viem/tempo'
import { expect, test } from 'vitest'
import * as tempo from '~test/tempo.js'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

const expiry = () => Math.floor(Date.now() / 1000) + 3_600

test('default', async () => {
  const relayClient = tempo.getClient({
    account,
    feeToken: tempo.pathUsd,
    transport: withRelay(http(tempo.rpcUrl), {
      plugins: [Relay.keyAuthorization()],
    }),
  })
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    accessKey,
    expiry: expiry(),
  })

  await Actions.accessKey.saveAuthorization(relayClient, { keyAuthorization })
  const receipt = await CoreActions.transaction.sendSync(relayClient, {
    account: accessKey,
    feeToken: tempo.pathUsd,
    to: '0x0000000000000000000000000000000000000000',
  })

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('error: relay without key authorization storage', async () => {
  const accessKey = Account.fromP256(P256.randomPrivateKey(), {
    access: account,
  })
  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    accessKey,
    expiry: expiry(),
  })

  await expect(
    Actions.accessKey.saveAuthorization(client, { keyAuthorization }),
  ).rejects.toMatchObject({ name: 'RpcResponse.MethodNotFoundError' })
})
