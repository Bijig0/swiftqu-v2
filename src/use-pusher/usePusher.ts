import { useEffect } from 'react'

import { usePusherContext } from '@/providers/AppPusherProvider'

/**
 * Provides access to the pusher client instance.
 *
 * @returns a `MutableRefObject<Pusher|undefined>`. The instance is held by a `useRef()` hook.
 * @example
 * ```javascript
 * const { client } = usePusher();
 * client.current.subscribe('my-channel');
 * ```
 */
export function usePusher() {
  const context = usePusherContext()
  useEffect(() => {
    if (!Object.keys(context).length) console.warn(NOT_IN_CONTEXT_WARNING)
  }, [context])
  return context
}

export const NOT_IN_CONTEXT_WARNING =
  'No Pusher context. Did you forget to wrap your app in a <PusherProvider />?'
