import type { Sidebar } from 'vocs'

export const sidebar = {
  '/docs/': [
    {
      text: 'Introduction',
      items: [
        { text: 'Why viem', link: '/docs/introduction' },
        { text: 'Getting Started', link: '/docs/getting-started' },
        { text: 'Platform Compatibility', link: '/docs/compatibility' },
        { text: 'FAQ', link: '/docs/faq' },
      ],
    },
    {
      text: 'Guides',
      items: [
        { text: 'Migration Guide', link: '/docs/migration-guide' },
        { text: 'Ethers v5 → viem', link: '/docs/ethers-migration' },
        { text: 'TypeScript', link: '/docs/typescript' },
        { text: 'Error Handling', link: '/docs/error-handling' },
        { text: 'Blob Transactions', link: '/docs/guides/blob-transactions' },
      ],
    },
    {
      text: 'Clients & Transports',
      items: [
        { text: 'Introduction', link: '/docs/clients/intro' },
        { text: 'Public Client', link: '/docs/clients/public' },
        { text: 'Wallet Client', link: '/docs/clients/wallet' },
        { text: 'Test Client', link: '/docs/clients/test' },
        { text: 'Build your own Client', link: '/docs/clients/custom' },
        {
          text: 'Transports',
          items: [
            {
              text: 'HTTP',
              link: '/docs/clients/transports/http',
            },
            {
              text: 'WebSocket',
              link: '/docs/clients/transports/websocket',
            },
            {
              text: 'Custom (EIP-1193)',
              link: '/docs/clients/transports/custom',
            },
            {
              text: 'IPC',
              link: '/docs/clients/transports/ipc',
            },
            {
              text: 'Fallback',
              link: '/docs/clients/transports/fallback',
            },
          ],
        },
      ],
    },
    {
      text: 'Public Actions',
      collapsed: true,
      items: [
        { text: 'Introduction', link: '/docs/actions/public/introduction' },
        {
          text: 'Account',
          items: [
            {
              text: 'getBalance',
              link: '/docs/actions/public/getBalance',
            },
            {
              text: 'getTransactionCount',
              link: '/docs/actions/public/getTransactionCount',
            },
          ],
        },
        {
          text: 'Block',
          items: [
            { text: 'getBlock', link: '/docs/actions/public/getBlock' },
            {
              text: 'getBlockNumber',
              link: '/docs/actions/public/getBlockNumber',
            },
            {
              text: 'getBlockTransactionCount',
              link: '/docs/actions/public/getBlockTransactionCount',
            },
            {
              text: 'watchBlockNumber',
              link: '/docs/actions/public/watchBlockNumber',
            },
            {
              text: 'watchBlocks',
              link: '/docs/actions/public/watchBlocks',
            },
          ],
        },
        {
          text: 'Chain',
          items: [
            { text: 'getChainId', link: '/docs/actions/public/getChainId' },
          ],
        },
        {
          text: 'Fee',
          items: [
            {
              text: 'estimateFeesPerGas',
              link: '/docs/actions/public/estimateFeesPerGas',
            },
            {
              text: 'estimateGas',
              link: '/docs/actions/public/estimateGas',
            },
            {
              text: 'estimateMaxPriorityFeePerGas',
              link: '/docs/actions/public/estimateMaxPriorityFeePerGas',
            },
            {
              text: 'getBlobBaseFee',
              link: '/docs/actions/public/getBlobBaseFee',
            },
            {
              text: 'getFeeHistory',
              link: '/docs/actions/public/getFeeHistory',
            },
            {
              text: 'getGasPrice',
              link: '/docs/actions/public/getGasPrice',
            },
          ],
        },
        {
          text: 'Filters & Logs',
          items: [
            {
              text: 'createBlockFilter',
              link: '/docs/actions/public/createBlockFilter',
            },
            {
              text: 'createEventFilter',
              link: '/docs/actions/public/createEventFilter',
            },
            {
              text: 'createPendingTransactionFilter',
              link: '/docs/actions/public/createPendingTransactionFilter',
            },
            {
              text: 'getFilterChanges',
              link: '/docs/actions/public/getFilterChanges',
            },
            {
              text: 'getFilterLogs',
              link: '/docs/actions/public/getFilterLogs',
            },
            {
              text: 'getLogs',
              link: '/docs/actions/public/getLogs',
            },
            {
              text: 'watchEvent',
              link: '/docs/actions/public/watchEvent',
            },
            {
              text: 'uninstallFilter',
              link: '/docs/actions/public/uninstallFilter',
            },
          ],
        },
        {
          text: 'Proof',
          items: [
            {
              text: 'getProof',
              link: '/docs/actions/public/getProof',
            },
          ],
        },
        {
          text: 'Signature',
          items: [
            {
              text: 'verifyMessage',
              link: '/docs/actions/public/verifyMessage',
            },
            {
              text: 'verifyTypedData',
              link: '/docs/actions/public/verifyTypedData',
            },
          ],
        },
        {
          text: 'Transaction',
          items: [
            { text: 'call', link: '/docs/actions/public/call' },
            {
              text: 'prepareTransactionRequest',
              link: '/docs/actions/wallet/prepareTransactionRequest',
            },
            {
              text: 'getTransaction',
              link: '/docs/actions/public/getTransaction',
            },
            {
              text: 'getTransactionConfirmations',
              link: '/docs/actions/public/getTransactionConfirmations',
            },
            {
              text: 'getTransactionReceipt',
              link: '/docs/actions/public/getTransactionReceipt',
            },
            {
              text: 'sendRawTransaction',
              link: '/docs/actions/wallet/sendRawTransaction',
            },
            {
              text: 'waitForTransactionReceipt',
              link: '/docs/actions/public/waitForTransactionReceipt',
            },
            {
              text: 'watchPendingTransactions',
              link: '/docs/actions/public/watchPendingTransactions',
            },
          ],
        },
      ],
    },
    {
      text: 'Wallet Actions',
      collapsed: true,
      items: [
        { text: 'Introduction', link: '/docs/actions/wallet/introduction' },
        {
          text: 'Account',
          items: [
            {
              text: 'getAddresses',
              link: '/docs/actions/wallet/getAddresses',
            },
            {
              text: 'requestAddresses',
              link: '/docs/actions/wallet/requestAddresses',
            },
          ],
        },
        {
          text: 'Assets',
          items: [
            {
              text: 'watchAsset',
              link: '/docs/actions/wallet/watchAsset',
            },
          ],
        },
        {
          text: 'Chain',
          items: [
            {
              text: 'addChain',
              link: '/docs/actions/wallet/addChain',
            },
            {
              text: 'switchChain',
              link: '/docs/actions/wallet/switchChain',
            },
          ],
        },
        {
          text: 'Data',
          items: [
            {
              text: 'signMessage',
              link: '/docs/actions/wallet/signMessage',
            },
            {
              text: 'signTypedData',
              link: '/docs/actions/wallet/signTypedData',
            },
          ],
        },
        {
          text: 'Permissions',
          items: [
            {
              text: 'getPermissions',
              link: '/docs/actions/wallet/getPermissions',
            },
            {
              text: 'requestPermissions',
              link: '/docs/actions/wallet/requestPermissions',
            },
          ],
        },
        {
          text: 'Transaction',
          items: [
            {
              text: 'prepareTransactionRequest',
              link: '/docs/actions/wallet/prepareTransactionRequest',
            },
            {
              text: 'sendRawTransaction',
              link: '/docs/actions/wallet/sendRawTransaction',
            },
            {
              text: 'sendTransaction',
              link: '/docs/actions/wallet/sendTransaction',
            },
            {
              text: 'signTransaction',
              link: '/docs/actions/wallet/signTransaction',
            },
          ],
        },
      ],
    },
    {
      text: 'Test Actions',
      collapsed: true,
      items: [
        { text: 'Introduction', link: '/docs/actions/test/introduction' },
        {
          text: 'Account',
          items: [
            {
              text: 'impersonateAccount',
              link: '/docs/actions/test/impersonateAccount',
            },
            { text: 'setBalance', link: '/docs/actions/test/setBalance' },
            { text: 'setCode', link: '/docs/actions/test/setCode' },
            { text: 'setNonce', link: '/docs/actions/test/setNonce' },
            {
              text: 'setStorageAt',
              link: '/docs/actions/test/setStorageAt',
            },
            {
              text: 'stopImpersonatingAccount',
              link: '/docs/actions/test/stopImpersonatingAccount',
            },
          ],
        },
        {
          text: 'Block',
          items: [
            { text: 'getAutomine', link: '/docs/actions/test/getAutomine' },
            {
              text: 'increaseTime',
              link: '/docs/actions/test/increaseTime',
            },
            { text: 'mine', link: '/docs/actions/test/mine' },
            {
              text: 'removeBlockTimestampInterval',
              link: '/docs/actions/test/removeBlockTimestampInterval',
            },
            { text: 'setAutomine', link: '/docs/actions/test/setAutomine' },
            {
              text: 'setIntervalMining',
              link: '/docs/actions/test/setIntervalMining',
            },
            {
              text: 'setBlockTimestampInterval',
              link: '/docs/actions/test/setBlockTimestampInterval',
            },
            {
              text: 'setBlockGasLimit',
              link: '/docs/actions/test/setBlockGasLimit',
            },
            {
              text: 'setNextBlockBaseFeePerGas',
              link: '/docs/actions/test/setNextBlockBaseFeePerGas',
            },
            {
              text: 'setNextBlockTimestamp',
              link: '/docs/actions/test/setNextBlockTimestamp',
            },
          ],
        },
        {
          text: 'Node',
          items: [
            { text: 'setCoinbase', link: '/docs/actions/test/setCoinbase' },
            {
              text: 'setMinGasPrice',
              link: '/docs/actions/test/setMinGasPrice',
            },
          ],
        },
        {
          text: 'Settings',
          items: [
            { text: 'reset', link: '/docs/actions/test/reset' },
            {
              text: 'setLoggingEnabled',
              link: '/docs/actions/test/setLoggingEnabled',
            },
            { text: 'setRpcUrl', link: '/docs/actions/test/setRpcUrl' },
          ],
        },
        {
          text: 'State',
          items: [
            { text: 'dumpState', link: '/docs/actions/test/dumpState' },
            { text: 'loadState', link: '/docs/actions/test/loadState' },
            { text: 'revert', link: '/docs/actions/test/revert' },
            { text: 'snapshot', link: '/docs/actions/test/snapshot' },
          ],
        },
        {
          text: 'Transaction',
          items: [
            {
              text: 'dropTransaction',
              link: '/docs/actions/test/dropTransaction',
            },
            {
              text: 'getTxpoolContent',
              link: '/docs/actions/test/getTxpoolContent',
            },
            {
              text: 'getTxpoolStatus',
              link: '/docs/actions/test/getTxpoolStatus',
            },
            {
              text: 'inspectTxpool',
              link: '/docs/actions/test/inspectTxpool',
            },
            {
              text: 'sendUnsignedTransaction',
              link: '/docs/actions/test/sendUnsignedTransaction',
            },
          ],
        },
      ],
    },
    {
      text: 'Accounts',
      collapsed: true,
      items: [
        { text: 'JSON-RPC', link: '/docs/accounts/jsonRpc' },
        {
          text: 'Local',
          link: '/docs/accounts/local',
          items: [
            { text: 'Private Key', link: '/docs/accounts/privateKey' },
            { text: 'Mnemonic', link: '/docs/accounts/mnemonic' },
            {
              text: 'Hierarchical Deterministic (HD)',
              link: '/docs/accounts/hd',
            },
            { text: 'Custom', link: '/docs/accounts/custom' },
            { text: 'signMessage', link: '/docs/accounts/signMessage' },
            { text: 'signTransaction', link: '/docs/accounts/signTransaction' },
            { text: 'signTypedData', link: '/docs/accounts/signTypedData' },
          ],
        },
      ],
    },
    {
      text: 'Chains',
      collapsed: true,
      items: [
        { text: 'Introduction', link: '/docs/chains/introduction' },
        {
          text: 'Configuration',
          items: [
            {
              text: 'Fees',
              link: '/docs/chains/fees',
            },
            {
              text: 'Formatters',
              link: '/docs/chains/formatters',
            },
            {
              text: 'Serializers',
              link: '/docs/chains/serializers',
            },
          ],
        },
        {
          text: 'Implementations',
          items: [
            {
              text: 'Celo',
              link: '/docs/chains/celo',
            },
            {
              text: 'OP Stack',
              link: '/op-stack',
            },
            {
              text: 'zkSync',
              link: '/zksync',
            },
          ],
        },
      ],
    },
    {
      text: 'Contract',
      collapsed: true,
      items: [
        {
          text: 'Contract Instances',
          link: '/docs/contract/getContract',
        },
        {
          text: 'Actions',
          items: [
            {
              text: 'createContractEventFilter',
              link: '/docs/contract/createContractEventFilter',
            },
            {
              text: 'deployContract',
              link: '/docs/contract/deployContract',
            },
            {
              text: 'estimateContractGas',
              link: '/docs/contract/estimateContractGas',
            },
            {
              text: 'getBytecode',
              link: '/docs/contract/getBytecode',
            },
            {
              text: 'getContractEvents',
              link: '/docs/contract/getContractEvents',
            },
            {
              text: 'getStorageAt',
              link: '/docs/contract/getStorageAt',
            },
            {
              text: 'multicall',
              link: '/docs/contract/multicall',
            },
            {
              text: 'readContract',
              link: '/docs/contract/readContract',
            },
            {
              text: 'simulateContract',
              link: '/docs/contract/simulateContract',
            },
            {
              text: 'writeContract',
              link: '/docs/contract/writeContract',
            },
            {
              text: 'watchContractEvent',
              link: '/docs/contract/watchContractEvent',
            },
          ],
        },
        {
          text: 'Utilities',
          items: [
            {
              text: 'decodeDeployData',
              link: '/docs/contract/decodeDeployData',
            },
            {
              text: 'decodeErrorResult',
              link: '/docs/contract/decodeErrorResult',
            },
            {
              text: 'decodeEventLog',
              link: '/docs/contract/decodeEventLog',
            },
            {
              text: 'decodeFunctionData',
              link: '/docs/contract/decodeFunctionData',
            },
            {
              text: 'decodeFunctionResult',
              link: '/docs/contract/decodeFunctionResult',
            },
            {
              text: 'encodeDeployData',
              link: '/docs/contract/encodeDeployData',
            },
            {
              text: 'encodeErrorResult',
              link: '/docs/contract/encodeErrorResult',
            },
            {
              text: 'encodeEventTopics',
              link: '/docs/contract/encodeEventTopics',
            },
            {
              text: 'encodeFunctionData',
              link: '/docs/contract/encodeFunctionData',
            },
            {
              text: 'encodeFunctionResult',
              link: '/docs/contract/encodeFunctionResult',
            },
            {
              text: 'parseEventLogs',
              link: '/docs/contract/parseEventLogs',
            },
          ],
        },
      ],
    },
    {
      text: 'ENS',
      collapsed: true,
      items: [
        {
          text: 'Actions',
          items: [
            {
              text: 'getEnsAddress',
              link: '/docs/ens/actions/getEnsAddress',
            },
            {
              text: 'getEnsAvatar',
              link: '/docs/ens/actions/getEnsAvatar',
            },
            { text: 'getEnsName', link: '/docs/ens/actions/getEnsName' },
            {
              text: 'getEnsResolver',
              link: '/docs/ens/actions/getEnsResolver',
            },
            {
              text: 'getEnsText',
              link: '/docs/ens/actions/getEnsText',
            },
          ],
        },
        {
          text: 'Utilities',
          items: [
            { text: 'labelhash', link: '/docs/ens/utilities/labelhash' },
            { text: 'namehash', link: '/docs/ens/utilities/namehash' },

            { text: 'normalize', link: '/docs/ens/utilities/normalize' },
          ],
        },
      ],
    },
    {
      text: 'ABI',
      collapsed: true,
      items: [
        {
          text: 'decodeAbiParameters',
          link: '/docs/abi/decodeAbiParameters',
        },
        {
          text: 'encodeAbiParameters',
          link: '/docs/abi/encodeAbiParameters',
        },
        {
          text: 'encodePacked',
          link: '/docs/abi/encodePacked',
        },
        {
          text: 'getAbiItem',
          link: '/docs/abi/getAbiItem',
        },
        {
          text: 'parseAbi',
          link: '/docs/abi/parseAbi',
        },
        {
          text: 'parseAbiItem',
          link: '/docs/abi/parseAbiItem',
        },
        {
          text: 'parseAbiParameter',
          link: '/docs/abi/parseAbiParameter',
        },
        {
          text: 'parseAbiParameters',
          link: '/docs/abi/parseAbiParameters',
        },
      ],
    },
    {
      text: 'Utilities',
      collapsed: true,
      items: [
        {
          text: 'Addresses',
          items: [
            {
              text: 'getAddress',
              link: '/docs/utilities/getAddress',
            },
            {
              text: 'getContractAddress',
              link: '/docs/utilities/getContractAddress',
            },
            {
              text: 'isAddress',
              link: '/docs/utilities/isAddress',
            },
            {
              text: 'isAddressEqual',
              link: '/docs/utilities/isAddressEqual',
            },
          ],
        },
        {
          text: 'Blob',
          items: [
            {
              text: 'blobsToProofs',
              link: '/docs/utilities/blobsToProofs',
            },
            {
              text: 'blobsToCommitments',
              link: '/docs/utilities/blobsToCommitments',
            },
            {
              text: 'commitmentsToVersionedHashes',
              link: '/docs/utilities/commitmentsToVersionedHashes',
            },
            {
              text: 'commitmentToVersionedHash',
              link: '/docs/utilities/commitmentToVersionedHash',
            },
            {
              text: 'fromBlobs',
              link: '/docs/utilities/fromBlobs',
            },
            {
              text: 'sidecarsToVersionedHashes',
              link: '/docs/utilities/sidecarsToVersionedHashes',
            },
            {
              text: 'toBlobs',
              link: '/docs/utilities/toBlobs',
            },
            {
              text: 'toBlobSidecars',
              link: '/docs/utilities/toBlobSidecars',
            },
          ],
        },
        {
          text: 'Chain',
          items: [
            {
              text: 'extractChain',
              link: '/docs/utilities/extractChain',
            },
          ],
        },
        {
          text: 'Data',
          items: [
            {
              text: 'concat',
              link: '/docs/utilities/concat',
            },
            {
              text: 'isBytes',
              link: '/docs/utilities/isBytes',
            },
            {
              text: 'isHex',
              link: '/docs/utilities/isHex',
            },
            {
              text: 'pad',
              link: '/docs/utilities/pad',
            },
            {
              text: 'slice',
              link: '/docs/utilities/slice',
            },
            {
              text: 'size',
              link: '/docs/utilities/size',
            },
            {
              text: 'trim',
              link: '/docs/utilities/trim',
            },
          ],
        },
        {
          text: 'Encoding',
          items: [
            {
              text: 'fromBytes',
              link: '/docs/utilities/fromBytes',
            },
            {
              text: 'fromHex',
              link: '/docs/utilities/fromHex',
            },
            {
              text: 'fromRlp',
              link: '/docs/utilities/fromRlp',
            },
            {
              text: 'toBytes',
              link: '/docs/utilities/toBytes',
            },
            {
              text: 'toHex',
              link: '/docs/utilities/toHex',
            },
            {
              text: 'toRlp',
              link: '/docs/utilities/toRlp',
            },
          ],
        },
        {
          text: 'Hash',
          items: [
            {
              text: 'keccak256',
              link: '/docs/utilities/keccak256',
            },
            {
              text: 'ripemd160',
              link: '/docs/utilities/ripemd160',
            },
            {
              text: 'sha256',
              link: '/docs/utilities/sha256',
            },
            {
              text: 'toEventHash',
              link: '/docs/utilities/toEventHash',
            },
            {
              text: 'toEventSelector',
              link: '/docs/utilities/toEventSelector',
            },
            {
              text: 'toEventSignature',
              link: '/docs/utilities/toEventSignature',
            },
            {
              text: 'toFunctionHash',
              link: '/docs/utilities/toFunctionHash',
            },
            {
              text: 'toFunctionSelector',
              link: '/docs/utilities/toFunctionSelector',
            },
            {
              text: 'toFunctionSignature',
              link: '/docs/utilities/toFunctionSignature',
            },
          ],
        },
        {
          text: 'KZG',
          items: [
            {
              text: 'setupKzg',
              link: '/docs/utilities/setupKzg',
            },
          ],
        },
        {
          text: 'Signature',
          items: [
            {
              text: 'compactSignatureToHex',
              link: '/docs/utilities/compactSignatureToHex',
            },
            {
              text: 'compactSignatureToSignature',
              link: '/docs/utilities/compactSignatureToSignature',
            },
            {
              text: 'hashMessage',
              link: '/docs/utilities/hashMessage',
            },
            {
              text: 'hashTypedData',
              link: '/docs/utilities/hashTypedData',
            },
            {
              text: 'hexToCompactSignature',
              link: '/docs/utilities/hexToCompactSignature',
            },
            {
              text: 'hexToSignature',
              link: '/docs/utilities/hexToSignature',
            },
            {
              text: 'recoverAddress',
              link: '/docs/utilities/recoverAddress',
            },
            {
              text: 'recoverMessageAddress',
              link: '/docs/utilities/recoverMessageAddress',
            },
            {
              text: 'recoverPublicKey',
              link: '/docs/utilities/recoverPublicKey',
            },
            {
              text: 'recoverTransactionAddress',
              link: '/docs/utilities/recoverTransactionAddress',
            },
            {
              text: 'recoverTypedDataAddress',
              link: '/docs/utilities/recoverTypedDataAddress',
            },
            {
              text: 'signatureToCompactSignature',
              link: '/docs/utilities/signatureToCompactSignature',
            },
            {
              text: 'signatureToHex',
              link: '/docs/utilities/signatureToHex',
            },
            {
              text: 'verifyMessage',
              link: '/docs/utilities/verifyMessage',
            },
            {
              text: 'verifyTypedData',
              link: '/docs/utilities/verifyTypedData',
            },
          ],
        },
        {
          text: 'Transaction',
          items: [
            {
              text: 'parseTransaction',
              link: '/docs/utilities/parseTransaction',
            },
            {
              text: 'serializeTransaction',
              link: '/docs/utilities/serializeTransaction',
            },
          ],
        },
        {
          text: 'Units',
          items: [
            {
              text: 'formatEther',
              link: '/docs/utilities/formatEther',
            },
            {
              text: 'formatGwei',
              link: '/docs/utilities/formatGwei',
            },
            {
              text: 'formatUnits',
              link: '/docs/utilities/formatUnits',
            },
            {
              text: 'parseEther',
              link: '/docs/utilities/parseEther',
            },
            {
              text: 'parseGwei',
              link: '/docs/utilities/parseGwei',
            },
            {
              text: 'parseUnits',
              link: '/docs/utilities/parseUnits',
            },
          ],
        },
      ],
    },
    {
      text: 'Third Party',
      collapsed: true,
      items: [
        {
          text: 'Account Abstraction',
          link: '/docs/third-party/account-abstraction',
        },
        {
          text: 'Miscellaneous',
          link: '/docs/third-party/misc',
        },
      ],
    },
    {
      text: 'Glossary',
      collapsed: true,
      items: [
        { text: 'Terms', link: '/docs/glossary/terms' },
        { text: 'Types', link: '/docs/glossary/types' },
        { text: 'Errors', link: '/docs/glossary/errors' },
      ],
    },
  ],
  '/op-stack': {
    backLink: true,
    items: [
      {
        text: 'OP Stack',
        items: [
          {
            text: 'Getting started',
            link: '/op-stack',
          },
          { text: 'Client', link: '/op-stack/client' },
          { text: 'Chains', link: '/op-stack/chains' },
        ],
      },
      {
        text: 'Guides',
        items: [
          {
            text: 'Deposits',
            link: '/op-stack/guides/deposits',
          },
          {
            text: 'Withdrawals',
            link: '/op-stack/guides/withdrawals',
          },
        ],
      },
      {
        text: 'L2 Public Actions',
        items: [
          {
            text: 'buildDepositTransaction',
            link: '/op-stack/actions/buildDepositTransaction',
          },
          {
            text: 'buildProveWithdrawal',
            link: '/op-stack/actions/buildProveWithdrawal',
          },
          {
            text: 'estimateContractL1Fee',
            link: '/op-stack/actions/estimateContractL1Fee',
          },
          {
            text: 'estimateContractL1Gas',
            link: '/op-stack/actions/estimateContractL1Gas',
          },
          {
            text: 'estimateContractTotalFee',
            link: '/op-stack/actions/estimateContractTotalFee',
          },
          {
            text: 'estimateContractTotalGas',
            link: '/op-stack/actions/estimateContractTotalGas',
          },
          {
            text: 'estimateInitiateWithdrawalGas',
            link: '/op-stack/actions/estimateInitiateWithdrawalGas',
          },
          {
            text: 'estimateL1Fee',
            link: '/op-stack/actions/estimateL1Fee',
          },
          {
            text: 'estimateL1Gas',
            link: '/op-stack/actions/estimateL1Gas',
          },
          {
            text: 'estimateTotalFee',
            link: '/op-stack/actions/estimateTotalFee',
          },
          {
            text: 'estimateTotalGas',
            link: '/op-stack/actions/estimateTotalGas',
          },
        ],
      },
      {
        text: 'L2 Wallet Actions',
        items: [
          {
            text: 'initiateWithdrawal',
            link: '/op-stack/actions/initiateWithdrawal',
          },
        ],
      },
      {
        text: 'L1 Public Actions',
        items: [
          {
            text: 'buildInitiateWithdrawal',
            link: '/op-stack/actions/buildInitiateWithdrawal',
          },
          {
            text: 'estimateDepositTransactionGas',
            link: '/op-stack/actions/estimateDepositTransactionGas',
          },
          {
            text: 'estimateFinalizeWithdrawalGas',
            link: '/op-stack/actions/estimateFinalizeWithdrawalGas',
          },
          {
            text: 'estimateProveWithdrawalGas',
            link: '/op-stack/actions/estimateProveWithdrawalGas',
          },
          {
            text: 'getGame',
            link: '/op-stack/actions/getGame',
          },
          {
            text: 'getGames',
            link: '/op-stack/actions/getGames',
          },
          {
            text: 'getL2Output',
            link: '/op-stack/actions/getL2Output',
          },
          {
            text: 'getTimeToFinalize',
            link: '/op-stack/actions/getTimeToFinalize',
          },
          {
            text: 'getTimeToNextGame',
            link: '/op-stack/actions/getTimeToNextGame',
          },
          {
            text: 'getTimeToNextL2Output',
            link: '/op-stack/actions/getTimeToNextL2Output',
          },
          {
            text: 'getTimeToProve',
            link: '/op-stack/actions/getTimeToProve',
          },
          {
            text: 'getWithdrawalStatus',
            link: '/op-stack/actions/getWithdrawalStatus',
          },
          {
            text: 'waitForNextGame',
            link: '/op-stack/actions/waitForNextGame',
          },
          {
            text: 'waitForNextL2Output',
            link: '/op-stack/actions/waitForNextL2Output',
          },
          {
            text: 'waitToFinalize',
            link: '/op-stack/actions/waitToFinalize',
          },
          {
            text: 'waitToProve',
            link: '/op-stack/actions/waitToProve',
          },
        ],
      },
      {
        text: 'L1 Wallet Actions',
        items: [
          {
            text: 'depositTransaction',
            link: '/op-stack/actions/depositTransaction',
          },
          {
            text: 'finalizeWithdrawal',
            link: '/op-stack/actions/finalizeWithdrawal',
          },
          {
            text: 'proveWithdrawal',
            link: '/op-stack/actions/proveWithdrawal',
          },
        ],
      },
      {
        text: 'Utilities',
        items: [
          {
            text: 'extractTransactionDepositedLogs',
            link: '/op-stack/utilities/extractTransactionDepositedLogs',
          },
          {
            text: 'extractWithdrawalMessageLogs',
            link: '/op-stack/utilities/extractWithdrawalMessageLogs',
          },
          {
            text: 'getL2TransactionHash',
            link: '/op-stack/utilities/getL2TransactionHash',
          },
          {
            text: 'getL2TransactionHashes',
            link: '/op-stack/utilities/getL2TransactionHashes',
          },
          {
            text: 'getWithdrawals',
            link: '/op-stack/utilities/getWithdrawals',
          },
          {
            text: 'getSourceHash',
            link: '/op-stack/utilities/getSourceHash',
          },
          {
            text: 'opaqueDataToDepositData',
            link: '/op-stack/utilities/opaqueDataToDepositData',
          },
          {
            text: 'getWithdrawalHashStorageSlot',
            link: '/op-stack/utilities/getWithdrawalHashStorageSlot',
          },
          {
            text: 'parseTransaction',
            link: '/op-stack/utilities/parseTransaction',
          },
          {
            text: 'serializeTransaction',
            link: '/op-stack/utilities/serializeTransaction',
          },
        ],
      },
    ],
  },
  '/zksync': {
    backLink: true,
    items: [
      {
        text: 'zkSync',
        items: [
          {
            text: 'Getting started',
            link: '/zksync',
          },
          { text: 'Client', link: '/zksync/client' },
          { text: 'Chains', link: '/zksync/chains' },
        ],
      },
      {
        text: 'Actions',
        items: [
          {
            text: 'deployContract',
            link: '/zksync/actions/deployContract',
          },
          {
            text: 'sendTransaction',
            link: '/zksync/actions/sendTransaction',
          },
          {
            text: 'signTransaction',
            link: '/zksync/actions/signTransaction',
          },
          {
            text: 'writeContract',
            link: '/zksync/actions/writeContract',
          },
        ],
      },
    ],
  },
} as const satisfies Sidebar
