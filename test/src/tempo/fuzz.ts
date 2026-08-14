import type { Parameters } from 'fast-check'

function readInteger(name: string, fallback: number) {
  const value = process.env[name]
  if (!value) return fallback
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed))
    throw new Error(`\`${name}\` must be a safe integer.`)
  return parsed
}

export function fuzzParameters(
  defaultRuns: number,
  options: { runsVariable?: string | undefined } = {},
): Pick<Parameters<unknown>, 'numRuns' | 'path' | 'seed'> {
  const { runsVariable = 'FUZZ_RUNS' } = options
  const seed = process.env.FUZZ_SEED
  const path = process.env.FUZZ_PATH

  if (path && !seed) throw new Error('`FUZZ_PATH` requires `FUZZ_SEED`.')

  return {
    numRuns: readInteger(runsVariable, defaultRuns),
    ...(seed ? { seed: readInteger('FUZZ_SEED', 0) } : {}),
    ...(path ? { path } : {}),
  }
}
