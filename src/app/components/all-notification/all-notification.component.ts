import { Component, OnInit } from '@angular/core';
import { NotificationRegisterService } from '../../service/notification-register.service';
import { Notifications } from '../../models/notifications';
import { Access } from '../../models/access';
import { Fine } from '../../models/fine';
import { Payments } from '../../models/payments';
import { General } from '../../models/general';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { style } from '@angular/animations';
import "datatables.net-select"
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-all-notification',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './all-notification.component.html',
  styleUrl: './all-notification.component.css'
})
export class AllNotificationComponent implements OnInit{

  ngOnInit(): void {
    this.llenarData();
    $('#myTable').DataTable({
      select: {
        style: 'multi'
    },
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      pageLength: 10,
      

    });
  }

  constructor(private service: NotificationRegisterService) {}

  originalAccessList: Access[] = []; 
  originalFinesList:Fine[] = []
  originalPaymentsList:Payments[] = []
  originalGeneralsList:General[]= []
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

        this.fillTable(); 
        console.log(value)
      },
      error: ()=> {
        alert('error al cargar las notifications')
      }
     })
  }

  fillTable() {
    let table = $("#myTable").DataTable();
    for (let notification of this.data.access) {
    const date = notification.date as { [key: string]: any }
    let dateString = date[0] + "-" + date[1] + "-" + date[2] + "  " + date[3] + ":" + date[4] + ":" + date[5]
      table.row.add([notification.subject, notification.description, dateString, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
    }
    for (let notification of this.data.fines) {

      table.row.add([notification.subject, notification.description, notification.date, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
    }
    for (let notification of this.data.payments) {

      table.row.add([notification.subject, notification.description, notification.date, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
    }
    for (let notification of this.data.generals) {

      table.row.add([notification.subject, notification.description, notification.date, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
    }
  }
}