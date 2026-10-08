import { getCollection } from "../config/db.js";
import { initializeIndexes } from "../config/indexes.js";
import { APPLICATION_COLLECTIONS } from "../constants/collections.js";

export const createContactMessage = async (input) => {
  await initializeIndexes();
  const contacts = await getCollection(APPLICATION_COLLECTIONS.CONTACTS);
  const contact = { ...input, createdAt: new Date() };
  const result = await contacts.insertOne(contact);
  return { _id: result.insertedId, ...contact };
};
