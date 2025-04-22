# Agentic Hackathon


# EVM Plugin Code2Prompt

Project Path: plugin-evm

Source Tree:

```
plugin-evm
├── tsup.config.ts
├── package.json
├── biome.json
├── README.md
├── tsconfig.json
└── src
    ├── templates
    │   └── index.ts
    ├── contracts
    │   ├── src
    │   │   ├── VoteToken.sol
    │   │   ├── TimelockController.sol
    │   │   └── OZGovernor.sol
    │   └── artifacts
    │       ├── OZGovernor.json
    │       ├── VoteToken.json
    │       └── TimelockController.json
    ├── actions
    │   ├── swap.ts
    │   ├── bridge.ts
    │   ├── gov-execute.ts
    │   ├── gov-propose.ts
    │   ├── gov-vote.ts
    │   ├── transfer.ts
    │   └── gov-queue.ts
    ├── tests
    │   ├── gov.test.ts
    │   ├── wallet.test.ts
    │   ├── swap.test.ts
    │   └── transfer.test.ts
    ├── types
    │   └── index.ts
    ├── providers
    │   └── wallet.ts
    └── index.ts

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/tsup.config.ts`:

```ts
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    format: ["esm"], // Ensure you're targeting CommonJS
    external: [
        "dotenv", // Externalize dotenv to prevent bundling
        "fs", // Externalize fs to use Node.js built-in module
        "path", // Externalize other built-ins if necessary
        "@reflink/reflink",
        "@node-llama-cpp",
        "https",
        "http",
        "agentkeepalive",
        "viem",
        "@lifi/sdk",
        "events",
        "node-cache",
    ],
});

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/package.json`:

```json
{
	"name": "@elizaos/plugin-evm",
	"version": "0.1.9",
	"type": "module",
	"main": "dist/index.js",
	"module": "dist/index.js",
	"types": "dist/index.d.ts",
	"exports": {
		"./package.json": "./package.json",
		".": {
			"import": {
				"@elizaos/source": "./src/index.ts",
				"types": "./dist/index.d.ts",
				"default": "./dist/index.js"
			}
		}
	},
	"files": [
		"dist"
	],
	"dependencies": {
		"@elizaos/core": "workspace:*",
		"@elizaos/plugin-tee": "workspace:*",
		"@lifi/data-types": "5.15.5",
		"@lifi/sdk": "3.4.1",
		"@lifi/types": "16.3.0",
		"tsup": "8.3.5"
	},
	"devDependencies": {
		"@biomejs/biome": "1.9.4"
	},
	"scripts": {
		"build": "tsup --format esm --dts",
		"dev": "tsup --format esm --dts --watch",
		"test": "vitest run",
		"lint": "biome lint .",
		"lint:fix": "biome check --apply .",
		"format": "biome format .",
		"format:fix": "biome format --write ."
	},
	"peerDependencies": {
		"whatwg-url": "7.1.0"
	}
}

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "organizeImports": {
    "enabled": false
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error"
      },
      "suspicious": {
        "noExplicitAny": "error"
      },
      "style": {
        "useConst": "error",
        "useImportType": "off"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 4,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5"
    }
  },
  "files": {
    "ignore": [
      "dist/**/*",
      "extra/**/*",
      "node_modules/**/*"
    ]
  }
}
```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/README.md`:

```md
# @elizaos/plugin-evm

This plugin provides actions and providers for interacting with EVM-compatible chains.

## Description

The EVM plugin provides comprehensive functionality for interacting with EVM-compatible chains, including token transfers, cross-chain bridging, and token swaps using LiFi integration.

## Features

- Multi-chain support with dynamic chain configuration
- Native token transfers
- Cross-chain token bridging via LiFi
- Token swapping on supported DEXs
- Wallet balance tracking
- Custom RPC endpoint configuration
- Automatic retry mechanisms
- Comprehensive transaction management

## Installation

```bash
pnpm install @elizaos/plugin-evm
```

## Configuration

### Required Environment Variables

```env
# Required
EVM_PRIVATE_KEY=your-private-key-here

# Optional - Custom RPC URLs
EVM_PROVIDER_URL=https://your-custom-mainnet-rpc-url
ETHEREUM_PROVIDER_<CHAIN_NAME>=https://your-custom-rpc-url
```

### Chain Configuration

By default, **Ethereum mainnet** is enabled. To enable additional chains, add them to your character config:

```json
"settings": {
    "chains": {
        "evm": [
            "base", "arbitrum", "iotex"
        ]
    }
}
```

Note: The chain names must match those in the viem/chains.

### Custom RPC URLs

By default, the RPC URL is inferred from the `viem/chains` config. To use a custom RPC URL for a specific chain, add the following to your `.env` file:

```env
ETHEREUM_PROVIDER_<CHAIN_NAME>=https://your-custom-rpc-url
```

**Example usage:**

```env
ETHEREUM_PROVIDER_IOTEX=https://iotex-network.rpc.thirdweb.com
```

#### Custom RPC for Ethereum Mainnet

To set a custom RPC URL for Ethereum mainnet, use:

```env
EVM_PROVIDER_URL=https://your-custom-mainnet-rpc-url
```

## Provider

The **Wallet Provider** initializes with the **first chain in the list** as the default (or Ethereum mainnet if none are added). It:

- Provides the **context** of the currently connected address and its balance.
- Creates **Public** and **Wallet clients** to interact with the supported chains.
- Allows adding chains dynamically at runtime.

## Actions

### 1. Transfer

Transfer native tokens on the same chain:

```typescript
// Example: Transfer 1 ETH
Transfer 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

### 2. Bridge

Bridge tokens between different chains using LiFi:

```typescript
// Example: Bridge ETH from Ethereum to Base
Bridge 1 ETH from Ethereum to Base
```

### 3. Swap

Swap tokens on the same chain using LiFi:

```typescript
// Example: Swap ETH for USDC
Swap 1 ETH for USDC on Base
```

### 4. Propose

Propose a proposal to a governor on a specific chain.

- **Proposal**
    - **Targets**
    - **Values**
    - **Calldatas**
    - **Description**
- **Chain**
- **Governor**

**Example usage:**

```bash
Propose a proposal to the 0xdeadbeef00000000000000000000000000000000 governor on Ethereum to transfer 1 ETH to 0xRecipient.
```

### 5. Vote

Vote on a proposal to a governor on a specific chain.

- **Proposal ID**
- **Support**
- **Chain**
- **Governor**

**Example usage:**

```bash
Vote on the proposal with ID 1 to support the proposal on the 0xdeadbeef00000000000000000000000000000000 governor on Ethereum.
```

### 6. Queue

Queue a proposal to a governor on a specific chain.

- **Proposal**
    - **Targets**
    - **Values**
    - **Calldatas**
    - **Description**
- **Chain**
- **Governor**

**Example usage:**

```bash
Queue the proposal to the 0xdeadbeef00000000000000000000000000000000 governor on Ethereum.
```

### 7. Execute

Execute a proposal to a governor on a specific chain.

- **Proposal ID**
- **Chain**
- **Governor**

**Example usage:**

```bash
Execute the proposal with ID 1 on the 0xdeadbeef00000000000000000000000000000000 governor on Ethereum.
```

## Development

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build the plugin:

```bash
pnpm run build
```

4. Run tests:

```bash
pnpm test
```

## API Reference

### Core Components

1. **WalletProvider**

    - Manages wallet connections
    - Handles chain switching
    - Manages RPC endpoints
    - Tracks balances

2. **Actions**
    - TransferAction: Native token transfers
    - BridgeAction: Cross-chain transfers
    - SwapAction: Same-chain token swaps

## Future Enhancements

1. **Cross-Chain Operations**

    - Enhanced bridge aggregation
    - Multi-chain transaction batching
    - Cross-chain liquidity management
    - Bridge fee optimization
    - Chain-specific gas strategies
    - Cross-chain messaging

2. **DeFi Integration**

    - Advanced swap routing
    - Yield farming automation
    - Liquidity pool management
    - Position management tools
    - MEV protection features
    - Flash loan integration

3. **Smart Contract Management**

    - Contract deployment templates
    - Verification automation
    - Upgrade management
    - Security analysis tools
    - Gas optimization
    - ABI management system

4. **Token Operations**

    - Batch transfer tools
    - Token approval management
    - Token metadata handling
    - Custom token standards
    - Token bridging optimization
    - NFT support enhancement

5. **Wallet Features**

    - Multi-signature support
    - Account abstraction
    - Hardware wallet integration
    - Social recovery options
    - Transaction simulation
    - Batch transaction processing

6. **Network Management**

    - Dynamic RPC management
    - Network health monitoring
    - Fallback provider system
    - Custom network addition
    - Gas price optimization
    - Network analytics

7. **Security Enhancements**

    - Transaction validation
    - Risk assessment tools
    - Fraud detection
    - Rate limiting
    - Emergency shutdown
    - Audit integration

8. **Developer Tools**
    - Enhanced debugging
    - Testing framework
    - Documentation generator
    - CLI improvements
    - Performance profiling
    - Integration templates

We welcome community feedback and contributions to help prioritize these enhancements.

## Contributing

The plugin contains tests. Whether you're using **TDD** or not, please make sure to run the tests before submitting a PR:

```bash
pnpm test
```

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## Credits

This plugin integrates with and builds upon several key technologies:

- [Ethereum](https://ethereum.org/): Decentralized blockchain
- [LiFi](https://lifi.io/): Cross-chain bridge and swap service
- [viem](https://viem.sh/): Ethereum client library
- [wagmi](https://wagmi.sh/): Ethereum client library

Special thanks to:

- [Ethereum Developer community](https://ethereum.org/developers/)
- The Eliza community for their contributions and feedback

For more information about EVM capabilities:

- [Ethereum Documentation](https://ethereum.org/developers/)
- [LiFi Documentation](https://lifi.io)
- [viem Documentation](https://viem.sh)
- [wagmi Documentation](https://wagmi.sh)

## License

This plugin is part of the Eliza project. See the main project repository for license information.

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/tsconfig.json`:

```json
{
    "extends": "../core/tsconfig.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "./src",
        "typeRoots": ["./node_modules/@types", "./src/types"],
        "declaration": true
    },
    "include": ["src"]
}

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/templates/index.ts`:

```ts
export const transferTemplate = `You are an AI assistant specialized in processing cryptocurrency transfer requests. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Here's a list of supported chains:
<supported_chains>
{{supportedChains}}
</supported_chains>

Your goal is to extract the following information about the requested transfer:
1. Chain to execute on (must be one of the supported chains)
2. Amount to transfer (in ETH, without the coin symbol)
3. Recipient address (must be a valid Ethereum address)
4. Token symbol or address (if not a native token transfer)

Before providing the final JSON output, show your reasoning process inside <analysis> tags. Follow these steps:

1. Identify the relevant information from the user's message:
   - Quote the part of the message mentioning the chain.
   - Quote the part mentioning the amount.
   - Quote the part mentioning the recipient address.
   - Quote the part mentioning the token (if any).

2. Validate each piece of information:
   - Chain: List all supported chains and check if the mentioned chain is in the list.
   - Amount: Attempt to convert the amount to a number to verify it's valid.
   - Address: Check that it starts with "0x" and count the number of characters (should be 42).
   - Token: Note whether it's a native transfer or if a specific token is mentioned.

3. If any information is missing or invalid, prepare an appropriate error message.

4. If all information is valid, summarize your findings.

5. Prepare the JSON structure based on your analysis.

After your analysis, provide the final output in a JSON markdown block. All fields except 'token' are required. The JSON should have this structure:

\`\`\`json
{
    "fromChain": string,
    "amount": string,
    "toAddress": string,
    "token": string | null
}
\`\`\`

Remember:
- The chain name must be a string and must exactly match one of the supported chains.
- The amount should be a string representing the number without any currency symbol.
- The recipient address must be a valid Ethereum address starting with "0x".
- If no specific token is mentioned (i.e., it's a native token transfer), set the "token" field to null.

Now, process the user's request and provide your response.
`;

export const bridgeTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested token bridge:
- Token symbol or address to bridge
- Source chain
- Destination chain
- Amount to bridge: Must be a string representing the amount in ether (only number without coin symbol, e.g., "0.1")
- Destination address (if specified)

Respond with a JSON markdown block containing only the extracted values:

\`\`\`json
{
    "token": string | null,
    "fromChain": "ethereum" | "abstract" | "base" | "sepolia" | "bsc" | "arbitrum" | "avalanche" | "polygon" | "optimism" | "cronos" | "gnosis" | "fantom" | "fraxtal" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto" | "alienx" | "gravity" | null,
    "toChain": "ethereum" | "abstract" | "base" | "sepolia" | "bsc" | "arbitrum" | "avalanche" | "polygon" | "optimism" | "cronos" | "gnosis" | "fantom" | "fraxtal" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto" | "alienx" | "gravity" |  null,
    "amount": string | null,
    "toAddress": string | null
}
\`\`\`
`;

export const swapTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested token swap:
- Input token symbol or address (the token being sold)
- Output token symbol or address (the token being bought)
- Amount to swap: Must be a string representing the amount in ether (only number without coin symbol, e.g., "0.1")
- Chain to execute on

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "inputToken": string | null,
    "outputToken": string | null,
    "amount": string | null,
    "chain": "ethereum" | "abstract" | "base" | "sepolia" | "bsc" | "arbitrum" | "avalanche" | "polygon" | "optimism" | "cronos" | "gnosis" | "fantom" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto" | "alienx" | null,
    "slippage": number | null
}
\`\`\`
`;

export const proposeTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested proposal:
- Targets
- Values
- Calldatas
- Description
- Governor address
- Chain to execute on

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "targets": string[] | null,
    "values": string[] | null,
    "calldatas": string[] | null,
    "description": string | null,
    "governor": string | null
    "chain": "ethereum" | "base" | "sepolia" | "bsc" | "arbitrum" | "avalanche" | "polygon" | "optimism" | "cronos" | "gnosis" | "fantom" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto" | null,
}
\`\`\`
`;

export const voteTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested vote:
- Proposal ID
- Support (1 for yes, 2 for no, 3 for abstain)
- Governor address
- Chain to execute on

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "proposalId": string | null,
    "support": number | null,
    "governor": string | null
    "chain": "ethereum" | "base" | "sepolia" | "bsc" | "arbitrum" | "avalanche" | "polygon" | "optimism" | "cronos" | "gnosis" | "fantom" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto" | null,
}
\`\`\`
`;

export const queueProposalTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested proposal:
- Targets
- Values
- Calldatas
- Description
- Governor address
- Chain to execute on

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "targets": string[] | null,
    "values": string[] | null,
    "calldatas": string[] | null,
    "description": string | null,
    "governor": string | null
    "chain": "ethereum" | "base" | "sepolia" | "bsc" | "arbitrum" | "avalanche" | "polygon" | "optimism" | "cronos" | "gnosis" | "fantom" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto" | null,
}
\`\`\`
`;

export const executeProposalTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested proposal:
- Targets
- Values
- Calldatas
- Description
- Governor address
- Chain to execute on

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "targets": string[] | null,
    "values": string[] | null,
    "calldatas": string[] | null,
    "description": string | null,
    "governor": string | null
    "chain": "ethereum" | "base" | "sepolia" | "bsc" | "arbitrum" | "avalanche" | "polygon" | "optimism" | "cronos" | "gnosis" | "fantom" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto" | null,
}
\`\`\`
`;

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/contracts/src/VoteToken.sol`:

```sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { ERC20Votes } from "node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { Nonces } from "node_modules/@openzeppelin/contracts/utils/Nonces.sol";
import { Time } from "node_modules/@openzeppelin/contracts/utils/types/Time.sol";

contract VoteToken is ERC20Permit, ERC20Votes {
  constructor(
    string memory _name,
    string memory _symbol
  ) ERC20(_name, _symbol) ERC20Permit(_name) {}

  /**
   * Overrides
   */
  function _update(
    address from,
    address to,
    uint256 value
  ) internal override(ERC20, ERC20Votes) {
    super._update(from, to, value);
  }

  function nonces(
    address _owner
  ) public view override(ERC20Permit, Nonces) returns (uint256) {
    return super.nonces(_owner);
  }

  function decimals() public view virtual override(ERC20) returns (uint8) {
    return super.decimals();
  }

  /**
   * ERC5805 Clock
   */
  function clock() public view override returns (uint48) {
    return Time.timestamp();
  }

  function CLOCK_MODE() public pure override returns (string memory) {
    return "mode=timestamp";
  }
}

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/contracts/src/TimelockController.sol`:

```sol
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (governance/TimelockController.sol)

pragma solidity ^0.8.20;

import {AccessControl} from "../access/AccessControl.sol";
import {ERC721Holder} from "../token/ERC721/utils/ERC721Holder.sol";
import {ERC1155Holder} from "../token/ERC1155/utils/ERC1155Holder.sol";
import {Address} from "../utils/Address.sol";

/**
 * @dev Contract module which acts as a timelocked controller. When set as the
 * owner of an `Ownable` smart contract, it enforces a timelock on all
 * `onlyOwner` maintenance operations. This gives time for users of the
 * controlled contract to exit before a potentially dangerous maintenance
 * operation is applied.
 *
 * By default, this contract is self administered, meaning administration tasks
 * have to go through the timelock process. The proposer (resp executor) role
 * is in charge of proposing (resp executing) operations. A common use case is
 * to position this {TimelockController} as the owner of a smart contract, with
 * a multisig or a DAO as the sole proposer.
 */
