import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeviceDetectorService } from './device-detector.service';

@Injectable({
  providedIn: 'root'
})
export class TestingService {

  constructor(private http: HttpClient, private deviceService: DeviceDetectorService) { }
}
