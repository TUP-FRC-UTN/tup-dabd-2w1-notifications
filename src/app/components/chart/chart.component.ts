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
  maxNotificationsDay: string = '';
  maxNotificationsType: string = '';
  maxNotificationsCount: number = 0;
  maxNotificationsTypeCount: number = 0;
  maxNotificationsHour: string = '';
  maxNotificationsHourCount: number = 0;
  maxNotificationsMonth: string = '';
  maxNotificationsMonthCount: number = 0;
  maxNotificationsRead: number = 0;
  maxNotificationsUnread: number = 0;
  columnChartType: ChartType = ChartType.ColumnChart;
  c2ChartType: ChartType = ChartType.Gauge;
  c3ChartType: ChartType = ChartType.PieChart;
  cChartType: ChartType = ChartType.BarChart;
  c4ChartType: ChartType = ChartType.ScatterChart;
  form: FormGroup;
  status: number = 0;
  columnChartData: any[] = []; 
  columnChartData2: any[] = [];
  columnChartData3: any[] = [];
  columnChartData4: any[] = [];
  columnChartData5: any[] = [];
  columnChartData6: any[] = [];
  columnChartData7: any[] = [];
  columnChartData8: any[] = [];

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
    title: 'Notificaciones Enviadas por Tipo (Access, Payment, Fine, Inventory)',
    hAxis: { title: 'Tipo de Notificación' },
    vAxis: { title: 'Cantidad de Notificaciones' },
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '70%' },
    colors: ['purple']
  };

  columnChartOptions3 = {
    title: 'Notificaciones Enviadas por Día y Tipo de Notificación',
    hAxis: { title: 'Días' },
    vAxis: { title: 'Cantidad de Notificaciones' },
    legend: { position: 'top' },
    chartArea: { width: '80%', height: '70%' },
    colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
  };

  columnChartOptions4 = {
    title: 'Notificaciones Enviadas por Hora del Día',
    hAxis: { title: 'Horas' },
    vAxis: { title: 'Cantidad de Notificaciones' },
    legend: { position: 'bottom' },
    chartArea: { width: '80%', height: '70%' },
    colors: ['blue']
  };

  columnChartOptions5 = {
    title: 'Notificaciones Leidas y No Leidas por Semana',
    legend: { position: 'right' },
    chartArea: { width: '80%', height: '80%' },
    pieHole: 0.4, //Esto es un semi-donut del pie
    colors: ['green', 'red']
  };

  columnChartOptions6 = {
    title: 'Notificaciones por Mes y Tipo',
    hAxis: { title: 'Meses' },
    vAxis: { title: 'Cantidad de Notificaciones' },
    legend: { position: 'top' },
    isStacked: true,
    chartArea: { width: '80%', height: '70%' },
    colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
  };

  ngOnInit(): void {
    this.loadChartData();
    this.loadKpiData();
  }

  loadKpiData(): void {
    this.chartDataService.getData().subscribe((data: AllNotifications) => {
      const allNotifications = this.flattenNotifications(data);
      const groupedByDay = this.groupByDay(allNotifications);
      const maxDay = this.findMaxNotificationsDay(groupedByDay);
      const groupedByType = this.groupByType(allNotifications);
      const maxType = this.findMaxNotificationsType(groupedByType);
      const groupedByHour = this.groupByHour(allNotifications); 
      const maxHour = this.findMaxNotificationsHour(groupedByHour); 
      const groupedByMonth = this.groupByMonth(allNotifications);
      const maxMonth = this.findMaxNotificationsMonth(groupedByMonth); 
      const groupedByReadStatus = this.groupByReadStatus(allNotifications);
      const readNotificationsRate = this.getReadNotificationsRate(groupedByReadStatus);
      this.maxNotificationsRead = parseFloat(readNotificationsRate.toFixed(2));
      this.maxNotificationsUnread = parseFloat((100 - readNotificationsRate).toFixed(2));

      this.maxNotificationsDay = maxDay.day;
      this.maxNotificationsCount = maxDay.count;
      this.maxNotificationsType = maxType.type;
      this.maxNotificationsTypeCount = maxType.count;
      this.maxNotificationsHour = maxHour.hour;
      this.maxNotificationsHourCount = maxHour.count;
      this.maxNotificationsMonth = maxMonth.month;
      this.maxNotificationsMonthCount = maxMonth.count;
    });
  }

  flattenNotifications(data: AllNotifications): { type: string; date: string; read: boolean; }[] {
    const all = [
      ...data.fines.map(x => ({ type: 'Fine', date: x.created_datetime.toString(), read: x.markedRead || false })),
      ...data.access.map(x => ({ type: 'Access', date: x.created_datetime.toString(), read: x.markedRead || false })),
      ...data.payments.map(x => ({ type: 'Payment', date: x.created_datetime.toString(), read: x.markedRead || false })),
      ...data.inventories.map(x => ({ type: 'Inventory', date: x.created_datetime.toString(), read: x.markedRead || false })),
    ];
    return all;
  }

  groupByDay(notifications: { date: string }[]): { [key: string]: number } {
    return notifications.reduce((acc, curr) => {
      const date = new Date(curr.date).toISOString().split('T')[0]; // Formato YYYY-MM-DD
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  groupByType(notifications: { type: string }[]): { [key: string]: number } {
    return notifications.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  groupByHour(notifications: { date: string }[]): { [key: string]: number } {
    return notifications.reduce((acc, curr) => {
      const hour = new Date(curr.date).getHours(); 
      const formattedHour = `${hour < 10 ? '0' : ''}${hour}:00`; 
      acc[formattedHour] = (acc[formattedHour] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  groupByMonth(notifications: { date: string }[]): { [key: string]: number } {
    return notifications.reduce((acc, curr) => {
      const month = new Date(curr.date).getMonth(); // Obtenemos el mes (0-11)
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      acc[months[month]] = (acc[months[month]] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

groupByReadStatus(notifications: { type: string; date: string; read: boolean }[]): { [key: string]: { read: number, unread: number } } {
  return notifications.reduce((acc, curr) => {
    const week = this.getWeekFromDate(curr.date);
    if (!acc[week]) {
      acc[week] = { read: 0, unread: 0 };
    }
    if (curr.read) {
      acc[week].read += 1;
    } else {
      acc[week].unread += 1;
    }
    return acc;
  }, {} as { [key: string]: { read: number, unread: number } });
}

getReadNotificationsRate(groupedData: { [key: string]: { read: number, unread: number } }): number {
  let totalNotifications = 0;
  let readNotifications = 0;

  for (const week in groupedData) {
    totalNotifications += groupedData[week].read + groupedData[week].unread;
    readNotifications += groupedData[week].read;
  }

  return totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0;
}

getWeeklyReadNotifications(groupedData: { [key: string]: { read: number, unread: number } }): number[] {
  return Object.values(groupedData).map(week => week.read);
}

getWeeklyUnreadNotifications(groupedData: { [key: string]: { read: number, unread: number } }): number[] {
  return Object.values(groupedData).map(week => week.unread);
}

getWeekFromDate(date: string): string {
  const d = new Date(date);
  const weekNumber = Math.floor((d.getDate() - 1) / 7) + 1; 
  return `${d.getFullYear()}-W${weekNumber}`;
}

  findMaxNotificationsDay(groupedData: { [key: string]: number }): { day: string; count: number } {
    let maxDay = '';
    let maxCount = 0;

    for (const [day, count] of Object.entries(groupedData)) {
      if (count > maxCount) {
        maxDay = day;
        maxCount = count;
      }
    }

    return { day: maxDay, count: maxCount };
  }

  findMaxNotificationsType(groupedData: { [key: string]: number }): { type: string; count: number } {
    let maxType = '';
    let maxCount = 0;
  
    for (const [type, count] of Object.entries(groupedData)) {
      if (count > maxCount) {
        maxType = type;
        maxCount = count;
      }
    }
  
    return { type: maxType, count: maxCount };
  }

  findMaxNotificationsHour(groupedData: { [key: string]: number }): { hour: string; count: number } {
    let maxHour = '';
    let maxCount = 0;
  
    for (const [hour, count] of Object.entries(groupedData)) {
      if (count > maxCount) {
        maxHour = hour;
        maxCount = count;
      }
    }
  
    return { hour: maxHour, count: maxCount };
  }
  
  findMaxNotificationsMonth(groupedData: { [key: string]: number }): { month: string; count: number } {
    let maxMonth = '';
    let maxCount = 0;
  
    for (const [month, count] of Object.entries(groupedData)) {
      if (count > maxCount) {
        maxMonth = month;
        maxCount = count;
      }
    }
  
    return { month: maxMonth, count: maxCount };
  }

  loadChartData(): void {
    const counterOfBools = ['Leido', 'No Leido'];
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    const monthsOfYear = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const hoursOfDay = ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
                        '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00']
    const getDayOfWeek = (date: Date) => daysOfWeek[date.getDay() - 1]; // Ajuste del día de la semana (domingo es 0)
    const getMonthOfYear = (date: Date) => monthsOfYear[date.getMonth()]; // Ajuste del mes del año (diciembre es 0)
    const getHourOfDay = (date: Date) => hoursOfDay[date.getHours() - 1]; // Ajuste de la hora del dia (las 12 es 0)
    const getCounterOfBools = (count: Number) => counterOfBools[count.valueOf()];
  
    this.chartDataService.getData().subscribe(
      (data: AllNotifications) => {
        console.log('Chart Data:', data);
  
        // Inicializamos las variables para cada día de la semana
        const notificationsPerDay: { [key: string]: number } = {
          'Lunes': 0, 'Martes': 0, 'Miércoles': 0, 'Jueves': 0, 'Viernes': 0
        };

        // Inicializamos las variables para cada mes del año
        const notificationsPerMonth: { [key: string]: number } = {
          'Enero': 0, 'Febrero': 0, 'Marzo': 0, 'Abril': 0, 'Mayo': 0, 'Junio': 0, 'Julio': 0, 'Agosto': 0, 'Septiembre': 0, 'Octubre': 0, 'Noviembre': 0, 'Diciembre': 0
        };

        const notificationsPerHour: { [key: string]: number } = {
          '01:00': 0, '02:00': 0, '03:00': 0, '04:00': 0, '05:00': 0, '06:00': 0, '07:00': 0, '08:00': 0, '09:00': 0, '10:00': 0, '11:00': 0, '12:00': 0, '13:00': 0, '14:00': 0, '15:00': 0, '16:00': 0,
          '17:00': 0, '18:00': 0, '19:00': 0, '20:00': 0, '21:00': 0, '22:00': 0, '23:00': 0, '00:00':0
        };
  
        // Contamos las notificaciones por tipo por dia
        data.access.forEach(a => {
          const dayOfWeek = getDayOfWeek(new Date(a.created_datetime));
          notificationsPerDay[dayOfWeek] += 1;
        });

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

        data.inventories.forEach(f => {
          const dayOfWeek = getDayOfWeek(new Date(f.created_datetime));
          notificationsPerMonth[dayOfWeek] += 1;
        });

        // Contamos las notificaciones por tipo del mes
        data.access.forEach(a => {
          const monthsOfYear = getMonthOfYear(new Date(a.created_datetime));
          notificationsPerMonth[monthsOfYear] += 1;
        });
  
        data.payments.forEach(p => {
          const monthsOfYear = getMonthOfYear(new Date(p.created_datetime));
          notificationsPerMonth[monthsOfYear] += 1;
        });
  
        data.fines.forEach(f => {
          const monthsOfYear = getMonthOfYear(new Date(f.created_datetime));
          notificationsPerMonth[monthsOfYear] += 1;
        });

        data.inventories.forEach(f => {
          const monthsOfYear = getMonthOfYear(new Date(f.created_datetime));
          notificationsPerMonth[monthsOfYear] += 1;
        });

        // Contamos las notificaciones por hora del dia
        data.access.forEach(a => {
          const hoursOfDay = getHourOfDay(new Date(a.created_datetime));
          notificationsPerHour[hoursOfDay] += 1;
        });
  
        data.payments.forEach(p => {
          const hoursOfDay = getHourOfDay(new Date(p.created_datetime));
          notificationsPerHour[hoursOfDay] += 1;
        });
  
        data.fines.forEach(f => {
          const hoursOfDay = getHourOfDay(new Date(f.created_datetime));
          notificationsPerHour[hoursOfDay] += 1;
        });

        data.inventories.forEach(f => {
        const hoursOfDay = getHourOfDay(new Date(f.created_datetime));
        notificationsPerHour[hoursOfDay] += 1;
        });
  
        // Actualizamos el columnChartData sumando todas las notificaciones por día
        this.columnChartData = daysOfWeek.map(day => [day, notificationsPerDay[day]]);

        // Actualizamos el columnChartData sumando todas las notificaciones por mes
        this.columnChartData6 = monthsOfYear.map(month => [month, notificationsPerMonth[month]]);
  
        // Datos para el segundo gráfico: Notificaciones por Tipo (Access, Payment, Fine, Inventory)
        this.columnChartData2 = [
          ['Access', data.access.length],
          ['Payment', data.payments.length],
          ['Fine', data.fines.length],
          ['Inventory', data.inventories.length]
        ];
  
        // Datos para el tercer gráfico: Notificaciones por Día y Tipo de Notificación
        this.columnChartData3 = daysOfWeek.map(day => [
          day,
          data.access.filter(a => getDayOfWeek(new Date(a.created_datetime)) === day).length,
          data.payments.filter(p => getDayOfWeek(new Date(p.created_datetime)) === day).length,
          data.fines.filter(f => getDayOfWeek(new Date(f.created_datetime)) === day).length,
          data.inventories.filter(f => getDayOfWeek(new Date(f.created_datetime)) === day).length
        ]);

        // Datos para el cuarto gráfico
        this.columnChartData4 = hoursOfDay.map(hour => [hour, notificationsPerHour[hour]]);

        // Datos para el quinto gráfico
        this.columnChartData5 = counterOfBools.map(count => [
          count,
          data.access.filter(a => getCounterOfBools(new Number(a.markedRead)) === count).length,
          data.payments.filter(a => getCounterOfBools(new Number(a.markedRead)) === count).length,
          data.inventories.filter(a => getCounterOfBools(new Number(a.markedRead)) === count).length,
          data.fines.filter(a => getCounterOfBools(new Number(a.markedRead)) === count).length,
          
        ]);

        // Datos para el sexto gráfico
        this.columnChartData6 = monthsOfYear.map(day => [
          day,
          data.access.filter(a => getMonthOfYear(new Date(a.created_datetime)) === day).length,
          data.payments.filter(p => getMonthOfYear(new Date(p.created_datetime)) === day).length,
          data.fines.filter(f => getMonthOfYear(new Date(f.created_datetime)) === day).length,
          data.inventories.filter(f => getMonthOfYear(new Date(f.created_datetime)) === day).length
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