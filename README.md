# Welcome to INSPECTRA


**Installation**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```


## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- OpenAI API (GPT-4 Vision)

## Environment Variables Setup

This application requires an OpenAI API key to function. Follow these steps to configure it:

### Local Development

1. Create a `.env.local` file in the project root directory
2. Add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

**Important:** The `.env.local` file is gitignored and will not be committed to the repository.

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add a new variable:
   - **Name:** `VITE_OPENAI_API_KEY`
   - **Value:** Your OpenAI API key
   - **Environment:** Select Production, Preview, and/or Development as needed
4. Redeploy your application for the changes to take effect

**Security Note:** The API key will be visible in the browser bundle since it's a client-side application. Consider using OpenAI API key restrictions and monitoring usage in your OpenAI dashboard.
