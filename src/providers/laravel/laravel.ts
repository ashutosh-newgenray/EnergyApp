import { LoadingController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/map';

/*
  Generated class for the LaravelProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class LaravelProvider {

  url:string = 'http://portal.mayfairtech.co.uk/';
  token:string = '';
  loading:any;
  isProduction:boolean = true; 

  constructor(public http: Http, public loadingCtrl: LoadingController) {
    console.log('Hello LaravelProvider Provider');
  }

  getUrl(){
    return (this.isProduction)?'http://portal.mayfairenergy.co.uk/':'http://mayfairenergy.loc/';
  }

  getResetPasswordToken(){ 
    return this.getUrl() + 'api/password/email';
  }

  getApiResetPasspord(){
    return this.getUrl() + 'api/password/reset';
  }

  getLoginApi(){
    return this.getUrl() + 'oauth/token';
  }

  getClientApi(){
    return this.getUrl() + 'api/get/clients';
  }

  getClientDetailsApi(){
    return this.getUrl() + 'api/get/clientDetails';
  }

  getConstant(){
    return this.getUrl() + 'api/get/constant';
  }

  getUpdateClientApi(){
    return this.getUrl() + 'api/client/update';
  }

  getCreateClientApi(){
    return this.getUrl() + 'api/client/create';
  }

  getSiteApi(){
    return this.getUrl() + 'api/get/sites';
  }

  getSiteDetailsApi(){
    return this.getUrl() + 'api/get/siteDetails';
  }

  getUpdateSiteApi(){
    return this.getUrl() + 'api/site/update';
  }

  getOnlySiteFormData(){
    return this.getUrl() + 'api/site/onlySiteForm';
  }

  getCreateSiteApi(){
    return this.getUrl() + 'api/site/create';
  }

  getClientAddress(){
    return this.getUrl() + 'api/get/clientAddress'
  }

  getQuoteApi() {
    return this.getUrl() + 'api/get/quotes';
  }

  getAllDataQuoteApi() {
    return this.getUrl() + 'api/get/allDataQuote';
  }

  generateQuote() {
    return this.getUrl() + 'api/generate/quote';
  }

  getAllDataQuoteDetailApi() {
    return this.getUrl() + 'api/quote/show';
  }

  getUpdateQuoteApi() {
    return this.getUrl() + 'api/quote/status/update';
  }

  getDownloadQuotePDF() {
    return this.getUrl() + 'api/quote/download/pdf';
  }
  
  getUserDetails(){
    return this.getUrl() + 'api/get/user/profile';
  }

  updateUserDetails() {
    return this.getUrl() + 'api/update/user/profile'
  }

  getAllStatistics(){
    return this.getUrl() + 'api/getAllStatistics'
  }

  getApilogout(){
    return this.getUrl() + 'api/logout';
  }
  
  setToken(val){
    this.token = val;
  }

  getToken(){
    return this.token;
  }

  removeToken(){
    this.token = '';
  }

  startLoading(msg = 'Please wait...'){
    this.loading = this.loadingCtrl.create({
          content: msg
    });
    this.loading.present();
  }

  getImageUrl(img){
    return this.getUrl() + 'storage/' + img;
  }

  getFileUrl(link){
    return this.getUrl() + link;
  }

  uploadLogo(){
    return this.getUrl() + 'api/uploadClientLogo';
  }

  uploadDoc(){
    return this.getUrl() + 'api/uploadClientDoc';
  }

  uploadSiteDoc() {
    return this.getUrl() + 'api/uploadSiteDoc';
  }

  closeLoading(){
    this.loading.dismiss();
  }

  checkUidExist(){
    return this.getUrl() + 'api/checkUidExist'
  }

  getCheckToken() {
    return this.getUrl() + 'api/checkToken';
  }

}
