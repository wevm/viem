import type { Address } from 'abitype'
import { expect, test } from 'vitest'
import {
  getBalance,
  getTransactionReceipt,
  waitForTransactionReceipt,
} from '~viem/actions/index.js'
import { zeroAddress } from '~viem/constants/address.js'
import { l2TokenAddress } from '~viem/zksync/actions/l2TokenAddress.js'
import {
  approvalTokenAddress,
  ethAddressInContracts,
  l2BaseTokenAddress,
  paymasterAddress,
} from '~viem/zksync/constants/address.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  zkSyncChainL1,
  zkSyncChainL2,
  zkSyncChainL3,
} from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { getL1TokenBalance } from '../../actions/getL1TokenBalance.js'
import { publicActionsL1 } from '../../decorators/publicL1.js'
import { publicActionsL2 } from '../../decorators/publicL2.js'
import { getL2TokenAddress } from '../l2TokenAddress.js'
import { getApprovalBasedPaymasterInput } from '../paymaster/getApprovalBasedPaymasterInput.js'
import { finalizeWithdrawal } from './finalizeWithdrawal.js'
import { getErc20TokenBalance } from './getErc20TokenBalance.js'
import { initiateWithdrawal } from './initiateWithdrawal.js'

const account = privateKeyToAccount(
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110',
)

const clientL1 = createClient({
  chain: zkSyncChainL1,
  transport: http(),
  account,
}).extend(publicActionsL1())

const clientL2 = createClient({
  chain: zkSyncChainL2,
  transport: http(),
  account,
}).extend(publicActionsL2())

const clientL3 = createClient({
  chain: zkSyncChainL3,
  transport: http(),
  account,
}).extend(publicActionsL2())

test('withdraw - ETH to L1 Network', async () => {
  const amount = 1n

  const withdrawTx = {
    token: zeroAddress,
    amount: amount,
    to: account.address,
  }

  const balanceBefore = await getBalance(clientL2, { address: account.address })

  const hash = await initiateWithdrawal(clientL1, clientL2, withdrawTx)

  const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, {
    txHash: hash,
  })

  await waitForTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash })

  expect(
    await getTransactionReceipt(clientL1, {
      hash: finalizeWithdrawalHash,
    }),
  ).toBeDefined()

  const balanceAfter = await getBalance(clientL2, { address: account.address })

  expect(balanceBefore - balanceAfter >= amount).to.be.true
})

test('withdraw - ETH to L1 network using paymaster to cover fee', async () => {
  const amount = 7_000_000_000n
  const minimalAllowance = 1n

  const paymasterBalanceBeforeWithdrawal = await getBalance(clientL2, {
    address: paymasterAddress,
  })
  const paymasterTokenBalanceBeforeWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: paymasterAddress },
  )
  const l2BalanceBeforeWithdrawal = await getBalance(clientL2, {
    address: account.address,
  })
  const l2ApprovalTokenBalanceBeforeWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: account.address },
  )

  const withdrawTx = {
    token: ethAddressInContracts,
    amount: amount,
    to: account.address,
    paymasterParams: {
      paymaster: paymasterAddress,
      paymasterInput: getApprovalBasedPaymasterInput({
        token: approvalTokenAddress,
        minAllowance: minimalAllowance,
        innerInput: '0x',
      }),
    },
  }

  const hash = await initiateWithdrawal(clientL1, clientL2, withdrawTx)

  const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, {
    txHash: hash,
  })

  await waitForTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash })
  expect(
    await getTransactionReceipt(clientL1, {
      hash: finalizeWithdrawalHash,
    }),
  ).toBeDefined()

  const paymasterBalanceAfterWithdrawal = await getBalance(clientL2, {
    address: paymasterAddress,
  })
  const paymasterTokenBalanceAfterWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: paymasterAddress },
  )
  const l2BalanceAfterWithdrawal = await getBalance(clientL2, {
    address: account.address,
  })
  const l2ApprovalTokenBalanceAfterWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: account.address },
  )
  expect(
    paymasterBalanceBeforeWithdrawal - paymasterBalanceAfterWithdrawal >= 0n,
  ).to.be.true
  expect(
    l2ApprovalTokenBalanceAfterWithdrawal ===
      l2ApprovalTokenBalanceBeforeWithdrawal - minimalAllowance,
  ).to.be.true
  expect(
    paymasterTokenBalanceAfterWithdrawal -
      paymasterTokenBalanceBeforeWithdrawal,
  ).to.be.equal(minimalAllowance)
  expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal).to.be.equal(
    amount,
  )
})

