import { Component } from '@angular/core';
import { NotificationService } from '../service/notification.service';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../notification/notification.component';
import { PostNotificationAdminComponent } from '../post-notification-admin/post-notification-admin.component';

@Component({
  selector: 'app-navbar-notification',
  standalone: true,
  imports: [CommonModule, NotificationComponent, PostNotificationAdminComponent],
  templateUrl: './navbar-notification.component.html',
  styleUrl: './navbar-notification.component.css'
})
export class NavbarNotificationComponent {
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
}
