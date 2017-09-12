import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { PasswordValidator } from './../../validators/password';
import { EmailValidator } from './../../validators/email';
import { LaravelProvider } from './../../providers/laravel/laravel';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Headers, Http } from '@angular/http';
import { Camera } from '@ionic-native/camera';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, ActionSheetController  } from 'ionic-angular';

/**
 * Generated class for the ClientDetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-client-details',
  templateUrl: 'client-details.html',
})
export class ClientDetailsPage {
  clientForm:any;
  client_id:any;
  clientDetails:any = { client:{
      name:'',
      address_1:'',
      address_2:'',
      approved:'',
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
    docs:[],
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
  public laravel:LaravelProvider,
  public toast: ToastController,
  public http:Http,
  private formBuilder: FormBuilder,
  private camera: Camera,
  public loadingCtrl: LoadingController,
  public actionSheetCtrl: ActionSheetController,
  private transfer: FileTransfer
  ) {
    this.client_id = this.navParams.get('id');
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
          resetPassword:[false],
          passwordGroup: this.formBuilder.group({
            password: [''],
            confirmPassword: ['']
          })
      });
    this.getClientDetails();
    this.subscribeResetPasswordChanges();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientDetailsPage');
  }

  subscribeResetPasswordChanges(){
    const rpCtrl = (<any>this.clientForm).controls.resetPassword;
    const pwGrp = (<any>this.clientForm).controls.passwordGroup;
    const pwCtrl = (<any>this.clientForm).controls.passwordGroup.controls.password;
    const cpwCtrl = (<any>this.clientForm).controls.passwordGroup.controls.confirmPassword;
    
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

  getClientDetails(){
    this.loading = this.loadingCtrl.create({
      content: 'Please Wait'
    });
    this.loading.present();
    let headers = new Headers();
    let token:string = this.laravel.getToken();
    headers.append('Authorization', token);

    this.http.get(this.laravel.getConstant()+ '/company_status',{
      headers: headers
    }).subscribe(response => {
      this.company_statuses = response.json().constant;
    },
    error => {
      this.loading.dismiss();
      this.toast.create({
        message: 'Something went wrong. Please contact your app developer',
        duration: 3000
      }).present();
    });

    this.http.get(this.laravel.getClientDetailsApi() + '/' + this.client_id,{
      headers: headers
    }).subscribe(response =>{
      this.clientDetails = response.json().clientDetails;
      this.clientDetails.client.approved = (this.clientDetails.client.approved === "1") ? true: false;
      this.clientDetails.user_info.active = (this.clientDetails.user_info.active === "1") ? true: false;
      this.clientForm.controls.name.setValue(this.clientDetails.client.name);
      this.clientForm.controls.uid.setValue(this.clientDetails.client.uid);
      this.clientForm.controls.company_status.setValue(this.clientDetails.client.company_status);
      this.clientForm.controls.email.setValue(this.clientDetails.client.email);
      this.clientForm.controls.approved.setValue(this.clientDetails.client.approved);
      this.clientForm.controls.user_active.setValue(this.clientDetails.user_info.active);
      this.clientForm.controls.address_1.setValue(this.clientDetails.client.address_1);
      this.clientForm.controls.address_2.setValue(this.clientDetails.client.address_2);
      this.clientForm.controls.city.setValue(this.clientDetails.client.city);
      this.clientForm.controls.region.setValue(this.clientDetails.client.region);
      this.clientForm.controls.postcode.setValue(this.clientDetails.client.postcode);
      this.clientForm.controls.country.setValue(this.clientDetails.client.country);
      this.logo = this.laravel.getImageUrl(this.clientDetails.client.logo);
      this.loading.dismiss();
    },
    error => {
      this.loading.dismiss();
      this.toast.create({
        message: 'Something went wrong. Please contact your app developer',
        duration: 3000
      }).present();
    });
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

  goToCreateSitePage(){
    this.navCtrl.push('SiteCreatePage',{'id': this.client_id});
  }

  goToClientCreatePage(){
    this.navCtrl.push('ClientCreatePage');
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
        reset_password: this.clientForm.controls.resetPassword.value,
        password: this.clientForm.controls.passwordGroup.controls.password.value,
        id: this.client_id,
        logo: (this.logo == 'assets/images/no_image_available.png')? '': this.clientForm.controls.logo.value
      }

      let headers = new Headers();
      let token:string = this.laravel.getToken();
      headers.append('Authorization', token);
      this.loading = this.loadingCtrl.create({
        content: 'Please Wait'
      })
      this.loading.present();
      this.http.post(this.laravel.getUpdateClientApi(),clientData,{
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
      this.toast.create({
        message: 'Please fill all required fields',
        duration: 3000
      }).present();
    }
  }

  uploadDocument(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Documents',
      buttons: [
        {
          text: 'Take Picture',
          handler: () => {

          }
        },
        {
          text: 'Cancel',
          role:'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  takePicture(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Pick logo',
      buttons: [{
        text: 'From Gallery',
        handler: () => {
          this.openGallery();
        }
      },{
        text: 'From Camera',
        handler: () => {
          this.openCamera();
        }
      },{
        text: 'Cancel',
        role: 'cancel',
      }]
    });
    actionSheet.present();
    /*this.camera.getPicture({
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
    });*/
  }

  openGallery() {
    var options = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI
    };
    this.camera.getPicture(options).then((imageData) => {
      this.uploadImage(imageData);
    },(err) => {
      this.toast.create({
        message: 'Something went wrong. Please contact your app developer',
        duration:3000
      });
    })
  }

  openCamera() {
    this.camera.getPicture().then((imageData)=>{
      this.uploadImage(imageData);
    },(err) => {
      this.toast.create({
        message: 'Something went wrong. Please contact your app developer',
        duration:3000
      });
    })
  }

  uploadImage(fileUrl) {
    this.loading = this.loadingCtrl.create({
      content: 'Uploading File..'
    });
    this.loading.present();
    let token:string = this.laravel.getToken();
    const fileTransfer: FileTransferObject  = this.transfer.create();
    let options1: FileUploadOptions = {
      fileKey: 'image_upload_file',
      fileName: 'logo.jpg',
      headers:{'Authorization':token},
      chunkedMode: false,
    }
    fileTransfer.upload(fileUrl, this.laravel.uploadLogo(), options1)
    .then((data)=> {
      this.loading.dismiss();
      let response = JSON.parse(data.response);
      if(response.success){
        this.clientForm.controls.logo.setValue(response.filename);
        this.logo = fileUrl;
      }else{
        this.toast.create({
          message: 'Sorry we are experiencing some issue while uploading logo. Please contact your app developer',
          duration:3000
        });  
      }
    },(err) => {
      this.loading.dismiss();
      this.toast.create({
        message: 'Something went wrong. Please contact your app developer',
        duration:3000
      });
    });
  }
}
