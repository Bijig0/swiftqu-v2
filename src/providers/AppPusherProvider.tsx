'use client'
import React from 'react'

import Pusher from 'pusher-js'

const PUSHER_KEY = '277f1a4ca1a936ef89d2'

export const initPusher = () => {
  const pusher = new Pusher(PUSHER_KEY, {
    cluster: 'ap4',
  })

  return pusher
}

type AppPusherContextValues = {
  client: ReturnType<typeof initPusher>
}

const PusherContext = React.createContext<AppPusherContextValues>(
  {} as AppPusherContextValues,
)

const AppPusherProvider = ({ children }: { children: React.ReactNode }) => {
  const pusherClient = initPusher()
  const channel = pusherClient.subscribe('my-channel')
  //   channel.bind('my-event', function (data: any) {
  //     alert(JSON.stringify(data))
  //   })
  return (
    <PusherContext.Provider value={{ client: pusherClient }}>
      {children}
    </PusherContext.Provider>
  )
}

export const usePusherContext = () => React.useContext(PusherContext)

export default AppPusherProvider
