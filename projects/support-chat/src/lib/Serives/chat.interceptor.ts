import { HttpInterceptorFn } from '@angular/common/http';

export const chatInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
