'use client'

import { PusherProvider as _PusherProvider } from '@harelpls/use-pusher'

const PUSHER_API_KEY = 'f1dfa6008a40908ad2e3'
const PUSHER_CLUSTER = 'api'

const config = {
  // required config props
  clientKey: PUSHER_API_KEY,
  cluster: PUSHER_CLUSTER,

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
