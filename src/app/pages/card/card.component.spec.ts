import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start on the first card (Fisica) with the front showing', () => {
    expect(component.indiceCorrente).toBe(0);
    expect(component.cartaCorrente.tipo).toBe('Fisica');
    expect(component.cartaGirata).toBeFalse();
  });

  it('should move to the next and previous card, wrapping around, and reset the flip', () => {
    component.cartaGirata = true;

    component.vaiCartaSuccessiva();
    expect(component.indiceCorrente).toBe(1);
    expect(component.cartaCorrente.tipo).toBe('Virtuale');
    expect(component.cartaGirata).toBeFalse();

    component.cartaGirata = true;
    component.vaiCartaPrecedente();
    expect(component.indiceCorrente).toBe(0);
    expect(component.cartaGirata).toBeFalse();

    // dal primo elemento, "precedente" avvolge sull'ultimo
    component.vaiCartaPrecedente();
    expect(component.indiceCorrente).toBe(component.carte.length - 1);
    expect(component.cartaCorrente.tipo).toBe('Usa e getta');
  });

  it('should jump directly to the requested card and reset the flip', () => {
    component.cartaGirata = true;

    component.vaiACarta(2);

    expect(component.indiceCorrente).toBe(2);
    expect(component.cartaCorrente.tipo).toBe('Usa e getta');
    expect(component.cartaGirata).toBeFalse();
  });

  it('should toggle the flip state', () => {
    expect(component.cartaGirata).toBeFalse();

    component.toggleFlip();
    expect(component.cartaGirata).toBeTrue();

    component.toggleFlip();
    expect(component.cartaGirata).toBeFalse();
  });

  it('should regenerate number and CVV for the disposable card only, without touching the others', () => {
    const usaEGetta = component.carte.find(c => c.id === 'usa-e-getta')!;
    const virtuale = component.carte.find(c => c.id === 'virtuale')!;
    const numeroPrima = usaEGetta.numeroCompleto;
    const cvvPrima = usaEGetta.cvv;
    const numeroVirtualePrima = virtuale.numeroCompleto;
    const eventoFinto = jasmine.createSpyObj('Event', ['stopPropagation']);

    component.rigeneraCartaUsaEGetta(eventoFinto);

    expect(usaEGetta.numeroCompleto).not.toBe(numeroPrima);
    expect(usaEGetta.cvv).not.toBe(cvvPrima);
    expect(virtuale.numeroCompleto).toBe(numeroVirtualePrima);
    expect(eventoFinto.stopPropagation).toHaveBeenCalled();
  });

  it('should navigate relative to the current route to the PIN page, with the requested action and card id', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const route = TestBed.inject(ActivatedRoute);

    component.vaiAPin('cvv', 'principale');

    expect(navigateSpy).toHaveBeenCalledWith(['inserisci-pin'], {
      relativeTo: route,
      queryParams: { azione: 'cvv', carta: 'principale' }
    });
  });

  it('vaiAPin should stop event propagation when an event is passed', () => {
    const eventoFinto = jasmine.createSpyObj('Event', ['stopPropagation']);
    spyOn(router, 'navigate');

    component.vaiAPin('blocca', 'principale', eventoFinto);

    expect(eventoFinto.stopPropagation).toHaveBeenCalled();
  });
});