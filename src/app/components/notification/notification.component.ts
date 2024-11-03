import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Fine } from '../../models/fine';
import { Access } from '../../models/access';
import { Payments } from '../../models/payments';
import { General } from '../../models/general';
import { Notifications } from '../../models/notifications';
import { NotificationService } from '../../service/notification.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DateValidator } from '../../validators/date.validators';
import { MockUserService } from '../../service/mockUser.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';


interface Notification {
  subject: string;
  description: string;
  date: string;
  user: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule,RouterModule,ReactiveFormsModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  userId = 1;
  rolactual:string = "";
  selected:string="Todas"
  originalAccessList: Access[] = []; 
  originalFinesList:Fine[] = []
  originalPaymentsList:Payments[] = []
  originalGeneralsList:General[]= []
  data: Notifications = {
    fines: [],
    access: [],
    payments: [],
    generals: []
  };
  form = new FormGroup({
    startDate: new FormControl(new Date(), [Validators.required]),
    endDate: new FormControl(new Date(), [Validators.required])
  });

  constructor(private service: NotificationService, private serviceUser: MockUserService) {}

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => this.updatedList());
    this.llenarData(this.userId);
    console.log(this.data)
    $('#myTable').DataTable({
      select: { style: 'multi' },
      paging: true,
      searching: true,
      ordering: true,
      pageLength: 10,
      language: { emptyTable: "Cargando...", search: "Buscar" }
    });

    $('#myTable tbody').on('click', 'tr', (event) => {
      const data = $('#myTable').DataTable().row(event.currentTarget).data();
      this.onRowClick(data);
    });
  }

  onRowClick(data: any) {
    console.log('Fila clicada:', data);

  }

  cambiar(type: string) {
    this.selected = type;
    this.fillTable();
  }

  llenarData(userId: number) {
    const getSubscription = this.service.getData(userId).subscribe({
      next: (value:Notifications) =>{
        this.data = value
        this.originalAccessList = [...value.access]
        this.originalFinesList = [...value.fines]
        this.originalPaymentsList = [...value.payments]
        this.originalGeneralsList = [...value.generals]
        console.log(this.data)
        this.fillTable(); 
      },
      error: ()=> {
        alert('error al cargar las notifications')
      }
    })
  }

  fillTable() {
    const table = $('#myTable').DataTable();
    table.clear().draw();

    const addRow = (notification: any) => {
      const dateString = notification.date ?? notification.created_datetime;
      table.row.add([notification.subject, notification.description, dateString, "Ver"]).draw(false);
    };

    if (this.selected === 'Todas' || this.selected === 'Accesos') this.data.access.forEach(addRow);
    if (this.selected === 'Todas' || this.selected === 'Multas') this.data.fines.forEach(addRow);
    if (this.selected === 'Todas' || this.selected === 'Pagos') this.data.payments.forEach(addRow);
    if (this.selected === 'Todas' || this.selected === 'Generales') this.data.generals.forEach(addRow);
  }

  updatedList() {
    const filterByDate = (list: any[]) => {
      const startDate = new Date(this.form.get('startDate')?.value ?? new Date());
      const endDate = new Date(this.form.get('endDate')?.value ?? new Date());
      return list.filter(item => {
        const createdDate = new Date(item.date);
        return createdDate >= startDate && createdDate <= endDate;
      });
    };

    this.data.access = filterByDate(this.data.access);
    this.data.fines = filterByDate(this.data.fines);
    this.data.payments = filterByDate(this.data.payments);
    this.data.generals = filterByDate(this.data.generals);
    this.fillTable();
  }

  exportarAExcel() {
    const tabla = $('#myTable').DataTable();
    const filteredData = tabla.rows({ search: 'applied' }).data().toArray();
    
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workBook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workBook, worksheet, 'Notificaciones');
    XLSX.writeFile(workBook, 'notificaciones.xlsx');
  }

  exportarAPDF() {
  const tabla = $('#myTable').DataTable();
  const filteredData = tabla.rows({ search: 'applied' }).data().toArray();

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Reporte de Notificaciones', 14, 22);

  autoTable(doc, {
    head: [['Asunto', 'Descripción', 'Fecha']],
    body: filteredData.map((item: any) => [
      item[0] || 'N/A',
      item[1] || 'N/A',
      item[2] || 'N/A'
    ]),
    startY: 30,
  });

  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

  doc.save(`notificaciones_${formattedDate}.pdf`);
}

  borrar() {
    this.selected="Todas";
    this.form.get('startDate')?.reset()
    this.form.get('endDate')?.reset()
    this.fillTable()
  }

}