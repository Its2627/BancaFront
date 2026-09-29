import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InserisciPasswordComponent } from './inserisci-password.component';

describe('InserisciPasswordComponent', () => {
  let component: InserisciPasswordComponent;
  let fixture: ComponentFixture<InserisciPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InserisciPasswordComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InserisciPasswordComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
