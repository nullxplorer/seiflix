export * from "./actions/swap";
export * from "./actions/transfer";
export * from "./providers/wallet";
export * from "./types";

import type { Plugin } from "@elizaos/core";
import { swapAction } from "./actions/swap";
import { transferAction } from "./actions/transfer";
import { seiWalletProvider } from "./providers/wallet";
import { getBalanceAction } from "./actions/getBalance";
import { deployAction } from "./actions/deploy";

export const seiPlugin: Plugin = {
    name: "sei",
    description: "sei integration plugin supporting transfers, swaps, staking, bridging, and token deployments",
    providers: [seiWalletProvider],
    evaluators: [],
    services: [],
    actions: [
        getBalanceAction,
        transferAction,
        swapAction,
        deployAction,
    ],
};

export default seiPlugin;
