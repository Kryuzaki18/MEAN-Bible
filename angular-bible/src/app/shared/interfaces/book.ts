export interface Book {
  name: string;
  abbreviation: string;
  testament: string;
  order: number;
  chapters: number;
  verses: number;
  description: string;
}

export interface LastRead {
  book: string;
  chapter: number;
  date?: Date;
}