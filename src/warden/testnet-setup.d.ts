import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
/**
 * Testnet Setup Script
 *
 * This script:
 * 1. Connects to Warden testnet
 * 2. Creates a Space for isolated execution
 * 3. Tests balance queries
 * 4. Verifies basic functionality
 */
declare function setupTestnet(): Promise<{
    agentkit: WardenAgentKit;
    address: string;
    spaceId: string;
}>;
export { setupTestnet };
//# sourceMappingURL=testnet-setup.d.ts.map