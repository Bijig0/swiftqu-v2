import getRestaurantData from '@/app/company/[companyId]/getRestaurantData'
import getQueueDetails from '@/app/queue-utils/getQueueDetails'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Heading from '@/components/ui/heading'
import { z } from 'zod'
import LeaveQueueManager from './LeaveQueueManager'

const paramsSchema = z.object({
  params: z.object({
    companyId: z.string().transform((val) => parseInt(val, 10)),
  }),
})

type Params = z.infer<typeof paramsSchema>

export default async function Index(params: unknown) {
  const {
    params: { companyId },
  } = paramsSchema.parse(params)

  const restaurantData = await getRestaurantData(companyId)

  const queueDetails = await getQueueDetails(companyId)

  const { position, realtime_channel_name: userChannelName } = queueDetails

  const { name, image_url } = restaurantData

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 py-16 sm:max-w-md">
      <Heading>{name} Waiting Room</Heading>
      <img
        src={image_url ?? ''}
        alt="Restaurant banner"
        className="h-36 w-full rounded-lg object-cover"
      />
      <Card className="mx-auto flex w-full items-center justify-center">
        <CardContent className="flex items-center justify-center py-16">
          <h1 className="font-primary-medium text-center text-5xl font-bold sm:text-6xl">
            {position}{' '}
            <span className="block text-lg font-light text-gray-500">
              in queue
            </span>
          </h1>
        </CardContent>
      </Card>
      <div className="flex w-full justify-evenly gap-4">
        <Button size={'lg'} className="flex-1 bg-blue-600">
          Chat With Us
        </Button>
        <LeaveQueueManager
          companyId={companyId}
          userChannelName={userChannelName!}
        />
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem className="no-underline" value="item-1">
          <AccordionTrigger className="no-underline">
            More Info
          </AccordionTrigger>
          <AccordionContent>
            <ul className=" ml-6 list-disc [&>li]:mt-2">
              <li>4 people ahead of you</li>
              <li>16 people behind you</li>
              <li>21 people in line</li>
              <li>Estimated witing time: 10 - 15 minutes</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <p className="self-start justify-self-end text-sm text-gray-500">
        Powered by <span className="underline">SwiftQu</span> - Virtusl Queues
        Made Easy
      </p>
    </div>
  )
}
