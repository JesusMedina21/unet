import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, AlertOptions, LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
//import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  modalCtrl = inject (ModalController);
  router = inject(Router);
  alertCtrl = inject(AlertController)



 //Alertas para que funcione el loading
async presentAlert(opts?: AlertOptions) {
  const alert = await this.alertCtrl.create(opts);

  await alert.present();
}

  //  Cargando


  loading() {
    return this.loadingCtrl.create({spinner: 'crescent'})
  }

    //  Toast

    async presentToast(opts?: ToastOptions) {
      const toast = await this.toastCtrl.create(opts);
      toast.present();
    }
    /// Enviar a cualquier pagina disponible
    routerLink(url: string) {
      return this.router.navigateByUrl(url);
    }
    // Guardar archivo/elemento
    saveInLocalStorage(key: string, value: any) {
      return localStorage.setItem(key, JSON.stringify(value))
    }
    // Obtener archivo/elemento
    getFromLocalStorage(key: string) {
      return JSON.parse(localStorage.getItem(key));
    }

     // Modal
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCtrl.create(opts);
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) return data;
  }
   
//cerrar modal
  dismissModal(data?: any) {
   return this.modalCtrl.dismiss(data);

  }

}
