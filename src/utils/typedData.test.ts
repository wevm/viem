import { describe, expect, test } from 'vitest'

import { pad, toHex } from './index.js'
import {
  domainSeparator,
  serializeTypedData,
  validateTypedData,
} from './typedData.js'

describe('serializeTypedData', () => {
  test('default', () => {
    expect(
      serializeTypedData({
        domain: {
          name: 'Ether!',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Foo',
        types: {
          Foo: [
            { name: 'address', type: 'address' },
            { name: 'name', type: 'string' },
            { name: 'foo', type: 'string' },
          ],
        },
        message: {
          address: '0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9',
          name: 'jxom',
          foo: '0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9',
        },
      }),
    ).toMatchInlineSnapshot(
      `"{"domain":{},"message":{"address":"0xb9cab4f0e46f7f6b1024b5a7463734fa68e633f9","name":"jxom","foo":"0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9"},"primaryType":"Foo","types":{"Foo":[{"name":"address","type":"address"},{"name":"name","type":"string"},{"name":"foo","type":"string"}]}}"`,
    )
  })

  test('with domain', () => {
    expect(
      serializeTypedData({
        domain: {
          name: 'Ether!',
          version: '1',
          address: '0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Foo',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'address', type: 'address' },
            { name: 'chainId', type: 'uint32' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Foo: [
            { name: 'address', type: 'address' },
            { name: 'name', type: 'string' },
            { name: 'foo', type: 'string' },
          ],
        },
        message: {
          address: '0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9',
          name: 'jxom',
          foo: '0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9',
        },
      }),
    ).toMatchInlineSnapshot(
      `"{"domain":{"name":"Ether!","version":"1","address":"0xb9cab4f0e46f7f6b1024b5a7463734fa68e633f9","chainId":1,"verifyingContract":"0xcccccccccccccccccccccccccccccccccccccccc"},"message":{"address":"0xb9cab4f0e46f7f6b1024b5a7463734fa68e633f9","name":"jxom","foo":"0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9"},"primaryType":"Foo","types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"address","type":"address"},{"name":"chainId","type":"uint32"},{"name":"verifyingContract","type":"address"}],"Foo":[{"name":"address","type":"address"},{"name":"name","type":"string"},{"name":"foo","type":"string"}]}}"`,
    )
  })

  test('domain as primary type', () => {
    expect(
      serializeTypedData({
        domain: {
          name: 'Ether!',
          version: '1',
          address: '0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'EIP712Domain',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'address', type: 'address' },
            { name: 'chainId', type: 'uint32' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Foo: [
            { name: 'address', type: 'address' },
            { name: 'name', type: 'string' },
            { name: 'foo', type: 'string' },
          ],
        },
      }),
    ).toMatchInlineSnapshot(
      `"{"domain":{"name":"Ether!","version":"1","address":"0xb9cab4f0e46f7f6b1024b5a7463734fa68e633f9","chainId":1,"verifyingContract":"0xcccccccccccccccccccccccccccccccccccccccc"},"primaryType":"EIP712Domain","types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"address","type":"address"},{"name":"chainId","type":"uint32"},{"name":"verifyingContract","type":"address"}],"Foo":[{"name":"address","type":"address"},{"name":"name","type":"string"},{"name":"foo","type":"string"}]}}"`,
    )
  })

  test('no domain', () => {
    expect(
      serializeTypedData({
        primaryType: 'Foo',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint32' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Foo: [
            { name: 'address', type: 'address' },
            { name: 'name', type: 'string' },
            { name: 'foo', type: 'string' },
          ],
        },
        message: {
          address: '0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9',
          name: 'jxom',
          foo: '0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9',
        },
      }),
    ).toMatchInlineSnapshot(
      `"{"domain":{},"message":{"address":"0xb9cab4f0e46f7f6b1024b5a7463734fa68e633f9","name":"jxom","foo":"0xb9CAB4F0E46F7F6b1024b5A7463734fa68E633f9"},"primaryType":"Foo","types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint32"},{"name":"verifyingContract","type":"address"}],"Foo":[{"name":"address","type":"address"},{"name":"name","type":"string"},{"name":"foo","type":"string"}]}}"`,
    )
  })
})

