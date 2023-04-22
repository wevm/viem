import { Server, createServer } from 'node:http'
import { createProxyServer } from 'http-proxy'
import { Anvil, type AnvilOptions } from './anvil.js'
import getPort from 'get-port'

export type AnvilProxyOptions = {
  anvilOptions?: Omit<AnvilOptions, 'port'>
  proxyHostname?: string
  proxyPort?: number
}

export function createAnvilProxy({
  proxyPort = 8545,
  proxyHostname = '::',
  anvilOptions,
}: AnvilProxyOptions) {
  // rome-ignore lint/suspicious/noAsyncPromiseExecutor: this is fine ...
  return new Promise<Server>(async (resolve, reject) => {
    const proxy = createProxyServer({
      ignorePath: true,
      ws: true,
    })

    const server = createServer(async (req, res) => {
      const { id, path } = parseRequest(req.url)

      if (id === undefined) {
        res.writeHead(404).end('Missing worker id in request')
      } else if (path === '/logs') {
        const instance = instances.get(id)

        if (instance === undefined) {
          res.writeHead(404).end(`No anvil instance found for id ${id}`)
        } else {
          const logs = await instance.then((anvil) => anvil.logs)
          res.writeHead(200).end(JSON.stringify(logs ?? []))
        }
      } else if (path === '/') {
        const anvil = await getOrCreateAnvilInstance(id, anvilOptions)

        proxy.web(req, res, {
          target: `http://127.0.0.1:${anvil.port}`,
        })
      } else {
        res.writeHead(404).end('Invalid request')
      }
    })

    server.on('upgrade', async (req, socket, head) => {
      const { id, path } = parseRequest(req.url)

      if (id === undefined) {
        socket.destroy(new Error('Missing worker id in request'))
      } else if (path === '/') {
        const anvil = await getOrCreateAnvilInstance(id, anvilOptions)

        proxy.ws(req, socket, head, {
          target: `ws://127.0.0.1:${anvil.port}`,
        })
      } else {
        socket.destroy(new Error('Invalid request'))
      }
    })

    server.on('listening', () => resolve(server))
    server.on('error', (error) => reject(error))

    server.listen(proxyPort, proxyHostname)
  })
}

const instances = new Map<number, Promise<Anvil>>()

export async function stopAnvilInstances() {
  const anvils = Array.from(instances.values())
  await Promise.allSettled(anvils.map(async (anvil) => (await anvil).exit()))
}

async function getOrCreateAnvilInstance(
  id: number,
  options?: Omit<AnvilOptions, 'port'>,
) {
  let anvil = instances.get(id)

  if (anvil === undefined) {
    // rome-ignore lint/suspicious/noAsyncPromiseExecutor: we need this to be synchronous
    anvil = new Promise(async (resolve, reject) => {
      try {
        resolve(
          await Anvil.start({
            ...options,
            port: await getPort(),
          }),
        )
      } catch (error) {
        reject(error)
      }
    })

    instances.set(id, anvil)

    return anvil
  }

  return anvil
}

function parseRequest(request?: string) {
  const host = 'http://localhost' // Dummy value for URL constructor
  const url = new URL(`${host}${request ?? '/'}`)
  const matches =
    new RegExp('^([0-9]+)(?:/([^/]+))*$').exec(url.pathname.slice(1)) ?? []

  const id = matches[1] ? Number(matches[1]) : undefined
  if (id === undefined) {
    return { id: undefined, path: undefined }
  }

  const path = matches[2]
    ? matches[2].split('/').map((value) => value.trim())
    : []

  return { id, path: `/${path.join('/')}` }
}
