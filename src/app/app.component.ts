import { LaravelProvider } from './../providers/laravel/laravel';
import { Storage } from '@ionic/storage';
import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Nav, Platform, LoadingController } from 'ionic-angular';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any = 'LoginPage';
  loading:any;

  constructor(platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    private storage: Storage,
    private laravel: LaravelProvider,
    public loadingCtrl: LoadingController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.loading = this.loadingCtrl.create({
          content: 'Authenticating please wait...'
      });
      this.loading.present();
      //this.laravel.startLoading('Authenticating please wait...');
      this.storage.get('userTokenInfo').then((val) => {
        if(val){
          this.loading.dismiss();
          this.laravel.setToken(val);
          this.nav.setRoot('HomePage');
        }else{
          this.loading.dismiss();
          this.nav.setRoot('LoginPage');
          
        }
      },(error)=>{
        this.loading.dismiss();
      });
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

