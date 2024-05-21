import { usePusher } from '@/use-pusher/usePusher'
import { useEffect, useState } from 'react'

const connectionStates = ['connected', 'connecting', 'rejected'] as const

type ConnectionState = (typeof connectionStates)[number]

type BoundStates = {
  current: ConnectionState
  prev: ConnectionState
}

/**
 * Provides access to the pusher client instance.
 *
 * @returns a `MutableRefObject<Pusher|undefined>`. The instance is held by a `useRef()` hook.
 * @example
 * ```javascript
 * const { client } = useSocketId();
 * client.current.subscribe('my-channel');
 * ```
 */
export function useSocketId() {
  const pusher = usePusher()
  // const connectionState = pusher.client?.connection.state;
  const [isPending, setIsPending] = useState(true)

  const [socketId, setSocketId] = useState<string | null>(null)

  useEffect(() => {
    if (pusher.client === undefined) return

    pusher.client.connection.bind('state_change', (states: BoundStates) => {
      if (pusher.client === undefined)
        throw new Error('Pusher client not set (it is undefined)')
      if (states.current === 'connected') {
        const socketIdToSet = pusher.client.connection.socket_id
        console.log(`Setting socket id ${socketIdToSet}`)
        setSocketId(socketIdToSet)
        console.log(`Set socket id ${socketIdToSet}`)
        setIsPending(false)
      } else if (states.current === 'rejected') {
        throw new Error('Pusher connection rejected')
      }
    })
  }, [pusher])

  return { socketId, isPending }
}
