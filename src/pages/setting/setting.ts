import { PasswordValidator } from './../../validators/password';
import { EmailValidator } from './../../validators/email';
import { LaravelProvider } from './../../providers/laravel/laravel';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Headers, Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';

/**
 * Generated class for the SettingPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  settingForm:any;
  loading:any;
  nameChanged:boolean = false;
  emailChanged:boolean = false;
  submitAttempt:boolean = false;
  passwordChanged:boolean = false;
  confirmPasswordChanged:boolean = false;
  userData:any = {
    name: '',
    email: '',
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public laravel:LaravelProvider,
  public toast: ToastController,
  public http:Http,
  private formBuilder: FormBuilder,
  public loadingCtrl: LoadingController,
  public storage: Storage
  ) {
    this.settingForm = this.formBuilder.group({
      name:['',Validators.required],
      email:['', Validators.compose([Validators.required, EmailValidator.isValid])],
      resetPassword:[false],
      passwordGroup: this.formBuilder.group({
        password: [''],
        confirmPassword: ['']
      })
    });
    this.getUserDetails();
    this.subscribeResetPasswordChanges();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingPage');
  }

  elementChanged(input){
    let field = input.ngControl.name;
    this[field + "Changed"] = true;
  }

  getUserDetails(){
    let token:string = this.laravel.getToken();
    if(token){
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      let headers = new Headers();
      headers.append('Authorization', token);
      this.http.get(this.laravel.getUserDetails(),{
        headers: headers
      }).subscribe((response)=>{
        this.userData = response.json().user;
        this.settingForm.controls.name.setValue(this.userData.name);
        this.settingForm.controls.email.setValue(this.userData.email);
        this.loading.dismiss();
      },
      (error) =>{
        this.loading.dismiss();
        this.toast.create({
          message: 'Something went wrong. Please contact your app developer',
          duration: 3000
        }).present();
      });
    }else{
      this.navCtrl.setRoot('LoginPage');
    }
  }

  subscribeResetPasswordChanges(){
    const rpCtrl = (<any>this.settingForm).controls.resetPassword;
    const pwGrp = (<any>this.settingForm).controls.passwordGroup;
    const pwCtrl = (<any>this.settingForm).controls.passwordGroup.controls.password;
    const cpwCtrl = (<any>this.settingForm).controls.passwordGroup.controls.confirmPassword;
    
    const changes$ = rpCtrl.valueChanges;

    changes$.subscribe(resetPasswordValue => {
      if(resetPasswordValue){
        pwGrp.setValidators(PasswordValidator.MatchPassword);
        pwCtrl.setValidators(Validators.required);
        cpwCtrl.setValidators(Validators.required);
        pwCtrl.updateValueAndValidity();
        cpwCtrl.updateValueAndValidity();
      }else{
        pwGrp.setValidators([]);
        pwCtrl.setValidators([]);
        cpwCtrl.setValidators([]);
        pwCtrl.updateValueAndValidity();
        cpwCtrl.updateValueAndValidity();
      }
    });
  }

  save(){
    this.submitAttempt = true;
    if (this.settingForm.valid){
      let userDataPost = {
        name: this.settingForm.controls.name.value,
        email: this.settingForm.controls.email.value,
        reset_password: this.settingForm.controls.resetPassword.value,
        password: this.settingForm.controls.passwordGroup.controls.password.value,
        password_confirmation: this.settingForm.controls.passwordGroup.controls.confirmPassword.value
      }
      let token:string = this.laravel.getToken();
      if(token){
        this.loading = this.loadingCtrl.create({
          content: 'Please wait...'
        });
        this.loading.present();
        let headers = new Headers();
        headers.append('Authorization', token);
        this.http.post(this.laravel.updateUserDetails(),userDataPost,{
          headers: headers
        }).subscribe(response=>{
          this.loading.dismiss().then(()=>{
            if(response.json().success){
              this.navCtrl.pop();
            }else{
              let errorMsg = 'Something went wrong. Please contact your app developer';
              this.toast.create({
                message: (response.json().hasOwnProperty('msg')) ? response.json().msg.join():errorMsg,
                duration: 3000
              }).present();  
            }
          });
        },
        error=>{
          this.loading.dismiss().then(()=>{
            this.toast.create({
              message: 'Something went wrong. Please contact your app developer',
              duration: 3000
            }).present();
          });
        });
      }
    }
  }

  logout() {
    let token:string = this.laravel.getToken();
    if(token){
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      let headers = new Headers();
      headers.append('Authorization', token);
      this.http.post(this.laravel.getApilogout(),{},{
        headers: headers
      }).subscribe(response=>{
        this.loading.dismiss().then(()=>{
          if(response.json().success){
            this.storage.remove('userTokenInfo').then(()=>{
              this.laravel.removeToken();
              this.navCtrl.setRoot('LoginPage');
            });
          }else{
            let errorMsg = 'Something went wrong. Please contact your app developer';
            this.toast.create({
              message: (response.json().hasOwnProperty('msg')) ? response.json().msg.join():errorMsg,
              duration: 3000
            }).present();  
          }
        });
      },error => {
        this.loading.dismiss().then(()=>{
          this.toast.create({
            message: 'Something went wrong. Please contact your app developer',
            duration: 3000
          }).present();
        });
      })
    }
  }

}
