# 🔑 GEMINI API Key Setup

## How to Add Your GEMINI API Key

1. **Get your API key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your API key

2. **Add to your `.env` file:**
   - Open `backend/.env`
   - Find the line: `GEMINI_API_KEY=`
   - Add your key: `GEMINI_API_KEY=your-actual-api-key-here`

3. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Test it:**
   - Log in as admin
   - Go to Admin panel
   - Try asking a question in the AI chat
   - You should get a real AI response instead of the demo message

## Example .env entry:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Note:
- The GEMINI API key is prioritized over ChatGPT
- If GEMINI key is present, it will be used
- If not, it falls back to ChatGPT (if available)
- If neither is present, shows demo message

---

**Your GEMINI API key will enable live AI responses in the admin panel!** ✨
