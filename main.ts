import * as Schema from '@effect/schema/Schema'
import { Effect } from 'effect'

Schema

const successValue = Schema.Number
const failureValue = Schema.Number

const exit = Schema.Exit({
  success: successValue,
  failure: failureValue,
})

const simulatedSuccess = Effect.runSyncExit(Effect.succeed(1))

const serializeAkaEncodeTheExit = Schema.encodeSync(exit)

const encoded = serializeAkaEncodeTheExit(simulatedSuccess)

// console.log({ encoded })

const decoded = Schema.decodeSync(exit)(encoded)

console.log({decoded})
