import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Diagnostic Check\n');
console.log('═══════════════════════════════════════════════════\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('─────────────────────────────────────────────────');

const privateKey = process.env.PRIVATE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

console.log('PRIVATE_KEY:    ', privateKey ? `✅ Set (${privateKey.substring(0, 6)}...${privateKey.substring(privateKey.length - 4)})` : '❌ Not set');
console.log('OPENAI_API_KEY: ', openaiKey && openaiKey !== 'your-openai-api-key-here' ? '✅ Set' : '⚠️  Not set (optional for now)');
console.log();

if (!privateKey || privateKey === '0xyour-private-key-here') {
    console.log('❌ ERROR: PRIVATE_KEY not configured properly');
    console.log('Run: bun run generate-wallet\n');
    process.exit(1);
}

// Validate private key format
if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
    console.log('⚠️  WARNING: Private key format might be invalid');
    console.log('   Expected format: 0x followed by 64 hex characters');
    console.log('   Your key length:', privateKey.length);
    console.log('   Starts with 0x:', privateKey.startsWith('0x'));
    console.log();
}

console.log('✅ Environment configuration looks good!\n');
console.log('═══════════════════════════════════════════════════');
console.log('🎯 Next Steps:');
console.log('   1. Run: bun run setup');
console.log('   2. Get testnet tokens for your address');
console.log('   3. Run: bun run test:swap');
console.log('═══════════════════════════════════════════════════\n');

