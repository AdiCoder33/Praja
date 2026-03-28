# 🔒 Security Guidelines

## ⚠️ NEVER Commit These Files:

- `.env` - Contains API keys
- `*.pem` - SSL certificates
- Any file with API keys or secrets

## ✅ Safe to Commit:

- `.env.example` - Template without actual keys
- Source code files (`.py`, `.js`, `.html`)
- Documentation (`.md`)
- Configuration templates

## 🔑 API Key Security:

1. **Never share screenshots** with API keys visible
2. **Never commit** `.env` to git
3. **Rotate keys** if exposed
4. **Use `.env.example`** for templates

## 📋 If API Key is Leaked:

1. Go to https://aistudio.google.com/apikey
2. **Delete** the compromised key
3. **Create** a new key
4. **Update** `.env` file
5. **Restart** the server

## 🛡️ Best Practices:

- Keep `.gitignore` updated
- Use environment variables
- Never hardcode secrets
- Review commits before pushing
- Use separate keys for dev/prod
