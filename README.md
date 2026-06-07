<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d07d3c06-4998-4436-b36f-94a1e400ddcf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

This application is configured for automated deployment to **GitHub Pages** via GitHub Actions.

### Setup Instructions:
1. Go to your repository settings on GitHub.
2. Navigate to **Pages** in the left sidebar.
3. Under **Build and deployment** -> **Source**, select **GitHub Actions** from the dropdown.

The deployment workflow will run automatically on push/merge to the `main` branch.

