import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuoteCreatePage } from './quote-create';

@NgModule({
  declarations: [
    QuoteCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(QuoteCreatePage),
  ],
  exports: [
    QuoteCreatePage
  ]
})
export class QuoteCreatePageModule {}
