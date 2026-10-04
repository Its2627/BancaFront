import { TestBed } from '@angular/core/testing';
import { TransferService } from './transfer.service';

describe('TransferService', () => {

  let service: TransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransferService);
  });

  // Controlla che il service venga creato
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Controlla il saldo iniziale
  it('should have an initial balance of 100 euros', () => {
    expect(service.getSaldo()).toBe(100);
  });

  // Controlla che il bonifico venga effettuato
  it('should complete a transfer', () => {
    const result = service.effettuaBonifico(
      'IT60X0542811101000000123456',
      20
    );

    expect(result).toBeTrue();
    expect(service.getSaldo()).toBe(80);
  });

  // Controlla che un bonifico superiore al saldo venga rifiutato
  it('should reject a transfer when the balance is insufficient', () => {
    const result = service.effettuaBonifico(
      'IT60X0542811101000000123456',
      150
    );

    expect(result).toBeFalse();
    expect(service.getSaldo()).toBe(100);
  });

});