import type * as Frame_ox from 'ox/Frame'
import type * as FrameReceipt_ox from 'ox/FrameReceipt'
import type * as FrameSignature_ox from 'ox/FrameSignature'

export type Frame<quantity = bigint> = Frame_ox.Frame<quantity>

export type FrameReceipt<quantity = bigint> =
  FrameReceipt_ox.FrameReceipt<quantity>

export type FrameSignature = FrameSignature_ox.FrameSignature
