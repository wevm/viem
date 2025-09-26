import { describe, expect, test, vi } from 'vitest'
import { address } from '../../test/src/constants.js'
import { internal_estimateFeesPerGas } from '../actions/public/estimateFeesPerGas.js'
import { createClient } from '../clients/createClient.js'
import { http } from '../clients/transports/http.js'
import { parseEther } from '../utils/index.js'
import * as estimateGas from './actions/estimateGas.js'
import { lineaSepolia } from './chains.js'

const client = createClient({
  chain: lineaSepolia,
  transport: http(),
})

describe('estimateFeesPerGas', () => {
  test('default', async () => {
    const spy = vi.spyOn(estimateGas, 'estimateGas')
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await internal_estimateFeesPerGas(client, {
        request: {
          account: address.burn,
          to: address.burn,
          value: parseEther('0.0001'),
        },
      })
    expect(spy).toBeCalledWith(client, {
      account: address.burn,
      to: address.burn,
      value: parseEther('0.0001'),
    })
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
  })
})
