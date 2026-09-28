import type {
  Frame as Frame_ox,
  FrameReceipt as FrameReceipt_ox,
  FrameSignature as FrameSignature_ox,
} from 'ox'

/** An EIP-8141 call with execution mode, approval flags, and per-frame gas budgets. */
export type Frame<quantity = bigint> = Frame_ox.Frame<quantity>

/** The execution status, gas usage, and logs of an individual EIP-8141 frame. */
export type FrameReceipt<quantity = bigint> =
  FrameReceipt_ox.FrameReceipt<quantity>

/** An EIP-8141 signature entry describing its scheme, signer, payload, and witness. */
export type FrameSignature = FrameSignature_ox.FrameSignature
