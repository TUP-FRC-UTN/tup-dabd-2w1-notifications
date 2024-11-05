import { Component, OnInit } from "@angular/core";
import { NotificationRegisterService } from "../../service/notification-register.service";
import { Notifications } from "../../models/notifications";
import { Access } from "../../models/access";
import { Fine } from "../../models/fine";
import { Payments } from "../../models/payments";
import { General } from "../../models/general";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
import "datatables.net-select";
import { DatePipe } from "@angular/common";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RouterModule } from "@angular/router";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DateValidator } from "../../validators/date.validators";
import { MockUserService } from "../../service/mockUser.service";
import { AllNotifications } from "../../models/all-notifications";
import { Inventory } from "../../models/inventory";

@Component({
  selector: "app-all-notification",
  standalone: true,
  imports: [DatePipe, RouterModule, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: "./all-notification.component.html",
  styleUrl: "./all-notification.component.css",
})
export class AllNotificationComponent implements OnInit {
  //propiedades
  selected: string = "Todas";
  originalAccessList: Access[] = [];
  originalFinesList: Fine[] = [];
  originalPaymentsList: Payments[] = [];
  originalGeneralsList: General[] = [];
  originalInventoryList: Inventory[] = [];
  form: FormGroup;
  table: any;
  data: AllNotifications = {
    fines: [],
    access: [],
    payments: [],
    generals: [],
    inventories: [],
  };

  //onInit y onDestroy
  ngOnInit(): void {
    this.form.get("startDate")?.valueChanges.subscribe((value) => {
      this.updatedList();
    });
    this.form.get("endDate")?.valueChanges.subscribe((value) => {
      this.updatedList();
    });
    this.initialzeDates();
    this.llenarData();

    this.table = $("#myTable").DataTable({
      dom: '<"mb-3"t>' + '<"d-flex justify-content-between"lp>',

      select: {
        style: "multi",
      },
      paging: true,
      searching: true,
      ordering: true,
      lengthChange: true,
      pageLength: 10,
      order: [[2, "desc"]],
      language: {
        emptyTable: "Cargando...",
        search: "Buscar",
        loadingRecords: "Cargando...",
        zeroRecords: "No se han encontrado registros",
        lengthMenu: "_MENU_",
        info: " ",
      },
    });

    // Connect external search input to DataTables
    $("#searchTerm").on("keyup", function () {
      $("#myTable")
        .DataTable()
        .search($(this).val() as string)
        .draw();
    });
  }
  //injecciones
  constructor(
    private service: NotificationRegisterService,
    private serviceUser: MockUserService,
    private datePipe: DatePipe
  ) {
    this.form = new FormGroup({
      startDate: new FormControl(new Date(), [
        Validators.required,
        DateValidator.greatherThanToday,
      ]),
      endDate: new FormControl(new Date(), [
        Validators.required,
        DateValidator.greatherThanToday,
      ]),
    });
  }

  //metodos
  llenarData() {
    const getSubscription = this.service.getData().subscribe({
      next: (value: AllNotifications) => {
        this.data = value;
        this.originalAccessList = [...value.access];
        this.originalFinesList = [...value.fines];
        this.originalPaymentsList = [...value.payments];
        this.originalGeneralsList = [...value.generals];
        this.originalInventoryList = [...value.inventories];
        console.log(this.data);
        this.updatedList();
        this.fillTable();
      },
      error: () => {
        alert("error al cargar las notifications");
      },
    });
  }
  formatDate(date: Date): string {
    return this.datePipe.transform(date, "dd/MM/yyyy hh:mm:ss") || "";
  }

  fillTable() {
    this.table.clear().draw();
    if (this.data.access.length > 0) {
        for (let notification of this.data.access) {
          const date = notification.created_datetime as { [key: string]: any };
          let dateString = this.formatDate(notification.created_datetime);
          this.table.row
            .add([
              "Acceso",
              notification.subject,
              notification.message,
              dateString,
              notification.nombre + " " + notification.apellido,
              notification.dni,
            ])
            .draw(false);
      }
    }
    if (this.data.fines.length > 0) {
        for (let notification of this.data.fines) {
          const date = notification.created_datetime as { [key: string]: any };
          let dateString = this.formatDate(notification.created_datetime);
          this.table.row
            .add([
              "Multa",
              notification.subject,
              notification.message,
              dateString,
              notification.nombre + " " + notification.apellido,
              notification.dni,
            ])
            .draw(false);
      }
    }

    if (this.data.payments.length > 0) {
        for (let notification of this.data.payments) {
          const date = notification.created_datetime as { [key: string]: any };
          let dateString = this.formatDate(notification.created_datetime);
          this.table.row
            .add([
              "Pago",
              notification.subject,
              notification.message,
              dateString,
              notification.nombre + " " + notification.apellido,
              notification.dni,
            ])
            .draw(false);
        
      }
    }
    if (this.data.generals.length > 0) {
        for (let notification of this.data.generals) {
          const date = notification.created_datetime as { [key: string]: any };
          let dateString = this.formatDate(notification.created_datetime);
          this.table.row
            .add([
              "General",
              notification.subject,
              notification.message,
              dateString,
              notification.nombre + " " + notification.apellido,
              notification.dni,
            ])
            .draw(false);
      }
    }
    if (this.data.inventories.length > 0) {
        for (let notification of this.data.inventories) {
          const date = notification.created_datetime as { [key: string]: any };
          let dateString = this.formatDate(notification.created_datetime);
          this.table.row
            .add([
              "Inventario",
              notification.subject,
              notification.message,
              dateString,
              "",
              "",
            ])
            .draw(false);
      }
    }
  }

  exportarAExcel() {
    const tabla = this.table;
    const filteredData = tabla.rows({ search: "applied" }).data().toArray();

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workBook, worksheet, "Notificaciones");
    XLSX.writeFile(workBook, "notificaciones "+this.formatDate(new Date())+".xlsx");
  }

  exportarAPDF() {
    const tabla = this.table;
    const filteredData = tabla.rows({ search: "applied" }).data().toArray();

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de Notificaciones", 14, 22);

    autoTable(doc, {
      head: [["Asunto", "Descripción", "Fecha", "Nombre Destinatario", "DNI"]],
      body: filteredData.map((item: any) => [
        item[0] || "N/A",
        item[1] || "N/A",
        item[2] || "N/A",
        item[3] || "N/A",
        item[4] || "N/A",
      ]),
      startY: 30,
    });

    doc.save("notificaciones.pdf");
  }

  //filtro de tipo de notificacion
  cambiar(value: string) {
    switch (value) {
      case "Todas":
        this.selected = "Todas";
        this.fillTable();
        break;

      case "Multas":
        this.selected = "Multas";
        this.fillTable();
        break;

      case "Accesos":
        this.selected = "Accesos";
        this.fillTable();
        break;

      case "Pagos":
        this.selected = "Pagos";
        this.fillTable();
        break;

      case "Generales":
        this.selected = "Generales";
        this.fillTable();
        break;

      case "Inventory":
        this.selected = "Inventory";
        this.fillTable();
        break;
    }
  }
  //filtro por fechas
  updatedList() {
    let accessList: Access[] = [];
    this.data.access = this.originalAccessList;
    this.data.access.forEach((e) => {
      console.log(e.created_datetime);
      const apiDate = new Date(e.created_datetime);
      console.log(apiDate);
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
      console.log(createdDate);
      console.log(startDate2);
      console.log(endDate2);

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

    let InventoryList: Inventory[] = [];
    this.data.inventories = this.originalInventoryList;
    this.data.inventories.forEach((e) => {
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
        InventoryList.push(e);
      }
    });
    this.data.inventories = InventoryList;

    this.fillTable();
    console.log(this.data);
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
      startDate: this.formatDate2(startDate),
      endDate: this.formatDate2(endDate),
    });
  }
  formatDate2(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mes debe ser 1-12
    const day = date.getDate().toString().padStart(2, "0"); // Día debe ser 1-31
    return `${year}-${month}-${day}`; // Retornar en formato yyyy-MM-dd
  }
  borrar() {
    this.selected = "Todas";
    this.initialzeDates();
    this.fillTable();
  }
}
