// Copied from arktype https://github.com/arktypeio/arktype/tree/main/dev/attest/src

import { caller } from './caller.js'
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { URL, fileURLToPath } from 'node:url'

export type ShellOptions = Prettify<
  Parameters<typeof execSync>[1] & {
    env?: Record<string, unknown>
    stdio?: 'pipe' | 'inherit'
    returnOutput?: boolean
  }
>

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

const dirOfCaller = () =>
  dirname(filePath(caller({ methodName: 'dirOfCaller', upStackBy: 1 }).file))

export const filePath = (path: string) => {
  let file
  if (path.includes('://')) {
    // is a url, e.g. file://, or https://
    const url = new URL(path)
    file = url.protocol === 'file:' ? fileURLToPath(url) : url.href
  } else {
    // is already a typical path
    file = path
  }
  return file
}

export const shell = (
  cmd: string,
  { returnOutput, env, ...otherOptions }: ShellOptions = {},
): string =>
  execSync(cmd, {
    stdio: returnOutput ? 'pipe' : 'inherit',
    env: { ...process.env, ...env },
    ...otherOptions,
  })?.toString() ?? ''

export const fromHere = (...joinWith: string[]) =>
  join(dirOfCaller(), ...joinWith)
