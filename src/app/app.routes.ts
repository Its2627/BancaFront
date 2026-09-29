import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LandingComponent } from './pages/landing/landing.component';
import { authGuard } from './utils/auth.guard';
import { RechargeComponent } from './pages/recharge/recharge.component';
import { TransferComponent } from './pages/transfer/transfer.component';
import { MovementComponent } from "./pages/movement/movement.component";
import { ResetPasswordComponent } from "./pages/reset-password/reset-password.component";
import { HomeComponent } from "./pages/home/home.component";
import { HomeContentComponent } from './pages/home-content/home-content.component';
import { CardComponent } from './pages/card/card.component';
import { AccountComponent } from './pages/account/account.component';
import { InserisciPinComponent } from './pages/inserisci-pin/inserisci-pin.component';
import { InserisciPasswordComponent } from './pages/inserisci-password/inserisci-password.component';
import {ChangePasswordComponent} from "./pages/change-password/change-password.component";

export const routes: Routes = [
    {
        path: 'landing',
        component: LandingComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password', component: ResetPasswordComponent }
        ]
    },
    {
        path: '',
        redirectTo: 'landing',
        pathMatch: 'full'
    },

    {
        path: 'recharge',
        component: RechargeComponent
    },
    /*{
        path: 'transfer',
        component: TransferComponent
    },*/
    {
        path: 'movement',
        component: MovementComponent
    },
    {
        path: 'home',
        component: HomeComponent,
        children: [
            {
                path: '',
                component: HomeContentComponent
            },
            {
                path: 'home-content',
                component: HomeContentComponent
            },
            {
                path: 'account',
                component: AccountComponent,
                children: [
                    {
                        path: 'change-password',
                        component: ChangePasswordComponent
                    }
                ]
            },
            {
                path: 'transfer',
                component: TransferComponent
            },
            {
                path: 'movement',
                component: MovementComponent
            },
            {
                path: 'card',
                component: CardComponent,
                children: [
                    {
                        path: 'inserisci-pin',
                        component: InserisciPinComponent
                    },
                    {
                        path: 'inserisci-password',
                        component: InserisciPasswordComponent
                    }
                ]
            },
            {
                path: 'recharge',
                component: RechargeComponent
            }
        ]
    }
];
