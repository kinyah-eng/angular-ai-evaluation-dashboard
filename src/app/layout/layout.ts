import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import { ToastContainer } from '../shared/ui/toast-container/toast-container';

@Component({
  selector: 'app-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ToastContainer,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
