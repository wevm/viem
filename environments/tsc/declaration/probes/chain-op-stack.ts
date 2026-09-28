// wevm/viem#1842 class: re-exporting a chain whose config carries serializer/codec
// function types (celo then; the OP Stack config here).
import { optimism } from 'viem/chains'

export const chain = optimism
