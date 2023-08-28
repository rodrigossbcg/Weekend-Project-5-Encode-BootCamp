import { TestBed } from '@angular/core/testing';

import { AlchemyService } from './alchemy.service';

describe('AlchemyService', () => {
  let service: AlchemyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlchemyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
