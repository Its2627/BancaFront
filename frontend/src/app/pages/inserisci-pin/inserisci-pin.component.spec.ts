import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InserisciPinComponent } from './inserisci-pin.component';

describe('InserisciPinComponent', () => {
  let component: InserisciPinComponent;
  let fixture: ComponentFixture<InserisciPinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InserisciPinComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InserisciPinComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
