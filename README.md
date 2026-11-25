# use-facebook [![Publish to npm](https://github.com/jabranr/use-facebook/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/jabranr/use-facebook/actions/workflows/npm-publish.yml)

React hook to load the Facebook JavaScript SDK

<img src="https://user-images.githubusercontent.com/2131246/96389389-3d43db80-11a7-11eb-9aed-5f6ea596340b.png" alt="use facebook" width="512px" loading="lazy" />

## Installation

```shell
npm install use-facebook
```

TypeScript types for `FB` (`@types/facebook-js-sdk`) are installed with the package.

## Usage

A button that opens the Facebook login dialog once the SDK is ready:

```tsx
import useFacebook from 'use-facebook';

export default function FacebookLogin() {
  const { FB, error } = useFacebook({ appId: '123456789' });

  if (error) return <p>Could not load Facebook.</p>;

  return (
    <button disabled={!FB} onClick={() => FB?.login(console.log)}>
      Connect with Facebook
    </button>
  );
}
```

> Read the [Facebook SDK docs](https://developers.facebook.com/docs/javascript) for the `FB` API.

The SDK is loaded and initialised once per page, however many components use the hook. Options are read when the first component mounts; later calls with different options log a warning and reuse the loaded SDK.

Outside React, `loadFacebookSDK(options)` returns a promise for `FB`:

```ts
import { loadFacebookSDK } from 'use-facebook';

const FB = await loadFacebookSDK({ appId: '123456789' });
```

### Options

```ts
{
  appId: '123456789',     // required
  version: 'v26.0',       // Graph API version
  autoLogAppEvents: true,
  xfbml: true,
  cookie: undefined,      // passed to FB.init when set
  status: undefined,      // passed to FB.init when set
  debug: false,           // load the debug build of the SDK
  lang: 'en_GB'           // SDK locale
}
```

Facebook retires Graph API versions about two years after release. Pin `version` to the one your app is set up for: https://developers.facebook.com/docs/graph-api/changelog/versions

### Return value

| Field                | Type                     | Description                                         |
| -------------------- | ------------------------ | --------------------------------------------------- |
| `isFacebookSDKReady` | `boolean`                | `true` once the SDK has loaded and been initialised |
| `FB`                 | `FacebookStatic \| null` | The `FB` object, or `null` until ready              |
| `error`              | `unknown \| null`        | Error raised while loading the SDK                  |

If the script fails to load (for example, blocked by an ad blocker), `error` is set and the next call to the hook or `loadFacebookSDK` tries again.

## Migrating from v1

- The default Graph API version is now `v26.0` (it was `v18.0`, which Facebook has retired).
- `isFacebookSDKReady` is now only `true` once `FB.init()` has run. It was sometimes `true` early when the script tag already existed.
- The package is built for both ESM and CommonJS and uses an `exports` map. Import from `use-facebook` only; deep imports such as `use-facebook/index.js` no longer work.
- `react` is a peer dependency (17, 18 or 19).

## Development

```sh
npm install
npm test             # unit tests
npm run typecheck
npm run format:check
npm run setup        # builds the package into a Vite test app
npm start            # set VITE_FB_APP_ID to use your own app
```

## Releasing

Merges to `main` are published to npm automatically with [trusted publishing](https://docs.npmjs.com/trusted-publishers). The version is bumped from [Conventional Commits](https://www.conventionalcommits.org/). To publish a pre-release from a pull request under the `rc` tag, include `[publish]` in the PR's latest commit message.

## License

MIT License

&copy; 2020 - present Jabran Rafique ([@jabranr](https://twitter.com/jabranr))
