# use-facebook

Custom React hook for Facebook JavaScript SDK

<img src="https://user-images.githubusercontent.com/2131246/96389389-3d43db80-11a7-11eb-9aed-5f6ea596340b.png" alt="use facebook" width="512px" lazy />


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
