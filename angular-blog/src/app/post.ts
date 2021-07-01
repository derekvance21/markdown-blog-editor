export class Post {
  // postid: number = 0;
  // created: number = 0;
  // modified: number = 0;
  // title: string = "";
  // body: string = "";
  constructor(public modified: number = 0, public postid: number = 0, public created: number = 0, public title: string = "", public body: string = "") {}
}