contract TimelockController is AccessControl, ERC721Holder, ERC1155Holder {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");
    uint256 internal constant _DONE_TIMESTAMP = uint256(1);

    mapping(bytes32 id => uint256) private _timestamps;
    uint256 private _minDelay;

    enum OperationState {
        Unset,
        Waiting,
        Ready,
        Done
    }

    /**
     * @dev Mismatch between the parameters length for an operation call.
     */
    error TimelockInvalidOperationLength(uint256 targets, uint256 payloads, uint256 values);

    /**
     * @dev The schedule operation doesn't meet the minimum delay.
     */
    error TimelockInsufficientDelay(uint256 delay, uint256 minDelay);

    /**
     * @dev The current state of an operation is not as required.
     * The `expectedStates` is a bitmap with the bits enabled for each OperationState enum position
     * counting from right to left.
     *
     * See {_encodeStateBitmap}.
     */
    error TimelockUnexpectedOperationState(bytes32 operationId, bytes32 expectedStates);

    /**
     * @dev The predecessor to an operation not yet done.
     */
    error TimelockUnexecutedPredecessor(bytes32 predecessorId);

    /**
     * @dev The caller account is not authorized.
     */
    error TimelockUnauthorizedCaller(address caller);

    /**
     * @dev Emitted when a call is scheduled as part of operation `id`.
     */
    event CallScheduled(
        bytes32 indexed id,
        uint256 indexed index,
        address target,
        uint256 value,
        bytes data,
        bytes32 predecessor,
        uint256 delay
    );

    /**
     * @dev Emitted when a call is performed as part of operation `id`.
     */
    event CallExecuted(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data);

    /**
     * @dev Emitted when new proposal is scheduled with non-zero salt.
     */
    event CallSalt(bytes32 indexed id, bytes32 salt);

    /**
     * @dev Emitted when operation `id` is cancelled.
     */
    event Cancelled(bytes32 indexed id);

    /**
     * @dev Emitted when the minimum delay for future operations is modified.
     */
    event MinDelayChange(uint256 oldDuration, uint256 newDuration);

    /**
     * @dev Initializes the contract with the following parameters:
     *
     * - `minDelay`: initial minimum delay in seconds for operations
     * - `proposers`: accounts to be granted proposer and canceller roles
     * - `executors`: accounts to be granted executor role
     * - `admin`: optional account to be granted admin role; disable with zero address
     *
     * IMPORTANT: The optional admin can aid with initial configuration of roles after deployment
     * without being subject to delay, but this role should be subsequently renounced in favor of
     * administration through timelocked proposals. Previous versions of this contract would assign
     * this admin to the deployer automatically and should be renounced as well.
     */
    constructor(uint256 minDelay, address[] memory proposers, address[] memory executors, address admin) {
        // self administration
        _grantRole(DEFAULT_ADMIN_ROLE, address(this));

        // optional admin
        if (admin != address(0)) {
            _grantRole(DEFAULT_ADMIN_ROLE, admin);
        }

        // register proposers and cancellers
        for (uint256 i = 0; i < proposers.length; ++i) {
            _grantRole(PROPOSER_ROLE, proposers[i]);
            _grantRole(CANCELLER_ROLE, proposers[i]);
        }

        // register executors
        for (uint256 i = 0; i < executors.length; ++i) {
            _grantRole(EXECUTOR_ROLE, executors[i]);
        }

        _minDelay = minDelay;
        emit MinDelayChange(0, minDelay);
    }

    /**
     * @dev Modifier to make a function callable only by a certain role. In
     * addition to checking the sender's role, `address(0)` 's role is also
     * considered. Granting a role to `address(0)` is equivalent to enabling
     * this role for everyone.
     */
    modifier onlyRoleOrOpenRole(bytes32 role) {
        if (!hasRole(role, address(0))) {
            _checkRole(role, _msgSender());
        }
        _;
    }

    /**
     * @dev Contract might receive/hold ETH as part of the maintenance process.
     */
    receive() external payable {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControl, ERC1155Holder) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns whether an id corresponds to a registered operation. This
     * includes both Waiting, Ready, and Done operations.
     */
    function isOperation(bytes32 id) public view returns (bool) {
        return getOperationState(id) != OperationState.Unset;
    }

    /**
     * @dev Returns whether an operation is pending or not. Note that a "pending" operation may also be "ready".
     */
    function isOperationPending(bytes32 id) public view returns (bool) {
        OperationState state = getOperationState(id);
        return state == OperationState.Waiting || state == OperationState.Ready;
    }

    /**
     * @dev Returns whether an operation is ready for execution. Note that a "ready" operation is also "pending".
     */
    function isOperationReady(bytes32 id) public view returns (bool) {
        return getOperationState(id) == OperationState.Ready;
    }

    /**
     * @dev Returns whether an operation is done or not.
     */
    function isOperationDone(bytes32 id) public view returns (bool) {
        return getOperationState(id) == OperationState.Done;
    }

    /**
     * @dev Returns the timestamp at which an operation becomes ready (0 for
     * unset operations, 1 for done operations).
     */
    function getTimestamp(bytes32 id) public view virtual returns (uint256) {
        return _timestamps[id];
    }

    /**
     * @dev Returns operation state.
     */
    function getOperationState(bytes32 id) public view virtual returns (OperationState) {
        uint256 timestamp = getTimestamp(id);
        if (timestamp == 0) {
            return OperationState.Unset;
        } else if (timestamp == _DONE_TIMESTAMP) {
            return OperationState.Done;
        } else if (timestamp > block.timestamp) {
            return OperationState.Waiting;
        } else {
            return OperationState.Ready;
        }
    }

    /**
     * @dev Returns the minimum delay in seconds for an operation to become valid.
     *
     * This value can be changed by executing an operation that calls `updateDelay`.
     */
    function getMinDelay() public view virtual returns (uint256) {
        return _minDelay;
    }

    /**
     * @dev Returns the identifier of an operation containing a single
     * transaction.
     */
    function hashOperation(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) public pure virtual returns (bytes32) {
        return keccak256(abi.encode(target, value, data, predecessor, salt));
    }

    /**
     * @dev Returns the identifier of an operation containing a batch of
     * transactions.
     */
    function hashOperationBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata payloads,
        bytes32 predecessor,
        bytes32 salt
    ) public pure virtual returns (bytes32) {
        return keccak256(abi.encode(targets, values, payloads, predecessor, salt));
    }

    /**
     * @dev Schedule an operation containing a single transaction.
     *
     * Emits {CallSalt} if salt is nonzero, and {CallScheduled}.
     *
     * Requirements:
     *
     * - the caller must have the 'proposer' role.
     */
    function schedule(
        address target,
        uint256 value,
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) public virtual onlyRole(PROPOSER_ROLE) {
        bytes32 id = hashOperation(target, value, data, predecessor, salt);
        _schedule(id, delay);
        emit CallScheduled(id, 0, target, value, data, predecessor, delay);
        if (salt != bytes32(0)) {
            emit CallSalt(id, salt);
        }
    }

    /**
     * @dev Schedule an operation containing a batch of transactions.
     *
     * Emits {CallSalt} if salt is nonzero, and one {CallScheduled} event per transaction in the batch.
     *
     * Requirements:
     *
     * - the caller must have the 'proposer' role.
     */
    function scheduleBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata payloads,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) public virtual onlyRole(PROPOSER_ROLE) {
        if (targets.length != values.length || targets.length != payloads.length) {
            revert TimelockInvalidOperationLength(targets.length, payloads.length, values.length);
        }

        bytes32 id = hashOperationBatch(targets, values, payloads, predecessor, salt);
        _schedule(id, delay);
        for (uint256 i = 0; i < targets.length; ++i) {
            emit CallScheduled(id, i, targets[i], values[i], payloads[i], predecessor, delay);
        }
        if (salt != bytes32(0)) {
            emit CallSalt(id, salt);
        }
    }

    /**
     * @dev Schedule an operation that is to become valid after a given delay.
     */
    function _schedule(bytes32 id, uint256 delay) private {
        if (isOperation(id)) {
            revert TimelockUnexpectedOperationState(id, _encodeStateBitmap(OperationState.Unset));
        }
        uint256 minDelay = getMinDelay();
        if (delay < minDelay) {
            revert TimelockInsufficientDelay(delay, minDelay);
        }
        _timestamps[id] = block.timestamp + delay;
    }

    /**
     * @dev Cancel an operation.
     *
     * Requirements:
     *
     * - the caller must have the 'canceller' role.
     */
    function cancel(bytes32 id) public virtual onlyRole(CANCELLER_ROLE) {
        if (!isOperationPending(id)) {
            revert TimelockUnexpectedOperationState(
                id,
                _encodeStateBitmap(OperationState.Waiting) | _encodeStateBitmap(OperationState.Ready)
            );
        }
        delete _timestamps[id];

        emit Cancelled(id);
    }

    /**
     * @dev Execute an (ready) operation containing a single transaction.
     *
     * Emits a {CallExecuted} event.
     *
     * Requirements:
     *
     * - the caller must have the 'executor' role.
     */
    // This function can reenter, but it doesn't pose a risk because _afterCall checks that the proposal is pending,
    // thus any modifications to the operation during reentrancy should be caught.
    // slither-disable-next-line reentrancy-eth
    function execute(
        address target,
        uint256 value,
        bytes calldata payload,
        bytes32 predecessor,
        bytes32 salt
    ) public payable virtual onlyRoleOrOpenRole(EXECUTOR_ROLE) {
        bytes32 id = hashOperation(target, value, payload, predecessor, salt);

        _beforeCall(id, predecessor);
        _execute(target, value, payload);
        emit CallExecuted(id, 0, target, value, payload);
        _afterCall(id);
    }

    /**
     * @dev Execute an (ready) operation containing a batch of transactions.
     *
     * Emits one {CallExecuted} event per transaction in the batch.
     *
     * Requirements:
     *
     * - the caller must have the 'executor' role.
     */
    // This function can reenter, but it doesn't pose a risk because _afterCall checks that the proposal is pending,
    // thus any modifications to the operation during reentrancy should be caught.
    // slither-disable-next-line reentrancy-eth
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata payloads,
        bytes32 predecessor,
        bytes32 salt
    ) public payable virtual onlyRoleOrOpenRole(EXECUTOR_ROLE) {
        if (targets.length != values.length || targets.length != payloads.length) {
            revert TimelockInvalidOperationLength(targets.length, payloads.length, values.length);
        }

        bytes32 id = hashOperationBatch(targets, values, payloads, predecessor, salt);

        _beforeCall(id, predecessor);
        for (uint256 i = 0; i < targets.length; ++i) {
            address target = targets[i];
            uint256 value = values[i];
            bytes calldata payload = payloads[i];
            _execute(target, value, payload);
            emit CallExecuted(id, i, target, value, payload);
        }
        _afterCall(id);
    }

    /**
     * @dev Execute an operation's call.
     */
    function _execute(address target, uint256 value, bytes calldata data) internal virtual {
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        Address.verifyCallResult(success, returndata);
    }

    /**
     * @dev Checks before execution of an operation's calls.
     */
    function _beforeCall(bytes32 id, bytes32 predecessor) private view {
        if (!isOperationReady(id)) {
            revert TimelockUnexpectedOperationState(id, _encodeStateBitmap(OperationState.Ready));
        }
        if (predecessor != bytes32(0) && !isOperationDone(predecessor)) {
            revert TimelockUnexecutedPredecessor(predecessor);
        }
    }

    /**
     * @dev Checks after execution of an operation's calls.
     */
    function _afterCall(bytes32 id) private {
        if (!isOperationReady(id)) {
            revert TimelockUnexpectedOperationState(id, _encodeStateBitmap(OperationState.Ready));
        }
        _timestamps[id] = _DONE_TIMESTAMP;
    }

    /**
     * @dev Changes the minimum timelock duration for future operations.
     *
     * Emits a {MinDelayChange} event.
     *
     * Requirements:
     *
     * - the caller must be the timelock itself. This can only be achieved by scheduling and later executing
     * an operation where the timelock is the target and the data is the ABI-encoded call to this function.
     */
    function updateDelay(uint256 newDelay) external virtual {
        address sender = _msgSender();
        if (sender != address(this)) {
            revert TimelockUnauthorizedCaller(sender);
        }
        emit MinDelayChange(_minDelay, newDelay);
        _minDelay = newDelay;
    }

    /**
     * @dev Encodes a `OperationState` into a `bytes32` representation where each bit enabled corresponds to
     * the underlying position in the `OperationState` enum. For example:
     *
     * 0x000...1000
     *   ^^^^^^----- ...
     *         ^---- Done
     *          ^--- Ready
     *           ^-- Waiting
     *            ^- Unset
     */
    function _encodeStateBitmap(OperationState operationState) internal pure returns (bytes32) {
        return bytes32(1 << uint8(operationState));
    }
}

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/contracts/src/OZGovernor.sol`:

```sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "node_modules/@openzeppelin/contracts/governance/Governor.sol";
import "node_modules/@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "node_modules/@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "node_modules/@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "node_modules/@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "node_modules/@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract OZGovernor is
  Governor,
  GovernorSettings,
  GovernorCountingSimple,
  GovernorVotes,
  GovernorVotesQuorumFraction,
  GovernorTimelockControl
{
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor(
    IVotes _token,
    TimelockController _timelock,
    uint48 _votingDelay, // {s}
    uint32 _votingPeriod, // {s}
    uint256 _proposalThreshold, // e.g. 0.01e18 for 1%
    uint256 quorumPercent // e.g 4 for 4%
  )
    Governor("OZ Governor")
    GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
    GovernorVotes(_token)
    GovernorVotesQuorumFraction(quorumPercent)
    GovernorTimelockControl(_timelock)
  {}

  function votingDelay()
    public
    view
    override(Governor, GovernorSettings)
    returns (uint256)
  {
    return super.votingDelay();
  }

  function votingPeriod()
    public
    view
    override(Governor, GovernorSettings)
    returns (uint256)
  {
    return super.votingPeriod();
  }

  function quorum(
    uint256 blockNumber
  )
    public
    view
    override(Governor, GovernorVotesQuorumFraction)
    returns (uint256)
  {
    return super.quorum(blockNumber);
  }

  function state(
    uint256 proposalId
  )
    public
    view
    override(Governor, GovernorTimelockControl)
    returns (ProposalState)
  {
    return super.state(proposalId);
  }

  function proposalNeedsQueuing(
    uint256 proposalId
  ) public view override(Governor, GovernorTimelockControl) returns (bool) {
    return super.proposalNeedsQueuing(proposalId);
  }

  function proposalThreshold()
    public
    view
    override(Governor, GovernorSettings)
    returns (uint256)
  {
    uint256 threshold = super.proposalThreshold(); // D18{1}
    uint256 pastSupply = token().getPastTotalSupply(clock() - 1);

    // CEIL to make sure thresholds near 0% don't get rounded down to 0 tokens
    return (threshold * pastSupply + (1e18 - 1)) / 1e18;
  }

  function _queueOperations(
    uint256 proposalId,
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
    return
      super._queueOperations(
        proposalId,
        targets,
        values,
        calldatas,
        descriptionHash
      );
  }

  function _executeOperations(
    uint256 proposalId,
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) internal override(Governor, GovernorTimelockControl) {
    super._executeOperations(
      proposalId,
      targets,
      values,
      calldatas,
      descriptionHash
    );
  }

  function _cancel(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
    return super._cancel(targets, values, calldatas, descriptionHash);
  }

  function _executor()
    internal
    view
    override(Governor, GovernorTimelockControl)
    returns (address)
  {
    return super._executor();
  }
}

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/contracts/artifacts/OZGovernor.json`:

```json
{
  "_format": "hh-sol-artifact-1",
  "contractName": "OZGovernor",
  "sourceName": "src/OZGovernor.sol",
  "abi": [
    {
      "inputs": [
        {
          "internalType": "contract IVotes",
          "name": "_token",
          "type": "address"
        },
        {
          "internalType": "contract TimelockController",
          "name": "_timelock",
          "type": "address"
        },
        {
          "internalType": "uint48",
          "name": "_votingDelay",
          "type": "uint48"
        },
        {
          "internalType": "uint32",
          "name": "_votingPeriod",
          "type": "uint32"
        },
        {
          "internalType": "uint256",
          "name": "_proposalThreshold",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quorumPercent",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "CheckpointUnorderedInsertion",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FailedCall",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "GovernorAlreadyCastVote",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "GovernorAlreadyQueuedProposal",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GovernorDisabledDeposit",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "proposer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "votes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        }
      ],
      "name": "GovernorInsufficientProposerVotes",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "targets",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "calldatas",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "values",
          "type": "uint256"
        }
      ],
      "name": "GovernorInvalidProposalLength",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "quorumNumerator",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quorumDenominator",
          "type": "uint256"
        }
      ],
      "name": "GovernorInvalidQuorumFraction",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "GovernorInvalidSignature",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GovernorInvalidVoteParams",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GovernorInvalidVoteType",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "votingPeriod",
          "type": "uint256"
        }
      ],
      "name": "GovernorInvalidVotingPeriod",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "GovernorNonexistentProposal",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "GovernorNotQueuedProposal",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "GovernorOnlyExecutor",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "GovernorOnlyProposer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GovernorQueueNotImplemented",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "proposer",
          "type": "address"
        }
      ],
      "name": "GovernorRestrictedProposer",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "internalType": "enum IGovernor.ProposalState",
          "name": "current",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "expectedStates",
          "type": "bytes32"
        }
      ],
      "name": "GovernorUnexpectedProposalState",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "currentNonce",
          "type": "uint256"
        }
      ],
      "name": "InvalidAccountNonce",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidShortString",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "bits",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "SafeCastOverflowedUintDowncast",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "str",
          "type": "string"
        }
      ],
      "name": "StringTooLong",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "EIP712DomainChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "ProposalCanceled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "proposer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address[]",
          "name": "targets",
          "type": "address[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "string[]",
          "name": "signatures",
          "type": "string[]"
        },
        {
          "indexed": false,
          "internalType": "bytes[]",
          "name": "calldatas",
          "type": "bytes[]"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "voteStart",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "voteEnd",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "description",
          "type": "string"
        }
      ],
      "name": "ProposalCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "ProposalExecuted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "etaSeconds",
          "type": "uint256"
        }
      ],
      "name": "ProposalQueued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldProposalThreshold",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newProposalThreshold",
          "type": "uint256"
        }
      ],
      "name": "ProposalThresholdSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldQuorumNumerator",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newQuorumNumerator",
          "type": "uint256"
        }
      ],
      "name": "QuorumNumeratorUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldTimelock",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newTimelock",
          "type": "address"
        }
      ],
      "name": "TimelockChange",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "support",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "weight",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "VoteCast",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "support",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "weight",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reason",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "params",
          "type": "bytes"
        }
      ],
      "name": "VoteCastWithParams",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldVotingDelay",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newVotingDelay",
          "type": "uint256"
        }
      ],
      "name": "VotingDelaySet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldVotingPeriod",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newVotingPeriod",
          "type": "uint256"
        }
      ],
      "name": "VotingPeriodSet",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "BALLOT_TYPEHASH",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "CLOCK_MODE",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "COUNTING_MODE",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "EXTENDED_BALLOT_TYPEHASH",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "targets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes[]",
          "name": "calldatas",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes32",
          "name": "descriptionHash",
          "type": "bytes32"
        }
      ],
      "name": "cancel",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "support",
          "type": "uint8"
        }
      ],
      "name": "castVote",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "support",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "signature",
          "type": "bytes"
        }
      ],
      "name": "castVoteBySig",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "support",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "castVoteWithReason",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "support",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "params",
          "type": "bytes"
        }
      ],
      "name": "castVoteWithReasonAndParams",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "support",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "params",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "signature",
          "type": "bytes"
        }
      ],
      "name": "castVoteWithReasonAndParamsBySig",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "clock",
      "outputs": [
        {
          "internalType": "uint48",
          "name": "",
          "type": "uint48"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "eip712Domain",
      "outputs": [
        {
          "internalType": "bytes1",
          "name": "fields",
          "type": "bytes1"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "version",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "verifyingContract",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        },
        {
          "internalType": "uint256[]",
          "name": "extensions",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "targets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes[]",
          "name": "calldatas",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes32",
          "name": "descriptionHash",
          "type": "bytes32"
        }
      ],
      "name": "execute",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "timepoint",
          "type": "uint256"
        }
      ],
      "name": "getVotes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "timepoint",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "params",
          "type": "bytes"
        }
      ],
      "name": "getVotesWithParams",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasVoted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "targets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes[]",
          "name": "calldatas",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes32",
          "name": "descriptionHash",
          "type": "bytes32"
        }
      ],
      "name": "hashProposal",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "nonces",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC1155BatchReceived",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC1155Received",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC721Received",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "proposalDeadline",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "proposalEta",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "proposalNeedsQueuing",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "proposalProposer",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "proposalSnapshot",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "proposalThreshold",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "proposalVotes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "againstVotes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "forVotes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "abstainVotes",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "targets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes[]",
          "name": "calldatas",
          "type": "bytes[]"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        }
      ],
      "name": "propose",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "targets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes[]",
          "name": "calldatas",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes32",
          "name": "descriptionHash",
          "type": "bytes32"
        }
      ],
      "name": "queue",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "blockNumber",
          "type": "uint256"
        }
      ],
      "name": "quorum",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "quorumDenominator",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "timepoint",
          "type": "uint256"
        }
      ],
      "name": "quorumNumerator",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "quorumNumerator",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "quorumReached",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "relay",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newProposalThreshold",
          "type": "uint256"
        }
      ],
      "name": "setProposalThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint48",
          "name": "newVotingDelay",
          "type": "uint48"
        }
      ],
      "name": "setVotingDelay",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "newVotingPeriod",
          "type": "uint32"
        }
      ],
      "name": "setVotingPeriod",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "state",
      "outputs": [
        {
          "internalType": "enum IGovernor.ProposalState",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "timelock",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "descriptionHash",
          "type": "bytes32"
        }
      ],
      "name": "timelockSalt",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "token",
      "outputs": [
        {
          "internalType": "contract IERC5805",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newQuorumNumerator",
          "type": "uint256"
        }
      ],
      "name": "updateQuorumNumerator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract TimelockController",
          "name": "newTimelock",
          "type": "address"
        }
      ],
      "name": "updateTimelock",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "version",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "voteSucceeded",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votingDelay",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votingPeriod",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ],
  "bytecode": "0x6101806040523480156200001257600080fd5b5060405162004f5738038062004f57833981016040819052620000359162000799565b8481878686866040518060400160405280600b81526020016a27ad1023b7bb32b93737b960a91b81525080620000706200018b60201b60201c565b6200007d826000620001a6565b610120526200008e816001620001a6565b61014052815160208084019190912060e052815190820120610100524660a0526200011c60e05161010051604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201529081019290925260608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b60805250503060c0526003620001338282620008be565b5062000141905083620001df565b6200014c8262000245565b6200015781620002ec565b5050506001600160a01b03166101605262000172816200032d565b506200017e81620003cd565b5050505050505062000a3f565b6040805180820190915260018152603160f81b602082015290565b6000602083511015620001c657620001be8362000436565b9050620001d9565b81620001d38482620008be565b5060ff90505b92915050565b6008546040805165ffffffffffff928316815291831660208301527fc565b045403dc03c2eea82b81a0465edad9e2e7fc4d97e11421c209da93d7a93910160405180910390a16008805465ffffffffffff191665ffffffffffff92909216919091179055565b8063ffffffff16600003620002755760405163f1cfbf0560e01b8152600060048201526024015b60405180910390fd5b6008546040805163ffffffff66010000000000009093048316815291831660208301527f7e3f7f0708a84de9203036abaa450dccc85ad5ff52f78c170f3edb55cf5e8828910160405180910390a16008805463ffffffff90921666010000000000000263ffffffff60301b19909216919091179055565b60075460408051918252602082018390527fccb45da8d5717e6c4544694297c4ba5cf151d455c9bb0ed4fc7a38411bc05461910160405180910390a1600755565b6064808211156200035c5760405163243e544560e01b815260048101839052602481018290526044016200026c565b60006200036862000479565b90506200038d6200037862000495565b620003838562000517565b600a919062000551565b505060408051828152602081018590527f0553476bf02ef2726e8ce5ced78d63e26e602e4a2257b1f559418e24b4633997910160405180910390a1505050565b600b54604080516001600160a01b03928316815291831660208301527f08f74ea46ef7894f65eabfb5e6e695de773a000b47c529ab559178069b226401910160405180910390a1600b80546001600160a01b0319166001600160a01b0392909216919091179055565b600080829050601f8151111562000464578260405163305a27a960e01b81526004016200026c91906200098a565b80516200047182620009da565b179392505050565b600062000487600a6200056e565b6001600160d01b0316905090565b6000620004a26101605190565b6001600160a01b03166391ddadf46040518163ffffffff1660e01b8152600401602060405180830381865afa925050508015620004fe575060408051601f3d908101601f19168201909252620004fb91810190620009ff565b60015b62000512576200050d620005be565b905090565b919050565b60006001600160d01b038211156200054d576040516306dfcc6560e41b815260d06004820152602481018390526044016200026c565b5090565b60008062000561858585620005cb565b915091505b935093915050565b80546000908015620005b4576200059a836200058c60018462000a1d565b600091825260209091200190565b54660100000000000090046001600160d01b0316620005b7565b60005b9392505050565b60006200050d4362000734565b825460009081908015620006d5576000620005ed876200058c60018562000a1d565b805490915065ffffffffffff80821691660100000000000090046001600160d01b03169088168211156200063457604051632520601d60e01b815260040160405180910390fd5b8765ffffffffffff168265ffffffffffff16036200067257825465ffffffffffff1666010000000000006001600160d01b03891602178355620006c6565b6040805180820190915265ffffffffffff808a1682526001600160d01b03808a1660208085019182528d54600181018f5560008f815291909120945191519092166601000000000000029216919091179101555b94508593506200056692505050565b50506040805180820190915265ffffffffffff80851682526001600160d01b0380851660208085019182528854600181018a5560008a815291822095519251909316660100000000000002919093161792019190915590508162000566565b600065ffffffffffff8211156200054d576040516306dfcc6560e41b815260306004820152602481018390526044016200026c565b6001600160a01b03811681146200077f57600080fd5b50565b805165ffffffffffff811681146200051257600080fd5b60008060008060008060c08789031215620007b357600080fd5b8651620007c08162000769565b6020880151909650620007d38162000769565b9450620007e36040880162000782565b9350606087015163ffffffff81168114620007fd57600080fd5b809350506080870151915060a087015190509295509295509295565b634e487b7160e01b600052604160045260246000fd5b600181811c908216806200084457607f821691505b6020821081036200086557634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620008b957600081815260208120601f850160051c81016020861015620008945750805b601f850160051c820191505b81811015620008b557828155600101620008a0565b5050505b505050565b81516001600160401b03811115620008da57620008da62000819565b620008f281620008eb84546200082f565b846200086b565b602080601f8311600181146200092a5760008415620009115750858301515b600019600386901b1c1916600185901b178555620008b5565b600085815260208120601f198616915b828110156200095b578886015182559484019460019091019084016200093a565b50858210156200097a5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b600060208083528351808285015260005b81811015620009b9578581018301518582016040015282016200099b565b506000604082860101526040601f19601f8301168501019250505092915050565b80516020808301519190811015620008655760001960209190910360031b1b16919050565b60006020828403121562000a1257600080fd5b620005b78262000782565b81810381811115620001d957634e487b7160e01b600052601160045260246000fd5b60805160a05160c05160e0516101005161012051610140516101605161448f62000ac860003960008181610a9c01528181610f0e0152818161148101528181611562015281816121df0152612470015260006121aa0152600061217d01526000612aa901526000612a81015260006129dc01526000612a0601526000612a30015261448f6000f3fe6080604052600436106102e85760003560e01c80637ecebe0011610190578063c01f9e37116100dc578063deaaa7cc11610095578063ece40cc11161006f578063ece40cc114610a2d578063f23a6e6114610a4d578063f8ce560a14610a6d578063fc0c546a14610a8d57600080fd5b8063deaaa7cc146109b9578063e540d01d146109ed578063eb9019d414610a0d57600080fd5b8063c01f9e37146108e2578063c28bc2fa14610902578063c59057e414610915578063d33219b414610935578063d4a8dd9814610953578063dd4e2ba51461097357600080fd5b80639a802a6d11610149578063a9a9529411610123578063a9a9529414610855578063ab58fb8e14610875578063b58131b0146108ad578063bc197c81146108c257600080fd5b80639a802a6d14610800578063a7713a7014610820578063a890c9101461083557600080fd5b80637ecebe001461072257806384b0196e146107585780638d73b031146107805780638ff262e3146107a057806391ddadf4146107c057806397c3d334146107ec57600080fd5b8063438596321161024f5780635b8d0e0d1161020857806360c4247f116101e257806360c4247f146106a257806379051887146106c25780637b3c71d3146106e25780637d5e81e21461070257600080fd5b80635b8d0e0d146106355780635c573d44146106555780635f398a141461068257600080fd5b80634385963214610517578063452115d6146105615780634bf5d7e914610581578063544ffc9c1461059657806354fd4d50146105eb578063567813881461061557600080fd5b8063160cbed7116102a1578063160cbed71461044e5780632656227d1461046e5780632d63f693146104815780632fe3e261146104a15780633932abb1146104d55780633e4f49e6146104ea57600080fd5b806301ffc9a71461032457806302a251a31461035957806306f3f9e61461038557806306fdde03146103a5578063143489d0146103c7578063150b7a021461041557600080fd5b3661031f57306102f6610ac0565b6001600160a01b03161461031d57604051637485328f60e11b815260040160405180910390fd5b005b600080fd5b34801561033057600080fd5b5061034461033f3660046133cd565b610ad9565b60405190151581526020015b60405180910390f35b34801561036557600080fd5b50600854600160301b900463ffffffff165b604051908152602001610350565b34801561039157600080fd5b5061031d6103a03660046133f7565b610b2b565b3480156103b157600080fd5b506103ba610b3f565b6040516103509190613460565b3480156103d357600080fd5b506103fd6103e23660046133f7565b6000908152600460205260409020546001600160a01b031690565b6040516001600160a01b039091168152602001610350565b34801561042157600080fd5b50610435610430366004613553565b610bd1565b6040516001600160e01b03199091168152602001610350565b34801561045a57600080fd5b5061037761046936600461372a565b610c14565b61037761047c36600461372a565b610ce3565b34801561048d57600080fd5b5061037761049c3660046133f7565b610e57565b3480156104ad57600080fd5b506103777f3e83946653575f9a39005e1545185629e92736b7528ab20ca3816f315424a81181565b3480156104e157600080fd5b50610377610e78565b3480156104f657600080fd5b5061050a6105053660046133f7565b610e8b565b60405161035091906137f1565b34801561052357600080fd5b506103446105323660046137ff565b60008281526009602090815260408083206001600160a01b038516845260030190915290205460ff1692915050565b34801561056d57600080fd5b5061037761057c36600461372a565b610e96565b34801561058d57600080fd5b506103ba610f0a565b3480156105a257600080fd5b506105d06105b13660046133f7565b6000908152600960205260409020805460018201546002909201549092565b60408051938452602084019290925290820152606001610350565b3480156105f757600080fd5b506040805180820190915260018152603160f81b60208201526103ba565b34801561062157600080fd5b50610377610630366004613840565b610fcc565b34801561064157600080fd5b506103776106503660046138b4565b610ff5565b34801561066157600080fd5b506103776106703660046133f7565b6001600160601b03193060601b161890565b34801561068e57600080fd5b5061037761069d36600461396e565b611154565b3480156106ae57600080fd5b506103776106bd3660046133f7565b6111a9565b3480156106ce57600080fd5b5061031d6106dd366004613a05565b611237565b3480156106ee57600080fd5b506103776106fd366004613a22565b611248565b34801561070e57600080fd5b5061037761071d366004613a7b565b611290565b34801561072e57600080fd5b5061037761073d366004613b2f565b6001600160a01b031660009081526002602052604090205490565b34801561076457600080fd5b5061076d611349565b6040516103509796959493929190613b87565b34801561078c57600080fd5b5061034461079b3660046133f7565b61138f565b3480156107ac57600080fd5b506103776107bb366004613bf7565b6113ab565b3480156107cc57600080fd5b506107d561147d565b60405165ffffffffffff9091168152602001610350565b3480156107f857600080fd5b506064610377565b34801561080c57600080fd5b5061037761081b366004613c48565b611505565b34801561082c57600080fd5b5061037761151c565b34801561084157600080fd5b5061031d610850366004613b2f565b611536565b34801561086157600080fd5b506103446108703660046133f7565b611547565b34801561088157600080fd5b506103776108903660046133f7565b60009081526004602052604090206001015465ffffffffffff1690565b3480156108b957600080fd5b50610377611550565b3480156108ce57600080fd5b506104356108dd366004613ca0565b611642565b3480156108ee57600080fd5b506103776108fd3660046133f7565b611686565b61031d610910366004613d33565b6116c9565b34801561092157600080fd5b5061037761093036600461372a565b611749565b34801561094157600080fd5b50600b546001600160a01b03166103fd565b34801561095f57600080fd5b5061034461096e3660046133f7565b611783565b34801561097f57600080fd5b506040805180820190915260208082527f737570706f72743d627261766f2671756f72756d3d666f722c6162737461696e908201526103ba565b3480156109c557600080fd5b506103777ff2aad550cf55f045cb27e9c559f9889fdfb6e6cdaa032301d6ea397784ae51d781565b3480156109f957600080fd5b5061031d610a08366004613d76565b61178e565b348015610a1957600080fd5b50610377610a28366004613d9c565b61179f565b348015610a3957600080fd5b5061031d610a483660046133f7565b6117c0565b348015610a5957600080fd5b50610435610a68366004613dc8565b6117d1565b348015610a7957600080fd5b50610377610a883660046133f7565b611815565b348015610a9957600080fd5b507f00000000000000000000000000000000000000000000000000000000000000006103fd565b6000610ad4600b546001600160a01b031690565b905090565b60006001600160e01b031982166332a2ad4360e11b1480610b0a57506001600160e01b03198216630271189760e51b145b80610b2557506301ffc9a760e01b6001600160e01b03198316145b92915050565b610b33611820565b610b3c8161189a565b50565b606060038054610b4e90613e30565b80601f0160208091040260200160405190810160405280929190818152602001828054610b7a90613e30565b8015610bc75780601f10610b9c57610100808354040283529160200191610bc7565b820191906000526020600020905b815481529060010190602001808311610baa57829003601f168201915b5050505050905090565b600030610bdc610ac0565b6001600160a01b031614610c0357604051637485328f60e11b815260040160405180910390fd5b50630a85bd0160e11b949350505050565b600080610c2386868686611749565b9050610c3881610c336004611930565b611953565b506000610c488288888888611992565b905065ffffffffffff811615610cc057600082815260046020908152604091829020600101805465ffffffffffff191665ffffffffffff85169081179091558251858152918201527f9a2e42fd6722813d69113e7d0079d3d940171428df7373df9c7f7617cfda2892910160405180910390a1610cd9565b604051634844252360e11b815260040160405180910390fd5b5095945050505050565b600080610cf286868686611749565b9050610d1281610d026005611930565b610d0c6004611930565b17611953565b506000818152600460205260409020805460ff60f01b1916600160f01b17905530610d3b610ac0565b6001600160a01b031614610dcd5760005b8651811015610dcb57306001600160a01b0316878281518110610d7157610d71613e6a565b60200260200101516001600160a01b031603610dbb57610dbb858281518110610d9c57610d9c613e6a565b60200260200101518051906020012060056119a190919063ffffffff16565b610dc481613e96565b9050610d4c565b505b610dda8187878787611a03565b30610de3610ac0565b6001600160a01b031614158015610e0f57506005546001600160801b03808216600160801b9092041614155b15610e1a5760006005555b6040518181527f712ae1383f79ac853f8d882153778e0260ef8f03b504e2866e0593e04d2b291f906020015b60405180910390a195945050505050565b600090815260046020526040902054600160a01b900465ffffffffffff1690565b6000610ad460085465ffffffffffff1690565b6000610b2582611a17565b600080610ea586868686611749565b9050610eb581610c336000611930565b506000818152600460205260409020546001600160a01b03163314610ef45760405163233d98e360e01b81523360048201526024015b60405180910390fd5b610f0086868686611b56565b9695505050505050565b60607f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316634bf5d7e96040518163ffffffff1660e01b8152600401600060405180830381865afa925050508015610f8b57506040513d6000823e601f3d908101601f19168201604052610f889190810190613eaf565b60015b610fc7575060408051808201909152601d81527f6d6f64653d626c6f636b6e756d6265722666726f6d3d64656661756c74000000602082015290565b919050565b600080339050610fed84828560405180602001604052806000815250611b6d565b949350505050565b6000806110d8876110d27f3e83946653575f9a39005e1545185629e92736b7528ab20ca3816f315424a8118c8c8c61104a8e6001600160a01b0316600090815260026020526040902080546001810190915590565b8d8d60405161105a929190613f1c565b60405180910390208c805190602001206040516020016110b79796959493929190968752602087019590955260ff9390931660408601526001600160a01b03919091166060850152608084015260a083015260c082015260e00190565b60405160208183030381529060405280519060200120611b90565b85611bbd565b905080611103576040516394ab6c0760e01b81526001600160a01b0388166004820152602401610eeb565b61114789888a89898080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152508b9250611c31915050565b9998505050505050505050565b60008033905061119e87828888888080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152508a9250611c31915050565b979650505050505050565b600a805460009182906111bd600184613f2c565b815481106111cd576111cd613e6a565b6000918252602090912001805490915065ffffffffffff811690600160301b90046001600160d01b0316858211611210576001600160d01b031695945050505050565b61122461121c87611d13565b600a90611d4a565b6001600160d01b03169695505050505050565b61123f611820565b610b3c81611dff565b600080339050610f0086828787878080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250611b6d92505050565b60003361129d8184611e65565b6112c55760405163d9b3955760e01b81526001600160a01b0382166004820152602401610eeb565b60006112cf611550565b9050801561133c5760006112fe8360016112e761147d565b6112f19190613f3f565b65ffffffffffff1661179f565b90508181101561133a57604051636121770b60e11b81526001600160a01b03841660048201526024810182905260448101839052606401610eeb565b505b61119e8787878786611f56565b60006060806000806000606061135d612176565b6113656121a3565b60408051600080825260208201909252600f60f81b9b939a50919850469750309650945092509050565b6000818152600960205260408120805460019091015411610b25565b600080611437846110d27ff2aad550cf55f045cb27e9c559f9889fdfb6e6cdaa032301d6ea397784ae51d78989896114008b6001600160a01b0316600090815260026020526040902080546001810190915590565b60408051602081019690965285019390935260ff90911660608401526001600160a01b0316608083015260a082015260c0016110b7565b905080611462576040516394ab6c0760e01b81526001600160a01b0385166004820152602401610eeb565b610f0086858760405180602001604052806000815250611b6d565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166391ddadf46040518163ffffffff1660e01b8152600401602060405180830381865afa9250505080156114f9575060408051601f3d908101601f191682019092526114f691810190613f65565b60015b610fc757610ad46121d0565b60006115128484846121db565b90505b9392505050565b6000611528600a612271565b6001600160d01b0316905090565b61153e611820565b610b3c816122aa565b60006001610b25565b60008061155c60075490565b905060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316638e539e8c600161159961147d565b6115a39190613f3f565b6040516001600160e01b031960e084901b16815265ffffffffffff9091166004820152602401602060405180830381865afa1580156115e6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061160a9190613f82565b9050670de0b6b3a764000061161f8284613f9b565b61163190670de0b6b3a763ffff613fb2565b61163b9190613fdb565b9250505090565b60003061164d610ac0565b6001600160a01b03161461167457604051637485328f60e11b815260040160405180910390fd5b5063bc197c8160e01b95945050505050565b6000818152600460205260408120546116bb90600160d01b810463ffffffff1690600160a01b900465ffffffffffff16613ffd565b65ffffffffffff1692915050565b6116d1611820565b600080856001600160a01b03168585856040516116ef929190613f1c565b60006040518083038185875af1925050503d806000811461172c576040519150601f19603f3d011682016040523d82523d6000602084013e611731565b606091505b50915091506117408282612313565b50505050505050565b60008484848460405160200161176294939291906140aa565b60408051601f19818403018152919052805160209091012095945050505050565b6000610b258261232f565b611796611820565b610b3c81612366565b600061151583836117bb60408051602081019091526000815290565b6121db565b6117c8611820565b610b3c81612404565b6000306117dc610ac0565b6001600160a01b03161461180357604051637485328f60e11b815260040160405180910390fd5b5063f23a6e6160e01b95945050505050565b6000610b2582612445565b33611829610ac0565b6001600160a01b031614611852576040516347096e4760e01b8152336004820152602401610eeb565b3061185b610ac0565b6001600160a01b031614611898576000803660405161187b929190613f1c565b604051809103902090505b8061189160056124ef565b0361188657505b565b6064808211156118c75760405163243e544560e01b81526004810183905260248101829052604401610eeb565b60006118d161151c565b90506118f06118de61147d565b6118e78561255e565b600a9190612592565b505060408051828152602081018590527f0553476bf02ef2726e8ce5ced78d63e26e602e4a2257b1f559418e24b4633997910160405180910390a1505050565b6000816007811115611944576119446137b9565b600160ff919091161b92915050565b60008061195f84610e8b565b905060008361196d83611930565b1603611515578381846040516331b75e4d60e01b8152600401610eeb939291906140f5565b6000610f0086868686866125ad565b81546001600160801b03600160801b8204811691811660018301909116036119cd576119cd6041612753565b6001600160801b03808216600090815260018086016020526040909120939093558354919092018216600160801b029116179055565b611a108585858585612765565b5050505050565b600080611a23836127f6565b90506005816007811115611a3957611a396137b9565b14611a445792915050565b6000838152600c60205260409081902054600b549151632c258a9f60e11b81526004810182905290916001600160a01b03169063584b153e90602401602060405180830381865afa158015611a9d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611ac19190614117565b15611ad0575060059392505050565b600b54604051632ab0f52960e01b8152600481018390526001600160a01b0390911690632ab0f52990602401602060405180830381865afa158015611b19573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b3d9190614117565b15611b4c575060079392505050565b5060029392505050565b6000611b6485858585612930565b95945050505050565b6000611b6485858585611b8b60408051602081019091526000815290565b611c31565b6000610b25611b9d6129cf565b8360405161190160f01b8152600281019290925260228201526042902090565b6000836001600160a01b03163b600003611c1f57600080611bde8585612afa565b5090925090506000816003811115611bf857611bf86137b9565b148015611c165750856001600160a01b0316826001600160a01b0316145b92505050611515565b611c2a848484612b47565b9050611515565b6000611c4186610c336001611930565b506000611c5786611c5189610e57565b856121db565b90506000611c688888888588612c22565b90508351600003611cbf57866001600160a01b03167fb8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda489888489604051611cb29493929190614139565b60405180910390a261119e565b866001600160a01b03167fe2babfbac5889a709b63bb7f598b324e08bc5a4fb9ec647fb3cbc9ec07eb87128988848989604051611d00959493929190614161565b60405180910390a2979650505050505050565b600065ffffffffffff821115611d46576040516306dfcc6560e41b81526030600482015260248101839052604401610eeb565b5090565b815460009081816005811115611da9576000611d6584612d25565b611d6f9085613f2c565b60008881526020902090915081015465ffffffffffff9081169087161015611d9957809150611da7565b611da4816001613fb2565b92505b505b6000611db787878585612e7e565b90508015611df257611ddc87611dce600184613f2c565b600091825260209091200190565b54600160301b90046001600160d01b031661119e565b6000979650505050505050565b6008546040805165ffffffffffff928316815291831660208301527fc565b045403dc03c2eea82b81a0465edad9e2e7fc4d97e11421c209da93d7a93910160405180910390a16008805465ffffffffffff191665ffffffffffff92909216919091179055565b80516000906034811015611e7d576001915050610b25565b82810160131901516001600160a01b031981166b046e0e4dee0dee6cae47a60f60a31b14611eb057600192505050610b25565b600080611ebe602885613f2c565b90505b83811015611f3557600080611ef5888481518110611ee157611ee1613e6a565b01602001516001600160f81b031916612ee0565b9150915081611f0d5760019650505050505050610b25565b8060ff166004856001600160a01b0316901b179350505080611f2e90613e96565b9050611ec1565b50856001600160a01b0316816001600160a01b031614935050505092915050565b6000611f6b8686868680519060200120611749565b905084518651141580611f8057508351865114155b80611f8a57508551155b15611fbf57855184518651604051630447b05d60e41b8152600481019390935260248301919091526044820152606401610eeb565b600081815260046020526040902054600160a01b900465ffffffffffff161561200a5780611fec82610e8b565b6040516331b75e4d60e01b8152610eeb9291906000906004016140f5565b6000612014610e78565b61201c61147d565b65ffffffffffff1661202e9190613fb2565b9050600061204960085463ffffffff600160301b9091041690565b600084815260046020526040902080546001600160a01b0319166001600160a01b03871617815590915061207c83611d13565b815465ffffffffffff91909116600160a01b0265ffffffffffff60a01b199091161781556120a982612f72565b815463ffffffff91909116600160d01b0263ffffffff60d01b1990911617815588517f7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e090859087908c908c906001600160401b0381111561210c5761210c613488565b60405190808252806020026020018201604052801561213f57816020015b606081526020019060019003908161212a5790505b508c8961214c8a82613fb2565b8e6040516121629998979695949392919061419b565b60405180910390a150505095945050505050565b6060610ad47f00000000000000000000000000000000000000000000000000000000000000006000612fa3565b6060610ad47f00000000000000000000000000000000000000000000000000000000000000006001612fa3565b6000610ad443611d13565b60007f0000000000000000000000000000000000000000000000000000000000000000604051630748d63560e31b81526001600160a01b038681166004830152602482018690529190911690633a46b1a890604401602060405180830381865afa15801561224d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115129190613f82565b805460009080156122a15761228b83611dce600184613f2c565b54600160301b90046001600160d01b0316611515565b60009392505050565b600b54604080516001600160a01b03928316815291831660208301527f08f74ea46ef7894f65eabfb5e6e695de773a000b47c529ab559178069b226401910160405180910390a1600b80546001600160a01b0319166001600160a01b0392909216919091179055565b606082612328576123238261304e565b610b25565b5080610b25565b6000818152600960205260408120600281015460018201546123519190613fb2565b61235d610a8885610e57565b11159392505050565b8063ffffffff166000036123905760405163f1cfbf0560e01b815260006004820152602401610eeb565b6008546040805163ffffffff600160301b9093048316815291831660208301527f7e3f7f0708a84de9203036abaa450dccc85ad5ff52f78c170f3edb55cf5e8828910160405180910390a16008805463ffffffff909216600160301b0269ffffffff00000000000019909216919091179055565b60075460408051918252602082018390527fccb45da8d5717e6c4544694297c4ba5cf151d455c9bb0ed4fc7a38411bc05461910160405180910390a1600755565b60006064612452836111a9565b604051632394e7a360e21b8152600481018590526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690638e539e8c90602401602060405180830381865afa1580156124b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906124db9190613f82565b6124e59190613f9b565b610b259190613fdb565b80546000906001600160801b0380821691600160801b9004168103612518576125186031612753565b6001600160801b038181166000908152600185810160205260408220805492905585546fffffffffffffffffffffffffffffffff19169301909116919091179092555090565b60006001600160d01b03821115611d46576040516306dfcc6560e41b815260d0600482015260248101839052604401610eeb565b6000806125a0858585613077565b915091505b935093915050565b600080600b60009054906101000a90046001600160a01b03166001600160a01b031663f27a0c926040518163ffffffff1660e01b8152600401602060405180830381865afa158015612603573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906126279190613f82565b905060003060601b6001600160601b0319168418600b5460405163b1c5f42760e01b81529192506001600160a01b03169063b1c5f42790612675908a908a908a906000908890600401614272565b602060405180830381865afa158015612692573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906126b69190613f82565b6000898152600c602052604080822092909255600b5491516308f2a0bb60e41b81526001600160a01b0390921691638f2a0bb091612701918b918b918b919088908a906004016142c0565b600060405180830381600087803b15801561271b57600080fd5b505af115801561272f573d6000803e3d6000fd5b5050505061274782426127429190613fb2565b611d13565b98975050505050505050565b634e487b71600052806020526024601cfd5b600b546001600160a01b031663e38335e53486868660003060601b6001600160601b03191688186040518763ffffffff1660e01b81526004016127ac959493929190614272565b6000604051808303818588803b1580156127c557600080fd5b505af11580156127d9573d6000803e3d6000fd5b50505060009687525050600c602052505060408320929092555050565b6000818152600460205260408120805460ff600160f01b8204811691600160f81b900416811561282b57506007949350505050565b801561283c57506002949350505050565b600061284786610e57565b90508060000361286d57604051636ad0607560e01b815260048101879052602401610eeb565b600061287761147d565b65ffffffffffff169050808210612895575060009695505050505050565b60006128a088611686565b90508181106128b757506001979650505050505050565b6128c08861232f565b15806128e057506000888152600960205260409020805460019091015411155b156128f357506003979650505050505050565b60008881526004602052604090206001015465ffffffffffff1660000361292257506004979650505050505050565b506005979650505050505050565b60008061293f868686866131cb565b6000818152600c60205260409020549091508015610cd957600b5460405163c4d252f560e01b8152600481018390526001600160a01b039091169063c4d252f590602401600060405180830381600087803b15801561299d57600080fd5b505af11580156129b1573d6000803e3d6000fd5b5050506000838152600c602052604081205550509050949350505050565b6000306001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016148015612a2857507f000000000000000000000000000000000000000000000000000000000000000046145b15612a5257507f000000000000000000000000000000000000000000000000000000000000000090565b610ad4604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b60008060008351604103612b345760208401516040850151606086015160001a612b268882858561327c565b955095509550505050612b40565b50508151600091506002905b9250925092565b6000806000856001600160a01b03168585604051602401612b69929190614318565b60408051601f198184030181529181526020820180516001600160e01b0316630b135d3f60e11b17905251612b9e9190614331565b600060405180830381855afa9150503d8060008114612bd9576040519150601f19603f3d011682016040523d82523d6000602084013e612bde565b606091505b5091509150818015612bf257506020815110155b8015610f0057508051630b135d3f60e11b90612c179083016020908101908401613f82565b149695505050505050565b60008581526009602090815260408083206001600160a01b03881684526003810190925282205460ff1615612c75576040516371c6af4960e01b81526001600160a01b0387166004820152602401610eeb565b6001600160a01b03861660009081526003820160205260409020805460ff1916600117905560ff8516612cc15783816000016000828254612cb69190613fb2565b90915550612d1a9050565b60001960ff861601612ce15783816001016000828254612cb69190613fb2565b60011960ff861601612d015783816002016000828254612cb69190613fb2565b6040516303599be160e11b815260040160405180910390fd5b509195945050505050565b600060018211612d33575090565b816001600160801b8210612d4c5760809190911c9060401b5b680100000000000000008210612d675760409190911c9060201b5b6401000000008210612d7e5760209190911c9060101b5b620100008210612d935760109190911c9060081b5b6101008210612da75760089190911c9060041b5b60108210612dba5760049190911c9060021b5b60048210612dc65760011b5b600302600190811c90818581612dde57612dde613fc5565b048201901c90506001818581612df657612df6613fc5565b048201901c90506001818581612e0e57612e0e613fc5565b048201901c90506001818581612e2657612e26613fc5565b048201901c90506001818581612e3e57612e3e613fc5565b048201901c90506001818581612e5657612e56613fc5565b048201901c9050612e75818581612e6f57612e6f613fc5565b04821190565b90039392505050565b60005b81831015612ed8576000612e95848461334b565b60008781526020902090915065ffffffffffff86169082015465ffffffffffff161115612ec457809250612ed2565b612ecf816001613fb2565b93505b50612e81565b509392505050565b60008060f883901c602f81118015612efb5750603a8160ff16105b15612f1057600194602f199091019350915050565b8060ff166040108015612f26575060478160ff16105b15612f3b576001946036199091019350915050565b8060ff166060108015612f51575060678160ff16105b15612f66576001946056199091019350915050565b50600093849350915050565b600063ffffffff821115611d46576040516306dfcc6560e41b81526020600482015260248101839052604401610eeb565b606060ff8314612fbd57612fb683613366565b9050610b25565b818054612fc990613e30565b80601f0160208091040260200160405190810160405280929190818152602001828054612ff590613e30565b80156130425780601f1061301757610100808354040283529160200191613042565b820191906000526020600020905b81548152906001019060200180831161302557829003601f168201915b50505050509050610b25565b80511561305e5780518082602001fd5b60405163d6bda27560e01b815260040160405180910390fd5b82546000908190801561317057600061309587611dce600185613f2c565b805490915065ffffffffffff80821691600160301b90046001600160d01b03169088168211156130d857604051632520601d60e01b815260040160405180910390fd5b8765ffffffffffff168265ffffffffffff160361311157825465ffffffffffff16600160301b6001600160d01b03891602178355613162565b6040805180820190915265ffffffffffff808a1682526001600160d01b03808a1660208085019182528d54600181018f5560008f81529190912094519151909216600160301b029216919091179101555b94508593506125a592505050565b50506040805180820190915265ffffffffffff80851682526001600160d01b0380851660208085019182528854600181018a5560008a815291822095519251909316600160301b0291909316179201919091559050816125a5565b6000806131da86868686611749565b9050613228816131ea6007611930565b6131f46006611930565b6131fe6002611930565b600161320b60078261434d565b61321690600261444a565b6132209190613f2c565b181818611953565b506000818152600460205260409081902080546001600160f81b0316600160f81b179055517f789cf55be980739dad1d0699b93b58e806b51c9d96619bfa8fe0a28abaa7b30c90610e469083815260200190565b600080807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08411156132b75750600091506003905082613341565b604080516000808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa15801561330b573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b03811661333757506000925060019150829050613341565b9250600091508190505b9450945094915050565b600061335a6002848418613fdb565b61151590848416613fb2565b60606000613373836133a5565b604080516020808252818301909252919250600091906020820181803683375050509182525060208101929092525090565b600060ff8216601f811115610b2557604051632cd44ac360e21b815260040160405180910390fd5b6000602082840312156133df57600080fd5b81356001600160e01b03198116811461151557600080fd5b60006020828403121561340957600080fd5b5035919050565b60005b8381101561342b578181015183820152602001613413565b50506000910152565b6000815180845261344c816020860160208601613410565b601f01601f19169290920160200192915050565b6020815260006115156020830184613434565b6001600160a01b0381168114610b3c57600080fd5b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b03811182821017156134c6576134c6613488565b604052919050565b60006001600160401b038211156134e7576134e7613488565b50601f01601f191660200190565b6000613508613503846134ce565b61349e565b905082815283838301111561351c57600080fd5b828260208301376000602084830101529392505050565b600082601f83011261354457600080fd5b611515838335602085016134f5565b6000806000806080858703121561356957600080fd5b843561357481613473565b9350602085013561358481613473565b92506040850135915060608501356001600160401b038111156135a657600080fd5b6135b287828801613533565b91505092959194509250565b60006001600160401b038211156135d7576135d7613488565b5060051b60200190565b600082601f8301126135f257600080fd5b81356020613602613503836135be565b82815260059290921b8401810191818101908684111561362157600080fd5b8286015b8481101561364557803561363881613473565b8352918301918301613625565b509695505050505050565b600082601f83011261366157600080fd5b81356020613671613503836135be565b82815260059290921b8401810191818101908684111561369057600080fd5b8286015b848110156136455780358352918301918301613694565b600082601f8301126136bc57600080fd5b813560206136cc613503836135be565b82815260059290921b840181019181810190868411156136eb57600080fd5b8286015b848110156136455780356001600160401b0381111561370e5760008081fd5b61371c8986838b0101613533565b8452509183019183016136ef565b6000806000806080858703121561374057600080fd5b84356001600160401b038082111561375757600080fd5b613763888389016135e1565b9550602087013591508082111561377957600080fd5b61378588838901613650565b9450604087013591508082111561379b57600080fd5b506137a8878288016136ab565b949793965093946060013593505050565b634e487b7160e01b600052602160045260246000fd5b600881106137ed57634e487b7160e01b600052602160045260246000fd5b9052565b60208101610b2582846137cf565b6000806040838503121561381257600080fd5b82359150602083013561382481613473565b809150509250929050565b803560ff81168114610fc757600080fd5b6000806040838503121561385357600080fd5b823591506138636020840161382f565b90509250929050565b60008083601f84011261387e57600080fd5b5081356001600160401b0381111561389557600080fd5b6020830191508360208285010111156138ad57600080fd5b9250929050565b600080600080600080600060c0888a0312156138cf57600080fd5b873596506138df6020890161382f565b955060408801356138ef81613473565b945060608801356001600160401b038082111561390b57600080fd5b6139178b838c0161386c565b909650945060808a013591508082111561393057600080fd5b61393c8b838c01613533565b935060a08a013591508082111561395257600080fd5b5061395f8a828b01613533565b91505092959891949750929550565b60008060008060006080868803121561398657600080fd5b853594506139966020870161382f565b935060408601356001600160401b03808211156139b257600080fd5b6139be89838a0161386c565b909550935060608801359150808211156139d757600080fd5b506139e488828901613533565b9150509295509295909350565b65ffffffffffff81168114610b3c57600080fd5b600060208284031215613a1757600080fd5b8135611515816139f1565b60008060008060608587031215613a3857600080fd5b84359350613a486020860161382f565b925060408501356001600160401b03811115613a6357600080fd5b613a6f8782880161386c565b95989497509550505050565b60008060008060808587031215613a9157600080fd5b84356001600160401b0380821115613aa857600080fd5b613ab4888389016135e1565b95506020870135915080821115613aca57600080fd5b613ad688838901613650565b94506040870135915080821115613aec57600080fd5b613af8888389016136ab565b93506060870135915080821115613b0e57600080fd5b508501601f81018713613b2057600080fd5b6135b2878235602084016134f5565b600060208284031215613b4157600080fd5b813561151581613473565b600081518084526020808501945080840160005b83811015613b7c57815187529582019590820190600101613b60565b509495945050505050565b60ff60f81b8816815260e060208201526000613ba660e0830189613434565b8281036040840152613bb88189613434565b606084018890526001600160a01b038716608085015260a0840186905283810360c08501529050613be98185613b4c565b9a9950505050505050505050565b60008060008060808587031215613c0d57600080fd5b84359350613c1d6020860161382f565b92506040850135613c2d81613473565b915060608501356001600160401b038111156135a657600080fd5b600080600060608486031215613c5d57600080fd5b8335613c6881613473565b92506020840135915060408401356001600160401b03811115613c8a57600080fd5b613c9686828701613533565b9150509250925092565b600080600080600060a08688031215613cb857600080fd5b8535613cc381613473565b94506020860135613cd381613473565b935060408601356001600160401b0380821115613cef57600080fd5b613cfb89838a01613650565b94506060880135915080821115613d1157600080fd5b613d1d89838a01613650565b935060808801359150808211156139d757600080fd5b60008060008060608587031215613d4957600080fd5b8435613d5481613473565b93506020850135925060408501356001600160401b03811115613a6357600080fd5b600060208284031215613d8857600080fd5b813563ffffffff8116811461151557600080fd5b60008060408385031215613daf57600080fd5b8235613dba81613473565b946020939093013593505050565b600080600080600060a08688031215613de057600080fd5b8535613deb81613473565b94506020860135613dfb81613473565b9350604086013592506060860135915060808601356001600160401b03811115613e2457600080fd5b6139e488828901613533565b600181811c90821680613e4457607f821691505b602082108103613e6457634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060018201613ea857613ea8613e80565b5060010190565b600060208284031215613ec157600080fd5b81516001600160401b03811115613ed757600080fd5b8201601f81018413613ee857600080fd5b8051613ef6613503826134ce565b818152856020838501011115613f0b57600080fd5b611b64826020830160208601613410565b8183823760009101908152919050565b81810381811115610b2557610b25613e80565b65ffffffffffff828116828216039080821115613f5e57613f5e613e80565b5092915050565b600060208284031215613f7757600080fd5b8151611515816139f1565b600060208284031215613f9457600080fd5b5051919050565b8082028115828204841417610b2557610b25613e80565b80820180821115610b2557610b25613e80565b634e487b7160e01b600052601260045260246000fd5b600082613ff857634e487b7160e01b600052601260045260246000fd5b500490565b65ffffffffffff818116838216019080821115613f5e57613f5e613e80565b600081518084526020808501945080840160005b83811015613b7c5781516001600160a01b031687529582019590820190600101614030565b600081518084526020808501808196508360051b8101915082860160005b8581101561409d57828403895261408b848351613434565b98850198935090840190600101614073565b5091979650505050505050565b6080815260006140bd608083018761401c565b82810360208401526140cf8187613b4c565b905082810360408401526140e38186614055565b91505082606083015295945050505050565b8381526060810161410960208301856137cf565b826040830152949350505050565b60006020828403121561412957600080fd5b8151801515811461151557600080fd5b84815260ff84166020820152826040820152608060608201526000610f006080830184613434565b85815260ff8516602082015283604082015260a06060820152600061418960a0830185613434565b82810360808401526127478185613434565b60006101208b8352602060018060a01b038c16818501528160408501526141c48285018c61401c565b915083820360608501526141d8828b613b4c565b915083820360808501528189518084528284019150828160051b850101838c0160005b8381101561422957601f19878403018552614217838351613434565b948601949250908501906001016141fb565b505086810360a088015261423d818c614055565b9450505050508560c08401528460e08401528281036101008401526142628185613434565b9c9b505050505050505050505050565b60a08152600061428560a083018861401c565b82810360208401526142978188613b4c565b905082810360408401526142ab8187614055565b60608401959095525050608001529392505050565b60c0815260006142d360c083018961401c565b82810360208401526142e58189613b4c565b905082810360408401526142f98188614055565b60608401969096525050608081019290925260a0909101529392505050565b8281526040602082015260006115126040830184613434565b60008251614343818460208701613410565b9190910192915050565b60ff8181168382160190811115610b2557610b25613e80565b600181815b808511156143a157816000190482111561438757614387613e80565b8085161561439457918102915b93841c939080029061436b565b509250929050565b6000826143b857506001610b25565b816143c557506000610b25565b81600181146143db57600281146143e557614401565b6001915050610b25565b60ff8411156143f6576143f6613e80565b50506001821b610b25565b5060208310610133831016604e8410600b8410161715614424575081810a610b25565b61442e8383614366565b806000190482111561444257614442613e80565b029392505050565b600061151560ff8416836143a956fea2646970667358221220f57721fcd41c51ed29de5666546d315810a0f33cc5044218ed54441034104d6064736f6c63430008140033",
  "deployedBytecode": "0x6080604052600436106102e85760003560e01c80637ecebe0011610190578063c01f9e37116100dc578063deaaa7cc11610095578063ece40cc11161006f578063ece40cc114610a2d578063f23a6e6114610a4d578063f8ce560a14610a6d578063fc0c546a14610a8d57600080fd5b8063deaaa7cc146109b9578063e540d01d146109ed578063eb9019d414610a0d57600080fd5b8063c01f9e37146108e2578063c28bc2fa14610902578063c59057e414610915578063d33219b414610935578063d4a8dd9814610953578063dd4e2ba51461097357600080fd5b80639a802a6d11610149578063a9a9529411610123578063a9a9529414610855578063ab58fb8e14610875578063b58131b0146108ad578063bc197c81146108c257600080fd5b80639a802a6d14610800578063a7713a7014610820578063a890c9101461083557600080fd5b80637ecebe001461072257806384b0196e146107585780638d73b031146107805780638ff262e3146107a057806391ddadf4146107c057806397c3d334146107ec57600080fd5b8063438596321161024f5780635b8d0e0d1161020857806360c4247f116101e257806360c4247f146106a257806379051887146106c25780637b3c71d3146106e25780637d5e81e21461070257600080fd5b80635b8d0e0d146106355780635c573d44146106555780635f398a141461068257600080fd5b80634385963214610517578063452115d6146105615780634bf5d7e914610581578063544ffc9c1461059657806354fd4d50146105eb578063567813881461061557600080fd5b8063160cbed7116102a1578063160cbed71461044e5780632656227d1461046e5780632d63f693146104815780632fe3e261146104a15780633932abb1146104d55780633e4f49e6146104ea57600080fd5b806301ffc9a71461032457806302a251a31461035957806306f3f9e61461038557806306fdde03146103a5578063143489d0146103c7578063150b7a021461041557600080fd5b3661031f57306102f6610ac0565b6001600160a01b03161461031d57604051637485328f60e11b815260040160405180910390fd5b005b600080fd5b34801561033057600080fd5b5061034461033f3660046133cd565b610ad9565b60405190151581526020015b60405180910390f35b34801561036557600080fd5b50600854600160301b900463ffffffff165b604051908152602001610350565b34801561039157600080fd5b5061031d6103a03660046133f7565b610b2b565b3480156103b157600080fd5b506103ba610b3f565b6040516103509190613460565b3480156103d357600080fd5b506103fd6103e23660046133f7565b6000908152600460205260409020546001600160a01b031690565b6040516001600160a01b039091168152602001610350565b34801561042157600080fd5b50610435610430366004613553565b610bd1565b6040516001600160e01b03199091168152602001610350565b34801561045a57600080fd5b5061037761046936600461372a565b610c14565b61037761047c36600461372a565b610ce3565b34801561048d57600080fd5b5061037761049c3660046133f7565b610e57565b3480156104ad57600080fd5b506103777f3e83946653575f9a39005e1545185629e92736b7528ab20ca3816f315424a81181565b3480156104e157600080fd5b50610377610e78565b3480156104f657600080fd5b5061050a6105053660046133f7565b610e8b565b60405161035091906137f1565b34801561052357600080fd5b506103446105323660046137ff565b60008281526009602090815260408083206001600160a01b038516845260030190915290205460ff1692915050565b34801561056d57600080fd5b5061037761057c36600461372a565b610e96565b34801561058d57600080fd5b506103ba610f0a565b3480156105a257600080fd5b506105d06105b13660046133f7565b6000908152600960205260409020805460018201546002909201549092565b60408051938452602084019290925290820152606001610350565b3480156105f757600080fd5b506040805180820190915260018152603160f81b60208201526103ba565b34801561062157600080fd5b50610377610630366004613840565b610fcc565b34801561064157600080fd5b506103776106503660046138b4565b610ff5565b34801561066157600080fd5b506103776106703660046133f7565b6001600160601b03193060601b161890565b34801561068e57600080fd5b5061037761069d36600461396e565b611154565b3480156106ae57600080fd5b506103776106bd3660046133f7565b6111a9565b3480156106ce57600080fd5b5061031d6106dd366004613a05565b611237565b3480156106ee57600080fd5b506103776106fd366004613a22565b611248565b34801561070e57600080fd5b5061037761071d366004613a7b565b611290565b34801561072e57600080fd5b5061037761073d366004613b2f565b6001600160a01b031660009081526002602052604090205490565b34801561076457600080fd5b5061076d611349565b6040516103509796959493929190613b87565b34801561078c57600080fd5b5061034461079b3660046133f7565b61138f565b3480156107ac57600080fd5b506103776107bb366004613bf7565b6113ab565b3480156107cc57600080fd5b506107d561147d565b60405165ffffffffffff9091168152602001610350565b3480156107f857600080fd5b506064610377565b34801561080c57600080fd5b5061037761081b366004613c48565b611505565b34801561082c57600080fd5b5061037761151c565b34801561084157600080fd5b5061031d610850366004613b2f565b611536565b34801561086157600080fd5b506103446108703660046133f7565b611547565b34801561088157600080fd5b506103776108903660046133f7565b60009081526004602052604090206001015465ffffffffffff1690565b3480156108b957600080fd5b50610377611550565b3480156108ce57600080fd5b506104356108dd366004613ca0565b611642565b3480156108ee57600080fd5b506103776108fd3660046133f7565b611686565b61031d610910366004613d33565b6116c9565b34801561092157600080fd5b5061037761093036600461372a565b611749565b34801561094157600080fd5b50600b546001600160a01b03166103fd565b34801561095f57600080fd5b5061034461096e3660046133f7565b611783565b34801561097f57600080fd5b506040805180820190915260208082527f737570706f72743d627261766f2671756f72756d3d666f722c6162737461696e908201526103ba565b3480156109c557600080fd5b506103777ff2aad550cf55f045cb27e9c559f9889fdfb6e6cdaa032301d6ea397784ae51d781565b3480156109f957600080fd5b5061031d610a08366004613d76565b61178e565b348015610a1957600080fd5b50610377610a28366004613d9c565b61179f565b348015610a3957600080fd5b5061031d610a483660046133f7565b6117c0565b348015610a5957600080fd5b50610435610a68366004613dc8565b6117d1565b348015610a7957600080fd5b50610377610a883660046133f7565b611815565b348015610a9957600080fd5b507f00000000000000000000000000000000000000000000000000000000000000006103fd565b6000610ad4600b546001600160a01b031690565b905090565b60006001600160e01b031982166332a2ad4360e11b1480610b0a57506001600160e01b03198216630271189760e51b145b80610b2557506301ffc9a760e01b6001600160e01b03198316145b92915050565b610b33611820565b610b3c8161189a565b50565b606060038054610b4e90613e30565b80601f0160208091040260200160405190810160405280929190818152602001828054610b7a90613e30565b8015610bc75780601f10610b9c57610100808354040283529160200191610bc7565b820191906000526020600020905b815481529060010190602001808311610baa57829003601f168201915b5050505050905090565b600030610bdc610ac0565b6001600160a01b031614610c0357604051637485328f60e11b815260040160405180910390fd5b50630a85bd0160e11b949350505050565b600080610c2386868686611749565b9050610c3881610c336004611930565b611953565b506000610c488288888888611992565b905065ffffffffffff811615610cc057600082815260046020908152604091829020600101805465ffffffffffff191665ffffffffffff85169081179091558251858152918201527f9a2e42fd6722813d69113e7d0079d3d940171428df7373df9c7f7617cfda2892910160405180910390a1610cd9565b604051634844252360e11b815260040160405180910390fd5b5095945050505050565b600080610cf286868686611749565b9050610d1281610d026005611930565b610d0c6004611930565b17611953565b506000818152600460205260409020805460ff60f01b1916600160f01b17905530610d3b610ac0565b6001600160a01b031614610dcd5760005b8651811015610dcb57306001600160a01b0316878281518110610d7157610d71613e6a565b60200260200101516001600160a01b031603610dbb57610dbb858281518110610d9c57610d9c613e6a565b60200260200101518051906020012060056119a190919063ffffffff16565b610dc481613e96565b9050610d4c565b505b610dda8187878787611a03565b30610de3610ac0565b6001600160a01b031614158015610e0f57506005546001600160801b03808216600160801b9092041614155b15610e1a5760006005555b6040518181527f712ae1383f79ac853f8d882153778e0260ef8f03b504e2866e0593e04d2b291f906020015b60405180910390a195945050505050565b600090815260046020526040902054600160a01b900465ffffffffffff1690565b6000610ad460085465ffffffffffff1690565b6000610b2582611a17565b600080610ea586868686611749565b9050610eb581610c336000611930565b506000818152600460205260409020546001600160a01b03163314610ef45760405163233d98e360e01b81523360048201526024015b60405180910390fd5b610f0086868686611b56565b9695505050505050565b60607f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316634bf5d7e96040518163ffffffff1660e01b8152600401600060405180830381865afa925050508015610f8b57506040513d6000823e601f3d908101601f19168201604052610f889190810190613eaf565b60015b610fc7575060408051808201909152601d81527f6d6f64653d626c6f636b6e756d6265722666726f6d3d64656661756c74000000602082015290565b919050565b600080339050610fed84828560405180602001604052806000815250611b6d565b949350505050565b6000806110d8876110d27f3e83946653575f9a39005e1545185629e92736b7528ab20ca3816f315424a8118c8c8c61104a8e6001600160a01b0316600090815260026020526040902080546001810190915590565b8d8d60405161105a929190613f1c565b60405180910390208c805190602001206040516020016110b79796959493929190968752602087019590955260ff9390931660408601526001600160a01b03919091166060850152608084015260a083015260c082015260e00190565b60405160208183030381529060405280519060200120611b90565b85611bbd565b905080611103576040516394ab6c0760e01b81526001600160a01b0388166004820152602401610eeb565b61114789888a89898080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152508b9250611c31915050565b9998505050505050505050565b60008033905061119e87828888888080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152508a9250611c31915050565b979650505050505050565b600a805460009182906111bd600184613f2c565b815481106111cd576111cd613e6a565b6000918252602090912001805490915065ffffffffffff811690600160301b90046001600160d01b0316858211611210576001600160d01b031695945050505050565b61122461121c87611d13565b600a90611d4a565b6001600160d01b03169695505050505050565b61123f611820565b610b3c81611dff565b600080339050610f0086828787878080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250611b6d92505050565b60003361129d8184611e65565b6112c55760405163d9b3955760e01b81526001600160a01b0382166004820152602401610eeb565b60006112cf611550565b9050801561133c5760006112fe8360016112e761147d565b6112f19190613f3f565b65ffffffffffff1661179f565b90508181101561133a57604051636121770b60e11b81526001600160a01b03841660048201526024810182905260448101839052606401610eeb565b505b61119e8787878786611f56565b60006060806000806000606061135d612176565b6113656121a3565b60408051600080825260208201909252600f60f81b9b939a50919850469750309650945092509050565b6000818152600960205260408120805460019091015411610b25565b600080611437846110d27ff2aad550cf55f045cb27e9c559f9889fdfb6e6cdaa032301d6ea397784ae51d78989896114008b6001600160a01b0316600090815260026020526040902080546001810190915590565b60408051602081019690965285019390935260ff90911660608401526001600160a01b0316608083015260a082015260c0016110b7565b905080611462576040516394ab6c0760e01b81526001600160a01b0385166004820152602401610eeb565b610f0086858760405180602001604052806000815250611b6d565b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166391ddadf46040518163ffffffff1660e01b8152600401602060405180830381865afa9250505080156114f9575060408051601f3d908101601f191682019092526114f691810190613f65565b60015b610fc757610ad46121d0565b60006115128484846121db565b90505b9392505050565b6000611528600a612271565b6001600160d01b0316905090565b61153e611820565b610b3c816122aa565b60006001610b25565b60008061155c60075490565b905060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316638e539e8c600161159961147d565b6115a39190613f3f565b6040516001600160e01b031960e084901b16815265ffffffffffff9091166004820152602401602060405180830381865afa1580156115e6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061160a9190613f82565b9050670de0b6b3a764000061161f8284613f9b565b61163190670de0b6b3a763ffff613fb2565b61163b9190613fdb565b9250505090565b60003061164d610ac0565b6001600160a01b03161461167457604051637485328f60e11b815260040160405180910390fd5b5063bc197c8160e01b95945050505050565b6000818152600460205260408120546116bb90600160d01b810463ffffffff1690600160a01b900465ffffffffffff16613ffd565b65ffffffffffff1692915050565b6116d1611820565b600080856001600160a01b03168585856040516116ef929190613f1c565b60006040518083038185875af1925050503d806000811461172c576040519150601f19603f3d011682016040523d82523d6000602084013e611731565b606091505b50915091506117408282612313565b50505050505050565b60008484848460405160200161176294939291906140aa565b60408051601f19818403018152919052805160209091012095945050505050565b6000610b258261232f565b611796611820565b610b3c81612366565b600061151583836117bb60408051602081019091526000815290565b6121db565b6117c8611820565b610b3c81612404565b6000306117dc610ac0565b6001600160a01b03161461180357604051637485328f60e11b815260040160405180910390fd5b5063f23a6e6160e01b95945050505050565b6000610b2582612445565b33611829610ac0565b6001600160a01b031614611852576040516347096e4760e01b8152336004820152602401610eeb565b3061185b610ac0565b6001600160a01b031614611898576000803660405161187b929190613f1c565b604051809103902090505b8061189160056124ef565b0361188657505b565b6064808211156118c75760405163243e544560e01b81526004810183905260248101829052604401610eeb565b60006118d161151c565b90506118f06118de61147d565b6118e78561255e565b600a9190612592565b505060408051828152602081018590527f0553476bf02ef2726e8ce5ced78d63e26e602e4a2257b1f559418e24b4633997910160405180910390a1505050565b6000816007811115611944576119446137b9565b600160ff919091161b92915050565b60008061195f84610e8b565b905060008361196d83611930565b1603611515578381846040516331b75e4d60e01b8152600401610eeb939291906140f5565b6000610f0086868686866125ad565b81546001600160801b03600160801b8204811691811660018301909116036119cd576119cd6041612753565b6001600160801b03808216600090815260018086016020526040909120939093558354919092018216600160801b029116179055565b611a108585858585612765565b5050505050565b600080611a23836127f6565b90506005816007811115611a3957611a396137b9565b14611a445792915050565b6000838152600c60205260409081902054600b549151632c258a9f60e11b81526004810182905290916001600160a01b03169063584b153e90602401602060405180830381865afa158015611a9d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611ac19190614117565b15611ad0575060059392505050565b600b54604051632ab0f52960e01b8152600481018390526001600160a01b0390911690632ab0f52990602401602060405180830381865afa158015611b19573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611b3d9190614117565b15611b4c575060079392505050565b5060029392505050565b6000611b6485858585612930565b95945050505050565b6000611b6485858585611b8b60408051602081019091526000815290565b611c31565b6000610b25611b9d6129cf565b8360405161190160f01b8152600281019290925260228201526042902090565b6000836001600160a01b03163b600003611c1f57600080611bde8585612afa565b5090925090506000816003811115611bf857611bf86137b9565b148015611c165750856001600160a01b0316826001600160a01b0316145b92505050611515565b611c2a848484612b47565b9050611515565b6000611c4186610c336001611930565b506000611c5786611c5189610e57565b856121db565b90506000611c688888888588612c22565b90508351600003611cbf57866001600160a01b03167fb8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda489888489604051611cb29493929190614139565b60405180910390a261119e565b866001600160a01b03167fe2babfbac5889a709b63bb7f598b324e08bc5a4fb9ec647fb3cbc9ec07eb87128988848989604051611d00959493929190614161565b60405180910390a2979650505050505050565b600065ffffffffffff821115611d46576040516306dfcc6560e41b81526030600482015260248101839052604401610eeb565b5090565b815460009081816005811115611da9576000611d6584612d25565b611d6f9085613f2c565b60008881526020902090915081015465ffffffffffff9081169087161015611d9957809150611da7565b611da4816001613fb2565b92505b505b6000611db787878585612e7e565b90508015611df257611ddc87611dce600184613f2c565b600091825260209091200190565b54600160301b90046001600160d01b031661119e565b6000979650505050505050565b6008546040805165ffffffffffff928316815291831660208301527fc565b045403dc03c2eea82b81a0465edad9e2e7fc4d97e11421c209da93d7a93910160405180910390a16008805465ffffffffffff191665ffffffffffff92909216919091179055565b80516000906034811015611e7d576001915050610b25565b82810160131901516001600160a01b031981166b046e0e4dee0dee6cae47a60f60a31b14611eb057600192505050610b25565b600080611ebe602885613f2c565b90505b83811015611f3557600080611ef5888481518110611ee157611ee1613e6a565b01602001516001600160f81b031916612ee0565b9150915081611f0d5760019650505050505050610b25565b8060ff166004856001600160a01b0316901b179350505080611f2e90613e96565b9050611ec1565b50856001600160a01b0316816001600160a01b031614935050505092915050565b6000611f6b8686868680519060200120611749565b905084518651141580611f8057508351865114155b80611f8a57508551155b15611fbf57855184518651604051630447b05d60e41b8152600481019390935260248301919091526044820152606401610eeb565b600081815260046020526040902054600160a01b900465ffffffffffff161561200a5780611fec82610e8b565b6040516331b75e4d60e01b8152610eeb9291906000906004016140f5565b6000612014610e78565b61201c61147d565b65ffffffffffff1661202e9190613fb2565b9050600061204960085463ffffffff600160301b9091041690565b600084815260046020526040902080546001600160a01b0319166001600160a01b03871617815590915061207c83611d13565b815465ffffffffffff91909116600160a01b0265ffffffffffff60a01b199091161781556120a982612f72565b815463ffffffff91909116600160d01b0263ffffffff60d01b1990911617815588517f7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e090859087908c908c906001600160401b0381111561210c5761210c613488565b60405190808252806020026020018201604052801561213f57816020015b606081526020019060019003908161212a5790505b508c8961214c8a82613fb2565b8e6040516121629998979695949392919061419b565b60405180910390a150505095945050505050565b6060610ad47f00000000000000000000000000000000000000000000000000000000000000006000612fa3565b6060610ad47f00000000000000000000000000000000000000000000000000000000000000006001612fa3565b6000610ad443611d13565b60007f0000000000000000000000000000000000000000000000000000000000000000604051630748d63560e31b81526001600160a01b038681166004830152602482018690529190911690633a46b1a890604401602060405180830381865afa15801561224d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115129190613f82565b805460009080156122a15761228b83611dce600184613f2c565b54600160301b90046001600160d01b0316611515565b60009392505050565b600b54604080516001600160a01b03928316815291831660208301527f08f74ea46ef7894f65eabfb5e6e695de773a000b47c529ab559178069b226401910160405180910390a1600b80546001600160a01b0319166001600160a01b0392909216919091179055565b606082612328576123238261304e565b610b25565b5080610b25565b6000818152600960205260408120600281015460018201546123519190613fb2565b61235d610a8885610e57565b11159392505050565b8063ffffffff166000036123905760405163f1cfbf0560e01b815260006004820152602401610eeb565b6008546040805163ffffffff600160301b9093048316815291831660208301527f7e3f7f0708a84de9203036abaa450dccc85ad5ff52f78c170f3edb55cf5e8828910160405180910390a16008805463ffffffff909216600160301b0269ffffffff00000000000019909216919091179055565b60075460408051918252602082018390527fccb45da8d5717e6c4544694297c4ba5cf151d455c9bb0ed4fc7a38411bc05461910160405180910390a1600755565b60006064612452836111a9565b604051632394e7a360e21b8152600481018590526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690638e539e8c90602401602060405180830381865afa1580156124b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906124db9190613f82565b6124e59190613f9b565b610b259190613fdb565b80546000906001600160801b0380821691600160801b9004168103612518576125186031612753565b6001600160801b038181166000908152600185810160205260408220805492905585546fffffffffffffffffffffffffffffffff19169301909116919091179092555090565b60006001600160d01b03821115611d46576040516306dfcc6560e41b815260d0600482015260248101839052604401610eeb565b6000806125a0858585613077565b915091505b935093915050565b600080600b60009054906101000a90046001600160a01b03166001600160a01b031663f27a0c926040518163ffffffff1660e01b8152600401602060405180830381865afa158015612603573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906126279190613f82565b905060003060601b6001600160601b0319168418600b5460405163b1c5f42760e01b81529192506001600160a01b03169063b1c5f42790612675908a908a908a906000908890600401614272565b602060405180830381865afa158015612692573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906126b69190613f82565b6000898152600c602052604080822092909255600b5491516308f2a0bb60e41b81526001600160a01b0390921691638f2a0bb091612701918b918b918b919088908a906004016142c0565b600060405180830381600087803b15801561271b57600080fd5b505af115801561272f573d6000803e3d6000fd5b5050505061274782426127429190613fb2565b611d13565b98975050505050505050565b634e487b71600052806020526024601cfd5b600b546001600160a01b031663e38335e53486868660003060601b6001600160601b03191688186040518763ffffffff1660e01b81526004016127ac959493929190614272565b6000604051808303818588803b1580156127c557600080fd5b505af11580156127d9573d6000803e3d6000fd5b50505060009687525050600c602052505060408320929092555050565b6000818152600460205260408120805460ff600160f01b8204811691600160f81b900416811561282b57506007949350505050565b801561283c57506002949350505050565b600061284786610e57565b90508060000361286d57604051636ad0607560e01b815260048101879052602401610eeb565b600061287761147d565b65ffffffffffff169050808210612895575060009695505050505050565b60006128a088611686565b90508181106128b757506001979650505050505050565b6128c08861232f565b15806128e057506000888152600960205260409020805460019091015411155b156128f357506003979650505050505050565b60008881526004602052604090206001015465ffffffffffff1660000361292257506004979650505050505050565b506005979650505050505050565b60008061293f868686866131cb565b6000818152600c60205260409020549091508015610cd957600b5460405163c4d252f560e01b8152600481018390526001600160a01b039091169063c4d252f590602401600060405180830381600087803b15801561299d57600080fd5b505af11580156129b1573d6000803e3d6000fd5b5050506000838152600c602052604081205550509050949350505050565b6000306001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016148015612a2857507f000000000000000000000000000000000000000000000000000000000000000046145b15612a5257507f000000000000000000000000000000000000000000000000000000000000000090565b610ad4604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b60008060008351604103612b345760208401516040850151606086015160001a612b268882858561327c565b955095509550505050612b40565b50508151600091506002905b9250925092565b6000806000856001600160a01b03168585604051602401612b69929190614318565b60408051601f198184030181529181526020820180516001600160e01b0316630b135d3f60e11b17905251612b9e9190614331565b600060405180830381855afa9150503d8060008114612bd9576040519150601f19603f3d011682016040523d82523d6000602084013e612bde565b606091505b5091509150818015612bf257506020815110155b8015610f0057508051630b135d3f60e11b90612c179083016020908101908401613f82565b149695505050505050565b60008581526009602090815260408083206001600160a01b03881684526003810190925282205460ff1615612c75576040516371c6af4960e01b81526001600160a01b0387166004820152602401610eeb565b6001600160a01b03861660009081526003820160205260409020805460ff1916600117905560ff8516612cc15783816000016000828254612cb69190613fb2565b90915550612d1a9050565b60001960ff861601612ce15783816001016000828254612cb69190613fb2565b60011960ff861601612d015783816002016000828254612cb69190613fb2565b6040516303599be160e11b815260040160405180910390fd5b509195945050505050565b600060018211612d33575090565b816001600160801b8210612d4c5760809190911c9060401b5b680100000000000000008210612d675760409190911c9060201b5b6401000000008210612d7e5760209190911c9060101b5b620100008210612d935760109190911c9060081b5b6101008210612da75760089190911c9060041b5b60108210612dba5760049190911c9060021b5b60048210612dc65760011b5b600302600190811c90818581612dde57612dde613fc5565b048201901c90506001818581612df657612df6613fc5565b048201901c90506001818581612e0e57612e0e613fc5565b048201901c90506001818581612e2657612e26613fc5565b048201901c90506001818581612e3e57612e3e613fc5565b048201901c90506001818581612e5657612e56613fc5565b048201901c9050612e75818581612e6f57612e6f613fc5565b04821190565b90039392505050565b60005b81831015612ed8576000612e95848461334b565b60008781526020902090915065ffffffffffff86169082015465ffffffffffff161115612ec457809250612ed2565b612ecf816001613fb2565b93505b50612e81565b509392505050565b60008060f883901c602f81118015612efb5750603a8160ff16105b15612f1057600194602f199091019350915050565b8060ff166040108015612f26575060478160ff16105b15612f3b576001946036199091019350915050565b8060ff166060108015612f51575060678160ff16105b15612f66576001946056199091019350915050565b50600093849350915050565b600063ffffffff821115611d46576040516306dfcc6560e41b81526020600482015260248101839052604401610eeb565b606060ff8314612fbd57612fb683613366565b9050610b25565b818054612fc990613e30565b80601f0160208091040260200160405190810160405280929190818152602001828054612ff590613e30565b80156130425780601f1061301757610100808354040283529160200191613042565b820191906000526020600020905b81548152906001019060200180831161302557829003601f168201915b50505050509050610b25565b80511561305e5780518082602001fd5b60405163d6bda27560e01b815260040160405180910390fd5b82546000908190801561317057600061309587611dce600185613f2c565b805490915065ffffffffffff80821691600160301b90046001600160d01b03169088168211156130d857604051632520601d60e01b815260040160405180910390fd5b8765ffffffffffff168265ffffffffffff160361311157825465ffffffffffff16600160301b6001600160d01b03891602178355613162565b6040805180820190915265ffffffffffff808a1682526001600160d01b03808a1660208085019182528d54600181018f5560008f81529190912094519151909216600160301b029216919091179101555b94508593506125a592505050565b50506040805180820190915265ffffffffffff80851682526001600160d01b0380851660208085019182528854600181018a5560008a815291822095519251909316600160301b0291909316179201919091559050816125a5565b6000806131da86868686611749565b9050613228816131ea6007611930565b6131f46006611930565b6131fe6002611930565b600161320b60078261434d565b61321690600261444a565b6132209190613f2c565b181818611953565b506000818152600460205260409081902080546001600160f81b0316600160f81b179055517f789cf55be980739dad1d0699b93b58e806b51c9d96619bfa8fe0a28abaa7b30c90610e469083815260200190565b600080807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08411156132b75750600091506003905082613341565b604080516000808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa15801561330b573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b03811661333757506000925060019150829050613341565b9250600091508190505b9450945094915050565b600061335a6002848418613fdb565b61151590848416613fb2565b60606000613373836133a5565b604080516020808252818301909252919250600091906020820181803683375050509182525060208101929092525090565b600060ff8216601f811115610b2557604051632cd44ac360e21b815260040160405180910390fd5b6000602082840312156133df57600080fd5b81356001600160e01b03198116811461151557600080fd5b60006020828403121561340957600080fd5b5035919050565b60005b8381101561342b578181015183820152602001613413565b50506000910152565b6000815180845261344c816020860160208601613410565b601f01601f19169290920160200192915050565b6020815260006115156020830184613434565b6001600160a01b0381168114610b3c57600080fd5b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b03811182821017156134c6576134c6613488565b604052919050565b60006001600160401b038211156134e7576134e7613488565b50601f01601f191660200190565b6000613508613503846134ce565b61349e565b905082815283838301111561351c57600080fd5b828260208301376000602084830101529392505050565b600082601f83011261354457600080fd5b611515838335602085016134f5565b6000806000806080858703121561356957600080fd5b843561357481613473565b9350602085013561358481613473565b92506040850135915060608501356001600160401b038111156135a657600080fd5b6135b287828801613533565b91505092959194509250565b60006001600160401b038211156135d7576135d7613488565b5060051b60200190565b600082601f8301126135f257600080fd5b81356020613602613503836135be565b82815260059290921b8401810191818101908684111561362157600080fd5b8286015b8481101561364557803561363881613473565b8352918301918301613625565b509695505050505050565b600082601f83011261366157600080fd5b81356020613671613503836135be565b82815260059290921b8401810191818101908684111561369057600080fd5b8286015b848110156136455780358352918301918301613694565b600082601f8301126136bc57600080fd5b813560206136cc613503836135be565b82815260059290921b840181019181810190868411156136eb57600080fd5b8286015b848110156136455780356001600160401b0381111561370e5760008081fd5b61371c8986838b0101613533565b8452509183019183016136ef565b6000806000806080858703121561374057600080fd5b84356001600160401b038082111561375757600080fd5b613763888389016135e1565b9550602087013591508082111561377957600080fd5b61378588838901613650565b9450604087013591508082111561379b57600080fd5b506137a8878288016136ab565b949793965093946060013593505050565b634e487b7160e01b600052602160045260246000fd5b600881106137ed57634e487b7160e01b600052602160045260246000fd5b9052565b60208101610b2582846137cf565b6000806040838503121561381257600080fd5b82359150602083013561382481613473565b809150509250929050565b803560ff81168114610fc757600080fd5b6000806040838503121561385357600080fd5b823591506138636020840161382f565b90509250929050565b60008083601f84011261387e57600080fd5b5081356001600160401b0381111561389557600080fd5b6020830191508360208285010111156138ad57600080fd5b9250929050565b600080600080600080600060c0888a0312156138cf57600080fd5b873596506138df6020890161382f565b955060408801356138ef81613473565b945060608801356001600160401b038082111561390b57600080fd5b6139178b838c0161386c565b909650945060808a013591508082111561393057600080fd5b61393c8b838c01613533565b935060a08a013591508082111561395257600080fd5b5061395f8a828b01613533565b91505092959891949750929550565b60008060008060006080868803121561398657600080fd5b853594506139966020870161382f565b935060408601356001600160401b03808211156139b257600080fd5b6139be89838a0161386c565b909550935060608801359150808211156139d757600080fd5b506139e488828901613533565b9150509295509295909350565b65ffffffffffff81168114610b3c57600080fd5b600060208284031215613a1757600080fd5b8135611515816139f1565b60008060008060608587031215613a3857600080fd5b84359350613a486020860161382f565b925060408501356001600160401b03811115613a6357600080fd5b613a6f8782880161386c565b95989497509550505050565b60008060008060808587031215613a9157600080fd5b84356001600160401b0380821115613aa857600080fd5b613ab4888389016135e1565b95506020870135915080821115613aca57600080fd5b613ad688838901613650565b94506040870135915080821115613aec57600080fd5b613af8888389016136ab565b93506060870135915080821115613b0e57600080fd5b508501601f81018713613b2057600080fd5b6135b2878235602084016134f5565b600060208284031215613b4157600080fd5b813561151581613473565b600081518084526020808501945080840160005b83811015613b7c57815187529582019590820190600101613b60565b509495945050505050565b60ff60f81b8816815260e060208201526000613ba660e0830189613434565b8281036040840152613bb88189613434565b606084018890526001600160a01b038716608085015260a0840186905283810360c08501529050613be98185613b4c565b9a9950505050505050505050565b60008060008060808587031215613c0d57600080fd5b84359350613c1d6020860161382f565b92506040850135613c2d81613473565b915060608501356001600160401b038111156135a657600080fd5b600080600060608486031215613c5d57600080fd5b8335613c6881613473565b92506020840135915060408401356001600160401b03811115613c8a57600080fd5b613c9686828701613533565b9150509250925092565b600080600080600060a08688031215613cb857600080fd5b8535613cc381613473565b94506020860135613cd381613473565b935060408601356001600160401b0380821115613cef57600080fd5b613cfb89838a01613650565b94506060880135915080821115613d1157600080fd5b613d1d89838a01613650565b935060808801359150808211156139d757600080fd5b60008060008060608587031215613d4957600080fd5b8435613d5481613473565b93506020850135925060408501356001600160401b03811115613a6357600080fd5b600060208284031215613d8857600080fd5b813563ffffffff8116811461151557600080fd5b60008060408385031215613daf57600080fd5b8235613dba81613473565b946020939093013593505050565b600080600080600060a08688031215613de057600080fd5b8535613deb81613473565b94506020860135613dfb81613473565b9350604086013592506060860135915060808601356001600160401b03811115613e2457600080fd5b6139e488828901613533565b600181811c90821680613e4457607f821691505b602082108103613e6457634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060018201613ea857613ea8613e80565b5060010190565b600060208284031215613ec157600080fd5b81516001600160401b03811115613ed757600080fd5b8201601f81018413613ee857600080fd5b8051613ef6613503826134ce565b818152856020838501011115613f0b57600080fd5b611b64826020830160208601613410565b8183823760009101908152919050565b81810381811115610b2557610b25613e80565b65ffffffffffff828116828216039080821115613f5e57613f5e613e80565b5092915050565b600060208284031215613f7757600080fd5b8151611515816139f1565b600060208284031215613f9457600080fd5b5051919050565b8082028115828204841417610b2557610b25613e80565b80820180821115610b2557610b25613e80565b634e487b7160e01b600052601260045260246000fd5b600082613ff857634e487b7160e01b600052601260045260246000fd5b500490565b65ffffffffffff818116838216019080821115613f5e57613f5e613e80565b600081518084526020808501945080840160005b83811015613b7c5781516001600160a01b031687529582019590820190600101614030565b600081518084526020808501808196508360051b8101915082860160005b8581101561409d57828403895261408b848351613434565b98850198935090840190600101614073565b5091979650505050505050565b6080815260006140bd608083018761401c565b82810360208401526140cf8187613b4c565b905082810360408401526140e38186614055565b91505082606083015295945050505050565b8381526060810161410960208301856137cf565b826040830152949350505050565b60006020828403121561412957600080fd5b8151801515811461151557600080fd5b84815260ff84166020820152826040820152608060608201526000610f006080830184613434565b85815260ff8516602082015283604082015260a06060820152600061418960a0830185613434565b82810360808401526127478185613434565b60006101208b8352602060018060a01b038c16818501528160408501526141c48285018c61401c565b915083820360608501526141d8828b613b4c565b915083820360808501528189518084528284019150828160051b850101838c0160005b8381101561422957601f19878403018552614217838351613434565b948601949250908501906001016141fb565b505086810360a088015261423d818c614055565b9450505050508560c08401528460e08401528281036101008401526142628185613434565b9c9b505050505050505050505050565b60a08152600061428560a083018861401c565b82810360208401526142978188613b4c565b905082810360408401526142ab8187614055565b60608401959095525050608001529392505050565b60c0815260006142d360c083018961401c565b82810360208401526142e58189613b4c565b905082810360408401526142f98188614055565b60608401969096525050608081019290925260a0909101529392505050565b8281526040602082015260006115126040830184613434565b60008251614343818460208701613410565b9190910192915050565b60ff8181168382160190811115610b2557610b25613e80565b600181815b808511156143a157816000190482111561438757614387613e80565b8085161561439457918102915b93841c939080029061436b565b509250929050565b6000826143b857506001610b25565b816143c557506000610b25565b81600181146143db57600281146143e557614401565b6001915050610b25565b60ff8411156143f6576143f6613e80565b50506001821b610b25565b5060208310610133831016604e8410600b8410161715614424575081810a610b25565b61442e8383614366565b806000190482111561444257614442613e80565b029392505050565b600061151560ff8416836143a956fea2646970667358221220f57721fcd41c51ed29de5666546d315810a0f33cc5044218ed54441034104d6064736f6c63430008140033",
  "linkReferences": {},
  "deployedLinkReferences": {}
}

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/contracts/artifacts/VoteToken.json`:

```json
{
  "_format": "hh-sol-artifact-1",
  "contractName": "VoteToken",
  "sourceName": "src/VoteToken.sol",
  "abi": [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_symbol",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "CheckpointUnorderedInsertion",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ECDSAInvalidSignature",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "length",
          "type": "uint256"
        }
      ],
      "name": "ECDSAInvalidSignatureLength",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "ECDSAInvalidSignatureS",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "increasedSupply",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "cap",
          "type": "uint256"
        }
      ],
      "name": "ERC20ExceededSafeSupply",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "ERC2612ExpiredSignature",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "signer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "ERC2612InvalidSigner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "timepoint",
          "type": "uint256"
        },
        {
          "internalType": "uint48",
          "name": "clock",
          "type": "uint48"
        }
      ],
      "name": "ERC5805FutureLookup",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ERC6372InconsistentClock",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "currentNonce",
          "type": "uint256"
        }
      ],
      "name": "InvalidAccountNonce",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidShortString",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "bits",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "SafeCastOverflowedUintDowncast",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "str",
          "type": "string"
        }
      ],
      "name": "StringTooLong",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "expiry",
          "type": "uint256"
        }
      ],
      "name": "VotesExpiredSignature",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "delegator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "fromDelegate",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "toDelegate",
          "type": "address"
        }
      ],
      "name": "DelegateChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "delegate",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "previousVotes",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newVotes",
          "type": "uint256"
        }
      ],
      "name": "DelegateVotesChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "EIP712DomainChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "CLOCK_MODE",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "DOMAIN_SEPARATOR",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint32",
          "name": "pos",
          "type": "uint32"
        }
      ],
      "name": "checkpoints",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint48",
              "name": "_key",
              "type": "uint48"
            },
            {
              "internalType": "uint208",
              "name": "_value",
              "type": "uint208"
            }
          ],
          "internalType": "struct Checkpoints.Checkpoint208",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "clock",
      "outputs": [
        {
          "internalType": "uint48",
          "name": "",
          "type": "uint48"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "delegatee",
          "type": "address"
        }
      ],
      "name": "delegate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "delegatee",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "nonce",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "expiry",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "v",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "delegateBySig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "delegates",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "eip712Domain",
      "outputs": [
        {
          "internalType": "bytes1",
          "name": "fields",
          "type": "bytes1"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "version",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "verifyingContract",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        },
        {
          "internalType": "uint256[]",
          "name": "extensions",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "timepoint",
          "type": "uint256"
        }
      ],
      "name": "getPastTotalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "timepoint",
          "type": "uint256"
        }
      ],
      "name": "getPastVotes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getVotes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "nonces",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "numCheckpoints",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "v",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "permit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "bytecode": "0x6101606040523480156200001257600080fd5b50604051620022d3380380620022d3833981016040819052620000359162000286565b6040805180820190915260018152603160f81b602082015282908190818460036200006183826200037f565b5060046200007082826200037f565b50620000829150839050600562000134565b610120526200009381600662000134565b61014052815160208084019190912060e052815190820120610100524660a0526200012160e05161010051604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201529081019290925260608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b60805250503060c05250620004a5915050565b600060208351101562000154576200014c836200016d565b905062000167565b816200016184826200037f565b5060ff90505b92915050565b600080829050601f81511115620001a4578260405163305a27a960e01b81526004016200019b91906200044b565b60405180910390fd5b8051620001b18262000480565b179392505050565b634e487b7160e01b600052604160045260246000fd5b60005b83811015620001ec578181015183820152602001620001d2565b50506000910152565b600082601f8301126200020757600080fd5b81516001600160401b0380821115620002245762000224620001b9565b604051601f8301601f19908116603f011681019082821181831017156200024f576200024f620001b9565b816040528381528660208588010111156200026957600080fd5b6200027c846020830160208901620001cf565b9695505050505050565b600080604083850312156200029a57600080fd5b82516001600160401b0380821115620002b257600080fd5b620002c086838701620001f5565b93506020850151915080821115620002d757600080fd5b50620002e685828601620001f5565b9150509250929050565b600181811c908216806200030557607f821691505b6020821081036200032657634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200037a57600081815260208120601f850160051c81016020861015620003555750805b601f850160051c820191505b81811015620003765782815560010162000361565b5050505b505050565b81516001600160401b038111156200039b576200039b620001b9565b620003b381620003ac8454620002f0565b846200032c565b602080601f831160018114620003eb5760008415620003d25750858301515b600019600386901b1c1916600185901b17855562000376565b600085815260208120601f198616915b828110156200041c57888601518255948401946001909101908401620003fb565b50858210156200043b5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b60208152600082518060208401526200046c816040850160208701620001cf565b601f01601f19169190910160400192915050565b80516020808301519190811015620003265760001960209190910360031b1b16919050565b60805160a05160c05160e051610100516101205161014051611dd3620005006000396000610cda01526000610cad01526000610a8001526000610a58015260006109b3015260006109dd01526000610a070152611dd36000f3fe608060405234801561001057600080fd5b50600436106101585760003560e01c806370a08231116100c35780639ab24eb01161007c5780639ab24eb01461033c578063a9059cbb1461034f578063c3cda52014610362578063d505accf14610375578063dd62ed3e14610388578063f1127ed8146103c157600080fd5b806370a08231146102ab5780637ecebe00146102d457806384b0196e146102e75780638e539e8c1461030257806391ddadf41461031557806395d89b411461033457600080fd5b80633a46b1a8116101155780633a46b1a8146101da57806340c10f19146101ed5780634bf5d7e914610202578063587cde1e1461022c5780635c19a95c146102705780636fcfff451461028357600080fd5b806306fdde031461015d578063095ea7b31461017b57806318160ddd1461019e57806323b872dd146101b0578063313ce567146101c35780633644e515146101d2575b600080fd5b610165610400565b60405161017291906119d7565b60405180910390f35b61018e610189366004611a06565b610492565b6040519015158152602001610172565b6002545b604051908152602001610172565b61018e6101be366004611a30565b6104ac565b60405160128152602001610172565b6101a26104d5565b6101a26101e8366004611a06565b6104df565b6102006101fb366004611a06565b610565565b005b60408051808201909152600e81526d06d6f64653d74696d657374616d760941b6020820152610165565b61025861023a366004611a6c565b6001600160a01b039081166000908152600860205260409020541690565b6040516001600160a01b039091168152602001610172565b61020061027e366004611a6c565b610573565b610296610291366004611a6c565b61057e565b60405163ffffffff9091168152602001610172565b6101a26102b9366004611a6c565b6001600160a01b031660009081526020819052604090205490565b6101a26102e2366004611a6c565b610589565b6102ef610594565b6040516101729796959493929190611a87565b6101a2610310366004611b1d565b6105da565b61031d610644565b60405165ffffffffffff9091168152602001610172565b61016561064e565b6101a261034a366004611a6c565b61065d565b61018e61035d366004611a06565b61068d565b610200610370366004611b47565b61069b565b610200610383366004611b9f565b610758565b6101a2610396366004611c09565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6103d46103cf366004611c3c565b610892565b60408051825165ffffffffffff1681526020928301516001600160d01b03169281019290925201610172565b60606003805461040f90611c7c565b80601f016020809104026020016040519081016040528092919081815260200182805461043b90611c7c565b80156104885780601f1061045d57610100808354040283529160200191610488565b820191906000526020600020905b81548152906001019060200180831161046b57829003601f168201915b5050505050905090565b6000336104a08185856108b7565b60019150505b92915050565b6000336104ba8582856108c9565b6104c5858585610947565b506001949350505050565b905090565b60006104d06109a6565b6000806104ea610644565b90508065ffffffffffff16831061052a57604051637669fc0f60e11b81526004810184905265ffffffffffff821660248201526044015b60405180910390fd5b61055461053684610ad1565b6001600160a01b038616600090815260096020526040902090610b08565b6001600160d01b0316949350505050565b61056f8282610bbe565b5050565b3361056f8183610bf4565b60006104a682610c66565b60006104a682610c88565b6000606080600080600060606105a8610ca6565b6105b0610cd3565b60408051600080825260208201909252600f60f81b9b939a50919850469750309650945092509050565b6000806105e5610644565b90508065ffffffffffff16831061062057604051637669fc0f60e11b81526004810184905265ffffffffffff82166024820152604401610521565b61063461062c84610ad1565b600a90610b08565b6001600160d01b03169392505050565b60006104d0610d00565b60606004805461040f90611c7c565b6001600160a01b038116600090815260096020526040812061067e90610d0b565b6001600160d01b031692915050565b6000336104a0818585610947565b834211156106bf57604051632341d78760e11b815260048101859052602401610521565b604080517fe48329057bfd03d55e49b547132e39cffd9c1820ad7b9d4c5307691425d15adf60208201526001600160a01b038816918101919091526060810186905260808101859052600090610739906107319060a00160405160208183030381529060405280519060200120610d44565b858585610d71565b90506107458187610d9f565b61074f8188610bf4565b50505050505050565b8342111561077c5760405163313c898160e11b815260048101859052602401610521565b60007f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98888886107c98c6001600160a01b0316600090815260076020526040902080546001810190915590565b6040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810186905260e001604051602081830303815290604052805190602001209050600061082482610d44565b9050600061083482878787610d71565b9050896001600160a01b0316816001600160a01b03161461087b576040516325c0072360e11b81526001600160a01b0380831660048301528b166024820152604401610521565b6108868a8a8a6108b7565b50505050505050505050565b60408051808201909152600080825260208201526108b08383610df2565b9392505050565b6108c48383836001610e28565b505050565b6001600160a01b038381166000908152600160209081526040808320938616835292905220546000198114610941578181101561093257604051637dc7a0d960e11b81526001600160a01b03841660048201526024810182905260448101839052606401610521565b61094184848484036000610e28565b50505050565b6001600160a01b03831661097157604051634b637e8f60e11b815260006004820152602401610521565b6001600160a01b03821661099b5760405163ec442f0560e01b815260006004820152602401610521565b6108c4838383610efd565b6000306001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161480156109ff57507f000000000000000000000000000000000000000000000000000000000000000046145b15610a2957507f000000000000000000000000000000000000000000000000000000000000000090565b6104d0604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b600065ffffffffffff821115610b04576040516306dfcc6560e41b81526030600482015260248101839052604401610521565b5090565b815460009081816005811115610b67576000610b2384610f08565b610b2d9085611ccc565b60008881526020902090915081015465ffffffffffff9081169087161015610b5757809150610b65565b610b62816001611cdf565b92505b505b6000610b7587878585611061565b90508015610bb057610b9a87610b8c600184611ccc565b600091825260209091200190565b54600160301b90046001600160d01b0316610bb3565b60005b979650505050505050565b6001600160a01b038216610be85760405163ec442f0560e01b815260006004820152602401610521565b61056f60008383610efd565b6001600160a01b0382811660008181526008602052604080822080548686166001600160a01b0319821681179092559151919094169392849290917f3134e8a2e6d97e929a7e54011ea5485d7d196dd5f0ba4d4ef95803e8e3fc257f9190a46108c48183610c61866110c3565b6110e1565b6001600160a01b0381166000908152600960205260408120546104a69061124d565b6001600160a01b0381166000908152600760205260408120546104a6565b60606104d07f0000000000000000000000000000000000000000000000000000000000000000600561127e565b60606104d07f0000000000000000000000000000000000000000000000000000000000000000600661127e565b60006104d042610ad1565b80546000908015610d3b57610d2583610b8c600184611ccc565b54600160301b90046001600160d01b03166108b0565b60009392505050565b60006104a6610d516109a6565b8360405161190160f01b8152600281019290925260228201526042902090565b600080600080610d8388888888611329565b925092509250610d9382826113f8565b50909695505050505050565b6001600160a01b03821660009081526007602052604090208054600181019091558181146108c4576040516301d4b62360e61b81526001600160a01b038416600482015260248101829052604401610521565b60408051808201909152600080825260208201526001600160a01b03831660009081526009602052604090206108b090836114b1565b6001600160a01b038416610e525760405163e602df0560e01b815260006004820152602401610521565b6001600160a01b038316610e7c57604051634a1406b160e11b815260006004820152602401610521565b6001600160a01b038085166000908152600160209081526040808320938716835292905220829055801561094157826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92584604051610eef91815260200190565b60405180910390a350505050565b6108c4838383611521565b600060018211610f16575090565b816001600160801b8210610f2f5760809190911c9060401b5b680100000000000000008210610f4a5760409190911c9060201b5b6401000000008210610f615760209190911c9060101b5b620100008210610f765760109190911c9060081b5b6101008210610f8a5760089190911c9060041b5b60108210610f9d5760049190911c9060021b5b60048210610fa95760011b5b600302600190811c90818581610fc157610fc1611cf2565b048201901c90506001818581610fd957610fd9611cf2565b048201901c90506001818581610ff157610ff1611cf2565b048201901c9050600181858161100957611009611cf2565b048201901c9050600181858161102157611021611cf2565b048201901c9050600181858161103957611039611cf2565b048201901c905061105881858161105257611052611cf2565b04821190565b90039392505050565b60005b818310156110bb5760006110788484611588565b60008781526020902090915065ffffffffffff86169082015465ffffffffffff1611156110a7578092506110b5565b6110b2816001611cdf565b93505b50611064565b509392505050565b6001600160a01b0381166000908152602081905260408120546104a6565b816001600160a01b0316836001600160a01b0316141580156111035750600081115b156108c4576001600160a01b038316156111ab576001600160a01b03831660009081526009602052604081208190611146906115a3611141866115af565b6115e3565b6001600160d01b031691506001600160d01b03169150846001600160a01b03167fdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a72483836040516111a0929190918252602082015260400190565b60405180910390a250505b6001600160a01b038216156108c4576001600160a01b038216600090815260096020526040812081906111e49061161c611141866115af565b6001600160d01b031691506001600160d01b03169150836001600160a01b03167fdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724838360405161123e929190918252602082015260400190565b60405180910390a25050505050565b600063ffffffff821115610b04576040516306dfcc6560e41b81526020600482015260248101839052604401610521565b606060ff83146112985761129183611628565b90506104a6565b8180546112a490611c7c565b80601f01602080910402602001604051908101604052809291908181526020018280546112d090611c7c565b801561131d5780601f106112f25761010080835404028352916020019161131d565b820191906000526020600020905b81548152906001019060200180831161130057829003601f168201915b505050505090506104a6565b600080807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a084111561136457506000915060039050826113ee565b604080516000808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa1580156113b8573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381166113e4575060009250600191508290506113ee565b9250600091508190505b9450945094915050565b600082600381111561140c5761140c611d08565b03611415575050565b600182600381111561142957611429611d08565b036114475760405163f645eedf60e01b815260040160405180910390fd5b600282600381111561145b5761145b611d08565b0361147c5760405163fce698f760e01b815260048101829052602401610521565b600382600381111561149057611490611d08565b0361056f576040516335e2f38360e21b815260048101829052602401610521565b6040805180820190915260008082526020820152826000018263ffffffff16815481106114e0576114e0611d1e565b60009182526020918290206040805180820190915291015465ffffffffffff81168252600160301b90046001600160d01b0316918101919091529392505050565b61152c838383611667565b6001600160a01b03831661157d57600061154560025490565b90506001600160d01b038082111561157a57604051630e58ae9360e11b81526004810183905260248101829052604401610521565b50505b6108c4838383611791565b60006115976002848418611d34565b6108b090848416611cdf565b60006108b08284611d56565b60006001600160d01b03821115610b04576040516306dfcc6560e41b815260d0600482015260248101839052604401610521565b60008061160f6115f1610644565b6116076115fd88610d0b565b868863ffffffff16565b879190611807565b915091505b935093915050565b60006108b08284611d7d565b6060600061163583611815565b604080516020808252818301909252919250600091906020820181803683375050509182525060208101929092525090565b6001600160a01b0383166116925780600260008282546116879190611cdf565b909155506117049050565b6001600160a01b038316600090815260208190526040902054818110156116e55760405163391434e360e21b81526001600160a01b03851660048201526024810182905260448101839052606401610521565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b0382166117205760028054829003905561173f565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161178491815260200190565b60405180910390a3505050565b6001600160a01b0383166117b3576117b0600a61161c611141846115af565b50505b6001600160a01b0382166117d5576117d2600a6115a3611141846115af565b50505b6001600160a01b038381166000908152600860205260408082205485841683529120546108c4929182169116836110e1565b60008061160f85858561183d565b600060ff8216601f8111156104a657604051632cd44ac360e21b815260040160405180910390fd5b82546000908190801561193657600061185b87610b8c600185611ccc565b805490915065ffffffffffff80821691600160301b90046001600160d01b031690881682111561189e57604051632520601d60e01b815260040160405180910390fd5b8765ffffffffffff168265ffffffffffff16036118d757825465ffffffffffff16600160301b6001600160d01b03891602178355611928565b6040805180820190915265ffffffffffff808a1682526001600160d01b03808a1660208085019182528d54600181018f5560008f81529190912094519151909216600160301b029216919091179101555b945085935061161492505050565b50506040805180820190915265ffffffffffff80851682526001600160d01b0380851660208085019182528854600181018a5560008a815291822095519251909316600160301b029190931617920191909155905081611614565b6000815180845260005b818110156119b75760208185018101518683018201520161199b565b506000602082860101526020601f19601f83011685010191505092915050565b6020815260006108b06020830184611991565b80356001600160a01b0381168114611a0157600080fd5b919050565b60008060408385031215611a1957600080fd5b611a22836119ea565b946020939093013593505050565b600080600060608486031215611a4557600080fd5b611a4e846119ea565b9250611a5c602085016119ea565b9150604084013590509250925092565b600060208284031215611a7e57600080fd5b6108b0826119ea565b60ff60f81b881681526000602060e081840152611aa760e084018a611991565b8381036040850152611ab9818a611991565b606085018990526001600160a01b038816608086015260a0850187905284810360c0860152855180825283870192509083019060005b81811015611b0b57835183529284019291840191600101611aef565b50909c9b505050505050505050505050565b600060208284031215611b2f57600080fd5b5035919050565b803560ff81168114611a0157600080fd5b60008060008060008060c08789031215611b6057600080fd5b611b69876119ea565b95506020870135945060408701359350611b8560608801611b36565b92506080870135915060a087013590509295509295509295565b600080600080600080600060e0888a031215611bba57600080fd5b611bc3886119ea565b9650611bd1602089016119ea565b95506040880135945060608801359350611bed60808901611b36565b925060a0880135915060c0880135905092959891949750929550565b60008060408385031215611c1c57600080fd5b611c25836119ea565b9150611c33602084016119ea565b90509250929050565b60008060408385031215611c4f57600080fd5b611c58836119ea565b9150602083013563ffffffff81168114611c7157600080fd5b809150509250929050565b600181811c90821680611c9057607f821691505b602082108103611cb057634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b818103818111156104a6576104a6611cb6565b808201808211156104a6576104a6611cb6565b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b600082611d5157634e487b7160e01b600052601260045260246000fd5b500490565b6001600160d01b03828116828216039080821115611d7657611d76611cb6565b5092915050565b6001600160d01b03818116838216019080821115611d7657611d76611cb656fea2646970667358221220be48a11b19883e1ea89539c6e966dcfbd34eccf56ae5ef131f0256163850039964736f6c63430008140033",
  "deployedBytecode": "0x608060405234801561001057600080fd5b50600436106101585760003560e01c806370a08231116100c35780639ab24eb01161007c5780639ab24eb01461033c578063a9059cbb1461034f578063c3cda52014610362578063d505accf14610375578063dd62ed3e14610388578063f1127ed8146103c157600080fd5b806370a08231146102ab5780637ecebe00146102d457806384b0196e146102e75780638e539e8c1461030257806391ddadf41461031557806395d89b411461033457600080fd5b80633a46b1a8116101155780633a46b1a8146101da57806340c10f19146101ed5780634bf5d7e914610202578063587cde1e1461022c5780635c19a95c146102705780636fcfff451461028357600080fd5b806306fdde031461015d578063095ea7b31461017b57806318160ddd1461019e57806323b872dd146101b0578063313ce567146101c35780633644e515146101d2575b600080fd5b610165610400565b60405161017291906119d7565b60405180910390f35b61018e610189366004611a06565b610492565b6040519015158152602001610172565b6002545b604051908152602001610172565b61018e6101be366004611a30565b6104ac565b60405160128152602001610172565b6101a26104d5565b6101a26101e8366004611a06565b6104df565b6102006101fb366004611a06565b610565565b005b60408051808201909152600e81526d06d6f64653d74696d657374616d760941b6020820152610165565b61025861023a366004611a6c565b6001600160a01b039081166000908152600860205260409020541690565b6040516001600160a01b039091168152602001610172565b61020061027e366004611a6c565b610573565b610296610291366004611a6c565b61057e565b60405163ffffffff9091168152602001610172565b6101a26102b9366004611a6c565b6001600160a01b031660009081526020819052604090205490565b6101a26102e2366004611a6c565b610589565b6102ef610594565b6040516101729796959493929190611a87565b6101a2610310366004611b1d565b6105da565b61031d610644565b60405165ffffffffffff9091168152602001610172565b61016561064e565b6101a261034a366004611a6c565b61065d565b61018e61035d366004611a06565b61068d565b610200610370366004611b47565b61069b565b610200610383366004611b9f565b610758565b6101a2610396366004611c09565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6103d46103cf366004611c3c565b610892565b60408051825165ffffffffffff1681526020928301516001600160d01b03169281019290925201610172565b60606003805461040f90611c7c565b80601f016020809104026020016040519081016040528092919081815260200182805461043b90611c7c565b80156104885780601f1061045d57610100808354040283529160200191610488565b820191906000526020600020905b81548152906001019060200180831161046b57829003601f168201915b5050505050905090565b6000336104a08185856108b7565b60019150505b92915050565b6000336104ba8582856108c9565b6104c5858585610947565b506001949350505050565b905090565b60006104d06109a6565b6000806104ea610644565b90508065ffffffffffff16831061052a57604051637669fc0f60e11b81526004810184905265ffffffffffff821660248201526044015b60405180910390fd5b61055461053684610ad1565b6001600160a01b038616600090815260096020526040902090610b08565b6001600160d01b0316949350505050565b61056f8282610bbe565b5050565b3361056f8183610bf4565b60006104a682610c66565b60006104a682610c88565b6000606080600080600060606105a8610ca6565b6105b0610cd3565b60408051600080825260208201909252600f60f81b9b939a50919850469750309650945092509050565b6000806105e5610644565b90508065ffffffffffff16831061062057604051637669fc0f60e11b81526004810184905265ffffffffffff82166024820152604401610521565b61063461062c84610ad1565b600a90610b08565b6001600160d01b03169392505050565b60006104d0610d00565b60606004805461040f90611c7c565b6001600160a01b038116600090815260096020526040812061067e90610d0b565b6001600160d01b031692915050565b6000336104a0818585610947565b834211156106bf57604051632341d78760e11b815260048101859052602401610521565b604080517fe48329057bfd03d55e49b547132e39cffd9c1820ad7b9d4c5307691425d15adf60208201526001600160a01b038816918101919091526060810186905260808101859052600090610739906107319060a00160405160208183030381529060405280519060200120610d44565b858585610d71565b90506107458187610d9f565b61074f8188610bf4565b50505050505050565b8342111561077c5760405163313c898160e11b815260048101859052602401610521565b60007f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98888886107c98c6001600160a01b0316600090815260076020526040902080546001810190915590565b6040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810186905260e001604051602081830303815290604052805190602001209050600061082482610d44565b9050600061083482878787610d71565b9050896001600160a01b0316816001600160a01b03161461087b576040516325c0072360e11b81526001600160a01b0380831660048301528b166024820152604401610521565b6108868a8a8a6108b7565b50505050505050505050565b60408051808201909152600080825260208201526108b08383610df2565b9392505050565b6108c48383836001610e28565b505050565b6001600160a01b038381166000908152600160209081526040808320938616835292905220546000198114610941578181101561093257604051637dc7a0d960e11b81526001600160a01b03841660048201526024810182905260448101839052606401610521565b61094184848484036000610e28565b50505050565b6001600160a01b03831661097157604051634b637e8f60e11b815260006004820152602401610521565b6001600160a01b03821661099b5760405163ec442f0560e01b815260006004820152602401610521565b6108c4838383610efd565b6000306001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161480156109ff57507f000000000000000000000000000000000000000000000000000000000000000046145b15610a2957507f000000000000000000000000000000000000000000000000000000000000000090565b6104d0604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260009060c00160405160208183030381529060405280519060200120905090565b600065ffffffffffff821115610b04576040516306dfcc6560e41b81526030600482015260248101839052604401610521565b5090565b815460009081816005811115610b67576000610b2384610f08565b610b2d9085611ccc565b60008881526020902090915081015465ffffffffffff9081169087161015610b5757809150610b65565b610b62816001611cdf565b92505b505b6000610b7587878585611061565b90508015610bb057610b9a87610b8c600184611ccc565b600091825260209091200190565b54600160301b90046001600160d01b0316610bb3565b60005b979650505050505050565b6001600160a01b038216610be85760405163ec442f0560e01b815260006004820152602401610521565b61056f60008383610efd565b6001600160a01b0382811660008181526008602052604080822080548686166001600160a01b0319821681179092559151919094169392849290917f3134e8a2e6d97e929a7e54011ea5485d7d196dd5f0ba4d4ef95803e8e3fc257f9190a46108c48183610c61866110c3565b6110e1565b6001600160a01b0381166000908152600960205260408120546104a69061124d565b6001600160a01b0381166000908152600760205260408120546104a6565b60606104d07f0000000000000000000000000000000000000000000000000000000000000000600561127e565b60606104d07f0000000000000000000000000000000000000000000000000000000000000000600661127e565b60006104d042610ad1565b80546000908015610d3b57610d2583610b8c600184611ccc565b54600160301b90046001600160d01b03166108b0565b60009392505050565b60006104a6610d516109a6565b8360405161190160f01b8152600281019290925260228201526042902090565b600080600080610d8388888888611329565b925092509250610d9382826113f8565b50909695505050505050565b6001600160a01b03821660009081526007602052604090208054600181019091558181146108c4576040516301d4b62360e61b81526001600160a01b038416600482015260248101829052604401610521565b60408051808201909152600080825260208201526001600160a01b03831660009081526009602052604090206108b090836114b1565b6001600160a01b038416610e525760405163e602df0560e01b815260006004820152602401610521565b6001600160a01b038316610e7c57604051634a1406b160e11b815260006004820152602401610521565b6001600160a01b038085166000908152600160209081526040808320938716835292905220829055801561094157826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92584604051610eef91815260200190565b60405180910390a350505050565b6108c4838383611521565b600060018211610f16575090565b816001600160801b8210610f2f5760809190911c9060401b5b680100000000000000008210610f4a5760409190911c9060201b5b6401000000008210610f615760209190911c9060101b5b620100008210610f765760109190911c9060081b5b6101008210610f8a5760089190911c9060041b5b60108210610f9d5760049190911c9060021b5b60048210610fa95760011b5b600302600190811c90818581610fc157610fc1611cf2565b048201901c90506001818581610fd957610fd9611cf2565b048201901c90506001818581610ff157610ff1611cf2565b048201901c9050600181858161100957611009611cf2565b048201901c9050600181858161102157611021611cf2565b048201901c9050600181858161103957611039611cf2565b048201901c905061105881858161105257611052611cf2565b04821190565b90039392505050565b60005b818310156110bb5760006110788484611588565b60008781526020902090915065ffffffffffff86169082015465ffffffffffff1611156110a7578092506110b5565b6110b2816001611cdf565b93505b50611064565b509392505050565b6001600160a01b0381166000908152602081905260408120546104a6565b816001600160a01b0316836001600160a01b0316141580156111035750600081115b156108c4576001600160a01b038316156111ab576001600160a01b03831660009081526009602052604081208190611146906115a3611141866115af565b6115e3565b6001600160d01b031691506001600160d01b03169150846001600160a01b03167fdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a72483836040516111a0929190918252602082015260400190565b60405180910390a250505b6001600160a01b038216156108c4576001600160a01b038216600090815260096020526040812081906111e49061161c611141866115af565b6001600160d01b031691506001600160d01b03169150836001600160a01b03167fdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724838360405161123e929190918252602082015260400190565b60405180910390a25050505050565b600063ffffffff821115610b04576040516306dfcc6560e41b81526020600482015260248101839052604401610521565b606060ff83146112985761129183611628565b90506104a6565b8180546112a490611c7c565b80601f01602080910402602001604051908101604052809291908181526020018280546112d090611c7c565b801561131d5780601f106112f25761010080835404028352916020019161131d565b820191906000526020600020905b81548152906001019060200180831161130057829003601f168201915b505050505090506104a6565b600080807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a084111561136457506000915060039050826113ee565b604080516000808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa1580156113b8573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381166113e4575060009250600191508290506113ee565b9250600091508190505b9450945094915050565b600082600381111561140c5761140c611d08565b03611415575050565b600182600381111561142957611429611d08565b036114475760405163f645eedf60e01b815260040160405180910390fd5b600282600381111561145b5761145b611d08565b0361147c5760405163fce698f760e01b815260048101829052602401610521565b600382600381111561149057611490611d08565b0361056f576040516335e2f38360e21b815260048101829052602401610521565b6040805180820190915260008082526020820152826000018263ffffffff16815481106114e0576114e0611d1e565b60009182526020918290206040805180820190915291015465ffffffffffff81168252600160301b90046001600160d01b0316918101919091529392505050565b61152c838383611667565b6001600160a01b03831661157d57600061154560025490565b90506001600160d01b038082111561157a57604051630e58ae9360e11b81526004810183905260248101829052604401610521565b50505b6108c4838383611791565b60006115976002848418611d34565b6108b090848416611cdf565b60006108b08284611d56565b60006001600160d01b03821115610b04576040516306dfcc6560e41b815260d0600482015260248101839052604401610521565b60008061160f6115f1610644565b6116076115fd88610d0b565b868863ffffffff16565b879190611807565b915091505b935093915050565b60006108b08284611d7d565b6060600061163583611815565b604080516020808252818301909252919250600091906020820181803683375050509182525060208101929092525090565b6001600160a01b0383166116925780600260008282546116879190611cdf565b909155506117049050565b6001600160a01b038316600090815260208190526040902054818110156116e55760405163391434e360e21b81526001600160a01b03851660048201526024810182905260448101839052606401610521565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b0382166117205760028054829003905561173f565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161178491815260200190565b60405180910390a3505050565b6001600160a01b0383166117b3576117b0600a61161c611141846115af565b50505b6001600160a01b0382166117d5576117d2600a6115a3611141846115af565b50505b6001600160a01b038381166000908152600860205260408082205485841683529120546108c4929182169116836110e1565b60008061160f85858561183d565b600060ff8216601f8111156104a657604051632cd44ac360e21b815260040160405180910390fd5b82546000908190801561193657600061185b87610b8c600185611ccc565b805490915065ffffffffffff80821691600160301b90046001600160d01b031690881682111561189e57604051632520601d60e01b815260040160405180910390fd5b8765ffffffffffff168265ffffffffffff16036118d757825465ffffffffffff16600160301b6001600160d01b03891602178355611928565b6040805180820190915265ffffffffffff808a1682526001600160d01b03808a1660208085019182528d54600181018f5560008f81529190912094519151909216600160301b029216919091179101555b945085935061161492505050565b50506040805180820190915265ffffffffffff80851682526001600160d01b0380851660208085019182528854600181018a5560008a815291822095519251909316600160301b029190931617920191909155905081611614565b6000815180845260005b818110156119b75760208185018101518683018201520161199b565b506000602082860101526020601f19601f83011685010191505092915050565b6020815260006108b06020830184611991565b80356001600160a01b0381168114611a0157600080fd5b919050565b60008060408385031215611a1957600080fd5b611a22836119ea565b946020939093013593505050565b600080600060608486031215611a4557600080fd5b611a4e846119ea565b9250611a5c602085016119ea565b9150604084013590509250925092565b600060208284031215611a7e57600080fd5b6108b0826119ea565b60ff60f81b881681526000602060e081840152611aa760e084018a611991565b8381036040850152611ab9818a611991565b606085018990526001600160a01b038816608086015260a0850187905284810360c0860152855180825283870192509083019060005b81811015611b0b57835183529284019291840191600101611aef565b50909c9b505050505050505050505050565b600060208284031215611b2f57600080fd5b5035919050565b803560ff81168114611a0157600080fd5b60008060008060008060c08789031215611b6057600080fd5b611b69876119ea565b95506020870135945060408701359350611b8560608801611b36565b92506080870135915060a087013590509295509295509295565b600080600080600080600060e0888a031215611bba57600080fd5b611bc3886119ea565b9650611bd1602089016119ea565b95506040880135945060608801359350611bed60808901611b36565b925060a0880135915060c0880135905092959891949750929550565b60008060408385031215611c1c57600080fd5b611c25836119ea565b9150611c33602084016119ea565b90509250929050565b60008060408385031215611c4f57600080fd5b611c58836119ea565b9150602083013563ffffffff81168114611c7157600080fd5b809150509250929050565b600181811c90821680611c9057607f821691505b602082108103611cb057634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b818103818111156104a6576104a6611cb6565b808201808211156104a6576104a6611cb6565b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b600082611d5157634e487b7160e01b600052601260045260246000fd5b500490565b6001600160d01b03828116828216039080821115611d7657611d76611cb6565b5092915050565b6001600160d01b03818116838216019080821115611d7657611d76611cb656fea2646970667358221220be48a11b19883e1ea89539c6e966dcfbd34eccf56ae5ef131f0256163850039964736f6c63430008140033",
  "linkReferences": {},
  "deployedLinkReferences": {}
}

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/contracts/artifacts/TimelockController.json`:

```json
{
  "_format": "hh-sol-artifact-1",
  "contractName": "TimelockController",
  "sourceName": "node_modules/@openzeppelin/contracts/governance/TimelockController.sol",
  "abi": [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "minDelay",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "proposers",
          "type": "address[]"
        },
        {
          "internalType": "address[]",
          "name": "executors",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "admin",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AccessControlBadConfirmation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "neededRole",
          "type": "bytes32"
        }
      ],
      "name": "AccessControlUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FailedCall",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "delay",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minDelay",
          "type": "uint256"
        }
      ],
      "name": "TimelockInsufficientDelay",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "targets",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "payloads",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "values",
          "type": "uint256"
        }
      ],
      "name": "TimelockInvalidOperationLength",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "caller",
          "type": "address"
        }
      ],
      "name": "TimelockUnauthorizedCaller",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "predecessorId",
          "type": "bytes32"
        }
      ],
      "name": "TimelockUnexecutedPredecessor",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "operationId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "expectedStates",
          "type": "bytes32"
        }
      ],
      "name": "TimelockUnexpectedOperationState",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "CallExecuted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        }
      ],
      "name": "CallSalt",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "predecessor",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "delay",
          "type": "uint256"
        }
      ],
      "name": "CallScheduled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "Cancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldDuration",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newDuration",
          "type": "uint256"
        }
      ],
      "name": "MinDelayChange",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "previousAdminRole",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "newAdminRole",
          "type": "bytes32"
        }
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "RoleRevoked",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "CANCELLER_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "DEFAULT_ADMIN_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "EXECUTOR_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "PROPOSER_ROLE",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "cancel",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "payload",
          "type": "bytes"
        },
        {
          "internalType": "bytes32",
          "name": "predecessor",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        }
      ],
      "name": "execute",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "targets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes[]",
          "name": "payloads",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes32",
          "name": "predecessor",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        }
      ],
      "name": "executeBatch",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMinDelay",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "getOperationState",
      "outputs": [
        {
          "internalType": "enum TimelockController.OperationState",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        }
      ],
      "name": "getRoleAdmin",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "getTimestamp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "hasRole",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        },
        {
          "internalType": "bytes32",
          "name": "predecessor",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        }
      ],
      "name": "hashOperation",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "targets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes[]",
          "name": "payloads",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes32",
          "name": "predecessor",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        }
      ],
      "name": "hashOperationBatch",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "isOperation",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "isOperationDone",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "isOperationPending",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "isOperationReady",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC1155BatchReceived",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC1155Received",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC721Received",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "callerConfirmation",
          "type": "address"
        }
      ],
      "name": "renounceRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        },
        {
          "internalType": "bytes32",
          "name": "predecessor",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "delay",
          "type": "uint256"
        }
      ],
      "name": "schedule",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "targets",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes[]",
          "name": "payloads",
          "type": "bytes[]"
        },
        {
          "internalType": "bytes32",
          "name": "predecessor",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "delay",
          "type": "uint256"
        }
      ],
      "name": "scheduleBatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newDelay",
          "type": "uint256"
        }
      ],
      "name": "updateDelay",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ],
  "bytecode": "0x60806040523480156200001157600080fd5b5060405162001e7738038062001e77833981016040819052620000349162000340565b62000041600030620001b1565b506001600160a01b0381161562000061576200005f600082620001b1565b505b60005b83518110156200010b57620000bc7fb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1858381518110620000a857620000a8620003c7565b6020026020010151620001b160201b60201c565b50620000f77ffd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783858381518110620000a857620000a8620003c7565b506200010381620003dd565b905062000064565b5060005b82518110156200016757620001537fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63848381518110620000a857620000a8620003c7565b506200015f81620003dd565b90506200010f565b5060028490556040805160008152602081018690527f11c24f4ead16507c69ac467fbd5e4eed5fb5c699626d2cc6d66421df253886d5910160405180910390a15050505062000405565b6000828152602081815260408083206001600160a01b038516845290915281205460ff1662000256576000838152602081815260408083206001600160a01b03861684529091529020805460ff191660011790556200020d3390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45060016200025a565b5060005b92915050565b634e487b7160e01b600052604160045260246000fd5b80516001600160a01b03811681146200028e57600080fd5b919050565b600082601f830112620002a557600080fd5b815160206001600160401b0380831115620002c457620002c462000260565b8260051b604051601f19603f83011681018181108482111715620002ec57620002ec62000260565b6040529384528581018301938381019250878511156200030b57600080fd5b83870191505b848210156200033557620003258262000276565b8352918301919083019062000311565b979650505050505050565b600080600080608085870312156200035757600080fd5b845160208601519094506001600160401b03808211156200037757600080fd5b620003858883890162000293565b945060408701519150808211156200039c57600080fd5b50620003ab8782880162000293565b925050620003bc6060860162000276565b905092959194509250565b634e487b7160e01b600052603260045260246000fd5b600060018201620003fe57634e487b7160e01b600052601160045260246000fd5b5060010190565b611a6280620004156000396000f3fe6080604052600436106101bb5760003560e01c80638065657f116100ec578063bc197c811161008a578063d547741f11610064578063d547741f1461056a578063e38335e51461058a578063f23a6e611461059d578063f27a0c92146105c957600080fd5b8063bc197c81146104f1578063c4d252f51461051d578063d45c44351461053d57600080fd5b806391d14854116100c657806391d1485414610468578063a217fddf14610488578063b08e51c01461049d578063b1c5f427146104d157600080fd5b80638065657f146103f45780638f2a0bb0146104145780638f61f4f51461043457600080fd5b80632ab0f5291161015957806336568abe1161013357806336568abe14610367578063584b153e1461038757806364d62353146103a75780637958004c146103c757600080fd5b80632ab0f529146103075780632f2ff15d1461032757806331d507501461034757600080fd5b8063134008d311610195578063134008d31461026057806313bc9f2014610273578063150b7a0214610293578063248a9ca3146102d757600080fd5b806301d5062a146101c757806301ffc9a7146101e957806307bd02651461021e57600080fd5b366101c257005b600080fd5b3480156101d357600080fd5b506101e76101e23660046111c8565b6105de565b005b3480156101f557600080fd5b5061020961020436600461123c565b6106b4565b60405190151581526020015b60405180910390f35b34801561022a57600080fd5b506102527fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e6381565b604051908152602001610215565b6101e761026e366004611266565b6106c5565b34801561027f57600080fd5b5061020961028e3660046112d1565b61077a565b34801561029f57600080fd5b506102be6102ae36600461139f565b630a85bd0160e11b949350505050565b6040516001600160e01b03199091168152602001610215565b3480156102e357600080fd5b506102526102f23660046112d1565b60009081526020819052604090206001015490565b34801561031357600080fd5b506102096103223660046112d1565b6107a0565b34801561033357600080fd5b506101e7610342366004611406565b6107a9565b34801561035357600080fd5b506102096103623660046112d1565b6107d4565b34801561037357600080fd5b506101e7610382366004611406565b6107f9565b34801561039357600080fd5b506102096103a23660046112d1565b610831565b3480156103b357600080fd5b506101e76103c23660046112d1565b610877565b3480156103d357600080fd5b506103e76103e23660046112d1565b6108ea565b6040516102159190611448565b34801561040057600080fd5b5061025261040f366004611266565b610935565b34801561042057600080fd5b506101e761042f3660046114b4565b610974565b34801561044057600080fd5b506102527fb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc181565b34801561047457600080fd5b50610209610483366004611406565b610b0a565b34801561049457600080fd5b50610252600081565b3480156104a957600080fd5b506102527ffd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f78381565b3480156104dd57600080fd5b506102526104ec366004611565565b610b33565b3480156104fd57600080fd5b506102be61050c36600461168c565b63bc197c8160e01b95945050505050565b34801561052957600080fd5b506101e76105383660046112d1565b610b78565b34801561054957600080fd5b506102526105583660046112d1565b60009081526001602052604090205490565b34801561057657600080fd5b506101e7610585366004611406565b610c23565b6101e7610598366004611565565b610c48565b3480156105a957600080fd5b506102be6105b8366004611735565b63f23a6e6160e01b95945050505050565b3480156105d557600080fd5b50600254610252565b7fb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc161060881610dd5565b6000610618898989898989610935565b90506106248184610de2565b6000817f4cf4410cc57040e44862ef0f45f3dd5a5e02db8eb8add648d4b0e236f1d07dca8b8b8b8b8b8a604051610660969594939291906117c2565b60405180910390a383156106a957807f20fda5fd27a1ea7bf5b9567f143ac5470bb059374a27e8f67cb44f946f6d0387856040516106a091815260200190565b60405180910390a25b505050505050505050565b60006106bf82610e76565b92915050565b7fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e636106f1816000610b0a565b6106ff576106ff8133610e9b565b600061070f888888888888610935565b905061071b8185610ed8565b61072788888888610f26565b6000817fc2617efa69bab66782fa219543714338489c4e9e178271560a91b82c3f612b588a8a8a8a60405161075f94939291906117ff565b60405180910390a361077081610f9e565b5050505050505050565b600060025b610788836108ea565b600381111561079957610799611432565b1492915050565b6000600361077f565b6000828152602081905260409020600101546107c481610dd5565b6107ce8383610fca565b50505050565b6000806107e0836108ea565b60038111156107f1576107f1611432565b141592915050565b6001600160a01b03811633146108225760405163334bd91960e11b815260040160405180910390fd5b61082c828261105c565b505050565b60008061083d836108ea565b9050600181600381111561085357610853611432565b14806108705750600281600381111561086e5761086e611432565b145b9392505050565b333081146108a85760405163e2850c5960e01b81526001600160a01b03821660048201526024015b60405180910390fd5b60025460408051918252602082018490527f11c24f4ead16507c69ac467fbd5e4eed5fb5c699626d2cc6d66421df253886d5910160405180910390a150600255565b6000818152600160205260408120548060000361090a5750600092915050565b6001810361091b5750600392915050565b4281111561092c5750600192915050565b50600292915050565b6000868686868686604051602001610952969594939291906117c2565b6040516020818303038152906040528051906020012090509695505050505050565b7fb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc161099e81610dd5565b88871415806109ad5750888514155b156109df576040516001624fcdef60e01b03198152600481018a9052602481018690526044810188905260640161089f565b60006109f18b8b8b8b8b8b8b8b610b33565b90506109fd8184610de2565b60005b8a811015610abb5780827f4cf4410cc57040e44862ef0f45f3dd5a5e02db8eb8add648d4b0e236f1d07dca8e8e85818110610a3d57610a3d611831565b9050602002016020810190610a529190611847565b8d8d86818110610a6457610a64611831565b905060200201358c8c87818110610a7d57610a7d611831565b9050602002810190610a8f9190611862565b8c8b604051610aa3969594939291906117c2565b60405180910390a3610ab4816118be565b9050610a00565b508315610afd57807f20fda5fd27a1ea7bf5b9567f143ac5470bb059374a27e8f67cb44f946f6d038785604051610af491815260200190565b60405180910390a25b5050505050505050505050565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b60008888888888888888604051602001610b54989796959493929190611968565b60405160208183030381529060405280519060200120905098975050505050505050565b7ffd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783610ba281610dd5565b610bab82610831565b610be75781610bba60026110c7565b610bc460016110c7565b604051635ead8eb560e01b8152600481019390935217602482015260440161089f565b6000828152600160205260408082208290555183917fbaa1eb22f2a492ba1a5fea61b8df4d27c6c8b5f3971e63bb58fa14ff72eedb7091a25050565b600082815260208190526040902060010154610c3e81610dd5565b6107ce838361105c565b7fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63610c74816000610b0a565b610c8257610c828133610e9b565b8786141580610c915750878414155b15610cc3576040516001624fcdef60e01b0319815260048101899052602481018590526044810187905260640161089f565b6000610cd58a8a8a8a8a8a8a8a610b33565b9050610ce18185610ed8565b60005b89811015610dbf5760008b8b83818110610d0057610d00611831565b9050602002016020810190610d159190611847565b905060008a8a84818110610d2b57610d2b611831565b9050602002013590503660008a8a86818110610d4957610d49611831565b9050602002810190610d5b9190611862565b91509150610d6b84848484610f26565b84867fc2617efa69bab66782fa219543714338489c4e9e178271560a91b82c3f612b5886868686604051610da294939291906117ff565b60405180910390a35050505080610db8906118be565b9050610ce4565b50610dc981610f9e565b50505050505050505050565b610ddf8133610e9b565b50565b610deb826107d4565b15610e1d5781610dfb60006110c7565b604051635ead8eb560e01b81526004810192909252602482015260440161089f565b6000610e2860025490565b905080821015610e5557604051635433660960e01b8152600481018390526024810182905260440161089f565b610e5f8242611a09565b600093845260016020526040909320929092555050565b60006001600160e01b03198216630271189760e51b14806106bf57506106bf826110ea565b610ea58282610b0a565b610ed45760405163e2517d3f60e01b81526001600160a01b03821660048201526024810183905260440161089f565b5050565b610ee18261077a565b610ef05781610dfb60026110c7565b8015801590610f055750610f03816107a0565b155b15610ed45760405163121534c360e31b81526004810182905260240161089f565b600080856001600160a01b0316858585604051610f44929190611a1c565b60006040518083038185875af1925050503d8060008114610f81576040519150601f19603f3d011682016040523d82523d6000602084013e610f86565b606091505b5091509150610f95828261111f565b50505050505050565b610fa78161077a565b610fb65780610dfb60026110c7565b600090815260016020819052604090912055565b6000610fd68383610b0a565b611054576000838152602081815260408083206001600160a01b03861684529091529020805460ff1916600117905561100c3390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45060016106bf565b5060006106bf565b60006110688383610b0a565b15611054576000838152602081815260408083206001600160a01b0386168085529252808320805460ff1916905551339286917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45060016106bf565b60008160038111156110db576110db611432565b600160ff919091161b92915050565b60006001600160e01b03198216637965db0b60e01b14806106bf57506301ffc9a760e01b6001600160e01b03198316146106bf565b6060826111345761112f8261113b565b6106bf565b50806106bf565b80511561114b5780518082602001fd5b60405163d6bda27560e01b815260040160405180910390fd5b80356001600160a01b038116811461117b57600080fd5b919050565b60008083601f84011261119257600080fd5b5081356001600160401b038111156111a957600080fd5b6020830191508360208285010111156111c157600080fd5b9250929050565b600080600080600080600060c0888a0312156111e357600080fd5b6111ec88611164565b96506020880135955060408801356001600160401b0381111561120e57600080fd5b61121a8a828b01611180565b989b979a50986060810135976080820135975060a09091013595509350505050565b60006020828403121561124e57600080fd5b81356001600160e01b03198116811461087057600080fd5b60008060008060008060a0878903121561127f57600080fd5b61128887611164565b95506020870135945060408701356001600160401b038111156112aa57600080fd5b6112b689828a01611180565b979a9699509760608101359660809091013595509350505050565b6000602082840312156112e357600080fd5b5035919050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b0381118282101715611328576113286112ea565b604052919050565b600082601f83011261134157600080fd5b81356001600160401b0381111561135a5761135a6112ea565b61136d601f8201601f1916602001611300565b81815284602083860101111561138257600080fd5b816020850160208301376000918101602001919091529392505050565b600080600080608085870312156113b557600080fd5b6113be85611164565b93506113cc60208601611164565b92506040850135915060608501356001600160401b038111156113ee57600080fd5b6113fa87828801611330565b91505092959194509250565b6000806040838503121561141957600080fd5b8235915061142960208401611164565b90509250929050565b634e487b7160e01b600052602160045260246000fd5b602081016004831061146a57634e487b7160e01b600052602160045260246000fd5b91905290565b60008083601f84011261148257600080fd5b5081356001600160401b0381111561149957600080fd5b6020830191508360208260051b85010111156111c157600080fd5b600080600080600080600080600060c08a8c0312156114d257600080fd5b89356001600160401b03808211156114e957600080fd5b6114f58d838e01611470565b909b50995060208c013591508082111561150e57600080fd5b61151a8d838e01611470565b909950975060408c013591508082111561153357600080fd5b506115408c828d01611470565b9a9d999c50979a969997986060880135976080810135975060a0013595509350505050565b60008060008060008060008060a0898b03121561158157600080fd5b88356001600160401b038082111561159857600080fd5b6115a48c838d01611470565b909a50985060208b01359150808211156115bd57600080fd5b6115c98c838d01611470565b909850965060408b01359150808211156115e257600080fd5b506115ef8b828c01611470565b999c989b509699959896976060870135966080013595509350505050565b600082601f83011261161e57600080fd5b813560206001600160401b03821115611639576116396112ea565b8160051b611648828201611300565b928352848101820192828101908785111561166257600080fd5b83870192505b8483101561168157823582529183019190830190611668565b979650505050505050565b600080600080600060a086880312156116a457600080fd5b6116ad86611164565b94506116bb60208701611164565b935060408601356001600160401b03808211156116d757600080fd5b6116e389838a0161160d565b945060608801359150808211156116f957600080fd5b61170589838a0161160d565b9350608088013591508082111561171b57600080fd5b5061172888828901611330565b9150509295509295909350565b600080600080600060a0868803121561174d57600080fd5b61175686611164565b945061176460208701611164565b9350604086013592506060860135915060808601356001600160401b0381111561178d57600080fd5b61172888828901611330565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b60018060a01b038716815285602082015260a0604082015260006117ea60a083018688611799565b60608301949094525060800152949350505050565b60018060a01b0385168152836020820152606060408201526000611827606083018486611799565b9695505050505050565b634e487b7160e01b600052603260045260246000fd5b60006020828403121561185957600080fd5b61087082611164565b6000808335601e1984360301811261187957600080fd5b8301803591506001600160401b0382111561189357600080fd5b6020019150368190038213156111c157600080fd5b634e487b7160e01b600052601160045260246000fd5b6000600182016118d0576118d06118a8565b5060010190565b81835260006020808501808196508560051b810191508460005b8781101561195b5782840389528135601e1988360301811261191257600080fd5b870185810190356001600160401b0381111561192d57600080fd5b80360382131561193c57600080fd5b611947868284611799565b9a87019a95505050908401906001016118f1565b5091979650505050505050565b60a0808252810188905260008960c08301825b8b8110156119a9576001600160a01b0361199484611164565b1682526020928301929091019060010161197b565b5083810360208501528881526001600160fb1b038911156119c957600080fd5b8860051b9150818a602083013701828103602090810160408501526119f190820187896118d7565b60608401959095525050608001529695505050505050565b808201808211156106bf576106bf6118a8565b818382376000910190815291905056fea2646970667358221220725e11fe22ce11e81db5a04c6b0028ace5a6d8c12cb61ad95d376ed3be9bba0b64736f6c63430008140033",
  "deployedBytecode": "0x6080604052600436106101bb5760003560e01c80638065657f116100ec578063bc197c811161008a578063d547741f11610064578063d547741f1461056a578063e38335e51461058a578063f23a6e611461059d578063f27a0c92146105c957600080fd5b8063bc197c81146104f1578063c4d252f51461051d578063d45c44351461053d57600080fd5b806391d14854116100c657806391d1485414610468578063a217fddf14610488578063b08e51c01461049d578063b1c5f427146104d157600080fd5b80638065657f146103f45780638f2a0bb0146104145780638f61f4f51461043457600080fd5b80632ab0f5291161015957806336568abe1161013357806336568abe14610367578063584b153e1461038757806364d62353146103a75780637958004c146103c757600080fd5b80632ab0f529146103075780632f2ff15d1461032757806331d507501461034757600080fd5b8063134008d311610195578063134008d31461026057806313bc9f2014610273578063150b7a0214610293578063248a9ca3146102d757600080fd5b806301d5062a146101c757806301ffc9a7146101e957806307bd02651461021e57600080fd5b366101c257005b600080fd5b3480156101d357600080fd5b506101e76101e23660046111c8565b6105de565b005b3480156101f557600080fd5b5061020961020436600461123c565b6106b4565b60405190151581526020015b60405180910390f35b34801561022a57600080fd5b506102527fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e6381565b604051908152602001610215565b6101e761026e366004611266565b6106c5565b34801561027f57600080fd5b5061020961028e3660046112d1565b61077a565b34801561029f57600080fd5b506102be6102ae36600461139f565b630a85bd0160e11b949350505050565b6040516001600160e01b03199091168152602001610215565b3480156102e357600080fd5b506102526102f23660046112d1565b60009081526020819052604090206001015490565b34801561031357600080fd5b506102096103223660046112d1565b6107a0565b34801561033357600080fd5b506101e7610342366004611406565b6107a9565b34801561035357600080fd5b506102096103623660046112d1565b6107d4565b34801561037357600080fd5b506101e7610382366004611406565b6107f9565b34801561039357600080fd5b506102096103a23660046112d1565b610831565b3480156103b357600080fd5b506101e76103c23660046112d1565b610877565b3480156103d357600080fd5b506103e76103e23660046112d1565b6108ea565b6040516102159190611448565b34801561040057600080fd5b5061025261040f366004611266565b610935565b34801561042057600080fd5b506101e761042f3660046114b4565b610974565b34801561044057600080fd5b506102527fb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc181565b34801561047457600080fd5b50610209610483366004611406565b610b0a565b34801561049457600080fd5b50610252600081565b3480156104a957600080fd5b506102527ffd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f78381565b3480156104dd57600080fd5b506102526104ec366004611565565b610b33565b3480156104fd57600080fd5b506102be61050c36600461168c565b63bc197c8160e01b95945050505050565b34801561052957600080fd5b506101e76105383660046112d1565b610b78565b34801561054957600080fd5b506102526105583660046112d1565b60009081526001602052604090205490565b34801561057657600080fd5b506101e7610585366004611406565b610c23565b6101e7610598366004611565565b610c48565b3480156105a957600080fd5b506102be6105b8366004611735565b63f23a6e6160e01b95945050505050565b3480156105d557600080fd5b50600254610252565b7fb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc161060881610dd5565b6000610618898989898989610935565b90506106248184610de2565b6000817f4cf4410cc57040e44862ef0f45f3dd5a5e02db8eb8add648d4b0e236f1d07dca8b8b8b8b8b8a604051610660969594939291906117c2565b60405180910390a383156106a957807f20fda5fd27a1ea7bf5b9567f143ac5470bb059374a27e8f67cb44f946f6d0387856040516106a091815260200190565b60405180910390a25b505050505050505050565b60006106bf82610e76565b92915050565b7fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e636106f1816000610b0a565b6106ff576106ff8133610e9b565b600061070f888888888888610935565b905061071b8185610ed8565b61072788888888610f26565b6000817fc2617efa69bab66782fa219543714338489c4e9e178271560a91b82c3f612b588a8a8a8a60405161075f94939291906117ff565b60405180910390a361077081610f9e565b5050505050505050565b600060025b610788836108ea565b600381111561079957610799611432565b1492915050565b6000600361077f565b6000828152602081905260409020600101546107c481610dd5565b6107ce8383610fca565b50505050565b6000806107e0836108ea565b60038111156107f1576107f1611432565b141592915050565b6001600160a01b03811633146108225760405163334bd91960e11b815260040160405180910390fd5b61082c828261105c565b505050565b60008061083d836108ea565b9050600181600381111561085357610853611432565b14806108705750600281600381111561086e5761086e611432565b145b9392505050565b333081146108a85760405163e2850c5960e01b81526001600160a01b03821660048201526024015b60405180910390fd5b60025460408051918252602082018490527f11c24f4ead16507c69ac467fbd5e4eed5fb5c699626d2cc6d66421df253886d5910160405180910390a150600255565b6000818152600160205260408120548060000361090a5750600092915050565b6001810361091b5750600392915050565b4281111561092c5750600192915050565b50600292915050565b6000868686868686604051602001610952969594939291906117c2565b6040516020818303038152906040528051906020012090509695505050505050565b7fb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc161099e81610dd5565b88871415806109ad5750888514155b156109df576040516001624fcdef60e01b03198152600481018a9052602481018690526044810188905260640161089f565b60006109f18b8b8b8b8b8b8b8b610b33565b90506109fd8184610de2565b60005b8a811015610abb5780827f4cf4410cc57040e44862ef0f45f3dd5a5e02db8eb8add648d4b0e236f1d07dca8e8e85818110610a3d57610a3d611831565b9050602002016020810190610a529190611847565b8d8d86818110610a6457610a64611831565b905060200201358c8c87818110610a7d57610a7d611831565b9050602002810190610a8f9190611862565b8c8b604051610aa3969594939291906117c2565b60405180910390a3610ab4816118be565b9050610a00565b508315610afd57807f20fda5fd27a1ea7bf5b9567f143ac5470bb059374a27e8f67cb44f946f6d038785604051610af491815260200190565b60405180910390a25b5050505050505050505050565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b60008888888888888888604051602001610b54989796959493929190611968565b60405160208183030381529060405280519060200120905098975050505050505050565b7ffd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783610ba281610dd5565b610bab82610831565b610be75781610bba60026110c7565b610bc460016110c7565b604051635ead8eb560e01b8152600481019390935217602482015260440161089f565b6000828152600160205260408082208290555183917fbaa1eb22f2a492ba1a5fea61b8df4d27c6c8b5f3971e63bb58fa14ff72eedb7091a25050565b600082815260208190526040902060010154610c3e81610dd5565b6107ce838361105c565b7fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63610c74816000610b0a565b610c8257610c828133610e9b565b8786141580610c915750878414155b15610cc3576040516001624fcdef60e01b0319815260048101899052602481018590526044810187905260640161089f565b6000610cd58a8a8a8a8a8a8a8a610b33565b9050610ce18185610ed8565b60005b89811015610dbf5760008b8b83818110610d0057610d00611831565b9050602002016020810190610d159190611847565b905060008a8a84818110610d2b57610d2b611831565b9050602002013590503660008a8a86818110610d4957610d49611831565b9050602002810190610d5b9190611862565b91509150610d6b84848484610f26565b84867fc2617efa69bab66782fa219543714338489c4e9e178271560a91b82c3f612b5886868686604051610da294939291906117ff565b60405180910390a35050505080610db8906118be565b9050610ce4565b50610dc981610f9e565b50505050505050505050565b610ddf8133610e9b565b50565b610deb826107d4565b15610e1d5781610dfb60006110c7565b604051635ead8eb560e01b81526004810192909252602482015260440161089f565b6000610e2860025490565b905080821015610e5557604051635433660960e01b8152600481018390526024810182905260440161089f565b610e5f8242611a09565b600093845260016020526040909320929092555050565b60006001600160e01b03198216630271189760e51b14806106bf57506106bf826110ea565b610ea58282610b0a565b610ed45760405163e2517d3f60e01b81526001600160a01b03821660048201526024810183905260440161089f565b5050565b610ee18261077a565b610ef05781610dfb60026110c7565b8015801590610f055750610f03816107a0565b155b15610ed45760405163121534c360e31b81526004810182905260240161089f565b600080856001600160a01b0316858585604051610f44929190611a1c565b60006040518083038185875af1925050503d8060008114610f81576040519150601f19603f3d011682016040523d82523d6000602084013e610f86565b606091505b5091509150610f95828261111f565b50505050505050565b610fa78161077a565b610fb65780610dfb60026110c7565b600090815260016020819052604090912055565b6000610fd68383610b0a565b611054576000838152602081815260408083206001600160a01b03861684529091529020805460ff1916600117905561100c3390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45060016106bf565b5060006106bf565b60006110688383610b0a565b15611054576000838152602081815260408083206001600160a01b0386168085529252808320805460ff1916905551339286917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45060016106bf565b60008160038111156110db576110db611432565b600160ff919091161b92915050565b60006001600160e01b03198216637965db0b60e01b14806106bf57506301ffc9a760e01b6001600160e01b03198316146106bf565b6060826111345761112f8261113b565b6106bf565b50806106bf565b80511561114b5780518082602001fd5b60405163d6bda27560e01b815260040160405180910390fd5b80356001600160a01b038116811461117b57600080fd5b919050565b60008083601f84011261119257600080fd5b5081356001600160401b038111156111a957600080fd5b6020830191508360208285010111156111c157600080fd5b9250929050565b600080600080600080600060c0888a0312156111e357600080fd5b6111ec88611164565b96506020880135955060408801356001600160401b0381111561120e57600080fd5b61121a8a828b01611180565b989b979a50986060810135976080820135975060a09091013595509350505050565b60006020828403121561124e57600080fd5b81356001600160e01b03198116811461087057600080fd5b60008060008060008060a0878903121561127f57600080fd5b61128887611164565b95506020870135945060408701356001600160401b038111156112aa57600080fd5b6112b689828a01611180565b979a9699509760608101359660809091013595509350505050565b6000602082840312156112e357600080fd5b5035919050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b0381118282101715611328576113286112ea565b604052919050565b600082601f83011261134157600080fd5b81356001600160401b0381111561135a5761135a6112ea565b61136d601f8201601f1916602001611300565b81815284602083860101111561138257600080fd5b816020850160208301376000918101602001919091529392505050565b600080600080608085870312156113b557600080fd5b6113be85611164565b93506113cc60208601611164565b92506040850135915060608501356001600160401b038111156113ee57600080fd5b6113fa87828801611330565b91505092959194509250565b6000806040838503121561141957600080fd5b8235915061142960208401611164565b90509250929050565b634e487b7160e01b600052602160045260246000fd5b602081016004831061146a57634e487b7160e01b600052602160045260246000fd5b91905290565b60008083601f84011261148257600080fd5b5081356001600160401b0381111561149957600080fd5b6020830191508360208260051b85010111156111c157600080fd5b600080600080600080600080600060c08a8c0312156114d257600080fd5b89356001600160401b03808211156114e957600080fd5b6114f58d838e01611470565b909b50995060208c013591508082111561150e57600080fd5b61151a8d838e01611470565b909950975060408c013591508082111561153357600080fd5b506115408c828d01611470565b9a9d999c50979a969997986060880135976080810135975060a0013595509350505050565b60008060008060008060008060a0898b03121561158157600080fd5b88356001600160401b038082111561159857600080fd5b6115a48c838d01611470565b909a50985060208b01359150808211156115bd57600080fd5b6115c98c838d01611470565b909850965060408b01359150808211156115e257600080fd5b506115ef8b828c01611470565b999c989b509699959896976060870135966080013595509350505050565b600082601f83011261161e57600080fd5b813560206001600160401b03821115611639576116396112ea565b8160051b611648828201611300565b928352848101820192828101908785111561166257600080fd5b83870192505b8483101561168157823582529183019190830190611668565b979650505050505050565b600080600080600060a086880312156116a457600080fd5b6116ad86611164565b94506116bb60208701611164565b935060408601356001600160401b03808211156116d757600080fd5b6116e389838a0161160d565b945060608801359150808211156116f957600080fd5b61170589838a0161160d565b9350608088013591508082111561171b57600080fd5b5061172888828901611330565b9150509295509295909350565b600080600080600060a0868803121561174d57600080fd5b61175686611164565b945061176460208701611164565b9350604086013592506060860135915060808601356001600160401b0381111561178d57600080fd5b61172888828901611330565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b60018060a01b038716815285602082015260a0604082015260006117ea60a083018688611799565b60608301949094525060800152949350505050565b60018060a01b0385168152836020820152606060408201526000611827606083018486611799565b9695505050505050565b634e487b7160e01b600052603260045260246000fd5b60006020828403121561185957600080fd5b61087082611164565b6000808335601e1984360301811261187957600080fd5b8301803591506001600160401b0382111561189357600080fd5b6020019150368190038213156111c157600080fd5b634e487b7160e01b600052601160045260246000fd5b6000600182016118d0576118d06118a8565b5060010190565b81835260006020808501808196508560051b810191508460005b8781101561195b5782840389528135601e1988360301811261191257600080fd5b870185810190356001600160401b0381111561192d57600080fd5b80360382131561193c57600080fd5b611947868284611799565b9a87019a95505050908401906001016118f1565b5091979650505050505050565b60a0808252810188905260008960c08301825b8b8110156119a9576001600160a01b0361199484611164565b1682526020928301929091019060010161197b565b5083810360208501528881526001600160fb1b038911156119c957600080fd5b8860051b9150818a602083013701828103602090810160408501526119f190820187896118d7565b60608401959095525050608001529695505050505050565b808201808211156106bf576106bf6118a8565b818382376000910190815291905056fea2646970667358221220725e11fe22ce11e81db5a04c6b0028ace5a6d8c12cb61ad95d376ed3be9bba0b64736f6c63430008140033",
  "linkReferences": {},
  "deployedLinkReferences": {}
}

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/actions/swap.ts`:

```ts
import type { IAgentRuntime, Memory, State } from "@elizaos/core";
import {
    composeContext,
    generateObjectDeprecated,
    ModelClass,
    elizaLogger,
} from "@elizaos/core";
import {
    createConfig,
    executeRoute,
    type ExtendedChain,
    getRoutes,
    type Route,
} from "@lifi/sdk";

