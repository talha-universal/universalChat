import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CONFIG } from '../../../Config';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class EncryptDecryptService {

  // private marketData = new Subject<string>();
  // // ws://192.168.0.151:7777
  // // wss://firefetch.com
  // // private SocketBaseUrl = 'wss://casino.unityexch.com/universecasino';
  // private SocketBaseUrl = CONFIG.socketurl==''?'wss://'+window.location.host+'/universecasino':'wss://casino.unityexch.com/universecasino';

  // previousMsg: any;
  // serverPublicKey: any;
  // keyPair: any;
  // previousGameName: any;
  // messageToSocket: any;
  // constructor(private socket: WebsocketService) {
  //   this.getMessageFromSocket();
  // }
  // public getMarketData(): Observable<any> {
  //   return this.marketData.asObservable();
  // }

  // public updateMarketData(message: any): void {
  //   this.marketData.next(message);
  // }
  // generateEncryptionKey(gameName: any, messageToSocket?: any) {

  //   this.messageToSocket = messageToSocket;
  //   if (!this.previousGameName) {
  //     this.previousGameName = gameName;
  //   }
  //   // if(gameName!=this.previousGameName){
  //   //   this.socket.closeSocket();
  //   //   this.keyPair=null;
  //   // }
  //   if (this.keyPair) {
  //     this.sendMessageToSocket(messageToSocket);
  //     return
  //   }
  //   this.keyPair = forge.pki.rsa.generateKeyPair({ bits: 1024 });

  //   // Encrypt data
  //   const publicKey = forge.pki.publicKeyToPem(this.keyPair.publicKey);
  //   const privateKey = forge.pki.privateKeyToPem(this.keyPair.privateKey);
  //   const publicKeyBase64 = btoa(publicKey);

  //   // var url = this.SocketBaseUrl +'/'+gameName.toLowerCase() + '?token=' + publicKeyBase64;
  //   var url = this.SocketBaseUrl + '?token=' + publicKeyBase64;



  //   this.socket.connect(url).subscribe(
  //     async (message: any) => {
  //       // this.MessageReader(message);

  //       // this.checkMsg();
  //     },
  //     (error: any) => {
  //       console.error('WebSocket error:', error);
  //     },
  //     () => {
  //       console.log('WebSocket connection closed');
  //       //
  //       // console.log('reconnecting socket')
  //       // this.socket.reconnect();
  //     }

  //   );



  // }

  // sendMessageToSocket(message: any) {
  //   let msg = JSON.stringify(message)
  //   let encryptedtext = this.encryptUsingNodeForge(msg, this.encryptionKey, this.ivhex);
  //   this.socket.send(forge.util.encode64(encryptedtext));

  // }
  // async encryptData(data: any, keyPair: any): Promise<string> {
  //   try {
  //     // const jsonData = JSON.stringify(data);
  //     const encryptedBytes = keyPair.publicKey.encrypt(data);
  //     const encryptedData = forge.util.encode64(encryptedBytes);
  //     return encryptedData;
  //   } catch (error) {
  //     // console.error('Encryption error:', error);
  //     throw error;
  //   }
  // }

  // // checkMsg() {
  // //   try {

  // //     setTimeout(() => {
  // //       if (this.socket.NeedToSendPrevious()) {

  // //         if (this.previousMsg == null || this.previousMsg == undefined) {

  // //           this.previousMsg = { type: "2", id: "" };
  // //           this.socket.send(this.previousMsg);

  // //         } else {
  // //           this.socket.send(this.previousMsg);
  // //         }

  // //       }
  // //     }, 1000)
  // //   }
  // //   catch (error) {

  // //     setTimeout(() => {
  // //       if (this.socket.NeedToSendPrevious()) {

  // //         if (this.previousMsg == null || this.previousMsg == undefined) {

  // //           this.previousMsg = { type: "2", id: "" };
  // //           this.socket.send(this.previousMsg);

  // //         } else {
  // //           this.socket.send(this.previousMsg);
  // //         }

  // //       }
  // //     }, 1500)
  // //   }
  // // }

  // decryptData(item: any): string {
  //   try {
  //     var concatenatedString: any = ''
  //     item.forEach((data: any, index: any) => {
  //       var decryptedString = this.decryptString(data);
  //       concatenatedString = concatenatedString + decryptedString
  //     });
  //     return concatenatedString;
  //   } catch (error) {
  //     // console.error('Decryption error:', error);
  //     throw error;
  //   }
  // }
  // getMessageFromSocket() {
  //   this.counter = 0;
  //   this.socket.getMarketData().subscribe((data: any) => {
  //     this.MessageReader(data);
  //   })
  // }
  // ivhex: any;
  // encryptionKey: any;
  // counter: any;
  // async MessageReader(message: any) {
  //   // console.log('Received message:', message);
  //   // Decrypt the data using the private key
  //   if (message == "WebSocket connection closed" || message == "unsubscribed successfully" || message == null) {
  //     return
  //   }

  //   const decrptedBuffer = forge.util.decode64(message);

  //   // console.log('decrypted buffer', message)
  //   // console.log(decrptedBuffer);
  //   try {
  //     var dataParse = JSON.parse(decrptedBuffer);
  //     if (dataParse?.type == 1) {
  //       // this.updateMarketData(dataParse)
  //       return
  //     }
  //   } catch (error) {
  //     // console.log( 'oye hoye ',decrptedBuffer);
  //     this.decryptusingNodeforge(decrptedBuffer, this.encryptionKey, this.ivhex);

  //   }

  //   if (dataParse) {

  //     dataParse = JSON.parse(decrptedBuffer);
  //     // console.log("server data here in objects =====> ", dataParse);
  //     if (dataParse?.type == 0) {

  //       this.serverPublicKey = forge.pki.publicKeyFromPem(dataParse.data);
  //       // console.log(dataParse)
  //       this.ivhex = this.decryptString(dataParse.iv);
  //       this.encryptionKey = this.decryptString(dataParse.encryptionKey);
  //       // const sampleEncrypTedData = forge.util.decode64(dataParse.sampleEncrypTedData);
  //       // console.log(this.serverPublicKey);

  //       // console.log('sample encrypted data', dataParse.sampleEncrypTedData);
  //       // console.log("key  ", this.encryptionKey,)
  //       // console.log("iv  ", this.ivhex,)

  //       // this.decryptusingNodeforge(dataParse.sampleEncrypTedData,this.encryptionKey,this.ivhex);

  //       // this.sendMessageToSocket({ type: "1", id: "99.0001" });
  //       // this.socket.send({ type: "1", id: "99.0001" })\

  //       // this.encryptionKey = '';
  //       // this.ivhex = '9000a097c97d5f67ba4d691fc8d97fed';
  //       this.sendMessageToSocket(this.messageToSocket);
  //       // this.decryptusingNodeforge(encryptedtext,this.encryptionKey,this.ivhex);

  //     }
  //     else {

  //       // console.log(dataParse.data, 'data from socket');

  //       // var finalData = this.decryptData(dataParse.data);
  //       // console.log('Data After Decrypting before sending : ',);
  //       // this.marketData.next(JSON.parse(finalData));

  //     }

  //   }
  //   else {
  //     // console.log('oye hoye 1234', decrptedBuffer);
  //     // this.decryptusingNodeforge(decrptedBuffer, this.encryptionKey, this.ivhex);
  //   }

  // }

  // decryptusingNodeforge(encryptedHex: any, keyBase64: any, ivHex: any) {
  //   // const encryptedHex = 'e30fed0d3ec77d7c4e323051e144fea60b3838f644e6acbc4d7d09772434f62e112096e96216f9a48f49f1565116aa54';
  //   // const keyBase64 = 'YidrPVqPJRA0S1z5eXH3Zw==';
  //   // const ivHex = '9000a097c97d5f67ba4d691fc8d97fed';
  //   const keyBytes = forge.util.decode64(keyBase64); // Decode base64-encoded key
  //   const ivBytes = forge.util.hexToBytes(ivHex); // Convert hex IV to bytes

  //   const decipher = forge.cipher.createDecipher('AES-CBC', keyBase64);
  //   decipher.start({ iv: ivBytes });
  //   decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encryptedHex)));
  //   decipher.finish();
  //   const decryptedString = decipher.output.data; // Use without arguments
  //   this.updateMarketData(decryptedString)
  //   // console.log('Decrypted Data:', JSON.parse(decryptedString));
  //   // console.log('Decrypted Data:', JSON.parse(decryptedString));
  // }
  // encryptUsingNodeForge(data: string, keyBase64: string, ivHex: string): string {
  //   const keyBytes = forge.util.decode64(keyBase64); // Decode base64-encoded key
  //   const ivBytes = forge.util.hexToBytes(ivHex); // Convert hex IV to bytes

  //   const cipher = forge.cipher.createCipher('AES-CBC', keyBase64);
  //   cipher.start({ iv: ivBytes });
  //   cipher.update(forge.util.createBuffer(data, 'utf8'));
  //   cipher.finish();

  //   const encryptedBuffer = cipher.output;

  //   // Convert the encrypted buffer to a hexadecimal string
  //   const encryptedHex = forge.util.bytesToHex(encryptedBuffer.data);

  //   return encryptedHex;
  // }
  // closeExistingSocket() {
  //   this.keyPair = null;
  //   this.counter = 0;
  //   this.socket.closeSocket();
  // }


  // decryptString(data: any): any {

  //   try {
  //     const decryptedBuffer = forge.util.decode64(data);
  //     const decrypted = this.keyPair.privateKey.decrypt(decryptedBuffer);
  //     // console.log('decrypted buffer:', decrypted)
  //     return decrypted;
  //   } catch (error) {
  //     // console.error('Decryption error:', error);
  //     throw error;
  //   }
  // }
}