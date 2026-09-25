# Persona Lab starter

An intentionally low-fidelity, connected paper prototype for the Codex Masterclass exercise.

For the participant workflow and copyable prompts, see [WORKSHOP-GUIDE.md](./WORKSHOP-GUIDE.md).

Participants turn three connected paper sketches (Landing, Workspace, and Results) into a website using the supplied fictional assets and copy.

## Preview in your Codex sandbox

Ask Codex to start a preview in your sandbox and return a browser-accessible URL. The repository's [agent guidance](AGENTS.md) describes the workshop VM preview setup.

```text
Start a preview of this Persona Lab starter in my sandbox. Follow the
repository's preview instructions and give me a browser-accessible URL.
```

## Prepared paper prototype and asset pack

The preview opens the paper mock at `/`. You can also visit
`/workshop/mock/index.html` for the connected
pencil-sketch mock, `/workshop/index.html` for the supplied brand logo,
characters, client stories, and supporter logos, and
`/workshop/instructions.html` for the workshop prompts.

See [the asset map](public/workshop/ASSETS.md). No participant uploads or
image generation are required. The paper prototype is a design reference,
not a finished website. There is no separate application mock.

## Exercise boundaries

- This app has no real browser or model integration.
- The sample journey and rationale are simulated; they are not human research.
- The paper prototype and workshop placeholders are preserved in the deployed site.

## Deployed site

After the deployment PR is merged, the paper mock will be available at
[Persona Lab on GitHub Pages](https://jingxuxuu.github.io/persona-lab/).
In repository **Settings → Pages**, the publishing source must be **GitHub Actions**.
Every push to `main` installs dependencies, runs tests, builds `dist/`, checks
the paper mock in Chromium, and deploys the output. Pull requests run the same
checks without deploying. Deployment status and the site URL appear in the
GitHub Pages workflow and the `github-pages` environment.

Production builds use `/persona-lab/` as their base path; local development
continues to open at `/`. To verify production paths locally, run `npm ci`,
`npm run build`, `npx playwright install chromium`, and `npm run test:pages`
(the test starts a temporary preview on local port 3004).
