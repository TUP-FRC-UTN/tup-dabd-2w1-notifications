import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FineService } from '../service/fine.service';
import { Fine } from '../fine';
import { Subscription } from 'rxjs';

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

  constructor(private fineService: FineService) {}


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
  }
}