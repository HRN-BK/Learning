# Learning

This repository contains simple HTML pages that demonstrate using [Supabase](https://supabase.com) for authentication and storing data.

## Setup

1. Create a Supabase project and copy your **Project URL** and **Anon API Key**.
2. In `public/supabase.js`, replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your credentials.
3. In Supabase, create three tables:
   - **vocabulary**: columns `id` (bigint, auto increment, primary key), `word` (text), `definition` (text).
   - **symbols**: columns `id` (bigint, auto increment, primary key), `symbol` (text), `value` (text).
   - **formulas**: columns `id` (bigint, auto increment, primary key), `formula` (text), `description` (text).

## Running locally

1. Open this folder in Visual Studio Code.
2. Install the **Live Server** extension if you do not already have it.
3. Right click an HTML file (for example `public/login.html`) and choose **Open with Live Server**. Your default browser will open with the page running on a local server.
4. Use the signup page to create an account, then log in and try adding vocabulary words, symbols, and formulas.
5. After submitting a form, refresh the page to verify that the stored data loads from Supabase.

