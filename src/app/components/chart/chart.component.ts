
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleChartsModule, ChartType } from 'angular-google-charts';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [GoogleChartsModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent {
  columnChartType: ChartType = ChartType.ColumnChart;
  c2ChartType: ChartType = ChartType.Gauge;
  c3ChartType: ChartType = ChartType.PieChart;
  cChartType: ChartType = ChartType.AreaChart;
  form: FormGroup;
  status: number = 0;

  constructor() {
    this.form = new FormGroup({
      startDate: new FormControl(new Date()),
      endDate: new FormControl(new Date()),
    });
  }

  // Data and options for "Notificaciones Enviadas por Día"
  columnChartData = [
    ['Lunes', 45],
    ['Martes', 30],
    ['Miércoles', 55],
    ['Jueves', 40],
    ['Viernes', 50]
  ];
  columnChartOptions = {
    title: 'Notificaciones Enviadas por Día',
    hAxis: { title: 'Días' },
    vAxis: { title: 'Cantidad de Notificaciones Enviadas' },
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '70%' },
    colors: ['#4285F4']
  };

  // Data and options for "Notificaciones Enviadas por Canal"
  columnChartData2 = [
    ['Email', 23],
    ['Telegram', 34],
    ['Web', 19]
  ];
  columnChartOptions2 = {
    title: 'Notificaciones Enviadas por Canal',
    hAxis: { title: 'Canal' },
    vAxis: { title: 'Cantidad de Notificaciones' },
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '70%' },
    colors: ['#34A853']
  };

  // Data and options for "Notificaciones Enviadas por Día y Tipo de Canal"
  columnChartData3 = [
    ['Lunes', 7, 11, 5],
    ['Martes', 20, 8, 10],
    ['Miércoles', 30, 22, 26],
    ['Jueves', 25, 12, 3],
    ['Viernes', 10, 2, 7]
  ];
  columnChartOptions3 = {
    title: 'Notificaciones Enviadas por Día y Tipo de Canal',
    hAxis: { title: 'Días' },
    vAxis: { title: 'Cantidad de Notificaciones' },
    legend: { position: 'top' },
    chartArea: { width: '80%', height: '70%' },
    colors: ['#4285F4', '#34A853', '#FBBC05']
  };

  makeBig(status: number) {
    this.status = status;
  }
}