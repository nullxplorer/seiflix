import {
    composeContext,
    elizaLogger,
    generateObjectDeprecated,
    type HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";
import {
    formatEther,
    formatUnits,
    parseEther,
    parseUnits,
    erc20Abi,
    type Hex,
} from "viem";

import {
    seiWalletProvider,
    initWalletProvider,
    type WalletProvider,
} from "../providers/wallet";
import { transferTemplate } from "../templates";
import type { ADDRESS_PRECOMPILE_ABI, ADDRESS_PRECOMPILE_ADDRESS, TransferParams, TransferResponse } from "../types";

export { transferTemplate };

// Exported for tests
export class TransferAction {
    private readonly TRANSFER_GAS = 21000n;
    private readonly DEFAULT_GAS_PRICE = 300n as const; // 3 Gwei

    constructor(private walletProvider: WalletProvider) {}

    async transfer(params: TransferParams): Promise<TransferResponse> {
        elizaLogger.debug("Transfer params:", params);
        this.validateAndNormalizeParams(params);
        elizaLogger.debug("Normalized transfer params:", params);

        console.log("params:", params);
        
        const fromAddress = this.walletProvider.getAddress();

        this.walletProvider.switchChain(params.chain);

        const nativeToken =
            this.walletProvider.chains[params.chain].nativeCurrency.symbol;

        console.log("params.token:", params);
        console.log("nativeToken:", nativeToken);
        

        const resp: TransferResponse = {
            chain: params.chain,
            txHash: "0x",
            recipient: params.toAddress,
            amount: "",
            token: params.token ?? nativeToken,
        };

        if (!params.token || params.token === nativeToken) {
            // Native token transfer
            const options: { gas?: bigint; gasPrice?: bigint; data?: Hex } = {
                data: params.data,
            };
            let value: bigint;
            if (!params.amount) {
                // Transfer all balance minus gas
                const publicClient = this.walletProvider.getPublicClient(
                    params.chain
                );
                const balance = await publicClient.getBalance({
                    address: fromAddress,
                });

                value = balance - this.DEFAULT_GAS_PRICE * 21000n;
                options.gas = this.TRANSFER_GAS;
                options.gasPrice = this.DEFAULT_GAS_PRICE;
                options.data = params.data as Hex;
            } else {
                value = parseEther(params.amount);
            }

            resp.amount = formatEther(value);
            resp.txHash = await this.walletProvider.transfer(
                params.chain,
                params.toAddress,
                value,
                options
            );
        } else {
            // ERC20 token transfer
            let tokenAddress = params.token;
            if (!params.token.startsWith("0x")) {
                tokenAddress = await this.walletProvider.getTokenAddress(
                    params.chain,
                    params.token
                );
            }

            const publicClient = this.walletProvider.getPublicClient(
                params.chain
            );
            const decimals = await publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: "decimals",
            });

            let value: bigint;
            if (!params.amount) {
                value = await publicClient.readContract({
                    address: tokenAddress as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "balanceOf",
                    args: [fromAddress],
                });
            } else {
                value = parseUnits(params.amount, decimals);
            }

            resp.amount = formatUnits(value, decimals);
            resp.txHash = await this.walletProvider.transferERC20(
                params.chain,
                tokenAddress as `0x${string}`,
                params.toAddress,
                value
            );
        }

        if (!resp.txHash || resp.txHash === "0x") {
            throw new Error("Get transaction hash failed");
        }

        // wait for the transaction to be confirmed
        const publicClient = this.walletProvider.getPublicClient(params.chain);
        await publicClient.waitForTransactionReceipt({
            hash: resp.txHash,
        });

        return resp;
    }

    async validateAndNormalizeParams(params: TransferParams): Promise<void> {
        if (!params.toAddress) {
            throw new Error("To address is required");
        }
        params.toAddress = await this.walletProvider.formatAddress(
            params.toAddress
        );
    }
}

export const transferAction = {
    name: "transfer",
    description: "Transfer tokens between addresses on the same chain",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: Record<string, unknown>,
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting transfer action...");

        // // Validate transfer
        // if (!(message.content.source === "direct")) {
        //     callback?.({
        //         text: "I can't do that for you.",
        //         content: { error: "Transfer not allowed" },
        //     });
        //     return false;
        // }

        // Initialize or update state
        let currentState = state;
        if (!currentState) {
            currentState = (await runtime.composeState(message)) as State;
        } else {
            currentState = await runtime.updateRecentMessageState(currentState);
        }
        state.walletInfo = await seiWalletProvider.get(
            runtime,
            message,
            currentState
        );

        // Compose transfer context
        const transferContext = composeContext({
            state: currentState,
            template: transferTemplate,
        });
        const content = await generateObjectDeprecated({
            runtime,
            context: transferContext,
            modelClass: ModelClass.LARGE,
        });

        console.log("content:", content);
        

        const walletProvider = initWalletProvider(runtime);
        const action = new TransferAction(walletProvider);
        const paramOptions: TransferParams = {
            chain: content.chain,
            token: content.token,
            amount: content.amount,
            toAddress: content.toAddress,
            data: content.data === "null" || content.data === null ? undefined : content.data,
        };
        try {
            const transferResp = await action.transfer(paramOptions);
            callback?.({
                text: `Successfully transferred ${transferResp.amount} ${transferResp.token} to ${transferResp.recipient}\nTransaction Hash: ${transferResp.txHash}`,
                content: { ...transferResp },
            });

            return true;
        } catch (error) {
            elizaLogger.error("Error during transfer:", error.message);
            callback?.({
                text: `Transfer failed: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    template: transferTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("SEI_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Transfer 1 SEI to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll help you transfer 1 SEI to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Sei",
                    action: "TRANSFER",
                    content: {
                        chain: "sei",
                        token: "SEI",
                        amount: "1",
                        toAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    },
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Transfer 1 SEI to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Sei Testnet",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll help you transfer 1 SEI to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Sei Testnet",
                    action: "TRANSFER",
                    content: {
                        chain: "seiTestnet",
                        token: "SEI",
                        amount: "1",
                        toAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    },
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Transfer 1 token of 0x1234 to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll help you transfer 1 token of 0x1234 to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Sei",
                    action: "TRANSFER",
                    content: {
                        chain: "sei",
                        token: "0x1234",
                        amount: "1",
                        toAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    },
                },
            },
        ],
    ],
    similes: ["TRANSFER", "SEND_TOKENS", "TOKEN_TRANSFER", "MOVE_TOKENS"],
};
