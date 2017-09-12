import { Http, Headers } from '@angular/http';
import { LaravelProvider } from './../../providers/laravel/laravel';
import { Component } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { IonicPage, NavController, NavParams, ToastController, ModalController, LoadingController } from 'ionic-angular';

/**
 * Generated class for the QuoteDetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-quote-details',
  templateUrl: 'quote-details.html',
})
export class QuoteDetailsPage {
  quote_id:any;
  quote:any = {};
  site:any = {};
  quoteSupplier:any = {};
  supplier: any = {};
  usages:any = {usages:{},meterType:{}};
  quote_statuses: any = {};
  loading:any;
  fileTransfer: FileTransferObject;
  dnos:any = [];
  ldz:any = [];
  pdfUlr:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public laravel: LaravelProvider,
  public http:Http,
  public toast: ToastController,
  public loadingCtrl: LoadingController,
  public modalCtrl: ModalController,
  private transfer: FileTransfer,
  private file: File
  ) {
    this.quote_id = this.navParams.get('id');
    this.getAllData();
    this.fileTransfer = this.transfer.create();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuoteDetailsPage');
  }

  getAllData(){
    
    let token:string = this.laravel.getToken();

    if(token && this.quote_id){
      let headers = new Headers();
      headers.append('Authorization', token);

      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();

      this.http.get(this.laravel.getAllDataQuoteDetailApi() + '/' + this.quote_id ,{
        headers: headers
      }).subscribe(response => {
        if(response.json().success){
          this.quote = response.json().quote;
          this.site = response.json().site;
          this.quoteSupplier = response.json().quoteSupplier;
          this.supplier = response.json().supplier;
          this.usages = response.json().usages;
          this.dnos = response.json().dnos;
          this.ldz = response.json().ldz
          this.loading.dismiss();
        }else{
          this.loading.dismiss();
          this.toast.create({
            message: 'Something went wrong. Please contact your app developer',
            duration: 3000
          }).present();
        }
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

  downloadPDF(url,filename){
    let token:string = this.laravel.getToken();
    if(token){
      let headers = new Headers();
      headers.append('Authorization', token);
      this.loading = this.loadingCtrl.create({
        content: 'Loading'
      });
      this.loading.present();
      this.http.get(this.laravel.getDownloadQuotePDF() + '/' + this.quote_id,{
        headers: headers
      }).subscribe(response=>{
        this.loading.dismiss();
        if(response.json().success){
          let url = this.laravel.getFileUrl(response.json().download_link);
          let filename = "Quote-" + this.quote_id + ".pdf";
          console.log(filename);
          this.fileTransfer.download(url, this.file.dataDirectory + filename ).then((entry) => {
            console.log( JSON.stringify(entry));
            this.toast.create({
              message: 'Download Completed. Please check the file in Downloads!',
              duration: 3000
            }).present();
          },(error) => {
            console.log( JSON.stringify(error));
            this.toast.create({
              message: 'Something went wrong. Please contact your app developer',
              duration: 3000
            }).present();
          });
        }else{
          this.toast.create({
            message: 'Something went wrong. Please contact your app developer',
            duration: 3000
          }).present();
        }
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

  openQuoteStatusModal(){
    let statusModal = this.modalCtrl.create('QuoteStatusModalPage',{id:this.quote_id});
    statusModal.onDidDismiss(()=>{
      this.getAllData();
    });
    statusModal.present();
  }

  dnoStr(id){
    let d = this.dnos.filter(function(r){
      return r.id = id
    })
    if(d[0]){
      return id + " (" + d[0].name + ") ";
    }else{
      return id;
    }
  }

}
