<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3c12dbc1-dae8-49b7-8484-304923b12fd9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a local `.env` file (see `.env` for an example).
   - Set `GEMINI_API_KEY`.
   - To use Supabase, set `VITE_SUPABASE_ENABLED="true"` and provide `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
3. Run the app:
   `npm run dev`
