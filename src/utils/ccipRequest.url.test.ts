import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { describe, expect, test } from 'vitest'

import { ccipRequest } from './ccip.js'

const sender = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' as const
const data = '0xdeadbeef' as const

async function createJsonServer(payload: unknown) {
  const server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(payload))
  })
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })
  const { port } = server.address() as AddressInfo
  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()))
      }),
  }
}

describe('ccipRequest url checks', () => {
  test('error: non-http scheme', async () => {
    await expect(() =>
      ccipRequest({
        data,
        sender,
        urls: ['file:///etc/passwd'],
      }),
    ).rejects.toThrowError("scheme 'file' is not allowed")
  })

  test('error: link-local metadata address', async () => {
    await expect(() =>
      ccipRequest({
        data,
        sender,
        urls: ['http://169.254.169.254/latest/meta-data'],
      }),
    ).rejects.toThrowError('blocked link-local or unspecified range')
  })

  test('error: unspecified ipv4', async () => {
    await expect(() =>
      ccipRequest({
        data,
        sender,
        urls: ['http://0.0.0.0/'],
      }),
    ).rejects.toThrowError('blocked link-local or unspecified range')
  })

  test('error: bracketed ipv6 unspecified', async () => {
    await expect(() =>
      ccipRequest({
        data,
        sender,
        urls: ['http://[::]/'],
      }),
    ).rejects.toThrowError('blocked link-local or unspecified range')
  })

  test('error: bracketed ipv6 link-local', async () => {
    await expect(() =>
      ccipRequest({
        data,
        sender,
        urls: ['http://[fe80::1]/'],
      }),
    ).rejects.toThrowError('blocked link-local or unspecified range')
  })

  test('error: ipv4-mapped link-local (node hex form)', async () => {
    await expect(() =>
      ccipRequest({
        data,
        sender,
        urls: ['http://[::ffff:169.254.169.254]/latest/meta-data'],
      }),
    ).rejects.toThrowError('blocked link-local or unspecified range')
  })

  test('error: ipv4-mapped unspecified', async () => {
    await expect(() =>
      ccipRequest({
        data,
        sender,
        urls: ['http://[::ffff:0.0.0.0]/'],
      }),
    ).rejects.toThrowError('blocked link-local or unspecified range')
  })

  test('skips blocked url and uses the next gateway', async () => {
    const server = await createJsonServer({ data: '0xcafebabe' })
    const result = await ccipRequest({
      data,
      sender,
      urls: [
        'http://169.254.169.254/{sender}/{data}',
        `${server.url}/{sender}/{data}`,
      ],
    })
    expect(result).toEqual('0xcafebabe')
    await server.close()
  })
})
