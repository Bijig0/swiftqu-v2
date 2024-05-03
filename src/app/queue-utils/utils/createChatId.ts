import { confirm, input } from '@inquirer/prompts'
import { UserSchema } from './schemas'

export function createCompliantGetStreamChatId(user: UserSchema): string {
  const userId = user.phoneNumber.concat(user.firstName)

  const compliantChars = 'abcdefghijklmnopqrstuvwxyz0123456789@e'
  let compliantId = ''

  for (const char of userId) {
    if (compliantChars.includes(char)) {
      compliantId += char
    }
  }

  if (user.isRestaurantAdmin) {
    compliantId = `${user.firstName}-admin-${compliantId}`
  }

  return compliantId
}

if (require.main === module) {
  ;(async () => {
    const userId = await input({ message: 'Enter the userId' })
    const firstName = await input({ message: 'Enter the first name' })
    const lastName = await input({ message: 'Enter the last name' })
    const phoneNumber = await input({ message: 'Enter the phone number' })
    const isRestaurantAdmin = await confirm({
      message: 'Enter if is restaurant admin',
    })
    const user = {
      userId,
      firstName,
      lastName,
      phoneNumber,
      isRestaurantAdmin,
    } satisfies UserSchema
    const chatId = createCompliantGetStreamChatId(user)
    console.log({ chatId })
  })()
}
