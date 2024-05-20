import Urls from '@/app/urls/urls'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import MainForm from '../../form'
import checkUserInQueue from './checkUserInQueue'
import getRestaurantData from './getRestaurantData'

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

  console.log({ isUserInQueue })

  const restaurantData = await getRestaurantData(companyId)

  const { name, image_url } = restaurantData

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 py-16 sm:max-w-md">
      <h1 className="self-start text-3xl font-extrabold">{name} Queue</h1>
      <img
        src={image_url ?? ''}
        alt="Restaurant banner"
        className="object-cover w-full rounded-lg h-36"
      />
      <Card className="w-full mx-auto">
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
      <p className="self-start text-sm text-gray-500 justify-self-end">
        Powered by <span className="underline">SwiftQu</span> - Virtusl Queues
        Made Easy
      </p>
    </div>
  )
}
