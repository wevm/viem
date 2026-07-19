import { Server } from 'prool/vitest'
import type { TestProject } from 'vitest/node'

import { createInstance, port } from './src/tempo.js'

declare module 'vitest' {
  export interface ProvidedContext {
    tempoServer: Server.Context
  }
}

const setupServer = Server.setup({
  // Zone containers reach this proxy through host.docker.internal.
  host: '::',
  instance: createInstance(),
  port,
  setup(server, project: TestProject) {
    project.provide('tempoServer', server)
  },
})

export default async function (project: TestProject) {
  if (process.env.OFFLINE) return
  return setupServer(project)
}
