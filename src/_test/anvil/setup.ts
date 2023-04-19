import { Anvil } from './anvil.js'
import { setAutomine, setIntervalMining } from '../../test.js'
import { testClient } from '../utils.js'
import { afterEach, beforeAll } from 'vitest'
import { anvilPort } from './port.js'

let anvil: Anvil | undefined

export function setupAnvil(callback?: () => Promise<void> | void) {
  // Start a shared anvil instance for every test file.
  beforeAll(async () => {
    anvil = await Anvil.start({
      port: anvilPort,
      forkUrl: process.env.VITE_ANVIL_FORK_URL,
      forkBlockNumber: Number(process.env.VITE_ANVIL_BLOCK_NUMBER),
      blockTime: Number(process.env.VITE_ANVIL_BLOCK_TIME),
    })

    await setAutomine(testClient, false)
    await setIntervalMining(testClient, { interval: 1 })

    await callback?.()

    return async () => {
      // Stop the anvil instance after all tests have run.
      await anvil?.exit()
    }
  })

  // Print the last log entries from anvil after each test.
  afterEach((context) => {
    context.onTestFailed((result) => {
      const logs = anvil?.logs() ?? []
      const messages = logs.slice(1).map((item) => item.trim())

      if (messages.length === 0) {
        return
      }

      // Try to append the log messages to the vitest error message. If that's not possible, print them to the console.
      const error = result.errors?.[0]
      const seperator =
        '======================================================================'

      if (error !== undefined) {
        error.message += '\n\nAnvil logs'
        error.message += `\n${seperator}`
        error.message += `\n${messages.join('\n')}`
        error.message += `\n${seperator}`
      } else {
        console.log(
          `Anvil logs (${
            context.meta.file ? `${context.meta.file.name} > ` : ''
          }${context.meta.name})\n${seperator}`,
        )

        for (const log of messages) {
          console.log(log)
        }

        console.log(`${seperator}`)
      }
    })
  })
}
