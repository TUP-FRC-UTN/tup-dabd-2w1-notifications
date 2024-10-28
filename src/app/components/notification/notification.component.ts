import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Fine } from '../../models/fine';
import { Access } from '../../models/access';
import { Payments } from '../../models/payments';
import { General } from '../../models/general';
import { Notifications } from '../../models/notifications';
import { FineService } from '../../service/fine.service';
import { NotificationService } from '../../service/notification.service';
import { ActivatedRoute, RouterModule } from '@angular/router';


interface Notification {
  subject: string;
  description: string;
  date: string;
  user: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy{

  //Botones
  @Input() info: string = "";

  //Rol del usuario logeado
  rolactual:string = "";


  //Titulo de la pagina
  @Output() sendTitle = new EventEmitter<string>();


  //propiedades
  
  showModal = false; 
  showAlert = true; 
  userId:number = 1;
  originalAccessList: Access[] = []; 
  originalFinesList:Fine[] = []
  originalPaymentsList:Payments[] = []
  originalGeneralsList:General[]= []
  startDate: Date = new Date();
  endDate: Date= new Date();
  data2: Notifications = {
    fines: [],
    access: [],
    payments: [],
    generals: []
  };
  filteredAccessList: Access[] = [];
  isWithinRange: boolean | null = null;
  subscription:Subscription = new Subscription();
  selected:string = 'Accesos';
  
  //injecciones
  private readonly activatedRoute = inject(ActivatedRoute);

  constructor( private notificationService:NotificationService) {
  
  }
  


  //onInit t onDestroy

  ngOnInit(): void {
    if (this.data2 != null) {
      this.llenarData(this.userId);
    }
    console.log("data")
    console.log(this.data2)
    this.rolactual=this.activatedRoute.snapshot.params['rol'];
    console.log("rolactual="+this.rolactual)
    

    console.log(this.startDate)
    console.log(this.endDate)
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  //metodos

  selectNotification() { 
    this.showModal = true; 
  }

  closeModal() {
    this.showModal = false; 
  }

  closeAlert() {
    this.showAlert = false; 
  }


  llenarData(userId:number) {
    const getSubscription = this.notificationService.getData(userId).subscribe({
      next: (value:Notifications) =>{
        this.data2 = value
        this.originalAccessList = [...value.access]
        this.originalFinesList = [...value.fines]
        this.originalPaymentsList = [...value.payments]
        this.originalGeneralsList = [...value.generals]
        console.log("api")
        console.log(value)
      },
      error: ()=> {
        alert('error al cargar las notifications')
      }
    })
    this.subscription.add(getSubscription);
  }


  cambiar(value:string){
    switch (value){
      case 'Multas':
        this.selected = 'Multas'
        
        break;

      case 'Accesos':
        this.selected = 'Accesos'
        break;

      case 'Pagos':
        this.selected = 'Pagos'
        break;
      case 'Generales':
        this.selected = 'Generales'
        break;
    }
    
  }

  updatedList(){

    let accessList:Access[] = []
    this.data2.access = this.originalAccessList
    this.data2.access.forEach(e => {
      const createdDate = new Date(e.created_datetime);
      const startDate2 = new Date(this.startDate)
      const endDate2 = new Date(this.endDate)
      console.log(createdDate)
      console.log(startDate2)
      console.log(endDate2)
      

      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        accessList.push(e)
      }
    
    });
    this.data2.access=accessList

    let finesList:Fine[] = []
    this.data2.fines = this.originalFinesList
    this.data2.fines.forEach(e => {
      const createdDate = new Date(e.date);
      const startDate2 = new Date(this.startDate)
      const endDate2 = new Date(this.endDate)
      

      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        finesList.push(e)
      }
    
    });
    this.data2.fines=finesList


    let paymentsList:Payments[] = []
    this.data2.payments = this.originalPaymentsList
    this.data2.payments.forEach(e => {
      const createdDate = new Date(e.date);
      const startDate2 = new Date(this.startDate)
      const endDate2 = new Date(this.endDate)
      

      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        paymentsList.push(e)
      }
    
    });
    this.data2.payments=paymentsList





    let generalsList:General[] = []
    this.data2.generals = this.originalGeneralsList
    this.data2.generals.forEach(e => {
      const createdDate = new Date(e.created_datetime);
      const startDate2 = new Date(this.startDate)
      const endDate2 = new Date(this.endDate)
      

      if(createdDate.toISOString().split('T')[0] >= startDate2.toISOString().split('T')[0] && createdDate.toISOString().split('T')[0] <= endDate2.toISOString().split('T')[0] ){
        generalsList.push(e)
      }
    
    });
    this.data2.generals=generalsList

  }

}