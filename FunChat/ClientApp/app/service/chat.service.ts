import { Injectable} from '@angular/core';  
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
//import { CHAT_API_ENDPOINT } from '../core/config'
import { User } from '../model/chat.model'

@Injectable()
export class chatService {  

   public CHAT_API_ENDPOINT: string = 'http://localhost:28855/api/chat';
   constructor(private _http: Http) { }

   checkGroupExist(roomName : any): Observable<boolean> {
       return this._http.get(this.CHAT_API_ENDPOINT + "/checkRoomExist/")
           .map((response: Response) => <boolean>response.json());
   } 


   getAllGroup(): Observable<string[]> {
       return this._http.get(this.CHAT_API_ENDPOINT + "/getAllGroup/")
           .map((response: Response) => <string[]>response.json());
   } 

   GetAllRoomsByOwner(roomName: string): Observable<string[]> {
       return this._http.get(this.CHAT_API_ENDPOINT + "/getRoomByOwner/" + roomName)
           .map((response: Response) => <string[]>response.json());
   } 


   getUserInGroup(groupName : string): Observable<User[]> {
       return this._http.get(this.CHAT_API_ENDPOINT + "/getAllInGroup/" + groupName)
           .map((response: Response) => <User[]>response.json())
           .do(data => console.log(JSON.stringify(data)));
   } 


} 