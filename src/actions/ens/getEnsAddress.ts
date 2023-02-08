import { PublicClient } from '../../clients'
import type { Address } from '../../types'
import { readContract } from '../public'

export type GetEnsNameArgs = {
  /** Address to get ENS name for. */
  address: Address
  // TODO: Add block number, etc.
}

/**
 * @description Gets primary name for specified address.
 */
export async function getEnsName(
  client: PublicClient,
  { address }: GetEnsNameArgs,
) {
  const abi = [
    {
      name: 'reverse',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ type: 'bytes', name: 'reverseName' }],
      outputs: [
        { type: 'string', name: 'resolvedName' },
        { type: 'address', name: 'resolvedAddress' },
        { type: 'address', name: 'reverseResolver' },
        { type: 'address', name: 'resolver' },
      ],
    },
  ] as const
  const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`
  const res = await readContract(client, {
    abi,
    address: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    functionName: 'reverse',
    args: [`0x${encode(reverseNode).toString('hex')}`],
  })
  return res[0]
}

// adapted from https://github.com/mafintosh/dns-packet
function encode(str: string) {
  function encodingLength(n: string) {
    if (n === '.' || n === '..') return 1
    return Buffer.byteLength(n.replace(/^\.|\.$/gm, '')) + 2
  }

  const buf = Buffer.alloc(encodingLength(str))
  let offset = 0

  // strip leading and trailing .
  const n = str.replace(/^\.|\.$/gm, '')
  if (n.length) {
    const list = n.split('.')

    for (let i = 0; i < list.length; i++) {
      const len = buf.write(list[i], offset + 1)
      buf[offset] = len
      offset += len + 1
    }
  }

  return buf
}
