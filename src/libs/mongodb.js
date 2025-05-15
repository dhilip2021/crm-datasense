import mongoose from 'mongoose';

let isConnected = false;

const connectMongoDB = async () => {
  if (isConnected) return;

  const { NEXT_PUBLIC_MONGO_USER, NEXT_PUBLIC_MONGO_PASS, NEXT_PUBLIC_MONGO_IP, NEXT_PUBLIC_MONGO_DATABASE } = process.env;
  const uri = `mongodb+srv://${NEXT_PUBLIC_MONGO_USER}:${NEXT_PUBLIC_MONGO_PASS}@${NEXT_PUBLIC_MONGO_IP}/${NEXT_PUBLIC_MONGO_DATABASE}?retryWrites=true&w=majority`;

  try {
    mongoose.set('strictQuery', false); // ✅ removed await

    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw new Error('MongoDB connection failed');
  }
};

export default connectMongoDB;
