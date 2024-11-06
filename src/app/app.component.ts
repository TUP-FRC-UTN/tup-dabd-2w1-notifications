import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AllNotificationComponent } from "./components/all-notification/all-notification.component";
import { NgModel } from '@angular/forms';
//import {components} from './components'
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AllNotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'template-app';
}