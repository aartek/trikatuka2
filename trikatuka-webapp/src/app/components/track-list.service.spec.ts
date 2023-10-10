import { TestBed } from '@angular/core/testing';

import { TrackListService } from './track-list.service';

describe('TrackListService', () => {
  let service: TrackListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
