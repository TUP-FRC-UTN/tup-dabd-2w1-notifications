import { Component, OnInit } from '@angular/core';
import { NotificationRegisterService } from '../../service/notification-register.service';
import { Notifications } from '../../models/notifications';
import { Access } from '../../models/access';
import { Fine } from '../../models/fine';
import { Payments } from '../../models/payments';
import { General } from '../../models/general';
import $ from 'jquery';
import 'datatables.net'
import 'datatables.net-bs5';
import { style } from '@angular/animations';
import "datatables.net-select"
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-all-notification',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './all-notification.component.html',
  styleUrl: './all-notification.component.css'
})
export class AllNotificationComponent implements OnInit{

  ngOnInit(): void {
    this.llenarData();
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
        first: "<<",
        last: ">>",
        next: ">",
        previous: "<",
      },
      info:"Mostrando de _START_ a _END_ total de _TOTAL_ notificaciones",
    }

    });
  }

  constructor(private service: NotificationRegisterService) {}

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

  llenarData() {
    const getSubscription = this.service.getData().subscribe({
      next: (value:Notifications) =>{
        this.data = value
        this.originalAccessList = [...value.access]
        this.originalFinesList = [...value.fines]
        this.originalPaymentsList = [...value.payments]
        this.originalGeneralsList = [...value.generals]

        this.fillTable(); 
        console.log(value)
      },
      error: ()=> {
        alert('error al cargar las notifications')
      }
     })
  }

  fillTable() {
    let table = $("#myTable").DataTable();
    for (let notification of this.data.access) {
    const date = notification.date as { [key: string]: any }
    let dateString = date[0] + "-" + date[1] + "-" + date[2] + "  " + date[3] + ":" + date[4] + ":" + date[5]
      table.row.add([notification.subject, notification.description, dateString, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
    }
    for (let notification of this.data.fines) {
      const date = notification.date as { [key: string]: any }
      let dateString = date[0] + "-" + date[1] + "-" + date[2] + "  " + date[3] + ":" + date[4] + ":" + date[5]
      table.row.add([notification.subject, notification.description, dateString, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
    }
    for (let notification of this.data.payments) {
      const date = notification.date as { [key: string]: any }
      let dateString = date[0] + "-" + date[1] + "-" + date[2] + "  " + date[3] + ":" + date[4] + ":" + date[5]
      table.row.add([notification.subject, notification.description, dateString, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
    }
    for (let notification of this.data.generals) {
      const date = notification.date as { [key: string]: any }
      let dateString = date[0] + "-" + date[1] + "-" + date[2] + "  " + date[3] + ":" + date[4] + ":" + date[5]
      table.row.add([notification.subject, notification.description, dateString, notification.nombre + " " + notification.apellido, notification.dni]).draw(false);
    }
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
      head: [['Asunto', 'Descripción', 'Fecha', 'Nombre Destinatario', 'DNI']],
      body: filteredData.map((item: any) => [
        item[0] || 'N/A',
        item[1] || 'N/A',
        item[2] || 'N/A',
        item[3] || 'N/A',
        item[4] || 'N/A' 
      ]),
      startY: 30,
    });
  
    doc.save('notificaciones.pdf');
  }
  
  
}