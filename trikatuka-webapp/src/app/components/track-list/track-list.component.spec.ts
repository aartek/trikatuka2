import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackListComponent } from './track-list.component';

describe('TrackListComponentComponent', () => {
  let component: TrackListComponent;
  let fixture: ComponentFixture<TrackListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
