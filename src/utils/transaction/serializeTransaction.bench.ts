import { bench, describe } from "vitest";
import { serializeTransaction as serializeTransactionEthers } from "ethers/lib/utils";
import { serializeTransaction } from "./serializeTransaction";
import { parseGwei, parseEther } from "../unit";
import { accounts } from "../../_test";

const targetAccount = accounts[1];
const data = "0x" as const;

const BaseTransaction = {
  chainId: 1,
  data,
  to: targetAccount.address,
  nonce: 785,
  value: parseEther("1"),
};

describe("Serialize Transaction", () => {
  bench("viem: `serializeTransaction` EIP1559", () => {
    serializeTransaction({
      ...BaseTransaction,
      gas: 21001n,
      accessList: [],
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
    });
  });

  bench("ethers: `serializeTransactionEthers` EIP1559", () => {
    serializeTransactionEthers({
      ...BaseTransaction,
      accessList: [],
      gasLimit: 21001n,
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
      type: 2,
    });
  });

  bench("viem: `serializeTransaction` EIP2930", () => {
    serializeTransaction({
      ...BaseTransaction,
      gas: 21001n,
      accessList: [],
      gasPrice: parseGwei("2"),
    });
  });

  bench("ethers: `serializeTransactionEthers` EIP2930", () => {
    serializeTransactionEthers({
      ...BaseTransaction,
      accessList: [],
      gasLimit: 21001n,
      gasPrice: parseGwei("2"),
      type: 1,
    });
  });

  bench("viem: `serializeTransaction` Legacy", () => {
    serializeTransaction({
      ...BaseTransaction,
      gas: 21001n,
      gasPrice: parseGwei("2"),
    });
  });

  bench("ethers: `serializeTransactionEthers` Legacy", () => {
    serializeTransactionEthers({
      ...BaseTransaction,
      gasLimit: 21001n,
      gasPrice: parseGwei("2"),
    });
  });
});
