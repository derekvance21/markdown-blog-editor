import { Post } from './post';
let post1: Post = new Post(1, 234324, 2359235, "Derek's post", "i went to the store today.");
let post2: Post = new Post(2, 42645, 235653, "The best way to go mini golfing in LA", "... dont go at all");
let post3: Post = new Post(3, 68046, 2050052, "Disneyland and Fascism", "A case study...");

export const POSTS = [post1, post2, post3];