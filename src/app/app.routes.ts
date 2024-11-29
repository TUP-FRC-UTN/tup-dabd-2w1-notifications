import { Routes } from "@angular/router";
import { NotificationComponent } from "./components/notification/notification.component";
import { PostNotificationAdminComponent } from "./components/post-notification-admin/post-notification-admin.component";
import { AllNotificationComponent } from "./components/all-notification/all-notification.component";
import { UsersNavbarComponent } from "./components/users-navbar/users-navbar.component";
import { roleGuard } from "./guard";
import { ChartComponent } from "./components/chart/chart.component";
import { SelectMultipleComponent } from "./components/select-multiple/select-multiple.component";

export const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },

  {
    path: "home", component: UsersNavbarComponent,
    children: [
      { path: "chart", component: ChartComponent },
      { path: "notifications/show", component: NotificationComponent },
      {
        path: "admin-post-notification",
        component: PostNotificationAdminComponent,
        canActivate: [roleGuard]
      },
      { path: "admin-all-notifications", component: AllNotificationComponent,canActivate: [roleGuard]},
    ],
  },
  {path: "dropdown", component: SelectMultipleComponent},
  {path: "allNotification", component: AllNotificationComponent},
];
