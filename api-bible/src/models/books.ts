import mongoose, { Schema, Document } from "mongoose";
export interface IBook extends Document {
  name: string;
  abbreviation: string;
  testament: string;
  description: string;
  order: number;
  chapters: number;
  verses: number;
}

const BookSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  abbreviation: { type: String, required: true },
  testament: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  chapters: { type: Number, required: true },
  verses: { type: Number, required: true },
});

export default mongoose.model<IBook>("Book", BookSchema);
