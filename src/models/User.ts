import mongoose, { Schema, Document, models } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  image?: string;
  hackerRankURL?: string;
  leetCodeURL?: string;
  codeChefURL?: string;
  gfgURL?: string;
  codeforcesURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    hackerRankURL: { type: String, default: '' },
    leetCodeURL: { type: String, default: '' },
    codeChefURL: { type: String, default: '' },
    gfgURL: { type: String, default: '' },
    codeforcesURL: { type: String, default: '' },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
