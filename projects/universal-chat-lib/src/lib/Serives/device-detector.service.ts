import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceDetectorService {

  private isMobileUser: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.detectMobileUser();
  }

  private detectMobileUser() {
    if (isPlatformBrowser(this.platformId)) {
      const userAgent = window.navigator.userAgent;
      this.isMobileUser.next(userAgent.includes('iPhone') || userAgent.includes('Android'));
    } else {
      // Handle non-browser environment if needed
      this.isMobileUser.next(null);
    }
  }

  getIsMobileUser(): BehaviorSubject<boolean | null> {
    return this.isMobileUser;
  }

  getIsIPhoneUser(): BehaviorSubject<boolean | null> {
    const isIPhoneUser = new BehaviorSubject<boolean | null>(null);

    this.isMobileUser.subscribe((isMobile) => {
      if (isMobile !== null) {
        if (isMobile) {
          const userAgent = window.navigator.userAgent;
          isIPhoneUser.next(userAgent.includes('iPhone'));
        } else {
          isIPhoneUser.next(false);
        }
      } else {
        isIPhoneUser.next(null);
      }
    });

    return isIPhoneUser;
  }

  getIsAndroidUser(): BehaviorSubject<boolean | null> {
    const isAndroidUser = new BehaviorSubject<boolean | null>(null);

    this.isMobileUser.subscribe((isMobile) => {
      if (isMobile !== null) {
        if (isMobile) {
          const userAgent = window.navigator.userAgent;
          isAndroidUser.next(userAgent.includes('Android'));
        } else {
          isAndroidUser.next(false);
        }
      } else {
        isAndroidUser.next(null);
      }
    });

    return isAndroidUser;
  }

  getIsWindowsUser(): BehaviorSubject<boolean | null> {
    const isWindowsUser = new BehaviorSubject<boolean | null>(null);

    if (isPlatformBrowser(this.platformId)) {
      const userAgent = window.navigator.userAgent;
      isWindowsUser.next(userAgent.includes('Windows'));
    } else {
      isWindowsUser.next(null);
    }

    return isWindowsUser;
  }

}
