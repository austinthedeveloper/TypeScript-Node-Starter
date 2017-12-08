import * as bcrypt from "bcrypt-nodejs";
import * as crypto from "crypto";
import * as mongoose from "mongoose";

export type BeerModel = mongoose.Document & {
  id: string,
  name: string,
  brewery: string,
  abv: string,
  ibu: string,
  icon: string,
  category: string,
  stock: boolean,
  type: string,
  user: string
};

const beerSchema = new mongoose.Schema({
  id: String,
  name: String,
  brewery: String,
  abv: String,
  ibu: String,
  icon: String,
  category: String,
  stock: { type: Boolean, default: true },
  type: { type: String, default: "keg" },
  user: String
});

// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const Beer = mongoose.model("Beer", beerSchema);
export default Beer;
