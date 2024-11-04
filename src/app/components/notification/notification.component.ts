import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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


@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule,RouterModule,ReactiveFormsModule,DatePipe],
  providers: [DatePipe],
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
  form: FormGroup;

  constructor(private service: NotificationService, private serviceUser: MockUserService,private datePipe: DatePipe,private activatedRoute:ActivatedRoute) {
    this.form = new FormGroup({
      startDate: new FormControl(new Date(), [Validators.required]),
      endDate: new FormControl( new Date(), [Validators.required])
    });
  
  }

  ngOnInit(): void {
    
    this.llenarData(this.userId);
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

    this.initialzeDates()
    this.form.valueChanges.subscribe(() => this.updatedList());
    this.rolactual=this.activatedRoute.snapshot.params['rol'];
    console.log(this.rolactual)
    

    
    

    
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
        this.updatedList()
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
      table.row.add([notification.subject, notification.message, notification.created_datetime, "Ver"]).draw(false);
    };

    if (this.selected === 'Todas' || this.selected === 'Accesos') this.data.access.forEach(addRow);
    if (this.selected === 'Todas' || this.selected === 'Multas') this.data.fines.forEach(addRow);
    if (this.selected === 'Todas' || this.selected === 'Pagos') this.data.payments.forEach(addRow);
    if (this.selected === 'Todas' || this.selected === 'Generales') this.data.generals.forEach(addRow);
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
    this.initialzeDates()
    this.fillTable()
  }
  formatDate(date:Date):string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || ''
  }

  initialzeDates(){
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth()-1,today.getDay());
    const endDate = today;

    this.form.patchValue({
      startDate: this.formatDate2(startDate) ,
      endDate: this.formatDate2(endDate) 
    })
  }
  formatDate2(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes debe ser 1-12
    const day = date.getDate().toString().padStart(2, '0'); // Día debe ser 1-31
    return `${year}-${month}-${day}`; // Retornar en formato yyyy-MM-dd
  }
  updatedList(){

    let accessList:Access[] = []
    this.data.access = this.originalAccessList
    this.data.access.forEach(e => {
      console.log(e.created_datetime)
      const apiDate = new Date(e.created_datetime)
      console.log(apiDate)  
      const createdDate = new Date(
        apiDate.getFullYear(),
        apiDate.getMonth(),
        apiDate.getDate(),
        apiDate.getHours(),
        apiDate.getMinutes(),
        apiDate.getSeconds()
      )
      const startDate2 = new Date(this.form.get('startDate')?.value ?? new Date())
      const endDate2 = new Date(this.form.get('endDate')?.value ?? new Date())
      console.log(createdDate)
      console.log(startDate2)
      console.log(endDate2)

      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        accessList.push(e)
      }
    
    });
    this.data.access=accessList

    let finesList:Fine[] = []
    this.data.fines = this.originalFinesList
    this.data.fines.forEach(e => {
      const createdDate = new Date(e.created_datetime)
      const startDate2 = new Date(this.form.get('startDate')?.value ?? new Date() )
      const endDate2 = new Date(this.form.get('endDate')?.value ?? new Date())
      

      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        finesList.push(e)
      }
    
    });
    this.data.fines=finesList


    let paymentsList:Payments[] = []
    this.data.payments = this.originalPaymentsList
    this.data.payments.forEach(e => {
      const createdDate = new Date(e.created_datetime)
      const startDate2 = new Date(this.form.get('startDate')?.value ?? new Date() )
      const endDate2 = new Date(this.form.get('endDate')?.value ?? new Date())
      

      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        paymentsList.push(e)
      }
    
    });
    this.data.payments=paymentsList
    

    let generalsList:General[] = []
    this.data.generals = this.originalGeneralsList
    this.data.generals.forEach(e => {
      const createdDate = new Date(e.created_datetime)
      const startDate2 = new Date(this.form.get('startDate')?.value ?? new Date() )
      const endDate2 = new Date(this.form.get('endDate')?.value ?? new Date())
      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        generalsList.push(e)
      }
    
    });
    this.data.generals=generalsList

    this.fillTable();
    console.log(this.data)
  }
  /*borrar(){
    this.selected="Todas";
    this.form.get('startDate')?.reset()
    this.form.get('endDate')?.reset()
    this.fillTable()
  }*/
}

