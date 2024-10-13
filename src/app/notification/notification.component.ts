import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FineService } from '../service/fine.service';
import { Fine } from '../fine';

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
  data: Fine[] = [];

  ngOnInit(): void {
    if (this.data != null) {
      this.llenarData();
    }

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

  constructor(private fineService: FineService) {}

  llenarData() {
    this.fineService.getData().subscribe(data => {
      this.data = data;
      console.log(data);
    })
  }
}