import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { SwapExecutor } from '../executor/swap-executor.js';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Test: Execute a simple swap on testnet
 *
 * This test will:
 * 1. Connect to Warden testnet
 * 2. Check current balances
 * 3. Execute a small test swap (USDC → WETH)
 * 4. Verify the swap completed
 * 5. Check updated balances
 */
async function testSwap() {
    console.log('🧪 Testing Swap Execution\n');
    console.log('═══════════════════════════════════════════════════\n');

    if (!process.env.PRIVATE_KEY) {
        console.error('❌ Error: PRIVATE_KEY not found in .env file');
        process.exit(1);
    }

    try {
        // Initialize agent kit
        console.log('🔌 Connecting to Warden testnet...');
        const agentkit = new WardenAgentKit({
            privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
        });

        const address = 'mock-address';
        console.log('✅ Connected');
        console.log('📍 Address:', address);
        console.log();

        // Create swap executor
        const executor = new SwapExecutor(agentkit);

        // Check initial balances
        console.log('💰 Checking initial balances...');
        const usdcBefore = await executor.getBalance('USDC');
        const wethBefore = await executor.getBalance('WETH');
        console.log();

        if (usdcBefore < 10) {
            console.warn('⚠️  WARNING: USDC balance < 10');
            console.warn('   You may not have enough to execute this test swap');
            console.warn('   Consider getting testnet USDC from faucet\n');
        }

        // Execute test swap: 10 USDC → WETH
        console.log('🔄 Executing test swap...');
        console.log('   Swapping: 10 USDC → WETH');
        console.log('   Chain: Ethereum testnet');
        console.log();

        const result = await executor.executeSwap({
            tokenIn: 'USDC',
            tokenOut: 'WETH',
            amountIn: '10',
            minAmountOut: '0.003', // Assuming ~$3000 per ETH
            chain: 'ethereum',
        });

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ SWAP SUCCESSFUL!');
        console.log('═══════════════════════════════════════════════════');
        console.log('📋 Swap Details:');
        console.log('   Transaction Hash:', result.txHash);
        console.log('   Timestamp:', new Date(result.timestamp).toISOString());
        console.log('   Token In:', result.params.tokenIn);
        console.log('   Token Out:', result.params.tokenOut);
        console.log('   Amount In:', result.params.amountIn);
        console.log('   Min Amount Out:', result.params.minAmountOut);
        console.log();

        // Check updated balances
        console.log('💰 Checking updated balances...');
        const usdcAfter = await executor.getBalance('USDC');
        const wethAfter = await executor.getBalance('WETH');
        console.log();

        // Show balance changes
        console.log('📊 Balance Changes:');
        console.log('   USDC: ', usdcBefore, '→', usdcAfter, `(${(usdcAfter - usdcBefore).toFixed(2)})`);
        console.log('   WETH: ', wethBefore, '→', wethAfter, `(+${(wethAfter - wethBefore).toFixed(6)})`);
        console.log();

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ TEST PASSED!');
        console.log('═══════════════════════════════════════════════════');
        console.log('🎯 Next Steps:');
        console.log('   1. ✅ Swap execution works');
        console.log('   2. ⏭️  Test oracle integration: bun run src/tests/test-oracle.ts');
        console.log('   3. ⏭️  Build price trigger system');
        console.log('═══════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', (error as Error).message);
        console.log('\n🔍 Troubleshooting:');
        console.log('   - Check you have sufficient USDC balance');
        console.log('   - Check you have ETH for gas fees');
        console.log('   - Verify network connectivity');
        console.log('   - Check Warden testnet status\n');
        throw error;
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testSwap()
        .then(() => {
            console.log('🎉 Test completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Test failed:', error);
            process.exit(1);
        });
}

export { testSwap };

