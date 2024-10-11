import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  subject: string;
  description: string;
  date: string;
  user: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = []; 
  selectedNotification: Notification | null = null; 
  showModal = false; 
  showAlert = true; 

  ngOnInit(): void {
   
    this.notifications = [
 
      {
        subject: 'Nueva solicitud',
        description: 'Has recibido una nueva solicitud de contacto.',
        date: '2024-10-11',
        user: 'Usuario1'
      },
      {
        subject: 'Recordatorio',
        description: 'No olvides la reunión de mañana a las 10 AM.',
        date: '2024-10-10',
        user: 'Usuario2'
      }
    ];
  }

  selectNotification(notification: Notification) {
    this.selectedNotification = notification; 
    this.showModal = true; 
  }

  closeModal() {
    this.showModal = false; 
    this.selectedNotification = null; 
  }

  closeAlert() {
    this.showAlert = false; 
  }
}