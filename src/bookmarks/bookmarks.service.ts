import { Injectable } from '@nestjs/common';
import { GetMyBookmarksArgs } from './dtos/args';
import { Bookmark } from './models/bookmark.model';

@Injectable()
export class BookmarksService {
  bookmarks: Bookmark[] = [
    {
      description: 'djcjdbchjbdhjcbdbchbdchjbdkjc',
      link: 'http:localhost:3000',
      name: 'Atomic Habits',
      userId: '11',
    },
  ];
  getAllBookmarks() {
    return this.bookmarks;
  }


  getMyBookmarks(dto:GetMyBookmarksArgs){
    const items = this.bookmarks.filter((item)=>item.userId===dto.userId);
    return items;
  }
}
