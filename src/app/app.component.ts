import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { NotificationComponent } from './notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NotificationComponent], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mockup';
  showNotifications = false;

  toggleNotifications() {
    console.log('Bell icon clicked'); 
    this.showNotifications = !this.showNotifications;
    console.log('showNotifications:', this.showNotifications); 
  }
}