import Pusher from 'pusher'

export const initPusher = () => {
  const pusher = new Pusher({
    appId: '1749925',
    key: 'f1dfa6008a40908ad2e3',
    secret: '3937a1e9cbcc30c7dc90',
    cluster: 'ap1',
  })

  return pusher
}
