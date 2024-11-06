import { NgModule } from '@angular/core';
import { GoogleChartsModule } from 'angular-google-charts';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
imports: [GoogleChartsModule],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class YourModule { }