import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../post';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  @Input() posts?: Post[]

  @Output() openPost = new EventEmitter<Post>();
  @Output() newPost = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  selectedPost: Post;
  handleClick(post: Post): void {
    this.selectedPost = post
    this.openPost.emit(post);
  }

  handleNewPost(): void {
    this.newPost.emit();
  }

  formatDate(seconds: number): string {
    return new Date(seconds).toLocaleString('en-US');
  }

}
