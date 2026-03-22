import { Request, Response } from 'express';
import Verses from '../models/verses';
import Books from '../models/books';

// 📖 Get verse
export const getVerse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { book, chapter, verse } = req.params;

    const foundBook = await Books.findOne({
      name: book
    });

    if (!foundBook) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    const result = await Verses.findOne({
      book: foundBook.name,
      chapter: Number(chapter),
      verse: Number(verse)
    }).populate('book', 'name abbreviation');

    if (!result) {
      res.status(404).json({ message: 'Verse not found' });
      return;
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 📖 Chapter
export const getChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { book, chapter } = req.params;

    const foundBook = await Books.findOne({
      name: book
    });

    if (!foundBook) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    const verses = await Verses.find({
      book: foundBook.name,
      chapter: Number(chapter)
    }).sort({ verse: 1 });

    res.json(verses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Search
export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    const results = await Verses.find(
      { $text: { $search: q as string } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(50)
      .populate('book', 'name');

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 📚 Books
export const getBooks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const books = await Books.find().sort({ order: 1 });
    res.json(books);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
