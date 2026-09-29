import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardConfermationComponent } from './card-confermation.component';

describe('CardConfermationComponent', () => {
  let component: CardConfermationComponent;
  let fixture: ComponentFixture<CardConfermationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardConfermationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardConfermationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
