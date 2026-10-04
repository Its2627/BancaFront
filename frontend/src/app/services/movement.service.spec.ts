import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { MovementService, Movement, SearchResultWithBalance } from './movement.service';

describe('MovementService', () => {
  let service: MovementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch last movements with final balance', () => {
    const mockResponse: SearchResultWithBalance = {
      movements: [{ date: new Date('2026-09-01'), amount: 100, categoryName: 'Stipendio' }],
      finalBalance: 1234.56,
    };

    service.getLastMovements(10).subscribe(result => {
      expect(result.finalBalance).toBe(1234.56);
      expect(result.movements.length).toBe(1);
    });

    const req = httpMock.expectOne(r => r.url === '/api/movements/last');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('n')).toBe('10');
    req.flush(mockResponse);
  });

  it('should fetch movements by category', () => {
    const mockResponse: Movement[] = [
      { date: new Date('2026-09-01'), amount: -50, categoryName: 'Spesa' },
    ];

    service.getMovementsByCategory(5, 'Spesa').subscribe(movements => {
      expect(movements.length).toBe(1);
      expect(movements[0].categoryName).toBe('Spesa');
    });

    const req = httpMock.expectOne(r => r.url === '/api/movements/by-category');
    expect(req.request.params.get('category')).toBe('Spesa');
    req.flush(mockResponse);
  });

  it('should fetch movements by date range', () => {
    const mockResponse: Movement[] = [
      { date: new Date('2026-09-05'), amount: 200, categoryName: 'Stipendio' },
    ];

    service.getMovementsByDateRange(5, new Date('2026-09-01'), new Date('2026-09-30')).subscribe(movements => {
      expect(movements.length).toBe(1);
    });

    const req = httpMock.expectOne(r => r.url === '/api/movements/by-date-range');
    req.flush(mockResponse);
  });

  it('should return the static list of categories', () => {
    expect(service.getCategories().length).toBeGreaterThan(0);
  });
});