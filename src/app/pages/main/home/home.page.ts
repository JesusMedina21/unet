import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Deuda } from 'src/app/models/Deuda.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateDeudaComponent } from 'src/app/shared/components/add-update-Deuda/add-update-Deuda.component';
import { orderBy, where } from 'firebase/firestore';

import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})


export class HomePage implements OnInit {
  originalDeudas: Deuda[] = [];
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  Deudas: Deuda[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  pdfObject: any;
  data: any [] = []; 
  isConnected: boolean = navigator.onLine; // Default to the current online status
  constructor(
    private changeDetector: ChangeDetectorRef,
    private apiService: ApiService,
  ) {}


 

  //API
  llenarData() {
    this.apiService.getData().subscribe( data=> {
      this.data = data;
     
    })
  }
 
  //Cerrar sesion
  signOut() {
    this.firebaseSvc.signOut();
  }

  ngOnInit() {
    this.llenarData();
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  ionViewWillEnter() {
    this.getDeudas();
  }

  //Reiniciar pagina

  doRefresh(event) {
    
    setTimeout(() => {
     this.getDeudas(),
      event.target.complete();
    }, 1000);
  }






  //Orden de Deuda
  getDeudas() {
    let path = `Deuda`;
    this.loading = true;
    let query = [
      orderBy('precio', 'desc'),
    ];
    this.firebaseSvc
      .getCollectionData(path, query)
      .subscribe({
        next: (res: any) => {
          this.Deudas = res.map((Deuda: Deuda) => {
           
            return Deuda;
          });
          this.originalDeudas = [...this.Deudas]; // Almacena los Deuda originales
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener los Deuda:', error);
        },
      });
  }
  async addUpdateDeuda(Deuda?: Deuda) {
    if (!this.isConnected) {
      this.utilsSvc.presentToast({
        message: 'Sin conexión a Internet. Por favor, intente más tarde.',
        duration: 2000,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return; // Exit if there is no connection
    }
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateDeudaComponent,
      cssClass: 'add-update-modal',
      componentProps: { Deuda }
    })

    if(success) this.getDeudas();
  }  
  

  async actualizar_documento(Deuda: Deuda) {
   //   const path = `usuarios/${this.user().uid}/Deuda/${Deuda.id}`;
   const path = `Deuda/${Deuda.id}`;
    
      try {
        await this.firebaseSvc.updateDocument(path, Deuda);
        console.log('Deudado actualizado en la colección de Deuda');
      } catch (error) {
        console.error('Error al actualizar el Deudado en la colección de Deuda:', error);
        // Manejar el error según sea necesario
      }
    }
  
    async confirmDeleteDeuda(Deuda: Deuda) {
      if (!this.isConnected) {
        this.utilsSvc.presentToast({
          message: 'Sin conexión a Internet. Por favor, intente más tarde.',
          duration: 2000,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
        return; // Exit if there is no connection
      }
    this.utilsSvc.presentAlert({
      header: 'Borrar Deudado',
      message: '¿Está seguro de borrar el Deudado? Esta acción es irreversible!',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Borrar',
          handler: () => {
            this.deleteDeuda(Deuda); // Llama a la función de eliminación
          }
        }
      ]
    });
  }

  //Eliminar Deudado
  async deleteDeuda(Deuda: Deuda){


    //   let path = `usuarios/${this.user().uid}/Deuda/${Deuda.id}`;
    let path = `Deuda/${Deuda.id}` 
  
    const loading = await this.utilsSvc.loading();
    await loading.present();
  
  
    
    this.firebaseSvc.deleteDocument(path).then(async res => {
  
    this.Deudas = this.Deudas.filter(p => p.id != Deuda.id ); 
  
      this.utilsSvc.presentToast({ 
        message: 'Deudado eliminado exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      })
      //Codigo de error 
  
     
    }).catch(error => {
      console.log(error);
  
  
    this.utilsSvc.presentToast({ 
      message: error.message,
      duration: 1500,
      color: 'danger',
      position: 'middle',
      icon: 'alert-circle-outline'
    })
    //Codigo de error 
  
    }).finally(() => {
      loading.dismiss();
    })
  
  }

}
