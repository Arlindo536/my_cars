import { NgModule } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterModule,
  Routes,
  ViewTransitionInfo,
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { adminGuard } from './auth/admin-guard';
import { guestGuard } from './auth/guest-guard';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';
import { NotFound } from './not-found/not-found';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'cars',
    loadChildren: () => import('./car/car-module').then(m => m.CarModule),
    // Legacy pages from when customers added their own cars; the fleet now lives under /admin/cars
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'bookings',
    loadChildren: () => import('./booking/booking-module').then(m => m.BookingModule),
    canActivate: [authGuard]
  },
  {
    path: 'messages',
    loadChildren: () => import('./messages/messages-module').then(m => m.MessagesModule),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule),
    canActivate: [authGuard, adminGuard]
  },
  { path: 'register', 
    component: Register, 
    canActivate: [guestGuard] 
  },
  { path: 'login', 
    component: Login, 
    canActivate: [guestGuard] 
  },
  // Public catalog: home page and car pages. Keep it after the other routes.
  {
    path: '',
    loadChildren: () => import('./catalog/catalog-module').then(m => m.CatalogModule)
  },
  { path: '**', component: NotFound },
];

// Cross-fade between pages, but not when only the query string changes (filters, pages of a list)
function onViewTransitionCreated({ transition, from, to }: ViewTransitionInfo) {
  if (pagePath(from) === pagePath(to)) {
    transition.skipTransition();
  }
}

function pagePath(root: ActivatedRouteSnapshot): string {
  let route = root;
  while (route.firstChild) {
    route = route.firstChild;
  }
  return route.pathFromRoot.map(r => r.url.join('/')).join('/');
}

// provideRouter instead of RouterModule.forRoot: only the functional API has the transition hook
@NgModule({
  imports: [RouterModule],
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      // no fade on the first page load (it would delay the first paint)
      withViewTransitions({ skipInitialTransition: true, onViewTransitionCreated }),
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}