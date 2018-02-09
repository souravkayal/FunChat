import { Component, Input, ElementRef, ViewContainerRef } from '@angular/core';
import { CoolLocalStorage } from 'angular2-cool-storage';
import { ChatProfile , Room } from '../../model/connect.request'
import { ChatMessage } from '../../model/chat.model'
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    public localStorage: CoolLocalStorage;
    public chatProfile: ChatProfile;
    public PassCode : string;

    constructor(private elementRef: ElementRef, localStorage: CoolLocalStorage, public toastr: ToastsManager, vcr: ViewContainerRef)
    {
        this.toastr.setRootViewContainerRef(vcr);

        this.localStorage = localStorage;   
        if (this.elementRef.nativeElement.getAttribute('room') != null)
        {
            //Only one room will come. In current scenerio
            var RoomName = this.elementRef.nativeElement.getAttribute('room');
            var UserRoom: Room[] = [];

            //Check passcode is there or not. If there joining in existing room
            if (this.elementRef.nativeElement.getAttribute('passCode') != null)
            {
                this.PassCode = this.elementRef.nativeElement.getAttribute('passCode');
            }
            UserRoom.push(new Room(RoomName, [] , 0, this.PassCode));
            this.localStorage.setObject("UserProfile", new ChatProfile("", UserRoom, this.elementRef.nativeElement.getAttribute('name')));
        }


    }
}
