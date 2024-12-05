import { expect, test } from 'vitest'

import { typedData } from '~test/src/constants.js'
import { pad } from '../data/pad.js'
import { toHex } from '../encoding/toHex.js'

import { hashTypedData } from './hashTypedData.js'

test('default', () => {
  expect(
    hashTypedData({
      ...typedData.basic,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    '"0x448f54762ef8ecccdc4d19bb7d467161383cd4b271617a8cee05c790eb745d74"',
  )
})

test('complex', () => {
  expect(
    hashTypedData({
      ...typedData.complex,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    '"0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae"',
  )
})

test('no domain', () => {
  expect(
    hashTypedData({
      ...typedData.complex,
      domain: undefined,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    '"0x14ed1dbbfecbe5de3919f7ea47daafdf3a29dfbb60dd88d85509f79773d503a5"',
  )
  expect(
    hashTypedData({
      ...typedData.complex,
      domain: {},
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    '"0x14ed1dbbfecbe5de3919f7ea47daafdf3a29dfbb60dd88d85509f79773d503a5"',
  )
})

test('domain: empty name', () => {
  expect(
    hashTypedData({
      ...typedData.complex,
      domain: { name: '' },
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    '"0xc3f4f9ebd774352940f60aebbc83fcee20d0b17eb42bd1b20c91a748001ecb53"',
  )
})

test('domain: bigint value for chainId', () => {
  expect(
    hashTypedData({
      ...typedData.complex,
      domain: {
        chainId:
          14018334920824264832118464179726739019961432051877733167310318607178n,
      },
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    '"0x14ed1dbbfecbe5de3919f7ea47daafdf3a29dfbb60dd88d85509f79773d503a5"',
  )
})

test('minimal valid typed message', () => {
  const hash = hashTypedData({
    types: {
      EIP712Domain: [],
    },
    primaryType: 'EIP712Domain',
    domain: {},
  })

  expect(hash).toMatchInlineSnapshot(
    '"0x8d4a3f4082945b7879e2b55f181c31a77c8c0a464b70669458abbaaf99de4c38"',
  )
})

test('typed message with a domain separator that uses all fields.', () => {
  const hash = hashTypedData({
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
        {
          name: 'salt',
          type: 'bytes32',
        },
      ],
    },
    primaryType: 'EIP712Domain',
    domain: {
      name: 'example.metamask.io',
      version: '1',
      chainId: 1n,
      verifyingContract: '0x0000000000000000000000000000000000000000',
      salt: pad(toHex(new Uint8Array([1, 2, 3])), { dir: 'right' }),
    },
  })

  expect(hash).toMatchInlineSnapshot(
    '"0x54ffed5209a17ac210ef3823740b3852ee9cd518b84ee39f0a3fa7f2f9b4205b"',
  )
})

test('typed message with only custom domain separator fields', () => {
  const hash = hashTypedData({
    types: {
      EIP712Domain: [
        {
          name: 'customName',
          type: 'string',
        },
        {
          name: 'customVersion',
          type: 'string',
        },
        {
          name: 'customChainId',
          type: 'uint256',
        },
        {
          name: 'customVerifyingContract',
          type: 'address',
        },
        {
          name: 'customSalt',
          type: 'bytes32',
        },
        {
          name: 'extraField',
          type: 'string',
        },
      ],
    },
    primaryType: 'EIP712Domain',
    domain: {
      customName: 'example.metamask.io',
      customVersion: '1',
      customChainId: 1n,
      customVerifyingContract: '0x0000000000000000000000000000000000000000',
      customSalt: pad(toHex(new Uint8Array([1, 2, 3])), { dir: 'right' }),
      extraField: 'stuff',
    },
  })

  expect(hash).toMatchInlineSnapshot(
    '"0x3efa3ef0305f56ba5bba62000500e29fe82c5314bca2f958c64e31b2498560f8"',
  )
})

test('typed message with data', () => {
  const hash = hashTypedData({
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
        {
          name: 'salt',
          type: 'bytes32',
        },
      ],
      Message: [{ name: 'data', type: 'string' }],
    },
    primaryType: 'Message',
    domain: {
      name: 'example.metamask.io',
      version: '1',
      chainId: 1n,
      verifyingContract: '0x0000000000000000000000000000000000000000',
      salt: pad(toHex(new Uint8Array([1, 2, 3])), { dir: 'right' }),
    },
    message: {
      data: 'Hello!',
    },
  })

  expect(hash).toMatchInlineSnapshot(
    '"0xd2669f23b7849020ad41bcbff5b51372793f91320e0f901641945568ed7322be"',
  )
})

test('wrong domain value', () => {
  expect(() =>
    hashTypedData({
      ...typedData.complex,
      domain: 'wrong' as unknown as Record<string, unknown>,
      primaryType: 'Mail',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BaseError: Invalid domain ""wrong"".

    Must be a valid EIP-712 domain.

    Version: viem@x.y.z]
  `)
})

test('https://github.com/wevm/viem/issues/2888', () => {
  expect(() =>
    hashTypedData({
      domain: { name: 'Domain' },
      types: {
        Message: [{ name: 'contents', type: 'bytes32' }],
        bytes32: [],
        address: [],
      },
      primaryType: 'Message',
      message: {
        contents:
          '0x1111111111111111111111111111111111111111111111111111111111111111',
      },
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidStructTypeError: Struct type "bytes32" is invalid.

    Struct type must not be a Solidity type.

    Version: viem@x.y.z]
  `)
})
