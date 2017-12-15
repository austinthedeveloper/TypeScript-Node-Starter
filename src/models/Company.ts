import * as bcrypt from "bcrypt-nodejs";
import * as crypto from "crypto";
import * as mongoose from "mongoose";

export type CompanyModel = mongoose.Document & {
  name: string,
  location: string,
  logo: string,
  owner: string
};

const companySchema = new mongoose.Schema({
  name: String,
  location: String,
  logo: String,
  owner: String
}, { timestamps: true });

// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const Company = mongoose.model("Company", companySchema);
export default Company;
