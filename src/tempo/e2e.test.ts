import * as Http from 'node:http'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { RpcRequest, RpcResponse, WebCryptoP256 } from 'ox'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  getTransaction,
  prepareTransactionRequest,
  sendRawTransaction,
  sendTransaction,
  sendTransactionSync,
  signTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { Account, Actions, Transaction } from 'viem/tempo'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  chain,
  fundAddress,
  getClient,
  http,
} from '~test/tempo/config.js'
import { rpcUrl } from '~test/tempo/prool.js'
import { withFeePayer } from './Transport.js'

const client = getClient()

describe('sendTransaction', () => {
  test('default', async () => {
    const account = accounts[0]

    const hash = await sendTransaction(client, {
      account,
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
    })
    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      chainId,
      from,
      gas,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      r,
      s,
      v,
      yParity,
      transactionIndex,
      ...transaction
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(chainId).toBeDefined()
    expect(from).toBe(account.address.toLowerCase())
    expect(gas).toBeDefined()
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(r).toBeDefined()
    expect(s).toBeDefined()
    expect(v).toBeDefined()
    expect(yParity).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "input": "0xdeadbeef",
        "to": "0x0000000000000000000000000000000000000000",
        "type": "eip1559",
        "typeHex": "0x2",
        "value": 0n,
      }
    `)
  })

  test('behavior: with `feeToken`', async () => {
    const account = accounts[0]

    const hash = await sendTransaction(client, {
      account,
      data: '0xdeadbeef',
      feeToken: '0x20c0000000000000000000000000000000000001',
      to: '0x0000000000000000000000000000000000000000',
    })
    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      chainId,
      from,
      gas,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      nonceKey,
      signature,
      transactionIndex,
      ...transaction
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(chainId).toBeDefined()
    expect(from).toBe(account.address.toLowerCase())
    expect(gas).toBeDefined()
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(nonceKey).toBeDefined()
    expect(signature).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "authorizationList": [],
        "calls": [
          {
            "data": "0xdeadbeef",
            "to": "0x0000000000000000000000000000000000000000",
            "value": 0n,
          },
        ],
        "data": undefined,
        "feePayerSignature": undefined,
        "feeToken": "0x20c0000000000000000000000000000000000001",
        "maxFeePerBlobGas": undefined,
        "to": null,
        "type": "tempo",
        "typeHex": "0x76",
        "v": undefined,
        "validAfter": null,
        "validBefore": null,
        "value": 0n,
        "yParity": undefined,
      }
    `)
  })

  test('behavior: with `feeToken` (chain)', async () => {
    const client = getClient({
      account: accounts[0],
      chain: chain.extend({
        feeToken: '0x20c0000000000000000000000000000000000001',
      }),
    })

    const hash = await sendTransaction(client, {
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
    })
    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      chainId,
      from,
      gas,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      nonceKey,
      signature,
      transactionIndex,
      ...transaction
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(chainId).toBeDefined()
    expect(from).toBe(accounts[0].address.toLowerCase())
    expect(gas).toBeDefined()
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(nonceKey).toBeDefined()
    expect(signature).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "authorizationList": [],
        "calls": [
          {
            "data": "0xdeadbeef",
            "to": "0x0000000000000000000000000000000000000000",
            "value": 0n,
          },
        ],
        "data": undefined,
        "feePayerSignature": undefined,
        "feeToken": "0x20c0000000000000000000000000000000000001",
        "maxFeePerBlobGas": undefined,
        "to": null,
        "type": "tempo",
        "typeHex": "0x76",
        "v": undefined,
        "validAfter": null,
        "validBefore": null,
        "value": 0n,
        "yParity": undefined,
      }
    `)
  })

  test('behavior: with `calls`', async () => {
    const account = accounts[0]

    const hash = await sendTransaction(client, {
      account,
      calls: [
        Actions.token.create.call({
          admin: accounts[0].address,
          currency: 'USD',
          name: 'Test Token 3',
          symbol: 'TEST3',
        }),
      ],
    })
    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      calls,
      chainId,
      from,
      gas,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      nonceKey,
      signature,
      transactionIndex,
      ...transaction
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(calls?.length).toBe(1)
    expect(chainId).toBeDefined()
    expect(from).toBe(account.address.toLowerCase())
    expect(gas).toBeDefined()
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(nonceKey).toBeDefined()
    expect(signature).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
  })

  test('behavior: with `feePayer`', async () => {
    const account = privateKeyToAccount(generatePrivateKey())
    const feePayer = accounts[0]

    const hash = await sendTransaction(client, {
      account,
      feePayer,
      to: '0x0000000000000000000000000000000000000000',
    })
    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      chainId,
      feePayerSignature,
      from,
      gas,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      nonceKey,
      signature,
      transactionIndex,
      ...transaction
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(chainId).toBeDefined()
    expect(feePayerSignature).toBeDefined()
    expect(from).toBe(account.address.toLowerCase())
    expect(gas).toBeDefined()
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(nonceKey).toBeDefined()
    expect(signature).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
  })

  test('behavior: deploy contract', async () => {
    const account = accounts[0]
    const receipt = await sendTransactionSync(client, {
      account,
      data: '0x608060405234801561001057600080fd5b50610ee0806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e1461025a578063bce38bd714610275578063c3077fa914610288578063ee82ac5e1461029b57600080fd5b80634d2301cc146101ec57806372425d9d1461022157806382ad56cb1461023457806386d516e81461024757600080fd5b80633408e470116100c65780633408e47014610191578063399542e9146101a45780633e64a696146101c657806342cbb15c146101d957600080fd5b80630f28c97d146100f8578063174dea711461011a578063252dba421461013a57806327e86d6e1461015b575b600080fd5b34801561010457600080fd5b50425b6040519081526020015b60405180910390f35b61012d610128366004610a85565b6102ba565b6040516101119190610bbe565b61014d610148366004610a85565b6104ef565b604051610111929190610bd8565b34801561016757600080fd5b50437fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0140610107565b34801561019d57600080fd5b5046610107565b6101b76101b2366004610c60565b610690565b60405161011193929190610cba565b3480156101d257600080fd5b5048610107565b3480156101e557600080fd5b5043610107565b3480156101f857600080fd5b50610107610207366004610ce2565b73ffffffffffffffffffffffffffffffffffffffff163190565b34801561022d57600080fd5b5044610107565b61012d610242366004610a85565b6106ab565b34801561025357600080fd5b5045610107565b34801561026657600080fd5b50604051418152602001610111565b61012d610283366004610c60565b61085a565b6101b7610296366004610a85565b610a1a565b3480156102a757600080fd5b506101076102b6366004610d18565b4090565b60606000828067ffffffffffffffff8111156102d8576102d8610d31565b60405190808252806020026020018201604052801561031e57816020015b6040805180820190915260008152606060208201528152602001906001900390816102f65790505b5092503660005b8281101561047757600085828151811061034157610341610d60565b6020026020010151905087878381811061035d5761035d610d60565b905060200281019061036f9190610d8f565b6040810135958601959093506103886020850185610ce2565b73ffffffffffffffffffffffffffffffffffffffff16816103ac6060870187610dcd565b6040516103ba929190610e32565b60006040518083038185875af1925050503d80600081146103f7576040519150601f19603f3d011682016040523d82523d6000602084013e6103fc565b606091505b50602080850191909152901515808452908501351761046d577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b5050600101610325565b508234146104e6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601a60248201527f4d756c746963616c6c333a2076616c7565206d69736d6174636800000000000060448201526064015b60405180910390fd5b50505092915050565b436060828067ffffffffffffffff81111561050c5761050c610d31565b60405190808252806020026020018201604052801561053f57816020015b606081526020019060019003908161052a5790505b5091503660005b8281101561068657600087878381811061056257610562610d60565b90506020028101906105749190610e42565b92506105836020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff166105a66020850185610dcd565b6040516105b4929190610e32565b6000604051808303816000865af19150503d80600081146105f1576040519150601f19603f3d011682016040523d82523d6000602084013e6105f6565b606091505b5086848151811061060957610609610d60565b602090810291909101015290508061067d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060448201526064016104dd565b50600101610546565b5050509250929050565b43804060606106a086868661085a565b905093509350939050565b6060818067ffffffffffffffff8111156106c7576106c7610d31565b60405190808252806020026020018201604052801561070d57816020015b6040805180820190915260008152606060208201528152602001906001900390816106e55790505b5091503660005b828110156104e657600084828151811061073057610730610d60565b6020026020010151905086868381811061074c5761074c610d60565b905060200281019061075e9190610e76565b925061076d6020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff166107906040850185610dcd565b60405161079e929190610e32565b6000604051808303816000865af19150503d80600081146107db576040519150601f19603f3d011682016040523d82523d6000602084013e6107e0565b606091505b506020808401919091529015158083529084013517610851577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b50600101610714565b6060818067ffffffffffffffff81111561087657610876610d31565b6040519080825280602002602001820160405280156108bc57816020015b6040805180820190915260008152606060208201528152602001906001900390816108945790505b5091503660005b82811015610a105760008482815181106108df576108df610d60565b602002602001015190508686838181106108fb576108fb610d60565b905060200281019061090d9190610e42565b925061091c6020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff1661093f6020850185610dcd565b60405161094d929190610e32565b6000604051808303816000865af19150503d806000811461098a576040519150601f19603f3d011682016040523d82523d6000602084013e61098f565b606091505b506020830152151581528715610a07578051610a07576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060448201526064016104dd565b506001016108c3565b5050509392505050565b6000806060610a2b60018686610690565b919790965090945092505050565b60008083601f840112610a4b57600080fd5b50813567ffffffffffffffff811115610a6357600080fd5b6020830191508360208260051b8501011115610a7e57600080fd5b9250929050565b60008060208385031215610a9857600080fd5b823567ffffffffffffffff811115610aaf57600080fd5b610abb85828601610a39565b90969095509350505050565b6000815180845260005b81811015610aed57602081850181015186830182015201610ad1565b81811115610aff576000602083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b600082825180855260208086019550808260051b84010181860160005b84811015610bb1578583037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe001895281518051151584528401516040858501819052610b9d81860183610ac7565b9a86019a9450505090830190600101610b4f565b5090979650505050505050565b602081526000610bd16020830184610b32565b9392505050565b600060408201848352602060408185015281855180845260608601915060608160051b870101935082870160005b82811015610c52577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa0888703018452610c40868351610ac7565b95509284019290840190600101610c06565b509398975050505050505050565b600080600060408486031215610c7557600080fd5b83358015158114610c8557600080fd5b9250602084013567ffffffffffffffff811115610ca157600080fd5b610cad86828701610a39565b9497909650939450505050565b838152826020820152606060408201526000610cd96060830184610b32565b95945050505050565b600060208284031215610cf457600080fd5b813573ffffffffffffffffffffffffffffffffffffffff81168114610bd157600080fd5b600060208284031215610d2a57600080fd5b5035919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81833603018112610dc357600080fd5b9190910192915050565b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe1843603018112610e0257600080fd5b83018035915067ffffffffffffffff821115610e1d57600080fd5b602001915036819003821315610a7e57600080fd5b8183823760009101908152919050565b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc1833603018112610dc357600080fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa1833603018112610dc357600080fdfea2646970667358221220bb2b5c71a328032f97c676ae39a1ec2148d3e5d6f73d95e9b17910152d61f16264736f6c634300080c0033',
    })
    expect(receipt.contractAddress).toBeDefined()
  })

  test('behavior: deploy contract + `feeToken` (tempo tx)', async () => {
    const account = accounts[0]
    const receipt = await sendTransactionSync(client, {
      account,
      feeToken: 1n,
      data: '0x608060405234801561001057600080fd5b50610ee0806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e1461025a578063bce38bd714610275578063c3077fa914610288578063ee82ac5e1461029b57600080fd5b80634d2301cc146101ec57806372425d9d1461022157806382ad56cb1461023457806386d516e81461024757600080fd5b80633408e470116100c65780633408e47014610191578063399542e9146101a45780633e64a696146101c657806342cbb15c146101d957600080fd5b80630f28c97d146100f8578063174dea711461011a578063252dba421461013a57806327e86d6e1461015b575b600080fd5b34801561010457600080fd5b50425b6040519081526020015b60405180910390f35b61012d610128366004610a85565b6102ba565b6040516101119190610bbe565b61014d610148366004610a85565b6104ef565b604051610111929190610bd8565b34801561016757600080fd5b50437fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0140610107565b34801561019d57600080fd5b5046610107565b6101b76101b2366004610c60565b610690565b60405161011193929190610cba565b3480156101d257600080fd5b5048610107565b3480156101e557600080fd5b5043610107565b3480156101f857600080fd5b50610107610207366004610ce2565b73ffffffffffffffffffffffffffffffffffffffff163190565b34801561022d57600080fd5b5044610107565b61012d610242366004610a85565b6106ab565b34801561025357600080fd5b5045610107565b34801561026657600080fd5b50604051418152602001610111565b61012d610283366004610c60565b61085a565b6101b7610296366004610a85565b610a1a565b3480156102a757600080fd5b506101076102b6366004610d18565b4090565b60606000828067ffffffffffffffff8111156102d8576102d8610d31565b60405190808252806020026020018201604052801561031e57816020015b6040805180820190915260008152606060208201528152602001906001900390816102f65790505b5092503660005b8281101561047757600085828151811061034157610341610d60565b6020026020010151905087878381811061035d5761035d610d60565b905060200281019061036f9190610d8f565b6040810135958601959093506103886020850185610ce2565b73ffffffffffffffffffffffffffffffffffffffff16816103ac6060870187610dcd565b6040516103ba929190610e32565b60006040518083038185875af1925050503d80600081146103f7576040519150601f19603f3d011682016040523d82523d6000602084013e6103fc565b606091505b50602080850191909152901515808452908501351761046d577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b5050600101610325565b508234146104e6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601a60248201527f4d756c746963616c6c333a2076616c7565206d69736d6174636800000000000060448201526064015b60405180910390fd5b50505092915050565b436060828067ffffffffffffffff81111561050c5761050c610d31565b60405190808252806020026020018201604052801561053f57816020015b606081526020019060019003908161052a5790505b5091503660005b8281101561068657600087878381811061056257610562610d60565b90506020028101906105749190610e42565b92506105836020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff166105a66020850185610dcd565b6040516105b4929190610e32565b6000604051808303816000865af19150503d80600081146105f1576040519150601f19603f3d011682016040523d82523d6000602084013e6105f6565b606091505b5086848151811061060957610609610d60565b602090810291909101015290508061067d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060448201526064016104dd565b50600101610546565b5050509250929050565b43804060606106a086868661085a565b905093509350939050565b6060818067ffffffffffffffff8111156106c7576106c7610d31565b60405190808252806020026020018201604052801561070d57816020015b6040805180820190915260008152606060208201528152602001906001900390816106e55790505b5091503660005b828110156104e657600084828151811061073057610730610d60565b6020026020010151905086868381811061074c5761074c610d60565b905060200281019061075e9190610e76565b925061076d6020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff166107906040850185610dcd565b60405161079e929190610e32565b6000604051808303816000865af19150503d80600081146107db576040519150601f19603f3d011682016040523d82523d6000602084013e6107e0565b606091505b506020808401919091529015158083529084013517610851577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b50600101610714565b6060818067ffffffffffffffff81111561087657610876610d31565b6040519080825280602002602001820160405280156108bc57816020015b6040805180820190915260008152606060208201528152602001906001900390816108945790505b5091503660005b82811015610a105760008482815181106108df576108df610d60565b602002602001015190508686838181106108fb576108fb610d60565b905060200281019061090d9190610e42565b925061091c6020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff1661093f6020850185610dcd565b60405161094d929190610e32565b6000604051808303816000865af19150503d806000811461098a576040519150601f19603f3d011682016040523d82523d6000602084013e61098f565b606091505b506020830152151581528715610a07578051610a07576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060448201526064016104dd565b506001016108c3565b5050509392505050565b6000806060610a2b60018686610690565b919790965090945092505050565b60008083601f840112610a4b57600080fd5b50813567ffffffffffffffff811115610a6357600080fd5b6020830191508360208260051b8501011115610a7e57600080fd5b9250929050565b60008060208385031215610a9857600080fd5b823567ffffffffffffffff811115610aaf57600080fd5b610abb85828601610a39565b90969095509350505050565b6000815180845260005b81811015610aed57602081850181015186830182015201610ad1565b81811115610aff576000602083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b600082825180855260208086019550808260051b84010181860160005b84811015610bb1578583037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe001895281518051151584528401516040858501819052610b9d81860183610ac7565b9a86019a9450505090830190600101610b4f565b5090979650505050505050565b602081526000610bd16020830184610b32565b9392505050565b600060408201848352602060408185015281855180845260608601915060608160051b870101935082870160005b82811015610c52577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa0888703018452610c40868351610ac7565b95509284019290840190600101610c06565b509398975050505050505050565b600080600060408486031215610c7557600080fd5b83358015158114610c8557600080fd5b9250602084013567ffffffffffffffff811115610ca157600080fd5b610cad86828701610a39565b9497909650939450505050565b838152826020820152606060408201526000610cd96060830184610b32565b95945050505050565b600060208284031215610cf457600080fd5b813573ffffffffffffffffffffffffffffffffffffffff81168114610bd157600080fd5b600060208284031215610d2a57600080fd5b5035919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81833603018112610dc357600080fd5b9190910192915050565b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe1843603018112610e0257600080fd5b83018035915067ffffffffffffffff821115610e1d57600080fd5b602001915036819003821315610a7e57600080fd5b8183823760009101908152919050565b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc1833603018112610dc357600080fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa1833603018112610dc357600080fdfea2646970667358221220bb2b5c71a328032f97c676ae39a1ec2148d3e5d6f73d95e9b17910152d61f16264736f6c634300080c0033',
    })
    expect(receipt.contractAddress).toBeDefined()
  })

  test('behavior: with access key', async () => {
    const account = accounts[0]
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const keyAuthorization = await account.signKeyAuthorization(accessKey)

    {
      const receipt = await sendTransactionSync(client, {
        account: accessKey,
        keyAuthorization,
      })
      expect(receipt).toBeDefined()
    }

    {
      const receipt = await Actions.token.transferSync(client, {
        account: accessKey,
        amount: 100n,
        token: '0x20c0000000000000000000000000000000000001',
        to: '0x0000000000000000000000000000000000000001',
      })
      expect(receipt).toBeDefined()
    }

    {
      const receipt = await Actions.token.createSync(client, {
        account: accessKey,
        admin: accessKey.address,
        currency: 'USD',
        name: 'Test Token 4',
        symbol: 'TEST4',
      })
      expect(receipt).toBeDefined()
    }
  })

  describe('p256', () => {
    test('default', async () => {
      const account = Account.fromP256(
        '0x6a3086fb3f2f95a3f36ef5387d18151ff51dc98a1e0eb987b159ba196beb0c99',
      )

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0xdeadbeef",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with `calls`', async () => {
      const account = Account.fromP256(
        '0x6a3086fb3f2f95a3f36ef5387d18151ff51dc98a1e0eb987b159ba196beb0c99',
      )

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        calls: [
          Actions.token.create.call({
            admin: account.address,
            currency: 'USD',
            name: 'Test Token 4',
            symbol: 'TEST4',
          }),
        ],
        // TODO: remove once `eth_estimateGas` supports passing key type.
        gas: 100_000n,
      })

      const {
        blockHash,
        blockNumber,
        calls,
        chainId,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(calls?.length).toBe(1)
      expect(chainId).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with `feePayer`', async () => {
      const account = Account.fromP256(
        // unfunded account with different key
        '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      )
      const feePayer = accounts[0]

      const hash = await sendTransaction(client, {
        account,
        feePayer,
        to: '0x0000000000000000000000000000000000000000',
      })
      await waitForTransactionReceipt(client, { hash })

      const {
        blockHash,
        blockNumber,
        chainId,
        feePayerSignature,
        from,
        gas,
        gasPrice,
        hash: hash_,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, { hash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(feePayerSignature).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash_).toBe(hash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with access key', async () => {
      const account = accounts[0]
      const accessKey = Account.fromP256(generatePrivateKey(), {
        access: account,
      })

      const keyAuthorization = await account.signKeyAuthorization(accessKey)

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          keyAuthorization,
        })
        expect(receipt).toBeDefined()
      }

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          to: '0x0000000000000000000000000000000000000000',
        })
        expect(receipt).toBeDefined()
      }
    })

    test('behavior: with access key + `feePayer`', async () => {
      const account = Account.fromP256(
        // unfunded account with different key
        '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      )
      const accessKey = Account.fromP256(generatePrivateKey(), {
        access: account,
      })
      const feePayer = accounts[0]

      const keyAuthorization = await account.signKeyAuthorization(accessKey)

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          feePayer,
          keyAuthorization,
          to: '0x0000000000000000000000000000000000000000',
        })
        expect(receipt).toBeDefined()
      }

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          feePayer,
          to: '0x0000000000000000000000000000000000000000',
        })
        expect(receipt).toBeDefined()
      }
    })
  })

  describe('webcrypto', () => {
    test('default', async () => {
      const keyPair = await WebCryptoP256.createKeyPair()
      const account = Account.fromWebCryptoP256(keyPair)

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        from,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(from).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0xdeadbeef",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "gas": 29012n,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with `calls`', async () => {
      const keyPair = await WebCryptoP256.createKeyPair()
      const account = Account.fromWebCryptoP256(keyPair)

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        calls: [
          Actions.token.create.call({
            admin: account.address,
            currency: 'USD',
            name: 'Test Token 5',
            symbol: 'TEST5',
          }),
        ],
        // TODO: remove once `eth_estimateGas` supports passing key type.
        gas: 100_000n,
      })

      const {
        blockHash,
        blockNumber,
        calls,
        chainId,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        signature,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(calls?.length).toBe(1)
      expect(chainId).toBeDefined()
      expect(from).toBeDefined()
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(signature).toBeDefined()
      expect(transaction).toBeDefined()
    })

    test('behavior: with `feePayer`', async () => {
      const keyPair = await WebCryptoP256.createKeyPair()
      const account = Account.fromWebCryptoP256(keyPair)
      const feePayer = accounts[0]

      const hash = await sendTransaction(client, {
        account,
        feePayer,
        to: '0x0000000000000000000000000000000000000000',
      })
      await waitForTransactionReceipt(client, { hash })

      const {
        blockHash,
        blockNumber,
        chainId,
        from,
        gasPrice,
        hash: hash_,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        signature,
        ...transaction
      } = await getTransaction(client, { hash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(from).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash_).toBe(hash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(signature).toBeDefined()
      expect(transaction).toBeDefined()
    })

    test('behavior: with access key', async () => {
      const keyPair = await WebCryptoP256.createKeyPair()
      const account = Account.fromWebCryptoP256(keyPair)
      const accessKey = Account.fromWebCryptoP256(keyPair, {
        access: account,
      })

      // fund account
      await fundAddress(client, { address: account.address })

      const keyAuthorization = await account.signKeyAuthorization(accessKey)

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          keyAuthorization,
        })
        expect(receipt).toBeDefined()
      }

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          to: '0x0000000000000000000000000000000000000000',
        })
        expect(receipt).toBeDefined()
      }
    })
  })

  describe('webAuthn', () => {
    test('default', async () => {
      const account = Account.fromHeadlessWebAuthn(
        '0x6a3086fb3f2f95a3f36ef5387d18151ff51dc98a1e0eb987b159ba196beb0c99',
        {
          rpId: 'localhost',
          origin: 'http://localhost',
        },
      )

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0xdeadbeef",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with `calls`', async () => {
      const account = Account.fromHeadlessWebAuthn(
        '0x6a3086fb3f2f95a3f36ef5387d18151ff51dc98a1e0eb987b159ba196beb0c99',
        {
          rpId: 'localhost',
          origin: 'http://localhost',
        },
      )

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        calls: [
          Actions.token.create.call({
            admin: account.address,
            currency: 'USD',
            name: 'Test Token 6',
            symbol: 'TEST6',
          }),
        ],
        // TODO: remove once `eth_estimateGas` supports passing key type.
        gas: 100_000n,
      })

      const {
        blockHash,
        blockNumber,
        calls,
        chainId,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(calls?.length).toBe(1)
      expect(chainId).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with `feePayer`', async () => {
      const account = Account.fromHeadlessWebAuthn(
        // unfunded account with different key
        '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        {
          rpId: 'localhost',
          origin: 'http://localhost',
        },
      )
      const feePayer = accounts[0]

      const hash = await sendTransaction(client, {
        account,
        feePayer,
        to: '0x0000000000000000000000000000000000000000',
      })
      await waitForTransactionReceipt(client, { hash })

      const {
        blockHash,
        blockNumber,
        chainId,
        feePayerSignature,
        from,
        gas,
        gasPrice,
        hash: hash_,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, { hash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(feePayerSignature).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash_).toBe(hash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with access key', async () => {
      const account = Account.fromHeadlessWebAuthn(
        '0x6a3086fb3f2f95a3f36ef5387d18151ff51dc98a1e0eb987b159ba196beb0c99',
        {
          rpId: 'localhost',
          origin: 'http://localhost',
        },
      )
      const accessKey = Account.fromP256(generatePrivateKey(), {
        access: account,
      })

      // fund account
      await fundAddress(client, { address: account.address })

      const keyAuthorization = await account.signKeyAuthorization(accessKey)

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          keyAuthorization,
        })
        expect(receipt).toBeDefined()
      }

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          to: '0x0000000000000000000000000000000000000000',
        })
        expect(receipt).toBeDefined()
      }
    })
  })

  test('behavior: 2d nonces', async () => {
    const account = accounts[0]

    // fund account
    await fundAddress(client, { address: account.address })

    const receipts = await Promise.all([
      sendTransactionSync(client, {
        account,
        nonceKey: 'random',
        to: '0x0000000000000000000000000000000000000000',
      }),
      sendTransactionSync(client, {
        account,
        nonceKey: 'random',
        to: '0x0000000000000000000000000000000000000000',
      }),
    ])

    expect(receipts[0].status).toBe('success')
    expect(receipts[1].status).toBe('success')
    expect(receipts[0].transactionHash).not.toBe(receipts[1].transactionHash)
  })

  test('behavior: 2d nonces (implicit)', async () => {
    const account = accounts[0]

    // fund account
    await fundAddress(client, { address: account.address })

    const receipts = await Promise.all([
      sendTransactionSync(client, {
        account,
        to: '0x0000000000000000000000000000000000000000',
      }),
      sendTransactionSync(client, {
        account,
        to: '0x0000000000000000000000000000000000000000',
      }),
      sendTransactionSync(client, {
        account,
        to: '0x0000000000000000000000000000000000000000',
      }),
    ])

    const transactions = await Promise.all([
      getTransaction(client, { hash: receipts[0].transactionHash }),
      getTransaction(client, { hash: receipts[1].transactionHash }),
      getTransaction(client, { hash: receipts[2].transactionHash }),
    ])

    expect(transactions[0].nonceKey).toBe(undefined)
    expect(transactions[1].nonceKey).toBeGreaterThan(0n)
    expect(transactions[2].nonceKey).toBeGreaterThan(0n)
  })
})

describe('signTransaction', () => {
  test('default', async () => {
    const account = privateKeyToAccount(
      // unfunded PK
      '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
    )
    const feePayer = accounts[0]

    const request = await prepareTransactionRequest(client, {
      account,
      data: '0xdeadbeef',
      feePayer: true,
      to: '0xcafebabecafebabecafebabecafebabecafebabe',
    })
    let transaction = await signTransaction(client, request as never)

    transaction = await signTransaction(client, {
      ...Transaction.deserialize(transaction),
      account,
      feePayer,
    } as never)
    const hash = await sendRawTransaction(client, {
      serializedTransaction: transaction,
    })

    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      chainId,
      feePayerSignature,
      from,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      nonceKey,
      signature,
      transactionIndex,
      ...transaction2
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(chainId).toBeDefined()
    expect(feePayerSignature).toBeDefined()
    expect(from).toBe(account.address.toLowerCase())
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(nonceKey).toBeDefined()
    expect(signature).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction2).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "authorizationList": [],
        "calls": [
          {
            "data": "0xdeadbeef",
            "to": "0xcafebabecafebabecafebabecafebabecafebabe",
            "value": 0n,
          },
        ],
        "data": undefined,
        "feeToken": null,
        "gas": 24002n,
        "maxFeePerBlobGas": undefined,
        "to": null,
        "type": "tempo",
        "typeHex": "0x76",
        "v": undefined,
        "validAfter": null,
        "validBefore": null,
        "value": 0n,
        "yParity": undefined,
      }
    `)
  })
})

