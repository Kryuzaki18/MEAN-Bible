export interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  testament: string;
}

export interface BookmarkedVerse extends Verse {
  dateAdded?: string;
}