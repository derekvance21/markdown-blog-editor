import { Component, OnInit } from '@angular/core';
import { Post } from './post';
import { BlogService } from './blog.service';
import * as cookie from 'cookie';

enum AppState { List, Edit, Preview };

function parseJWT(token) 
{
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  posts: Post[];
  currentPost: Post;
  appState: AppState = AppState.List;
  username: string;

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    let cookies = cookie.parse(document.cookie);
    this.username = cookies?.jwt && parseJWT(cookies.jwt)?.usr;
    if (this.username) this.fetchPosts(this.username)
    else window.alert("No valid user is logged in! You won't be able to view or save any posts, but you can still edit markdown and preview the result!")
    this.onHashChange();
    window.addEventListener("hashchange", () => this.onHashChange());
  }
  
  fetchPosts(username: string) {
    username && this.blogService.fetchPosts(username)
      .then(result => this.posts = result.sort((a, b) => a.postid - b.postid))
      .catch(err => console.error(err));
  }

  isState(state: string): boolean {
    switch (state) {
      case "preview": return this.appState == AppState.Preview;
      case "edit": return this.appState == AppState.Edit;
      case "list": return this.appState == AppState.List;
      default: return false;
    }
  }

  newPost() {
    // in certain situations setting the currentPost here is redundant
    // because the hash is about to change and might reset the currentPost anyways
    // but it's here because pressing new post should always reset the edit component,
    // even though in some cases the postid wouldn't be changing 
    this.currentPost = new Post(Date.now())
    window.location.hash = `#/edit/0`;
  }

  previewPost(event: Post): void {
    window.location.hash = `#/preview/${event.postid}`
  }

  editPost(event: Post): void {
    window.location.hash = `#/edit/${event.postid}`
  }

  deletePost(event: Post): void {
    if (this.username) {
      this.blogService.deletePost(this.username, event.postid)
      .then(result => this.fetchPosts(this.username))
      .catch(err => console.error(err))
      .finally(() => window.location.hash = "#/")
    } else {
      window.location.hash = "#/"
    }
  }

  savePost(event: Post): void {
    this.username && this.blogService.setPost(this.username, event)
    .then(result => {
      const {postid, modified} = result;
      if (postid) {
        // new post
        window.location.hash = `#/edit/${postid}`
      } else {
        // update post
        this.currentPost.modified = modified;
      }      
      this.fetchPosts(this.username);
    })
    .catch(err => console.error(err))
  }

  updateStateFromString(state: string) {
    this.appState = AppState[state.charAt(0).toUpperCase() + state.slice(1)];
  }

  onHashChange() {
    const hash = window.location.hash;
    // redirect to #/ for invalid hash
    if (!hash.startsWith("#/")) window.location.hash = "#/"
    const [state, idString] = hash.substr(2).split("/", 2)
    // if idString is undefined, postid will be NaN
    const postid = parseInt(idString)
    if (hash == "#/") {
      this.appState = AppState.List;
      this.currentPost = undefined;
    } else if ((state == "edit" || state == "preview") && postid >= 0) {
      if (postid != this.currentPost?.postid) {
        // we're changing the post we're looking at, 
        // so fetch it from the database or instantiate a new post for postid=0
        if (postid == 0) {
          this.currentPost = new Post(Date.now());
          this.updateStateFromString(state);
        }
        else {
          this.username && this.blogService.getPost(this.username, postid)
          .then(result => { 
            this.currentPost = result;
            this.updateStateFromString(state);
          })
          // couldn't find this post (possibly 404), so redirect back to list view
          .catch(err => {console.error(err); window.location.hash = "#/";})
        }
      } else {
        this.updateStateFromString(state);
      }
    } else {
      // invalid hash, so redirect to #/
      window.location.hash = "#/"
    }
  }

}
