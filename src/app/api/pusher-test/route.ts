import Pusher from 'pusher'
import { z } from 'zod'

const paramsSchema = z.object({
  params: z.object({
    companyId: z.string(),
  }),
})

type Params = z.infer<typeof paramsSchema>

export async function GET(request: Request, params: unknown) {
  const pusher = new Pusher({
    appId: '1797241',
    key: '277f1a4ca1a936ef89d2',
    secret: 'ba3cf0653365fef783dc',
    cluster: 'ap4',
    useTLS: true,
  })

  pusher.trigger('my-channel', 'my-event', {
    message: 'hello world',
  })

  console.log('triggered')
}
