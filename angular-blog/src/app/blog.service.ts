/* Copyright: Junghoo Cho (cho@cs.ucla.edu) */
/* This file was created for CS144 class at UCLA */
import { Injectable } from '@angular/core';
import { Post } from './post';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

    maxid: number = 0;

    constructor() { }

    fetchPosts(username: string): Promise<Post[]> {
      return fetch(`/api/posts?` + new URLSearchParams({username}))
        .then(response => {
          if (response.ok) 
            return response.json()
          else
            throw new Error(String(response.status))})
    }

    getPost(username: string, postid: number): Promise<Post> {
      return fetch(`/api/posts?` + new URLSearchParams({username, postid: postid.toString()}))
        .then(response => {
          if (response.ok)
            return response.json()
          else 
            throw new Error(String(response.status))})
    }

    setPost(username: string, p: Post): Promise<Post> {
      const {postid, title, body} = p
      return fetch("/api/posts", {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({username, postid: postid.toString(), title, body})
      })
      .then(response => {
        if (response.ok) 
          return response.json()
        else 
          throw new Error(String(response.status))
      })
    }

    deletePost(username: string, postid: number): Promise<void> {
      if (postid > 0) {
        return fetch("/api/posts?" + new URLSearchParams({username, postid: postid.toString()}), {
          method: "DELETE"
        })
        .then(response => {
          if (response.ok) 
            return
          else 
            throw new Error(String(response.status))
        })
      } else {
        // invalid postid, so return promise that rejects
        return new Promise((resolve, reject) => reject(Error(String("Error deleting: postid <= 0"))))
      }
    }
}
