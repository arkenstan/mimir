import { TestBed } from '@angular/core/testing';

import { ModelSettings } from './model-settings';

describe('ModelSettings', () => {
  let service: ModelSettings;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelSettings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
