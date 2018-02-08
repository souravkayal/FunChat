import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './components/app/app.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { FetchDataComponent } from './components/fetchdata/fetchdata.component';
import { CounterComponent } from './components/counter/counter.component';
import { WelcomeComponent } from './components/welcome/welcome.component'
import { CoolStorageModule } from 'angular2-cool-storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { ToastModule , ToastOptions } from 'ng2-toastr/ng2-toastr';
//import { CustomToastOptions } from './model/toastOption'

//import { ToasterModule, ToasterService } from 'angular2-toaster';

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        CounterComponent,
        FetchDataComponent,
        WelcomeComponent,
        HomeComponent
    ],

    //providers: [
    //    { provide: ToastOptions, useClass: CustomToastOptions }
    //],

    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        CoolStorageModule,
        BrowserAnimationsModule,
        //ToasterModule.forRoot(),
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'counter', component: CounterComponent },
            { path: 'fetch-data', component: FetchDataComponent },
            { path: '**', redirectTo: 'home' }
        ])
    ]
})
export class AppModuleShared {
}
