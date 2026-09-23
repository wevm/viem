import type {
  Frame as Frame_ox,
  FrameReceipt as FrameReceipt_ox,
  FrameSignature as FrameSignature_ox,
} from 'ox'

export type Frame<quantity = bigint> = Frame_ox.Frame<quantity>

export type FrameReceipt<quantity = bigint> =
  FrameReceipt_ox.FrameReceipt<quantity>

export type FrameSignature = FrameSignature_ox.FrameSignature
