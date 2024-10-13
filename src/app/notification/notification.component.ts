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
  notifications: Fine[] = []; 
  selectedNotification: Fine | null = null; 
  showModal = false; 
  showAlert = true; 
  data: Fine[] = [];

  ngOnInit(): void {
    if (this.data != null) {
      this.llenarData();
    }
  }

  selectNotification(notification: Fine) {
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