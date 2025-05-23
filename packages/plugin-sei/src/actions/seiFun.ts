import {
    type Action,
    type IAgentRuntime,
    type Memory,
    type State,
    type HandlerCallback,
    elizaLogger,
} from "@elizaos/core";
import { generateObject, composeContext, ModelClass } from "@elizaos/core";
import {
    createPublicClient,
    createWalletClient,
    http,
    parseEther,
    encodeFunctionData,
    type WalletClient,
    type Account,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { seiTestnet, sei } from "viem/chains";
import { parseUnits, getAddress } from "viem/utils";
import { seiFunTemplate } from "../templates";

import {
    PumpSchema,
    isPumpContent,
    isPumpBuyContent,
    isPumpCreateContent,
    isPumpSellContent,
} from "../types";
import MEMEABI from "../abi/meme";
import ERC20ABI from "../abi/erc20";

// Helper function to check and approve token allowance if needed
async function ensureAllowance(
    walletClient: WalletClient,
    rpcUrl: string,
    account: Account,
    tokenAddress: `0x${string}`,
    memeAddress: `0x${string}`,
    amount: bigint
) {
    elizaLogger.log(
        `Checking allowance: token: ${tokenAddress} meme: ${memeAddress} amount: ${amount}`
    );

    const publicClient = createPublicClient({
        transport: http(rpcUrl),
        chain: sei,
    });

    const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [account.address, memeAddress],
    });

    elizaLogger.log("allowance:", allowance);

    if (allowance < amount) {
        elizaLogger.log(
            `allowance(${allowance}) is less than amount(${amount}), approving...`
        );

        const hash = await walletClient.sendTransaction({
            account,
            to: tokenAddress,
            data: encodeFunctionData({
                abi: ERC20ABI,
                functionName: "approve",
                args: [memeAddress, amount - allowance],
            }),
            chain: sei,
            kzg: undefined,
        });

        elizaLogger.log(`Approving hash: ${hash}`);
        await publicClient.waitForTransactionReceipt({ hash });
        elizaLogger.log(`Approving success: ${hash}`);
    } else {
        elizaLogger.log("No need to approve");
    }
}

