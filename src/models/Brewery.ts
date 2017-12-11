import * as bcrypt from "bcrypt-nodejs";
import * as crypto from "crypto";
import * as mongoose from "mongoose";

export type BreweryModel = mongoose.Document & {
  id: string,
  name: string,
  nameShortDisplay: string,
  description: string,
  website: string,
  established: string,
  isOrganic: string,
  images: {
    icon: string,
    medium: string,
    large: string,
    squareMedium: string,
    squareLarge: string
  },
  status: string,
  statusDisplay: string,
  createDate: string,
  updateDate: string,
  isMassOwned: string,
  brandClassification: string
};

const brewerySchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  nameShortDisplay: String,
  description: String,
  website: String,
  established: String,
  isOrganic: String,
  images: {
    icon: String,
    medium: String,
    large: String,
    squareMedium: String,
    squareLarge: String
  },
  status: String,
  statusDisplay: String,
  createDate: Date,
  updateDate: Date,
  isMassOwned: String,
  brandClassification: String
}, { timestamps: true });

// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const Brewery = mongoose.model("Brewery", brewerySchema);
export default Brewery;
