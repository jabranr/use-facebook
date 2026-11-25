import { StrictMode } from 'react';
import {
  act,
  cleanup,
  render,
  renderHook,
  waitFor
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useFacebook, {
  DEFAULT_VERSION,
  SCRIPT_ID,
  __resetForTests,
  loadFacebookSDK,
  type UseFacebookResult
} from './index';

type TestWindow = Window & {
  FB?: unknown;
  fbAsyncInit?: () => void;
};
const win = window as TestWindow;

const fakeFB = { init: vi.fn(), login: vi.fn() };

function scripts() {
  return document.querySelectorAll(`script#${SCRIPT_ID}`);
}

/** Simulates the SDK script finishing loading. */
function sdkLoads() {
  act(() => {
    win.FB = fakeFB;
    win.fbAsyncInit?.();
  });
}

function Harness({ onResult }: { onResult: (r: UseFacebookResult) => void }) {
  onResult(useFacebook({ appId: '123' }));
  return null;
}

describe('useFacebook', () => {
  beforeEach(() => {
    __resetForTests();
    delete win.FB;
    delete win.fbAsyncInit;
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('is not ready until the SDK has loaded', () => {
    const { result } = renderHook(() => useFacebook({ appId: '123' }));
    expect(result.current).toEqual({
      isFacebookSDKReady: false,
      FB: null,
      error: null
    });
  });

  it('injects one script with the right URL', () => {
    renderHook(() => useFacebook({ appId: '123', lang: 'en_US', debug: true }));
    expect(scripts()).toHaveLength(1);
    const script = scripts()[0] as HTMLScriptElement;
    expect(script.src).toBe('https://connect.facebook.net/en_US/sdk/debug.js');
    expect(script.async).toBe(true);
  });

  it('initialises FB and becomes ready', async () => {
    const { result } = renderHook(() => useFacebook({ appId: '123' }));
    sdkLoads();
    await waitFor(() => expect(result.current.isFacebookSDKReady).toBe(true));
    expect(result.current.FB).toBe(fakeFB);
    expect(fakeFB.init).toHaveBeenCalledWith({
      appId: '123',
      version: DEFAULT_VERSION,
      autoLogAppEvents: true,
      xfbml: true
    });
  });

  it('makes every hook instance ready, not just the last one mounted', async () => {
    const results: UseFacebookResult[] = [];
    render(
      <>
        <Harness onResult={(r) => (results[0] = r)} />
        <Harness onResult={(r) => (results[1] = r)} />
      </>
    );
    expect(scripts()).toHaveLength(1);

    // Before the SDK loads, neither instance claims to be ready.
    expect(results[0]!.isFacebookSDKReady).toBe(false);
    expect(results[1]!.isFacebookSDKReady).toBe(false);

    sdkLoads();
    await waitFor(() => {
      expect(results[0]!.isFacebookSDKReady).toBe(true);
      expect(results[1]!.isFacebookSDKReady).toBe(true);
    });
    expect(fakeFB.init).toHaveBeenCalledTimes(1);
  });

  it('loads once under StrictMode', async () => {
    let last!: UseFacebookResult;
    render(
      <StrictMode>
        <Harness onResult={(r) => (last = r)} />
      </StrictMode>
    );
    expect(scripts()).toHaveLength(1);
    sdkLoads();
    await waitFor(() => expect(last.isFacebookSDKReady).toBe(true));
    expect(fakeFB.init).toHaveBeenCalledTimes(1);
  });

  it('is ready immediately when mounted after the SDK has loaded', async () => {
    const first = renderHook(() => useFacebook({ appId: '123' }));
    sdkLoads();
    await waitFor(() =>
      expect(first.result.current.isFacebookSDKReady).toBe(true)
    );

    const second = renderHook(() => useFacebook({ appId: '123' }));
    expect(second.result.current.isFacebookSDKReady).toBe(true);
  });

  it('waits for a script tag added by someone else', async () => {
    const existing = document.createElement('script');
    existing.id = SCRIPT_ID;
    document.head.appendChild(existing);

    const { result } = renderHook(() => useFacebook({ appId: '123' }));
    expect(scripts()).toHaveLength(1);
    expect(result.current.isFacebookSDKReady).toBe(false);

    sdkLoads();
    await waitFor(() => expect(result.current.isFacebookSDKReady).toBe(true));
  });

  it('keeps an existing fbAsyncInit handler', async () => {
    const previous = vi.fn();
    win.fbAsyncInit = previous;
    const { result } = renderHook(() => useFacebook({ appId: '123' }));
    sdkLoads();
    await waitFor(() => expect(result.current.isFacebookSDKReady).toBe(true));
    expect(previous).toHaveBeenCalledTimes(1);
  });

  it('uses an SDK that is already on the page', async () => {
    win.FB = fakeFB;
    const { result } = renderHook(() => useFacebook({ appId: '123' }));
    await waitFor(() => expect(result.current.isFacebookSDKReady).toBe(true));
    expect(scripts()).toHaveLength(0);
  });

  it('reports a load error and allows a retry', async () => {
    const { result } = renderHook(() => useFacebook({ appId: '123' }));
    act(() => {
      scripts()[0]!.dispatchEvent(new Event('error'));
    });
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.isFacebookSDKReady).toBe(false);
    expect(scripts()).toHaveLength(0);

    const retry = loadFacebookSDK({ appId: '123' });
    expect(scripts()).toHaveLength(1);
    sdkLoads();
    await expect(retry).resolves.toBe(fakeFB);
  });

  it('warns when called again with different options', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    void loadFacebookSDK({ appId: '123' });
    void loadFacebookSDK({ appId: '123' });
    expect(warn).not.toHaveBeenCalled();
    void loadFacebookSDK({ appId: '456' });
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
