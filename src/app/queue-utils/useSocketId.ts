import { usePusher } from '@/use-pusher/usePusher'
import { useEffect, useState } from 'react'

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
  const [socketId, setSocketId] = useState<string | undefined>(undefined)
  console.log({ pusher })
  const connectionState = pusher.client?.connection?.state
  useEffect(() => {
    console.log({ connectionState })
    const socketId = pusher.client?.connection?.socket_id
    console.log({ socketId })
    if (connectionState !== 'connected') return
    console.log({ connectionState })
    setSocketId(socketId)
  }, [connectionState])
  return socketId
}
