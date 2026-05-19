import type * as RpcSchema from 'ox/RpcSchema'
import { describe, expectTypeOf, test } from 'vp/test'

import { http } from './http.js'

describe('http', () => {
  test('types: accepts custom rpc schemas', async () => {
    type Schema = RpcSchema.From<{
      Request: {
        method: 'test_echo'
        params: [value: string]
      }
      ReturnType: string
    }>

    const transport = http<Schema>('https://example.com')({})
    const result = transport.request({
      method: 'test_echo',
      params: ['hello'],
    })

    expectTypeOf(result).toEqualTypeOf<Promise<string>>()

    transport.request({
      method: 'test_echo',
      // @ts-expect-error - params are inferred from the schema.
      params: [123],
    })
  })
})
