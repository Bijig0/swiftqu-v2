import { input } from '@inquirer/prompts'
import { DefaultGenerics, UserResponse } from 'stream-chat'
import { serverClient } from '../getstream'

const upsertUser = (userObject: UserResponse<DefaultGenerics>) => {
  serverClient.upsertUser(userObject)
}

if (require.main === module) {
  ;(async () => {
    const id = await input({ message: 'Id' })
    upsertUser({ id })
    console.log(`Upserted user with id: ${id}`)
  })()
}
