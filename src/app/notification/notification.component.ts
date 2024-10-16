import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FineService } from '../service/fine.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../service/notification.service';
import { Notifications } from '../models/notifications';
import { Fine } from '../models/fine';

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
export class NotificationComponent implements OnInit, OnDestroy{
  notifications: Fine[] = []; 
  selectedNotification: Fine | null = null; 
  showModal = false; 
  showAlert = true; 
  data: Fine[] = [];
  data2: Notifications | null = null;
  subscription:Subscription = new Subscription();

  ngOnInit(): void {
    if (this.data != null) {
      this.llenarData();
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  constructor(private fineService: FineService, private notificationService:NotificationService) {}


  llenarData() {
     const getAllSubscription = this.fineService.getData().subscribe({
      next: (value:Fine[]) =>{
        this.data = value
        console.log(value)
      },
      error: ()=> {
        alert('error al cargar las fines')
      }
     })
     this.subscription.add(getAllSubscription);

     const getSubscription = this.notificationService.getData().subscribe({
      next: (value:Notifications) =>{
        this.data2 = value
        console.log(value)
      },
      error: ()=> {
        alert('error al cargar las notifications')
      }
     })
     this.subscription.add(getSubscription);
  }
}