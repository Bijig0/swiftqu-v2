const getOrCreate = () => {
    
}

getOrCreate({
    get: {
        tableName: 'user_profile',
        columnsToRead: [""],
        eq: {
            field: "phone_number",
            value: uncheckedUserToInteractWith.phoneNumber,
        }
    },
    create: {
        tableName: 'user_profile',
        columnsToInsert: ["name", "phone_number", "is_restaurant_admin", "chat_id", "is_otp_verified", "user_id"],
        values: {
            name: uncheckedUserToInteractWith.name,
            phone_number: uncheckedUserToInteractWith.phoneNumber,
            is_restaurant_admin: false,
            chat_id: null,
            is_otp_verified: false,
            user_id: null,
        }
    }
})

const createUnverifiedUser = async (): Promise<UserToInteractWith> => {
  let userId: string

  const {
    data: maybeAlreadyCreatedUnverifiedUser,
    error: maybeAlreadyCreatedUnverifiedUserError,
  } = await supabaseClient
    .from('user_profile')
    .select('user_id')
    .eq('phone_number', uncheckedUserToInteractWith.phoneNumber)

  if (maybeAlreadyCreatedUnverifiedUserError)
    throw maybeAlreadyCreatedUnverifiedUserError

  if (maybeAlreadyCreatedUnverifiedUser.length !== 0) {
    userId = maybeAlreadyCreatedUnverifiedUser[0].user_id
  } else {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.admin.createUser({
      phone: uncheckedUserToInteractWith.phoneNumber,
    })

    if (!user || error) throw error

    userId = user.id
  }

  const performUserShapeTransformation = async (
    userId: string,
  ): Promise<UserToInteractWith> => {
    const unverifiedUser = {
      name: uncheckedUserToInteractWith.name,
      phone_number: uncheckedUserToInteractWith.phoneNumber,
      is_restaurant_admin: false,
      chat_id: null,
      is_otp_verified: false,
      user_id: userId,
    }

    const {
      data: unverifiedUserProfile,
      error: createUnverifiedUserProfileError,
    } = await supabaseClient
      .from('user_profile')
      .upsert(unverifiedUser, { onConflict: 'user_id' })
      .select(
        'phone_number,name,is_otp_verified,chat_id,user_profile_id,user_id',
      )
      .single()

    if (!unverifiedUserProfile || createUnverifiedUserProfileError)
      throw createUnverifiedUserProfileError

    const toCamelCase = objectToCamel(unverifiedUserProfile)

    const withId = { ...toCamelCase, id: userId }

    const { userId: _, ...withoutUserId } = withId

    return withoutUserId
  }

  const unverifiedUser = await performUserShapeTransformation(userId)

  return unverifiedUser
}

const retrieveUser = async (): Promise<UserToInteractWith> => {
  const { data: userData, error: getUserIdError } = await supabaseClient
    .from('user_profile')
    .select('user_id,chat_id,is_otp_verified,user_profile_id')
    .eq('phone_number', uncheckedUserToInteractWith.phoneNumber)
    .single()

  if (getUserIdError || userData === null) throw getUserIdError

  const userToInteractWith = {
    phoneNumber: uncheckedUserToInteractWith.phoneNumber,
    name: uncheckedUserToInteractWith.name,
    chatId: userData.chat_id,
    id: userData.user_id,
    isOtpVerified: userData.is_otp_verified,
    userProfileId: userData.user_profile_id,
  } satisfies UserToInteractWith

  return userToInteractWith
}

const checkUserToInteractWithExists = async (): Promise<boolean> => {
  const { data: user, error } = await supabaseClient
    .from('user_profile')
    .select('user_profile_id,is_otp_verified')
    .eq('phone_number', uncheckedUserToInteractWith.phoneNumber)

  if (error) throw error

  const userExists = user.length !== 0

  return userExists
}
