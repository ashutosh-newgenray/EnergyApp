import { LaravelProvider } from '../../providers/laravel/laravel';
import { Component } from '@angular/core';
import { Headers,Http } from '@angular/http';
import { IonicPage, NavController, ToastController, LoadingController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  totalClients:any = 0;
  totalSites:any = 0;
  totalQuotes:any = 0;
  loading:any;

  constructor(public navCtrl: NavController,
    public laravel:LaravelProvider,
    public http:Http,
    public toast: ToastController,
    public LoadingCtrl: LoadingController
  ) {
    
    
  }

  ionViewDidLoad() {
    this.getTotalStatistics();
  }

  getTotalStatistics(refresher = null) {
    let loading = this.LoadingCtrl.create({
      content: "Please wait.."
    });
    loading.present();
    
    let headers = new Headers();
    let token:string = this.laravel.getToken();
    headers.append('Authorization', token);

    this.http.get(this.laravel.getAllStatistics(),{
        headers: headers
    }).subscribe(response=>{
      this.totalClients = response.json().totalClients;
      this.totalSites = response.json().totalSites;
      this.totalQuotes = response.json().totalQuotes;
      loading.dismiss();
      if(refresher != null){
        refresher.complete()
      }
    },
    error=>{
      loading.dismiss();
      if(error.json().error != 'Unauthenticated.'){
        this.toast.create({
          message: 'Something went wrong. Please contact your app developer',
          duration: 3000
        }).present();
      }else{
        this.navCtrl.setRoot('LoginPage');
      }

      if(refresher != null){
        refresher.complete()
      }
      
    });
  }

  goToSites(){
    this.navCtrl.push('SitesPage');
  }

  goToClients(){
    this.navCtrl.push('ClientsPage');
  }

  goToQuotes(){
    this.navCtrl.push('QuotesPage');
  }

  settings(){
    this.navCtrl.push('SettingPage');
  }

  doRefresh(refresher) {
    this.getTotalStatistics(refresher);
  }
}
