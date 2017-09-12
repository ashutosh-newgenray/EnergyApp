import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuoteStatusModalPage } from './quote-status-modal';

@NgModule({
  declarations: [
    QuoteStatusModalPage,
  ],
  imports: [
    IonicPageModule.forChild(QuoteStatusModalPage),
  ],
  exports: [
    QuoteStatusModalPage
  ]
})
export class QuoteStatusModalPageModule {}
