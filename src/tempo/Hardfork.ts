export const hardforks = [
  'genesis',
  't0',
  't1',
  't1a',
  't1b',
  't1c',
  't2',
  't3',
  't4',
  't5',
  't6',
] as const

export type Hardfork = (typeof hardforks)[number]

/** Returns `true` if `current` is before `target`. */
export function lt(current: string, target: Hardfork): boolean {
  return hardforks.indexOf(current as Hardfork) < hardforks.indexOf(target)
}
