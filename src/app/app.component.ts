import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from './post.model';
import { PostsService } from './posts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  loadedPosts: Post[] = [];
  isFetching = false;
  error = null;
  private errorSub: Subscription;

  constructor(
    private postsService: PostsService
  ) { }

  ngOnInit() {

    this.errorSub = this.postsService.error
      .subscribe(errorMessage => {
        this.error = errorMessage;
      })

    this.isFetching = true;
    this.postsService
      .fetchPosts()
      .subscribe(
        (posts: Post[]) => {
          this.isFetching = false;
          this.loadedPosts = posts;
        },
        (error: HttpErrorResponse) => {
          this.isFetching = false;
          this.error = error.message;
        }
      )
  }

  onCreatePost(postData: Post) {
    // Send Http request
    this.postsService
      .createAndStorePost(postData.title, postData.content);
  }

  onFetchPosts() {
    // Send Http request
    this.isFetching = true;
    this.postsService
      .fetchPosts()
      .subscribe(
        (posts: Post[]) => {
          this.isFetching = false;
          this.loadedPosts = posts;
        },
        (error: HttpErrorResponse) => {
          this.isFetching = false;
          this.error = error.message;
        }
      )
  }

  onClearPosts() {
    // Send Http request
    this.postsService
      .deletePosts()
      .subscribe(
        () => {
          this.loadedPosts = [];
        }
      )
  }

  onHandleError() {
    this.error = null;
  }

  ngOnDestroy(): void {
    this.errorSub.unsubscribe();
  }
}
