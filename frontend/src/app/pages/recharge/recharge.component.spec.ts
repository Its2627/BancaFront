import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RechargeComponent } from './recharge.component';
import { RechargeService } from '../service/recharge.service';

describe('RechargeComponent', () => {

  let component: RechargeComponent;
  let fixture: ComponentFixture<RechargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechargeComponent],
      providers: [RechargeService]
    }).compileComponents();

    fixture = TestBed.createComponent(RechargeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // Controlla che il componente venga creato correttamente
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Controlla che il saldo iniziale sia quello del service
  it('should have an initial balance of 100 euros', () => {
    expect(component.saldo).toBe(100);
  });

  // Controlla la selezione dell'importo
  it('should select a recharge amount', () => {
    component.selectAmount(20);

    expect(component.selectedAmount).toBe(20);
  });

  // Controlla una ricarica valida
  it('should complete a valid recharge', () => {
    component.phoneNumber = '3331234567';
    component.operator = 'TIM';
    component.selectedAmount = 20;

    component.recharge();

    expect(component.success).toBeTrue();
    expect(component.saldo).toBe(80);
  });

  // Controlla il caso in cui il saldo non sia sufficiente
  it('should reject a recharge when the balance is insufficient', () => {
    component.phoneNumber = '3331234567';
    component.operator = 'TIM';
    component.selectedAmount = 50;

    component.recharge();
    component.recharge();
    component.recharge();

    expect(component.success).toBeFalse();
    expect(component.message).toBe('Saldo insufficiente.');
  });

});