import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notifications } from '../models/notifications';
import { NotificationGeneral } from '../notificationGeneral';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private urlApi = 'http://localhost:8080/Notification/1';
  private urlPost = 'http://localhost:8080/general/postNotificationGeneral';

  constructor(private http: HttpClient) { }

  public getData(): Observable<Notifications> {
    return this.http.get<Notifications>(this.urlApi); 
  }

  public postNotification(notification: NotificationGeneral): Observable<NotificationGeneral> {
    return this.http.post<NotificationGeneral>(this.urlPost, notification);
  }

}
