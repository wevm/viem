import { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Sidebar = {
  '/docs/': [
    {
      text: 'Introduction',
      items: [
        { text: 'Why viem', link: '/docs/introduction' },
        { text: 'Getting Started', link: '/docs/getting-started' },
      ],
    },
    {
      text: 'Clients & Transports',
      items: [
        { text: 'Introduction', link: '/docs/clients/intro' },
        { text: 'Public Client', link: '/docs/clients/public' },
        { text: 'Wallet Client', link: '/docs/clients/wallet' },
        { text: 'Test Client', link: '/docs/clients/test' },
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
              text: 'Ethereum Provider (EIP-1193)',
              link: '/docs/clients/transports/ethereum-provider',
            },
          ],
        },
      ],
    },
    {
      text: 'Public Actions',
      collapsible: true,
      collapsed: true,
      items: [
        { text: 'Introduction 🚧', link: '/docs/actions/public/introduction' },
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
              text: 'estimateGas',
              link: '/docs/actions/public/estimateGas',
            },
            {
              text: 'getFeeHistory',
              link: '/docs/actions/public/getFeeHistory',
            },
            {
              text: 'getGasPrice',
              link: '/docs/actions/public/getGasPrice',
            },
            {
              text: 'watchGasPrice 🚧',
              link: '/docs/actions/public/watchGasPrice',
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
              text: 'getFilterLogs 🚧',
              link: '/docs/actions/public/getFilterLogs',
            },
            { text: 'getLogs 🚧', link: '/docs/actions/public/getLogs' },
            {
              text: 'watchEvents',
              link: '/docs/actions/public/watchEvents',
            },
            {
              text: 'uninstallFilter',
              link: '/docs/actions/public/uninstallFilter',
            },
          ],
        },
        {
          text: 'Transaction',
          items: [
            { text: 'call', link: '/docs/actions/public/call' },
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
              text: 'sendRawTransaction 🚧',
              link: '/docs/actions/public/sendRawTransaction',
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
      collapsible: true,
      collapsed: true,
      items: [
        { text: 'Introduction', link: '/docs/actions/wallet/introduction' },
        {
          text: 'Account',
          items: [
            {
              text: 'getAccounts',
              link: '/docs/actions/wallet/getAccounts',
            },
            {
              text: 'requestAccounts',
              link: '/docs/actions/wallet/requestAccounts',
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
              text: 'signTypedData 🚧',
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
              text: 'sendTransaction',
              link: '/docs/actions/wallet/sendTransaction',
            },
            {
              text: 'signTransaction 🚧',
              link: '/docs/actions/wallet/signTransaction',
            },
          ],
        },
      ],
    },
    {
      text: 'Test Actions',
      collapsible: true,
      collapsed: true,
      items: [
        { text: 'Introduction 🚧', link: '/docs/actions/test/introduction' },
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
      text: 'Contract 🚧',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'deployContract 🚧',
          link: '/docs/contract/deployContract',
        },
        {
          text: 'getContract 🚧',
          link: '/docs/contract/getContract',
        },
        {
          text: 'Actions',
          items: [
            {
              text: 'callContract 🚧',
              link: '/docs/contract/callContract',
            },
            {
              text: 'getContractCode 🚧',
              link: '/docs/contract/getContractCode',
            },
            {
              text: 'getContractStorage 🚧',
              link: '/docs/contract/getContractStorage',
            },
            {
              text: 'multicall 🚧',
              link: '/docs/contract/multicall',
            },
            {
              text: 'readContract 🚧',
              link: '/docs/contract/readContract',
            },
            {
              text: 'writeContract 🚧',
              link: '/docs/contract/writeContract',
            },
            {
              text: 'watchContractEvent 🚧',
              link: '/docs/contract/watchContractEvent',
            },
          ],
        },
        {
          text: 'Encoding',
          items: [
            {
              text: 'decodeDeploy 🚧',
              link: '/docs/abi/decodeDeploy',
            },
            {
              text: 'decodeEventLog 🚧',
              link: '/docs/abi/decodeEventLog',
            },
            {
              text: 'decodeFunctionArgs 🚧',
              link: '/docs/abi/decodeFunctionArgs',
            },
            {
              text: 'decodeFunctionError 🚧',
              link: '/docs/abi/decodeFunctionError',
            },
            {
              text: 'decodeFunctionResult 🚧',
              link: '/docs/abi/decodeFunctionResult',
            },
            {
              text: 'encodeDeploy 🚧',
              link: '/docs/abi/encodeDeploy',
            },
            {
              text: 'encodeEventLog 🚧',
              link: '/docs/abi/encodeEventLog',
            },
            {
              text: 'encodeFunctionArgs 🚧',
              link: '/docs/abi/encodeFunctionArgs',
            },
            {
              text: 'encodeFunctionError 🚧',
              link: '/docs/abi/encodeFunctionError',
            },
            {
              text: 'encodeFunctionResult 🚧',
              link: '/docs/abi/encodeFunctionArgs',
            },
          ],
        },
      ],
    },
    {
      text: 'ENS 🚧',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'Actions',
          items: [
            { text: 'getEnsAddress 🚧', link: '/docs/ens/getEnsAddress' },
            { text: 'getEnsAvatar 🚧', link: '/docs/ens/getEnsAvatar' },
            {
              text: 'getEnsCoinAddress 🚧',
              link: '/docs/ens/getEnsCoinAddress',
            },
            { text: 'getEnsContent 🚧', link: '/docs/ens/getEnsContent' },
            { text: 'getEnsCover 🚧', link: '/docs/ens/getEnsCover' },
            { text: 'getEnsName 🚧', link: '/docs/ens/getEnsName' },
            {
              text: 'getEnsResolver 🚧',
              link: '/docs/ens/getEnsResolver',
            },
            {
              text: 'getEnsTextRecord 🚧',
              link: '/docs/ens/getEnsTextRecord',
            },
          ],
        },
        {
          text: 'Utilities',
          items: [
            { text: 'namehash 🚧', link: '/docs/ens/namehash' },
            { text: 'labelhash 🚧', link: '/docs/ens/labelhash' },
          ],
        },
      ],
    },
    {
      text: 'Utilities',
      collapsible: true,
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
              text: 'getContractAddress 🚧',
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
          text: 'Data',
          items: [
            {
              text: 'pad',
              link: '/docs/utilities/pad',
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
              text: 'decodeBytes',
              link: '/docs/utilities/decodeBytes',
            },
            {
              text: 'decodeHex',
              link: '/docs/utilities/decodeHex',
            },
            {
              text: 'decodeRlp',
              link: '/docs/utilities/decodeRlp',
            },
            {
              text: 'encodeBytes',
              link: '/docs/utilities/encodeBytes',
            },
            {
              text: 'encodeHex',
              link: '/docs/utilities/encodeHex',
            },
            {
              text: 'encodeRlp',
              link: '/docs/utilities/encodeRlp',
            },
          ],
        },
        {
          text: 'Hash',
          items: [
            {
              text: 'getEventSignature',
              link: '/docs/utilities/getEventSignature',
            },
            {
              text: 'getSignature',
              link: '/docs/utilities/getSignature',
            },
            {
              text: 'hashMessage 🚧',
              link: '/docs/utilities/hashMessage',
            },
            {
              text: 'keccak256',
              link: '/docs/utilities/keccak256',
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
              text: 'formatUnit',
              link: '/docs/utilities/formatUnit',
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
              text: 'parseUnit',
              link: '/docs/utilities/parseUnit',
            },
          ],
        },
      ],
    },
  ],
}
