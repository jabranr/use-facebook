#!/usr/bin/env bash

npx create-react-app test-app --template=typescript
npm i -D @types/facebook-js-sdk

npm pack
mv use-facebook*.tgz test-app/

cd test-app

# remove unused files
rm src/App.css src/App.test.tsx src/logo.svg

# install packaged version of use-facebook
npm i ./use-facebook*.tgz
rm ./use-facebook*.tgz

# setup app.tsx with use-facebook
echo "
import { useState, useEffect } from 'react';
import useFacebook from 'use-facebook';

export default function App() {
  const { isFacebookSDKReady } = useFacebook({ appId: '123456' });
  const [isConnected,setConnected] = useState(false);

  useEffect(() => {
    window?.FB?.getLoginStatus(res => setConnected(res.status === 'connected'));
  }, [isFacebookSDKReady])

  function handleLogin() {
    if (!isConnected) FB.login();
  }

  return <button disabled={!isFacebookSDKReady} onClick={handleLogin}>{isConnected ? 'Conncted' : 'Connect with Facebook'}</button>;
}

" > src/App.tsx


echo "**************************************";
echo " ";
echo "🥳 Test project setup!";
echo " ";
echo "Use \"npm start\" to start the project";
echo " ";
echo "**************************************";