import Book from "../models/books";
import Verse from "../models/verses";
import { booksData } from "../data/booksData";
import { versesData } from "../data/versesData";

const seedBooks = async () => {
  await Book.deleteMany({});

  // Insert books
  await Book.insertMany(booksData);
  console.log("Books seeded");
};

const seedVerses = async () => {
  await Verse.deleteMany({});
  const formattedVerses = versesData.map((v: any) => ({
    book: v.book,
    chapter: v.chapter,
    verse: v.verse,
    text: v.text,
  }));

  // Insert verses
  await Verse.insertMany(formattedVerses);
  console.log("Verses seeded");
};

export const runSeed = async () => {
  try {
    await seedBooks();
    // await seedVerses();
    console.log("Seeding completed");
  } catch (err) {
    console.error(err);
  }
};

