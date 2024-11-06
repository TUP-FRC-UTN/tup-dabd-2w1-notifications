import {
  Component,
  OnInit,
} from "@angular/core";
import { CommonModule, DatePipe, JsonPipe } from "@angular/common";
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Fine } from "../../models/fine";
import { Access } from "../../models/access";
import { Payments } from "../../models/payments";
import { General } from "../../models/general";
import { Notifications } from "../../models/notifications";
import { NotificationService } from "../../service/notification.service";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { MockUserService } from "../../service/mockUser.service";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
import { Inventory } from "../../models/inventory";
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
  selector: "app-notification",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DatePipe, FormsModule, JsonPipe, NgSelectComponent],
  providers: [DatePipe],
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.css"],
})
export class NotificationComponent implements OnInit {
  userId = 1;
  rolactual: string = "";
  selected: string = "Todas";
  accessList: Access[] = [];
  finesList: Fine[] = [];
  paymentsList: Payments[] = [];
  generalsList: General[] = [];
  inventoryList: Inventory[] = [];
  selectedNotification: any = {
    subject: "placeholder",
    message: "placeholder",
    date: "placeholder"
  }
  selectedNotificationObject : any

  allNotifications: Notifications = {
    fines: [],
    access: [],
    payments: [],
    generals: [],
    inventories: []
  };
  allNotificationsArray : any[] = [];



  dateFilterForm: FormGroup;
  notificationTypes : string[] = 
  ["Todas",
    "Multas",
    "Accesos",
    "Pagos",
    "Generales",
    "Inventario"
  ]
  selectedNotificationType : string = "Todas";

  constructor(
    private service: NotificationService,
    private serviceUser: MockUserService,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute
  ) {
    this.dateFilterForm = new FormGroup({
      startDate: new FormControl(new Date(), [Validators.required]),
      endDate: new FormControl(new Date(), [Validators.required]),
      // all: new FormControl(true),
      // fines: new FormControl(false),
      // access: new FormControl(false),
      // payments: new FormControl(false),
      // generals: new FormControl(false),
    });
  }

  ngOnInit(): void {
    this.llenarData(this.userId);
    $(document).on('click', '.mark-read-btn', (event) => {
      console.log("CLICK EN MARCAR LEIDA")
      console.log(this.selectedNotificationObject);
      
    });
    
    // Configure DataTables with search functionality
    $("#myTable").DataTable({
      columns: [{ width: '13%' }, { width: '15%' }, { width: '25%' }, { width: '40%' }, { width: '8%' }],

      columnDefs: [
        {targets: 0, className: 'text-center align-middle' },
        {targets: 4, className: "text-center"}
      ],
      dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>',
      select: {style: "single"},
      paging: true,
      searching: true,
      ordering: true,
      order: [[0, "desc"]],
      pageLength: 10,
      language: {
        emptyTable: "Cargando...",
        search: "Buscar",
        loadingRecords: "Cargando...",
        zeroRecords: "No se han encontrado registros",
        lengthMenu: "_MENU_",
        info: "",
      }
    });



    // Connect external search input to DataTables
    $('#searchTerm').on('keyup', function() {
      $('#myTable').DataTable().search($(this).val() as string).draw();
    });


    this.initialzeDates();
    this.dateFilterForm.valueChanges.subscribe(() => { 
      this.filterListByDate();
    });

    this.rolactual = this.activatedRoute.snapshot.params["rol"];
  }

  setNotification(data: any) {
    this.selectedNotification = {
      subject: data[1],
      message: data[2],
      date: data[3]
    };
  }

  llenarData(userId: number) {
    this.service.getData(userId).subscribe({
      next: (value: Notifications) => {
        console.log("API RESPONSE: ");
        console.log(value);
        this.allNotifications = value;
        this.accessList = [...value.access];
        this.finesList = [...value.fines];
        this.paymentsList = [...value.payments];
        this.generalsList = [...value.generals];  
        this.inventoryList = [...value.inventories]
        this.fillTable();
      },
      error: () => {
        alert("Error al obtener las notificaciones del back-end");
      },
    });
  }



  fillTable() {
    const table = $("#myTable").DataTable();
    table.clear().draw();
    
    table.on('select', (e, dt, type, indexes) => {
      if (type === 'row') {
        const rowData = table.row(indexes[0]).data();
        let rowIndex = indexes[0]
        this.selectedNotificationObject = this.allNotificationsArray[rowIndex]
        this.setNotification(rowData)
      }
    });

    const addRow = (notification: any, tipo: string) => {
      table.row
        .add([
          this.getTodayDateFormatted(notification.created_datetime),

          tipo,
          notification.subject,
          notification.message,
          `
              
                <a class="btn btn-light align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"
                
                 style="width:40px; height:40px; font-size:1.2rem; padding-top:0.2rem;">
                &#8942;
              </a>
              
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item consultar-btn" href="#" data-bs-toggle="modal"
                    data-bs-target="#idMODAL"">Ver más</a></li>
                    <li><a class="dropdown-item consultar-btn mark-read-btn" 
                    >Marcar como leida</a></li>
                  </ul>

          `,
        ])
        .draw()
    };
    
    
    //por cada array dentro del objeto allNotifications insertar lineas
    this.allNotificationsArray = []
    for (const [key,value] of Object.entries(this.allNotifications)){
      const notificationArray = value;
      let notificationType : string = "";
      switch (key) {
        case "generals":
          notificationType = "General"
          break
        
        case "access" : 
          notificationType = "Acceso"
          break
        
        case "fines" : 
          notificationType = "Multa"
          break
        
        case "payments" : 
          notificationType = "Pago"
          break
        
        case "inventories": 
          notificationType = "Inventario"
          break
        

      }
      
      notificationArray.forEach((notification : any)=>{
        addRow(notification,notificationType)
        this.allNotificationsArray.push(notification)
      })
    }
    
  }


