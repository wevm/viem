type Mode = 'anvil' | 'ganache' | 'hardhat'

export type Options = {
  /** Test node mode. */
  mode?: Mode | undefined
}

export function getMode(mode: Mode | undefined) {
  return mode ?? 'anvil'
}

export function getModeMethod<
  const mode extends Mode,
  const method extends string,
>(mode: mode, method: method) {
  return `${mode}_${method}` as `${mode}_${method}`
}

export declare namespace getMode {
  type ErrorType = never
}

export declare namespace getModeMethod {
  type ErrorType = never
}
