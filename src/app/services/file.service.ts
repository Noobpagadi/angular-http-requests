import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';

const PATH_FILES = 'http://localhost:8080/api/file';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<HttpEvent<any>> {
    // Create form data
    const formData = new FormData();

    // Store form name as "file" with file data
    formData.append('file', file, file.name);
    // Make http post request over api
    // with formData as req
    return this.http.post<HttpEvent<any>>(PATH_FILES, formData, {
      reportProgress: true,
      responseType: 'json',
      observe: 'events',
    });
  }

  downloadFile(id: string): Observable<HttpEvent<ArrayBuffer>> {
    return this.http.get(`${PATH_FILES}/${id}`, {
      reportProgress: true,
      responseType: 'arraybuffer',
      observe: 'events',
    });
  }
}
