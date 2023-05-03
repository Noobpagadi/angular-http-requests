import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { saveAs } from 'file-saver';
import {
  catchError,
  mergeAll,
  Observable,
  Subscription,
  switchMap,
  take,
  toArray,
} from 'rxjs';
import { Dog } from './model/dog.model';
import { DogService } from './services/dog.service';
import { FileService } from './services/file.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'http-requests-angular';

  allDogs$?: Observable<Dog[]>;
  allDogsThreeTimes$?: Observable<Dog[]>;
  uploadProgress: number = 0;
  fileId: any;
  fileInfos: any;
  downloadProgress: number = 0;
  uploadSubscription?: Subscription;

  constructor(
    private dogService: DogService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.dogService.dogs$
      .pipe(untilDestroyed(this))
      .subscribe((dogs: Dog[]) => {
        console.log('Normal dogs');
        console.log(dogs);
      });
    this.dogService.dogsBehaviour$
      .pipe(untilDestroyed(this))
      .subscribe((dogs: Dog[]) => {
        console.log('Dogs with empty array start');
        console.log(dogs);
      });

    // The below lines would create subscriptions to assign values to subjects.
    // this.dogService.getDogsEveryFiveSeconds();
    // this.dogService.saveAllDogsFiveTimesInRepeatableSubject();
  }

  getDogs() {
    this.allDogs$ = this.dogService.getAllDogsObservable();
  }

  getDogsThreeTimes() {
    this.allDogsThreeTimes$ = this.dogService.getAllDogsThreeTimesObservable();
  }

  getAllDogsSavedInRepeatableSubject() {
    this.dogService.dogsRepeatable$$
      .pipe(take(10), mergeAll(), toArray())
      .subscribe((dogs: Dog[]) => {
        console.log('Repeated dogs');
        console.log(dogs);
      });
  }

  uploadFile(uploadFileEvent: Event) {
    uploadFileEvent.preventDefault();
    const targetElement = uploadFileEvent.target as HTMLInputElement;
    const files = targetElement?.files;
    const firstFile = files?.item(0);
    if (firstFile) {
      this.uploadSubscription = this.fileService
        .uploadFile(firstFile)
        .subscribe({
          next: (event: any) => {
            console.log(event);
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadProgress = Math.round(
                (100 * event.loaded) / event.total
              );
            } else if (event instanceof HttpResponse) {
              this.fileId = event.body?.fileId;
            }
          },
          error: (err: any) => {
            console.error('Could not upload the file');
            this.uploadProgress = 0;
          },
        });
    }
  }

  downloadFile() {
    this.fileService.downloadFile(this.fileId).subscribe({
      next: (event: HttpEvent<ArrayBuffer>) => {
        console.log(event);
        if (event.type === HttpEventType.DownloadProgress && event.total) {
          this.downloadProgress = Math.round(
            (100 * event.loaded) / event.total
          );
        } else if (event instanceof HttpResponse) {
          if (event.body) {
            const blob = new Blob([event.body], {
              type: event.headers.get('Content-Type') ?? 'txt',
            });
            const file = new File(
              [blob],
              event.headers
                .get('Content-Disposition')
                ?.match('filename="([^"]*)"')?.[1] ?? 'no_name',
              {
                type: event.headers.get('Content-Type') ?? 'txt',
              }
            );
            saveAs(file);
          }
        }
      },
      error: (err: any) => {
        console.error('Could not download the file');
        this.downloadProgress = 0;
      },
    });
  }

  cancelUpload() {
    this.uploadSubscription?.unsubscribe();
    console.warn('Upload canceled');
    this.uploadProgress = 0;
  }
}
