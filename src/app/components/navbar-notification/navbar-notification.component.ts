import { Component, ElementRef, Renderer2, EventEmitter, Input, Output, Pipe } from "@angular/core";
import { NotificationService } from "../../service/notification.service";
import { CommonModule, DatePipe } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { NotificationComponent } from "../notification/notification.component";
import { PostNotificationAdminComponent } from "../post-notification-admin/post-notification-admin.component";
import { SideButton } from "../../models/SideButton";

@Component({
  selector: "app-navbar-notification",
  standalone: true,
  imports: [
    CommonModule,
    NotificationComponent,
    DatePipe,
    PostNotificationAdminComponent,
    RouterModule,
    
  ],
  templateUrl: "./navbar-notification.component.html",
  styleUrl: "./navbar-notification.component.css",
})
export class NavbarNotificationComponent {
  showNotificationsDropdown = false;
  notifications: any = [];
  userId: number = 1;
  //Botones
  @Input() info: string = "";

  //Rol del usuario logeado
  @Input() userRole: string = "";

  //Titulo de la pagina
  @Output() sendTitle = new EventEmitter<string>();

  @Output() actualRole = new EventEmitter<string>();

  private clickListener: () => void;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.clickListener = this.renderer.listen("document", "click", (event) => {
      this.onDocumentClick(event);
    });
  }

  ngOnInit(): void {
    this.fetchNotifications();
  }

  showNotifications() {
    this.info = "Notificaciones";
    this.router.navigate(["/home/notifications", this.userRole]);
    this.sendTitle.emit(this.info);
    this.actualRole.emit(this.userRole);
    this.toggleNotifications();
  }

  private onDocumentClick(event: MouseEvent): void {
    if (this.showNotificationsDropdown && !this.elementRef.nativeElement.contains(event.target)) {
      this.showNotificationsDropdown = false;
    }
    } 

  ngOnDestroy(): void {
    if (this.clickListener) {
      this.clickListener();
    }
  }

  showSendNotificationsAdmin() {
    this.info = "Envio de Notificaciones Generales";
    this.sendTitle.emit(this.info);
    this.router.navigate(["/home/admin-post-notification"]);
  }

  toggleNotifications(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
  }


  fetchNotifications(): void {
    this.notificationService.getData(this.userId).subscribe((data) => {
      this.notifications = [
        ...data.fines,
        ...data.access,
        ...data.payments,
        ...data.generals,
      ];
      
      
      this.notifications.sort(
        (
          a: { created_datetime: string | number | Date },
          b: { created_datetime: string | number | Date }
        ) =>
          new Date(b.created_datetime).getTime() -
          new Date(a.created_datetime).getTime()
      );
    });
  }

  get unreadNotifications(): any[] {
    return this.notifications.filter((notification: { markedRead: any; }) => !notification.markedRead);
  }
  
  get recentNotifications(): any[] {
  const sortedNotifications = [...this.notifications].sort(
    (a, b) => new Date(b.created_datetime).getTime() - new Date(a.created_datetime).getTime()
  );

  const unread = sortedNotifications.filter(notification => !notification.markedRead);
  const read = sortedNotifications.filter(notification => notification.markedRead);

  if (unread.length >= 4) {
    return unread.slice(0, 4);
  }

  const remainingCount = 4 - unread.length;
  return [...unread, ...read.slice(0, remainingCount)];  }


  toggleNotificationsAndFetch(): void {
    this.toggleNotifications();
    this.fetchNotifications();
  }

  leida(noti: any) {
    let tipoNoti = "";
    switch (noti.subject) {
      case "Ingreso de visitante":
        tipoNoti = "ACCESS";
        break;

      case "Nueva notificacion de multa":
        tipoNoti = "FINES";
        break;

      case "Notificacion General":
        tipoNoti = "GENERAL";
        break;

      case "Notificacion de Inventario":
        tipoNoti = "INVENTORY";
        break;

      case "payments":
        tipoNoti = "PAYMENTS";
        break;
    }

    this.notificationService.putData(noti.id, tipoNoti).subscribe({
      next: () => {
        this.fetchNotifications();
      },
    });
  }
}
