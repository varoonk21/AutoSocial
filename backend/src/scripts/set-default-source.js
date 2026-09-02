import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://varuntheeditor:MongoDb123@cluster0.q0xlbdq.mongodb.net/autosocial?retryWrites=true&w=majority";

async function migrate() {
  await mongoose.connect(MONGO_URI);
  
  const result = await mongoose.connection.db.collection("media").updateMany(
    { source: { $exists: false } },
    { $set: { source: "user" } }
  );
  
  console.log(`Updated ${result.modifiedCount} documents`);
  await mongoose.disconnect();
}

migrate().catch(console.error);