  exportarAExcel() {
    const tabla = $("#myTable").DataTable();
    const filteredData = tabla.rows({ search: "applied" }).data().toArray();

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workBook, worksheet, "Notificaciones");
    XLSX.writeFile(workBook, "notificaciones "+this.getTodayDateFormatted(new Date())+".xlsx");
  }

  exportarAPDF() {
    const tabla = $("#myTable").DataTable();
    const filteredData = tabla.rows({ search: "applied" }).data().toArray();
    const dateFrom = this.formatDateFromString(this.dateFilterForm.controls["startDate"].value)
    const dateTo = this.formatDateFromString(this.dateFilterForm.controls["endDate"].value)

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de Notificaciones (" + dateFrom + " / " + dateTo+ ")", 14, 22);

    autoTable(doc, {
      head: [["Tipo","Asunto", "Descripción", "Fecha"]],
      body: filteredData.map((item: any) => [

        item[0] || "N/A",
        item[1] || "N/A",
        item[2] || "N/A",
        item[3] || "N/A",
      ]),
      startY: 30,
    });

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

    doc.save(`notificaciones_${formattedDate}.pdf`);
  }

  borrar() {
    this.selected = "Todas";
    this.initialzeDates();
  }

  getTodayDateFormatted(date: Date): string {
    const formattedDate = new Date(date);
    return this.datePipe.transform(formattedDate, 'dd/MM/yyyy HH:mm:ss') || '';
  }

  initialzeDates() {
    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDay()
    );
    const endDate = today;

    this.dateFilterForm.patchValue({
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    });
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mes debe ser 1-12
    const day = date.getDate().toString().padStart(2, "0"); // Día debe ser 1-31
    return `${year}-${month}-${day}`; // Retornar en formato yyyy-MM-dd
  }



  filterListByDate() {
    let accessList: Access[] = [];
    this.allNotifications.access = this.accessList;
    this.allNotifications.access.forEach((e) => {
      
      const apiDate = new Date(e.created_datetime);
      
      const createdDate = new Date(
        apiDate.getFullYear(),
        apiDate.getMonth(),
        apiDate.getDate(),
        apiDate.getHours(),
        apiDate.getMinutes(),
        apiDate.getSeconds()
      );
      const startDate2 = new Date(
        this.dateFilterForm.get("startDate")?.value ?? new Date()
      );
      const endDate2 = new Date(this.dateFilterForm.get("endDate")?.value ?? new Date());
      


      if (
        createdDate.toISOString().split("T")[0] >=
          startDate2.toISOString().split("T")[0] &&
        createdDate.toISOString().split("T")[0] <=
          endDate2.toISOString().split("T")[0]
      ) {
        accessList.push(e);
      }
    });
    this.allNotifications.access = accessList;

    let finesList: Fine[] = [];
    this.allNotifications.fines = this.finesList;
    this.allNotifications.fines.forEach((e) => {
      const createdDate = new Date(e.created_datetime);
      const startDate2 = new Date(
        this.dateFilterForm.get("startDate")?.value ?? new Date()
      );
      const endDate2 = new Date(this.dateFilterForm.get("endDate")?.value ?? new Date());

      if (
        createdDate.toISOString().split("T")[0] >=
          startDate2.toISOString().split("T")[0] &&
        createdDate.toISOString().split("T")[0] <=
          endDate2.toISOString().split("T")[0]
      ) {
        finesList.push(e);
      }
    });
    this.allNotifications.fines = finesList;

    let paymentsList: Payments[] = [];
    this.allNotifications.payments = this.paymentsList;
    this.allNotifications.payments.forEach((e) => {
      const createdDate = new Date(e.created_datetime);
      const startDate2 = new Date(
        this.dateFilterForm.get("startDate")?.value ?? new Date()
      );
      const endDate2 = new Date(this.dateFilterForm.get("endDate")?.value ?? new Date());

      if (
        createdDate.toISOString().split("T")[0] >=
          startDate2.toISOString().split("T")[0] &&
        createdDate.toISOString().split("T")[0] <=
          endDate2.toISOString().split("T")[0]
      ) {
        paymentsList.push(e);
      }
    });
    this.allNotifications.payments = paymentsList;

    let generalsList: General[] = [];
    this.allNotifications.generals = this.generalsList;
    this.allNotifications.generals.forEach((e) => {
      const createdDate = new Date(e.created_datetime);
      const startDate2 = new Date(
        this.dateFilterForm.get("startDate")?.value ?? new Date()
      );
      const endDate2 = new Date(this.dateFilterForm.get("endDate")?.value ?? new Date());
      if (
        createdDate.toISOString().split("T")[0] >=
          startDate2.toISOString().split("T")[0] &&
        createdDate.toISOString().split("T")[0] <=
          endDate2.toISOString().split("T")[0]
      ) {
        generalsList.push(e);
      }
    });
    this.allNotifications.generals = generalsList;

   
    this.fillTable();
  }
  /*borrar(){
    this.selected="Todas";
    this.form.get('startDate')?.reset()
    this.form.get('endDate')?.reset()
    this.fillTable()
  }*/

  leida(notification: any) {
    // Marcar la notificación como leída
    notification.markedRead = true;
    // Actualizar la tabla o la lista de notificaciones
    //this.updatedList();
  }

  formatDateFromString(date : string) {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  }
}
