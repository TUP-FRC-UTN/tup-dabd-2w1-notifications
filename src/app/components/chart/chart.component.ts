import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';
import { NotificationRegisterService } from '../../service/notification-register.service';
import { AllNotifications } from '../../models/all-notifications';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [GoogleChartsModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  columnChartType: ChartType = ChartType.ColumnChart;
  c2ChartType: ChartType = ChartType.Gauge;
  c3ChartType: ChartType = ChartType.PieChart;
  cChartType: ChartType = ChartType.AreaChart;
  form: FormGroup;
  status: number = 0;
  columnChartData: any[] = []; 
  columnChartData2: any[] = [];
  columnChartData3: any[] = [];

  constructor(private chartDataService: NotificationRegisterService) {
    this.form = new FormGroup({
      startDate: new FormControl(new Date()),
      endDate: new FormControl(new Date()),
    });
  }

  columnChartOptions = {
    title: 'Notificaciones Enviadas por Día',
    hAxis: { title: 'Días' },
    vAxis: { title: 'Cantidad de Notificaciones Enviadas' },
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '70%' },
    colors: ['#4285F4']
  };

  columnChartOptions2 = {
    title: 'Notificaciones Enviadas por Tipo (Access, Payment, Fine)',
    hAxis: { title: 'Tipo de Notificación' },
    vAxis: { title: 'Cantidad de Notificaciones' },
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '70%' },
    colors: ['#34A853']
  };

  columnChartOptions3 = {
    title: 'Notificaciones Enviadas por Día y Tipo de Notificación',
    hAxis: { title: 'Días' },
    vAxis: { title: 'Cantidad de Notificaciones' },
    legend: { position: 'top' },
    chartArea: { width: '80%', height: '70%' },
    colors: ['#4285F4', '#34A853', '#FBBC05']
  };

  ngOnInit(): void {
    this.loadChartData()
  }

  loadChartData(): void {
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const getDayOfWeek = (date: Date) => daysOfWeek[date.getDay() - 1]; // Ajuste del día de la semana (domingo es 0)
  
    this.chartDataService.getData().subscribe(
      (data: AllNotifications) => {
        console.log('Chart Data:', data);
  
        // Inicializamos las variables para cada día de la semana
        const notificationsPerDay: { [key: string]: number } = {
          'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0
        };
  
        // Contamos las notificaciones por tipo
        data.access.forEach(a => {
          const dayOfWeek = getDayOfWeek(new Date(a.created_datetime));
          notificationsPerDay[dayOfWeek] += 1;
        });
  
        data.payments.forEach(p => {
          const dayOfWeek = getDayOfWeek(new Date(p.dateFrom));
          notificationsPerDay[dayOfWeek] += 1;
        });
  
        data.fines.forEach(f => {
          const dayOfWeek = getDayOfWeek(new Date(f.created_datetime));
          notificationsPerDay[dayOfWeek] += 1;
        });
  
        // Actualizamos el columnChartData sumando todas las notificaciones por día
        this.columnChartData = daysOfWeek.map(day => [day, notificationsPerDay[day]]);
  
        // Datos para el segundo gráfico: Notificaciones por Tipo (Access, Payment, Fine)
        this.columnChartData2 = [
          ['Access', data.access.length],
          ['Payment', data.payments.length],
          ['Fine', data.fines.length]
        ];
  
        // Datos para el tercer gráfico: Notificaciones por Día y Tipo de Notificación
        this.columnChartData3 = daysOfWeek.map(day => [
          day,
          data.access.filter(a => getDayOfWeek(new Date(a.created_datetime)) === day).length,
          data.payments.filter(p => getDayOfWeek(new Date(p.dateFrom)) === day).length,
          data.fines.filter(f => getDayOfWeek(new Date(f.created_datetime)) === day).length
        ]);
      },
      (error) => {
        console.error('Error al cargar los datos del gráfico:', error);
      }
    );
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  makeBig(status: number) {
    this.status = status;
  }
}