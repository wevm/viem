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
import { InvalidTransactionTypeError } from "../../errors/transaction";
import { isAddress } from "ethers@6";
import { InvalidAddressError } from "../../errors";
import {
  assertTransactionEIP1559,
  assertTransactionEIP2930,
  assertTransactionLegacy,
} from "./assertTransaction";
import { PreEIP155NotSupportedError } from "../../errors/chain";
import { InvalidHashError } from "../../errors/address";
import { isHash } from "../hash/isHash";
import type {
  EIP1559Serialized,
  EIP2930Serialized,
  SerializedTransactionReturnType,
} from "../../types/transaction";

export function parseTransactionEIP1559(
  serializedTransaction: EIP1559Serialized
): Omit<TransactionRequestEIP1559, "from"> &
  ({ chainId: number } | ({ chainId: number } & Signature)) {
  const decodedTransaction = fromRlp(
    `0x${serializedTransaction.slice(4)}` as Hex,
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
    for (let i = 0; i < accessList.length; i++) {
      const [address, storageKeys] = accessList[i] as [Hex, Hex[]];
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
    if (
      !(
        isHash(decodedTransaction[10] as string) &&
        isHash(decodedTransaction[11] as string)
      )
    ) {
      throw new InvalidHashError({
        hash: [
          decodedTransaction[10] as string,
          decodedTransaction[11] as string,
        ],
      });
    }

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
  serializedTransaction: EIP2930Serialized
): Omit<TransactionRequestEIP2930, "from"> &
  ({ chainId: number } | ({ chainId: number } & Signature)) {
  const decodedTransaction = fromRlp(
    `0x${serializedTransaction.slice(4)}` as Hex,
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

  assertTransactionEIP2930(baseTransaction);

  const accessListDecoded: AccessList = [];

  if (accessList.length !== 0) {
    for (let i = 0; i < accessList.length; i++) {
      const [address, storageKeys] = accessList[i] as [Hex, Hex[]];

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
    if (
      !(
        isHash(decodedTransaction[9] as string) &&
        isHash(decodedTransaction[10] as string)
      )
    ) {
      throw new InvalidHashError({
        hash: [
          decodedTransaction[9] as string,
          decodedTransaction[10] as string,
        ],
      });
    }

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
  serializedTransaction: Hex
): Omit<TransactionRequestLegacy, "from"> &
  ({ chainId?: number } | ({ chainId: number } & Signature)) {
  const decodedTransaction = fromRlp(serializedTransaction, "hex");

  if (!(decodedTransaction.length === 6 || decodedTransaction.length === 9)) {
    throw new InvalidTransactionTypeError({ type: "legacy" });
  }

  const [nonce, gasPrice, gas, to, value, data, chainIdOrV, r, s] =
    decodedTransaction;

  const baseTransaction = {
    to: to as Hex,
    gasPrice: hexToBigInt(gasPrice as Hex),
  };

  assertTransactionLegacy(baseTransaction);

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
    const chainId = hexToNumber(chainIdOrV as Hex);

    if (chainId <= 0) {
      throw new PreEIP155NotSupportedError({ chainId: chainId });
    }

    return {
      ...fulltransaction,
      chainId,
    };
  }

  const v = hexToBigInt(chainIdOrV as Hex);
  const chainId = (v - 35n) / 2n;

  if (chainId <= 0n) {
    throw new PreEIP155NotSupportedError({ chainId: Number(chainId) });
  }

  if (!(isHash(s as string) && isHash(r as string))) {
    throw new InvalidHashError({ hash: [r as string, s as string] });
  }

  return {
    ...fulltransaction,
    chainId: Number(chainId),
    v,
    s: s as Hex,
    r: r as Hex,
  };
}

function getSerializedTransactionType<
  TSerialized extends SerializedTransactionReturnType
>(serializedTransaction: TSerialized): TransactionType {
  if (serializedTransaction.startsWith("0x02")) {
    return "eip1559";
  }

  if (serializedTransaction.startsWith("0x01")) {
    return "eip2930";
  }

  return "legacy";
}

export function parseTransaction<
  TSerialized extends SerializedTransactionReturnType
>(serializedTransaction: TSerialized) {
  const type = getSerializedTransactionType(serializedTransaction);

  if (type === "eip1559") {
    return parseTransactionEIP1559(serializedTransaction as EIP1559Serialized);
  }

  if (type === "eip2930") {
    return parseTransactionEIP2930(serializedTransaction as EIP2930Serialized);
  }

  return parseTransactionLegacy(serializedTransaction);
}
