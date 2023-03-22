import { expect, test } from "vitest";
import { accounts, signTransaction } from "../../_test";
import { serializeTransaction as serializeTransactionEthers } from "ethers/lib/utils";
import { serializeTransaction } from "./serializeTransaction";
import { parseGwei, parseEther } from "../unit";
import { Wallet } from "ethers";

const sourceAccount = accounts[0];
const targetAccount = accounts[1];
const data = "0x" as const;

const BaseTransaction = {
  chainId: 1,
  data,
  to: targetAccount.address,
  nonce: 785,
  value: parseEther("1"),
};

const wallet = new Wallet(sourceAccount.privateKey);

test("Serialize Transaction EIP1559", () => {
  expect(
    serializeTransaction({
      ...BaseTransaction,
      gas: 21001n,
      accessList: [
        {
          address: "0x1234512345123451234512345123451234512345",
          storageKeys: [
            "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
          ],
        },
      ],
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
    })
  ).toEqual(
    serializeTransactionEthers({
      ...BaseTransaction,
      accessList: [
        {
          address: "0x1234512345123451234512345123451234512345",
          storageKeys: [
            "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
          ],
        },
      ],
      gasLimit: 21001n,
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
      type: 2,
    })
  );
});

test("invalid hash accessList", () => {
  expect(() =>
    serializeTransaction({
      ...BaseTransaction,
      gas: 21001n,
      accessList: [{ address: "0x123", storageKeys: [] }],
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Address \\"0x123\\" is invalid.

    Version: viem@1.0.2"
  `);

  expect(() =>
    serializeTransaction({
      ...BaseTransaction,
      gas: 21001n,
      accessList: [{ address: "0x123", storageKeys: [] }],
      gasPrice: 1n,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Address \\"0x123\\" is invalid.

    Version: viem@1.0.2"
  `);
});

test("invalid hash accessList", () => {
  expect(() =>
    serializeTransaction({
      ...BaseTransaction,
      gas: 21001n,
      accessList: [
        {
          address: "0x1234512345123451234512345123451234512345",
          storageKeys: ["0x123"],
        },
      ],
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123

    Version: viem@1.0.2"
  `);

  expect(() =>
    serializeTransaction({
      ...BaseTransaction,
      gas: 21001n,
      accessList: [
        {
          address: "0x1234512345123451234512345123451234512345",
          storageKeys: ["0x123"],
        },
      ],
      gasPrice: 1n,
    })
  ).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123

    Version: viem@1.0.2"
  `);
});

test("Serialize signed transaction EIP1559", async () => {
  const signature = signTransaction(
    serializeTransaction({
      ...BaseTransaction,
      accessList: [],
      gas: 21001n,
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
    }),
    sourceAccount.privateKey
  );
  expect(
    serializeTransaction(
      {
        ...BaseTransaction,
        accessList: [],
        gas: 21001n,
        maxFeePerGas: parseGwei("2"),
        maxPriorityFeePerGas: parseGwei("2"),
      },
      signature
    )
  ).toEqual(
    await wallet.signTransaction({
      ...BaseTransaction,
      accessList: [],
      maxFeePerGas: parseGwei("2"),
      maxPriorityFeePerGas: parseGwei("2"),
      gasLimit: 21001n,
      type: 2,
    })
  );
});

test("Serialize Transaction EIP2930", () => {
  expect(
    serializeTransaction({
      ...BaseTransaction,
      gas: 21001n,
      accessList: [
        {
          address: "0x1234512345123451234512345123451234512345",
          storageKeys: [
            "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
          ],
        },
      ],
      gasPrice: parseGwei("2"),
    })
  ).toEqual(
    serializeTransactionEthers({
      ...BaseTransaction,
      accessList: [
        {
          address: "0x1234512345123451234512345123451234512345",
          storageKeys: [
            "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
          ],
        },
      ],
      gasLimit: 21001n,
      gasPrice: parseGwei("2"),
      type: 1,
    })
  );
});

test("Serialize signed transaction EIP2930", async () => {
  const signature = signTransaction(
    serializeTransaction({
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei("2"),
      gas: 21001n,
    }),
    sourceAccount.privateKey
  );
  expect(
    serializeTransaction(
      {
        ...BaseTransaction,
        accessList: [],
        gasPrice: parseGwei("2"),
        gas: 21001n,
      },
      signature
    )
  ).toEqual(
    await wallet.signTransaction({
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei("2"),
      gasLimit: 21001n,
      type: 1,
    })
  );
});

test("Serialize Legacy Transactions", () => {
  expect(
    serializeTransaction({
      ...BaseTransaction,
      gasPrice: parseGwei("2"),
      gas: 21001n,
    })
  ).toEqual(
    serializeTransactionEthers({
      ...BaseTransaction,
      gasPrice: parseGwei("2"),
      gasLimit: 21001n,
    })
  );
});

test("Serialized signed legacy transaction", async () => {
  const signature = signTransaction(
    serializeTransaction({
      ...BaseTransaction,
      gasPrice: parseGwei("2"),
      gas: 21001n,
    }),
    sourceAccount.privateKey
  );

  expect(
    serializeTransaction(
      {
        ...BaseTransaction,
        gasPrice: parseGwei("2"),
        gas: 21001n,
      },
      signature
    )
  ).toEqual(
    await wallet.signTransaction({
      ...BaseTransaction,
      gasPrice: parseGwei("2"),
      gasLimit: 21001n,
    })
  );
});

test("default values", () => {
  expect(serializeTransaction({ chainId: 1, maxFeePerGas: 1n })).toEqual(
    serializeTransactionEthers({ chainId: 1, type: 2, maxFeePerGas: 1n })
  );

  expect(
    serializeTransaction({ chainId: 1, maxPriorityFeePerGas: 1n })
  ).toEqual(
    serializeTransactionEthers({
      chainId: 1,
      type: 2,
      maxPriorityFeePerGas: 1n,
    })
  );

  expect(
    serializeTransaction({ chainId: 1, gasPrice: 1n, accessList: [] })
  ).toEqual(
    serializeTransactionEthers({
      chainId: 1,
      type: 1,
      gasPrice: 1n,
      accessList: [],
    })
  );

  expect(serializeTransaction({ chainId: 1, gasPrice: 1n })).toEqual(
    serializeTransactionEthers({ chainId: 1, gasPrice: 1n })
  );
});

test("default values with signatures", () => {
  expect(
    serializeTransaction(
      { chainId: 1, maxFeePerGas: 1n },

      {
        r: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        s: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        v: 28n,
      }
    )
  ).toEqual(
    serializeTransactionEthers(
      { chainId: 1, type: 2, maxFeePerGas: 1n },
      {
        r: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        s: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        v: 28,
      }
    )
  );

  expect(
    serializeTransaction(
      { chainId: 1, gasPrice: 1n, accessList: [] },
      {
        r: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        s: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        v: 27n,
      }
    )
  ).toEqual(
    serializeTransactionEthers(
      { chainId: 1, type: 1, gasPrice: 1n, accessList: [] },
      {
        r: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        s: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        v: 27,
      }
    )
  );
});

test("default values with invalid signatures", () => {
  expect(() =>
    serializeTransaction(
      { chainId: 1, maxFeePerGas: 1n },
      {
        r: "0x123",
        s: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        v: 28n,
      }
    )
  ).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe
    0x123

    Version: viem@1.0.2"
  `);

  expect(() =>
    serializeTransaction(
      { chainId: 1, gasPrice: 1n, accessList: [] },
      {
        r: "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        s: "0x123",
        v: 28n,
      }
    )
  ).toThrowErrorMatchingInlineSnapshot(`
    "Contains invalid hash values.

    0x123
    0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe

    Version: viem@1.0.2"
  `);
});

test("cannot infer type from transaction object", () => {
  expect(() => serializeTransaction({ chainId: 1 }))
    .toThrowErrorMatchingInlineSnapshot(`
      "Cannot infer transaction type from object.

      Use \`maxFeePerGas\`/\`maxPriorityFeePerGas\` for EIP-1559 compatible networks, and \`gasPrice\` for others.

      Version: viem@1.0.2"
    `);
});
