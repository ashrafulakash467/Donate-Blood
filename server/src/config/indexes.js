import { APPLICATION_COLLECTIONS } from "../constants/collections.js";
import { connectToDatabase } from "./db.js";

const applicationCollectionNames = Object.values(APPLICATION_COLLECTIONS);

const indexDefinitions = Object.freeze({
  [APPLICATION_COLLECTIONS.PROFILES]: [
    { key: { authUserId: 1 }, name: "profiles_authUserId_unique", unique: true },
    {
      key: { email: 1 },
      name: "profiles_email_unique_case_insensitive",
      unique: true,
      collation: { locale: "en", strength: 2 },
    },
    { key: { role: 1 }, name: "profiles_role" },
    { key: { status: 1 }, name: "profiles_status" },
    {
      key: { bloodGroup: 1, district: 1, upazila: 1 },
      name: "profiles_bloodGroup_district_upazila",
    },
  ],
  [APPLICATION_COLLECTIONS.DONATION_REQUESTS]: [
    { key: { createdAt: -1 }, name: "donationRequests_createdAt" },
    {
      key: { requesterUserId: 1, createdAt: -1 },
      name: "donationRequests_requesterUserId_createdAt",
    },
    {
      key: { donationStatus: 1, createdAt: -1 },
      name: "donationRequests_donationStatus_createdAt",
    },
    {
      key: { bloodGroup: 1, donationStatus: 1 },
      name: "donationRequests_bloodGroup_donationStatus",
    },
    { key: { donationDate: 1 }, name: "donationRequests_donationDate" },
  ],
  [APPLICATION_COLLECTIONS.FUNDINGS]: [
    {
      key: { stripeSessionId: 1 },
      name: "fundings_stripeSessionId_unique",
      unique: true,
    },
    { key: { fundingDate: -1 }, name: "fundings_fundingDate" },
    {
      key: { paymentStatus: 1, fundingDate: -1 },
      name: "fundings_paymentStatus_fundingDate",
    },
  ],
  [APPLICATION_COLLECTIONS.CONTACTS]: [
    { key: { createdAt: -1 }, name: "contacts_createdAt" },
  ],
});

let indexesPromise;

const ensureApplicationCollections = async (database) => {
  const existingCollections = await database
    .listCollections({}, { nameOnly: true })
    .toArray();
  const existingNames = new Set(existingCollections.map(({ name }) => name));

  await Promise.all(
    applicationCollectionNames
      .filter((name) => !existingNames.has(name))
      .map(async (name) => {
        try {
          await database.createCollection(name);
        } catch (error) {
          // Multiple cold starts may race to create the same collection.
          if (error?.code !== 48 && error?.codeName !== "NamespaceExists") throw error;
        }
      }),
  );
};

export const initializeIndexes = (providedDatabase) => {
  if (!indexesPromise) {
    indexesPromise = (async () => {
      const database = providedDatabase ?? (await connectToDatabase());
      await ensureApplicationCollections(database);

      await Promise.all(
        Object.entries(indexDefinitions).map(([collectionName, indexes]) => {
          if (indexes.length === 0) return undefined;
          return database.collection(collectionName).createIndexes(indexes);
        }),
      );

      return database;
    })().catch((error) => {
      indexesPromise = undefined;
      throw error;
    });
  }

  return indexesPromise;
};
