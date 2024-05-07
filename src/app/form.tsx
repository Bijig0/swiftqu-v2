'use client'
import sendOTP from '@/app/serverActions/sendOTP'
import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/ui/error-message'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import addQueryParamsToUrl from '@/utils/add-query-params-to-url'
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
  companySlug: string
}

const createPhoneNumberVerifyOTPUrl = (
  companySlug: string,
  phoneNumber: string,
): string => {
  const cleanPhoneNumber = (phoneNumber: string): string =>
    phoneNumber.replace(/\D/g, '')

  const cleanedPhoneNumber = cleanPhoneNumber(phoneNumber)

  const baseUrl = Urls.otp

  const url = addQueryParamsToUrl(baseUrl, {
    phoneNumber: cleanedPhoneNumber,
    companySlug,
  })
  
  return url
}

const MainForm = (props: Props) => {
  const { companySlug } = props
  const form = useForm<FormValues>()
  const router = useRouter()
  const socketId = useSocketId()

  async function onSubmit(values: FormValues) {
    const { email, phoneNumber } = values
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log({ socketId })

    // await joinQueue(companySlug, values.phoneNumber)

    const url = createPhoneNumberVerifyOTPUrl(companySlug, phoneNumber)

    sendOTP(phoneNumber)

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
                    <span className="text-gray-500 text-md">(optional)</span>
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

export default MainForm
