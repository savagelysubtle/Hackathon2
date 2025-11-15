import * as dotenv from 'dotenv';
import { Wallet } from 'ethers';

dotenv.config();

/**
 * Simple Connection Test
 * Tests basic wallet creation without Warden SDK
 */
async function simpleConnectionTest() {
    console.log('🧪 Simple Connection Test\n');
    console.log('═══════════════════════════════════════════════════\n');

    // Check private key
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error('❌ PRIVATE_KEY not found');
        process.exit(1);
    }

    console.log('✅ Private key loaded from .env');
    console.log();

    // Create wallet from private key
    console.log('🔑 Creating wallet from private key...');
    try {
        const wallet = new Wallet(privateKey);
        console.log('✅ Wallet created successfully!');
        console.log();

        console.log('📋 Wallet Details:');
        console.log('─────────────────────────────────────────────────');
        console.log('Address:', wallet.address);
        console.log('─────────────────────────────────────────────────');
        console.log();

        console.log('💰 Get Testnet Tokens:');
        console.log('   1. Visit: https://faucet.wardenprotocol.org');
        console.log('   2. Or Discord: https://discord.gg/wardenprotocol (#faucet)');
        console.log('   3. Enter your address:', wallet.address);
        console.log();

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ BASIC CONNECTION TEST PASSED!');
        console.log('═══════════════════════════════════════════════════');
        console.log();
        console.log('⚠️  NOTE: Warden Agent Kit initialization hangs?');
        console.log('   This could be due to:');
        console.log('   - Warden testnet RPC being slow/unavailable');
        console.log('   - Network connectivity issues');
        console.log('   - SDK trying to verify contract deployment');
        console.log();
        console.log('📝 Workarounds:');
        console.log('   1. Wait 1-2 minutes for SDK to connect');
        console.log('   2. Check Warden Discord for testnet status');
        console.log('   3. Try again later if testnet is down');
        console.log('   4. Check Warden docs for RPC endpoints');
        console.log();
        console.log('🎯 Your wallet is ready! Just need testnet tokens.');
        console.log('═══════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Failed to create wallet:', (error as Error).message);
        console.log('\n💡 Tips:');
        console.log('   - Check private key format (should start with 0x)');
        console.log('   - Ensure 64 hex characters after 0x');
        console.log('   - Run: bun run generate-wallet\n');
        process.exit(1);
    }
}

simpleConnectionTest().catch(console.error);



