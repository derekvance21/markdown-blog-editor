import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Parser, HtmlRenderer } from 'commonmark';
import { Post } from '../post';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnChanges {

  @Input() post: Post;
  @Output() editPost = new EventEmitter<Post>();  

  constructor() { }

  title: string;
  body: string;

  ngOnChanges(): void {
    let parser = new Parser();
    let renderer = new HtmlRenderer();
    this.title = renderer.render(parser.parse(this.post.title))
    this.body = renderer.render(parser.parse(this.post.body))
  }

  handleEdit(post) {
    this.editPost.emit(post)
  }

}
