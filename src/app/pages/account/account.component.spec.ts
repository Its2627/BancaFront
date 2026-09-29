import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AccountComponent } from './account.component';
import { AccountService, Profile } from '../../services/account.service';
import { AuthService, User } from '../../services/auth.service';

const mockProfile: Profile = {
  contoCorrenteId: 1,
  email: 'mario.rossi@example.com',
  nomeTitolare: 'Mario',
  cognomeTitolare: 'Rossi',
  dataApertura: '2026-01-15T12:00:00',
  iban: 'IT60X0542811101000000123456',
};

const loggedUser: User = {
  id: '99',
  firstName: 'Giulia',
  lastName: 'Bianchi',
  picture: '',
};

describe('AccountComponent', () => {
  let fixture: ComponentFixture<AccountComponent>;
  let accountServiceSpy: { getProfile: jasmine.Spy };

  async function setup(getProfileReturn: any, user: User | null = null) {
    accountServiceSpy = {
      getProfile: jasmine.createSpy('getProfile').and.returnValue(getProfileReturn),
    };
    const authServiceMock = { currentUser: signal<User | null>(user).asReadonly() };

    await TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges(); // ngOnInit -> chiama getProfile()
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup(of(mockProfile));
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("chiama getProfile una volta all'avvio", async () => {
    await setup(of(mockProfile));
    expect(accountServiceSpy.getProfile).toHaveBeenCalledTimes(1);
  });

  it("mostra nome e cognome dell'utente loggato", async () => {
    await setup(of(mockProfile), loggedUser);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Giulia');
    expect(text).toContain('Bianchi');
    expect(text).not.toContain('Mario');
  });

  it("usa i dati del profilo se non c'è un utente loggato", async () => {
    await setup(of(mockProfile), null);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Mario');
    expect(text).toContain('Rossi');
  });

  it('mostra gli altri dati del profilo', async () => {
    await setup(of(mockProfile), loggedUser);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('mario.rossi@example.com');
    expect(text).toContain('15/01/2026');
    expect(text).toContain('IT60X0542811101000000123456');
  });

  it('non mostra mai la password', async () => {
    await setup(of(mockProfile), loggedUser);

    expect(fixture.nativeElement.textContent.toLowerCase()).not.toContain('password');
  });

  it("mostra un placeholder se l'IBAN non è ancora assegnato", async () => {
    await setup(of({ ...mockProfile, iban: null }));

    expect(fixture.nativeElement.textContent).toContain('Non ancora assegnato');
  });

  it('mostra un errore se il servizio fallisce', async () => {
    await setup(throwError(() => new Error('errore')));

    expect(fixture.nativeElement.textContent).toContain('errore durante il caricamento');
  });
});