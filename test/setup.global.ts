import type { TestProject } from 'vitest/node'

import { instances } from './src/instances.js'

declare module 'vitest' {
  export interface ProvidedContext {
    coreInstances: {
      anvils: readonly number[]
      bundlers: readonly number[]
    }
  }
}

export default async function (project: TestProject) {
  if (process.env.SKIP_GLOBAL_SETUP) return
  project.provide('coreInstances', {
    anvils: instances.anvils.map((instance) => instance.port),
    bundlers: instances.bundlers.map((instance) => instance.port),
  })
  const pool = { limit: project.config.maxWorkers }
  const shutdowns: (() => Promise<void>)[][] = []
  try {
    for (const group of [instances.anvils, instances.bundlers]) {
      const shutdowns_: (() => Promise<void>)[] = []
      shutdowns.push(shutdowns_)
      for (const instance of group) shutdowns_.push(await instance.start(pool))
    }
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
