import { faker } from "@faker-js/faker";

export const makeAccessToken = () => `Bearer ${faker.string.nanoid()}`
