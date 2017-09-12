import { Http } from '@angular/http';
import { LaravelProvider } from './../../providers/laravel/laravel';
import { Component } from '@angular/core';
import { PasswordValidator } from './../../validators/password';
import { EmailValidator } from './../../validators/email';
import { FormBuilder, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';

/**
 * Generated class for the ResetPasswordPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {

  loading:any;
  resetForm:any;
  emailChanged:boolean = false;
  passwordChanged:boolean = false;
  confirmPasswordChanged:boolean = false;
  submitAttempt:boolean = false;
  token:any = false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    public http: Http,
    public laravel: LaravelProvider, 
    public toast: ToastController,
    public loadingCtrl: LoadingController) {
      this.resetForm = this.formBuilder.group({
        email:[{value:'',disabled: this.token}, Validators.compose([Validators.required, EmailValidator.isValid])],
        token:[''],
        passwordGroup: this.formBuilder.group({
          password: [''],
          confirmPassword: ['']
        })
      });
      this.subscribeTokenChange();
  }

  subscribeTokenChange() {
    const tokenCtrl = (<any>this.resetForm).controls.token;
    const pwGrp = (<any>this.resetForm).controls.passwordGroup;
    const pwCtrl = (<any>this.resetForm).controls.passwordGroup.controls.password;
    const cpwCtrl = (<any>this.resetForm).controls.passwordGroup.controls.confirmPassword;
    const emailCtrl = (<any>this.resetForm).controls.email;

    const changes$ = tokenCtrl.valueChanges;

    changes$.subscribe(tokenValue => {
      if(tokenValue != ''){
        
        pwGrp.setValidators(PasswordValidator.MatchPassword);
        pwCtrl.setValidators(Validators.required);
        cpwCtrl.setValidators(Validators.required);
        pwCtrl.updateValueAndValidity();
        cpwCtrl.updateValueAndValidity();
        emailCtrl.updateValueAndValidity();
        console.log(emailCtrl.valid);
      }else{
        pwGrp.setValidators([]);
        pwCtrl.setValidators([]);
        cpwCtrl.setValidators([]);
        pwCtrl.updateValueAndValidity();
        cpwCtrl.updateValueAndValidity();
        emailCtrl.updateValueAndValidity();
      }
    });

  }

  elementChanged(input){
    let field = input.ngControl.name;
    this[field + "Changed"] = true;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResetPasswordPage');
  }

  reset(){
    if(this.resetForm.controls.token.value != ''){
      this.resetPassword();
    }else{
      this.getToken();
    }
  }

  resetPassword() {
    this.submitAttempt = true;
    if (this.resetForm.valid){
   
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      this.http.post(this.laravel.getApiResetPasspord(),{
        email: this.resetForm.controls.email.value,
        token: this.resetForm.controls.token.value,
        password: this.resetForm.controls.passwordGroup.controls.password.value,
        password_confirmation: this.resetForm.controls.passwordGroup.controls.confirmPassword.value
      }).subscribe(response => {
        this.loading.dismiss();
        this.toast.create({
          message: response.json().message,
          duration: 3000
        }).present().then(()=>{
          this.navCtrl.pop();
        });
      },
      error => {
        this.loading.dismiss();
        this.toast.create({
          message: error.json().message,
          duration: 3000
        }).present();
      });
    }
  }

  getToken() {
    this.submitAttempt = true;
    if (this.resetForm.valid){
      let email = this.resetForm.controls.email.value;
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      this.http.post(this.laravel.getResetPasswordToken(),{email:email}).subscribe(response => {
        this.loading.dismiss();
        this.resetForm.controls.token.setValue(response.json().token);
        this.submitAttempt = false;
        this.token = true;
      },
      error =>{
        this.token = false;
        this.loading.dismiss();
        this.toast.create({
          message: error.json().message,
          duration: 3000
        }).present();
      });
    }
  }
}
