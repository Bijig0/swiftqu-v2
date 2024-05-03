import { input } from '@inquirer/prompts'
import { DefaultGenerics, UserResponse } from 'stream-chat'
import { serverClient } from '../getstream'

const updateRole = async (userObject: UserResponse<DefaultGenerics>) => {
  await serverClient.partialUpdateUser(userObject)
}

if (require.main === module) {
  ;(async () => {
    const id = await input({ message: 'Id' })
    const role = await input({ message: 'Role' })
    await updateRole({ id, set: { role: role } })
    console.log(`Updated user with id: ${id}`)
  })()
}
