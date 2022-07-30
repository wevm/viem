import { request } from './request'

let id = 0

async function http(url: string, { body }: { body: { [key: string]: any } }) {
  return await request(url, {
    method: 'POST',
    body: JSON.stringify({ jsonrpc: '2.0', id: id++, ...body }),
  })
}

export const rpc = {
  http,
}
