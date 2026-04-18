# Advanced Form

A mobile authentication app built with Expo, Supabase Auth, React Hook Form, and Zod.

## Setup

1. Clone the repo
   git clone https://github.com/sLine03/Group14_AdvancedFromValidation.git
   cd QualityForms

   2. Install dependencies
   npm install

3. Create a .env file in the root with your Supabase credentials:
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

4. Start the app
   npx expo start

## Supabase Setup Notes

- Project hosted on Supabase (free tier)
- Auth provider: Email/Password (enabled in Supabase dashboard)
- Email confirmation: disabled for testing (toggle in Auth → Settings)
- Credentials are stored in .env and never committed