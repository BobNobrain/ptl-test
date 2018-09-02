# ptl-test

> a repo for ptl-rpc concepts test

## Commands

- Install dependencies: `npm i`
- Run server: `npm start` (env variable `$PORT` can be specified)
- Build static assets for client: `npm run static`

## Playground

Visit `/` on specified port to get access to simple client.
Interface may be not representing actual functionality, but
you always can play with `window.api` that is an instance
of `PtlClient`.

## The Concept

Main files to focus on:

- `/src/index.js` - client-side usage
- `/ptl/client/PtlClient.js` - client interface
- `/server/ptl.js` - server-side usage
- `/ptl/server/processPtlAction.js` - handling of Projectile actions