test('withdraw - DAI to the L1 network', async () => {
  const amount = 5n
  const DAI_L1 = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55' as Address
  const defaultBridges = await clientL2.getDefaultBridgeAddresses()
  const baseToken = await clientL2.getBaseTokenL1Address()

  const l2DaiAddress = await getL2TokenAddress(clientL2, {
    token: DAI_L1,
    sharedL2: defaultBridges.sharedL2,
    baseTokenAddress: baseToken,
  })

  const l1BalanceBeforeWithdrawal = await getL1TokenBalance(clientL1, {
    token: DAI_L1,
  })
  const withdrawTx = {
    token: l2DaiAddress,
    amount: amount,
    to: account.address,
  }

  const hash = await initiateWithdrawal(clientL1, clientL2, withdrawTx)

  const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, {
    txHash: hash,
  })

  await waitForTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash })
  expect(
    await getTransactionReceipt(clientL1, {
      hash: finalizeWithdrawalHash,
    }),
  ).toBeDefined()

  const l1BalanceAfterWithdrawal = await getL1TokenBalance(clientL1, {
    token: DAI_L1,
  })

  expect(l1BalanceAfterWithdrawal - l1BalanceBeforeWithdrawal).to.be.equal(
    amount,
  )
})

test('withdraw - non ETH based - ETH to L1 Network', async () => {
  const amount = 1n
  const bridges = await clientL3.getDefaultBridgeAddresses()
  const token = await l2TokenAddress(clientL3, {
    token: ethAddressInContracts,
    sharedL2: bridges.sharedL2,
  })

  const withdrawTx = {
    token: token,
    amount: amount,
    to: account.address,
  }

  const balanceBefore = await getBalance(clientL3, { address: account.address })

  const hash = await initiateWithdrawal(clientL1, clientL3, withdrawTx)

  const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL3, {
    txHash: hash,
  })

  await waitForTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash })

  expect(
    await getTransactionReceipt(clientL1, {
      hash: finalizeWithdrawalHash,
    }),
  ).toBeDefined()

  const balanceAfter = await getBalance(clientL3, { address: account.address })

  expect(balanceBefore - balanceAfter >= amount).to.be.true
})

test('withdraw - non ETH based - base token to the L1 network', async () => {
  const amount = 1n

  const withdrawTx = {
    token: l2BaseTokenAddress,
    amount: amount,
    to: account.address,
  }

  const balanceBefore = await getBalance(clientL3, { address: account.address })

  const hash = await initiateWithdrawal(clientL1, clientL3, withdrawTx)

  const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL3, {
    txHash: hash,
  })

  await waitForTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash })

  expect(
    await getTransactionReceipt(clientL1, {
      hash: finalizeWithdrawalHash,
    }),
  ).toBeDefined()

  const balanceAfter = await getBalance(clientL3, { address: account.address })

  expect(balanceBefore - balanceAfter >= amount).to.be.true
})