describe('validateTypedData', () => {
  test('default', () => {
    validateTypedData({
      domain: {
        name: 'Ether!',
        version: '1',
        chainId: 1n,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    })
  })

  test('negative uint', () => {
    expect(() =>
      validateTypedData({
        types: {
          EIP712Domain: [],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'favoriteNumber', type: 'uint8' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            favoriteNumber: -1,
          },
          to: {
            name: 'Bob',
            favoriteNumber: -50,
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [IntegerOutOfRangeError: Number "-1" is not in safe 8-bit unsigned integer range (0 to 255)

      Version: viem@x.y.z]
    `)
  })

  test('uint overflow', () => {
    expect(() =>
      validateTypedData({
        types: {
          EIP712Domain: [],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'favoriteNumber', type: 'uint8' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            favoriteNumber: 256,
          },
          to: {
            name: 'Bob',
            favoriteNumber: 0,
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [IntegerOutOfRangeError: Number "256" is not in safe 8-bit unsigned integer range (0 to 255)

      Version: viem@x.y.z]
    `)
  })

  test('int underflow', () => {
    expect(() =>
      validateTypedData({
        types: {
          EIP712Domain: [],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'favoriteNumber', type: 'int8' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            favoriteNumber: -129,
          },
          to: {
            name: 'Bob',
            favoriteNumber: 0,
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [IntegerOutOfRangeError: Number "-129" is not in safe 8-bit signed integer range (-128 to 127)

      Version: viem@x.y.z]
    `)
  })

  test('invalid address', () => {
    expect(() =>
      validateTypedData({
        types: {
          EIP712Domain: [],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            wallet: '0x0000000000000000000000000000000000000000',
          },
          to: {
            name: 'Bob',
            wallet: '0x000000000000000000000000000000000000z',
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0x000000000000000000000000000000000000z" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })

  test('bytes size mismatch', () => {
    expect(() =>
      validateTypedData({
        types: {
          EIP712Domain: [],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'hash', type: 'bytes32' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            hash: '0x0000000000000000000000000000000000000000',
          },
          to: {
            name: 'Bob',
            hash: '0x0000000000000000000000000000000000000000',
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [BytesSizeMismatchError: Expected bytes32, got bytes20.

      Version: viem@x.y.z]
    `)
  })

  test('domain: invalid chainId', () => {
    expect(() =>
      validateTypedData({
        domain: {
          name: 'Ether!',
          version: '1',
          chainId: -1n,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Mail',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
        },
        message: {
          from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [IntegerOutOfRangeError: Number "-1n" is not in safe 256-bit unsigned integer range (0n to 115792089237316195423570985008687907853269984665640564039457584007913129639935n)

      Version: viem@x.y.z]
    `)
  })

  test('domain: invalid contract', () => {
    expect(() =>
      validateTypedData({
        domain: {
          name: 'Ether!',
          version: '1',
          chainId: 1n,
          verifyingContract: '0xCczCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Mail',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
        },
        message: {
          from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0xCczCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })

  test('primaryType: invalid', () => {
    expect(() =>
      validateTypedData({
        // @ts-expect-error
        primaryType: 'Cheese',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
        },
        message: {
          from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [BaseError: Invalid primary type \`Cheese\` must be one of \`["EIP712Domain","Mail","Person"]\`.

      Check that the primary type is a key in \`types\`.

      Docs: https://viem.sh/api/glossary/Errors#typeddatainvalidprimarytypeerror
      Version: viem@x.y.z]
    `)
  })

  test('EIP712Domain as primaryType', () => {
    validateTypedData({
      domain: {
        name: 'Ether!',
        version: '1',
        chainId: 1n,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      primaryType: 'EIP712Domain',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
      },
    })
  })
})

describe('domainSeparator', () => {
  const FULL_DOMAIN = {
    name: 'example.metamask.io',
    version: '1',
    chainId: 1,
    verifyingContract: '0x0000000000000000000000000000000000000000',
    salt: pad(toHex(new Uint8Array([1, 2, 3])), { dir: 'right' }),
  } as const

  test('basic', () => {
    expect(domainSeparator({ domain: FULL_DOMAIN })).toMatchInlineSnapshot(
      '"0x62d1d3234124be639f11bfcb3c421b50cc645b88e2aca76f3a6ddf860a94e5b1"',
    )
  })

  test('partial', () => {
    expect(
      domainSeparator({
        domain: { ...FULL_DOMAIN, name: undefined, version: undefined },
      }),
    ).toMatchInlineSnapshot(
      '"0xce6c7b484f565618d511f23172572bdc509ec6d704587a8b328c7158903d4fa1"',
    )
  })

  test('empty', () => {
    expect(domainSeparator({ domain: {} })).toMatchInlineSnapshot(
      '"0x6192106f129ce05c9075d319c1fa6ea9b3ae37cbd0c1ef92e2be7137bb07baa1"',
    )
  })
})
