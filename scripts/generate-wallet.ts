import { Wallet } from 'ethers';

/**
 * Generate a new Ethereum wallet for testing
 *
 * ⚠️ SECURITY WARNING:
 * - This generates a REAL private key
 * - Only use for TESTNET
 * - Never send real funds to this wallet
 * - Keep the private key SECRET
 */
function generateWallet() {
  console.log('🔐 Generating New Test Wallet...\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('⚠️  SECURITY WARNING');
  console.log('═══════════════════════════════════════════════════');
  console.log('This will generate a REAL private key.');
  console.log('Only use this wallet for TESTNET TESTING.');
  console.log('NEVER send real funds to this address.');
  console.log('═══════════════════════════════════════════════════\n');

  // Generate random wallet
  const wallet = Wallet.createRandom();

  console.log('✅ Wallet Generated!\n');
  console.log('📋 Wallet Details:');
  console.log('─────────────────────────────────────────────────');
  console.log('Address:     ', wallet.address);
  console.log('Private Key: ', wallet.privateKey);
  console.log('─────────────────────────────────────────────────\n');

  console.log('📝 Next Steps:');
  console.log('1. Copy the Private Key above');
  console.log('2. Open your .env file');
  console.log('3. Replace PRIVATE_KEY=0xyour-private-key-here');
  console.log('   with your actual key:');
  console.log('   PRIVATE_KEY=' + wallet.privateKey);
  console.log();
  console.log('4. Save the .env file');
  console.log('5. Run: bun run setup');
  console.log();
  console.log('💰 Get Testnet Tokens:');
  console.log('   Address: ' + wallet.address);
  console.log('   Faucet:  https://faucet.wardenprotocol.org');
  console.log();
  console.log('═══════════════════════════════════════════════════');
  console.log('⚠️  IMPORTANT: Keep your private key SECRET!');
  console.log('   - Never commit .env to git');
  console.log('   - Never share your private key');
  console.log('   - Use ONLY for testnet');
  console.log('═══════════════════════════════════════════════════\n');
}

generateWallet();
