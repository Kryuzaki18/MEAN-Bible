import { Router } from "express";
import {
  getBooks,
  getVerse,
  getChapter,
  search,
} from "../controllers/bibleController";

const router = Router();

router.get("/", (req, res) => {
  res.send("Bible API is running...");
});
router.get("/books", getBooks);
router.get("/verse/:book/:chapter/:verse", getVerse);
router.get("/chapter/:book/:chapter", getChapter);
router.get("/search", search);

export default router;
