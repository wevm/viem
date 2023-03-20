import { fromRlp, hexToBigInt, hexToNumber } from "../encoding";
import type {
  Hex,
  TransactionRequestEIP1559,
  TransactionRequestEIP2930,
  TransactionRequestLegacy,
  AccessList,
  Signature,
  TransactionType,
} from "../../types";
import { transactionType } from "../formatters";
import { InvalidTransactionTypeError } from "../../errors/transaction";
import { isAddress } from "ethers@6";
import { InvalidAddressError } from "../../errors";
import {
  assertTransactionEIP1559,
  assertTransactionNonEIP1559,
} from "./assertTransaction";
import { InvalidChainIdError } from "../../errors/chain";
import { InvalidHashError } from "../../errors/address";
import { isHash } from "../hash/isHash";
import type {
  EIP1559Serialized,
  EIP2930Serialized,
} from "../../types/transaction";

export function parseTransactionEIP1559(
  encodedTransaction: EIP1559Serialized
): Omit<TransactionRequestEIP1559, "from"> &
  ({ chainId: number } | ({ chainId: number } & Signature)) {
  if (!encodedTransaction.startsWith("0x02")) {
    throw new InvalidTransactionTypeError({
      type: transactionType[
        encodedTransaction.startsWith("0x01") ? "0x1" : "0x0"
      ],
    });
  }

  const decodedTransaction = fromRlp(
    `0x${encodedTransaction.slice(4)}` as Hex,
    "hex"
  );

  if (!(decodedTransaction.length === 9 || decodedTransaction.length === 12)) {
    throw new InvalidTransactionTypeError({ type: "eip1559" });
  }

  const [
    chainId,
    nonce,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gas,
    to,
    value,
    data,
    accessList,
  ] = decodedTransaction;

  const baseTransaction = {
    chainId: hexToNumber(chainId as Hex),
    to: to as Hex,
    maxFeePerGas: hexToBigInt(maxFeePerGas as Hex),
    maxPriorityFeePerGas: hexToBigInt(maxPriorityFeePerGas as Hex),
  };

  assertTransactionEIP1559(baseTransaction);

  const accessListDecoded: AccessList = [];

  if (accessList.length !== 0) {
    for (let i = 0; i < accessList.length - 1; i += 2) {
      const address = accessList[i] as Hex;
      const storageKeys = accessList[i + 1] as Hex[];

      if (!isAddress(address)) {
        throw new InvalidAddressError({ address });
      }

      const validateStorageKeys = storageKeys.every((val) => isHash(val));

      if (!validateStorageKeys) {
        throw new InvalidHashError({ hash: storageKeys });
      }

      accessListDecoded.push({
        address: address,
        storageKeys: storageKeys,
      });
    }
  }

  const fulltransaction = {
    ...baseTransaction,
    gas: hexToBigInt(gas as Hex),
    data: data as Hex,
    nonce: hexToNumber(nonce as Hex),
    value: hexToBigInt(value as Hex),
    accessList: accessListDecoded,
  };

  if (decodedTransaction.length === 12) {
    return {
      ...fulltransaction,
      v: hexToBigInt(decodedTransaction[9] as Hex) === 0n ? 27n : 28n,
      r: decodedTransaction[10] as Hex,
      s: decodedTransaction[11] as Hex,
    };
  }

  return fulltransaction;
}

