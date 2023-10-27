export default useFacebook;
declare function useFacebook({ appId, version, autoLogAppEvents, xfbml, debug, lang, }: {
    appId: string;
    version?: string;
    autoLogAppEvents?: boolean;
    xfbml?: boolean;
    debug?: boolean;
    lang?: string;
}): {
    isFacebookSDKReady: boolean;
};
