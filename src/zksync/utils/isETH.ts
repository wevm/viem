import type { Address } from "../../accounts/index.js";
import { ETH_ADDRESS_IN_CONTRACTS, L2_BASE_TOKEN_ADDRESS, LEGACY_ETH_ADDRESS } from "../constants/address.js";

export function isETH(token: Address) {
    return (
        token.localeCompare(LEGACY_ETH_ADDRESS, undefined, { sensitivity: 'accent' }) === 0 ||
        token.localeCompare(L2_BASE_TOKEN_ADDRESS, undefined, { sensitivity: 'accent' }) === 0 ||
        token.localeCompare(ETH_ADDRESS_IN_CONTRACTS, undefined, { sensitivity: 'accent' }) === 0
    );
}