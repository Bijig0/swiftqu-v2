import { usePusher } from '@harelpls/use-pusher'
import { useRef } from 'react'

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
  const socketRef = useRef<string>()
  const connectionState = pusher.client?.connection.state
  if (connectionState !== 'connected')
    throw new Error(
      `Cannot get socket id, not connected to pusher, connection state is ${connectionState}`,
    )
  const socketId = pusher.client?.connection.socket_id
  if (!socketId) throw new Error('Cannot get socket id')
  socketRef.current = socketId
  return socketRef.current
}
