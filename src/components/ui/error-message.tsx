import { FormDescription } from './form'

type ErrorMessageProps = {
  children: React.ReactNode
}

export const ErrorMessage = (props: ErrorMessageProps) => {
  const { children } = props
  return (
    <FormDescription className="text-sm text-red-500">
      {children}
    </FormDescription>
  )
}
