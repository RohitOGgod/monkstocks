import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';

dotenv.config();

const { MONGO_CONNECTION_STRING, GUEST_EMAIL, GUEST_PASS } = process.env;

async function main() {
  if (!MONGO_CONNECTION_STRING) {
    console.error('Missing MONGO_CONNECTION_STRING in backend/.env');
    process.exit(1);
  }
  if (!GUEST_EMAIL || !GUEST_PASS) {
    console.error('Missing GUEST_EMAIL or GUEST_PASS in backend/.env');
    console.error('Please add:\nGUEST_EMAIL=guest@example.com\nGUEST_PASS=guestpassword');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    let user = await User.findOne({ email: GUEST_EMAIL });
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(GUEST_PASS, salt);

    if (!user) {
      user = await User.create({
        email: GUEST_EMAIL,
        password: hashed,
        name: 'Guest User',
        coins: 100000,
      });
      console.log('Created guest user.');
    } else {
      // ensure password and baseline coins
      await User.updateOne({ _id: user._id }, { $set: { password: hashed }, $setOnInsert: { coins: 100000 } });
      console.log('Updated guest user password.');
    }

    const fresh = await User.findOne({ email: GUEST_EMAIL });
    console.log('Guest user ID:', String(fresh._id));
    console.log('Set GUEST_ID in backend/.env to this value for full guest restrictions.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('ensureGuest error:', err?.message || err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

main();