import { initWalletProvider, type WalletProvider } from "../providers/wallet";
import { swapTemplate } from "../templates";
import type { SwapParams, SwapQuote, Transaction } from "../types";
import {
    type Address,
    type ByteArray,
    encodeFunctionData,
    type Hex,
    parseAbi,
    parseUnits,
} from "viem";
import type { BebopRoute } from "../types/index";

export { swapTemplate };

export class SwapAction {
    private lifiConfig;
    private bebopChainsMap;

    constructor(private walletProvider: WalletProvider) {
        this.walletProvider = walletProvider;
        const lifiChains: ExtendedChain[] = [];
        for (const config of Object.values(this.walletProvider.chains)) {
            try {
                lifiChains.push({
                    id: config.id,
                    name: config.name,
                    key: config.name.toLowerCase(),
                    chainType: "EVM" as const,
                    nativeToken: {
                        ...config.nativeCurrency,
                        chainId: config.id,
                        address: "0x0000000000000000000000000000000000000000",
                        coinKey: config.nativeCurrency.symbol,
                        priceUSD: "0",
                        logoURI: "",
                        symbol: config.nativeCurrency.symbol,
                        decimals: config.nativeCurrency.decimals,
                        name: config.nativeCurrency.name,
                    },
                    rpcUrls: {
                        public: { http: [config.rpcUrls.default.http[0]] },
                    },
                    blockExplorerUrls: [config.blockExplorers.default.url],
                    metamask: {
                        chainId: `0x${config.id.toString(16)}`,
                        chainName: config.name,
                        nativeCurrency: config.nativeCurrency,
                        rpcUrls: [config.rpcUrls.default.http[0]],
                        blockExplorerUrls: [config.blockExplorers.default.url],
                    },
                    coin: config.nativeCurrency.symbol,
                    mainnet: true,
                    diamondAddress:
                        "0x0000000000000000000000000000000000000000",
                } as ExtendedChain);
            } catch {
                // Skip chains with missing config in viem
            }
        }
        this.lifiConfig = createConfig({
            integrator: "eliza",
            chains: lifiChains,
        });
        this.bebopChainsMap = {
            mainnet: "ethereum",
        };
    }

