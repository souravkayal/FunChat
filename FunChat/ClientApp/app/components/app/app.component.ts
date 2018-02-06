import { Component, Input, ElementRef } from '@angular/core';
import { CoolLocalStorage } from 'angular2-cool-storage';
import { ChatProfile , Room } from '../../model/connect.request'
import { ChatMessage } from '../../model/chat.model'

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    public localStorage: CoolLocalStorage;
    public chatProfile: ChatProfile;

    constructor(private elementRef: ElementRef, localStorage: CoolLocalStorage)
    {
        this.localStorage = localStorage;   
        if (this.elementRef.nativeElement.getAttribute('rooms') != null)
        {
            var Rooms = (this.elementRef.nativeElement.getAttribute('rooms').split(',') as string[]).filter(x => x != '');
            var UserRooms: Room[] = [];

            for (var i = 0; i < Rooms.length; i++) {
                UserRooms.push(new Room(Rooms[i], [] , 0));
            }
            this.localStorage.setObject("UserProfile", new ChatProfile("", UserRooms, this.elementRef.nativeElement.getAttribute('name')));
        }
    }
}
