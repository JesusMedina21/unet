import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main', 
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {



  router = inject(Router);

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  

  currentPath: string = '';

  ngOnInit() {
    
  }
  
  user(): User {
   return this.utilsSvc.getFromLocalStorage('user');
  }


  //Cerrar sesion
  signOut() {
    this.firebaseSvc.signOut();
  }
  redirectTo(url: string) {
    window.open(url, '_blank'); // Abre la URL en una nueva pestaña
  }

}
