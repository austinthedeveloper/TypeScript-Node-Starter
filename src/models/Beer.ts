import * as bcrypt from "bcrypt-nodejs";
import * as crypto from "crypto";
import * as mongoose from "mongoose";

export type BeerModel = mongoose.Document & {
  id: string,
  abv: string,
  ibu: string,
  glasswareId: number,
  availableId: number,
  styleId: number,
  isOrganic: string,
  labels: {
    icon: string,
    medium: string,
    large: string
  },
  status: string,
  statusDisplay: string,
  originalGravity: string,
  createDate: string,
  updateDate: string,
  glass: {
    id: number,
    name: string,
    createDate: string
  },
  available: {
    id: number,
    name: string,
    description: string
  },
  style: {
    id: number,
    categoryId: number,
    category: {
      id: number,
      name: string,
      createDate: Date
    },
    name: string,
    shortName: string,
    description: string,
    ibuMin: string,
    ibuMax: string,
    abvMin: string,
    abvMax: string,
    srmMin: string,
    srmMax: string,
    ogMin: string,
    fgMin: string,
    fgMax: string,
    createDate: string,
    updateDate: string
  }
};

const beerSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  abv: String,
  ibu: String,
  glasswareId: Number,
  availableId: Number,
  styleId: Number,
  isOrganic: String,
  labels: {
    icon: String,
    medium: String,
    large: String
  },
  status: String,
  statusDisplay: String,
  originalGravity: String,
  createDate: Date,
  updateDate: Date,
  glass: {
    id: Number,
    name: String,
    createDate: String
  },
  available: {
    id: Number,
    name: String,
    description: String
  },
  style: {
    id: Number,
    categoryId: Number,
    category: {
      id: Number,
      name: String,
      createDate: Date
    },
    name: String,
    shortName: String,
    description: String,
    ibuMin: String,
    ibuMax: String,
    abvMin: String,
    abvMax: String,
    srmMin: String,
    srmMax: String,
    ogMin: String,
    fgMin: String,
    fgMax: String,
    createDate: Date,
    updateDate: Date
  }
});

// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const Beer = mongoose.model("Beer", beerSchema);
export default Beer;
