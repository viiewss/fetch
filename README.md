# Fetch Dog Adoption App

A React web app for searching shelter dogs, built for the Fetch Frontend Take-Home Exercise.

## Prerequisites
- Node.js (v16 or higher)
- npm

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/mahirmohtasin/fetch.git
   cd fetch
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   This starts Vite's development server at http://localhost:5173 with hot module reloading.

4. Build for production:
   ```bash
   npm run build
   ```
   The optimized output will be in the `dist` directory.

5. Run tests:
   ```bash
   npm test
   ```
   This will execute Jest unit tests using React Testing Library.

## Deploying to GitHub Pages
To publish the production build to GitHub Pages run:
```bash
npm run deploy
```
This script builds the app and pushes the `dist` directory to the `gh-pages` branch. The site will be available at `https://<your-github-username>.github.io/fetch/`.
