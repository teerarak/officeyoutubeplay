import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { HttpClient,HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'JavaSampleApproach';
  description = 'Angular-Firebase Demo';

  itemValue = '';
  items: Observable<any[]>;
  itemsRef: AngularFireList<any>;
  videoList: any;

  constructor(public db: AngularFireDatabase,private http: HttpClient) {
    this.items = db.list('items').valueChanges();

    this.itemsRef = db.list('items');
    // Use snapshotChanges().map() to store the key
    this.items = this.itemsRef.snapshotChanges()
    .pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

  }

  player: YT.Player;

  ngOnInit(): void {
    this.items.subscribe(i => {
      this.videoList = i;
    });
  }

  savePlayer(player) {
    this.player = player;
    console.log('player instance', player);
  }
  onStateChange(event) {
    if (event.data === 0) {
      this.playVideo();
    }
    console.log('player state', event.data);
  }

  getIdFromUrl(){
    if (this.itemValue != null && this.itemValue !== undefined && this.itemValue !== '') {
      const splitYoutubeUrl = this.itemValue.split('v=')[1].split('&')[0];
      this.storeToFirebase(splitYoutubeUrl);
    }
  }

  storeToFirebase(youtubeId: string) {
    this.getName(youtubeId).subscribe(data => {
      console.log(data);
      this.itemsRef.push({
        title: data.items[0].snippet.title,
        content: youtubeId,
        image: data.items[0].snippet.thumbnails.medium.url
      });
    }, error => console.log('no video on youtube'));
    this.itemValue = '';
  }

  playVideo() {
    if (this.videoList.length > 0) {
      console.log(this.videoList);
      this.player.loadVideoById(this.videoList[0].content);
      this.itemsRef.remove(this.videoList[0].key);
    }
  }

  removeList(key: string) {
    this.itemsRef.remove(key);
  }

  getName(youtubeId: string): any {
    const params = new HttpParams().set('id', youtubeId).set('part', 'snippet').set('key', 'AIzaSyAQvPt41Ju_NniJg8GnWXZvS3El4JLCAaQ');
    return this.http.get('https://www.googleapis.com/youtube/v3/videos', {params});
  }
}
