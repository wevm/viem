---
"viem": major
---

Transaction envelope serialization, parsing, hashing, and type detection moved from flat helpers to `TxEnvelope` and the per-type envelope namespaces.

```diff
-import { getSerializedTransactionType, getTransactionType, parseTransaction, serializeTransaction } from 'viem'
+import { TxEnvelope, TxEnvelopeEip1559, TxEnvelopeEip2930, TxEnvelopeEip4844, TxEnvelopeEip7702, TxEnvelopeLegacy } from 'viem'
 
-const serialized = serializeTransaction(transaction)
-const transaction = parseTransaction(serialized)
-const type = getTransactionType(transaction)
-const serializedType = getSerializedTransactionType(serialized)
+const serialized = TxEnvelope.serialize(envelope)
+const envelope = TxEnvelope.from(serialized)
+const type = TxEnvelope.getType(envelope)
+const serializedType = TxEnvelope.getSerializedType(serialized)
+const eip1559 = TxEnvelopeEip1559.from(envelope)
+const eip2930 = TxEnvelopeEip2930.from(envelope)
+const eip4844 = TxEnvelopeEip4844.from(envelope)
+const eip7702 = TxEnvelopeEip7702.from(envelope)
+const legacy = TxEnvelopeLegacy.from(envelope)
```

Transaction, receipt, and request formatters moved from flat formatter exports to `Transaction`, `TransactionReceipt`, and `TransactionRequest` RPC conversion namespaces.

```diff
-import { formatTransaction, formatTransactionReceipt, formatTransactionRequest } from 'viem'
+import { Transaction, TransactionReceipt, TransactionRequest } from 'viem'
 
-const transaction = formatTransaction(rpcTransaction)
-const receipt = formatTransactionReceipt(rpcReceipt)
-const request = formatTransactionRequest(request)
+const transaction = Transaction.fromRpc(rpcTransaction)
+const receipt = TransactionReceipt.fromRpc(rpcReceipt)
+const rpcRequest = TransactionRequest.toRpc(request)
```

Access list and authorization conversions moved from flat helpers to the `AccessList` and `Authorization` namespaces.

```diff
-import { serializeAccessList } from 'viem'
+import { AccessList, Authorization } from 'viem'
 
-const tuple = serializeAccessList(accessList)
+const tuple = AccessList.toTupleList(accessList)
+const accessList = AccessList.fromTupleList(tuple)
+const authorization = Authorization.fromRpc(rpcAuthorization)
+const rpcAuthorization = Authorization.toRpc(authorization)
```

Withdrawal, fee history, and account proof RPC formatting moved to the `Withdrawal`, `Fee`, and `AccountProof` namespaces.

```diff
+import { AccountProof, Fee, Withdrawal } from 'viem'
+
-const withdrawal = { ...rpcWithdrawal, amount: BigInt(rpcWithdrawal.amount) }
-const feeHistory = { ...rpcFeeHistory, baseFeePerGas: rpcFeeHistory.baseFeePerGas.map(BigInt) }
-const accountProof = { ...rpcAccountProof, balance: BigInt(rpcAccountProof.balance) }
+const withdrawal = Withdrawal.fromRpc(rpcWithdrawal)
+const feeHistory = Fee.fromHistoryRpc(rpcFeeHistory)
+const accountProof = AccountProof.fromRpc(rpcAccountProof)
```

Per-type transaction assertions moved to the envelope namespaces, and the transaction-type wire maps moved to `Transaction`.

```diff
-import { assertTransactionEIP1559, assertTransactionEIP2930, assertTransactionLegacy, rpcTransactionType, transactionType } from 'viem'
+import { Transaction, TxEnvelopeEip1559, TxEnvelopeEip2930, TxEnvelopeLegacy } from 'viem'

-assertTransactionEIP1559(transaction)
-assertTransactionEIP2930(transaction)
-assertTransactionLegacy(transaction)
+TxEnvelopeEip1559.assert(envelope)
+TxEnvelopeEip2930.assert(envelope)
+TxEnvelopeLegacy.assert(envelope)

-const type = transactionType['0x2']
-const rpcType = rpcTransactionType.eip1559
+const type = Transaction.fromRpcType['0x2']
+const rpcType = Transaction.toRpcType.eip1559
```

`assertRequest` was internalized into the `Actions.transaction` pipeline (envelope-level validation remains public via `TxEnvelope.assert`/`TxEnvelope.validate`), and the type-level `GetTransactionRequestKzgParameter` requirement was replaced by a runtime `TransactionRequest.MissingKzgError`.

```diff
-import { assertRequest, type GetTransactionRequestKzgParameter } from 'viem'
+import { TxEnvelope } from 'viem'

-assertRequest(args)
+TxEnvelope.assert(envelope)
```
