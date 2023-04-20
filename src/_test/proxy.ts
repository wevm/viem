import { Server, createServer } from 'node:http'
import { createProxyServer } from 'http-proxy'
import { Anvil, type AnvilOptions } from './anvil.js'
import getPort from 'get-port'

export interface AnvilProxyOptions {
  proxyPort?: number
  proxyHostname?: string
  anvilOptions: Omit<AnvilOptions, 'port'> & {
    portRange?: number[] | Iterable<number>
  }
}

export function createAnvilProxy({
  proxyPort = 8545,
  proxyHostname = '::',
  anvilOptions: { portRange, ...anvilOptions },
}: AnvilProxyOptions) {
  // rome-ignore lint/suspicious/noAsyncPromiseExecutor: this is fine ...
  return new Promise<Server>(async (resolve, reject) => {
    const proxy = createProxyServer({
      ignorePath: true,
      ws: true,
    })

    const server = createServer(async (req, res) => {
      const id = getIdFromUrl(req.url)
      if (id === undefined) {
        res.writeHead(404).end('Missing worker id in request')
      } else {
        const port = await getPort({
          ...(portRange !== undefined ? { port: portRange } : {}),
        })
        const anvil = await getOrCreateAnvilInstance(id, {
          ...anvilOptions,
          port,
        })
        proxy.web(req, res, {
          target: `http://127.0.0.1:${anvil.port}`,
        })
      }
    })

    server.on('upgrade', async (req, socket, head) => {
      const id = getIdFromUrl(req.url)
      if (id === undefined) {
        socket.destroy(new Error('Missing worker id in request'))
      } else {
        const port = await getPort({
          ...(portRange !== undefined ? { port: portRange } : {}),
        })
        const anvil = await getOrCreateAnvilInstance(id, {
          ...anvilOptions,
          port,
        })
        proxy.ws(req, socket, head, {
          target: `ws://127.0.0.1:${anvil.port}`,
        })
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

async function getOrCreateAnvilInstance(id: number, options: AnvilOptions) {
  let anvil = instances.get(id)

  if (anvil === undefined) {
    // rome-ignore lint/suspicious/noAsyncPromiseExecutor: we need this to be synchronous
    anvil = new Promise(async (resolve, reject) => {
      try {
        resolve(Anvil.start(options))
      } catch (error) {
        reject(error)
      }
    })

    instances.set(id, anvil)

    return anvil
  }

  return anvil
}

function getIdFromUrl(url?: string) {
  const path = url ? new RegExp('^[0-9]+$').exec(url.slice(1))?.[0] : undefined
  const id = path ? Number(path) : undefined

  return id
}
