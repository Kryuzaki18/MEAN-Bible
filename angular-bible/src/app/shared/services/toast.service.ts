import { Injectable, signal, Type } from '@angular/core';

enum EToastTypes {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warn = 'warn',
  Secondary = 'secondary',
  Contrast = 'contrast'
}

type TToastType = keyof typeof EToastTypes;

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _message = signal<TToastType>('Info');

  successMsg(msg: string) {
    this._message.set('Success');
  }

  errorMsg(msg: string) {
    this._message.set('Error');
  }

  infoMsg(msg: string) {
    this._message.set('Info');
  }

  warnMsg(msg: string) {
    this._message.set('Warn');
  }
  
  secondaryMsg(msg: string) {
    this._message.set('Secondary');
  }

  contrastMsg(msg: string) {
    this._message.set('Contrast');
  }
}
