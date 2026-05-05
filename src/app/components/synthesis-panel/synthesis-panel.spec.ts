import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SynthesisPanel } from './synthesis-panel';

describe('SynthesisPanel', () => {
  let component: SynthesisPanel;
  let fixture: ComponentFixture<SynthesisPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SynthesisPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(SynthesisPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
