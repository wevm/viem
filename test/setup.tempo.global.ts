import { createServer, port } from './src/tempo.js'

export default async function () {
  if (process.env.SKIP_GLOBAL_SETUP) return
  const server = await createServer()
  const stop = await server.start()

  // An arbitrary request triggers the Docker image pull + node start.
  await fetch(`http://localhost:${port}/1/start`)

  return stop
}