// Main SeiFun action definition
export const seiFun: Action = {
    name: "SEI_FUN",
    description:
        "Perform actions on SeiFun, for example create a new token, buy a token, or sell a token.",
    similes: ["SELL_TOKEN", "BUY_TOKEN", "CREATE_TOKEN_SEIFUN"],
    examples: [
        // Create token example
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create a new token called GLITCHIZA with symbol GLITCHIZA and generate a description about it on SeiFun.",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Token GLITCHIZA (GLITCHIZA) created successfully!\nContract Address: 0x1234567890abcdef\n",
                    action: "CREATE_TOKEN_SEIFUN",
                    content: {
                        tokenInfo: {
                            symbol: "GLITCHIZA",
                            address:
                                "EugPwuZ8oUMWsYHeBGERWvELfLGFmA1taDtmY8uMeX6r",
                            creator:
                                "9jW8FPr6BSSsemWPV22UUCzSqkVdTp6HTyPqeqyuBbCa",
                            name: "GLITCHIZA",
                            description: "A GLITCHIZA token",
                        },
                        amount: "1",
                    },
                },
            },
        ],
        // Buy token example
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Buy 0.00069 SEI worth of GLITCHIZA(0x1234567890abcdef)",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "0.00069 SEI bought successfully!",
                    action: "BUY_TOKEN",
                    content: {
                        address: "0x1234567890abcdef",
                        amount: "0.00069",
                    },
                },
            },
        ],
        // Sell token example
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Sell 0.00069 SEI worth of GLITCHIZA(0x1234567890abcdef)",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "0.00069 SEI sold successfully: 0x1234567890abcdef",
                    action: "SELL_TOKEN",
                    content: {
                        address: "0x1234567890abcdef",
                        amount: "0.00069",
                    },
                },
            },
        ],
    ],
    // eslint-disable-next-line
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true; // No extra validation needed
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        _options?: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        let success = false;

        // Initialize or update state
        let currentState = state;
        if (!currentState) {
            currentState = (await runtime.composeState(message)) as State;
        } else {
            currentState = await runtime.updateRecentMessageState(currentState);
        }

        // Generate content based on template
        const context = composeContext({
            state: currentState,
            template: seiFunTemplate,
        });

        const content = await generateObject({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
            schema: PumpSchema,
        });

        if (!isPumpContent(content.object)) {
            throw new Error("Invalid content");
        }

        // Setup clients and account
        const rpcUrl = sei.rpcUrls.default.http[0];
        const account = privateKeyToAccount(
            runtime.getSetting("SEI_PRIVATE_KEY") as `0x${string}`
        );
        const walletClient = createWalletClient({
            transport: http(rpcUrl),
        });

        const contentObject = content.object;
        let data: `0x${string}`;
        let value: bigint;

        try {
            // Handle different action types
            switch (contentObject.action) {
                case "CREATE_TOKEN_SEIFUN":
                    if (!isPumpCreateContent(contentObject)) {
                        elizaLogger.error(
                            "Invalid PumpCreateContent: ",
                            contentObject
                        );
                        throw new Error("Invalid PumpCreateContent");
                    }
                    elizaLogger.log(
                        "creating: ",
                        contentObject.params.name,
                        contentObject.params.symbol,
                        contentObject.params.description
                    );
                    data = encodeFunctionData({
                        abi: MEMEABI,
                        functionName: "newToken",
                        args: [
                            contentObject.params.name,
                            contentObject.params.symbol,
                            contentObject.params.description,
                        ],
                    });
                    value = parseEther("10");
                    break;

                case "BUY_TOKEN":
                    if (!isPumpBuyContent(contentObject)) {
                        elizaLogger.error(
                            "Invalid PumpBuyContent: ",
                            contentObject
                        );
                        throw new Error("Invalid PumpBuyContent");
                    }
                    value = parseUnits(
                        contentObject.params.value.toString(),
                        18
                    );
                    elizaLogger.log(
                        "buying: ",
                        contentObject.params.tokenAddress,
                        value
                    );
                    data = encodeFunctionData({
                        abi: MEMEABI,
                        functionName: "buy",
                        args: [
                            contentObject.params.tokenAddress as `0x${string}`,
                            account.address,
                            0n,
                            false,
                        ],
                    });
                    break;

                case "SELL_TOKEN": {
                    if (!isPumpSellContent(contentObject)) {
                        elizaLogger.error(
                            "Invalid PumpSellContent: ",
                            contentObject
                        );
                        throw new Error("Invalid PumpSellContent");
                    }
                    const tokenAddress = getAddress(
                        contentObject.params.tokenAddress as `0x${string}`
                    );
                    elizaLogger.log(
                        "selling: ",
                        tokenAddress,
                        account.address,
                        contentObject.params.value
                    );
                    const amountUnits = parseUnits(
                        contentObject.params.value.toString(),
                        18
                    );

                    await ensureAllowance(
                        walletClient,
                        rpcUrl,
                        account,
                        tokenAddress as `0x${string}`,
                        runtime.getSetting(
                            "SEI_MEME_CONTRACT_ADDRESS"
                        ) as `0x${string}`,
                        amountUnits
                    );

                    data = encodeFunctionData({
                        abi: MEMEABI,
                        functionName: "sell",
                        args: [tokenAddress, amountUnits, 0n],
                    });
                    value = 0n;
                    break;
                }
            }

            // Simulate and execute transaction
            const publicClient = createPublicClient({
                transport: http(rpcUrl),
                chain: sei,
            });

            const memeContractAddress = runtime.getSetting(
                "SEI_MEME_CONTRACT_ADDRESS"
            ) as `0x${string}`;

            const simulate = await publicClient.call({
                to: memeContractAddress,
                data,
                value,
                account,
            });
            elizaLogger.log("simulate: ", simulate);

            const hash = await walletClient.sendTransaction({
                account,
                to: memeContractAddress,
                data,
                chain: sei,
                kzg: undefined,
                value,
            });

            success = true;

            if (callback) {
                callback({
                    text: `Perform the action successfully: ${content.object.action}: ${hash}`,
                    content: content.object,
                });
            }
        } catch (error) {
            elizaLogger.error(`Error performing the action: ${error}`);
            if (callback) {
                callback({
                    text: `Failed to perform the action: ${content.object.action}: ${error}`,
                });
            }
        }

        return success;
    },
};
