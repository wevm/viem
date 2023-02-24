import 'viem/window';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Address,
  Hash,
  TransactionReceipt,
  createWalletClient,
  createPublicClient,
  http,
  custom,
  stringify,
} from 'viem';
import { goerli } from 'viem/chains';
import { wagmiContract } from './contract';

const publicClient = createPublicClient({
  chain: goerli,
  transport: http(),
});
const walletClient = createWalletClient({
  transport: custom(window.ethereum!),
});

function Example() {
  const [account, setAccount] = useState<Address>();
  const [hash, setHash] = useState<Hash>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();

  const connect = async () => {
    const accounts = await walletClient.requestAccounts();
    setAccount(accounts[0]);
  };

  const deployContract = async () => {
    const hash = await walletClient.deployContract({
      ...wagmiContract,
      chain: goerli,
      from: account!,
    });
    setHash(hash);
  };

  useEffect(() => {
    (async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        setReceipt(receipt);
      }
    })();
  }, [hash]);

  if (account)
    return (
      <>
        <div>Connected: {account}</div>
        <button onClick={deployContract}>Deploy</button>
        {receipt && (
          <>
            <div>Contract Address: {receipt.contractAddress}</div>
            <div>
              Receipt:{' '}
              <pre>
                <code>{stringify(receipt, null, 2)}</code>
              </pre>
            </div>
          </>
        )}
      </>
    );
  return <button onClick={connect}>Connect Wallet</button>;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Example />);