test('withdraw - ETH to L1 network using paymaster to cover fee', async () => {
  const amount = 7_000_000_000n
  const minimalAllowance = 1n

  const paymasterBalanceBeforeWithdrawal = await getBalance(clientL2, {
    address: paymasterAddress,
  })
  const paymasterTokenBalanceBeforeWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: paymasterAddress },
  )
  const l2BalanceBeforeWithdrawal = await getBalance(clientL2, {
    address: account.address,
  })
  const l2ApprovalTokenBalanceBeforeWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: account.address },
  )

  const withdrawTx = {
    token: ethAddressInContracts,
    amount: amount,
    to: account.address,
    paymasterParams: {
      paymasterInput: getApprovalBasedPaymasterInput({
        token: approvalTokenAddress,
        minAllowance: minimalAllowance,
        innerInput: '0x',
      }),
      paymaster: paymasterAddress,
    },
  }

  const hash = await initiateWithdrawal(clientL1, clientL2, withdrawTx)

  const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, {
    txHash: hash,
  })

  await waitForTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash })
  expect(
    await getTransactionReceipt(clientL1, {
      hash: finalizeWithdrawalHash,
    }),
  ).toBeDefined()

  const paymasterBalanceAfterWithdrawal = await getBalance(clientL2, {
    address: paymasterAddress,
  })
  const paymasterTokenBalanceAfterWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: paymasterAddress },
  )
  const l2BalanceAfterWithdrawal = await getBalance(clientL2, {
    address: account.address,
  })
  const l2ApprovalTokenBalanceAfterWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: account.address },
  )
  expect(
    paymasterBalanceBeforeWithdrawal - paymasterBalanceAfterWithdrawal >= 0n,
  ).to.be.true
  expect(
    l2ApprovalTokenBalanceAfterWithdrawal ===
      l2ApprovalTokenBalanceBeforeWithdrawal - minimalAllowance,
  ).to.be.true
  expect(
    paymasterTokenBalanceAfterWithdrawal -
      paymasterTokenBalanceBeforeWithdrawal,
  ).to.be.equal(minimalAllowance)
  expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal).to.be.equal(
    amount,
  )
})

test('withdraw - DAI to L1 network using paymaster to cover fee', async () => {
  const amount = 5n
  const minimalAllowance = 1n

  const DAI_L1 = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55' as Address
  const defaultBridges = await clientL2.getDefaultBridgeAddresses()
  const baseToken = await clientL2.getBaseTokenL1Address()

  const l2DaiAddress = await getL2TokenAddress(clientL2, {
    token: DAI_L1,
    sharedL2: defaultBridges.sharedL2,
    baseTokenAddress: baseToken,
  })
  const paymasterBalanceBeforeWithdrawal = await getBalance(clientL2, {
    address: paymasterAddress,
  })

  const paymasterTokenBalanceBeforeWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: paymasterAddress },
  )

  const l2BalanceBeforeWithdrawal = await getErc20TokenBalance(clientL2, {
    token: l2DaiAddress,
    address: account.address,
  })

  const l2ApprovalTokenBalanceBeforeWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: account.address },
  )

  const withdrawTx = {
    token: l2DaiAddress,
    amount: amount,
    to: account.address,
    paymasterParams: {
      paymasterInput: getApprovalBasedPaymasterInput({
        token: approvalTokenAddress,
        minAllowance: minimalAllowance,
        innerInput: '0x',
      }),
      paymaster: paymasterAddress,
    },
  }

  const hash = await initiateWithdrawal(clientL1, clientL2, withdrawTx)

  const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, {
    txHash: hash,
  })

  await waitForTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash })
  expect(
    await getTransactionReceipt(clientL1, {
      hash: finalizeWithdrawalHash,
    }),
  ).toBeDefined()

  const paymasterBalanceAfterWithdrawal = await getBalance(clientL2, {
    address: paymasterAddress,
  })

  const paymasterTokenBalanceAfterWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: paymasterAddress },
  )

  const l2BalanceAfterWithdrawal = await getErc20TokenBalance(clientL2, {
    token: l2DaiAddress,
    address: account.address,
  })

  const l2ApprovalTokenBalanceAfterWithdrawal = await getErc20TokenBalance(
    clientL2,
    { token: approvalTokenAddress, address: account.address },
  )

  expect(
    paymasterBalanceBeforeWithdrawal - paymasterBalanceAfterWithdrawal >= 0n,
  ).to.be.true
  expect(
    paymasterTokenBalanceAfterWithdrawal -
      paymasterTokenBalanceBeforeWithdrawal,
  ).to.be.equal(minimalAllowance)
  expect(l2BalanceBeforeWithdrawal - l2BalanceAfterWithdrawal).to.be.equal(
    amount,
  )
  console.info(l2ApprovalTokenBalanceAfterWithdrawal)
  console.info(l2ApprovalTokenBalanceBeforeWithdrawal)
  console.info(minimalAllowance)
  expect(
    l2ApprovalTokenBalanceAfterWithdrawal ===
      l2ApprovalTokenBalanceBeforeWithdrawal - minimalAllowance,
  ).to.be.true
})
