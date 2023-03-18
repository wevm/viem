import { isAddress } from "../address";
import {
  FeeCapTooHighError,
  InvalidAddressError,
  TipAboveFeeCapError,
} from "../../errors";
import type {
  TransactionRequestEIP1559,
  TransactionType,
  TransactionRequestEIP2930,
  TransactionRequestLegacy,
} from "../../types";
import { InvalidTransactionTypeError } from "../../errors/transaction";
import { InvalidChainIdError } from "../../errors/chain";

export function assertTransactionEIP1559(
  transaction: Omit<TransactionRequestEIP1559, "from"> & { chainId: number }
) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } =
    transaction;

  if (!chainId) {
    throw new InvalidChainIdError({ chainId });
  }
  if (to && !isAddress(to)) {
    throw new InvalidAddressError({ address: to });
  }
  if (gasPrice) throw new InvalidTransactionTypeError({ type: "eip1559" });

  if (maxFeePerGas && maxFeePerGas > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas > maxFeePerGas
  )
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}

export function assertTransactionNonEIP1559<
  TType extends Exclude<TransactionType, "eip1559">,
  TTransactionType extends TransactionRequestEIP2930 | TransactionRequestLegacy
>(
  type: TType,
  transaction: Omit<TTransactionType, "from"> & { chainId?: number }
) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } =
    transaction;

  if (chainId !== undefined && !chainId) {
    throw new InvalidChainIdError({ chainId });
  }

  if (to && !isAddress(to)) {
    throw new InvalidAddressError({ address: to });
  }
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new InvalidTransactionTypeError({ type: type });

  if (gasPrice && gasPrice > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}
