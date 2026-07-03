import { createServer, port } from './src/tempo.js'

export default async function () {
  const server = await createServer()
  const stop = await server.start()

  // An arbitrary request triggers the Docker image pull + node start.
  await fetch(`http://localhost:${port}/1/start`)

  return stop
}
