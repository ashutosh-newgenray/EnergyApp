import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FilterSupplierOptionsModalPage } from './filter-supplier-options-modal';

@NgModule({
  declarations: [
    FilterSupplierOptionsModalPage,
  ],
  imports: [
    IonicPageModule.forChild(FilterSupplierOptionsModalPage),
  ],
  exports: [
    FilterSupplierOptionsModalPage
  ]
})
export class FilterSupplierOptionsModalPageModule {}
