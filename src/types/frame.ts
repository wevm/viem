import type * as Frame_ox from 'ox/Frame'
import type * as FrameSignature_ox from 'ox/FrameSignature'

/** A call frame in an EIP-8141 transaction. */
export type Frame<quantity = bigint> = Frame_ox.Frame<quantity>

/** An EIP-8141 signature entry, including unsigned placeholders. */
export type FrameSignature = FrameSignature_ox.FrameSignature
