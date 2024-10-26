import { Component, OnInit } from '@angular/core';
import { NotificationRegisterService } from '../service/notification-register.service';
import { Notifications } from '../models/notifications';
import { Access } from '../models/access';
import { Fine } from '../models/fine';
import { Payments } from '../models/payments';
import { General } from '../models/general';

@Component({
  selector: 'app-all-notification',
  standalone: true,
  imports: [],
  templateUrl: './all-notification.component.html',
  styleUrl: './all-notification.component.css'
})
export class AllNotificationComponent implements OnInit{

  ngOnInit(): void {
    this.llenarData();
  }

  constructor(private service: NotificationRegisterService) {}

  originalAccessList: Access[] = []; 
  originalFinesList:Fine[] = []
  originalPaymentsList:Payments[] = []
  originalGeneralsList:General[]= []
  startDate: Date = new Date();
  endDate: Date= new Date();
  data: Notifications = {
    fines: [],
    access: [],
    payments: [],
    generals: []
  };

  llenarData() {
    const getSubscription = this.service.getData().subscribe({
      next: (value:Notifications) =>{
        this.data = value
        this.originalAccessList = [...value.access]
        this.originalFinesList = [...value.fines]
        this.originalPaymentsList = [...value.payments]
        this.originalGeneralsList = [...value.generals]

        console.log(value)
      },
      error: ()=> {
        alert('error al cargar las notifications')
      }
     })
  }
}
