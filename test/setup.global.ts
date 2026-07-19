import { Instance } from 'prool'
import { Server } from 'prool/vitest'
import type { TestProject } from 'vitest/node'

import { instances } from './src/instances.js'

type CoreServers = {
  anvils: Record<number, Server.Context>
  bundlers: Record<number, Server.Context>
}

type ServerDefinition = {
  instance: Instance.Instance | ((key: number) => Instance.Instance)
  port: number
}

type ServerGroup = {
  contexts: Record<number, Server.Context>
  definitions: readonly ServerDefinition[]
}

declare module 'vitest' {
  export interface ProvidedContext {
    coreServers: CoreServers
  }
}

export default async function (project: TestProject) {
  if (process.env.SKIP_GLOBAL_SETUP) return
  const coreServers: CoreServers = { anvils: {}, bundlers: {} }
  const groups: readonly ServerGroup[] = [
    { contexts: coreServers.anvils, definitions: instances.anvils },
    { contexts: coreServers.bundlers, definitions: instances.bundlers },
  ]
  const shutdowns: (() => Promise<void>)[][] = []
  try {
    for (const { contexts, definitions } of groups) {
      const shutdowns_: (() => Promise<void>)[] = []
      shutdowns.push(shutdowns_)
      for (const definition of definitions) {
        const setupServer = Server.setup({
          instance: definition.instance,
          port: definition.port,
          setup(server) {
            contexts[definition.port] = server
          },
        })
        shutdowns_.push(await setupServer(project))
      }
    }
    project.provide('coreServers', coreServers)
  } catch (error) {
    await Promise.allSettled(
      shutdowns
        .flat()
        .reverse()
        .map((shutdown) => shutdown()),
    )
    throw error
  }
  return async () => {
    for (const group of shutdowns.reverse())
      await Promise.all(group.map((shutdown) => shutdown()))
  }
}