    async swap(params: SwapParams): Promise<Transaction> {
        const walletClient = this.walletProvider.getWalletClient(params.chain);
        const [fromAddress] = await walletClient.getAddresses();

        // Getting quotes from different aggregators and sorting them by minAmount (amount after slippage)
        const sortedQuotes: SwapQuote[] = await this.getSortedQuotes(
            fromAddress,
            params
        );

        // Trying to execute the best quote by amount, fallback to the next one if it fails
        for (const quote of sortedQuotes) {
            let res;
            switch (quote.aggregator) {
                case "lifi":
                    res = await this.executeLifiQuote(quote);
                    break;
                case "bebop":
                    res = await this.executeBebopQuote(quote, params);
                    break;
                default:
                    throw new Error("No aggregator found");
            }
            if (res !== undefined) return res;
        }
        throw new Error("Execution failed");
    }

    private async getSortedQuotes(
        fromAddress: Address,
        params: SwapParams
    ): Promise<SwapQuote[]> {
        const decimalsAbi = parseAbi([
            "function decimals() view returns (uint8)",
        ]);
        const decimals = await this.walletProvider
            .getPublicClient(params.chain)
            .readContract({
                address: params.fromToken,
                abi: decimalsAbi,
                functionName: "decimals",
            });
        const quotes: SwapQuote[] | undefined = await Promise.all([
            this.getLifiQuote(fromAddress, params, decimals),
            this.getBebopQuote(fromAddress, params, decimals),
        ]);
        const sortedQuotes: SwapQuote[] = quotes.filter(
            (quote) => quote !== undefined
        ) as SwapQuote[];
        sortedQuotes.sort((a, b) =>
            BigInt(a.minOutputAmount) > BigInt(b.minOutputAmount) ? -1 : 1
        );
        if (sortedQuotes.length === 0) throw new Error("No routes found");
        return sortedQuotes;
    }

