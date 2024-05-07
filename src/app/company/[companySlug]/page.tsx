import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { z } from 'zod'
import MainForm from '../../form'

const paramsSchema = z.object({
  params: z.object({
    companySlug: z.string(),
  }),
})

type Params = z.infer<typeof paramsSchema>

export default async function Index(params: unknown) {
  const {
    params: { companySlug },
  } = paramsSchema.parse(params)
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 py-16 sm:max-w-md">
      <h1 className="self-start text-3xl font-extrabold">HaiDiLao Queue</h1>
      <img
        src="https://storage.fantuan.ca/fantuan/au/default/blob/ced89be74ba0463198110a755f4eb527/1678660559899275264."
        alt="Restaurant banner"
        className="object-cover rounded-lg"
      />
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Queue Up</CardTitle>
          <CardDescription>
            Enter your details below to enter the queue!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MainForm companySlug={companySlug} />
        </CardContent>
      </Card>
      <p className="self-start text-sm text-gray-500 justify-self-end">
        Powered by <span className="underline">SwiftQu</span> - Virtusl Queues
        Made Easy
      </p>
    </div>
  )
}
