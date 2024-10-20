import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { NotificationComponent } from './notification/notification.component';
import { FineService } from './service/fine.service';
import { HttpClientModule } from '@angular/common/http';
import { PostNotificationAdminComponent } from "./post-notification-admin/post-notification-admin.component";
import { NotificationService } from './service/notification.service';
NotificationService
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NotificationComponent, PostNotificationAdminComponent], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'mockup';
  showNotificationsDropdown = true;
  showFormNotification = false;
  notifications: any = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  toggleNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
  }

  toggleFormNotification(): void {
    this.showFormNotification = !this.showFormNotification;
  }

  fetchNotifications(): void {
    this.notificationService.getData().subscribe(data => {
      this.notifications = [...data.fines, ...data.access, ...data.payments];
    });
  }

  toggleNotificationsAndFetch(): void {
    this.toggleNotifications();
    this.fetchNotifications();
  }
  // constructor(private fineService: FineService) {}

  // llenarData() {
  //   this.fineService.getData().subscribe(data => {
  //     this.data = data;
  //     console.log(data);
  //   })
  // }
}