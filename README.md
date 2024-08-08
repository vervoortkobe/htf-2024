# SolidStart

Everything you need to build a Solid project, powered by [`solid-start`](https://start.solidjs.com);

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), apply drizzle migrations to setup local database:

```bash
npm run drizzle:migrate
```

Then you will be able to start development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev
```

## Building

Solid apps are built with _adapters_, which optimise your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different adapter, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.

## This project was created with the [Solid CLI](https://solid-cli.netlify.app)
