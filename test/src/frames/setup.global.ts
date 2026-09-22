import { createServer, image, revision } from './prool.js'

export default async function () {
  if (process.env.SKIP_GLOBAL_SETUP) return

  console.log(`Nethermind frames: ${image} (revision ${revision})`)
  return createServer().start()
}
