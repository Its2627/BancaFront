import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransferComponent } from './transfer.component';
import { TransferService } from '../../services/transfer.service';

describe('TransferComponent', () => {

  let component: TransferComponent;
  let fixture: ComponentFixture<TransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferComponent],
      providers: [TransferService]
    }).compileComponents();

    fixture = TestBed.createComponent(TransferComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // Controlla che il componente venga creato
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Controlla il saldo iniziale
  it('should have an initial balance of 100 euros', () => {
    expect(component.saldo).toBe(100);
  });

  // Controlla un bonifico valido
  it('should complete a valid transfer', () => {
    component.iban = 'IT60X0542811101000000123456';
    component.amount = 20;

    component.transfer();

    expect(component.success).toBeTrue();
    expect(component.saldo).toBe(80);
  });

  // Controlla un IBAN non valido
  it('should reject an invalid IBAN', () => {
    component.iban = '123456';
    component.amount = 20;

    component.transfer();

    expect(component.success).toBeFalse();
    expect(component.message).toBe('Inserisci un IBAN italiano valido.');
  });

  // Controlla un IBAN formato valido ma non presente in TContiCorrenti
  it('should reject an IBAN not present in TContiCorrenti', () => {
    component.iban = 'IT60X0542811101000000999999';
    component.amount = 20;

    component.transfer();

    expect(component.success).toBeFalse();
    expect(component.message).toBe('IBAN non presente nei conti correnti.');
  });

  // Controlla il caso di saldo insufficiente
  it('should reject a transfer when the balance is insufficient', () => {
    component.iban = 'IT60X0542811101000000123456';
    component.amount = 150;

    component.transfer();

    expect(component.success).toBeFalse();
    expect(component.message).toBe('Saldo insufficiente.');
  });

});