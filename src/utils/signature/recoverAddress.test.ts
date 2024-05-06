import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { getAddress } from '../address/getAddress.js'
import { toBytes } from '../encoding/toBytes.js'

import { hashMessage } from './hashMessage.js'
import { parseSignature } from './parseSignature.js'
import { recoverAddress } from './recoverAddress.js'

test('default', async () => {
  expect(
    await recoverAddress({
      hash: hashMessage('hello world'),
      signature:
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
    }),
  ).toEqual(getAddress(accounts[0].address))

  expect(
    await recoverAddress({
      hash: hashMessage('hello world'),
      signature: parseSignature(
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      ),
    }),
  ).toEqual(getAddress(accounts[0].address))

  expect(
    await recoverAddress({
      hash: hashMessage('🥵'),
      signature:
        '0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b',
    }),
  ).toEqual(getAddress(accounts[0].address))

  expect(
    await recoverAddress({
      hash: hashMessage('🥵'),
      signature: parseSignature(
        '0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b',
      ),
    }),
  ).toEqual(getAddress(accounts[0].address))

  expect(
    await recoverAddress({
      hash: hashMessage('hello world', 'bytes'),
      signature:
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
    }),
  ).toEqual(getAddress(accounts[0].address))

  expect(
    await recoverAddress({
      hash: hashMessage('hello world', 'bytes'),
      signature: parseSignature(
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      ),
    }),
  ).toEqual(getAddress(accounts[0].address))

  expect(
    await recoverAddress({
      hash: hashMessage('🥵', 'bytes'),
      signature:
        '0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b',
    }),
  ).toEqual(getAddress(accounts[0].address))

  expect(
    await recoverAddress({
      hash: hashMessage('🥵', 'bytes'),
      signature: parseSignature(
        '0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b',
      ),
    }),
  ).toEqual(getAddress(accounts[0].address))

  expect(
    await recoverAddress({
      hash: hashMessage('hello world', 'bytes'),
      signature: toBytes(
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      ),
    }),
  ).toEqual(getAddress(accounts[0].address))
})
