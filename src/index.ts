/// <reference types="facebook-js-sdk" />
import { useEffect, useRef, useState } from 'react';

export type FacebookSDK = facebook.FacebookStatic;

export type UseFacebookOptions = {
  /** Your Facebook app ID. */
  appId: string;
  /** Graph API version, e.g. `v26.0`. */
  version?: string;
  autoLogAppEvents?: boolean;
  xfbml?: boolean;
  cookie?: boolean;
  status?: boolean;
  /** Load the debug build of the SDK. */
  debug?: boolean;
  /** SDK locale, e.g. `en_US`. */
  lang?: string;
};

export type UseFacebookResult = {
  /** `true` once the SDK has loaded and `FB.init()` has run. */
  isFacebookSDKReady: boolean;
  /** The `FB` object, or `null` until the SDK is ready. */
  FB: FacebookSDK | null;
  /** Error raised while loading the SDK, otherwise `null`. */
  error: unknown | null;
};

export const DEFAULT_VERSION = 'v26.0';
export const SCRIPT_ID = 'facebook-jssdk';

type FacebookWindow = Window & {
  FB?: FacebookSDK;
  fbAsyncInit?: () => void;
};

let sdkPromise: Promise<FacebookSDK> | null = null;
let loadedSDK: FacebookSDK | null = null;
let configuredKey: string | null = null;

/**
 * Loads and initialises the Facebook SDK once per page. Later calls return
 * the same promise; options that differ from the first call are ignored.
 */
export function loadFacebookSDK({
  appId,
  version = DEFAULT_VERSION,
  autoLogAppEvents = true,
  xfbml = true,
  cookie,
  status,
  debug = false,
  lang = 'en_GB'
}: UseFacebookOptions): Promise<FacebookSDK> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('The Facebook SDK can only be loaded in a browser.')
    );
  }

  const initParams: facebook.InitParams = {
    appId,
    version,
    autoLogAppEvents,
    xfbml,
    ...(cookie === undefined ? {} : { cookie }),
    ...(status === undefined ? {} : { status })
  };
  const key = JSON.stringify({ initParams, debug, lang });

  if (sdkPromise) {
    if (configuredKey !== key) {
      console.warn(
        '[use-facebook] The Facebook SDK is loaded once per page. ' +
          'Options that differ from the first call are ignored.'
      );
    }
    return sdkPromise;
  }

  configuredKey = key;
  const win = window as FacebookWindow;

  sdkPromise = new Promise<FacebookSDK>((resolve, reject) => {
    const init = () => {
      const FB = win.FB;
      if (!FB) {
        reject(new Error('The Facebook SDK loaded but FB is not defined.'));
        return;
      }
      FB.init(initParams);
      loadedSDK = FB;
      resolve(FB);
    };

    // The SDK is already on the page (loaded outside this hook).
    if (win.FB) {
      init();
      return;
    }

    // The SDK calls fbAsyncInit once it loads. Keep any existing handler.
    const previous = win.fbAsyncInit;
    win.fbAsyncInit = () => {
      previous?.();
      init();
    };

    // A script tag is already loading the SDK: wait for fbAsyncInit.
    if (document.getElementById(SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://connect.facebook.net/${lang}/sdk${debug ? '/debug' : ''}.js`;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      script.remove();
      win.fbAsyncInit = previous;
      sdkPromise = null;
      configuredKey = null;
      reject(new Error(`Failed to load the Facebook SDK from ${script.src}`));
    };
    (document.head ?? document.body).appendChild(script);
  });

  return sdkPromise;
}

/** @internal Resets the once-per-page loader state. For tests only. */
export function __resetForTests() {
  sdkPromise = null;
  loadedSDK = null;
  configuredKey = null;
}

/**
 * React hook that loads the Facebook SDK and reports when it is ready.
 * Options are read on first mount; the SDK is loaded once per page.
 */
export default function useFacebook(
  options: UseFacebookOptions
): UseFacebookResult {
  const [FB, setFB] = useState<FacebookSDK | null>(() => loadedSDK);
  const [error, setError] = useState<unknown | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    let cancelled = false;

    loadFacebookSDK(optionsRef.current).then(
      (sdk) => {
        if (!cancelled) {
          setError(null);
          setFB(() => sdk);
        }
      },
      (err: unknown) => {
        if (!cancelled) setError(err);
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return { isFacebookSDKReady: FB !== null, FB, error };
}
