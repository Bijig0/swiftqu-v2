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
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useSocketId } from './queue-utils/useSocketId'
import Urls from './urls/urls'

const authTypes = ['phoneNumber', 'email'] as const

type AuthType = (typeof authTypes)[number]

const oppositeAuthType = {
  phoneNumber: 'email',
  email: 'phoneNumber',
} satisfies Record<AuthType, AuthType>

const switchAuthTypeText = {
  phoneNumber: 'Verify with email',
  email: 'Verify with phone number',
} satisfies Record<AuthType, string>

const phoneNumberVerificationSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
  email: z.undefined(), // This ensures email is not present
})

// Define the schema for the second variant
const emailVerificationSchema = z.object({
  name: z.string(),
  phoneNumber: z.undefined(), // This ensures phoneNumber is not present
  email: z.string(),
})

// Combine the schemas into a discriminated union
export const FormValuesSchema = z.union([
  phoneNumberVerificationSchema,
  emailVerificationSchema,
])

// Example usage
export type FormValues = z.infer<typeof FormValuesSchema>

type Props = {
  companySlug: string
}

const MainForm = (props: Props) => {
  const { companySlug } = props
  const form = useForm<FormValues>()
  const router = useRouter()
  const socketId = useSocketId()
  const [authType, setAuthType] = useState<AuthType>('phoneNumber')

  async function onSubmit(values: FormValues) {
    const { name } = values
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log({ socketId })

    // await joinQueue(companySlug, values.phoneNumber)

    if (values.phoneNumber) {
      const { phoneNumber } = values
      const baseUrl = Urls.otp

      const url = addQueryParamsToUrl(baseUrl, {
        phoneNumber: encodeURI(phoneNumber),
        name: encodeURI(name),
        companySlug: encodeURI(companySlug),
      })

      sendOTP(phoneNumber)

      router.push(url)

      return
    } else if (values.email) {
      // handle email verification here
    }

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
          {authType === 'phoneNumber' && (
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="phoneNumber"
                rules={{
                  required: 'Phone number is required',
                  validate: (val) =>
                    isValidPhoneNumber(val!, 'AU')
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
          )}
          {authType === 'email' && (
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: 'Email is required',
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
          )}
          <button
            onClick={() =>
              setAuthType((prevAuthType) => oppositeAuthType[prevAuthType])
            }
            className="self-end text-blue-400"
          >
            {switchAuthTypeText[authType]}
          </button>

          <Button type="submit" className="w-full">
            Queue Up
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default MainForm
