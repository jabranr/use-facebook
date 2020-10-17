# use-facebook

Custom React hook to load Facebook web SDK

## Installation

```shell
npm install use-facebook
```

## Usage

```js
import useFacebook from 'use-facebook';

export default function MyFacebookLoginPage () {
  const { isFacebookSDKReady } = useFaebook(options);
}
```

### `options`

```js
options = {
  appId: 'abc-xyz',
  version: "v8.0",
  autoLogAppEvents: true,
  xfbml: true,
  debug: false,
  lang: "en_GB",
}
```

> `appId` is required


## License
MIT License

&copy; 2020 - present Jabran Rafique ([@jabranr](https://twitter.com/jabranr))
