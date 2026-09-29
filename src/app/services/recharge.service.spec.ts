import { TestBed } from '@angular/core/testing';
import { RechargeService } from './recharge.service';

describe('RechargeService', () => {

  let service: RechargeService;

  // Crea una nuova istanza del service prima di ogni test
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RechargeService);
  });

  // Controlla che il service venga creato correttamente
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Controlla che il saldo iniziale sia 100 euro
  it('should have an initial balance of 100 euros', () => {
    expect(service.getSaldo()).toBe(100);
  });

  // Controlla che una ricarica valida venga effettuata
  it('should complete a recharge', () => {
    const result = service.effettuaRicarica(20);

    expect(result).toBeTrue();
    expect(service.getSaldo()).toBe(80);
  });

  // Controlla che non sia possibile ricaricare più del saldo disponibile
  it('should reject a recharge when the balance is insufficient', () => {
    const result = service.effettuaRicarica(150);

    expect(result).toBeFalse();
    expect(service.getSaldo()).toBe(100);
  });

  // Controlla che non sia possibile usare un importo pari a zero
  it('should reject a recharge with zero amount', () => {
    const result = service.effettuaRicarica(0);

    expect(result).toBeFalse();
    expect(service.getSaldo()).toBe(100);
  });

  // Controlla che non sia possibile usare un importo negativo
  it('should reject a recharge with a negative amount', () => {
    const result = service.effettuaRicarica(-10);

    expect(result).toBeFalse();
    expect(service.getSaldo()).toBe(100);
  });

});