import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NotificationService } from '../service/notification.service';
import { NotificationGeneral } from '../notificationGeneral';

@Component({
  selector: 'app-post-notification-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './post-notification-admin.component.html',
  styleUrl: './post-notification-admin.component.css'
})
export class PostNotificationAdminComponent {

  constructor(private notificationService: NotificationService) {}

  notification: NotificationGeneral = {
    subject: '',
    description: '',
    users: [],
    date: new Date()
  }

  save(form: NgForm) {
    console.log('click: ', form.value)
    if (form.valid) { 
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
