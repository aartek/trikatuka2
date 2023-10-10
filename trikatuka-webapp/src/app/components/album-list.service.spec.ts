import { TestBed } from '@angular/core/testing';

import { AlbumListService } from './album-list.service';

describe('AlbumListService', () => {
  let service: AlbumListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlbumListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
