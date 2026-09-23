import type * as Frame_ox from 'ox/Frame'
import type * as FrameReceipt_ox from 'ox/FrameReceipt'
import type * as FrameSignature_ox from 'ox/FrameSignature'

/** A call frame in an EIP-8141 transaction. */
export type Frame<quantity = bigint> = Frame_ox.Frame<quantity>

/** Execution result, gas accounting, and logs for one frame. */
export type FrameReceipt<quantity = bigint> =
  FrameReceipt_ox.FrameReceipt<quantity>

/** An EIP-8141 signature entry, including unsigned placeholders. */
export type FrameSignature = FrameSignature_ox.FrameSignature
