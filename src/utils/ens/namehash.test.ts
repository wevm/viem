import { expect, test } from 'vitest'

import { namehash } from './namehash.js'
import { normalize } from './normalize.js'

test.each([
  {
    name: '',
    expected:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  },
  {
    name: 'eth',
    expected:
      '0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae',
  },
  {
    name: 'alice.eth',
    expected:
      '0x787192fc5378cc32aa956ddfdedbf26b24e8d78e40109add0eea2c1a012c3dec',
  },
  {
    name: 'iam.alice.eth',
    expected:
      '0x5bec9e288ed3df984a80a1ac48538a7f19370794d676506adfbddefad210775b',
  },
  {
    name: 'awkweb.eth',
    expected:
      '0x52d0f5fbf348925621be297a61b88ec492ebbbdfa9477d82892e2786020ad61c',
  },
  {
    name: normalize('awkw𝝣b.eth'),
    expected:
      '0x4e372358e2e47fdbba39e5ca56d412e6dc4216a260a733b1b5d8df0001d28202',
  },
  {
    name: '\u{0061}wkweb.eth',
    expected:
      '0x52d0f5fbf348925621be297a61b88ec492ebbbdfa9477d82892e2786020ad61c',
  },
  {
    name: '\u{0061}wkw\u{0065}b.eth',
    expected:
      '0x52d0f5fbf348925621be297a61b88ec492ebbbdfa9477d82892e2786020ad61c',
  },
  {
    name: 'awkweb.eth',
    //     ^ latin small "a"
    expected:
      '0x52d0f5fbf348925621be297a61b88ec492ebbbdfa9477d82892e2786020ad61c',
  },
  {
    name: 'awkweb.eth',
    //         ^ latin small "e"
    expected:
      '0x52d0f5fbf348925621be297a61b88ec492ebbbdfa9477d82892e2786020ad61c',
  },
  {
    name: 'ʘ‿ʘ.eth',
    expected:
      '0x61e4a7cb09f4b512f41d02fedcc851cf8e43161e1f34e4264d7d911bb6c9c7af',
  },
  {
    name: '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658].eth',
    expected:
      '0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1',
  },
])("namehash('$name') -> '$expected'", ({ name, expected }) => {
  expect(namehash(name)).toBe(expected)
})
