import { TestBed } from '@angular/core/testing';

import { ArtistListService } from './artist-list.service';

describe('ArtistListService', () => {
  let service: ArtistListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtistListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
