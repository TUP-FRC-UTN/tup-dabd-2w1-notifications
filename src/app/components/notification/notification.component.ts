import {
  Component,
  OnInit,
} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import {
  FormControl,
  FormGroup,
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
import { AllNotificationComponent } from "../all-notification/all-notification.component";

@Component({
  selector: "app-notification",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DatePipe],
  providers: [DatePipe],
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.css"],
})
export class NotificationComponent implements OnInit {
  userId = 1;
  rolactual: string = "";
  selected: string = "Todas";
  originalAccessList: Access[] = [];
  originalFinesList: Fine[] = [];
  originalPaymentsList: Payments[] = [];
  originalGeneralsList: General[] = [];
  selectedNotification: any = null;
  data: Notifications = {
    fines: [],
    access: [],
    payments: [],
    generals: [],
  };
  form: FormGroup;

  constructor(
    private service: NotificationService,
    private serviceUser: MockUserService,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute
  ) {
    this.form = new FormGroup({
      startDate: new FormControl(new Date(), [Validators.required]),
      endDate: new FormControl(new Date(), [Validators.required]),
      all: new FormControl(true),
      fines: new FormControl(false),
      access: new FormControl(false),
      payments: new FormControl(false),
      generals: new FormControl(false),
    });
  }

  ngOnInit(): void {
    this.llenarData(this.userId);
    
    // Configure DataTables with search functionality
    $("#myTable").DataTable({
      columnDefs: [
        {targets:0,
          className: "text-center"
        },
        {targets: 1,
          className: "text-center"
        },
        {
          targets: 2,  // Índice de la columna "Fecha"
          className: 'text-center', // Añadir clase para centrar
        },
        {
          targets: 3,  // Índice de la columna "Fecha"
          className: 'text-center align-middle'
           // Añadir clase para centrar
        },
        {targets: 4, className: "text-center"}
      ],
      dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>',
      select: { style: "multi" },
      paging: true,
      searching: true,
      ordering: true,
      order: [[2, "desc"]],
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

    // Handle row click for modal
    // $("#myTable tbody").on("click", ".consultar-btn", (event) => {
    //   event.preventDefault();
    //   const row = $(event.currentTarget).closest('tr');
    //   const data = $("#myTable").DataTable().row(row).data();
      
    // });

    this.initialzeDates();
    this.form.valueChanges.subscribe(() => { 
      this.updatedList()
      this.cambiar()
    });
    this.rolactual = this.activatedRoute.snapshot.params["rol"];
  }

  showDetailsModal(data: any) {
    this.selectedNotification = {
      subject: data[1],
      message: data[2],
      date: data[3]
    };
    // const modal = document.getElementById('detailsModal');
    // if (modal) {
    //     // @ts-ignore
    //     const bootstrapModal = new bootstrap.Modal(modal);
    //     bootstrapModal.show();
    // }

}

  onRowClick(data: any) {
    console.log("Fila clicada:", data);
  }

  cambiar() {
    this.fillTable();
  }

  llenarData(userId: number) {
    const getSubscription = this.service.getData(userId).subscribe({
      next: (value: Notifications) => {
        this.data = value;
        this.originalAccessList = [...value.access];
        this.originalFinesList = [...value.fines];
        this.originalPaymentsList = [...value.payments];
        this.originalGeneralsList = [...value.generals];  
        this.updatedList();
        this.fillTable();
      },
      error: () => {
        alert("error al cargar las notifications");
      },
    });
  }

  
  fillTable() {
    const table = $("#myTable").DataTable();
    table.clear().draw();

    const addRow = (notification: any, tipo: string) => {
      table.row
        .add([
          tipo,
          notification.subject,
          notification.message,
          this.getTodayDateFormatted(notification.created_datetime),
          `
              
                <a class="btn btn-light align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"
                 style="width:40px; height:40px; font-size:1.2rem; padding-top:0.2rem;">
                &#8942;
              </a>
              
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item consultar-btn" href="#" data-bs-toggle="modal"
                    data-bs-target="#idMODAL">Ver más</a></li>
                    
                  </ul>

          `,
        ])
        .draw(false);
    };
    



    if (this.form.get('all')?.value === true || this.form.get('access')?.value === true )
      this.data.access.forEach(notification => addRow(notification, 'Accesos'));
    if (this.form.get('all')?.value === true || this.form.get('fines')?.value === true)
      this.data.fines.forEach(notification => addRow(notification, 'Multas'));
    if (this.form.get('all')?.value === true || this.form.get('payments')?.value === true)
      this.data.payments.forEach(notification => addRow(notification, 'Pagos'));
    if (this.form.get('all')?.value === true  || this.form.get('generals')?.value === true)
      this.data.generals.forEach(notification => addRow(notification, 'Generales'));

  }

  // updatedList() {
  //     this.data.access=this.originalAccessList
  //     this.data.fines=this.originalFinesList
  //     this.data.payments=this.originalPaymentsList
  //     this.data.generals=this.originalGeneralsList
  //     console.log(this.data);

  //   const filterByDate = (list: any[]) => {
  //     const startDate = new Date(this.form.get('startDate')?.value ?? new Date());
  //     const endDate = new Date(this.form.get('endDate')?.value ?? new Date());
  //     console.log(startDate)
  //     console.log(endDate)
  //     console.log('caca')

  //     const normalizedStartDate = this.normalizeDate(startDate);
  //     const normalizedEndDate = this.normalizeDate(endDate);
  //     return list.filter(item => {
  //       const createdDate = new Date(item.created_datetime);
  //       const normalizedCreatedDate = this.normalizeDate(createdDate);
  //       return normalizedCreatedDate >= normalizedStartDate && normalizedCreatedDate <= normalizedEndDate;
  //     });
  //   };

  //   this.data.access = filterByDate(this.data.access);
  //   this.data.fines = filterByDate(this.data.fines);
  //   this.data.payments = filterByDate(this.data.payments);
  //   this.data.generals = filterByDate(this.data.generals);
  //   this.fillTable();
  // }

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
    const dateFrom = this.formatDateFromString(this.form.controls["startDate"].value)
    const dateTo = this.formatDateFromString(this.form.controls["endDate"].value)

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
    this.fillTable();
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

    this.form.patchValue({
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
  updatedList() {
    let accessList: Access[] = [];
    this.data.access = this.originalAccessList;
    this.data.access.forEach((e) => {
      
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
        this.form.get("startDate")?.value ?? new Date()
      );
      const endDate2 = new Date(this.form.get("endDate")?.value ?? new Date());
      


      if (
        createdDate.toISOString().split("T")[0] >=
          startDate2.toISOString().split("T")[0] &&
        createdDate.toISOString().split("T")[0] <=
          endDate2.toISOString().split("T")[0]
      ) {
        accessList.push(e);
      }
    });
    this.data.access = accessList;

    let finesList: Fine[] = [];
    this.data.fines = this.originalFinesList;
    this.data.fines.forEach((e) => {
      const createdDate = new Date(e.created_datetime);
      const startDate2 = new Date(
        this.form.get("startDate")?.value ?? new Date()
      );
      const endDate2 = new Date(this.form.get("endDate")?.value ?? new Date());

      if (
        createdDate.toISOString().split("T")[0] >=
          startDate2.toISOString().split("T")[0] &&
        createdDate.toISOString().split("T")[0] <=
          endDate2.toISOString().split("T")[0]
      ) {
        finesList.push(e);
      }
    });
    this.data.fines = finesList;

    let paymentsList: Payments[] = [];
    this.data.payments = this.originalPaymentsList;
    this.data.payments.forEach((e) => {
      const createdDate = new Date(e.created_datetime);
      const startDate2 = new Date(
        this.form.get("startDate")?.value ?? new Date()
      );
      const endDate2 = new Date(this.form.get("endDate")?.value ?? new Date());

      if (
        createdDate.toISOString().split("T")[0] >=
          startDate2.toISOString().split("T")[0] &&
        createdDate.toISOString().split("T")[0] <=
          endDate2.toISOString().split("T")[0]
      ) {
        paymentsList.push(e);
      }
    });
    this.data.payments = paymentsList;

    let generalsList: General[] = [];
    this.data.generals = this.originalGeneralsList;
    this.data.generals.forEach((e) => {
      const createdDate = new Date(e.created_datetime);
      const startDate2 = new Date(
        this.form.get("startDate")?.value ?? new Date()
      );
      const endDate2 = new Date(this.form.get("endDate")?.value ?? new Date());
      if (
        createdDate.toISOString().split("T")[0] >=
          startDate2.toISOString().split("T")[0] &&
        createdDate.toISOString().split("T")[0] <=
          endDate2.toISOString().split("T")[0]
      ) {
        generalsList.push(e);
      }
    });
    this.data.generals = generalsList;

    this.fillTable();
    console.log(this.data);
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
    this.updatedList();
  }

  formatDateFromString(date : string) {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  }
}
