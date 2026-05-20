import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import * as Client from '../../core/Client.js'
import { http } from '../../core/transports/index.js'
import { getBlobBaseFee } from './getBlobBaseFee.js'

describe('getBlobBaseFee', () => {
  test('behavior: returns the current blob base fee', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const fee = await getBlobBaseFee(client)

    expect(typeof fee).toMatchInlineSnapshot(`"bigint"`)
  })
})
