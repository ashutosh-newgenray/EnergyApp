import { EmailValidator } from './../../validators/email';
import { Http } from '@angular/http';
import { LaravelProvider } from './../../providers/laravel/laravel';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  public loginForm;
  emailChanged: boolean = false;
  passwordChanged: boolean = false;
  submitAttempt: boolean = false;
  database: any;
  internetConnected: boolean;
  connected: Subscription;
  disconnected: Subscription;
  client_secret:string = 'UhDETDVn2B88pkXNiI4zETsWwbc9sXGXYupAbHgb';
  client_id = 2;
  loading:any;
  visiblePass:boolean = false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public toast: ToastController,
    private network: Network,
    private formBuilder: FormBuilder,
    public laravel: LaravelProvider,
    public loadingCtrl: LoadingController,
    public http: Http,
    public storage: Storage) {
      this.loginForm = this.formBuilder.group({
        email:['', Validators.compose([Validators.required, EmailValidator.isValid])],
        password: ['',Validators.required]
      })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    this.connected = this.network.onConnect().subscribe(data => {
      this.internetConnected = true;
      this.displayNetworkUpdate(data.type);
    }, error => console.error(error));
    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.internetConnected = false;
      this.displayNetworkUpdate(data.type);
    }, error => console.error(error));
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }

  elementChanged(input){
    let field = input.ngControl.name;
    this[field + "Changed"] = true;
  }

  login(){
    this.submitAttempt = true;
    if (this.loginForm.valid){
      let credential = {
          username :this.loginForm.controls.email.value,
          password : this.loginForm.controls.password.value,
        };
        this.loading = this.loadingCtrl.create({
          content: 'Please wait...'
        });
        this.loading.present();
        this.http.post(this.laravel.getLoginApi(),{
          grant_type: 'password',
          client_id: 2,
          client_secret:this.client_secret,
          username:credential.username,
          password:credential.password,
          scope:'*'
        }).subscribe(res => {
          this.storage.set('mayfairEnergy_accessToken', res.json().token_type+' '+res.json().access_token)
            .then(
                data => {
                  this.laravel.setToken(res.json().token_type+' '+res.json().access_token);
                  this.loading.dismiss().then(()=>{
                    this.navCtrl.setRoot('HomePage');
                  });
                  
                },
                error => {
                  this.loading.dismiss();
                  this.toast.create({
                    message: 'Something went wrong. Please contact your app developer',
                    duration: 3000
                  }).present();
                }
          );
        },
      error => {
        console.log(error.json().message);
        this.loading.dismiss();
        let errorMsg = 'Something went wrong. Please contact your app developer';
        this.toast.create({
          message: (error.json().hasOwnProperty('message')) ? error.json().message:errorMsg ,
          duration:3000
        }).present();
      });
    }
  }

  goToResetPassword(){
    this.navCtrl.push('ResetPasswordPage');
  }

  displayNetworkUpdate(connectionState: string){
    let networkType = this.network.type
    this.toast.create({
      message: `You are now ${connectionState} via ${networkType}`,
      duration: 3000
    }).present();
  }

  
}
