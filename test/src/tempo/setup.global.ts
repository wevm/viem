import { nodeEnv } from './config.js'
import { createServer, port } from './prool.js'

export default async function () {
  if (nodeEnv !== 'localnet') return

  const server = await createServer()
  const stop = await server.start()

  // Arbitrary request to start server to trigger Docker image download.
  console.log('Downloading Docker image & starting Tempo server...')
  await fetch(`http://localhost:${port}/1/start`)
  console.log('Tempo server started.')

  return stop
}