    private async getLifiQuote(
        fromAddress: Address,
        params: SwapParams,
        fromTokenDecimals: number
    ): Promise<SwapQuote | undefined> {
        try {
            const routes = await getRoutes({
                fromChainId: this.walletProvider.getChainConfigs(params.chain)
                    .id,
                toChainId: this.walletProvider.getChainConfigs(params.chain).id,
                fromTokenAddress: params.fromToken,
                toTokenAddress: params.toToken,
                fromAmount: parseUnits(
                    params.amount,
                    fromTokenDecimals
                ).toString(),
                fromAddress: fromAddress,
                options: {
                    slippage: params.slippage / 100 || 0.005,
                    order: "RECOMMENDED",
                },
            });
            if (!routes.routes.length) throw new Error("No routes found");
            return {
                aggregator: "lifi",
                minOutputAmount: routes.routes[0].steps[0].estimate.toAmountMin,
                swapData: routes.routes[0],
            };
        } catch (error) {
            elizaLogger.error("Error in getLifiQuote:", error.message);
            return undefined;
        }
    }

    private async getBebopQuote(
        fromAddress: Address,
        params: SwapParams,
        fromTokenDecimals: number
    ): Promise<SwapQuote | undefined> {
        try {
            const url = `https://api.bebop.xyz/router/${this.bebopChainsMap[params.chain] ?? params.chain}/v1/quote`;
            const reqParams = new URLSearchParams({
                sell_tokens: params.fromToken,
                buy_tokens: params.toToken,
                sell_amounts: parseUnits(
                    params.amount,
                    fromTokenDecimals
                ).toString(),
                taker_address: fromAddress,
                approval_type: "Standard",
                skip_validation: "true",
                gasless: "false",
                source: "eliza",
            });
            const response = await fetch(`${url}?${reqParams.toString()}`, {
                method: "GET",
                headers: { accept: "application/json" },
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            const data = await response.json();
            const route: BebopRoute = {
                data: data.routes[0].quote.tx.data,
                sellAmount: parseUnits(
                    params.amount,
                    fromTokenDecimals
                ).toString(),
                approvalTarget: data.routes[0].quote
                    .approvalTarget as `0x${string}`,
                from: data.routes[0].quote.tx.from as `0x${string}`,
                value: data.routes[0].quote.tx.value.toString(),
                to: data.routes[0].quote.tx.to as `0x${string}`,
                gas: data.routes[0].quote.tx.gas.toString(),
                gasPrice: data.routes[0].quote.tx.gasPrice.toString(),
            };
            return {
                aggregator: "bebop",
                minOutputAmount:
                    data.routes[0].quote.buyTokens[
                        params.toToken
                    ].minimumAmount.toString(),
                swapData: route,
            };
        } catch (error) {
            elizaLogger.error("Error in getBebopQuote:", error.message);
            return undefined;
        }
    }

    private async executeLifiQuote(
        quote: SwapQuote
    ): Promise<Transaction | undefined> {
        try {
            const route: Route = quote.swapData as Route;
            const execution = await executeRoute(
                quote.swapData as Route,
                this.lifiConfig
            );
            const process = execution.steps[0]?.execution?.process[0];

            if (!process?.status || process.status === "FAILED") {
                throw new Error("Transaction failed");
            }
            return {
                hash: process.txHash as `0x${string}`,
                from: route.fromAddress! as `0x${string}`,
                to: route.steps[0].estimate.approvalAddress as `0x${string}`,
                value: 0n,
                data: process.data as `0x${string}`,
                chainId: route.fromChainId,
            };
        } catch (error) {
            elizaLogger.error(`Failed to execute lifi quote: ${error}`);
            return undefined;
        }
    }

    private async executeBebopQuote(
        quote: SwapQuote,
        params: SwapParams
    ): Promise<Transaction | undefined> {
        try {
            const bebopRoute: BebopRoute = quote.swapData as BebopRoute;
            const allowanceAbi = parseAbi([
                "function allowance(address,address) view returns (uint256)",
            ]);
            const allowance: bigint = await this.walletProvider
                .getPublicClient(params.chain)
                .readContract({
                    address: params.fromToken,
                    abi: allowanceAbi,
                    functionName: "allowance",
                    args: [bebopRoute.from, bebopRoute.approvalTarget],
                });
            if (allowance < BigInt(bebopRoute.sellAmount)) {
                const approvalData = encodeFunctionData({
                    abi: parseAbi(["function approve(address,uint256)"]),
                    functionName: "approve",
                    args: [
                        bebopRoute.approvalTarget,
                        BigInt(bebopRoute.sellAmount),
                    ],
                });
                await this.walletProvider
                    .getWalletClient(params.chain)
                    .sendTransaction({
                        account: this.walletProvider.getWalletClient(
                            params.chain
                        ).account,
                        to: params.fromToken,
                        value: 0n,
                        data: approvalData,
                        kzg: {
                            blobToKzgCommitment: (
                                _: ByteArray
                            ): ByteArray => {
                                throw new Error("Function not implemented.");
                            },
                            computeBlobKzgProof: (
                                _blob: ByteArray,
                                _commitment: ByteArray
                            ): ByteArray => {
                                throw new Error("Function not implemented.");
                            },
                        },
                        chain: undefined,
                    });
            }
            const hash = await this.walletProvider
                .getWalletClient(params.chain)
                .sendTransaction({
                    account: this.walletProvider.getWalletClient(params.chain)
                        .account,
                    to: bebopRoute.to,
                    value: BigInt(bebopRoute.value),
                    data: bebopRoute.data as Hex,
                    kzg: {
                        blobToKzgCommitment: (
                            _: ByteArray
                        ): ByteArray => {
                            throw new Error("Function not implemented.");
                        },
                        computeBlobKzgProof: (
                            _blob: ByteArray,
                            _commitment: ByteArray
                        ): ByteArray => {
                            throw new Error("Function not implemented.");
                        },
                    },
                    chain: undefined,
                });
            return {
                hash,
                from: this.walletProvider.getWalletClient(params.chain).account
                    .address,
                to: bebopRoute.to,
                value: BigInt(bebopRoute.value),
                data: bebopRoute.data as Hex,
            };
        } catch (error) {
            elizaLogger.error(`Failed to execute bebop quote: ${error}`);
            return undefined;
        }
    }
}

export const swapAction = {
    name: "swap",
    description: "Swap tokens on the same chain",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: any,
        callback?: any
    ) => {
        elizaLogger.log("Swap action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const action = new SwapAction(walletProvider);

        // Compose swap context
        const swapContext = composeContext({
            state,
            template: swapTemplate,
        });
        const content = await generateObjectDeprecated({
            runtime,
            context: swapContext,
            modelClass: ModelClass.LARGE,
        });

        const swapOptions: SwapParams = {
            chain: content.chain,
            fromToken: content.inputToken,
            toToken: content.outputToken,
            amount: content.amount,
            slippage: content.slippage,
        };

        try {
            const swapResp = await action.swap(swapOptions);
            if (callback) {
                callback({
                    text: `Successfully swap ${swapOptions.amount} ${swapOptions.fromToken} tokens to ${swapOptions.toToken}\nTransaction Hash: ${swapResp.hash}`,
                    content: {
                        success: true,
                        hash: swapResp.hash,
                        recipient: swapResp.to,
                        chain: content.chain,
                    },
                });
            }
            return true;
        } catch (error) {
            elizaLogger.error("Error in swap handler:", error.message);
            if (callback) {
                callback({ text: `Error: ${error.message}` });
            }
            return false;
        }
    },
    template: swapTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Swap 1 ETH for USDC on Base",
                    action: "TOKEN_SWAP",
                },
            },
        ],
    ],
    similes: ["TOKEN_SWAP", "EXCHANGE_TOKENS", "TRADE_TOKENS"],
}; // TODO: add more examples

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/actions/bridge.ts`:

```ts
import type { IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";
import {
    composeContext,
    generateObjectDeprecated,
    ModelClass,
} from "@elizaos/core";
import {
    createConfig,
    executeRoute,
    type ExtendedChain,
    getRoutes,
} from "@lifi/sdk";

import { initWalletProvider, type WalletProvider } from "../providers/wallet";
import { bridgeTemplate } from "../templates";
import type { BridgeParams, Transaction } from "../types";
import { parseEther } from "viem";

export { bridgeTemplate };

export class BridgeAction {
    private config;

    constructor(private walletProvider: WalletProvider) {
        this.config = createConfig({
            integrator: "eliza",
            chains: Object.values(this.walletProvider.chains).map((config) => ({
                id: config.id,
                name: config.name,
                key: config.name.toLowerCase(),
                chainType: "EVM",
                nativeToken: {
                    ...config.nativeCurrency,
                    chainId: config.id,
                    address: "0x0000000000000000000000000000000000000000",
                    coinKey: config.nativeCurrency.symbol,
                },
                metamask: {
                    chainId: `0x${config.id.toString(16)}`,
                    chainName: config.name,
                    nativeCurrency: config.nativeCurrency,
                    rpcUrls: [config.rpcUrls.default.http[0]],
                    blockExplorerUrls: [config.blockExplorers.default.url],
                },
                diamondAddress: "0x0000000000000000000000000000000000000000",
                coin: config.nativeCurrency.symbol,
                mainnet: true,
            })) as ExtendedChain[],
        });
    }

    async bridge(params: BridgeParams): Promise<Transaction> {
        const walletClient = this.walletProvider.getWalletClient(
            params.fromChain
        );
        const [fromAddress] = await walletClient.getAddresses();

        const routes = await getRoutes({
            fromChainId: this.walletProvider.getChainConfigs(params.fromChain)
                .id,
            toChainId: this.walletProvider.getChainConfigs(params.toChain).id,
            fromTokenAddress: params.fromToken,
            toTokenAddress: params.toToken,
            fromAmount: parseEther(params.amount).toString(),
            fromAddress: fromAddress,
            toAddress: params.toAddress || fromAddress,
        });

        if (!routes.routes.length) throw new Error("No routes found");

        const execution = await executeRoute(routes.routes[0], this.config);
        const process = execution.steps[0]?.execution?.process[0];

        if (!process?.status || process.status === "FAILED") {
            throw new Error("Transaction failed");
        }

        return {
            hash: process.txHash as `0x${string}`,
            from: fromAddress,
            to: routes.routes[0].steps[0].estimate
                .approvalAddress as `0x${string}`,
            value: BigInt(params.amount),
            chainId: this.walletProvider.getChainConfigs(params.fromChain).id,
        };
    }
}

export const bridgeAction = {
    name: "bridge",
    description: "Bridge tokens between different chains",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: Record<string, unknown>,
        callback?: HandlerCallback
    ) => {
        console.log("Bridge action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const action = new BridgeAction(walletProvider);

        // Compose bridge context
        const bridgeContext = composeContext({
            state,
            template: bridgeTemplate,
        });
        const content = await generateObjectDeprecated({
            runtime,
            context: bridgeContext,
            modelClass: ModelClass.LARGE,
        });

        const bridgeOptions: BridgeParams = {
            fromChain: content.fromChain,
            toChain: content.toChain,
            fromToken: content.token,
            toToken: content.token,
            toAddress: content.toAddress,
            amount: content.amount,
        };

        try {
            const bridgeResp = await action.bridge(bridgeOptions);
            if (callback) {
                callback({
                    text: `Successfully bridge ${bridgeOptions.amount} ${bridgeOptions.fromToken} tokens from ${bridgeOptions.fromChain} to ${bridgeOptions.toChain}\nTransaction Hash: ${bridgeResp.hash}`,
                    content: {
                        success: true,
                        hash: bridgeResp.hash,
                        recipient: bridgeResp.to,
                        chain: bridgeOptions.fromChain,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error in bridge handler:", error.message);
            if (callback) {
                callback({ text: `Error: ${error.message}` });
            }
            return false;
        }
    },
    template: bridgeTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Bridge 1 ETH from Ethereum to Base",
                    action: "CROSS_CHAIN_TRANSFER",
                },
            },
        ],
    ],
    similes: ["CROSS_CHAIN_TRANSFER", "CHAIN_BRIDGE", "MOVE_CROSS_CHAIN"],
}; // TODO: add more examples / similies

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/actions/gov-execute.ts`:

```ts
import type { IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";
import { WalletProvider } from "../providers/wallet";
import { executeProposalTemplate } from "../templates";
import type { ExecuteProposalParams, SupportedChain, Transaction } from "../types";
import governorArtifacts from "../contracts/artifacts/OZGovernor.json";
import {
    type ByteArray,
    type Hex,
    type Address,
    encodeFunctionData,
    keccak256,
    stringToHex,
} from "viem";

export { executeProposalTemplate };

export class ExecuteAction {
    constructor(private walletProvider: WalletProvider) {
        this.walletProvider = walletProvider;
    }

    async execute(params: ExecuteProposalParams): Promise<Transaction> {
        const walletClient = this.walletProvider.getWalletClient(params.chain);

        const descriptionHash = keccak256(stringToHex(params.description));

        const txData = encodeFunctionData({
            abi: governorArtifacts.abi,
            functionName: "execute",
            args: [
                params.targets,
                params.values,
                params.calldatas,
                descriptionHash,
            ],
        });

        try {
            const chainConfig = this.walletProvider.getChainConfigs(
                params.chain
            );

            // Log current block before sending transaction
            const publicClient = this.walletProvider.getPublicClient(
                params.chain
            );

            const hash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: params.governor,
                value: BigInt(0),
                data: txData as Hex,
                chain: chainConfig,
                kzg: {
                    blobToKzgCommitment: (_blob: ByteArray): ByteArray => {
                        throw new Error("Function not implemented.");
                    },
                    computeBlobKzgProof: (
                        _blob: ByteArray,
                        _commitment: ByteArray
                    ): ByteArray => {
                        throw new Error("Function not implemented.");
                    },
                },
            });

            const receipt = await publicClient.waitForTransactionReceipt({
                hash,
            });

            return {
                hash,
                from: walletClient.account.address,
                to: params.governor,
                value: BigInt(0),
                data: txData as Hex,
                chainId: this.walletProvider.getChainConfigs(params.chain).id,
                logs: receipt.logs,
            };
        } catch (error) {
            throw new Error(`Vote failed: ${error.message}`);
        }
    }
}

