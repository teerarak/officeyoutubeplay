import { HttpClient , HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class YoutubeService {
    constructor(
        private http: HttpClient
    ) {}

    getYoutubeIdFromUrl(youtubeUrl: string): string {
        const splitYoutubeUrl = youtubeUrl.split("v=")[1].split("&")[0];
        return splitYoutubeUrl;
      }

    getName(youtubeId: string): any {
        const params = new HttpParams()
          .set("id", youtubeId)
          .set("part", "snippet")
          .set("key", "AIzaSyAQvPt41Ju_NniJg8GnWXZvS3El4JLCAaQ");
        return this.http.get("https://www.googleapis.com/youtube/v3/videos", {
          params
        });
    }
}