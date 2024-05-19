import { input } from '@inquirer/prompts'

function retrieveChatChannelName(
  userIdentifier: string | null,
  companyId: number,
): string | null {
  if (userIdentifier === null) return null

  const validChars = 'abcdefghijklmnopqrstuvwxyz0123456789-_'

  function cleanUserIdentifier(userIdentifier: string): string {
    let cleanedUserIdentifier = ''
    for (let i = 0; i < userIdentifier.length; i++) {
      if (validChars.includes(userIdentifier[i])) {
        cleanedUserIdentifier += userIdentifier[i]
      }
    }
    return cleanedUserIdentifier
  }

  const cleanedUserIdentifier = cleanUserIdentifier(userIdentifier)
  return `user-${cleanedUserIdentifier}-company_id-${companyId}-at-`
}

if (require.main !== undefined && require.main === module) {
  ;(async () => {
    const userChatId = await input({ message: "Enter the user's chat id" })
    const companyId = await input({ message: 'Enter the company id' })
    const asNumber = parseInt(companyId, 10)
    console.log({ asNumber })
    const chatChannelName = retrieveChatChannelName(userChatId, asNumber)
    console.log({ chatChannelName })
  })()
}

export default retrieveChatChannelName
