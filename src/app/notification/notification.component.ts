import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FineService } from '../service/fine.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../service/notification.service';
import { Notifications } from '../models/notifications';
import { Fine } from '../models/fine';
import { FormsModule } from '@angular/forms';
import { Access } from '../models/access';

interface Notification {
  subject: string;
  description: string;
  date: string;
  user: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy{
  
  notifications: Fine[] = []; 
  selectedNotification: Fine | null = null; 
  showModal = false; 
  showAlert = true; 
  originalAccessList: Access[] = []; 
  startDate: Date = new Date();
  endDate: Date= new Date();
  data: Notifications = {
    fines: [],
    access: [],
    payments: []
  };
  data2: Notifications = {
    fines: [],
    access: [],
    payments: []
  };
  filteredAccessList: Access[] = [];
  
  isWithinRange: boolean | null = null;
  subscription:Subscription = new Subscription();
  selected:string = 'Accesos';
  
  

  ngOnInit(): void {
    if (this.data2 != null) {
      this.llenarData();
      
    }
    

    console.log(this.startDate)
    console.log(this.endDate)
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  selectNotification() { 
    this.showModal = true; 
  }

  closeModal() {
    this.showModal = false; 
    this.selectedNotification = null; 
  }

  closeAlert() {
    this.showAlert = false; 
  }

  constructor(private fineService: FineService, private notificationService:NotificationService) {
  
  }


  llenarData() {
     const getSubscription = this.notificationService.getData().subscribe({
      next: (value:Notifications) =>{
        this.data2 = value
        this.data = value
        this.originalAccessList = [...value.access]
        console.log(value)
      },
      error: ()=> {
        alert('error al cargar las notifications')
      }
     })
     this.subscription.add(getSubscription);
  }


  cambiar(value:string){
    switch (value){
      case 'Multas':
        this.selected = 'Multas'
        
        break;

      case 'Accesos':
        this.selected = 'Accesos'
        break;

      case 'Pagos':
        this.selected = 'Pagos'
        break;
    }
    
  }

  updatedList(){

    let accessList:Access[] = []
    this.data.access = this.originalAccessList
    this.data2.access.forEach(e => {
      const createdDate = new Date(e.created_datetime);
      const startDate2 = new Date(this.startDate)
      const endDate2 = new Date(this.endDate)
      if(createdDate >= startDate2 && createdDate <= endDate2){
        accessList.push(e)
      }
    
    });
    this.data2.access=accessList

  }

}