import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {

  private readonly postUrl = 'https://darkel-ng-complete-default-rtdb.firebaseio.com/posts.json';

  error = new Subject();
  constructor(private http: HttpClient) { }

  createAndStorePost(title: string, content: string) {
    const postData: Post = { title, content };

    this.http.post<{ name: string }>(
      this.postUrl,
      postData,
      {
        observe: 'response' // default is body/response will give the full pack
      }
    )
      .subscribe(
        responseData => {
          console.log(responseData)
        },
        (error: HttpErrorResponse) => {
          this.error.next(error.message);
        }
      )
  }

  private mapFirebaseResponse(responseData: { [key: string]: Post; }): Post[] {
    return Object.entries(responseData)
      .map(
        ([key, value]) => (
          {
            id: key,
            ...value
          }
        )
      );
  }

  fetchPosts() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print', 'pretty');
    searchParams = searchParams.append('custom', 'key');

    return this.http
      .get<{ [key: string]: Post }>(
        this.postUrl,
        {
          headers: new HttpHeaders({ "Custom-Header": 'Hello' }),
          params: searchParams,
          responseType: 'json'
        }
      )
      .pipe(
        map(this.mapFirebaseResponse),
        catchError(
          errorRes => {
            //send to analytics server
            return throwError(errorRes)
          }
        )
      )
  }

  deletePosts() {
    return this.http.delete(
      this.postUrl,
      {
        observe: 'events',
        responseType: 'text'
      }
    ).pipe(
      tap(event => {
        console.log(event);

        if (event.type === HttpEventType.Sent) {
          // just sent for now, waiting for response
        }

        if (event.type === HttpEventType.Response) {
          console.log(event.body);
          console.log(event);
        }
      })
    );
  }
}