import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

userSchema.methods.comparePassword = function(pw) {
  return bcrypt.compare(pw, this.passwordHash);
};

userSchema.statics.hashPassword = async function(pw) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
};

export default mongoose.model('User', userSchema);
