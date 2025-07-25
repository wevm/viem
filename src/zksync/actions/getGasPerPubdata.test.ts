import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { gasPerPubdataDefault } from '../constants/number.js'
import { getGasPerPubdata } from './getGasPerPubdata.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const fee = await getGasPerPubdata(client)

  expect(fee).toEqual(gasPerPubdataDefault)
})
