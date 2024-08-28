import { createPublicClient, http, parseEther } from 'viem';
import {
  createBundlerClient,
  toCoinbaseSmartAccount,
} from 'viem/account-abstraction';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const main = async () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  try {

    const owner = privateKeyToAccount(
      'PRIVATE_KEY'
    );

    const account = await toCoinbaseSmartAccount({
      client,
      owners: [owner],
    });

    const bundlerClient = createBundlerClient({
      account,
      client,
      transport: http(
        'https://bundler.biconomy.io/api/v2/11155111/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44'
      ),
    });

    const userOpHash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
          value: parseEther('0.001'),
        },
      ],
    });

    return userOpHash;
  } catch (error) {
    return error;
  }

};

const userOpHash = await main();

export default [`UserOpHash: ${userOpHash}`];
