import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  age: number;
}

const userSchema = new mongoose.Schema<IUser>({
  name: String,
  email: { type: String, unique: true },
  age: Number,
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
