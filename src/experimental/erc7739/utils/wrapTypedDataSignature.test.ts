import { expect, test } from 'vitest'

import { typedData } from '~test/constants.js'
import { wrapTypedDataSignature } from './wrapTypedDataSignature.js'

test('default', () => {
  const signature = {
    r: '0x17f7e62a3921a11100b1f9631ed17c176767719fcc6e6178bf05e44fe0def852',
    s: '0x74e45a4f27940e9bc53f55d8c6934524d461f031059ba41bc0991e52093e53a7',
    v: 28n,
    yParity: 1,
  } as const

  const wrapped = wrapTypedDataSignature({
    ...typedData.complex,
    primaryType: 'Mail',
    signature,
  })

  expect(wrapped).toMatchInlineSnapshot(
    `"0x17f7e62a3921a11100b1f9631ed17c176767719fcc6e6178bf05e44fe0def85274e45a4f27940e9bc53f55d8c6934524d461f031059ba41bc0991e52093e53a71c1788ede5301fb0c4b95dda42eabe811ba83dc3cde96087b00c9b72a4d26a379ac2972c4c4323c6d7ee73e319350f290c6549b6eb516b5e5354128413342332154d61696c2875696e743235362074696d657374616d702c506572736f6e2066726f6d2c506572736f6e20746f2c737472696e6720636f6e74656e74732c62797465732068617368294e616d6528737472696e672066697273742c737472696e67206c61737429506572736f6e284e616d65206e616d652c616464726573732077616c6c65742c737472696e675b335d206661766f72697465436f6c6f72732c75696e7432353620666f6f2c75696e7438206167652c626f6f6c206973436f6f6c2900c1"`,
  )
})

test('behavior: nested type sorts before the contents type', () => {
  const wrapped = wrapTypedDataSignature({
    domain: {
      name: 'Permit2',
      chainId: 1,
      verifyingContract: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    },
    types: {
      PermitDetails: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint160' },
        { name: 'expiration', type: 'uint48' },
        { name: 'nonce', type: 'uint48' },
      ],
      PermitSingle: [
        { name: 'details', type: 'PermitDetails' },
        { name: 'spender', type: 'address' },
        { name: 'sigDeadline', type: 'uint256' },
      ],
    },
    primaryType: 'PermitSingle',
    message: {
      details: {
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        amount: 1000000n,
        expiration: 1735689600,
        nonce: 0,
      },
      spender: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      sigDeadline: 1735689600n,
    },
    signature:
      '0x17f7e62a3921a11100b1f9631ed17c176767719fcc6e6178bf05e44fe0def85274e45a4f27940e9bc53f55d8c6934524d461f031059ba41bc0991e52093e53a71c',
  })

  expect(wrapped).toMatchInlineSnapshot(
    `"0x17f7e62a3921a11100b1f9631ed17c176767719fcc6e6178bf05e44fe0def85274e45a4f27940e9bc53f55d8c6934524d461f031059ba41bc0991e52093e53a71c866a5aba21966af95d6c7ab78eb2b2fc913915c28be3b9aa07cc04ff903e3f28d25efdef9943e7da38888b87ed3565f00a83c4e3ad15a2009f23e53d095a44285065726d697444657461696c73286164647265737320746f6b656e2c75696e7431363020616d6f756e742c75696e7434382065787069726174696f6e2c75696e743438206e6f6e6365295065726d697453696e676c65285065726d697444657461696c732064657461696c732c61646472657373207370656e6465722c75696e7432353620736967446561646c696e65295065726d697453696e676c65009d"`,
  )
})
