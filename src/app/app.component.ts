import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { NotificationComponent } from './notification/notification.component';
import { FineService } from './service/fine.service';
import { HttpClientModule } from '@angular/common/http';
import { PostNotificationAdminComponent } from "./post-notification-admin/post-notification-admin.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NotificationComponent, PostNotificationAdminComponent], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'mockup';
  showNotifications = false;
  showFormNotification = false;

  toggleNotifications() {
    console.log('Bell icon clicked'); 
    this.showNotifications = !this.showNotifications;
    console.log('showNotifications:', this.showNotifications); 
  }

  toggleFormNotification() {
    console.log('Bell icon clicked'); 
    this.showFormNotification = !this.showFormNotification;
    console.log('showNotifications:', this.showFormNotification); 
  }

  // constructor(private fineService: FineService) {}

  // llenarData() {
  //   this.fineService.getData().subscribe(data => {
  //     this.data = data;
  //     console.log(data);
  //   })
  // }
}