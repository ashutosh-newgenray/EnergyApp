import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { LaravelProvider } from '../../providers/laravel/laravel';
import { Headers,Http } from '@angular/http';

/**
 * Generated class for the QuotesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-quotes',
  templateUrl: 'quotes.html',
})
export class QuotesPage {
  quotes:any = [];
  quotesData:any = [];
  sychedData:boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public laravel:LaravelProvider,
    public http:Http,
    public toast: ToastController
  ) {
    this.getQuotes();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuotesPage');
  }

  getQuotes(refresher=null) {
    this.laravel.startLoading();
    let token:string = this.laravel.getToken();

    if(token){
      let headers = new Headers();
      headers.append('Authorization', token);
      this.sychedData = false;
      this.http.get(this.laravel.getQuoteApi(),{
        headers: headers
      }).subscribe(response => {
        this.quotesData = response.json().quotes;
        this.quotes = this.quotesData;
        this.laravel.closeLoading();
        this.sychedData = true;
        if(refresher != null){
          refresher.complete();
        }
      },
      error => {
        this.laravel.closeLoading();
        if(refresher != null){
          refresher.complete();
        }
        this.sychedData = true;
        this.toast.create({
          message: 'Something went wrong. Please contact your app developer',
          duration: 3000
        }).present();
      });
    }
  }

  filterQuotes(event){
    this.quotes = this.quotesData;
    let val = event.target.value.toLowerCase();

    if(val && val.trim() != ''){
      this.quotes = this.quotes.filter((quote)=>{
        return quote.company.toLowerCase().indexOf(val) > -1 
          || quote.site.toLowerCase().indexOf(val) > -1 
          || quote.postcode.toLowerCase().indexOf(val) > -1
          || quote.mpan_top.toLowerCase().indexOf(val) > -1
          || quote.mpan_bottom.toLowerCase().indexOf(val) > -1 
          || quote.mpr.toLowerCase().indexOf(val) > -1 
          || quote.electric_usage.toLowerCase().indexOf(val) > -1 
          || quote.gas_usage.toLowerCase().indexOf(val) > -1 
          || quote.electric_EOC.toLowerCase().indexOf(val) > -1 
          || quote.gas_EOC.toLowerCase().indexOf(val) > -1 
          || quote.status.toLowerCase().indexOf(val) > -1 
          || quote.submitted_by.toLowerCase().indexOf(val) > -1 
      });
    }
    
  }

  doRefresh(refresher) {
    this.getQuotes(refresher)
  }

  openQuoteDetailPage(id){
    this.navCtrl.push('QuoteDetailsPage',{'id': id, "parentPage": this});
  }

  createQuote() {
    this.navCtrl.push('QuoteCreatePage',{'parentPage': this});
  }

}
