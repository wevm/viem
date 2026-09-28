import { Server } from 'prool/vitest'
import type { TestProject } from 'vitest/node'

import { createInstance, port } from './src/tempo.js'

declare module 'vitest' {
  export interface ProvidedContext {
    tempoServer: Server.Context
  }
}

export default async function (project: TestProject) {
  if (process.env.OFFLINE) return
  const setupServer = Server.setup({
    // Zone containers reach this proxy through host.docker.internal.
    host: '::',
    instance: createInstance({
      zones: process.env.VITE_TEMPO_ZONES === 'true',
    }),
    port,
    setup(server, project: TestProject) {
      project.provide('tempoServer', server)
    },
  })
  return setupServer(project)
}
