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

export const phoneNumberVerificationSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
})

// Define the schema for the second variant
export const emailVerificationSchema = z.object({
  name: z.string(),
  phoneNumber: z.undefined().nullable(), // This ensures phoneNumber is not present
  email: z.string().email(),
})

// Combine the schemas into a discriminated union
export const UserInfoFormValuesSchema = phoneNumberVerificationSchema

// Example usage
export type UserInfoFormValues = z.infer<typeof UserInfoFormValuesSchema>

type Props = {
  companyId: number
}

const MainForm = (props: Props) => {
  const { companyId } = props
  const form = useForm<UserInfoFormValues>()
  const router = useRouter()
  const socketId = useSocketId()
  const [authType, setAuthType] = useState<AuthType>('phoneNumber')

  async function onSubmit(values: UserInfoFormValues) {
    const { name } = values
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log({ socketId })

    // await joinQueue(companyId, values.phoneNumber)

    if (values.phoneNumber) {
      const { phoneNumber } = values
      const baseUrl = Urls.otp

      const url = addQueryParamsToUrl(baseUrl, {
        phoneNumber: encodeURI(phoneNumber),
        name: encodeURI(name),
        companyId: companyId.toString(),
      })

      sendOTP(phoneNumber)

      router.push(url)

      return
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
                rules={
                  authType === 'phoneNumber'
                    ? {
                        required: 'Phone number is required',
                        validate: (val) =>
                          isValidPhoneNumber(val!, 'AU')
                            ? true
                            : 'This field must be a valid AU phone number',
                      }
                    : {}
                }
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

          <Button type="submit" className="w-full">
            Queue Up
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default MainForm
