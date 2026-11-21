import { nodeEnv } from './config.js'
import { createServer, port } from './prool.js'

export default async function () {
  if (nodeEnv !== 'localnet') return

  const server = await createServer()
  const stop = await server.start()

  // Arbitrary request to start configured Tempo instance.
  console.log('Starting Tempo server...')
  await fetch(`http://localhost:${port}/1/start`)
  console.log('Tempo server started.')

  return stop
}
