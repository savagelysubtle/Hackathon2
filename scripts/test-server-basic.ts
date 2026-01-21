async function testBasicServer() {
  const baseUrl = 'http://localhost:8123';

  console.log('🧪 Testing Basic LangGraph Server...\n');

  try {
    // Test health
    console.log('1. Health check...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const health = await healthRes.json();
    console.log('✅ Health:', health);

    // Test assistant
    console.log('\n2. Assistant info...');
    const assistantRes = await fetch(`${baseUrl}/assistants/recurring_executor`);
    const assistant = await assistantRes.json();
    console.log('✅ Assistant:', assistant.name);

    // Test thread creation
    console.log('\n3. Thread creation...');
    const threadRes = await fetch(`${baseUrl}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const thread = await threadRes.json();
    console.log('✅ Thread:', thread.id);

    // Test messaging
    console.log('\n4. Sending message...');
    const messageRes = await fetch(`${baseUrl}/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'user',
        content: 'Hello! Can you help me manage my portfolio?',
      }),
    });

    if (messageRes.ok) {
      const message = await messageRes.json();
      console.log('✅ Response:', message.content.substring(0, 100) + '...');
    } else {
      console.log('❌ Error:', await messageRes.text());
    }

    console.log('\n🎉 Basic server test completed!');
    console.log('\n📋 Ready for agentchat.vercel.app:');
    console.log(`   URL: ${baseUrl}`);
    console.log('   Assistant ID: recurring_executor');

  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
  }
}

testBasicServer().catch(console.error);