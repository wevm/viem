import * as Abis from '../src/tempo/Abis.js'
import * as ExecutionError from '../src/tempo/ExecutionError.js'
import { getSignature as formatAbiItem } from 'ox/AbiItem'

const errors = new Map<string, number>()
for (const item of Abis.core)
  if (item.type === 'error') errors.set(formatAbiItem(item), item.inputs.length)

const messages: Record<string, string> = ExecutionError.messages
const failures = new Set<string>()

for (const [name, inputs] of errors) {
  const message = messages[name]
  if (!message?.trim()) {
    failures.add(`Missing message: ${name}`)
    continue
  }

  for (const match of message.matchAll(/\{(\d+)\}/g))
    if (Number(match[1]) >= inputs)
      failures.add(
        `Invalid placeholder ${match[0]} in ${name}: ABI signature has ${inputs} inputs.`,
      )
}

for (const name of Object.keys(messages))
  if (!errors.has(name)) failures.add(`Unknown ABI error: ${name}`)

if (failures.size > 0) {
  process.stderr.write(
    [
      'Tempo execution errors are out of sync with Abis.core. Update src/tempo/ExecutionError.ts.',
      ...Array.from(failures, (failure) => `  ${failure}`),
      '',
    ].join('\n'),
  )
  process.exitCode = 1
} else
  process.stdout.write(
    `Tempo execution errors are in sync (${errors.size} errors).\n`,
  )
