import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
// import { PasswordValidator } from './../../validators/password';
import { EmailValidator } from './../../validators/email';
import { LaravelProvider } from './../../providers/laravel/laravel';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Headers, Http } from '@angular/http';
import { Camera } from '@ionic-native/camera';
import {
    ActionSheetController,
    AlertController,
    IonicPage,
    LoadingController,
    NavController,
    NavParams,
    ToastController,
} from 'ionic-angular';

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
  @ViewChild('documentUpload') documentUpload: ElementRef;

  clientForm:any; 
  client_id:any;
  clientDetails:any = { client:{
      name:'',
      address_1:'',
      address_2:'',
      address_3:'',
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
  /*passwordChanged:boolean = false;
  confirmPasswordChanged:boolean = false;*/
  address_1Changed:boolean = false;
  postcodeChanged:boolean = false;  
  countryChanged:boolean = false;
  submitAttempt:boolean = false;
  loading:any;
  logo: string = 'assets/images/blank.png';

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public laravel:LaravelProvider,
  public toast: ToastController,
  public http:Http,
  private formBuilder: FormBuilder,
  private camera: Camera,
  public loadingCtrl: LoadingController,
  public actionSheetCtrl: ActionSheetController,
  private transfer: FileTransfer,
  private alertCtrl: AlertController
  ) {
    this.client_id = this.navParams.get('id');
    this.clientForm = this.formBuilder.group({
          name:['',Validators.required],
          uid:['', Validators.required],
          company_status:[''],
          email:['', Validators.compose([Validators.required, EmailValidator.isValid])],
          /*approved:[{value:false,disabled:true}],
          user_active:[''],*/
          logo:[''],
          address_1: ['',Validators.required],
          address_2: [''],
          address_3: [''],
          city: [''],
          region: [''],
          postcode: ['',Validators.required],
          country: ['',Validators.required],
          /*resetPassword:[false],
          passwordGroup: this.formBuilder.group({
            password: [''],
            confirmPassword: ['']
          })*/
      });
    this.getClientDetails();
    /*this.subscribeResetPasswordChanges();*/
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientDetailsPage');
  }

  /*subscribeResetPasswordChanges(){
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
  }*/

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
      /*this.clientDetails.client.approved = (this.clientDetails.client.approved === "1") ? true: false;
      this.clientDetails.user_info.active = (this.clientDetails.user_info.active === "1") ? true: false;*/
      this.clientForm.controls.name.setValue(this.clientDetails.client.name);
      this.clientForm.controls.uid.setValue(this.clientDetails.client.uid);
      this.clientForm.controls.company_status.setValue(this.clientDetails.client.company_status);
      this.clientForm.controls.email.setValue(this.clientDetails.client.email);
      /*this.clientForm.controls.approved.setValue(this.clientDetails.client.approved);
      this.clientForm.controls.user_active.setValue(this.clientDetails.user_info.active);*/
      this.clientForm.controls.address_1.setValue(this.clientDetails.client.address_1);
      this.clientForm.controls.address_2.setValue(this.clientDetails.client.address_2);
      this.clientForm.controls.address_3.setValue(this.clientDetails.client.address_3);
      this.clientForm.controls.city.setValue(this.clientDetails.client.city);
      this.clientForm.controls.region.setValue(this.clientDetails.client.region);
      this.clientForm.controls.postcode.setValue(this.clientDetails.client.postcode);
      this.clientForm.controls.country.setValue(this.clientDetails.client.country);
      if(this.clientDetails.client.logo){
        this.logo = this.laravel.getImageUrl(this.clientDetails.client.logo);
      }
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
        content: 'Checking Client Reg. No...'
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
              message: 'This client Reg. number already exists. Please check again',
              duration: 3000
            }).present();
            this.clientForm.controls.uid.setErrors({'Client Reg number already exists': true});
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
    this.navCtrl.push('SiteCreatePage',{
      'id': this.client_id, 
      'email': this.clientDetails.client.email,
      'postcode': this.clientDetails.client.postcode,
      'address_1': this.clientDetails.client.address_1,
      'address_2': this.clientDetails.client.address_2,
      'address_3': this.clientDetails.client.address_3,
      'city': this.clientDetails.client.city,
      'region': this.clientDetails.client.region,
      'country': this.clientDetails.client.country,
    });
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
        /*approved: this.clientForm.controls.approved.value,
        active: this.clientForm.controls.user_active.value,*/
        address_1: this.clientForm.controls.address_1.value,
        address_2: this.clientForm.controls.address_2.value,
        address_3: this.clientForm.controls.address_3.value,
        city: this.clientForm.controls.city.value,
        region: this.clientForm.controls.region.value,
        postcode: this.clientForm.controls.postcode.value,
        country: this.clientForm.controls.country.value,
        /*reset_password: this.clientForm.controls.resetPassword.value,
        password: this.clientForm.controls.passwordGroup.controls.password.value,*/
        id: this.client_id,
        logo: (this.logo == 'assets/images/blank.png')? '': this.clientForm.controls.logo.value
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
            this.navParams.get('parentPage').getData()
          });
        }else{
          let errorMsg = 'Something went wrong. Please contact your app developer';
          if(response.json().hasOwnProperty('msg')){
            if(response.json().msg instanceof String){
              errorMsg = response.json().msg
            }else{
              errorMsg = response.json().msg.join();
            }
          }
          this.toast.create({
            message: errorMsg,
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

  uploadDocument($event){
    
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Upload Documents',
      buttons: [
        {
          text: 'Take Picture',
          handler: () => {
            this.camera.getPicture().then((imageData)=>{
              this.uploadDoc(imageData);
            },(err) => {
              this.toast.create({
                message: 'Something went wrong. Please contact your app developer',
                duration:3000
              });
            });
          }
        },
        {
          text: 'From Saved Files',
          handler: () =>{
            this.documentUpload.nativeElement.click();
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

  uploadInputDoc(fileInput: any){
    var file = fileInput.target.files[0];    
    let fd = new FormData();
    fd.append("file", file);
    let alert = this.alertCtrl.create({
      title: 'Document\'s Name',
      inputs: [
        {
          name: 'file_name',
          placeholder: 'Name of the Document'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            this.documentUpload.nativeElement.value = '';
          }
        },
        {
          text: 'Submit',
          handler: data => {
            this.loading = this.loadingCtrl.create({
              content:'Please Wait'
            });
            fd.append('file_name',data.file_name);
            this.loading.present();
            let headers = new Headers();
            let token:string = this.laravel.getToken();
            headers.append('Authorization', token);
            this.http.post(this.laravel.uploadDoc() + '/' + this.client_id,fd,{
              headers:headers
            }).subscribe(response=>{
              this.loading.dismiss();
              if(response.json().success){
                this.clientDetails.docs = response.json().docs;
              }
              return true;
            }
            ,error => {
              this.loading.dismiss();
              return false;
            });        
          }
        }
      ],
      enableBackdropDismiss: false,
    });
    alert.present();
  }

  uploadDoc(file){
    let alert = this.alertCtrl.create({
      title: 'Document\'s Name',
      inputs: [
        {
          name: 'file_name',
          placeholder: 'Name of the Document'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            this.documentUpload.nativeElement.value = '';
          }
        },
        {
          text: 'Submit',
          handler: data => {
            this.loading = this.loadingCtrl.create({
              content: 'Uploading File..'
            });
            this.loading.present();
            let token:string = this.laravel.getToken();
            const fileTransfer: FileTransferObject  = this.transfer.create();
            let options1: FileUploadOptions = {
              fileKey: 'document',
              fileName: 'doc.jpg',
              headers:{'Authorization':token},
              chunkedMode: false,
              params: {'file_name':data.file_name}
            }
            fileTransfer.upload(file, this.laravel.uploadDoc() + '/' + this.client_id, options1)
            .then((data)=> {
              this.loading.dismiss();
              let response = JSON.parse(data.response);
              if(response.success){
                this.clientDetails.docs = response.docs;
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
      ],
      enableBackdropDismiss: false,
    });
    alert.present();
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
    });
  }

  openCamera() {
    var options = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      saveToPhotoAlbum:true
    };
    this.camera.getPicture(options).then((imageData)=>{
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
        this.logo = this.laravel.getImageUrl(response.filename);
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
