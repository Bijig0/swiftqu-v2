'use client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useSocketId } from './queue-utils/useSocketId'
import Urls from './urls/urls'

export type FormValues = {
  name: string
  phoneNumber: string
  email: string
}

type Props = {
  companyId: number
}

const MainForm = (props: Props) => {
  const { companyId } = props
  const form = useForm<FormValues>()
  const router = useRouter()
  const socketId = useSocketId()

  // const pusher = initPusher()

  // var channel = pusher.subscribe('my-channel')
  // channel.bind('my-event', function (data) {
  //   alert(JSON.stringify(data))
  // })

  async function onSubmit(values: FormValues) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log({ socketId })

    // await joinQueue(companyId, values.phoneNumber)

    const cleanPhoneNumber = (phoneNumber: string): string =>
      phoneNumber.replace(/\D/g, '')

    const phoneNumber = cleanPhoneNumber(values.phoneNumber)

    const addQueryParam = (url: string, param: string, value: string) =>
      `${url}?${param}=${value}`

    const baseUrl = Urls.otp(companyId)

    const url = addQueryParam(baseUrl, 'phoneNumber', phoneNumber)

    router.push(url)
    console.log(values)
  }

  const {
    handleSubmit,
    formState: { errors },
  } = form
  console.log(errors)
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      {...field}
                    />
                  </FormControl>
                  {errors.name && (
                    <ErrorMessage>{errors.name.message}</ErrorMessage>
                  )}
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="phoneNumber"
              rules={{
                required: 'Phone number is required',
                validate: (val) =>
                  isValidPhoneNumber(val, 'AU')
                    ? true
                    : 'This field must be a valid AU phone number',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+61 403 057 369"
                      {...field}
                    />
                  </FormControl>
                  {errors.phoneNumber && (
                    <ErrorMessage>{errors.phoneNumber.message}</ErrorMessage>
                  )}
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              rules={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'invalid email address',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email{' '}
                    <span className="text-md text-gray-500">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  {errors.email && (
                    <ErrorMessage>{errors.email.message}</ErrorMessage>
                  )}
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full">
            Queue Up
          </Button>
        </div>
      </form>
    </Form>
  )
}

type ErrorMessageProps = {
  children: React.ReactNode
}

const ErrorMessage = (props: ErrorMessageProps) => {
  const { children } = props
  return (
    <FormDescription className="text-sm text-red-500">
      {children}
    </FormDescription>
  )
}

export default MainForm
