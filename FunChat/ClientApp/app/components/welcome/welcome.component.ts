import { Component } from '@angular/core';
import { RouterModule , Router } from '@angular/router';

@Component({
    selector: 'welcome' ,
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.css']
})
export class WelcomeComponent {

    public constructor(public router: Router) {
    }

    gotoHome() {
       this.router.navigateByUrl('/home');
    }
}
