require('dotenv').config();
const { MongoClient } = require('mongodb');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/sithma-driving-school';
const ATLAS_URI = process.env.MONGO_URI;

const COLLECTIONS_TO_SYNC = [
  'packages',
  'branches',
  'users',
  'students',
  'timeslots',
  'quizquestions',
  'payments',
  'bookings',
  'notifications',
];

async function syncLocalToAtlas() {
  if (!ATLAS_URI) {
    console.error('❌ Error: MONGO_URI is not defined in server/.env');
    process.exit(1);
  }

  console.log('🔄 Starting Data Synchronization: Local MongoDB -> MongoDB Atlas...\n');

  let localClient;
  let atlasClient;

  try {
    // 1. Connect to Local MongoDB
    console.log(`📡 Connecting to Local MongoDB: ${LOCAL_URI}`);
    localClient = new MongoClient(LOCAL_URI, { serverSelectionTimeoutMS: 5000 });
    await localClient.connect();
    const localDb = localClient.db('sithma-driving-school');
    console.log('✅ Connected to Local MongoDB.');

    // 2. Connect to MongoDB Atlas
    console.log(`☁️  Connecting to MongoDB Atlas...`);
    atlasClient = new MongoClient(ATLAS_URI, { serverSelectionTimeoutMS: 10000 });
    await atlasClient.connect();
    const atlasDb = atlasClient.db('sithma-driving-school');
    console.log('✅ Connected to MongoDB Atlas Cloud Cluster!\n');

    // 3. Sync each collection
    for (const colName of COLLECTIONS_TO_SYNC) {
      const localCol = localDb.collection(colName);
      const atlasCol = atlasDb.collection(colName);

      const docs = await localCol.find({}).toArray();
      if (docs.length === 0) {
        console.log(`ℹ️  [${colName}] 0 documents found in local database. Skipping.`);
        continue;
      }

      console.log(`📦 [${colName}] Syncing ${docs.length} documents from Local to Atlas...`);

      // Upsert every document by _id to Atlas
      const operations = docs.map((doc) => ({
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true,
        },
      }));

      const result = await atlasCol.bulkWrite(operations, { ordered: false });
      const atlasCount = await atlasCol.countDocuments();
      console.log(
        `   ↳ Upserted: ${result.upsertedCount}, Matched/Modified: ${result.matchedCount + result.modifiedCount} (Total in Atlas: ${atlasCount})`
      );
    }

    console.log('\n============================================================');
    console.log('🎉 SUCCESS: All local collections synced to MongoDB Atlas!');
    console.log('============================================================\n');
  } catch (err) {
    console.error('\n❌ Synchronization failed:', err.message);
    if (err.message.includes('whitelist') || err.message.includes('SSL alert') || err.message.includes('ReplicaSetNoPrimary')) {
      console.error('👉 Cause: MongoDB Atlas has blocked access because your IP is not whitelisted.');
      console.error('👉 Solution: Go to cloud.mongodb.com > Network Access > Add Current IP or 0.0.0.0/0, then re-run this script.\n');
    }
    process.exit(1);
  } finally {
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
  }
}

syncLocalToAtlas();
