# ====== pakai Ollama lokal ======
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2:7b-instruct

# ====== matikan integrasi lain (biar nggak nyari-nyari Vercel/XAI/DB) ======
DISABLE_AUTH=true
DISABLE_DB=true
DISABLE_BLOB=true
DISABLE_REDIS=true

# ====== Auth.js supaya diam saat dev (meski kita bypass) ======
AUTH_SECRET=devdevdevdevdevdevdevdevdevdevdevdevdevdevdevdev
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
"# websitesundialogs" 
