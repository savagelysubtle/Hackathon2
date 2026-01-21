# LM Studio Setup for Local LLM

## 🚀 Quick Start with LM Studio

### 1. Download & Install LM Studio
- Download from: https://lmstudio.ai/
- Install and run the application

### 2. Download a Model
- Go to **"My Models"** tab
- Search for: `microsoft/WizardLM-2-8x22B`
- Or try: `meta-llama/Meta-Llama-3.1-8B-Instruct`
- Click **"Download"**

### 3. Start the Local Server
- Go to **"Developer"** tab
- Click **"Start Server"**
- Note the port (usually `http://localhost:1234`)

### 4. Configure Your Agent
Add to your `.env` file:
```bash
# LM Studio Configuration
LLM_BASE_URL=http://localhost:1234/v1
LLM_MODEL=local-model  # This gets overridden by LM Studio

# Optional: Keep OpenAI as fallback
OPENAI_API_KEY=your-openai-key-here
```

### 5. Test the Configuration
```bash
# Check environment
bun run check-env

# Test server
bun run langgraph:serve

# Test with agentchat.vercel.app
# URL: http://localhost:8123
# Assistant ID: recurring_executor
```

## 🎯 Recommended Models

### For DeFi Agent (Complex Reasoning)
- `microsoft/WizardLM-2-8x22B` - Excellent reasoning
- `meta-llama/Meta-Llama-3.1-8B-Instruct` - Good balance
- `mistralai/Mistral-7B-Instruct-v0.2` - Fast and capable

### For Speed (Simpler Tasks)
- `microsoft/DialoGPT-medium` - Fast responses
- `distilgpt2` - Very lightweight

## 🔧 Troubleshooting

### Server Won't Start
- Make sure LM Studio is running
- Check that a model is loaded in "My Models"
- Try a smaller model first

### Connection Issues
- Verify URL: `http://localhost:1234/v1`
- Check firewall settings
- Try restarting LM Studio

### Model Performance
- Larger models = better reasoning but slower
- Smaller models = faster but less capable
- Start with 7B-13B parameter models

## 💡 Pro Tips

1. **RAM Requirements**: 8GB+ RAM for 7B models, 16GB+ for 13B+
2. **GPU**: Use GPU acceleration if available
3. **Context Length**: Keep conversations under 2048 tokens
4. **Fallback**: Keep OpenAI key as backup for complex tasks

## 🔄 Switching Between OpenAI and LM Studio

```bash
# For OpenAI (cloud)
OPENAI_API_KEY=sk-your-key-here
# LLM_BASE_URL=  (leave empty)

# For LM Studio (local)
# OPENAI_API_KEY=  (leave empty)
LLM_BASE_URL=http://localhost:1234/v1
LLM_MODEL=local-model
```

Your agent will automatically detect which configuration to use! 🎉