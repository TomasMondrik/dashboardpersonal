# Gemini Edge Function

Configure the Gemini key as a Supabase secret and deploy the function from the project root:

```bash
supabase login
supabase link --project-ref osluwuxlgbputhbdxoaj
supabase secrets set GEMINI_API_KEY="YOUR_GEMINI_KEY"
supabase functions deploy gemini
```

The Gemini key must never be added to `index.html` or committed to the repository. The frontend calls the deployed function using the public Supabase anon key.