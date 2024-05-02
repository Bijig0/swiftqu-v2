'use client'

import { PusherProvider as _PusherProvider } from '@harelpls/use-pusher'

const config = {
  // required config props
  clientKey: 'client-key',
  cluster: 'ap4',

  // optional if you'd like to trigger events. BYO endpoint.
  // see "Trigger Server" below for more info
  triggerEndpoint: '/pusher/trigger',

  // required for private/presence channels
  // also sends auth headers to trigger endpoint
  authEndpoint: '/pusher/auth',
  auth: {
    headers: { Authorization: 'Bearer token' },
  },
}

const PusherProvider = ({ children }: { children: React.ReactNode }) => {
  return <_PusherProvider {...config}>{children}</_PusherProvider>
}

export default PusherProvider
