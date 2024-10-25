import { Component, OnInit } from '@angular/core';
import { NotificationRegisterService } from '../service/notification-register.service';
import { Notifications } from '../models/notifications';

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

  data?: Notifications[];

  llenarData() {
    this.service.getData().subscribe(notif => {
      this.data = notif;
      console.log(this.data);
    })
  }
}
