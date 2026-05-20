import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import * as Client from '../../core/Client.js'
import { http } from '../../core/transports/index.js'
import { getGasPrice } from './getGasPrice.js'

describe('getGasPrice', () => {
  test('behavior: returns the current gas price', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const gasPrice = await getGasPrice(client)

    expect(typeof gasPrice).toMatchInlineSnapshot(`"bigint"`)
  })
})
