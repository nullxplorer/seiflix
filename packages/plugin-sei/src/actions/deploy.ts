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
import solc from "solc";
import { type Abi, type Address, parseUnits } from "viem";
import {
    seiWalletProvider,
    initWalletProvider,
    type WalletProvider,
} from "../providers/wallet";
import { ercContractTemplate } from "../templates";
import type {
    IDeployERC1155Params,
    IDeployERC721Params,
    IDeployERC20Params,
    SupportedChain,
} from "../types";
import { compileSolidity } from "../utils/contracts";

export { ercContractTemplate };

export class DeployAction {
    constructor(private walletProvider: WalletProvider) {}

    async compileSolidity(contractName: string, source: string) {
        const solName = `${contractName}.sol`;
        const input = {
            language: "Solidity",
            sources: {
                [solName]: {
                    content: source,
                },
            },
            settings: {
                outputSelection: {
                    "*": {
                        "*": ["*"],
                    },
                },
            },
        };
        elizaLogger.debug("Compiling contract...");
        const output = JSON.parse(solc.compile(JSON.stringify(input)));

        // check compile error
        if (output.errors) {
            const hasError = output.errors.some(
                (error) => error.type === "Error"
            );
            if (hasError) {
                elizaLogger.error(
                    `Compilation errors: ${JSON.stringify(output.errors, null, 2)}`
                );
            }
        }

        const contract = output.contracts[solName][contractName];

        if (!contract) {
            elizaLogger.error("Compilation result is empty");
        }

        elizaLogger.debug("Contract compiled successfully");
        return {
            abi: contract.abi as Abi,
            bytecode: contract.evm.bytecode.object,
        };
    }

    async deployERC20(deployTokenParams: IDeployERC20Params) {
        elizaLogger.debug("deployTokenParams", deployTokenParams);

        const { name, symbol, decimals, totalSupply, chain } =
            deployTokenParams;
        if (!name || name === "") {
            throw new Error("Token name is required");
        }
        if (!symbol || symbol === "") {
            throw new Error("Token symbol is required");
        }
        if (!decimals || decimals === 0) {
            throw new Error("Token decimals is required");
        }
        if (!totalSupply || totalSupply === "") {
            throw new Error("Token total supply is required");
        }

        try {
            const totalSupplyWithDecimals = parseUnits(totalSupply, decimals);
            const args = [name, symbol, decimals, totalSupplyWithDecimals];
            const contractAddress = await this.deployContract(
                chain,
                "ERC20Contract",
                args
            );

            return {
                address: contractAddress,
            };
        } catch (error) {
            elizaLogger.error("Deploy ERC20 failed:", error.message);
            throw error;
        }
    }

    async deployERC721(deployNftParams: IDeployERC721Params) {
        elizaLogger.debug("deployNftParams", deployNftParams);

        const { baseURI, name, symbol, chain } = deployNftParams;
        if (!name || name === "") {
            throw new Error("Token name is required");
        }
        if (!symbol || symbol === "") {
            throw new Error("Token symbol is required");
        }
        if (!baseURI || baseURI === "") {
            throw new Error("Token baseURI is required");
        }
        try {
            const args = [name, symbol, baseURI];
            const contractAddress = await this.deployContract(
                chain,
                "ERC721Contract",
                args
            );

            return {
                address: contractAddress,
            };
        } catch (error) {
            elizaLogger.error("Deploy ERC721 failed:", error.message);
            throw error;
        }
    }

    async deployERC1155(deploy1155Params: IDeployERC1155Params) {
        elizaLogger.debug("deploy1155Params", deploy1155Params);

        const { baseURI, name, chain } = deploy1155Params;
        if (!name || name === "") {
            throw new Error("Token name is required");
        }
        if (!baseURI || baseURI === "") {
            throw new Error("Token baseURI is required");
        }
        try {
            const args = [name, baseURI];
            const contractAddress = await this.deployContract(
                chain,
                "ERC1155Contract",
                args
            );

            return {
                address: contractAddress,
            };
        } catch (error) {
            elizaLogger.error("Deploy ERC1155 failed:", error.message);
            throw error;
        }
    }

    async deployContract(
        chain: SupportedChain,
        contractName: string,
        args: any[]
    ): Promise<Address | null | undefined> {
        const { abi, bytecode } = await compileSolidity(contractName);
        if (!bytecode) {
            throw new Error("Bytecode is empty after compilation");
        }

        this.walletProvider.switchChain(chain);

        const chainConfig = this.walletProvider.getChainConfigs(chain);
        const walletClient = this.walletProvider.getWalletClient(chain);
        const hash = await walletClient.deployContract({
            account: this.walletProvider.getAccount(),
            abi,
            bytecode,
            args,
            chain: chainConfig,
        });

        elizaLogger.debug("Waiting for deployment transaction...", hash);
        const publicClient = this.walletProvider.getPublicClient(chain);
        const receipt = await publicClient.waitForTransactionReceipt({
            hash,
        });
        elizaLogger.debug("Contract deployed successfully!");

        return receipt.contractAddress;
    }
}

export const deployAction = {
    name: "DEPLOY_TOKEN",
    description:
        "Deploy token contracts (ERC20/721/1155) based on user specifications",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: Record<string, unknown>,
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting deploy action...");

        // Initialize or update state
        let currentState = state;
        if (!currentState) {
            currentState = (await runtime.composeState(message)) as State;
        } else {
            currentState = await runtime.updateRecentMessageState(currentState);
        }

        state.walletInfo = await seiWalletProvider.get(runtime, message, currentState);

        // Compose context
        const context = composeContext({
            state: currentState,
            template: ercContractTemplate,
        });
        const content = await generateObjectDeprecated({
            runtime,
            context: context,
            modelClass: ModelClass.LARGE,
        });

        const walletProvider = initWalletProvider(runtime);
        const action = new DeployAction(walletProvider);
        try {
            const contractType = content.contractType;
            let result: any;
            switch (contractType.toLocaleLowerCase()) {
                case "erc20":
                    result = await action.deployERC20({
                        chain: content.chain,
                        decimals: content.decimals,
                        symbol: content.symbol,
                        name: content.name,
                        totalSupply: content.totalSupply,
                    });
                    break;
                case "erc721":
                    result = await action.deployERC721({
                        chain: content.chain,
                        name: content.name,
                        symbol: content.symbol,
                        baseURI: content.baseURI,
                    });
                    break;
                case "erc1155":
                    result = await action.deployERC1155({
                        chain: content.chain,
                        name: content.name,
                        baseURI: content.baseURI,
                    });
                    break;
            }

            if (result) {
                callback?.({
                    text: `Successfully create contract - ${result?.address}`,
                    content: { ...result },
                });
            } else {
                callback?.({
                    text: "Unsuccessfully create contract",
                    content: { ...result },
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error during deploy:", error.message);
            callback?.({
                text: `Deploy failed: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
    template: ercContractTemplate,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "deploy an ERC20 token with name 'MyToken', symbol 'MTK', decimals 18, total supply 10000",
                    action: "DEPLOY_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Deploy an ERC721 NFT contract with name 'MyNFT', symbol 'MNFT', baseURI 'https://my-nft-base-uri.com'",
                    action: "DEPLOY_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Deploy an ERC1155 contract with name 'My1155', baseURI 'https://my-1155-base-uri.com'",
                    action: "DEPLOY_TOKEN",
                },
            },
        ],
    ],
    similes: [
        "DEPLOY_ERC20",
        "DEPLOY_ERC721",
        "DEPLOY_ERC1155",
        "CREATE_TOKEN",
        "CREATE_NFT",
        "CREATE_1155",
    ],
};
