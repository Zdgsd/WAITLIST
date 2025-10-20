import { lazy, Suspense } from 'react';

const NetworkBackground = lazy(() => import('./effects/NetworkBackground').then(module => ({ default: module.NetworkBackground })));
const ChatInterface = lazy(() => import('./scenes/Chat').then(module => ({ default: module.Chat })));

export const LazyNetworkBackground = (props: any) => (
  <Suspense fallback={<div className="w-full h-full bg-black" />}>
    <NetworkBackground {...props} />
  </Suspense>
);

export const LazyChatInterface = (props: any) => (
  <Suspense fallback={<div className="text-terminal-green">Loading chat...</div>}>
    <ChatInterface {...props} />
  </Suspense>
);