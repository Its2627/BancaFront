import { model, Schema } from "mongoose";
import { User } from "./user.entity";
import { geoCity, geoCountry } from "../../lib/geo";
import { yearsSince } from "../../lib/utils";

const userSchema = new Schema<User>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: Date, required: true },
  picture: String,
  registrationIp: { type: String, required: false }
}, { timestamps: true });

userSchema.virtual('fullName').get(function () {
  return [this.firstName, this.lastName].filter(Boolean).join(' ');
});

userSchema.virtual('age').get(function () {
  return this.birthDate ? yearsSince(this.birthDate) : null;
});

userSchema.virtual('registrationCity').get(function () {
  return geoCity(this.registrationIp);
});

userSchema.virtual('registrationCountry').get(function () {
  return geoCountry(this.registrationIp);
});

export const UserModel = model<User>('User', userSchema);
