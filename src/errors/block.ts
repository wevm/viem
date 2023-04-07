import type { Hash } from '../types/index.js'
import { BaseError } from './base.js'

export class BlockNotFoundError extends BaseError {
  name = 'BlockNotFoundError'
  constructor({
    blockHash,
    blockNumber,
  }: {
    blockHash?: Hash
    blockNumber?: bigint
  }) {
    let identifier = 'Block'
    if (blockHash) identifier = `Block at hash "${blockHash}"`
    if (blockNumber) identifier = `Block at number "${blockNumber}"`
    super(`${identifier} could not be found.`)
  }
}