export const executeAction = {
    name: "execute",
    description: "Execute a DAO governance proposal",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        options: Record<string, unknown>,
        callback?: HandlerCallback
    ) => {
        try {
            // Validate required fields
            if (!options.chain || !options.governor || !options.proposalId || 
                !options.targets || !options.values || !options.calldatas || !options.description) {
                throw new Error("Missing required parameters for execute proposal");
            }

            // Convert options to ExecuteProposalParams
            const executeParams: ExecuteProposalParams = {
                chain: options.chain as SupportedChain,
                governor: options.governor as Address,
                proposalId: String(options.proposalId),
                targets: options.targets as Address[],
                values: (options.values as string[]).map(v => BigInt(v)),
                calldatas: options.calldatas as `0x${string}`[],
                description: String(options.description)
            };

            const privateKey = runtime.getSetting(
                "EVM_PRIVATE_KEY"
            ) as `0x${string}`;
            const walletProvider = new WalletProvider(
                privateKey,
                runtime.cacheManager
            );
            const action = new ExecuteAction(walletProvider);
            return await action.execute(executeParams);
        } catch (error) {
            console.error("Error in execute handler:", error.message);
            if (callback) {
                callback({ text: `Error: ${error.message}` });
            }
            return false;
        }
    },
    template: executeProposalTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Execute proposal 123 on the governor at 0x1234567890123456789012345678901234567890 on Ethereum",
                    action: "EXECUTE_PROPOSAL",
                },
            },
        ],
    ],
    similes: ["EXECUTE_PROPOSAL", "GOVERNANCE_EXECUTE"],
}; // TODO: add more examples

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/actions/gov-propose.ts`:

```ts
import type { IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";
import { WalletProvider } from "../providers/wallet";
import { proposeTemplate } from "../templates";
import type { ProposeProposalParams, SupportedChain, Transaction } from "../types";
import governorArtifacts from "../contracts/artifacts/OZGovernor.json";
import {
    type ByteArray,
    type Hex,
    encodeFunctionData,
    type Address,
} from "viem";

export { proposeTemplate };

export class ProposeAction {
    constructor(private walletProvider: WalletProvider) {
        this.walletProvider = walletProvider;
    }

    async propose(params: ProposeProposalParams): Promise<Transaction> {
        const walletClient = this.walletProvider.getWalletClient(params.chain);

        const txData = encodeFunctionData({
            abi: governorArtifacts.abi,
            functionName: "propose",
            args: [
                params.targets,
                params.values,
                params.calldatas,
                params.description,
            ],
        });

        try {
            const chainConfig = this.walletProvider.getChainConfigs(
                params.chain
            );

            // Log current block before sending transaction
            const publicClient = this.walletProvider.getPublicClient(
                params.chain
            );

            const hash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: params.governor,
                value: BigInt(0),
                data: txData as Hex,
                chain: chainConfig,
                kzg: {
                    blobToKzgCommitment: (_blob: ByteArray): ByteArray => {
                        throw new Error("Function not implemented.");
                    },
                    computeBlobKzgProof: (
                        _blob: ByteArray,
                        _commitment: ByteArray
                    ): ByteArray => {
                        throw new Error("Function not implemented.");
                    },
                },
            });

            const receipt = await publicClient.waitForTransactionReceipt({
                hash,
            });

            return {
                hash,
                from: walletClient.account.address,
                to: params.governor,
                value: BigInt(0),
                data: txData as Hex,
                chainId: this.walletProvider.getChainConfigs(params.chain).id,
                logs: receipt.logs,
            };
        } catch (error) {
            throw new Error(`Vote failed: ${error.message}`);
        }
    }
}

