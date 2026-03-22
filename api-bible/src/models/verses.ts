import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVerse extends Document {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

const VerseSchema: Schema = new Schema({
  book: { type: String, required: true },
  chapter: { type: Number, required: true },
  verse: { type: Number, required: true },
  text: { type: String, required: true },
});

VerseSchema.index({ book: 1, chapter: 1, verse: 1 });
VerseSchema.index({ text: "text" });

export default mongoose.model<IVerse>("Verses", VerseSchema);
