import { mongodb } from "../../src/infra/helpers/mongodb-helper";
import { CONSTANTS } from "../../src/utils/constants";

export const purgeCollection = async (collectionName: string) => {
  if(CONSTANTS.ENVIRONMENT.NODE_ENV !== 'test') throw new Error('purgeCollection is for test environment only')
  await mongodb.getCollection(collectionName).deleteMany({})
}
