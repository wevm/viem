import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { UnsupportedProviderMethodError } from '../../../errors/rpc.js'
import { connect } from './connect.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const response = await connect(client)

  expect(response).toMatchInlineSnapshot(`
    {
      "accounts": [
        {
          "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "capabilities": {},
        },
      ],
    }
  `)
})

describe('behavior: eth_requestAccounts fallback', async () => {
  test('default', async () => {
    const client = anvilMainnet.getClient()
    const request = client.request
    client.request = (parameters: any) => {
      if (parameters.method === 'wallet_connect')
        throw new UnsupportedProviderMethodError(new Error())
      return request(parameters)
    }

    const response = await connect(client)
    expect(response).toMatchInlineSnapshot(`
    {
      "accounts": [
        {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "capabilities": {},
        },
      ],
    }
  `)
  })

  test('behavior: with capabilities', async () => {
    const client = anvilMainnet.getClient()
    const request = client.request
    client.request = (parameters: any) => {
      if (parameters.method === 'wallet_connect')
        throw new UnsupportedProviderMethodError(new Error())
      return request(parameters)
    }

    await expect(() =>
      connect(client, {
        capabilities: {
          unstable_signInWithEthereum: {
            chainId: 1,
            nonce: 'abcd1234',
          },
        },
      }),
    ).rejects.toThrow(UnsupportedProviderMethodError)
  })
})

test('behavior: capability: signInWithEthereum', async () => {
  {
    const response = await connect(client, {
      capabilities: {
        unstable_signInWithEthereum: {
          chainId: 1,
          nonce: 'abcd1234',
        },
      },
    })

    expect(response).toMatchInlineSnapshot(`
      {
        "accounts": [
          {
            "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "capabilities": {
              "unstable_signInWithEthereum": {
                "message": "example.com wants you to sign in with your Ethereum account:
      0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266


      URI: https://example.com
      Version: 1
      Chain ID: 1
      Nonce: abcd1234
      Issued At: 2024-01-01T00:00:00.000Z
      Expiration Time: 2024-01-01T00:00:00.000Z
      Not Before: 2024-01-01T00:00:00.000Z",
                "signature": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
              },
            },
          },
        ],
      }
    `)
  }

  {
    const response = await connect(client, {
      capabilities: {
        unstable_signInWithEthereum: {
          chainId: 1,
          nonce: 'abcd1234',
          expirationTime: new Date('2025-01-01T00:00:00.000Z'),
          issuedAt: new Date('2025-01-01T00:00:00.000Z'),
          notBefore: new Date('2025-01-01T00:00:00.000Z'),
        },
      },
    })

    expect(response).toMatchInlineSnapshot(`
      {
        "accounts": [
          {
            "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "capabilities": {
              "unstable_signInWithEthereum": {
                "message": "example.com wants you to sign in with your Ethereum account:
      0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266


      URI: https://example.com
      Version: 1
      Chain ID: 1
      Nonce: abcd1234
      Issued At: 2024-01-01T00:00:00.000Z
      Expiration Time: 2024-01-01T00:00:00.000Z
      Not Before: 2024-01-01T00:00:00.000Z",
                "signature": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
              },
            },
          },
        ],
      }
    `)
  }
})

test('behavior: capability: addSubAccount', async () => {
  {
    const response = await connect(client, {
      capabilities: {
        unstable_addSubAccount: {
          account: {
            keys: [
              {
                publicKey: '0x0000000000000000000000000000000000000000',
                type: 'address',
              },
            ],
            type: 'create',
          },
        },
      },
    })

    expect(response).toMatchInlineSnapshot(`
      {
        "accounts": [
          {
            "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "capabilities": {
              "unstable_subAccounts": [
                {
                  "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                },
              ],
            },
          },
        ],
      }
    `)
  }

  {
    const response = await connect(client, {
      capabilities: {
        unstable_addSubAccount: {
          account: {
            address: '0x0000000000000000000000000000000000000000',
            chainId: 1,
            type: 'deployed',
          },
        },
      },
    })

    expect(response).toMatchInlineSnapshot(`
      {
        "accounts": [
          {
            "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "capabilities": {
              "unstable_subAccounts": [
                {
                  "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                },
              ],
            },
          },
        ],
      }
    `)
  }

  {
    const response = await connect(client, {
      capabilities: {
        unstable_addSubAccount: {
          account: {
            address: '0x0000000000000000000000000000000000000000',
            factory: '0x0000000000000000000000000000000000000000',
            factoryData: '0x',
            type: 'undeployed',
          },
        },
      },
    })

    expect(response).toMatchInlineSnapshot(`
      {
        "accounts": [
          {
            "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "capabilities": {
              "unstable_subAccounts": [
                {
                  "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                },
              ],
            },
          },
        ],
      }
    `)
  }
})
