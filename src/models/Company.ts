import * as bcrypt from "bcrypt-nodejs";
import * as crypto from "crypto";
import * as mongoose from "mongoose";

export type CompanyModel = mongoose.Document & {
  name: string,
  location: string,
  logo: string,
  owner: string,
  users: string[]
  phone: string,
  status: string
};

const companySchema = new mongoose.Schema({
  name: String,
  location: String,
  logo: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  phone: String,
  status: { type: String, default: "draft"},
}, { timestamps: true });

const Company = mongoose.model("Company", companySchema);
export default Company;
