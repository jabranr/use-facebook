# use-facebook

Custom React hook for Facebook JavaScript SDK

<img src="https://user-images.githubusercontent.com/2131246/96389389-3d43db80-11a7-11eb-9aed-5f6ea596340b.png" alt="use facebook" width="512px" lazy />


## Installation

```shell
npm install use-facebook
```

## Usage

```js
import React from 'react';
import useFacebook from 'use-facebook';

export default function MyFacebookLoginPage () {

  /**
   * Returns the state of SDK (true = loaded and ready to use)
   * options is an object (also detailed below)
   */
  const { isFacebookSDKReady } = useFaebook(options);

  
  /** 
   * Enable/disable the button based on SDK ready state
   * Show FB login dialog on click once enabled
   */
  return (
   <button disabled={!isFacebookSDKReady} onClick={() => FB.login()}>Connect with Facebook</button>
  );
}
```

> Read [Facebook SDK docs](https://developers.facebook.com/docs/graph-api/using-graph-api/using-with-sdks#javascript-sdk) for `FB` API usage.


### `options`

```js
options = {
  appId: 'abcxyz',
  version: "v8.0",
  autoLogAppEvents: true,
  xfbml: true,
  debug: false,
  lang: "en_GB",
}
```

> `appId` is required and everything else is optional.


## License
MIT License

&copy; 2020 - present Jabran Rafique ([@jabranr](https://twitter.com/jabranr))
