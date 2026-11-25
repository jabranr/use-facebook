#!/usr/bin/env bash
set -euo pipefail

# pinned so the test app does not change underneath you
CREATE_VITE_VERSION=9.3.4

# build and package use-facebook
npm run build
npm pack

# create a fresh vite app
rm -rf test-app
npx --yes "create-vite@${CREATE_VITE_VERSION}" test-app --template react-ts --no-interactive

# install the packaged version of use-facebook
mv use-facebook-*.tgz test-app/
cd test-app
npm i ./use-facebook-*.tgz
rm ./use-facebook-*.tgz

# set up App.tsx with use-facebook
cat > src/App.tsx <<'APP'
import { useEffect, useState } from 'react';
import useFacebook from 'use-facebook';

export default function App() {
  const { FB, error } = useFacebook({
    appId: import.meta.env.VITE_FB_APP_ID ?? '123456'
  });
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    FB?.getLoginStatus((res) => setConnected(res.status === 'connected'));
  }, [FB]);

  if (error) return <p>Could not load the Facebook SDK.</p>;

  return (
    <button
      disabled={!FB || isConnected}
      onClick={() =>
        FB?.login((res) => setConnected(res.status === 'connected'))
      }
    >
      {isConnected ? 'Connected' : 'Connect with Facebook'}
    </button>
  );
}
APP

npm install

echo "**************************************"
echo " "
echo "🥳 Test project setup!"
echo " "
echo "Use \"npm start\" to start the project"
echo " "
echo "**************************************"
