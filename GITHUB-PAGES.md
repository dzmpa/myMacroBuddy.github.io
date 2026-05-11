# GitHub Pages

This app is ready to publish on GitHub Pages.

## Publish

1. Push this folder to the `main` branch of your GitHub repository.
2. Open `Settings -> Pages`.
3. In `Build and deployment`, choose `GitHub Actions`.
4. The workflow `.github/workflows/deploy-pages.yml` will deploy the app automatically after each push to `main`.

## Public URL

Your current remote is:

`https://github.com/dzmpa/myMacroBuddy.github.io`

Because the repository ends in `.github.io`, GitHub Pages should publish it at:

`https://dzmpa.github.io/`

## Notes

- The app is a static site, so no backend is required.
- User data stays in the user's browser with IndexedDB/localStorage.
- The PWA and service worker work on GitHub Pages because it is served over HTTPS.
- After the first deploy, test the live site once and do a hard refresh if an older service worker cache appears.
