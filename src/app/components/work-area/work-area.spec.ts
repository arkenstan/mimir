import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkArea } from './work-area';

describe('WorkArea', () => {
  let component: WorkArea;
  let fixture: ComponentFixture<WorkArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkArea],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkArea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
