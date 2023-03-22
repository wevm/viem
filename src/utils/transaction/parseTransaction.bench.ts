import { bench, describe } from "vitest";
import { parseTransaction } from "./parseTransaction";
import { parseTransaction as parseTransactionEthers } from "ethers/lib/utils";
import { Transaction } from "ethers@6";

describe("parse transaction", () => {
  const serializedEip1559 =
    "0x02f101820311847735940084773594008252099470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0";
  const serializedEip2930 =
    "0x01ec0182031184773594008252099470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0";
  const serializedLegacy =
    "0xed82031184773594008252099470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080018080";

  bench("viem: `parseTransaction EIP1559`", () => {
    parseTransaction(serializedEip1559);
  });

  bench("ethers: `parseTransactionEthers EIP1559`", () => {
    parseTransactionEthers(serializedEip1559);
  });

  bench("ethersv6: `parseTransactionEthers EIP1559`", () => {
    Transaction.from(serializedEip1559);
  });

  bench("viem: `parseTransaction EIP2930`", () => {
    parseTransaction(serializedEip2930);
  });

  bench("ethers: `parseTransactionEthers EIP2930`", () => {
    parseTransactionEthers(serializedEip2930);
  });

  bench("ethersv6: `parseTransactionEthers EIP2930`", () => {
    Transaction.from(serializedEip2930);
  });

  bench("viem: `parseTransaction Legacy`", () => {
    parseTransaction(serializedLegacy);
  });

  bench("ethers: `parseTransactionEthers Legacy`", () => {
    parseTransactionEthers(serializedLegacy);
  });

  bench("ethersv6: `parseTransactionEthers Legacy`", () => {
    Transaction.from(serializedLegacy);
  });
});
