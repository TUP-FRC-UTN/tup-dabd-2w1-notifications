import { AfterViewInit, Component, inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { NotificationService } from '../service/notification.service';
import { NotificationGeneral } from '../notificationGeneral';
import { UserApiDTO } from '../models/DTOs/UserApiDTO';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { style } from '@angular/animations';
import "datatables.net-select"
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { General } from '../models/general';
import { NotificationGeneralDTO } from '../models/DTOs/NotificationGeneralDTO';
import { UserDTO } from '../models/DTOs/UserDTO';

@Component({
  selector: 'app-post-notification-admin',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './post-notification-admin.component.html',
  styleUrl: './post-notification-admin.component.css'
})
export class PostNotificationAdminComponent implements AfterViewInit, OnInit{


  httpClient : HttpClient = inject(HttpClient);
  constructor(private notificationService: NotificationService) {}

  users : UserApiDTO[] = []

  ngOnInit(): void {
      const users = this.httpClient.get<UserApiDTO[]>
      ("https://my-json-server.typicode.com/405786MoroBenjamin/users-responses/users")
      .subscribe(response =>
        {this.users = response;
          this.fillTable();
      })
  }

  fillTable() {
    let table = $("#myTable").DataTable();
    for (let user of this.users) {
      
      table.row.add([user.id,user.name,user.lastname,user.dni,user.email]).draw(false);
    }
  }
  radioButtonValue : string = "allUsers";

  ngAfterViewInit(): void {
      this.setTable();
  }

  setTable(): void {
    $('#myTable').DataTable({
      select: {
        style: 'multi'
    },
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      pageLength: 10,
      language: {
        
        emptyTable: "No hay datos para mostrar",
        search: "Buscar",
        loadingRecords: "Cargando...",
        paginate: {
        first: "Primero",
        last: ">>",
        next: ">",
        previous: "Anterior",
      },
      info:"Mostrando de _START_ a _END_ total de _TOTAL_ usuarios",
      
      }
      

    });
  }

  newNotification : NotificationGeneralDTO = {
    users : [],
    senderId: 0,
    subject: "",
    description : "",
    channel: "EMAIL"
  }

  selectedUser: string = ''; 

  save(form: NgForm) {
    console.log('click: ', form.value);
    if (form.valid) {
      if (this.radioButtonValue != "allUsers") {
        this.newNotification.users = this.getSelectedUsers()
      }
      else {
        this.newNotification.users = this.mapUserApiDTOToUserDTO();
      }
      
      console.log(this.newNotification);
      this.notificationService.postNotification(this.newNotification).subscribe({
        next: (response) => {
          console.log('Notificacion enviada: ', response);
        },
        error: (error) => {
          console.error('Error al enviar la notificacion: ', error);
        }
      });
    }
  }

  getSelectedUsers() : UserDTO[]{
    let table = $("#myTable").DataTable();
    
    let users : UserDTO[] = []
    const amountOfUsers = table.rows({selected:true}).count();
    let rowData = table.rows({ selected: true }).data() as { [key: string]: any };
    for (let i = 0; i < amountOfUsers; i++) {
      //hardcoded telegram chatId and email for demo
      if (i == 0 ) {
        let user : UserDTO = {
          id : rowData[i][0],
          email: "solis.luna.ignacio@gmail.com",
          chatId : 5869258860
        }
        users.push(user)
      }
      else {
        let user : UserDTO = {
          id : rowData[i][0],
          email: rowData[i][4],
          //Cambiar a chatId cuando api users tenga ese campo
          chatId: 0
          
        }
        users.push(user)
      }
      
    }
    return users;
  }

  mapUserApiDTOToUserDTO() : UserDTO[]{

    let userDTOArray : UserDTO[] = []
    for (let user of this.users) {
      let userDTO : UserDTO = {
        id: user.id,
        email: user.email,
        chatId : 0
      }
      userDTOArray.push(userDTO);
    }
    return userDTOArray
  }
}