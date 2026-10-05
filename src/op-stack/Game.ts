import type { Errors, Hex } from 'ox'

import * as ViemErrors from '../core/Errors.js'

/** An OP Stack dispute game. */
export type Game = {
  /** Extra game data. */
  extraData: Hex.Hex
  /** Game index. */
  index: bigint
  /** Game metadata. */
  metadata: Hex.Hex
  /** Root claim. */
  rootClaim: Hex.Hex
  /** Game creation timestamp. */
  timestamp: bigint
}

/** Game types that use super roots. */
export const superTypes: ReadonlySet<number> = new Set([4, 5, 7, 9])

/** Returns whether a dispute game type uses super roots. */
export function isSuper(gameType: number): boolean {
  return superTypes.has(gameType)
}

export declare namespace isSuper {
  /** Errors thrown by {@link isSuper}. */
  type ErrorType = Errors.GlobalErrorType
}

/** Thrown when a dispute game cannot be found. */
export class NotFoundError extends ViemErrors.BaseError {
  override name = 'Game.NotFoundError'

  constructor() {
    super('Dispute game not found.')
  }
}
