import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { EmailValidator } from './../../validators/email';
import { LaravelProvider } from './../../providers/laravel/laravel';
import { Headers, Http } from '@angular/http';

/**
 * Generated class for the SiteDetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-site-details',
  templateUrl: 'site-details.html',
})
export class SiteDetailsPage {

  siteForm:any;
  site_id:any;
  siteDetails:any = {
    site: {
      client_id: '',
      site_name: '',
      contact_person: '',
      email: '',
      landline: '',
      mobile: '',
      address_1:'',
      address_2: '',
      city: '',
      region: '',
      country: '',
      postcode: '',
      comments: '',
      mpr: '',
      mpan_top_line: '',
      mpan_bottom_line: '',
      ldz: ''
    },
    electric: {
      supplier_id: '',
      contract_end_date: '',
      usages: '',
      smart_meter_installed: false
    },
    gas: {
      supplier_id: '',
      
      contract_end_date: '',
      usages: '',
      smart_meter_installed: false
    },
    siteDocs: []
  }
  clients:any = [];
  electricSuppliers:any = [];
  gasSuppliers:any = [];
  siteDocs:any = [];
  submitAttempt:boolean = false;
  clientChanged:boolean = false;
  site_nameChanged:boolean = false;
  contact_personChanged: boolean = false;
  emailChanged:boolean = false;
  mobileChanged:boolean = false;
  postcodeChanged: boolean = false;
  address_1Changed: boolean = false;
  countryChanged: boolean = false;
  mpan_bottom_lineChanged:boolean = false;
  mpan_top_lineChanged:boolean = false;
  mprChanged: boolean = false;
  electric_contract_end_dateChanged:boolean = false;
  electric_usagesChanged:boolean = false;
  gas_contract_end_dateChanged:boolean = false;
  gas_usagesChanged:boolean = false;
  clientAddress: any = {
    'postcode': '',
    'address_1': '',
    'address_2': '',
    'city': '',
    'region': '',
    'country': ''
  };
  loading:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public laravel:LaravelProvider,
    public toast: ToastController,
    public http:Http,
    private formBuilder: FormBuilder,
    public loadingCtrl: LoadingController
  ) {
    this.site_id = this.navParams.get('id');
    this.siteForm = this.formBuilder.group({
      client: ['', Validators.required],
      site_name: ['', Validators.required],
      contact_person: ['', Validators.required],
      email: ['', [Validators.required, EmailValidator.isValid]],
      landline: [''],
      mobile: [''],
      copy_address: false,
      postcode: ['', [Validators.required]],
      address_1:['',Validators.required],
      address_2:[''],
      city: [''],
      region: [''],
      country:['', Validators.required],
      comments: [''],
      electric_supplier:[''],
      mpan_top_line:['',[Validators.required]],
      mpan_bottom_line: ['',[Validators.required]],
      electric_contract_end_date: ['',[Validators.required]],
      electric_usages: ['',[Validators.required]],
      electric_smart_meter_installed: [''],
      gas_supplier:[''],
      mpr: ['',[Validators.required]],
      gas_contract_end_date: ['',[Validators.required]],
      gas_usages: ['',[Validators.required]],
      gas_smart_meter_installed: [''],
      ldz:['']
    });

    this.getSiteDetails();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SiteDetailsPage');
  }

  getSiteDetails() {
    let token:string = this.laravel.getToken();
    if(token){
      this.loading = this.loadingCtrl.create({
        content: 'Please Wait'
      });
      this.loading.present();
      let headers = new Headers();
      headers.append('Authorization', token);
      this.http.get(this.laravel.getOnlySiteFormData(),{
        headers: headers
      }).subscribe(response => {
        let siteFormData = response.json().siteFormData;
        this.gasSuppliers = siteFormData.gasSuppliers;
        this.electricSuppliers = siteFormData.electricitySuppliers;
        this.clients = siteFormData.clients;
      },
      error =>{
        this.loading.dismiss();
        this.toast.create({
          message: 'Something went wrong. Please contact your app developer',
          duration: 3000
        }).present();
      })
      this.http.get(this.laravel.getSiteDetailsApi() + '/' + this.site_id,{
        headers: headers
      }).subscribe(response => {
        this.siteDetails = response.json().siteDetails;
        this.siteDocs = this.siteDetails.siteDocs;
        this.siteForm.controls.client.setValue(this.siteDetails.site.client_id);
        this.siteForm.controls.site_name.setValue(this.siteDetails.site.site_name);
        this.siteForm.controls.contact_person.setValue(this.siteDetails.site.contact_person);
        this.siteForm.controls.email.setValue(this.siteDetails.site.email);
        this.siteForm.controls.landline.setValue(this.siteDetails.site.landline);
        this.siteForm.controls.mobile.setValue(this.siteDetails.site.mobile);
        this.siteForm.controls.postcode.setValue(this.siteDetails.site.postcode);
        this.siteForm.controls.address_1.setValue(this.siteDetails.site.address_1);
        this.siteForm.controls.address_2.setValue(this.siteDetails.site.address_2);
        this.siteForm.controls.city.setValue(this.siteDetails.site.city);
        this.siteForm.controls.region.setValue(this.siteDetails.site.region);
        this.siteForm.controls.country.setValue(this.siteDetails.site.country);
        this.siteForm.controls.comments.setValue(this.siteDetails.site.comments);
        this.siteForm.controls.mpan_top_line.setValue(this.siteDetails.site.mpan_top_line);
        this.siteForm.controls.mpan_bottom_line.setValue(this.siteDetails.site.mpan_bottom_line);
        this.siteForm.controls.mpr.setValue(this.siteDetails.site.mpr);
        this.siteForm.controls.ldz.setValue(this.siteDetails.site.ldz)
        if(this.siteDetails.electric){
          this.siteForm.controls.electric_supplier.setValue(this.siteDetails.electric.supplier_id);
          this.siteForm.controls.electric_contract_end_date.setValue(this.siteDetails.electric.contract_end_date);
          this.siteForm.controls.electric_usages.setValue(this.siteDetails.electric.usage);
          this.siteForm.controls.electric_smart_meter_installed.setValue(this.siteDetails.electric.smart_meter_installed ? true : false);
        }
        
        if(this.siteDetails.gas){
          this.siteForm.controls.gas_supplier.setValue(this.siteDetails.gas.supplier_id);
          this.siteForm.controls.gas_contract_end_date.setValue(this.siteDetails.gas.contract_end_date);
          this.siteForm.controls.gas_usages.setValue(this.siteDetails.gas.usage);
          this.siteForm.controls.gas_smart_meter_installed.setValue(this.siteDetails.gas.smart_meter_installed ? true : false);
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
  }

  save() {
    this.submitAttempt = true;
    if (this.siteForm.valid){
      let siteData = {
        id: this.site_id,
        client: this.siteForm.controls.client.value,
        site_name: this.siteForm.controls.site_name.value,
        contact_person: this.siteForm.controls.contact_person.value,
        email: this.siteForm.controls.email.value,
        landline: this.siteForm.controls.landline.value,
        mobile: this.siteForm.controls.mobile.value,
        copy_address: this.siteForm.controls.copy_address.value,
        postcode: this.siteForm.controls.postcode.value,
        address_1: this.siteForm.controls.address_1.value,
        address_2: this.siteForm.controls.address_2.value,
        city: this.siteForm.controls.city.value,
        region: this.siteForm.controls.region.value,
        country: this.siteForm.controls.country.value,
        comments: this.siteForm.controls.comments.value,
        electric_supplier: this.siteForm.controls.electric_supplier.value,
        mpan_top_line: this.siteForm.controls.mpan_top_line.value,
        mpan_bottom_line: this.siteForm.controls.mpan_bottom_line.value,
        electric_contract_end_date: this.siteForm.controls.electric_contract_end_date.value,
        electric_usage: this.siteForm.controls.electric_usages.value,
        electric_smart_meter_installed: this.siteForm.controls.electric_smart_meter_installed.value,
        gas_supplier: this.siteForm.controls.gas_supplier.value,
        mpr: this.siteForm.controls.mpr.value,
        gas_contract_end_date: this.siteForm.controls.gas_contract_end_date.value,
        gas_usage: this.siteForm.controls.gas_usages.value,
        gas_smart_meter_installed: this.siteForm.controls.gas_smart_meter_installed.value,
      }
      let headers = new Headers();
      let token:string = this.laravel.getToken();
      headers.append('Authorization', token);
      this.loading = this.loadingCtrl.create({
        content: 'Please Wait'
      });
      this.loading.present();
      this.http.post(this.laravel.getUpdateSiteApi(),siteData,{
        headers: headers
      }).subscribe(response=>{
        this.loading.dismiss();
        if(response.json().success){
          this.navCtrl.pop().then(()=>{
            this.navParams.get('parentPage').getSites()
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

  copyAddress(input) {
    if(input.checked){
      let client_id = this.siteForm.controls.client.value;
      if(client_id){
        let headers = new Headers();
        let token:string = this.laravel.getToken();
        headers.append('Authorization', token);
        this.loading = this.loadingCtrl.create({
          content: 'Please Wait'
        });
        this.loading.present();
        this.http.get(this.laravel.getClientAddress() + '/' + client_id,{
          headers: headers
        }).subscribe(response=>{
          this.loading.dismiss();
          this.clientAddress = response.json().clientAddress;
          this.siteForm.controls.postcode.setValue(this.clientAddress.postcode);
          this.siteForm.controls.address_1.setValue(this.clientAddress.address_1);
          this.siteForm.controls.address_2.setValue(this.clientAddress.address_2);
          this.siteForm.controls.city.setValue(this.clientAddress.city);
          this.siteForm.controls.region.setValue(this.clientAddress.region);
          this.siteForm.controls.country.setValue(this.clientAddress.country);
        },
        error=>{
          this.loading.dismiss();
          this.toast.create({
            message: 'Something went wrong. Please contact your app developer',
            duration: 3000
          }).present();
        });
      }
    }
  }

  elementChanged(input){
    let field = input.ngControl.name;
    this[field + "Changed"] = true;
  }
}