export const proposeAction = {
    name: "propose",
    description: "Execute a DAO governance proposal",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        options: Record<string, unknown>,
        callback?: HandlerCallback
    ) => {
        try {
            // Validate required fields
            if (!options.chain || !options.governor || 
                !options.targets || !options.values || 
                !options.calldatas || !options.description) {
                throw new Error("Missing required parameters for proposal");
            }

            // Convert options to ProposeProposalParams
            const proposeParams: ProposeProposalParams = {
                chain: options.chain as SupportedChain,
                governor: options.governor as Address,
                targets: options.targets as Address[],
                values: (options.values as string[]).map(v => BigInt(v)),
                calldatas: options.calldatas as `0x${string}`[],
                description: String(options.description)
            };

            const privateKey = runtime.getSetting(
                "EVM_PRIVATE_KEY"
            ) as `0x${string}`;
            const walletProvider = new WalletProvider(privateKey, runtime.cacheManager);
            const action = new ProposeAction(walletProvider);
            return await action.propose(proposeParams);
        } catch (error) {
            console.error("Error in propose handler:", error.message);
            if (callback) {
                callback({ text: `Error: ${error.message}` });
            }
            return false;
        }
    },
    template: proposeTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Propose transferring 1e18 tokens on the governor at 0x1234567890123456789012345678901234567890 on Ethereum",
                    action: "PROPOSE",
                },
            },
        ],
    ],
    similes: ["PROPOSE", "GOVERNANCE_PROPOSE"],
}; // TODO: add more examples

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/actions/gov-vote.ts`:

```ts
import type { IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";
import { WalletProvider } from "../providers/wallet";
import { voteTemplate } from "../templates";
import type { VoteParams, SupportedChain, Transaction } from "../types";
import governorArtifacts from "../contracts/artifacts/OZGovernor.json";
import { type ByteArray, type Hex, encodeFunctionData, type Address } from "viem";

export { voteTemplate };

export class VoteAction {
    constructor(private walletProvider: WalletProvider) {
        this.walletProvider = walletProvider;
    }

    async vote(params: VoteParams): Promise<Transaction> {
        const walletClient = this.walletProvider.getWalletClient(params.chain);

        const proposalId = BigInt(params.proposalId.toString());
        const support = BigInt(params.support.toString());

        const txData = encodeFunctionData({
            abi: governorArtifacts.abi,
            functionName: "castVote",
            args: [proposalId, support],
        });

        try {
            const chainConfig = this.walletProvider.getChainConfigs(
                params.chain
            );

            // Log current block before sending transaction
            const publicClient = this.walletProvider.getPublicClient(
                params.chain
            );

            const hash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: params.governor,
                value: BigInt(0),
                data: txData as Hex,
                chain: chainConfig,
                kzg: {
                    blobToKzgCommitment: (_blob: ByteArray): ByteArray => {
                        throw new Error("Function not implemented.");
                    },
                    computeBlobKzgProof: (
                        _blob: ByteArray,
                        _commitment: ByteArray
                    ): ByteArray => {
                        throw new Error("Function not implemented.");
                    },
                },
            });

            const receipt = await publicClient.waitForTransactionReceipt({
                hash,
            });

            return {
                hash,
                from: walletClient.account.address,
                to: params.governor,
                value: BigInt(0),
                data: txData as Hex,
                chainId: this.walletProvider.getChainConfigs(params.chain).id,
                logs: receipt.logs,
            };
        } catch (error) {
            throw new Error(`Vote failed: ${error.message}`);
        }
    }
}

export const voteAction = {
    name: "vote",
    description: "Vote for a DAO governance proposal",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        options: Record<string, unknown>,
        callback?: HandlerCallback
    ) => {
        try {
            // Validate required fields
            if (!options.chain || !options.governor || 
                !options.proposalId || !options.support) {
                throw new Error("Missing required parameters for vote");
            }

            // Convert options to VoteParams
            const voteParams: VoteParams = {
                chain: options.chain as SupportedChain,
                governor: options.governor as Address,
                proposalId: String(options.proposalId),
                support: Number(options.support)
            };

            const privateKey = runtime.getSetting(
                "EVM_PRIVATE_KEY"
            ) as `0x${string}`;
            const walletProvider = new WalletProvider(privateKey, runtime.cacheManager);
            const action = new VoteAction(walletProvider);
            return await action.vote(voteParams);
        } catch (error) {
            console.error("Error in vote handler:", error.message);
            if (callback) {
                callback({ text: `Error: ${error.message}` });
            }
            return false;
        }
    },
    template: voteTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Vote yes on proposal 123 on the governor at 0x1234567890123456789012345678901234567890 on Ethereum",
                    action: "GOVERNANCE_VOTE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Vote no on proposal 456 on the governor at 0xabcdef1111111111111111111111111111111111 on Ethereum",
                    action: "GOVERNANCE_VOTE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Abstain from voting on proposal 789 on the governor at 0x0000111122223333444455556666777788889999 on Ethereum",
                    action: "GOVERNANCE_VOTE",
                },
            },
        ],
    ],
    similes: ["VOTE", "GOVERNANCE_VOTE", "CAST_VOTE"],
}; // TODO: add more examples

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/actions/transfer.ts`:

```ts
import { type ByteArray, formatEther, parseEther, type Hex } from "viem";
import {
    type Action,
    composeContext,
    generateObjectDeprecated,
    type HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";

import { initWalletProvider, type WalletProvider } from "../providers/wallet";
import type { Transaction, TransferParams } from "../types";
import { transferTemplate } from "../templates";

// Exported for tests
export class TransferAction {
    constructor(private walletProvider: WalletProvider) {}

    async transfer(params: TransferParams): Promise<Transaction> {
        console.log(
            `Transferring: ${params.amount} tokens to (${params.toAddress} on ${params.fromChain})`
        );

        if (!params.data) {
            params.data = "0x";
        }

        this.walletProvider.switchChain(params.fromChain);

        const walletClient = this.walletProvider.getWalletClient(
            params.fromChain
        );

        try {
            const hash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: params.toAddress,
                value: parseEther(params.amount),
                data: params.data as Hex,
                kzg: {
                    blobToKzgCommitment: (_: ByteArray): ByteArray => {
                        throw new Error("Function not implemented.");
                    },
                    computeBlobKzgProof: (
                        _blob: ByteArray,
                        _commitment: ByteArray
                    ): ByteArray => {
                        throw new Error("Function not implemented.");
                    },
                },
                chain: undefined,
            });

            return {
                hash,
                from: walletClient.account.address,
                to: params.toAddress,
                value: parseEther(params.amount),
                data: params.data as Hex,
            };
        } catch (error) {
            throw new Error(`Transfer failed: ${error.message}`);
        }
    }
}

const buildTransferDetails = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<TransferParams> => {
    const chains = Object.keys(wp.chains);
    state.supportedChains = chains.map((item) => `"${item}"`).join("|");

    const context = composeContext({
        state,
        template: transferTemplate,
    });

    const transferDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as TransferParams;

    const existingChain = wp.chains[transferDetails.fromChain];

    if (!existingChain) {
        throw new Error(
            "The chain " +
                transferDetails.fromChain +
                " not configured yet. Add the chain or choose one from configured: " +
                chains.toString()
        );
    }

    return transferDetails;
};

