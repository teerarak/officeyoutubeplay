import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable, Subject } from 'rxjs';
import { HttpClient,HttpParams } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  itemValue = '';
  playlist = '';

  items: Observable<any[]>;
  itemsRef: AngularFireList<any>;

  favoritePlaylistName: Observable<any[]>;
  favoritePlaylistNameRef: AngularFireList<any>;

  favoriteMusicPlaylist: Observable<any[]>;
  favoriteMusicPlaylistRef: AngularFireList<any>;

  videoList: any;
  favoriteMusicListByPlaylist: any;
  favoritePlaylistNameList: any;

  constructor(public db: AngularFireDatabase,private http: HttpClient) {
    this.items = db.list('items').valueChanges();
    this.itemsRef = db.list('items');

    this.favoritePlaylistName = db.list('favoritePlaylistName').valueChanges();
    this.favoritePlaylistNameRef = db.list('favoritePlaylistName');

    this.favoriteMusicPlaylist = db.list('favoritePlaylist').valueChanges();
    this.favoriteMusicPlaylistRef = db.list('favoritePlaylist');

    // Use snapshotChanges().map() to store the key
    this.items = this.itemsRef.snapshotChanges()
    .pipe(map(changes =>changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))));

    this.favoritePlaylistName = this.favoritePlaylistNameRef.snapshotChanges()
    .pipe(map(changes =>changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))));

    this.favoriteMusicPlaylist = this.favoriteMusicPlaylistRef.snapshotChanges()
    .pipe(map(changes =>changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))));
  }

  player: YT.Player;

  ngOnInit(): void {
    this.items.subscribe(i => {
      this.videoList = i;
    });

    this.favoritePlaylistName.subscribe(i => {
      this.favoritePlaylistNameList = i;
    })
  }

  // == youtube video play == //
  savePlayer(player) {
    this.player = player;
  }

  onStateChange(event) {
    if (event.data === 0 || event.data === -1) {
      this.playVideo();
    }
  }

  playVideo() {
    if (this.videoList.length > 0) {
      console.log(this.videoList);
      this.player.loadVideoById(this.videoList[0].content);
      this.itemsRef.remove(this.videoList[0].key);
    }
  }

  // == Normal Playlist == //
  addMusicByInputToPlaylist() {
    this.addMusicToPlaylist(this.getYoutubeIdFromUrl(this.itemValue));
  }

  addMusicToPlaylist(youtubeId: string) {
    this.getName(youtubeId).subscribe(data => {
      const music = new MusicModel();
      music.title = data.items[0].snippet.title;
      music.content = youtubeId;
      music.image = data.items[0].snippet.thumbnails.standard.url;

      this.itemsRef.push(music);
    }, error => console.log('no video on youtube'));
    this.itemValue = '';
  }

  removeList(key: string) {
    this.itemsRef.remove(key);
  }

  shuffleMusicPlaylist() {
    console.log(this.favoritePlaylistNameList);
  }


  // == Favorite Playlist == //
  createFavoritePlaylistName() {
    this.favoritePlaylistNameRef.push({
      playlistName: this.playlist
    });
    console.log(this.favoritePlaylistNameList);
  }

  addMusicToFavoritePlayList(playlistName: string, youtubeId: string) {
    this.getName(youtubeId).subscribe(data => {

      const musicWithPlaylist = new MusicModel();
      musicWithPlaylist.playlistName = playlistName;
      musicWithPlaylist.title = data.items[0].snippet.title;
      musicWithPlaylist.content = youtubeId;
      musicWithPlaylist.image = data.items[0].snippet.thumbnails.standard.url;

      this.favoriteMusicPlaylistRef.push(musicWithPlaylist);
    }, error => console.log('no video on youtube'));
  }

  getListMusicByFavoritePlayList(playlistName: string) {
    console.log(playlistName);
    const playlistSubject = new Subject<string>();
    const queryObservable = playlistSubject.pipe(
      switchMap(playlistNameMap => this.db.list('/favoritePlaylist', ref =>
      ref.orderByChild('playlistName').equalTo(playlistNameMap)).valueChanges()) // Orderbychild = columm name
    );
    queryObservable.subscribe(queriedItems => {
        this.favoriteMusicListByPlaylist = queriedItems;
    });
    playlistSubject.next(playlistName); // run query here
  }

  removeMusicFromFavoritePlaylist(key: string) {
    this.favoriteMusicPlaylistRef.remove(key);
  }

  // == Youtube Service == //
  getYoutubeIdFromUrl(youtubeUrl: string): string{
    if (youtubeUrl != null && youtubeUrl !== undefined && youtubeUrl !== '') {
      const splitYoutubeUrl = youtubeUrl.split('v=')[1].split('&')[0];
      return splitYoutubeUrl;
    }
  }

  getName(youtubeId: string): any {
    const params = new HttpParams().set('id', youtubeId).set('part', 'snippet').set('key', 'AIzaSyAQvPt41Ju_NniJg8GnWXZvS3El4JLCAaQ');
    return this.http.get('https://www.googleapis.com/youtube/v3/videos', {params});
  }

}

export class MusicModel {
  playlistName: string;
  title: string;
  content: string;
  image: string;
}