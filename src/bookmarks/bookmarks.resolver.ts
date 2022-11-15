import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BookmarksService } from './bookmarks.service';
import { GetMyBookmarksArgs } from './dtos/args';
import { BookmarkInput } from './dtos/inputs/index';
import { Bookmark } from './models/bookmark.model';
 
@Resolver(() => Bookmark)
export class BookmarksResolver {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Mutation(()=>[Bookmark])
  createBookmark(@Args() createBookmarkInput: BookmarkInput) {}

  @Query(() => [Bookmark], { name: 'bookmarks' })
  getAllBookmarks():Bookmark[] {
    return this.bookmarksService.getAllBookmarks();
  }

  @Query(() => [Bookmark], { name: 'my-bookmarks' })
  getMyBookmarks(@Args() getMyBookmarks:GetMyBookmarksArgs):Bookmark[] {
    return this.bookmarksService.getMyBookmarks(getMyBookmarks);
    
  }
}

