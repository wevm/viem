import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { addSubAccount } from './addSubAccount.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  {
    const response = await addSubAccount(client, {
      type: 'create',
    })

    expect(response).toMatchInlineSnapshot(`
    {
      "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    }
  `)
  }

  {
    const response = await addSubAccount(client, {
      keys: [
        {
          publicKey: '0x0000000000000000000000000000000000000000',
          type: 'address',
        },
      ],
      type: 'create',
    })

    expect(response).toMatchInlineSnapshot(`
    {
      "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    }
  `)
  }

  {
    const response = await addSubAccount(client, {
      address: '0x0000000000000000000000000000000000000000',
      chainId: 1,
      type: 'deployed',
    })

    expect(response).toMatchInlineSnapshot(`
    {
      "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    }
  `)
  }
})
