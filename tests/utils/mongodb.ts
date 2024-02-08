import { mongodb } from "../../src/infra/helpers/mongodb-helper";
import { constants } from "../../src/utils/constants";

export const purgeCollection = async (collectionName: string) => {
  if(constants.app.NODE_ENV !== 'test') throw new Error('purgeCollection is for test environment only')
  await mongodb.getCollection(collectionName).deleteMany({})
}
