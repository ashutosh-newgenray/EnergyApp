import { FormBuilder, Validators } from '@angular/forms';
import { Headers,Http } from '@angular/http';
import { LaravelProvider } from './../../providers/laravel/laravel';
import { PasswordValidator } from './../../validators/password';
import { EmailValidator } from './../../validators/email';
import { Component } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';

/**
 * Generated class for the ClientCreatePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-client-create',
  templateUrl: 'client-create.html',
})
export class ClientCreatePage {

  clientForm:any;
  clientDetails:any = { client:{
      name:'',
      address_1:'',
      address_2:'',
      approved:false,
      city:'',
      comments:'',
      company_status:'',
      country:'',
      created_at:'',
      deleted_at:'',
      email:'',
      id:'',
      logo:'',
      phone:'',
      postcode:'',
      region:'',
      uid:'',
      updated_at:'',
      user_id:''
    },
    user_info:{
      active:'',
      created_at:'',
      deleted_at:'',
      email:'',
      id: '',
      name: '',
      updated_at: ''
    }
  };
  company_statuses:any;
  nameChanged:boolean = false;
  uidChanged:boolean = false;
  emailChanged:boolean = false;
  passwordChanged:boolean = false;
  confirmPasswordChanged:boolean = false;
  address_1Changed:boolean = false;
  postcodeChanged:boolean = false;  
  countryChanged:boolean = false;
  submitAttempt:boolean = false;
  loading:any;
  logo: string = 'assets/images/no_image_available.png';

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public laravel: LaravelProvider,
    public toast: ToastController,
    public http: Http,
    private formBuilder: FormBuilder,
    private camera: Camera,
    public loadingCtrl: LoadingController,
  ) {
    this.clientForm = this.formBuilder.group({
          name:['',Validators.required],
          uid:['', Validators.required],
          company_status:[''],
          email:['', Validators.compose([Validators.required, EmailValidator.isValid])],
          approved:[{value:false,disabled:true}],
          user_active:[''],
          logo:[''],
          address_1: ['',Validators.required],
          address_2: [''],
          city: [''],
          region: [''],
          postcode: ['',Validators.required],
          country: ['',Validators.required],
          passwordGroup: this.formBuilder.group({
            password: ['',Validators.required],
            confirmPassword: ['',Validators.required]
          },PasswordValidator.MatchPassword)
      });
      this.getCompanyStatus();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientCreatePage');
  }

  elementChanged(input){
    let field = input.ngControl.name;
    this[field + "Changed"] = true;
    if(field == "uid" ){
      this.loading = this.loadingCtrl.create({
        content: 'Checking Client reference...'
      });
      this.loading.present();
      let token:string = this.laravel.getToken();
      if(token){
        let headers = new Headers();  
        headers.append('Authorization', token);  
        this.http.get(this.laravel.checkUidExist()+'/' + this.clientForm.controls.uid.value,{
          headers: headers
        }).subscribe(response=> {
          this.loading.dismiss();
          console.log(response);
          if(response.json().success){
            this.toast.create({
              message: 'This client Reference already exists. Please check client reference again',
              duration: 3000
            }).present();
            this.clientForm.controls.uid.setErrors({'Client reference already exists': true});
          }else{
            this.clientForm.controls.uid.setErrors(null);
          }
        },error => {
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
  }

  getCompanyStatus(){
    let token:string = this.laravel.getToken();
    if(token){
      let headers = new Headers();  
      headers.append('Authorization', token);
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      this.http.get(this.laravel.getConstant()+ '/company_status',{
        headers: headers
      }).subscribe(response => {
        this.loading.dismiss();
        this.company_statuses = response.json().constant;
      },
      error => {
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

  save(){
    this.submitAttempt = true;
    if (this.clientForm.valid){
      let clientData = {
        name: this.clientForm.controls.name.value,
        uid: this.clientForm.controls.uid.value,
        company_status: this.clientForm.controls.company_status.value,
        email: this.clientForm.controls.email.value,
        approved: this.clientForm.controls.approved.value,
        active: this.clientForm.controls.user_active.value,
        address_1: this.clientForm.controls.address_1.value,
        address_2: this.clientForm.controls.address_2.value,
        city: this.clientForm.controls.city.value,
        region: this.clientForm.controls.region.value,
        postcode: this.clientForm.controls.postcode.value,
        country: this.clientForm.controls.country.value,
        password: this.clientForm.controls.passwordGroup.controls.password.value,
        password_confirmation: this.clientForm.controls.passwordGroup.controls.confirmPassword.value,
        logo: (this.logo == 'assets/images/no_image_available.png')? '': this.logo
      }
      let token:string = this.laravel.getToken();
      if(token){
        let headers = new Headers();
        headers.append('Authorization', token);
        this.loading = this.loadingCtrl.create({
          content: 'Please wait...'
        });
        this.loading.present();
        this.http.post(this.laravel.getCreateClientApi(),clientData,{
          headers: headers
        }).subscribe(response=>{
          this.loading.dismiss();
          if(response.json().success){
            this.navCtrl.pop().then(()=>{
              this.navParams.get('parentPage').getClients()
            });
          }else{
            this.toast.create({
              message: response.json().msg.join(),
              duration: 3000
            }).present();  
          }
        },
        error=>{
          this.loading.dismiss();
          this.toast.create({
            message: 'Something went wrong. Please contact your app developer',
            duration: 3000
          }).present();
        });
      }else{
        this.navCtrl.setRoot('LoginPage');
      }
    }else{
      this.toast.create({
        message: 'Please fill all required fields',
        duration: 3000
      }).present();
    }
  }

  takePicture(){
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000
    }).then((imageData) => {
      this.logo = "data:image/jpeg;base64," + imageData;
    },(err) => {
      this.toast.create({
        message: 'Something went wrong. Please contact your app developer',
        duration:3000
      })
    });
  }

}
