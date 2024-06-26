import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { z } from 'zod'
import MainForm from '../../form'
import getRestaurantData from './getRestaurantData'
import Urls from '@/app/urls/urls'
import { redirect } from 'next/navigation'
import checkUserInQueue from './checkUserInQueue'

const paramsSchema = z.object({
  params: z.object({
    companyId: z.string().transform((val) => parseInt(val)),
  }),
})

type Params = z.infer<typeof paramsSchema>

export default async function Index(params: unknown) {
  const {
    params: { companyId },
  } = paramsSchema.parse(params)

  const isUserInQueue = await checkUserInQueue(companyId)

  if (isUserInQueue) {
    redirect(Urls.queue(companyId))
  }

  // console.log({ isUserInQueue })

  const restaurantData = await getRestaurantData(companyId)

  const { name, image_url } = restaurantData

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 py-16 sm:max-w-md">
      <h1 className="self-start text-3xl font-extrabold">{name} Queue</h1>
      <img
        src={image_url ?? ''}
        alt="Restaurant banner"
        className="h-36 w-full rounded-lg object-cover"
      />
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Queue Up</CardTitle>
          <CardDescription>
            Enter your details below to enter the queue!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MainForm companyId={companyId} />
        </CardContent>
      </Card>
      <p className="self-start justify-self-end text-sm text-gray-500">
        Powered by <span className="underline">SwiftQu</span> - Virtusl Queues
        Made Easy
      </p>
    </div>
  )
}
