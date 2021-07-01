import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../post';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  @Input() post: Post;

  @Output() savePost = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<Post>();
  @Output() previewPost = new EventEmitter<Post>();

  constructor() { }

  ngOnInit(): void {
  }

  handleSave(post) {
    this.savePost.emit(post)
  }

  handleDelete(post) {
    this.deletePost.emit(post)
  }

  handlePreview(post) {
    this.previewPost.emit(post)
  }

  formatDate(seconds: number): string {
    return new Date(seconds).toLocaleString('en-US');
  }

}
