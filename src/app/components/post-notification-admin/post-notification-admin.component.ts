import { AfterViewInit, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from '../../service/notification.service';
import { UserApiDTO } from '../../models/DTOs/UserApiDTO';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import "datatables.net-select"
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationGeneralDTO } from '../../models/DTOs/NotificationGeneralDTO';
import { UserDTO } from '../../models/DTOs/UserDTO';
import Swal from 'sweetalert2';
import { ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-post-notification-admin',
  standalone: true,
  imports: [FormsModule, NgClass, ReactiveFormsModule],
  templateUrl: './post-notification-admin.component.html',
  styleUrl: './post-notification-admin.component.css'
})
export class PostNotificationAdminComponent implements AfterViewInit, OnInit{

 //Botones
 @Input() info: string = "";

 //Rol del usuario logeado
 @Input() userRole: string = "";

 //Titulo de la pagina
 @Output() sendTitle = new EventEmitter<string>();


  httpClient : HttpClient = inject(HttpClient);
  constructor(private notificationService: NotificationService) {}
  selectValue : string = "1";
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

      table.row.add([user.name,user.lastname,user.dni,user.email, '<input type="checkbox" class="userCheckbox" />']).draw(false);
    }
  }
  radioButtonValue : string = "allUsers";
  

  ngAfterViewInit(): void {
      this.setTable();
      this.selectValue = "1"
  }

  setTable(): void {
    $("#myTable").DataTable({
      dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>',
      
      columnDefs: [
        {
          targets: 4,
          className: 'text-center align-middle',
        }
      ],

      select: {
        style: "multi",
        selector: 'td:first-child input[type="checkbox"]'
      },
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      pageLength: 10,
      order: [[1, "asc"]],
      language: {
        emptyTable: "Cargando...",
        search: "Buscar",
        loadingRecords: "Cargando...",
        zeroRecords: "No se han encontrado registros",
        lengthMenu: "_MENU_",
        info: " ",
      },
    });

    $("#searchTerm").on("keyup", function () {
      $("#myTable")
        .DataTable()
        .search($(this).val() as string)
        .draw();
    });

    $('#selectAll').on('click', function() {
      const isChecked = $(this).prop('checked');
      $('input[type="checkbox"].userCheckbox').prop('checked', isChecked);
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

  onSubmit(form: NgForm) {
    console.log('click: ', form.value);
    

    if (form.valid && this.selectValue != "1") {

      if (this.radioButtonValue == "allUsers") {
        this.newNotification.users = this.mapUserApiDTOToUserDTO(this.users);
        
      }
      else if (this.radioButtonValue == "onlyTo"){
        this.newNotification.users = this.getSelectedUsers()
      }
      else if (this.radioButtonValue == "exclude") {
        this.newNotification.users = this.getFilteredUsers();
      }

      this.newNotification.channel = this.selectValue;
      
      this.notificationService.postNotification(this.newNotification).subscribe({
        next: (response: any) => {
          console.log('Notificacion enviada: ', response);
          Swal.fire({
            title: '¡Notificación enviada!',
            text: 'La notificacion ha sido enviada correctamente.',
            icon: 'success',
            showConfirmButton: true,
            confirmButtonText: 'Aceptar'
          });
        },
        error: (error) => {
          console.error('Error al enviar la notificacion: ', error);
        }
      });
    }
    else {
      console.log("form invalid");
    }
  }

//Adaptacion REACTIVE FORMS...

// notificationForm: FormGroup;
  
// constructor(
//   private notificationService: NotificationService,
//   private fb: FormBuilder
// ) {
//   this.notificationForm = this.fb.group({
//     subject: ['', [Validators.required, Validators.maxLength(20)]],
//     description: ['', Validators.required],
//     radioButtonValue: ['allUsers'],
//     selectValue: ['1', Validators.required]
//   });
// }
// clearForm() { 
  //  this.notificationForm.reset({
  //   radioButtonValue: 'allUsers',
   //  selectValue: '1'
   // });
  //}

  // onSubmit() {
  //   if (this.notificationForm.valid && this.notificationForm.get('selectValue')?.value !== '1') {
  //     this.newNotification.subject = this.notificationForm.get('subject')?.value;
  //     this.newNotification.description = this.notificationForm.get('description')?.value;
  //     this.newNotification.channel = this.notificationForm.get('selectValue')?.value;

  //     if (this.notificationForm.get('radioButtonValue')?.value === 'allUsers') {
  //       this.newNotification.users = this.mapUserApiDTOToUserDTO(this.users);
  //     } else if (this.notificationForm.get('radioButtonValue')?.value === 'onlyTo') {
  //       this.newNotification.users = this.getSelectedUsers();
  //     } else if (this.notificationForm.get('radioButtonValue')?.value === 'exclude') {
  //       this.newNotification.users = this.getFilteredUsers();
  //     }
  //   }
  // }
  

  clearForm(form : NgForm) {
    // form.reset();
    // this.radioButtonValue = "allUsers";
    let table = $("#myTable").DataTable()
    table.search((d) => d.includes('Alice')).draw();
  }
  getSelectedUsers() : UserDTO[]{
    let table = $("#myTable").DataTable();
    
    let users : UserDTO[] = []
    
    $("#myTable tbody tr").each(function () {
      const checkbox = $(this).find("input.userCheckbox");
      if (checkbox.is(":checked")) {

        const rowData = $("#myTable").DataTable().row(this).data();
        
        let user: UserDTO = {
          id: rowData.id,
          email: "solis.luna.ignacio@gmail.com",
          telegramChatId: 5869258860
        };
        users.push(user);
      }
    }); 

    return users;
    console.log(users)
  }

  mapUserApiDTOToUserDTO(userApiArr : UserApiDTO[]) : UserDTO[]{

    let userDTOArray : UserDTO[] = []
    for (let user of userApiArr) {
      let userDTO : UserDTO = {
        id: user.id,
        email: user.email,
        telegramChatId : 0
      }
      userDTOArray.push(userDTO);
    }
    return userDTOArray
  }

  getFilteredUsers() : UserDTO[] {
    let selectedUsers = this.getSelectedUsers();

    const filteredUsers = this.users.filter(
      user => !selectedUsers.some(selectedUser => selectedUser.id === user.id)
    );
    
    let filteredUserDTOArray = this.mapUserApiDTOToUserDTO(filteredUsers);
    
    filteredUserDTOArray[0].telegramChatId = 5869258860;
    filteredUserDTOArray[0].email = "solis.luna.ignacio@gmail.com"
    return filteredUserDTOArray;
    
  }
  
}