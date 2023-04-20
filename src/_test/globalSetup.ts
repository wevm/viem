import { Server, createServer } from 'node:http'
import { createProxyServer } from 'http-proxy'
import { Anvil } from './anvil.js'
import getPort from 'get-port'

const instances = new Map<number, Promise<Anvil>>()

async function getOrCreateAnvil(id: number) {
  let anvil = instances.get(id)

  if (anvil === undefined) {
    // rome-ignore lint/suspicious/noAsyncPromiseExecutor: we are using try/catch here correctly
    anvil = new Promise(async (resolve, reject) => {
      try {
        resolve(
          Anvil.start({
            portNumber: await getPort(),
            forkUrl: process.env.VITE_ANVIL_FORK_URL,
            forkBlockNumber: Number(process.env.VITE_ANVIL_BLOCK_NUMBER),
            blockTime: Number(process.env.VITE_ANVIL_BLOCK_TIME),
            startUpTimeout: 10000,
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

function getIdFromUrl(url?: string) {
  const path = url ? new RegExp('^[0-9]+$').exec(url.slice(1))?.[0] : undefined
  const id = path ? Number(path) : undefined

  return id
}

export default async function () {
  const server = await new Promise<Server>((resolve, reject) => {
    const proxy = createProxyServer({
      ignorePath: true,
      ws: true,
    })

    const server = createServer(async (req, res) => {
      const id = getIdFromUrl(req.url)
      if (id === undefined) {
        res.writeHead(404).end('Missing worker id in request')
      } else {
        const anvil = await getOrCreateAnvil(id)
        proxy.web(req, res, {
          target: `http://localhost:${anvil.port}`,
        })
      }
    })

    server.on('upgrade', async (req, socket, head) => {
      const id = getIdFromUrl(req.url)
      if (id === undefined) {
        socket.destroy(new Error('Missing worker id in request'))
      } else {
        const anvil = await getOrCreateAnvil(id)
        proxy.ws(req, socket, head, {
          target: `ws://localhost:${anvil.port}`,
        })
      }
    })

    server.on('listening', () => resolve(server))
    server.on('error', (error) => reject(error))

    server.listen('8545')
  })

  return async () => {
    // Clean up all anvil instances and the anvil pool manager itself.
    const anvils = Array.from(instances.values())
    await Promise.allSettled([
      ...anvils.map(async (anvil) => (await anvil).exit()),
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      }),
    ])
  }
}
