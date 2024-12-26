import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, } from '@angular/forms';
import { Deuda } from 'src/app/models/Deuda.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-add-update-Deuda',
  templateUrl: './add-update-Deuda.component.html',
  styleUrls: ['./add-update-Deuda.component.scss'],
})


export class AddUpdateDeudaComponent implements OnInit {

  
  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    precio: new FormControl(null, [Validators.required, Validators.min(1)]),
  });
  @Input() Deuda: Deuda;
  loading: boolean = false;
  user = {} as User;
  Deudas: Deuda[] = []; 
  
  isConnected: boolean = navigator.onLine; // aqui determino sin estan conectado o si no para mandar mensajes de error
  code: any;
  isSubmitting: boolean = false; // aqui ya se si presionaron el boton de enviar para que se deshabilite y no le den enviar tantas veces
  constructor(

    private firebaseSvc: FirebaseService, 
    private utilsSvc: UtilsService,
    private changeDetector: ChangeDetectorRef
  ) {this.initializeNetworkEvents();}

  
  initializeNetworkEvents() {
    // chequeo si estan conectados
    this.isConnected = navigator.onLine;

    window.addEventListener('offline', () => {
      console.log('Conexión a Internet perdida');
      this.isConnected = false;
      this.changeDetector.detectChanges(); //notifico a angular un cambio
    });
  }

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    
    // Si hay un Deudado, inicializa el formulario con sus datos
    if (this.Deuda) {
      this.form.patchValue({
        id: this.Deuda.id,
        name: this.Deuda.name,
        precio: this.Deuda.precio,
      });
      
    }

    
  }

  submit() {
    if (this.isSubmitting) return; // evito el error de presionar multiples veces el boton
    this.isSubmitting = true; // 
  
    if (this.form.valid) {
        if (this.Deuda) {
            this.updateDeuda().finally(() => {
                this.isSubmitting = false; 
            });
        } else {
            this.createDeuda().finally(() => {
                this.isSubmitting = false; 
            });
        }
    } 
  }
//validacion para escribir puros numeros
setNumberInputs() {
  let { precio } = this.form.controls;
}
//borrar si por alguna casualidad de la vida se guardo un campo vacio
//debido a que las bases de datos nosql no permiten guardar campos vacios
cleanFormValues() {
  Object.keys(this.form.value).forEach(key => {
    if (this.form.value[key] === '' || this.form.value[key] === null) {
      delete this.form.value[key];
    }
  });
}
  //funcion asincrona para chequar conexiones
  async checkConnection() {
    if (!this.isConnected) {
      this.utilsSvc.presentToast({
        message: 'Sin conexión a Internet. Por favor, intente más tarde.',
        duration: 2000,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return false; 
    }
    return true; 
  }

// Crear Deudado
async createDeuda() {
  const connectionStatus = await this.checkConnection();
  if (!connectionStatus) {
    return; 
  }

  let path = `Deuda`;
  const nombreDeudado = this.form.get('name').value;
  const NombreExistente = await this.firebaseSvc.getDocumentByField(path, 'name', nombreDeudado);
  
  if (NombreExistente) {
    this.utilsSvc.presentToast({
      message: 'Ya existe un Deudado con este nombre',
      duration: 1500,
      color: 'danger',
      position: 'middle',
      icon: 'alert-circle-outline'
    });
  } else {
    // Cargando
    const loading = await this.utilsSvc.loading();
    await loading.present();
    
   
    // Generar un ID único para el Deudado
    const DeudaId = this.form.get('name').value.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now(); // Ejemplo de ID basado en el nombre y timestamp
    
  
    // Guardar el Deudado usando setDoc con el ID generado
    this.firebaseSvc.setDocument(`${path}/${DeudaId}`, { ...this.form.value, id: DeudaId }).then(async res => {
      this.utilsSvc.presentToast({
        message: 'Deudado creado exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
      // Cerrar el modal solo si el Deudado se registra con éxito
      this.utilsSvc.dismissModal({ success: true });
    }).catch(error => {
      console.log(error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 1500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }).finally(() => {
      loading.dismiss();
    });
  }
}
 //Editar Deudado
 async updateDeuda() {
  const connectionStatus = await this.checkConnection();
  if (!connectionStatus) {
    return; // Exit if there is no connection
  }

  let path = `Deuda/${this.Deuda.id}`;
    
    const nombreDeudado = this.form.get('name').value;
    const DeudadoExistente = await this.firebaseSvc.getDocumentByField('Deuda', 'name', nombreDeudado);
  
    if (DeudadoExistente && DeudadoExistente['id'] !== this.Deuda.id) {
      this.utilsSvc.presentToast({
        message: 'Ya existe un Deudado con este nombre',
        duration: 1500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return;
    }
  

  
    const loading = await this.utilsSvc.loading();
    await loading.present();
  
  
    this.cleanFormValues();
    delete this.form.value.id;
  
    this.firebaseSvc.updateDocument(path, this.form.value).then(async res => {
      this.utilsSvc.dismissModal({ success: true });
      this.utilsSvc.presentToast({
        message: 'Deudado actualizado exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    }).catch(error => {
      console.log(error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 1500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }).finally(() => {
      loading.dismiss();
    });
  }


}