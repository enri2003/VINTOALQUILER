import { LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsBo from '@angular/common/locales/es-BO';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

registerLocaleData(localeEsBo);

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient(), { provide: LOCALE_ID, useValue: 'es-BO' }],
});
