import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SiteCreatePage } from './site-create';

@NgModule({
  declarations: [
    SiteCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(SiteCreatePage),
  ],
  exports: [
    SiteCreatePage
  ]
})
export class SiteCreatePageModule {}
