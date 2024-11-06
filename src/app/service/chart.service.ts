import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ChartService {
  private apiUrl = 'http://localhost:8080/NotificationsRegister'; //cambiar por las dudas pero las cosas las trae

  constructor(private http: HttpClient) {}

  getChartData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`); 
  }
}