export const transferAction: Action = {
    name: "transfer",
    description: "Transfer tokens between addresses on the same chain",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: any,
        callback?: HandlerCallback
    ) => {
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        console.log("Transfer action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const action = new TransferAction(walletProvider);

        // Compose transfer context
        const paramOptions = await buildTransferDetails(
            state,
            runtime,
            walletProvider
        );

        try {
            const transferResp = await action.transfer(paramOptions);
            if (callback) {
                callback({
                    text: `Successfully transferred ${paramOptions.amount} tokens to ${paramOptions.toAddress}\nTransaction Hash: ${transferResp.hash}`,
                    content: {
                        success: true,
                        hash: transferResp.hash,
                        amount: formatEther(transferResp.value),
                        recipient: transferResp.to,
                        chain: paramOptions.fromChain,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error during token transfer:", error);
            if (callback) {
                callback({
                    text: `Error transferring tokens: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you transfer 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    action: "SEND_TOKENS",
                },
            },
            {
                user: "user",
                content: {
                    text: "Transfer 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    action: "SEND_TOKENS",
                },
            },
        ],
    ],
    similes: ["SEND_TOKENS", "TOKEN_TRANSFER", "MOVE_TOKENS"],
};

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/actions/gov-queue.ts`:

```ts
import type { IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";
import { WalletProvider } from "../providers/wallet";
import { queueProposalTemplate } from "../templates";
import type { QueueProposalParams, SupportedChain, Transaction } from "../types";
import governorArtifacts from "../contracts/artifacts/OZGovernor.json";
import {
    type ByteArray,
    type Hex,
    encodeFunctionData,
    keccak256,
    stringToHex,
    type Address,
} from "viem";

export { queueProposalTemplate };

export class QueueAction {
    constructor(private walletProvider: WalletProvider) {
        this.walletProvider = walletProvider;
    }

    async queue(params: QueueProposalParams): Promise<Transaction> {
        const walletClient = this.walletProvider.getWalletClient(params.chain);

        const descriptionHash = keccak256(stringToHex(params.description));

        const txData = encodeFunctionData({
            abi: governorArtifacts.abi,
            functionName: "queue",
            args: [
                params.targets,
                params.values,
                params.calldatas,
                descriptionHash,
            ],
        });

        try {
            const chainConfig = this.walletProvider.getChainConfigs(
                params.chain
            );

            // Log current block before sending transaction
            const publicClient = this.walletProvider.getPublicClient(
                params.chain
            );

            const hash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: params.governor,
                value: BigInt(0),
                data: txData as Hex,
                chain: chainConfig,
                kzg: {
                    blobToKzgCommitment: (_blob: ByteArray): ByteArray => {
                        throw new Error("Function not implemented.");
                    },
                    computeBlobKzgProof: (
                        _blob: ByteArray,
                        _commitment: ByteArray
                    ): ByteArray => {
                        throw new Error("Function not implemented.");
                    },
                },
            });

            const receipt = await publicClient.waitForTransactionReceipt({
                hash,
            });

            return {
                hash,
                from: walletClient.account.address,
                to: params.governor,
                value: BigInt(0),
                data: txData as Hex,
                chainId: this.walletProvider.getChainConfigs(params.chain).id,
                logs: receipt.logs,
            };
        } catch (error) {
            throw new Error(`Vote failed: ${error.message}`);
        }
    }
}

export const queueAction = {
    name: "queue",
    description: "Queue a DAO governance proposal for execution",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        options: Record<string, unknown>,
        callback?: HandlerCallback
    ) => {
        try {
            // Validate required fields
            if (!options.chain || !options.governor || 
                !options.targets || !options.values || 
                !options.calldatas || !options.description) {
                throw new Error("Missing required parameters for queue proposal");
            }

            // Convert options to QueueProposalParams
            const queueParams: QueueProposalParams = {
                chain: options.chain as SupportedChain,
                governor: options.governor as Address,
                targets: options.targets as Address[],
                values: (options.values as string[]).map(v => BigInt(v)),
                calldatas: options.calldatas as `0x${string}`[],
                description: String(options.description)
            };

            const privateKey = runtime.getSetting(
                "EVM_PRIVATE_KEY"
            ) as `0x${string}`;
            const walletProvider = new WalletProvider(privateKey, runtime.cacheManager);
            const action = new QueueAction(walletProvider);
            return await action.queue(queueParams);
        } catch (error) {
            console.error("Error in queue handler:", error.message);
            if (callback) {
                callback({ text: `Error: ${error.message}` });
            }
            return false;
        }
    },
    template: queueProposalTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Queue proposal 123 on the governor at 0x1234567890123456789012345678901234567890 on Ethereum",
                    action: "QUEUE_PROPOSAL",
                },
            },
        ],
    ],
    similes: ["QUEUE_PROPOSAL", "GOVERNANCE_QUEUE"],
}; // TODO: add more examples

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/tests/gov.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { generatePrivateKey } from "viem/accounts";
import {
    type Address,
    type Chain,
    encodeFunctionData,
    getContract,
    type Hash,
    type PublicClient,
    type TestClient,
    type WalletClient,
    decodeEventLog,
    keccak256,
    stringToHex,
    encodeAbiParameters,
} from "viem";

import { VoteAction } from "../actions/gov-vote";
import { WalletProvider } from "../providers/wallet";
import governorArtifacts from "../contracts/artifacts/OZGovernor.json";
import voteTokenArtifacts from "../contracts/artifacts/VoteToken.json";
import timelockArtifacts from "../contracts/artifacts/TimelockController.json";
import { QueueAction } from "../actions/gov-queue";
import type { Proposal } from "../types";
import { ExecuteAction } from "../actions/gov-execute";
import { ProposeAction } from "../actions/gov-propose";

export interface ProposalParams extends Proposal {
    governor?: string;
    timelock?: string;
    proposalId?: string;
}

type ContractTransaction = {
    to: Address;
    data: `0x${string}`;
};

export const buildProposal = (
    txs: Array<ContractTransaction>,
    description: string
): Proposal => {
    const targets = txs.map((tx: ContractTransaction) => tx.to!);
    const values = txs.map(() => BigInt(0));
    const calldatas = txs.map((tx: ContractTransaction) => tx.data!);
    return {
        targets,
        values,
        calldatas,
        description,
    };
};

describe("Vote Action", () => {
    const alice: Address = "0xa1Ce000000000000000000000000000000000000";
    let wp: WalletProvider;
    let wc: WalletClient;
    let tc: TestClient;
    let pc: PublicClient;
    let voteTokenAddress: Address;
    let timelockAddress: Address;
    let governorAddress: Address;
    let voteToken;
    let timelock;
    let governor;

    async function getDeployedAddress(hash: `0x${string}`) {
        const receipt = await pc.waitForTransactionReceipt({
            hash,
        });
        return receipt.contractAddress;
    }

    beforeEach(async () => {
        const pk = generatePrivateKey();
        const customChains = prepareChains();
        wp = new WalletProvider(pk, customChains);
        wc = wp.getWalletClient("hardhat");
        const account = wc.account;
        tc = wp.getTestClient();
        pc = wp.getPublicClient("hardhat");

        // Add this to fund the account
        await tc.setBalance({
            address: account.address,
            value: 10000000000000000000000n, // 10,000 ETH
        });

        const voteTokenDeployHash: Hash = await tc.deployContract({
            chain: customChains["hardhat"],
            account: account,
            abi: voteTokenArtifacts.abi,
            bytecode: voteTokenArtifacts.bytecode as `0x${string}`,
            args: ["Test Token", "TEST"],
            gas: 5000000n,
        });

        const timelockDeployHash: Hash = await tc.deployContract({
            chain: customChains["hardhat"],
            account: account,
            abi: timelockArtifacts.abi,
            bytecode: timelockArtifacts.bytecode as `0x${string}`,
            args: [1, [], [], account.address],
        });

        // Get the addresses from deployment hashes
        voteTokenAddress = await getDeployedAddress(voteTokenDeployHash);
        timelockAddress = await getDeployedAddress(timelockDeployHash);

        const governorDeployHash: Hash = await tc.deployContract({
            chain: customChains["hardhat"],
            account: account,
            abi: governorArtifacts.abi,
            bytecode: governorArtifacts.bytecode as `0x${string}`,
            args: [voteTokenAddress, timelockAddress, 0, 86400, 1, 1],
        });

        governorAddress = await getDeployedAddress(governorDeployHash);

        voteToken = getContract({
            address: voteTokenAddress,
            abi: voteTokenArtifacts.abi,
            client: wc,
        });
        timelock = getContract({
            address: timelockAddress,
            abi: timelockArtifacts.abi,
            client: wc,
        });
        governor = getContract({
            address: governorAddress,
            abi: governorArtifacts.abi,
            client: wc,
        });
        const proposerRole = await timelock.read.PROPOSER_ROLE();
        await timelock.write.grantRole([proposerRole, governor.address]);
        const executorRole = await timelock.read.EXECUTOR_ROLE();
        await timelock.write.grantRole([executorRole, governor.address]);
    });
    describe("Constructor", () => {
        it("should initialize with wallet provider", () => {
            const va = new VoteAction(wp);

            expect(va).toBeDefined();
        });
    });
    describe("Vote", () => {
        let va: VoteAction;
        let proposalId: string;
        let proposal: ProposalParams;

        beforeEach(async () => {
            va = new VoteAction(wp);

            // mint 1B tokens to alice
            await voteToken.write.mint([wc.account.address, BigInt(10 ** 27)]);
            await voteToken.write.mint([timelockAddress, BigInt(10 ** 18)]);
            await voteToken.write.delegate([wc.account.address]);
            await tc.mine({
                blocks: 100,
                interval: 12, // This will advance time by 1200 seconds (12 seconds per block)
            });
            const data = encodeFunctionData({
                abi: voteTokenArtifacts.abi,
                functionName: "transfer",
                args: [alice, BigInt(10 ** 18)],
            });
            const description = "test proposal, transfer some token";
            proposal = buildProposal(
                [
                    {
                        to: voteToken.address,
                        data: data,
                    },
                ],
                description
            );
            const hash = await governor.write.propose([
                proposal.targets,
                proposal.values,
                proposal.calldatas,
                proposal.description,
            ]);
            const receipt = await pc.waitForTransactionReceipt({ hash });
            proposalId = getProposalId(receipt.logs);

            // Add this to move the chain forward
            await tc.mine({
                blocks: 100,
                interval: 12, // This will advance time by 1200 seconds (12 seconds per block)
            });
        });

        it("Proposes a proposal", async () => {
            const pa = new ProposeAction(wp);
            const description = "other test proposal";
            const result = await pa.propose({
                chain: "hardhat",
                governor: governor.address as `0x${string}`,
                targets: proposal.targets,
                values: proposal.values,
                calldatas: proposal.calldatas,
                description: description,
            });
            const pid = getProposalId(result.logs);
            const state = await governor.read.state([pid]);
            expect(state).equals(0);
        });

        it("Votes no on a proposal", async () => {
            await va.vote({
                chain: "hardhat",
                governor: governor.address as `0x${string}`,
                proposalId: proposalId,
                support: 0,
            });

            const votes = await governor.read.proposalVotes([proposalId]);
            expect(votes[0]).equals(
                await voteToken.read.balanceOf([wc.account.address])
            );
            expect(votes[1]).equals(BigInt(0));
            expect(votes[2]).equals(BigInt(0));
        });

        it("Votes yes on a proposal", async () => {
            await va.vote({
                chain: "hardhat",
                governor: governor.address as `0x${string}`,
                proposalId: proposalId,
                support: 1,
            });

            const votes = await governor.read.proposalVotes([proposalId]);
            expect(votes[0]).equals(BigInt(0));
            expect(votes[1]).equals(
                await voteToken.read.balanceOf([wc.account.address])
            );
            expect(votes[2]).equals(BigInt(0));
        });

        it("Abstains on a proposal", async () => {
            await va.vote({
                chain: "hardhat",
                governor: governor.address as `0x${string}`,
                proposalId: proposalId,
                support: 2,
            });

            const votes = await governor.read.proposalVotes([proposalId]);
            expect(votes[0]).equals(BigInt(0));
            expect(votes[1]).equals(BigInt(0));
            expect(votes[2]).equals(
                await voteToken.read.balanceOf([wc.account.address])
            );
        });

        it("Queues a proposal", async () => {
            const qa = new QueueAction(wp);

            await va.vote({
                chain: "hardhat",
                governor: governor.address as `0x${string}`,
                proposalId: proposalId,
                support: 1,
            });

            await tc.mine({
                blocks: 86400 / 12 + 1,
                interval: 12,
            });

            const state = await governor.read.state([proposalId]);
            console.log("state", state);

            await qa.queue({
                chain: "hardhat",
                governor: governor.address as `0x${string}`,
                targets: proposal.targets,
                values: proposal.values,
                calldatas: proposal.calldatas,
                description: proposal.description,
            });

            const descriptionHash = keccak256(
                stringToHex(proposal.description)
            );
            const salt = await governor.read.timelockSalt([descriptionHash]);
            const timelockProposalId = keccak256(
                encodeAbiParameters(
                    [
                        { type: "address[]", name: "targets" },
                        { type: "uint256[]", name: "values" },
                        { type: "bytes[]", name: "payloads" },
                        { type: "bytes32", name: "predecessor" },
                        { type: "bytes32", name: "salt" },
                    ],
                    [
                        proposal.targets,
                        proposal.values,
                        proposal.calldatas,
                        "0x0000000000000000000000000000000000000000000000000000000000000000",
                        salt,
                    ]
                )
            );
            const queued = await timelock.read.isOperationPending([
                timelockProposalId,
            ]);
            expect(queued).toBe(true);
        });

        it("Executes a proposal", async () => {
            const qa = new QueueAction(wp);
            const ea = new ExecuteAction(wp);

            await va.vote({
                chain: "hardhat",
                governor: governor.address as `0x${string}`,
                proposalId: proposalId,
                support: 1,
            });

            await tc.mine({
                blocks: 86400 / 12 + 1,
                interval: 12,
            });

            const state = await governor.read.state([proposalId]);
            console.log("state", state);

            await qa.queue({
                chain: "hardhat",
                governor: governor.address as `0x${string}`,
                targets: proposal.targets,
                values: proposal.values,
                calldatas: proposal.calldatas,
                description: proposal.description,
            });

            const aliceBalance = await voteToken.read.balanceOf([alice]);
            const timelockBalance = await voteToken.read.balanceOf([
                timelockAddress,
            ]);

            await ea.execute({
                chain: "hardhat",
                governor: governor.address as `0x${string}`,
                proposalId: proposalId,
                targets: proposal.targets,
                values: proposal.values,
                calldatas: proposal.calldatas,
                description: proposal.description,
            });

            const aliceBalanceAfter = await voteToken.read.balanceOf([alice]);
            const timelockBalanceAfter = await voteToken.read.balanceOf([
                timelockAddress,
            ]);
            expect(aliceBalanceAfter).equals(aliceBalance + BigInt(10 ** 18));
            expect(timelockBalanceAfter).equals(
                timelockBalance - BigInt(10 ** 18)
            );
        });
    });
});

const prepareChains = () => {
    const customChains: Record<string, Chain> = {};
    const chainNames = ["hardhat"];
    chainNames.forEach(
        (chain) =>
            (customChains[chain] = WalletProvider.genChainFromName(
                chain,
                "http://localhost:8545"
            ))
    );

    return customChains;
};

// Function to get proposal ID from transaction receipt
const getProposalId = (logs: any) => {
    const proposalCreatedLog = logs.find((log: any) => {
        try {
            const event = decodeEventLog({
                abi: governorArtifacts.abi,
                data: log.data,
                topics: log.topics,
            });
            return event.eventName === "ProposalCreated";
        } catch {
            return false;
        }
    });

    if (!proposalCreatedLog) {
        throw new Error("ProposalCreated event not found in logs");
    }

    const event = decodeEventLog({
        abi: governorArtifacts.abi,
        data: proposalCreatedLog.data,
        topics: proposalCreatedLog.topics,
    });

    return event.args.proposalId;
};

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/tests/wallet.test.ts`:

```ts
import {
    describe,
    it,
    expect,
    beforeAll,
    beforeEach,
    vi,
    afterEach,
} from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet, iotex, arbitrum, type Chain } from "viem/chains";

import { WalletProvider } from "../providers/wallet";

const customRpcUrls = {
    mainnet: "custom-rpc.mainnet.io",
    arbitrum: "custom-rpc.base.io",
    iotex: "custom-rpc.iotex.io",
};

// Mock the ICacheManager
const mockCacheManager = {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn(),
};

describe("Wallet provider", () => {
    let walletProvider: WalletProvider;
    let pk: `0x${string}`;
    const customChains: Record<string, Chain> = {};

    beforeAll(() => {
        pk = generatePrivateKey();

        const chainNames = ["iotex", "arbitrum"];
        chainNames.forEach(
            (chain) =>
                (customChains[chain] = WalletProvider.genChainFromName(chain))
        );
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockCacheManager.get.mockResolvedValue(null);
    });

    describe("Constructor", () => {
        it("sets address", () => {
            const account = privateKeyToAccount(pk);
            const expectedAddress = account.address;

            walletProvider = new WalletProvider(pk, mockCacheManager as any);

            expect(walletProvider.getAddress()).toEqual(expectedAddress);
        });
        it("sets default chain to ethereum mainnet", () => {
            walletProvider = new WalletProvider(pk, mockCacheManager as any);

            expect(walletProvider.chains.mainnet.id).toEqual(mainnet.id);
            expect(walletProvider.getCurrentChain().id).toEqual(mainnet.id);
        });
        it("sets custom chains", () => {
            walletProvider = new WalletProvider(
                pk,
                mockCacheManager as any,
                customChains
            );

            expect(walletProvider.chains.iotex.id).toEqual(iotex.id);
            expect(walletProvider.chains.arbitrum.id).toEqual(arbitrum.id);
        });
        it("sets the first provided custom chain as current chain", () => {
            walletProvider = new WalletProvider(
                pk,
                mockCacheManager as any,
                customChains
            );

            expect(walletProvider.getCurrentChain().id).toEqual(iotex.id);
        });
    });
    describe("Clients", () => {
        beforeEach(() => {
            walletProvider = new WalletProvider(pk, mockCacheManager as any);
        });
        it("generates public client", () => {
            const client = walletProvider.getPublicClient("mainnet");
            expect(client.chain.id).toEqual(mainnet.id);
            expect(client.transport.url).toEqual(
                mainnet.rpcUrls.default.http[0]
            );
        });
        it("generates public client with custom rpcurl", () => {
            const chain = WalletProvider.genChainFromName(
                "mainnet",
                customRpcUrls.mainnet
            );
            const wp = new WalletProvider(pk, mockCacheManager as any, {
                ["mainnet"]: chain,
            });

            const client = wp.getPublicClient("mainnet");
            expect(client.chain.id).toEqual(mainnet.id);
            expect(client.chain.rpcUrls.default.http[0]).toEqual(
                mainnet.rpcUrls.default.http[0]
            );
            expect(client.chain.rpcUrls.custom.http[0]).toEqual(
                customRpcUrls.mainnet
            );
            expect(client.transport.url).toEqual(customRpcUrls.mainnet);
        });
        it("generates wallet client", () => {
            const account = privateKeyToAccount(pk);
            const expectedAddress = account.address;

            const client = walletProvider.getWalletClient("mainnet");

            expect(client.account.address).toEqual(expectedAddress);
            expect(client.transport.url).toEqual(
                mainnet.rpcUrls.default.http[0]
            );
        });
        it("generates wallet client with custom rpcurl", () => {
            const account = privateKeyToAccount(pk);
            const expectedAddress = account.address;
            const chain = WalletProvider.genChainFromName(
                "mainnet",
                customRpcUrls.mainnet
            );
            const wp = new WalletProvider(pk, mockCacheManager as any, {
                ["mainnet"]: chain,
            });

            const client = wp.getWalletClient("mainnet");

            expect(client.account.address).toEqual(expectedAddress);
            expect(client.chain.id).toEqual(mainnet.id);
            expect(client.chain.rpcUrls.default.http[0]).toEqual(
                mainnet.rpcUrls.default.http[0]
            );
            expect(client.chain.rpcUrls.custom.http[0]).toEqual(
                customRpcUrls.mainnet
            );
            expect(client.transport.url).toEqual(customRpcUrls.mainnet);
        });
    });
    describe("Balance", () => {
        beforeEach(() => {
            walletProvider = new WalletProvider(
                pk,
                mockCacheManager as any,
                customChains
            );
        });
        it("should fetch balance", async () => {
            const bal = await walletProvider.getWalletBalance();

            expect(bal).toEqual("0");
        });
        it("should fetch balance for a specific added chain", async () => {
            const bal = await walletProvider.getWalletBalanceForChain("iotex");

            expect(bal).toEqual("0");
        });
        it("should return null if chain is not added", async () => {
            const bal = await walletProvider.getWalletBalanceForChain("base");
            expect(bal).toBeNull();
        });
    });
    describe("Chain", () => {
        beforeEach(() => {
            walletProvider = new WalletProvider(
                pk,
                mockCacheManager as any,
                customChains
            );
        });
        it("generates chains from chain name", () => {
            const chainName = "iotex";
            const chain: Chain = WalletProvider.genChainFromName(chainName);

            expect(chain.rpcUrls.default.http[0]).toEqual(
                iotex.rpcUrls.default.http[0]
            );
        });
        it("generates chains from chain name with custom rpc url", () => {
            const chainName = "iotex";
            const customRpcUrl = "custom.url.io";
            const chain: Chain = WalletProvider.genChainFromName(
                chainName,
                customRpcUrl
            );

            expect(chain.rpcUrls.default.http[0]).toEqual(
                iotex.rpcUrls.default.http[0]
            );
            expect(chain.rpcUrls.custom.http[0]).toEqual(customRpcUrl);
        });
        it("switches chain", () => {
            const initialChain = walletProvider.getCurrentChain().id;
            expect(initialChain).toEqual(iotex.id);

            walletProvider.switchChain("mainnet");

            const newChain = walletProvider.getCurrentChain().id;
            expect(newChain).toEqual(mainnet.id);
        });
        it("switches chain (by adding new chain)", () => {
            const initialChain = walletProvider.getCurrentChain().id;
            expect(initialChain).toEqual(iotex.id);

            walletProvider.switchChain("arbitrum");

            const newChain = walletProvider.getCurrentChain().id;
            expect(newChain).toEqual(arbitrum.id);
        });
        it("adds chain", () => {
            const initialChains = walletProvider.chains;
            expect(initialChains.base).toBeUndefined();

            const base = WalletProvider.genChainFromName("base");
            walletProvider.addChain({ base });
            const newChains = walletProvider.chains;
            expect(newChains.arbitrum.id).toEqual(arbitrum.id);
        });
        it("gets chain configs", () => {
            const chain = walletProvider.getChainConfigs("iotex");

            expect(chain.id).toEqual(iotex.id);
        });
        it("throws if tries to switch to an invalid chain", () => {
            const initialChain = walletProvider.getCurrentChain().id;
            expect(initialChain).toEqual(iotex.id);

            // intentionally set incorrect chain, ts will complain
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(() => walletProvider.switchChain("eth")).toThrow();
        });
        it("throws if unsupported chain name", () => {
            // intentionally set incorrect chain, ts will complain
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(() => WalletProvider.genChainFromName("ethereum")).toThrow();
        });
        it("throws if invalid chain name", () => {
            // intentionally set incorrect chain, ts will complain
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(() => WalletProvider.genChainFromName("eth")).toThrow();
        });
    });
});

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/tests/swap.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { Account, Chain } from "viem";

import { WalletProvider } from "../providers/wallet";
import { SwapAction } from "../actions/swap";

// Mock the ICacheManager
const mockCacheManager = {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn(),
};

describe("Swap Action", () => {
    let wp: WalletProvider;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockCacheManager.get.mockResolvedValue(null);

        const pk = generatePrivateKey();
        const customChains = prepareChains();
        wp = new WalletProvider(pk, mockCacheManager as any, customChains);
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe("Constructor", () => {
        it("should initialize with wallet provider", () => {
            const ta = new SwapAction(wp);

            expect(ta).toBeDefined();
        });
    });
    describe("Swap", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let ta: SwapAction;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let receiver: Account;

        beforeEach(() => {
            ta = new SwapAction(wp);
            receiver = privateKeyToAccount(generatePrivateKey());
        });

        it("swap throws if not enough gas/tokens", async () => {
            const ta = new SwapAction(wp);
            await expect(
                ta.swap({
                    chain: "base",
                    fromToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                    toToken: "0x4200000000000000000000000000000000000006",
                    amount: "100",
                    slippage: 0.5,
                })
            ).rejects.toThrow("Execution failed");
        });
    });
});

const prepareChains = () => {
    const customChains: Record<string, Chain> = {};
    const chainNames = ["base"];
    chainNames.forEach(
        (chain) =>
            (customChains[chain] = WalletProvider.genChainFromName(chain))
    );

    return customChains;
};

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/tests/transfer.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { Account, Chain } from "viem";

import { TransferAction } from "../actions/transfer";
import { WalletProvider } from "../providers/wallet";

// Mock the ICacheManager
const mockCacheManager = {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn(),
};

describe("Transfer Action", () => {
    let wp: WalletProvider;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockCacheManager.get.mockResolvedValue(null);

        const pk = generatePrivateKey();
        const customChains = prepareChains();
        wp = new WalletProvider(pk, mockCacheManager as any, customChains);
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe("Constructor", () => {
        it("should initialize with wallet provider", () => {
            const ta = new TransferAction(wp);

            expect(ta).toBeDefined();
        });
    });
    describe("Transfer", () => {
        let ta: TransferAction;
        let receiver: Account;

        beforeEach(() => {
            ta = new TransferAction(wp);
            receiver = privateKeyToAccount(generatePrivateKey());
        });

        it("throws if not enough gas", async () => {
            await expect(
                ta.transfer({
                    fromChain: "iotexTestnet",
                    toAddress: receiver.address,
                    amount: "1",
                })
            ).rejects.toThrow(
                "Transfer failed: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."
            );
        });
    });
});

const prepareChains = () => {
    const customChains: Record<string, Chain> = {};
    const chainNames = ["iotexTestnet"];
    chainNames.forEach(
        (chain) =>
            (customChains[chain] = WalletProvider.genChainFromName(chain))
    );

    return customChains;
};

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/types/index.ts`:

```ts
import type { Route, Token } from "@lifi/types";
import type {
    Account,
    Address,
    Chain,
    Hash,
    HttpTransport,
    PublicClient,
    WalletClient,
    Log,
} from "viem";
import * as viemChains from "viem/chains";

const _SupportedChainList = Object.keys(viemChains) as Array<
    keyof typeof viemChains
>;
export type SupportedChain = (typeof _SupportedChainList)[number];

// Transaction types
export interface Transaction {
    hash: Hash;
    from: Address;
    to: Address;
    value: bigint;
    data?: `0x${string}`;
    chainId?: number;
    logs?: Log[];
}

// Token types
export interface TokenWithBalance {
    token: Token;
    balance: bigint;
    formattedBalance: string;
    priceUSD: string;
    valueUSD: string;
}

export interface WalletBalance {
    chain: SupportedChain;
    address: Address;
    totalValueUSD: string;
    tokens: TokenWithBalance[];
}

// Chain configuration
export interface ChainMetadata {
    chainId: number;
    name: string;
    chain: Chain;
    rpcUrl: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    blockExplorerUrl: string;
}

export interface ChainConfig {
    chain: Chain;
    publicClient: PublicClient<HttpTransport, Chain, Account | undefined>;
    walletClient?: WalletClient;
}

// Action parameters
export interface TransferParams {
    fromChain: SupportedChain;
    toAddress: Address;
    amount: string;
    data?: `0x${string}`;
}

export interface SwapParams {
    chain: SupportedChain;
    fromToken: Address;
    toToken: Address;
    amount: string;
    slippage?: number;
}

export interface BebopRoute {
    data: string;
    approvalTarget: Address;
    sellAmount: string;
    from: Address;
    to: Address;
    value: string;
    gas: string;
    gasPrice: string;
}

export interface SwapQuote {
    aggregator: "lifi" | "bebop";
    minOutputAmount: string;
    swapData: Route | BebopRoute;
}

export interface BridgeParams {
    fromChain: SupportedChain;
    toChain: SupportedChain;
    fromToken: Address;
    toToken: Address;
    amount: string;
    toAddress?: Address;
}

// Plugin configuration
export interface EvmPluginConfig {
    rpcUrl?: {
        ethereum?: string;
        abstract?: string;
        base?: string;
        sepolia?: string;
        bsc?: string;
        arbitrum?: string;
        avalanche?: string;
        polygon?: string;
        optimism?: string;
        cronos?: string;
        gnosis?: string;
        fantom?: string;
        fraxtal?: string;
        klaytn?: string;
        celo?: string;
        moonbeam?: string;
        aurora?: string;
        harmonyOne?: string;
        moonriver?: string;
        arbitrumNova?: string;
        mantle?: string;
        linea?: string;
        scroll?: string;
        filecoin?: string;
        taiko?: string;
        zksync?: string;
        canto?: string;
        alienx?: string;
        gravity?: string;
    };
    secrets?: {
        EVM_PRIVATE_KEY: string;
    };
    testMode?: boolean;
    multicall?: {
        batchSize?: number;
        wait?: number;
    };
}

// LiFi types
export type LiFiStatus = {
    status: "PENDING" | "DONE" | "FAILED";
    substatus?: string;
    error?: Error;
};

export type LiFiRoute = {
    transactionHash: Hash;
    transactionData: `0x${string}`;
    toAddress: Address;
    status: LiFiStatus;
};

// Provider types
export interface TokenData extends Token {
    symbol: string;
    decimals: number;
    address: Address;
    name: string;
    logoURI?: string;
    chainId: number;
}

export interface TokenPriceResponse {
    priceUSD: string;
    token: TokenData;
}

export interface TokenListResponse {
    tokens: TokenData[];
}

export interface ProviderError extends Error {
    code?: number;
    data?: unknown;
}

export enum VoteType {
    AGAINST = 0,
    FOR = 1,
    ABSTAIN = 2,
}

export interface Proposal {
    targets: Address[];
    values: bigint[];
    calldatas: `0x${string}`[];
    description: string;
}

export interface VoteParams {
    chain: SupportedChain;
    governor: Address;
    proposalId: string;
    support: VoteType;
}

export interface QueueProposalParams extends Proposal {
    chain: SupportedChain;
    governor: Address;
}

export interface ExecuteProposalParams extends Proposal {
    chain: SupportedChain;
    governor: Address;
    proposalId: string;
}

export interface ProposeProposalParams extends Proposal {
    chain: SupportedChain;
    governor: Address;
}

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/providers/wallet.ts`:

```ts
import {
    createPublicClient,
    createTestClient,
    createWalletClient,
    formatUnits,
    http,
    publicActions,
    walletActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
    type IAgentRuntime,
    type Provider,
    type Memory,
    type State,
    type ICacheManager,
    elizaLogger,
} from "@elizaos/core";
import type {
    Address,
    WalletClient,
    PublicClient,
    Chain,
    HttpTransport,
    Account,
    PrivateKeyAccount,
    TestClient,
} from "viem";
import * as viemChains from "viem/chains";
import { DeriveKeyProvider, TEEMode } from "@elizaos/plugin-tee";
import NodeCache from "node-cache";
import * as path from "node:path";

import type { SupportedChain } from "../types";

export class WalletProvider {
    private cache: NodeCache;
    private cacheKey = "evm/wallet";
    private currentChain: SupportedChain = "mainnet";
    private CACHE_EXPIRY_SEC = 5;
    chains: Record<string, Chain> = { ...viemChains };
    account: PrivateKeyAccount;

    constructor(
        accountOrPrivateKey: PrivateKeyAccount | `0x${string}`,
        private cacheManager: ICacheManager,
        chains?: Record<string, Chain>
    ) {
        this.setAccount(accountOrPrivateKey);
        this.setChains(chains);

        if (chains && Object.keys(chains).length > 0) {
            this.setCurrentChain(Object.keys(chains)[0] as SupportedChain);
        }

        this.cache = new NodeCache({ stdTTL: this.CACHE_EXPIRY_SEC });
    }

    getAddress(): Address {
        return this.account.address;
    }

    getCurrentChain(): Chain {
        return this.chains[this.currentChain];
    }

    getPublicClient(
        chainName: SupportedChain
    ): PublicClient<HttpTransport, Chain, Account | undefined> {
        const transport = this.createHttpTransport(chainName);

        const publicClient = createPublicClient({
            chain: this.chains[chainName],
            transport,
        });
        return publicClient;
    }

    getWalletClient(chainName: SupportedChain): WalletClient {
        const transport = this.createHttpTransport(chainName);

        const walletClient = createWalletClient({
            chain: this.chains[chainName],
            transport,
            account: this.account,
        });

        return walletClient;
    }

    getTestClient(): TestClient {
        return createTestClient({
            chain: viemChains.hardhat,
            mode: "hardhat",
            transport: http(),
        })
            .extend(publicActions)
            .extend(walletActions);
    }

    getChainConfigs(chainName: SupportedChain): Chain {
        const chain = viemChains[chainName];

        if (!chain?.id) {
            throw new Error("Invalid chain name");
        }

        return chain;
    }

    async getWalletBalance(): Promise<string | null> {
        const cacheKey = `walletBalance_${this.currentChain}`;
        const cachedData = await this.getCachedData<string>(cacheKey);
        if (cachedData) {
            elizaLogger.log(
                `Returning cached wallet balance for chain: ${this.currentChain}`
            );
            return cachedData;
        }

        try {
            const client = this.getPublicClient(this.currentChain);
            const balance = await client.getBalance({
                address: this.account.address,
            });
            const balanceFormatted = formatUnits(balance, 18);
            this.setCachedData<string>(cacheKey, balanceFormatted);
            elizaLogger.log(
                "Wallet balance cached for chain: ",
                this.currentChain
            );
            return balanceFormatted;
        } catch (error) {
            console.error("Error getting wallet balance:", error);
            return null;
        }
    }

    async getWalletBalanceForChain(
        chainName: SupportedChain
    ): Promise<string | null> {
        try {
            const client = this.getPublicClient(chainName);
            const balance = await client.getBalance({
                address: this.account.address,
            });
            return formatUnits(balance, 18);
        } catch (error) {
            console.error("Error getting wallet balance:", error);
            return null;
        }
    }

    addChain(chain: Record<string, Chain>) {
        this.setChains(chain);
    }

    switchChain(chainName: SupportedChain, customRpcUrl?: string) {
        if (!this.chains[chainName]) {
            const chain = WalletProvider.genChainFromName(
                chainName,
                customRpcUrl
            );
            this.addChain({ [chainName]: chain });
        }
        this.setCurrentChain(chainName);
    }

    private async readFromCache<T>(key: string): Promise<T | null> {
        const cached = await this.cacheManager.get<T>(
            path.join(this.cacheKey, key)
        );
        return cached;
    }

    private async writeToCache<T>(key: string, data: T): Promise<void> {
        await this.cacheManager.set(path.join(this.cacheKey, key), data, {
            expires: Date.now() + this.CACHE_EXPIRY_SEC * 1000,
        });
    }

    private async getCachedData<T>(key: string): Promise<T | null> {
        // Check in-memory cache first
        const cachedData = this.cache.get<T>(key);
        if (cachedData) {
            return cachedData;
        }

        // Check file-based cache
        const fileCachedData = await this.readFromCache<T>(key);
        if (fileCachedData) {
            // Populate in-memory cache
            this.cache.set(key, fileCachedData);
            return fileCachedData;
        }

        return null;
    }

    private async setCachedData<T>(cacheKey: string, data: T): Promise<void> {
        // Set in-memory cache
        this.cache.set(cacheKey, data);

        // Write to file-based cache
        await this.writeToCache(cacheKey, data);
    }

    private setAccount = (
        accountOrPrivateKey: PrivateKeyAccount | `0x${string}`
    ) => {
        if (typeof accountOrPrivateKey === "string") {
            this.account = privateKeyToAccount(accountOrPrivateKey);
        } else {
            this.account = accountOrPrivateKey;
        }
    };

    private setChains = (chains?: Record<string, Chain>) => {
        if (!chains) {
            return;
        }
        for (const chain of Object.keys(chains)) {
            this.chains[chain] = chains[chain];
        }
    };

    private setCurrentChain = (chain: SupportedChain) => {
        this.currentChain = chain;
    };

    private createHttpTransport = (chainName: SupportedChain) => {
        const chain = this.chains[chainName];

        if (chain.rpcUrls.custom) {
            return http(chain.rpcUrls.custom.http[0]);
        }
        return http(chain.rpcUrls.default.http[0]);
    };

    static genChainFromName(
        chainName: string,
        customRpcUrl?: string | null
    ): Chain {
        const baseChain = viemChains[chainName];

        if (!baseChain?.id) {
            throw new Error("Invalid chain name");
        }

        const viemChain: Chain = customRpcUrl
            ? {
                  ...baseChain,
                  rpcUrls: {
                      ...baseChain.rpcUrls,
                      custom: {
                          http: [customRpcUrl],
                      },
                  },
              }
            : baseChain;

        return viemChain;
    }
}

const genChainsFromRuntime = (
    runtime: IAgentRuntime
): Record<string, Chain> => {
    const chainNames =
        (runtime.character.settings.chains?.evm as SupportedChain[]) || [];
    const chains: Record<string, Chain> = {};

    for (const chainName of chainNames) {
        const rpcUrl = runtime.getSetting(
            `ETHEREUM_PROVIDER_${chainName.toUpperCase()}`
        );
        const chain = WalletProvider.genChainFromName(chainName, rpcUrl);
        chains[chainName] = chain;
    }

    const mainnet_rpcurl = runtime.getSetting("EVM_PROVIDER_URL");
    if (mainnet_rpcurl) {
        const chain = WalletProvider.genChainFromName(
            "mainnet",
            mainnet_rpcurl
        );
        chains["mainnet"] = chain;
    }

    return chains;
};

export const initWalletProvider = async (runtime: IAgentRuntime) => {
    const teeMode = runtime.getSetting("TEE_MODE") || TEEMode.OFF;

    const chains = genChainsFromRuntime(runtime);

    if (teeMode !== TEEMode.OFF) {
        const walletSecretSalt = runtime.getSetting("WALLET_SECRET_SALT");
        if (!walletSecretSalt) {
            throw new Error(
                "WALLET_SECRET_SALT required when TEE_MODE is enabled"
            );
        }

        const deriveKeyProvider = new DeriveKeyProvider(teeMode);
        const deriveKeyResult = await deriveKeyProvider.deriveEcdsaKeypair(
            walletSecretSalt,
            "evm",
            runtime.agentId
        );
        return new WalletProvider(
            deriveKeyResult.keypair,
            runtime.cacheManager,
            chains
        );
    } else {
        const privateKey = runtime.getSetting(
            "EVM_PRIVATE_KEY"
        ) as `0x${string}`;
        if (!privateKey) {
            throw new Error("EVM_PRIVATE_KEY is missing");
        }
        return new WalletProvider(privateKey, runtime.cacheManager, chains);
    }
};

export const evmWalletProvider: Provider = {
    async get(
        runtime: IAgentRuntime,
        _message: Memory,
        state?: State
    ): Promise<string | null> {
        try {
            const walletProvider = await initWalletProvider(runtime);
            const address = walletProvider.getAddress();
            const balance = await walletProvider.getWalletBalance();
            const chain = walletProvider.getCurrentChain();
            const agentName = state?.agentName || "The agent";
            return `${agentName}'s EVM Wallet Address: ${address}\nBalance: ${balance} ${chain.nativeCurrency.symbol}\nChain ID: ${chain.id}, Name: ${chain.name}`;
        } catch (error) {
            console.error("Error in EVM wallet provider:", error);
            return null;
        }
    },
};

```

`/home/ygg/Workspace/Eliza/GAIAv0.1.9/packages/plugin-evm/src/index.ts`:

```ts
export * from "./actions/bridge";
export * from "./actions/swap";
export * from "./actions/transfer";
export * from "./providers/wallet";
export * from "./types";

import type { Plugin } from "@elizaos/core";
import { bridgeAction } from "./actions/bridge";
import { swapAction } from "./actions/swap";
import { transferAction } from "./actions/transfer";
import { evmWalletProvider } from "./providers/wallet";

export const evmPlugin: Plugin = {
    name: "evm",
    description: "EVM blockchain integration plugin",
    providers: [evmWalletProvider],
    evaluators: [],
    services: [],
    actions: [transferAction, bridgeAction, swapAction],
};

export default evmPlugin;

```

