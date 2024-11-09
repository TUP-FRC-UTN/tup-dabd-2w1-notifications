import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notifications } from '../models/notifications';
import { AllNotifications } from '../models/all-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationRegisterService {

  private url = "http://localhost:8080/NotificationsRegister";

  constructor(private http: HttpClient) { }
  
  public getData(): Observable<AllNotifications> {
    return this.http.get<AllNotifications>(this.url);
  }

  getChartData(startDate: Date, endDate: Date): Observable<AllNotifications> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    return this.http.get<AllNotifications>(this.url, { params });
  }
}
