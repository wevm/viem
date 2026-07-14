import type { TestProject } from 'vitest/node'

import { createServer } from './src/tempo.js'

export default async function (project: TestProject) {
  if (process.env.SKIP_GLOBAL_SETUP) return
  const server = createServer({ limit: project.config.maxWorkers })
  return await server.start()
}
