import type {
  Hex,
  TransactionRequestEIP1559,
  TransactionType,
  TransactionRequestEIP2930,
  TransactionRequestLegacy,
  Signature,
  TransactionRequestByType,
} from "../../types";
import type { RecursiveArray } from "../encoding/toRlp";
import { toHex, toRlp } from "../encoding";
import { concatHex } from "../data";
import { isAddress } from "../address";
import { InvalidAddressError } from "../../errors";
import {
  assertTransactionEIP1559,
  assertTransactionNonEIP1559,
} from "./assertTransaction";
import { isHash } from "../hash/isHash";
import { InvalidHashError } from "../../errors/address";

function serializeTransactionEIP1559(
  transaction: Omit<TransactionRequestEIP1559, "from"> & { chainId: number },
  signature?: Signature
) {
  const {
    chainId,
    gas,
    nonce,
    to,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
    accessList,
    data,
  } = transaction;

  assertTransactionEIP1559(transaction);

  const encodedTo = to ?? "0x";
  const encondedAccessList: RecursiveArray<Hex> = [];

  if (accessList && accessList.length !== 0) {
    for (let i = 0; i < accessList.length; i++) {
      const { address, storageKeys } = accessList[i];

      if (!isAddress(address)) {
        throw new InvalidAddressError({ address });
      }

      const validateStorageKeys = storageKeys.every((val) => isHash(val));

      if (!validateStorageKeys) {
        throw new InvalidHashError({ hash: storageKeys });
      }
      encondedAccessList.push(address, storageKeys);
    }
  }

  const encodedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : "0x",
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? toHex(maxFeePerGas) : "0x",
    gas ? toHex(gas) : "0x",
    encodedTo,
    value ? toHex(value) : "0x",
    data ?? "0x",
    encondedAccessList,
  ];

  if (signature) {
    encodedTransaction.push(
      signature.v === 27n ? "0x" : toHex(1),
      signature.r,
      signature.s
    );
  }

  return concatHex(["0x02", toRlp(encodedTransaction)]);
}

function serializeTransactionEIP2930(
  transaction: Omit<TransactionRequestEIP2930, "from"> & { chainId: number },
  signature?: Signature
) {
  const { chainId, gas, data, nonce, to, value, accessList, gasPrice } =
    transaction;

  assertTransactionNonEIP1559("eip2930", transaction);

  const encodedTo = to ?? "0x";
  const encondedAccessList: RecursiveArray<Hex> = [];

  if (accessList && accessList.length !== 0) {
    for (let i = 0; i < accessList.length; i++) {
      const { address, storageKeys } = accessList[i];

      if (!isAddress(address)) {
        throw new InvalidAddressError({ address });
      }

      const validateStorageKeys = storageKeys.every((val) => isHash(val));

      if (!validateStorageKeys) {
        throw new InvalidHashError({ hash: storageKeys });
      }

      encondedAccessList.push(address, storageKeys);
    }
  }

  const encodedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : "0x",
    gasPrice ? toHex(gasPrice) : "0x",
    gas ? toHex(gas) : "0x",
    encodedTo,
    value ? toHex(value) : "0x",
    data ?? "0x",
    encondedAccessList,
  ];

  if (signature) {
    encodedTransaction.push(
      signature.v === 27n ? "0x" : toHex(1),
      signature.r,
      signature.s
    );
  }

  return concatHex(["0x01", toRlp(encodedTransaction)]);
}

function serializeTransactionLegacy(
  transaction: Omit<TransactionRequestLegacy, "from"> & { chainId: number },
  signature?: Signature
) {
  const { chainId, gas, data, nonce, to, value, gasPrice } = transaction;

  assertTransactionNonEIP1559("legacy", transaction);

  const encodedTo = to ?? "0x";

  const encodedTransaction = [
    nonce ? toHex(nonce) : "0x",
    gasPrice ? toHex(gasPrice) : "0x",
    gas ? toHex(gas) : "0x",
    encodedTo,
    value ? toHex(value) : "0x",
    data ?? "0x",
  ];

  if (signature) {
    return toRlp([
      ...encodedTransaction,
      toHex(BigInt(chainId * 2) + BigInt(35n + signature.v - 27n)),
      signature.r,
      signature.s,
    ]);
  }

  return toRlp([...encodedTransaction, toHex(chainId), "0x", "0x"]);
}

export function serializeTransaction<
  TType extends TransactionType,
  TTransactionType extends TransactionRequestByType[TType],
  TSignature extends Signature
>(
  type: TType,
  transactionType: TTransactionType & {
    chainId: number;
  },
  signature?: TSignature
) {
  if (type === "eip1559") {
    return serializeTransactionEIP1559(
      transactionType as TransactionRequestByType["eip1559"] & {
        chainId: number;
      },
      signature
    );
  }

  if (type === "eip2930") {
    return serializeTransactionEIP2930(
      transactionType as TransactionRequestByType["eip2930"] & {
        chainId: number;
      },
      signature
    );
  }

  return serializeTransactionLegacy(
    transactionType as TransactionRequestByType["legacy"] & { chainId: number },
    signature
  );
}
