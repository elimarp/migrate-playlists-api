import { faker } from '@faker-js/faker'

const failHttpStatus = [400, 403, 422, 409, 500]
export const makeRandomFailStatus = () => failHttpStatus[faker.number.int({ min: 0, max: failHttpStatus.length - 1 })]
