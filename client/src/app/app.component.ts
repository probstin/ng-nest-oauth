import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserProfile, UserService } from './core/auth/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  userProfile$: Observable<UserProfile> = of();

  constructor(private _userSerice: UserService) { }

  ngOnInit(): void {
    this.userProfile$ = this._userSerice.userProfile$;
  }

}
