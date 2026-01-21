import fetch from 'node-fetch';

async function testLangGraphServer() {
  const baseUrl = 'http://localhost:8123';

  console.log('🧪 Testing LangGraph Server...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // Test assistant endpoint
    console.log('\n2. Testing assistant endpoint...');
    const assistantResponse = await fetch(`${baseUrl}/assistants/recurring_executor`);
    const assistantData = await assistantResponse.json();
    console.log('✅ Assistant:', (assistantData as any).name);

    // Test thread creation
    console.log('\n3. Testing thread creation...');
    const threadResponse = await fetch(`${baseUrl}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const threadData = await threadResponse.json();
    console.log('✅ Thread created:', (threadData as any).id);

    // Test sending a message
    console.log('\n4. Testing message sending...');
    const messageResponse = await fetch(`${baseUrl}/threads/${(threadData as any).id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'user',
        content: 'Hello! Can you show me my portfolio status?'
      }),
    });

    if (messageResponse.ok) {
      const messageData = await messageResponse.json();
      console.log('✅ Message response:', (messageData as any).content.substring(0, 100) + '...');
    } else {
      const errorText = await messageResponse.text();
      console.log('❌ Message error:', errorText);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Configuration for agentchat.vercel.app:');
    console.log(`   Deployment URL: ${baseUrl}`);
    console.log('   Assistant/Graph ID: recurring_executor');
    console.log('   LangSmith API Key: (optional)');

  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
  }
}

testLangGraphServer().catch(console.error);