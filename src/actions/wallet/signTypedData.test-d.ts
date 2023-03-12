import { assertType, test } from 'vitest'

import { SignTypedDataParameters } from './signTypedData'

test('SignTypedDataParameters', async () => {
  const types = {
    Name: [
      { name: 'first', type: 'string' },
      { name: 'last', type: 'string' },
    ],
    Person: [
      { name: 'name', type: 'Name' },
      { name: 'wallet', type: 'address' },
      { name: 'favoriteColors', type: 'string[3]' },
      { name: 'age', type: 'uint8' },
      { name: 'isCool', type: 'bool' },
    ],
    Mail: [
      { name: 'timestamp', type: 'uint256' },
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
      { name: 'hash', type: 'bytes' },
    ],
  } as const
  const account = {
    address: '0x',
    type: 'json-rpc',
  } as const
  const domain = {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0x0000000000000000000000000000000000000000',
  } as const

  assertType<SignTypedDataParameters<typeof types, 'Name'>>({
    account,
    domain,
    types,
    primaryType: 'Name',
    // ^?
    message: {
      // ^?
      first: 'Cow',
      last: 'Burns',
    },
  })
})
