import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Heading from '@/components/ui/heading'
import { createServerClient } from '@/utils/supabase/supabase'
import console from 'console'
import { cookies } from 'next/headers'
import { z } from 'zod'

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

  const supabase = createServerClient()
  const { data, error } = await supabase.auth.getUser()

  console.log({ data, error })

  if (error) throw error

  console.log({ data })

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 py-16 sm:max-w-md">
      <Heading>{companySlug} Waiting Room</Heading>
      <img
        src="https://storage.fantuan.ca/fantuan/au/default/blob/ced89be74ba0463198110a755f4eb527/1678660559899275264."
        alt="Restaurant banner"
        className="object-cover rounded-lg"
      />
      <Card className="flex items-center justify-center w-full mx-auto">
        <CardContent className="flex items-center justify-center py-16">
          <h1 className="text-5xl font-bold text-center font-primary-medium sm:text-6xl">
            3rd{' '}
            <span className="block text-lg font-light text-gray-500">
              in queue
            </span>
          </h1>
        </CardContent>
      </Card>
      <div className="flex w-full gap-4 justify-evenly">
        <Button size={'lg'} className="flex-1 bg-blue-600">
          Chat With Us
        </Button>
        <Button size="lg" className="flex-1 bg-red-700 hover:bg-red-800 ">
          Leave Queue
        </Button>
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

      <p className="self-start text-sm text-gray-500 justify-self-end">
        Powered by <span className="underline">SwiftQu</span> - Virtusl Queues
        Made Easy
      </p>
    </div>
  )
}
