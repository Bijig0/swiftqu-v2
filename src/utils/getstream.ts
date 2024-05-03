import { StreamChat } from 'stream-chat'

const STREAM_KEY = 'qh5cf9dtnp6u'
const STREAM_SECRET =
  'y7xkmytwxwbnvfsskt2u6w6ggatx7eeaxyq64xpfdx77unekjaa6bzwqgeqtxsv8'

export const serverClient = StreamChat.getInstance(STREAM_KEY, STREAM_SECRET)
