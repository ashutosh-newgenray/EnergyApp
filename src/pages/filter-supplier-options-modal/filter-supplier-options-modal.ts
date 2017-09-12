import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the FilterSupplierOptionsModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({ 
  selector: 'page-filter-supplier-options-modal',
  templateUrl: 'filter-supplier-options-modal.html',
})
export class FilterSupplierOptionsModalPage {

  quoteType:string;
  durations:any = [];
  suppliers:any = [];
  uplift:any = 0;
  upliftDecimal:any = 0;
  filteredDurations:any = [];
  filteredSuppliers:any = [];
  returnData:any;

  constructor(public navParams: NavParams, public viewCtrl: ViewController) {
    this.quoteType = this.navParams.get('quoteType');
    this.durations = this.navParams.get('durations');
    this.suppliers = this.navParams.get('suppliers');
    this.filteredDurations = this.navParams.get('filteredDurations');
    this.filteredSuppliers = this.navParams.get('filteredSuppliers');
    this.upliftDecimal = this.navParams.get('uplift');
    this.uplift = this.upliftDecimal * 100;
    let durationChanged = true;
    if(!this.filteredDurations.length){
      this.durations = this.durations.map(function(duration){
        return {contract_duration: duration, checked:false};
      });
      durationChanged = false;
    }else{
      this.durations = this.filteredDurations;
    }
    let supplierChanged = true;
    if(!this.filteredSuppliers.length){
      this.suppliers = this.suppliers.map(function(supplier){
        return {name: supplier.name, id: supplier.id, checked:false};
      });
      supplierChanged = false;
    }else{
      this.suppliers = this.filteredSuppliers;
    }

    this.returnData = {durations: (durationChanged)?this.durations:[], suppliers: (supplierChanged)?this.suppliers:[], uplift: this.upliftDecimal};
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FilterSupplierOptionsModalPage');
  }
  
  rangeUpdated(event){
    this.upliftDecimal = this.uplift/100;
  }

  applyFilter(){
    let supplierChanged = this.suppliers.some((item)=>{
      return item.checked
    });
    let durationChanged = this.durations.some((item)=>{
      return item.checked;
    });

    this.returnData = {durations: (durationChanged)?this.durations: [], suppliers: (supplierChanged)?this.suppliers: [], uplift: this.upliftDecimal};
    this.viewCtrl.dismiss(this.returnData);
  }

  dismiss(){
    this.viewCtrl.dismiss(this.returnData);
  }

}
