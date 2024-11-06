import { NgModule } from '@angular/core';
import { GoogleChartsModule } from 'angular-google-charts';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
imports: [GoogleChartsModule, HttpClientModule],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class YourModule { }