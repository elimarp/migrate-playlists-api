import { faker } from '@faker-js/faker'

export const makeMongodbIdString = () => faker.string.hexadecimal({ length: 24, prefix: '', casing: 'lower' })
