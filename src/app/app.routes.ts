import { Routes } from "@angular/router";
import { NotificationComponent } from "./components/notification/notification.component";
import { PostNotificationAdminComponent } from "./components/post-notification-admin/post-notification-admin.component";
import { AllNotificationComponent } from "./components/all-notification/all-notification.component";
import { UsersNavbarComponent } from "./components/users-navbar/users-navbar.component";
import { roleGuard } from "./guard";

export const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },

  {
    path: "home", component: UsersNavbarComponent,
    children: [
      { path: "notifications/:rol", component: NotificationComponent },
      {
        path: "admin-post-notification",
        component: PostNotificationAdminComponent,
      },
      { path: "admin-all-notifications", component: AllNotificationComponent,canActivate: [roleGuard] },
    ],
  },
  {path: "allNotification", component: AllNotificationComponent},
];
