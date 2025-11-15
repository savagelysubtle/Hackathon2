import { HumanMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { MemorySaver, StateGraph } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { WardenAgentKit } from '@wardenprotocol/warden-agent-kit-core';
import { WardenToolkit } from '@wardenprotocol/warden-langchain';
import * as dotenv from 'dotenv';
import { StateAnnotation } from './state.js';

// Load environment variables
dotenv.config();

// Initialize Warden Agent Kit
const wardenConfig = {
  privateKeyOrAccount: (process.env.PRIVATE_KEY as `0x${string}`) || undefined,
};

const agentkit = new WardenAgentKit(wardenConfig);
const wardenToolkit = new WardenToolkit(agentkit);
const tools = wardenToolkit.getTools();

// Initialize LLM
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

// Store conversation history
const memory = new MemorySaver();

/**
 * Define a node, these do the work of the graph and should have most of the logic.
 * Must return a subset of the properties set in StateAnnotation.
 * @param state The current state of the graph.
 * @param config Extra parameters passed into the state graph.
 * @returns Some subset of parameters of the graph state, used to update the state
 * for the edges and nodes executed next.
 */
const callModel = async (
  state: typeof StateAnnotation.State,
  _config: RunnableConfig,
): Promise<typeof StateAnnotation.Update> => {
  // Create a React agent with Warden tools
  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier:
      "You're a helpful Web3 assistant with access to blockchain operations. " +
      'You can help users with DeFi tasks like checking balances, swapping tokens, ' +
      'and managing their crypto assets. Always be clear about which blockchain operations ' +
      "you're performing and confirm actions before executing them.",
  });

  const agentConfig = {
    configurable: { thread_id: 'warden-hackathon-agent' },
  };

  // Stream the agent's response
  const stream = await agent.stream(
    { messages: [new HumanMessage(state.messages[0].content)] },
    agentConfig,
  );

  let finalResponse = '';
  for await (const chunk of stream) {
    if ('agent' in chunk) {
      finalResponse = chunk.agent.messages[0].content;
      console.log('Agent response:', finalResponse);
    } else if ('tools' in chunk) {
      console.log('Tool response:', chunk.tools.messages[0].content);
    }
  }

  return {
    messages: [
      {
        role: 'assistant',
        content: finalResponse,
      },
    ],
  };
};
/**
 * Routing function: Determines whether to continue research or end the builder.
 * This function decides if the gathered information is satisfactory or if more research is needed.
 *
 * @param state - The current state of the research builder
 * @returns Either "callModel" to continue research or END to finish the builder
 */
export const route = (
  state: typeof StateAnnotation.State,
): '__end__' | 'callModel' => {
  if (state.messages.length > 0) {
    return '__end__';
  }
  return 'callModel';
};

// Finally, create the graph itself.
const builder = new StateGraph(StateAnnotation)
  // Add the nodes to do the work.
  // Chaining the nodes together in this way
  // updates the types of the StateGraph instance
  // so you have static type checking when it comes time
  // to add the edges.
  .addNode('callModel', callModel)
  // Regular edges mean "always transition to node B after node A is done"
  // The "__start__" and "__end__" nodes are "virtual" nodes that are always present
  // and represent the beginning and end of the builder.
  .addEdge('__start__', 'callModel')
  // Conditional edges optionally route to different nodes (or end)
  .addConditionalEdges('callModel', route);

export const graph = builder.compile();
graph.name = 'New Agent';
