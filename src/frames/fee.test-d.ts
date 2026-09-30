import { privateKeyToAccount } from 'viem/accounts'
import { Frame } from 'viem/frames'
import { describe, expectTypeOf, test } from 'vitest'

const contractAddress = '0x0000000000000000000000000000000000000001'
const token = contractAddress
const account = privateKeyToAccount(`0x${'01'.padStart(64, '0')}`)

describe('fee', () => {
  test('accepts explicit and default local payers', () => {
    expectTypeOf(
      Frame.fee({ payer: account, contractAddress, token }),
    ).toEqualTypeOf<Frame.Frame>()
    Frame.fee({ contractAddress, token })
    Frame.fee({
      payer: {
        scheme: 'secp256k1',
        signer: account.address,
        sign: account.sign,
      },
      contractAddress,
      token,
    })
  })
  test('arbitrary adapters require a verifier', () => {
    Frame.fee({
      payer: {
        scheme: 'arbitrary',
        verifier: contractAddress,
        placeholder: '0xaabb',
        sign: async () => '0xccdd' as const,
      },
      contractAddress,
      token,
    })
    Frame.fee({
      // @ts-expect-error Arbitrary payers require a verifier.
      payer: { scheme: 'arbitrary', sign: async () => '0xccdd' as const },
      contractAddress,
      token,
    })
  })
  test('requires a token and contract', () => {
    // @ts-expect-error The reimbursement token is required.
    Frame.fee({ contractAddress })
    // @ts-expect-error The payer contract is required.
    Frame.fee({ token })
  })
})
