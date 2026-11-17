import { Actions, Client, http } from 'viem'
import { expect, test } from 'vitest'
import { createServer } from '~test/http.js'

for (const maxUsedGas of [undefined, '0x0', '0x7530'] as const) {
  test(`maxUsedGas: ${maxUsedGas ?? 'omitted'}`, async () => {
    const server = await createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(
        JSON.stringify({
          result: [
            {
              gasLimit: '0x1c9c380',
              gasUsed: '0x5208',
              number: '0x1',
              size: '0x0',
              timestamp: '0x0',
              transactions: [],
              calls: [
                {
                  gasUsed: '0x5208',
                  maxUsedGas,
                  returnData: '0x',
                  status: '0x1',
                  logs: [],
                },
              ],
            },
          ],
        }),
      )
    })
    try {
      const client = Client.create({ transport: http(server.url) })
      const [block] = await Actions.block.simulate(client, {
        blocks: [
          { calls: [{ to: '0x0000000000000000000000000000000000000001' }] },
        ],
      })
      const call = block!.calls[0]!
      expect(call.gasUsed).toBe(21_000n)
      if (maxUsedGas === undefined)
        expect(call).not.toHaveProperty('maxUsedGas')
      else expect(call.maxUsedGas).toBe(maxUsedGas === '0x0' ? 0n : 30_000n)
    } finally {
      await server.close()
    }
  })
}
