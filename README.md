# opencode-qwen-auth

OpenCode plugin for authenticating with Qwen models via Alibaba Cloud OAuth (device code flow with PKCE).

This lets you use Qwen models without an API key — just log in with your Alibaba Cloud / Qwen account.

## Install

### Option A: Local plugin (recommended for personal use)

Copy or symlink this directory into your OpenCode plugins folder:

```bash
# Global (all projects)
cp -r opencode-qwen-auth ~/.config/opencode/plugins/qwen-auth

# Or project-level
cp -r opencode-qwen-auth .opencode/plugins/qwen-auth
```

When using as a local plugin, OpenCode loads `src/index.ts` directly via Bun — no build step needed.

### Option B: npm config

If published to npm (or using a local path), add it to your `opencode.json`:

```json
{
  "plugin": ["opencode-qwen-auth@0.1.0"]
}
```

## Configure the provider and model

Add the `alibaba-oauth` provider to your `opencode.json` so OpenCode knows which models are available:

```json
{
  "provider": {
    "alibaba-oauth": {
      "name": "Alibaba (OAuth)",
      "npm": "@ai-sdk/openai-compatible",
      "api": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
      "models": {
        "coder-model": {
          "name": "Qwen 3.5 Plus (coder-model)",
          "family": "qwen",
          "reasoning": true,
          "tool_call": true,
          "attachment": false,
          "temperature": true,
          "modalities": {
            "input": ["text", "image", "video"],
            "output": ["text"]
          },
          "limit": {
            "context": 1000000,
            "output": 65536
          }
        }
      }
    }
  }
}
```

You can add more Qwen models (e.g. `qwen-plus`, `qwen-turbo`, `qwen3-coder`) using the same pattern — just use the model ID that the DashScope API expects.

## Authenticate

```bash
opencode auth login
# Select "Alibaba (OAuth)" from the list
# Follow the device code flow in your browser
```

Or via the TUI: press `p` to open the provider picker and select Alibaba (OAuth).

## How it works

1. **Device code flow**: Initiates OAuth via `chat.qwen.ai` with PKCE challenge
2. **Token management**: Stores refresh/access tokens via OpenCode's auth system
3. **Auto-refresh**: Transparently refreshes expired access tokens before requests
4. **URL rewriting**: Routes requests through the correct DashScope endpoint returned by the OAuth server (`resource_url`)