describe('relay', () => {
  const client = getClient({
    transport: withFeePayer(http(), http('http://localhost:3050')),
  })
  let server: Http.Server

  afterEach(async () => {
    await fetch(`${rpcUrl}/restart`)
  })

  beforeAll(async () => {
    server = Http.createServer(
      createRequestListener(async (r) => {
        const client = getClient({
          account: accounts[0],
        })

        const request = RpcRequest.from(await r.json())

        // Validate method
        if (
          (request as any).method !== 'eth_signRawTransaction' &&
          request.method !== 'eth_sendRawTransaction' &&
          request.method !== 'eth_sendRawTransactionSync'
        )
          return Response.json(
            RpcResponse.from(
              {
                error: new RpcResponse.InvalidParamsError({
                  message:
                    'service only supports `eth_signTransaction`, `eth_sendRawTransaction`, and `eth_sendRawTransactionSync`',
                }),
              },
              { request },
            ),
          )

        const serialized = request.params?.[0] as `0x76${string}`
        if (!serialized.startsWith('0x76'))
          return Response.json(
            RpcResponse.from(
              {
                error: new RpcResponse.InvalidParamsError({
                  message: 'service only supports `0x76` transactions',
                }),
              },
              { request },
            ),
          )

        const transaction = Transaction.deserialize(serialized)
        const serializedTransaction = await signTransaction(client, {
          ...transaction,
          feePayer: client.account,
        })

        // Handle based on RPC method
        if ((request as any).method === 'eth_signRawTransaction') {
          // Policy: 'sign-only' - Return signed transaction without broadcasting
          return Response.json(
            RpcResponse.from({ result: serializedTransaction }, { request }),
          )
        }

        // Policy: 'sign-and-broadcast' - Sign, broadcast, and return hash
        const result = await client.request({
          method: request.method,
          params: [serializedTransaction],
        } as never)

        return Response.json(RpcResponse.from({ result }, { request }))
      }),
    ).listen(3050)
  })

  afterAll(() => {
    server.close()
    process.on('SIGINT', () => {
      server.close()
      process.exit(0)
    })
    process.on('SIGTERM', () => {
      server.close()
      process.exit(0)
    })
  })

  describe('secp256k1', () => {
    test('default', async () => {
      const account = privateKeyToAccount(
        // unfunded PK
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const { receipt } = await Actions.token.approveSync(client, {
        account,
        amount: 100n,
        feePayer: true,
        spender: '0x0000000000000000000000000000000000000000',
        token: 1n,
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        feePayerSignature,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, { hash: receipt.transactionHash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(feePayerSignature).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x095ea7b300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064",
              "to": "0x20c0000000000000000000000000000000000001",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: 2d nonces', async () => {
      const account = privateKeyToAccount(
        // unfunded PK
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const receipts = await Promise.all([
        sendTransactionSync(client, {
          account,
          feePayer: true,
          to: '0x0000000000000000000000000000000000000000',
        }),
        sendTransactionSync(client, {
          account,
          feePayer: true,
          to: '0x0000000000000000000000000000000000000001',
        }),
        sendTransactionSync(client, {
          account,
          feePayer: true,
          to: '0x0000000000000000000000000000000000000002',
        }),
      ])

      expect(receipts.every((receipt) => receipt.status === 'success')).toBe(
        true,
      )
    })

    test('behavior: policy: sign-and-broadcast', async () => {
      const client = getClient({
        transport: withFeePayer(http(), http('http://localhost:3050'), {
          policy: 'sign-and-broadcast',
        }),
      })

      // unfunded account that needs sponsorship
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const { receipt } = await Actions.token.approveSync(client, {
        account,
        amount: 100n,
        feePayer: true,
        spender: '0x0000000000000000000000000000000000000000',
        token: 1n,
      })

      expect(receipt.status).toBe('success')
    })
  })

  describe('p256', () => {
    test('default', async () => {
      const account = Account.fromP256(
        '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      )

      const { receipt } = await Actions.token.approveSync(client, {
        account,
        amount: 100n,
        feePayer: true,
        spender: '0x0000000000000000000000000000000000000000',
        token: 1n,
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        feePayerSignature,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, { hash: receipt.transactionHash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(feePayerSignature).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x095ea7b300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064",
              "to": "0x20c0000000000000000000000000000000000001",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })
  })

  describe('webcrypto', () => {
    test('default', async () => {
      const keyPair = await WebCryptoP256.createKeyPair()
      const account = Account.fromWebCryptoP256(keyPair)

      const { receipt } = await Actions.token.approveSync(client, {
        account,
        amount: 100n,
        feePayer: true,
        spender: '0x0000000000000000000000000000000000000000',
        token: 1n,
      })

      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(transaction).toBeDefined()
    })
  })

  describe('webAuthn', () => {
    test('default', async () => {
      const account = Account.fromHeadlessWebAuthn(
        '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        {
          rpId: 'localhost',
          origin: 'http://localhost',
        },
      )

      const { receipt } = await Actions.token.approveSync(client, {
        account,
        amount: 100n,
        feePayer: true,
        spender: '0x0000000000000000000000000000000000000000',
        token: 1n,
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        feePayerSignature,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, { hash: receipt.transactionHash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(feePayerSignature).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x095ea7b300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064",
              "to": "0x20c0000000000000000000000000000000000001",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })
  })
})
