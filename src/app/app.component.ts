import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { NotificationComponent } from './notification/notification.component';
import { FineService } from './service/fine.service';
import { HttpClientModule } from '@angular/common/http';
import { PostNotificationAdminComponent } from "./post-notification-admin/post-notification-admin.component";
import { NotificationService } from './service/notification.service';
import { AllNotificationComponent } from "./all-notification/all-notification.component";
import { NavbarNotificationComponent } from "./navbar-notification/navbar-notification.component";
import { UsersNavbarComponent } from "./users-navbar/users-navbar.component";
NotificationService
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NotificationComponent, PostNotificationAdminComponent, AllNotificationComponent, NavbarNotificationComponent, UsersNavbarComponent], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'mockup';
  showNotificationsDropdown = false;
  showFormNotification = false;
  showAllNotifications = false;
  notifications: any = [];
  userId:number = 1;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }
  toggleAllNotifications(): void {
    this.showAllNotifications = !this.showAllNotifications;
    this.showNotificationsDropdown = false;
    this.showFormNotification = false;
  }
   
  toggleNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    this.showFormNotification = false
    this.showAllNotifications = false
  }

  toggleFormNotification(): void {
    this.showFormNotification = !this.showFormNotification;
    this.showNotificationsDropdown = false;
    this.showAllNotifications = false
  }

  fetchNotifications(): void {
    this.notificationService.getData(this.userId).subscribe(data => {
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