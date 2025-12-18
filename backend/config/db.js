import mongoose from "mongoose";
// Improved MongoDB connection with better logging and simple retry
const connectWithRetry = async (uri, options = {}) => {
  const maxAttempts = options.maxAttempts || Infinity;
  const baseDelay = options.baseDelay || 5000; // ms
  let attempt = 0;

  const connectOnce = async () => {
    attempt += 1;
    try {
      const conn = await mongoose.connect(uri, {
        // Recommended options
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Fail fast on initial selection so we can retry
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        tls: true,
        ...options.connectOptions,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📦 Database Name: ${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt >= maxAttempts) {
        console.error("❌ Reached max connection attempts. Giving up.");
        throw err;
      }
      const delay = baseDelay * attempt; // simple backoff
      console.log(`🔁 Retrying MongoDB connection in ${delay} ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectOnce();
    }
  };

  return connectOnce();
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is not set. Please check backend/.env");
    process.exit(1);
  }

  // Wire up connection event logging
  mongoose.connection.on("connected", () => console.log("mongoose: connected"));
  mongoose.connection.on("reconnected", () => console.log("mongoose: reconnected"));
  mongoose.connection.on("disconnected", () => console.warn("mongoose: disconnected"));
  mongoose.connection.on("error", (err) => console.error("mongoose error:", err.message));

  // Start connection with retry (infinite attempts by default)
  await connectWithRetry(uri, { baseDelay: 3000 });
};

export default connectDB;