import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the ClientDetailsPopOverPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-client-details-pop-over',
  templateUrl: 'client-details-pop-over.html',
})
export class ClientDetailsPopOverPage {
  navCtrl:any;
  formClient:any;
  clientId:any;
  clientDetailClass:any;

  constructor(public navParams: NavParams, public viewCtrl: ViewController) {
    if(this.navParams.data){
      this.navCtrl = this.navParams.data.navCtrl;
      this.formClient = this.navParams.data.formClient;
      this.clientId = this.navParams.data.clientId;
      console.log(this.formClient);
      console.log(this.clientId);
      console.log(this.navCtrl);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientDetailsPopOverPage');
  }

  saveClientForm(){
    this.close();
    this.formClient.submit();
  }

  goToCreateSitePage(){
    this.close();
    this.navCtrl.push('SiteCreatePage',{'id': this.clientId});
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
