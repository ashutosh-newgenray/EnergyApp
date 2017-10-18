import { LaravelProvider } from '../../providers/laravel/laravel';
import { Component } from '@angular/core';
import { Http,Headers } from '@angular/http';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';

/**
 * Generated class for the ClientsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-clients',
  templateUrl: 'clients.html',
})
export class ClientsPage {

  clients:any = [];
  clientsData:any = [];
  sychedData:boolean = false;
  loading:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public laravel:LaravelProvider,
  public toast: ToastController,
  public loadingCtrl:LoadingController,
  public http:Http) {
    this.getData();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientsPage');
  }

  getData(refresher=null) {
    this.loading = this.loadingCtrl.create({
      content: 'Loading Clients'
    });
    this.loading.present();

    let token:string = this.laravel.getToken();
    if(token){
      let headers = new Headers();
      headers.append('Authorization', token);

      this.http.get(this.laravel.getClientApi(),{
        headers: headers
      }).subscribe(response => {
        this.clientsData = response.json().clients;
        this.clients = this.clientsData;
        this.sychedData = true;
        this.loading.dismiss();
        if(refresher != null){
          refresher.complete();
        }
      },
      error => {
        this.loading.dismiss();
        if(refresher != null){
          refresher.complete();
        }
        this.sychedData = true;
        this.toast.create({
          message: 'Something went wrong. Please contact your app developer',
          duration: 3000
        }).present();
      });
    }else{
      this.navCtrl.setRoot('LoginPage');
    }
  }

  filterClients(event){
    this.clients = this.clientsData;
    let val = event.target.value.toLowerCase();

    if(val && val.trim() != ''){
      this.clients = this.clients.filter((client)=>{
        var address_3 = (client.address_3)?client.address_3.toLowerCase():'';
        var address_2 = (client.address_2)?client.address_2.toLowerCase():'';
        var city = (client.city)?client.city.toLowerCase():'';
        return client.name.toLowerCase().indexOf(val) > -1 
          || client.address_1.toLowerCase().indexOf(val) > -1 
          || address_2.indexOf(val) > -1 
          || address_3.indexOf(val) > -1 
          || city.indexOf(val) > -1
          || client.postcode.toLowerCase().indexOf(val) > -1
          || client.country.toLowerCase().indexOf(val) > -1 
      });
    }
    
  }

  doRefresh(refresher) {
    this.getData(refresher)
  }

  openClientDetailPage(id){
    this.navCtrl.push('ClientDetailsPage',{'id': id, "parentPage": this});
  }

  goToCreateSitePage(){
    this.navCtrl.push('SiteCreatePage',{'id': this});
  }

  goToClientCreatePage(){
    this.navCtrl.push('ClientCreatePage',{"parentPage": this});
  }

  /*loadMore(infiniteScroll){

    setTimeout(() => {
      for(let i=0; i<this.clientsData.length; i++){
        this.clients.push(this.clientsData[i]);
      }
      infiniteScroll.complete();
    }, 500);

    
  }*/

}
