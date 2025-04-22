import { describe, it, expect, beforeAll } from "vitest";
import {
    Account,
    generatePrivateKey,
    privateKeyToAccount,
} from "viem/accounts";
import { sei, seiTestnet } from "viem/chains";

import { WalletProvider } from "../providers/wallet";

const customRpcUrls = {
    sei: "custom-rpc.sei.io",
    seiTestnet: "custom-rpc.seiTestnet.io",
};

describe("Wallet provider", () => {
    let pk: `0x${string}`;
    let account: Account;
    let walletProvider: WalletProvider;

    beforeAll(() => {
        pk = generatePrivateKey();
        account = privateKeyToAccount(pk);
        walletProvider = new WalletProvider(pk);
    });

    describe("Constructor", () => {
        it("get address", () => {
            const expectedAddress = account.address;

            expect(walletProvider.getAddress()).toEqual(expectedAddress);
        });
        it("get current chain", () => {
            expect(walletProvider.getCurrentChain().id).toEqual(sei.id);
        });
        it("get chain configs", () => {
            expect(walletProvider.getChainConfigs("sei").id).toEqual(sei.id);
            expect(walletProvider.getChainConfigs("seiTestnet").id).toEqual(
                seiTestnet.id
            );
        });
    });
    describe("Clients", () => {
        it("generates public client", () => {
            const client = walletProvider.getPublicClient("sei");
            expect(client.chain.id).toEqual(sei.id);
            expect(client.transport.url).toEqual(sei.rpcUrls.default.http[0]);
        });
        it("generates public client with custom rpcurl", () => {
            const chain = WalletProvider.genChainFromName(
                "sei",
                customRpcUrls.sei
            );
            const wp = new WalletProvider(pk, { ["sei"]: chain });

            const client = wp.getPublicClient("sei");
            expect(client.chain.id).toEqual(sei.id);
            expect(client.chain.rpcUrls.default.http[0]).toEqual(
                sei.rpcUrls.default.http[0]
            );
            expect(client.chain.rpcUrls.custom.http[0]).toEqual(
                customRpcUrls.sei
            );
            expect(client.transport.url).toEqual(customRpcUrls.sei);
        });
        it("generates wallet client", () => {
            const expectedAddress = account.address;

            const client = walletProvider.getWalletClient("sei");

            expect(client.account?.address).toEqual(expectedAddress);
            expect(client.transport.url).toEqual(sei.rpcUrls.default.http[0]);
        });
        it("generates wallet client with custom rpcurl", () => {
            const account = privateKeyToAccount(pk);
            const expectedAddress = account.address;
            const chain = WalletProvider.genChainFromName(
                "sei",
                customRpcUrls.sei
            );
            const wp = new WalletProvider(pk, { ["sei"]: chain });

            const client = wp.getWalletClient("sei");

            expect(client.account?.address).toEqual(expectedAddress);
            expect(client.chain?.id).toEqual(sei.id);
            expect(client.chain?.rpcUrls.default.http[0]).toEqual(
                sei.rpcUrls.default.http[0]
            );
            expect(client.chain?.rpcUrls.custom.http[0]).toEqual(
                customRpcUrls.sei
            );
            expect(client.transport.url).toEqual(customRpcUrls.sei);
        });
    });
});
