import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
//este es el  servicio de mi api, obtengo la url
  private urlApi = 'https://api01.pythonanywhere.com/api/Instrumentos/'

  constructor(private http: HttpClient) { }


  public getData(): Observable<any> {
    return this.http.get<any>(this.urlApi);
  }

}
