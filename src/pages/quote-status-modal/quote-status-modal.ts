import { FormBuilder, Validators } from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { LaravelProvider } from './../../providers/laravel/laravel';
import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, ToastController, LoadingController } from 'ionic-angular';

/**
 * Generated class for the QuoteStatusModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-quote-status-modal',
  templateUrl: 'quote-status-modal.html',
})
export class QuoteStatusModalPage {
  quoteForm:any;
  quoteId:any;
  message:any;
  messageChanged:boolean = false;
  currentStatus:any;
  currentStatusChanged:boolean = false;
  submitAttempt:boolean = false;
  statuses:any;
  loading:any;

  constructor(public viewCtrl: ViewController, public navParams: NavParams,
  public laravel: LaravelProvider,
  public http:Http,
  public toast: ToastController,
  public loadingCtrl: LoadingController,
  private formBuilder: FormBuilder
  ) {
    this.quoteForm = this.formBuilder.group({
      'currentStatus': ['',Validators.required],
      'message': ['',Validators.required]
    });
    this.quoteId = this.navParams.get('id');
    this.getStatuses()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuoteStatusModalPage');
  }

  getStatuses(){
    let token:string = this.laravel.getToken();

    if(token){
      let headers = new Headers();
      headers.append('Authorization', token);

      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();

      this.http.get(this.laravel.getConstant()+ '/quote_status',{
        headers: headers
      }).subscribe(response => {
        this.loading.dismiss();
        this.statuses = response.json().constant;
      },
      error => {
        this.loading.dismiss();
        this.toast.create({
          message: 'Something went wrong. Please contact your app developer',
          duration: 3000
        }).present();
      });
    }
  }

  update(){
    this.submitAttempt = true;
    if(this.quoteForm.valid){
      let token:string = this.laravel.getToken();
      if(token && this.quoteId){
        let headers = new Headers();
        headers.append('Authorization', token);

        this.loading = this.loadingCtrl.create({
          content: 'Please wait...'
        });
        this.loading.present();

        let data = {
          status: this.quoteForm.controls.currentStatus.value,
          message: this.quoteForm.controls.message.value
        }

        this.http.post(this.laravel.getUpdateQuoteApi() + '/' + this.quoteId,data,{
          headers:headers
        }).subscribe((response)=>{
          this.loading.dismiss();
          if(response.json().success){
            this.viewCtrl.dismiss();
          }else{
            let errorMsg = 'Something went wrong. Please contact your app developer';
            this.toast.create({
              message: (response.json().hasOwnProperty('msg')) ? response.json().msg.join():errorMsg,
              duration: 3000
            }).present();  
          }
        })
      }
    }
  }

  close(){
    this.viewCtrl.dismiss();
  }

  elementChanged(input){
    let field = input.ngControl.name;
    this[field + "Changed"] = true;
  }

}
