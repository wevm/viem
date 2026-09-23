import type {
  Address,
  CallParameters,
  EstimateGasParameters,
  FillTransactionParameters,
  Frame,
  FrameReceipt,
  FrameSignature,
  GetBlockReturnType,
  GetTransactionReceiptReturnType,
  GetTransactionReturnType,
  Hex,
  RpcFrame,
  RpcFrameReceipt,
  RpcFrameSignature,
  RpcTransaction,
  RpcTransactionReceipt,
  RpcTransactionRequest,
  Transaction,
  TransactionEIP8141,
  TransactionRequest,
  WaitForTransactionReceiptReturnType,
} from 'viem'
import { expectTypeOf, test } from 'vitest'

test('frame transaction requests compose with public actions', () => {
  const request = {
    chainId: 8141,
    frames: [
      { flags: 'approveExecutionAndPayment', gas: 50_000n, mode: 'verify' },
    ],
    nonce: 0,
    signatures: [{ scheme: 'secp256k1' }],
    type: 'eip8141',
  } as const satisfies TransactionRequest
  expectTypeOf(request).toExtend<CallParameters>()
  expectTypeOf(request).toExtend<EstimateGasParameters>()
  expectTypeOf({
    ...request,
    account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' as const,
    chain: null,
  }).toExtend<FillTransactionParameters>()
  expectTypeOf({
    ...request,
    type: 'eip1559',
  } as const).not.toExtend<TransactionRequest>()
  expectTypeOf({
    ...request,
    chainId: 8141n,
  }).not.toExtend<TransactionRequest>()
})

test('frame transaction response narrows by type', () => {
  type FrameTransaction = Extract<Transaction, { type: 'eip8141' }>
  expectTypeOf<FrameTransaction['chainId']>().toEqualTypeOf<number>()
  expectTypeOf<FrameTransaction['frames']>().toEqualTypeOf<readonly Frame[]>()
  expectTypeOf<FrameTransaction['from']>().toEqualTypeOf<Address>()
  expectTypeOf<FrameTransaction['nonce']>().toEqualTypeOf<number>()
  expectTypeOf<FrameTransaction['signatures']>().toEqualTypeOf<
    readonly FrameSignature[]
  >()
  expectTypeOf<FrameTransaction['r']>().toEqualTypeOf<undefined>()
  expectTypeOf<FrameTransaction['v']>().toEqualTypeOf<undefined>()
  expectTypeOf<FrameTransaction['yParity']>().toEqualTypeOf<undefined>()
  expectTypeOf<
    TransactionEIP8141<bigint, number, true>['blockNumber']
  >().toEqualTypeOf<null>()
  expectTypeOf<
    TransactionEIP8141<bigint, number, false>['blockNumber']
  >().toEqualTypeOf<bigint>()
  expectTypeOf<
    Extract<GetTransactionReturnType, { type: 'eip8141' }>['frames']
  >().toEqualTypeOf<readonly Frame[]>()
  expectTypeOf<
    Extract<
      GetBlockReturnType<undefined, true>['transactions'][number],
      { type: 'eip8141' }
    >['signatures']
  >().toEqualTypeOf<readonly FrameSignature[]>()
  expectTypeOf<
    GetTransactionReceiptReturnType['frameReceipts']
  >().toEqualTypeOf<readonly FrameReceipt[] | undefined>()
  expectTypeOf<WaitForTransactionReceiptReturnType['payer']>().toEqualTypeOf<
    Address | undefined
  >()
  expectTypeOf<FrameReceipt['status']>().toEqualTypeOf<
    'reverted' | 'skipped' | 'success'
  >()
})

test('RPC frames retain wire field names and numeric discriminants', () => {
  type Request = Extract<RpcTransactionRequest, { type?: '0x6' | undefined }>
  type Transaction = Extract<RpcTransaction, { type: '0x6' }>
  expectTypeOf<Request['frames']>().toEqualTypeOf<readonly RpcFrame[]>()
  expectTypeOf<Request['signatures']>().toEqualTypeOf<
    readonly RpcFrameSignature[] | undefined
  >()
  expectTypeOf<Transaction['frames']>().toEqualTypeOf<readonly RpcFrame[]>()
  expectTypeOf<Transaction['signatures']>().toEqualTypeOf<
    readonly RpcFrameSignature[]
  >()
  expectTypeOf<Transaction['chainId']>().toEqualTypeOf<Hex>()
  expectTypeOf<RpcFrame['executionGasLimit']>().toEqualTypeOf<Hex>()
  expectTypeOf<RpcFrameSignature['scheme']>().toEqualTypeOf<0 | 1 | 2>()
  expectTypeOf<RpcTransactionReceipt['frameReceipts']>().toEqualTypeOf<
    readonly RpcFrameReceipt[] | undefined
  >()
})
