import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MovementComponent } from './movement.component';

describe('MovementComponent', () => {

  // Componente che viene utilizzato nei test
  let component: MovementComponent;

  // Gestisce il componente durante il test
  let fixture: ComponentFixture<MovementComponent>;

  // Configura il componente prima di ogni test
  beforeEach(async () => {

    // Configura l'ambiente di test
    await TestBed.configureTestingModule({
      
      // Importa il componente da testare
      imports: [MovementComponent],

      // Configura il client HTTP per poter effettuare test sulle chiamate HTTP
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ],

    }).compileComponents();

    // Crea un'istanza del componente
    fixture = TestBed.createComponent(MovementComponent);

    // Recupera l'istanza del componente
    component = fixture.componentInstance;

    // Aspetta che il componente abbia terminato le operazioni asincrone
    await fixture.whenStable();
  });

  // Verifica che il componente venga creato correttamente
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});