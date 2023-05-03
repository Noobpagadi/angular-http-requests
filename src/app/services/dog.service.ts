import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  BehaviorSubject,
  mergeAll,
  Observable,
  repeat,
  ReplaySubject,
  Subject,
  toArray,
} from 'rxjs';
import { Dog } from '../model/dog.model';

const PATH_DOGS = 'http://localhost:8080/api/dog';

@Injectable({
  providedIn: 'root',
})
export class DogService {
  private dogs$$: Subject<Dog[]> = new Subject();
  dogs$: Observable<Dog[]> = this.dogs$$.asObservable();

  private dogsBehaviour$$: BehaviorSubject<Dog[]> = new BehaviorSubject<Dog[]>(
    []
  );
  dogsBehaviour$: Observable<Dog[]> = this.dogsBehaviour$$.asObservable();

  public dogsRepeatable$$: ReplaySubject<Dog[]> = new ReplaySubject();

  constructor(private http: HttpClient) {}

  getDogsEveryFiveSeconds() {
    // having subscriptions in services is plain wrong, i only did this to show how subjects work
    this.getAllDogsObservable()
      .pipe(repeat({ delay: 5000 }))
      .subscribe((dogs: Dog[]) => {
        this.dogs$$.next(dogs);
        this.dogsBehaviour$$.next(dogs);
      });
  }

  saveAllDogsFiveTimesInRepeatableSubject() {
    // same as line 34
    this.getAllDogsObservable()
      .pipe(repeat(10))
      .subscribe((dogs: Dog[]) => {
        this.dogsRepeatable$$.next(dogs);
      });
  }

  getAllDogsObservable(): Observable<Dog[]> {
    return this.http.get<Dog[]>(PATH_DOGS);
  }

  getAllDogsThreeTimesObservable(): Observable<Dog[]> {
    return this.http
      .get<Dog[]>(PATH_DOGS)
      .pipe(repeat({ count: 3, delay: 1000 }), mergeAll(), toArray());
  }
}
