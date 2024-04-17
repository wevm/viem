import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import { readContract } from "../../actions/index.js";
import { erc20Abi } from "../../constants/abis.js";
import type { Account, GetAccountParameter } from '../../types/account.js'
import { parseAccount } from "../../utils/accounts.js";
import type { Address } from '../../accounts/index.js';
import type { BlockTag } from '../../types/block.js';

export type BalanceOfTokenL1Parameters<TAccount extends Account | undefined = Account | undefined> =
    GetAccountParameter<TAccount> & {
        token: Address
        blockTag?: BlockTag | undefined
    };

export async function getBalanceOfTokenL1<
    TChain extends Chain | undefined,
    TAccount extends Account | undefined
>(
    client: Client<Transport, TChain, TAccount>,
    parameters: BalanceOfTokenL1Parameters<TAccount>,
): Promise<bigint> {
    const { token, blockTag, account: account_ } =
        parameters as BalanceOfTokenL1Parameters<TAccount>;

    const account = account_ ? parseAccount(account_) : client.account;

    return await readContract(client, {
        abi: erc20Abi,
        address: token,
        functionName: 'balanceOf',
        args: [account!.address],
        blockTag: blockTag,
    });
}
