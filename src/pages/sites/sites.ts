import { LaravelProvider } from '../../providers/laravel/laravel';
import { Component } from '@angular/core';
import { Headers,Http } from '@angular/http';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

/**
 * Generated class for the SitesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-sites',
  templateUrl: 'sites.html',
})
export class SitesPage {

  sitesData:any = [];
  sites:any = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public laravel:LaravelProvider,
    public http:Http,
    public toast: ToastController,) {
    this.getSites();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SitesPage');
  }

  getSites(refresher=null){
    this.laravel.startLoading();
    let token:string = this.laravel.getToken();

    if(token){
      let headers = new Headers();
      headers.append('Authorization', token);

      this.http.get(this.laravel.getSiteApi(),{
        headers: headers
      }).subscribe(response => {
        this.sitesData = response.json().sites;
        this.sites = this.sitesData;
        this.laravel.closeLoading();
        if(refresher != null){
          refresher.complete();
        }
      },
      error => {
        this.laravel.closeLoading();
        if(refresher != null){
          refresher.complete();
        }
        this.toast.create({
          message: 'Something went wrong. Please contact your app developer',
          duration: 3000
        }).present();
      });
    }
  }

  filterSites(event){
    this.sites = this.sitesData;
    let val = event.target.value.toLowerCase();

    if(val && val.trim() != ''){
      this.sites = this.sites.filter((site)=>{
        return site.site_name.toLowerCase().indexOf(val) > -1 
          || site.contact_person.toLowerCase().indexOf(val) > -1 
          || site.email.toLowerCase().indexOf(val) > -1
          || site.phone.toLowerCase().indexOf(val) > -1
          || site.client.toLowerCase().indexOf(val) > -1 
          || site.address.toLowerCase().indexOf(val) > -1 
      });
    }
    
  }

  doRefresh(refresher) {
    this.getSites(refresher)
  }

  openSiteDetailPage(id){
    this.navCtrl.push('SiteDetailsPage',{'id': id, "parentPage": this});
  }

  goToCreateSitePage(){
    this.navCtrl.push('SiteCreatePage',{'parentPage': this});
  }

  goToClientCreatePage(){
    this.navCtrl.push('ClientCreatePage',{"parentPage": this});
  }
}
