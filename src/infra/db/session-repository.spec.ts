import { ObjectId } from "mongodb"
import { makeCreateSession } from "../../../tests/mocks/models/session"
import { makeMongodbIdString } from "../../../tests/mocks/models/utils"
import { seedMongodbCollection } from "../../../tests/seed/mongodb-collection"
import { purgeCollection } from "../../../tests/utils/mongodb"
import { mongodb } from "../helpers/mongodb-helper"
import { SessionRepository } from "./session-repository"

const makeSut = () => ({
  sut: new SessionRepository()
})

beforeAll(async () => {
  await mongodb.connect((global as any).__MONGO_URI__)
})

afterAll(async () => {
  await mongodb.disconnect()
})

describe('Session Repository', () => {
  describe('Get Session', () => {

    afterEach(async () => {
      await purgeCollection(SessionRepository.name)
    })

    it('returns null if cannot find session with the given sessionId', async () => {
      const { sut } = makeSut()

      const firstSessionId = makeMongodbIdString()
      const secondSessionId = makeMongodbIdString()
      const thirdSessionId = makeMongodbIdString()
      const sessions = [
        {
          _id: new ObjectId(firstSessionId),
          ...makeCreateSession()
        },
        {
          _id: new ObjectId(secondSessionId),
          ...makeCreateSession()
        },
      ]
      await seedMongodbCollection(sut.constructor.name, sessions)

      const actual = await sut.getSession(thirdSessionId)

      expect(actual).toBeNull()
    })

    it('returns session successfully', async () => {
      const { sut } = makeSut()

      const targetSession = {
        _id: new ObjectId(makeMongodbIdString()),
        ...makeCreateSession()
      }
      await seedMongodbCollection(sut.constructor.name, [
        targetSession,
        makeCreateSession(),
        makeCreateSession()
      ])


      const actual = await sut.getSession(targetSession._id.toString())

      expect(actual).toStrictEqual({
        id: targetSession._id.toString(),
        services: targetSession.services
      })

    })
  })
})
