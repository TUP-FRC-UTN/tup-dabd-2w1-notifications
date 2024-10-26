import { Routes } from '@angular/router';
import { NotificationComponent } from './notification/notification.component';
import { PostNotificationAdminComponent } from './post-notification-admin/post-notification-admin.component';
import { AllNotificationComponent } from './all-notification/all-notification.component';


export const routes: Routes = [
  { path: 'notification', component: NotificationComponent },
  { path: 'post-notification-admin', component: PostNotificationAdminComponent },
  { path: 'all-notifications', component: AllNotificationComponent },
];
