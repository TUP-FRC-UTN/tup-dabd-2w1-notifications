import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NotificationService } from '../service/notification.service';
import { NotificationGeneral } from '../notificationGeneral';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { style } from '@angular/animations';
import "datatables.net-select"

@Component({
  selector: 'app-post-notification-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './post-notification-admin.component.html',
  styleUrl: './post-notification-admin.component.css'
})
export class PostNotificationAdminComponent implements OnInit{


  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
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


  notification: NotificationGeneral = {
    subject: '',
    description: '',
    users: [],
    date: new Date()
  }

  selectedUser: string = ''; 

  save(form: NgForm) {
    console.log('click: ', form.value);
    if (form.valid) {
      this.notification.users = [this.selectedUser];
      
      this.notificationService.postNotification(this.notification).subscribe({
        next: (response) => {
          console.log('Notificacion enviada: ', response);
        },
        error: (error) => {
          console.error('Error al enviar la notificacion: ', error);
        }
      });
    }
  }

  cancelar() {
  }
}