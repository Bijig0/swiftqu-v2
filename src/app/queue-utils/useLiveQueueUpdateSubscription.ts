import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { actionType } from '../types/types'
import useJoinQueue from './useJoinQueue'
import useLeaveQueue from './useLeaveQueue'
import { useSocketId } from './useSocketId'
import { useChannel } from '@/use-pusher/useChannel'
import { useEvent } from '@/use-pusher/useEvent'

// client sends: company_id + action_type

// if join-queue: receives
// joined_at, queue, user, position (types for queue and user tbd)
// if leave-queue: receives:
// company_id, action_type
// if queue_update: receives:
// company_id, action_type, user_who_left_id

const AuthenticatedUser = z.object({
  isAuthenticated: z.literal(true),
  message: z.string(),
  chat_token: z.string(),
})

const NonAuthenticatedUser = z.object({
  message: z.string(),
  isAuthenticated: z.literal(false),
})

const errorResponseSchema = z.object({
  status: z.literal('error'),
  message: z.string(),
})

type ErrorResponseSchema = z.infer<typeof errorResponseSchema>

const authenticationSchema = z.union([AuthenticatedUser, NonAuthenticatedUser])

const wsCompanyResponseSchema = z.object({
  companyId: z.number(),
  // queue_position: z.number(),
  actionType: z.enum(actionType),
})

type AuthenticationSchema = z.infer<typeof authenticationSchema>
type WSCompanyResponseSchema = z.infer<typeof wsCompanyResponseSchema>

type ParsedResponse =
  | ErrorResponseSchema
  | AuthenticationSchema
  | WSCompanyResponseSchema

type Params = {
  company_id: number
  individualQueueChannelName: string
  queueChannelName: string
  onJoin: () => void
  onLeave: () => void
  onSeat: () => void
}

const useLiveQueueUpdateSubscription = (params: Params) => {
  const {
    company_id,
    queueChannelName,
    individualQueueChannelName,
    onJoin,
    onLeave,
    onSeat,
  } = params

  const groupQueueChannel = useChannel(queueChannelName)
  const individualQueueChannel = useChannel(individualQueueChannelName)

  const socketId = useSocketId()

  useEvent(individualQueueChannel, 'join-queue', (data) => {
    const parsedData = wsCompanyResponseSchema.parse(data)
    onJoin()
    setIsJoined(true)
    queryClient.invalidateQueries({ queryKey: ['queueDetails', company_id] })
  })

  useEvent(groupQueueChannel, 'join-queue', () => {
    queryClient.invalidateQueries({ queryKey: ['queueDetails', company_id] })
    return
  })

  useEvent(individualQueueChannel, 'leave-queue', (data) => {
    console.log('Leave queue event')

    const parsedData = wsCompanyResponseSchema.parse(data)
    setHasLeft(true)
    queryClient.removeQueries({ queryKey: ['queueDetails', company_id] })
    queryClient.removeQueries({ queryKey: ['restaurant'] })
    onLeave()
  })

  useEvent(groupQueueChannel, 'leave-queue', (data) => {
    queryClient.invalidateQueries({ queryKey: ['queueDetails', company_id] })
    return
  })

  useEvent(individualQueueChannel, 'seat-user', (data) => {
    const parsedData = wsCompanyResponseSchema.parse(data)

    setHasLeft(true)
    queryClient.removeQueries({ queryKey: ['queueDetails', company_id] })
    onSeat()
  })

  useEvent(groupQueueChannel, 'seat-user', () => {
    queryClient.invalidateQueries({ queryKey: ['queueDetails', company_id] })
  })

  const queryClient = useQueryClient()
  const [isJoined, setIsJoined] = useState(false)
  const [hasLeft, setHasLeft] = useState(false)

  const { isPending: isJoining, mutate: joinQueueMutate } = useJoinQueue({
    onSuccess: () => {},
    onError: () => {},
  })
  const { isPending: isLeaving, mutate: leaveQueueMutate } = useLeaveQueue({
    onSuccess: () => {},
    onError: () => {},
  })

  console.log({ isJoining })
  console.log({ isLeaving })

  const isWaitingForQueueEvent = isJoining || isLeaving

  const leaveQueue = async () => {
    if (!socketId) throw new Error('No Socket ID found')

    const toSend = {
      eventName: 'leave-queue',
      data: {
        socketId: socketId,
        companyId: company_id,
      },
    } satisfies QueueActionSchema

    leaveQueueMutate(toSend)

    setIsJoined(false)
  }

  const joinQueue = () => {
    const toSend = {
      eventName: 'join-queue',
      data: {
        socketId: socketId,
        companyId: company_id,
      },
    } satisfies QueueActionSchema
    joinQueueMutate(toSend)

    setHasLeft(false)
  }

  useEffect(() => {
    joinQueue()
  }, [])

  return {
    joinQueue,
    leaveQueue,
    isJoined,
    hasLeft,
    isJoining,
    isLeaving,
    isWaitingForQueueEvent,
  }
}

export default useLiveQueueUpdateSubscription