export function parseTransactionEIP2930(
  encodedTransaction: EIP2930Serialized
): Omit<TransactionRequestEIP2930, "from"> &
  ({ chainId: number } | ({ chainId: number } & Signature)) {
  if (!encodedTransaction.startsWith("0x01")) {
    throw new InvalidTransactionTypeError({
      type: transactionType[
        encodedTransaction.startsWith("0x02") ? "0x1" : "0x0"
      ],
    });
  }

  const decodedTransaction = fromRlp(
    `0x${encodedTransaction.slice(4)}` as Hex,
    "hex"
  );

  if (!(decodedTransaction.length === 8 || decodedTransaction.length === 11)) {
    throw new InvalidTransactionTypeError({ type: "eip2930" });
  }

  const [chainId, nonce, gasPrice, gas, to, value, data, accessList] =
    decodedTransaction;

  const baseTransaction = {
    chainId: hexToNumber(chainId as Hex),
    to: to as Hex,
    gasPrice: hexToBigInt(gasPrice as Hex),
  };

  assertTransactionNonEIP1559("eip2930", baseTransaction);

  const accessListDecoded: AccessList = [];

  if (accessList.length !== 0) {
    for (let i = 0; i < accessList.length - 1; i += 2) {
      const address = accessList[i] as Hex;
      const storageKeys = accessList[i + 1] as Hex[];

      if (!isAddress(address)) {
        throw new InvalidAddressError({ address });
      }

      const validateStorageKeys = storageKeys.every((val) => isHash(val));

      if (!validateStorageKeys) {
        throw new InvalidHashError({ hash: storageKeys });
      }

      accessListDecoded.push({
        address: address,
        storageKeys: storageKeys,
      });
    }
  }

  const fulltransaction = {
    ...baseTransaction,
    gas: hexToBigInt(gas as Hex),
    data: data as Hex,
    nonce: hexToNumber(nonce as Hex),
    value: hexToBigInt(value as Hex),
    accessList: accessListDecoded,
  };

  if (decodedTransaction.length === 11) {
    return {
      ...fulltransaction,
      v: hexToBigInt(decodedTransaction[8] as Hex) === 0n ? 27n : 28n,
      r: decodedTransaction[9] as Hex,
      s: decodedTransaction[10] as Hex,
    };
  }

  return fulltransaction;
}

export function parseTransactionLegacy(
  encodedTransaction: Hex
): Omit<TransactionRequestLegacy, "from"> &
  ({ chainId?: number } | ({ chainId: number } & Signature)) {
  if (
    encodedTransaction.startsWith("0x01") ||
    encodedTransaction.startsWith("0x02")
  ) {
    throw new InvalidTransactionTypeError({
      type: transactionType[
        encodedTransaction.startsWith("0x02") ? "0x2" : "0x1"
      ],
    });
  }

  const decodedTransaction = fromRlp(encodedTransaction, "hex");

  if (!(decodedTransaction.length === 6 || decodedTransaction.length === 9)) {
    throw new InvalidTransactionTypeError({ type: "legacy" });
  }

  const [nonce, gasPrice, gas, to, value, data, chainIdOrV, r, s] =
    decodedTransaction;

  const baseTransaction = {
    to: to as Hex,
    gasPrice: hexToBigInt(gasPrice as Hex),
  };

  assertTransactionNonEIP1559("legacy", { ...baseTransaction });

  const fulltransaction = {
    ...baseTransaction,
    gas: hexToBigInt(gas as Hex),
    data: data as Hex,
    nonce: hexToNumber(nonce as Hex),
    value: hexToBigInt(value as Hex),
  };

  if (decodedTransaction.length === 6) {
    return fulltransaction;
  }

  if (s === "0x" && r === "0x") {
    return {
      ...fulltransaction,
      chainId: hexToNumber(chainIdOrV as Hex),
    };
  }

  const v = hexToBigInt(chainIdOrV as Hex);
  const chainId = (v - 35n) / 2n;

  if (chainId <= 0n) {
    throw new InvalidChainIdError({ chainId: Number(chainId) });
  }

  return {
    ...fulltransaction,
    chainId: Number(chainId),
    v,
    s: s as Hex,
    r: r as Hex,
  };
}

export function parseTransaction<
  TOptions extends
    | {
        type: "eip1559";
        encodedTransaction: EIP1559Serialized;
      }
    | {
        type: "eip2930";
        encodedTransaction: EIP2930Serialized;
      }
    | {
        type: "legacy";
        encodedTransaction: Hex;
      }
>(transactionOptions: TOptions) {
  if (transactionOptions.type === "eip1559") {
    return parseTransactionEIP1559(transactionOptions.encodedTransaction);
  }

  if (transactionOptions.type === "eip2930") {
    return parseTransactionEIP2930(transactionOptions.encodedTransaction);
  }

  return parseTransactionLegacy(transactionOptions.encodedTransaction);
}
