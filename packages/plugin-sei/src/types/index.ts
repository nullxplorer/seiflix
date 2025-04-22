import type { Address, Hash } from "viem";
import { z } from "zod";

export type SupportedChain = "sei" | "seiTestnet";
export type StakeAction = "deposit" | "withdraw" | "claim";
export * from "./precompiles"

// Action parameters
export interface GetBalanceParams {
    chain: SupportedChain;
    address?: Address;
    token: string;
}

export interface TransferParams {
    chain: SupportedChain;
    token?: string;
    amount?: string;
    toAddress: Address;
    data?: `0x${string}`;
}

export interface SwapParams {
    chain: SupportedChain;
    fromToken: string;
    toToken: string;
    amount: string;
    slippage?: number;
}

export interface BridgeParams {
    fromChain: SupportedChain;
    toChain: SupportedChain;
    fromToken?: Address;
    toToken?: Address;
    amount: string;
    toAddress?: Address;
}

export interface StakeParams {
    chain: SupportedChain;
    action: StakeAction;
    amount?: string;
}

export interface FaucetParams {
    token?: string;
    toAddress?: Address;
}

// Action return types
export interface GetBalanceResponse {
    chain: SupportedChain;
    address: Address;
    balance?: { token: string; amount: string };
}

export interface TransferResponse {
    chain: SupportedChain;
    txHash: Hash;
    recipient: Address;
    amount: string;
    token: string;
    data?: `0x${string}`;
}

export interface SwapResponse {
    chain: SupportedChain;
    txHash: Hash;
    fromToken: string;
    toToken: string;
    amount: string;
}

export interface BridgeResponse {
    fromChain: SupportedChain;
    toChain: SupportedChain;
    txHash: Hash;
    recipient: Address;
    fromToken: string;
    toToken: string;
    amount: string;
}

export interface StakeResponse {
    response: string;
}

export interface FaucetResponse {
    token: string;
    recipient: Address;
    txHash: Hash;
}

export interface IDeployERC20Params {
    chain: SupportedChain;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
}

export interface IDeployERC721Params {
    chain: SupportedChain;
    name: string;
    symbol: string;
    baseURI: string;
}

export interface IDeployERC1155Params {
    chain: SupportedChain;
    name: string;
    baseURI: string;
}

export const PumpCreateSchema = z.object({
    action: z.literal("CREATE_TOKEN_SEIFUN"),
    params: z.object({
        symbol: z.string(),
        name: z.string(),
        description: z.string(),
    }),
});

export const PumpBuySchema = z.object({
    action: z.literal("BUY_TOKEN"),
    params: z.object({
        tokenAddress: z.string(),
        value: z.number(),
    }),
});

export const PumpSellSchema = z.object({
    action: z.literal("SELL_TOKEN"),
    params: z.object({
        tokenAddress: z.string(),
        value: z.number(),
    }),
});

export const PumpSchema = z.union([
    PumpCreateSchema,
    PumpBuySchema,
    PumpSellSchema,
]);

export type PumpContent = z.infer<typeof PumpSchema>;
export type PumpCreateContent = z.infer<typeof PumpCreateSchema>;
export type PumpBuyContent = z.infer<typeof PumpBuySchema>;
export type PumpSellContent = z.infer<typeof PumpSellSchema>;

export function isPumpContent(object: any): object is PumpContent {
    if (PumpSchema.safeParse(object).success) {
        return true;
    }
    console.error("Invalid content: ", object);
    return false;
}

export function isPumpCreateContent(object: any): object is PumpCreateContent {
    return PumpCreateSchema.safeParse(object).success;
}

export function isPumpBuyContent(object: any): object is PumpBuyContent {
    return PumpBuySchema.safeParse(object).success;
}

export function isPumpSellContent(object: any): object is PumpSellContent {
    return PumpSellSchema.safeParse(object).success;
}


