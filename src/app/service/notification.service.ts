import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notifications } from '../models/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private urlApi = 'http://localhost:8080/Notification/3';

  constructor(private http: HttpClient) { }

  public getData(): Observable<Notifications> {
    return this.http.get<Notifications>(this.urlApi);
  }


}
