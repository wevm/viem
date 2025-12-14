import { nodeEnv } from './config.js'
import { createServer } from './prool.js'

export default async function () {
  if (nodeEnv !== 'localnet') return

  const server = await createServer()
  return await server.start()
}
