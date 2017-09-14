import { Http, Headers } from '@angular/http';
import { LaravelProvider } from './../../providers/laravel/laravel';
import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ModalController, LoadingController,Content } from 'ionic-angular';

/**
 * Generated class for the QuoteCreatePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-quote-create',
  templateUrl: 'quote-create.html',
})
export class QuoteCreatePage {
  @ViewChild(Content) content: Content;
  loading:any;
  step:any = 'select-site';
  sites: any = [];
  sitesData:any = [];
  suppliers:any = [];
  SuppliersData: any = [];
  prices:any;
  electric_regions:any = [];
  gas_regions:any = [];
  meterTypes:any;
  sortKey:string = 'percentage_diff';
  supercommission: any;
  role:any;

  quoteData:any = {
    quoteType: 'ELECTRICITY',
    current_supplier: 0,
    current_supplier_name: '',
    current_region: null,
    usages: {unit:null, day: null, night: null,weekend: null,other: null}, 
    renewal_date: '',
    unit_rate:{unit:null, day:null,night: null,weekend: null,other: null},
    standing_charge:null,
    yearly_cost:null,
    yearly_usages: null,
    uplift: 0,
    meterType:{
      unit:0,
      day:0,
      night:0,
      weekend:0,
      other:0,
    }
  };
  currentSupplier:any = null;
  siteId:any = 0;
  detailsValid:boolean = false;
  supplierId:any = 0;
  durations:any;
  filteredDurations:any = [];
  filteredSuppliers:any =[];
  uplift:any = 0;
  rowcpy:any = null;
  rowdiff:any = null;
  commission:any;
  data:any;
  selectedSupplier:any;
  selectedSite:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public laravel: LaravelProvider,
  public http:Http,
  public toast: ToastController,
  public loadingCtrl: LoadingController,
  public modalCtrl: ModalController
  ) {
    this.getAllData();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuoteCreatePage');
  }

  getAllData() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
    let token:string = this.laravel.getToken();

    if(token){
      let headers = new Headers();
      headers.append('Authorization', token);

      this.http.get(this.laravel.getAllDataQuoteApi(),{
        headers: headers
      }).subscribe(response => {
        this.sitesData = response.json().sites;
        this.sites = this.sitesData;
        this.prices = response.json().prices;
        this.electric_regions = response.json().dnos;
        this.gas_regions = response.json().ldz;
        this.SuppliersData = response.json().suppliers;
        this.commission = response.json().commission;
        this.meterTypes = response.json().meterTypes;
        this.supercommission = response.json().superCommission;
        this.role = response.json().roleName;
        this.quoteTypeChanged();
        this.loading.dismiss();
      },
      error => {
        this.loading.dismiss();
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
        return site.site_name.toString().toLowerCase().indexOf(val) > -1 
          || site.contact_person.toString().toLowerCase().indexOf(val) > -1 
          || site.client_name.toString().toLowerCase().indexOf(val) > -1 
          || site.address_1.toString().toLowerCase().indexOf(val) > -1 
          || site.city.toString().toLowerCase().indexOf(val) > -1 
          || site.region.toString().toLowerCase().indexOf(val) > -1 
          || site.country.toString().toLowerCase().indexOf(val) > -1 
          || site.postcode.toString().toLowerCase().indexOf(val) > -1 
          || site.mpan_top_line.toString().toLowerCase().indexOf(val) > -1
          || site.mpan_bottom_line.toString().toLowerCase().indexOf(val) > -1
          || site.electric_usage.toString().toLowerCase().indexOf(val) > -1
          || site.electric_contract_end.toString().toLowerCase().indexOf(val) > -1
          || site.mpr.toString().toLowerCase().indexOf(val) > -1
          || site.gas_usage.toString().toLowerCase().indexOf(val) > -1
          || site.contract_end_date.toString().toLowerCase().indexOf(val) > -1
      });
    }
  }

  quoteTypeChanged(){
    this.suppliers = this.SuppliersData;
    let supplierType = this.quoteData.quoteType;
    if(supplierType){
      this.suppliers = this.suppliers.filter((supplier)=>{
        return supplier.type == supplierType
      });
      
      let type = supplierType == 'GAS' ? 1 : 0;
      let durationData = this.prices.map(function(price){
        if(price.price_type == type){
          return price.contract_duration;
        }
      });
      
      this.durations = durationData.filter((duration, i, self)=>{
        return duration != null && self.indexOf(duration) === i;
      });
      
    }
    if(this.selectedSite){
      this.quoteData.renewal_date = (this.quoteData.quoteType == 'ELECTRICITY')? this.selectedSite.electric_contract_end : this.selectedSite.contract_end_date;
      
      let dno= this.selectedSite.mpan_bottom_line.substring(0,2);

      this.quoteData.current_region = (this.quoteData.quoteType == 'ELECTRICITY')? dno : this.selectedSite.ldz;

      let elec_supplier = this.suppliers.filter((supplier)=>{
        return supplier.id == this.selectedSite.electric_supplier_id;
      });
      
      let gas_supplier = this.suppliers.filter((supplier)=>{
        return supplier.id == this.selectedSite.gas_supplier_id;
      });

      let meter_type = this.selectedSite.mpan_top_line.substring(0,2);
      for(let mt of this.meterTypes){
        if(mt.hasOwnProperty("type") && mt.type == meter_type){
          this.quoteData.meterType = mt;
        }
      }

      this.currentSupplier = (this.quoteData.quoteType == 'ELECTRICITY') ? elec_supplier : gas_supplier;
      console.log(JSON.stringify(this.currentSupplier));
      if(this.currentSupplier.length){
        this.quoteData.current_supplier = this.currentSupplier[0];
        this.quoteData.current_supplier_name = this.currentSupplier[0].name;
      }else{
        this.quoteData.current_supplier = 0;
        this.quoteData.current_supplier_name = '';
      }
      
      if(elec_supplier.length){
        this.selectedSite['electric_supplier_name'] = elec_supplier[0].name;
      }else{
        this.selectedSite['electric_supplier_name'] = '';
      }
      if(gas_supplier.length){
        this.selectedSite['gas_supplier_name'] = gas_supplier[0].name;
      }else{
        this.selectedSite['gas_supplier_name'] = '';
      }
    }
    this.filteredDurations = [];
    this.filteredSuppliers = [];
    this.uplift = 0;
  }

  supplierChanged(){
    if(this.currentSupplier != 0){
      this.quoteData.current_supplier = this.currentSupplier;
      this.quoteData.current_supplier_name = this.currentSupplier.name;
    }else{
      this.quoteData.current_supplier = 0;
      this.quoteData.current_supplier_name = '';
    }
  }

  provideDetails(nextStep, site){
    this.selectedSite = site;
    this.siteId = site.id;
    this.step = nextStep;
    this.content.scrollToTop();
  }

  openFiltersModal(){
    let obj = {
      quoteType: this.quoteData.quoteType, 
      durations: this.durations, 
      suppliers: this.suppliers,
      filteredDurations: this.filteredDurations,
      filteredSuppliers: this.filteredSuppliers,
      uplift: this.uplift
    };
    let filterModal = this.modalCtrl.create('FilterSupplierOptionsModalPage',obj);
    filterModal.onDidDismiss(data => {
      this.filteredDurations = data.durations;
      this.filteredSuppliers = data.suppliers;
      this.uplift = data.uplift;
      this.quoteSupppliers();
    })
    filterModal.present();
  }

  showSuppliers(){
    let msg = '';
    if(this.quoteData.quoteType == 'ELECTRICITY'){
      if(this.quoteData.meterType.unit && !this.quoteData.usages.unit){
          msg += "Provide Electricity Usage.<br>"
      }
      if(this.quoteData.meterType.day && !this.quoteData.usages.day){
          msg += "Provide Electricity Day Usage.<br>"
      }
      if(this.quoteData.meterType.night  && !this.quoteData.usages.night){
          msg += "Provide Electricity Night Usage.<br>"
      }
      if(this.quoteData.meterType.weekend  && !this.quoteData.usages.weekend){
          msg += "Provide Electricity Weekend Usage.<br>"
      }
    }else{
      if(!this.quoteData.usages.day){
        msg += "Provide Gas Usage details.<br>"
      }
    }
    if(!this.quoteData.current_supplier){
      msg += "Select Current Supplier Supplier<br>"
    }

    if(!this.quoteData.renewal_date){
      msg += "Provide Renewal Date<br>"
    }
    if(msg.length > 0){
      this.toast.create({
        message: msg,
        duration: 3000
      }).present();
      return false;
    }
    this.detailsValid = true;
    this.quoteSupppliers();
    this.step = "select-supplier";
    this.content.scrollToTop();
  }

  quoteSupppliers(){
    this.data = this.prices;
    if(this.quoteData.quoteType == "GAS"){
      this.data = this.data.filter((row)=>{
        return row['price_type'] == 1 && row['ldz'] == this.quoteData.current_region  
      });
    }else{
      this.data = this.data.filter((row)=>{
        return row['price_type'] == 0 && row['dno'] == this.quoteData.current_region
      });
    }

    if(this.filteredDurations.length){
      this.data = this.data.filter((row)=> {
        return this.filteredDurations.some((d)=>{
          return (d.checked && d.contract_duration == row.contract_duration)
        });
      });
    }

    if(this.filteredSuppliers.length){
      this.data = this.data.filter((row)=> {
        return this.filteredSuppliers.some((s)=>{
          return (s.checked && s.supplier_id == row.supplier_id)
        });
      });
    }

    for(let i=0; i < this.data.length;i++){
      this.data[i].cost_per_year = this.getCostPerYear(this.data[i]);
      this.data[i].difference = this.getDifference();
      this.data[i].percentage_diff = this.getPercentageDiff();
      this.data[i].commission = this.getCommission(this.data[i]);
      this.data[i].logo_url = this.getLogo(this.data[i].logo)
    }

    this.data = this.data.filter((row)=> {
        return parseInt(row['cost_per_year']) > 0
    });

    this.data = this.data.sort((a,b)=>
       b.percentage_diff - a.percentage_diff 
    );
  }

  getCostPerYear(item){
    let charges = 0;
    let usages = 0;
    let unit = parseFloat(item.unit_rate);
    let day = parseFloat(item.day);
    let night = parseFloat(item.night);
    let evening = parseFloat(item['evening_&_weekend']);
    let other = parseFloat(item.other);

    if(this.quoteData.meterType.unit && this.quoteData.usages.unit){
      let usage = parseFloat(this.quoteData.usages.unit);
      usages += usage;
      charges += usage * unit;
    }
    
    if(this.quoteData.usages.day && this.quoteData.meterType.day){
      let usage = parseFloat(this.quoteData.usages.day);
      usages += usage;
      //charges += day ? usage * day : usage * unit;
      charges += usage * day;
    }

    if(this.quoteData.usages.night && this.quoteData.meterType.night){
        let usage = parseFloat(this.quoteData.usages.night);
        usages += usage;
        /*charges += night ? usage * night : usage * unit;*/
        charges += usage * night;
    }

    if(this.quoteData.usages.weekend && this.quoteData.meterType.weekend){
      let usage = parseFloat(this.quoteData.usages.weekend);
      usages += usage;
      /*charges += evening ? usage * evening : usage * unit;*/
      charges += usage * evening;
    }

    if(this.quoteData.usages.other && this.quoteData.meterType.other){
        let usage = parseFloat(this.quoteData.usages.other);
        usages += usage;
        /*charges += evening ? usage * evening : usage * unit;*/
        charges += usage * other;
    }

    if(charges == 0){
        return null;
    }
    if(item.standing_charge){
        charges += parseFloat(item.standing_charge) * 365;
    }
    charges = charges / 100;
    this.rowcpy = charges;
    return charges.toFixed(2);
  }

  getDifference(){
    this.rowdiff = (parseFloat(this.quoteData.yearly_cost) - parseFloat(this.rowcpy)).toFixed(2);
    return this.rowdiff;
  }

  getPercentageDiff(){
    if(this.rowcpy && this.rowdiff){
        let p = this.rowdiff/this.rowcpy * 100;
        this.rowcpy = null;this.rowdiff = null;
        return p.toFixed(2);
    }
    this.rowcpy = null;this.rowdiff = null;
    return null;
  }

  getCommission(item){
    let charges = parseFloat(this.getCostPerYear(item));
    let commission = 0;
    if(this.role == 'AGENT'){
      let agencyCommission = (charges * this.uplift * parseFloat(this.supercommission)) / (100);
      commission = (agencyCommission * this.uplift * parseFloat(this.commission)) / (100);
    }else{
      commission = (charges * this.uplift * parseFloat(this.commission)) / (100);
    }
    return commission.toFixed(2);
  }

  get clientYearlyCost() {
    let charges = 0;
    let usages = 0;
    if(this.quoteData.meterType.unit && this.quoteData.usages.unit){
      let usage = parseFloat(this.quoteData.usages.unit);
      let unit = parseFloat(this.quoteData.unit_rate.unit);
      charges += usage * unit;
      usages += usage;
    }
    if(this.quoteData.meterType.day && this.quoteData.usages.day){
      let usage = parseFloat(this.quoteData.usages.day);
      let unit = parseFloat(this.quoteData.unit_rate.day);
      charges += usage * unit;
      usages += usage;
    }
    if(this.quoteData.meterType.night && this.quoteData.usages.night){
        let usage = parseFloat(this.quoteData.usages.night);
        let unit = parseFloat(this.quoteData.unit_rate.night);
        charges += usage * unit;
        usages += usage;
    }
    if(this.quoteData.meterType.weekend && this.quoteData.usages.weekend){
        let usage = parseFloat(this.quoteData.usages.weekend);
        let unit = parseFloat(this.quoteData.unit_rate.weekend);
        charges += usage * unit;
        usages += usage;
    }
    if(this.quoteData.meterType.other && this.quoteData.usages.other){
        let usage = parseFloat(this.quoteData.usages.other);
        let unit = parseFloat(this.quoteData.unit_rate.other);
        charges += usage * unit;
        usages += usage;
    }
    this.quoteData.yearly_usages = usages;
    if(this.quoteData.standing_charge){
      charges += parseFloat(this.quoteData.standing_charge) * 365;
    }
    charges = charges / 100;
    this.quoteData.yearly_cost = charges;
    return this.quoteData.yearly_cost.toFixed(2);
  }

  getLogo(logo){
    return this.laravel.getImageUrl(logo);
  }

  generate(item){
    this.selectedSupplier = item;
    this.supplierId = item.supplier_id;
    this.step = 'generate-quote';
  }

  generateFinal(){
    this.loading = this.loadingCtrl.create({
        content: "Please do not refresh this page. Processing your request.."
    });
    this.loading.present();

    let data = {
      id: this.supplierId,
      site: this.selectedSite,
      supplier: this.selectedSupplier,
      usages: this.quoteData,
      comparisons: this.data
    }

    let headers = new Headers();
    let token:string = this.laravel.getToken();
    headers.append('Authorization', token);
    this.http.post(this.laravel.generateQuote(),data,{
      headers: headers
    }).subscribe(response=>{
      this.loading.dismiss();
      if(response.json().success){
        this.navCtrl.pop().then(()=>{
          this.navParams.get('parentPage').getQuotes();
        });
      }else{
        let errorMsg = 'Something went wrong. Please contact your app developer';
        if(response.json().hasOwnProperty('msg')){
          if(response.json().msg instanceof String){
            errorMsg = response.json().msg
          }else{
            errorMsg = response.json().msg.join();
          }
        }
        this.toast.create({
          message: errorMsg,
          duration: 3000
        }).present();  
      }
    },error=>{
      this.loading.dismiss();
      this.toast.create({
        message: 'Something went wrong. Please contact your app developer',
        duration: 3000
      }).present();
    })
  }

  dnoStr(id) {
    let d = this.electric_regions.filter(function(r){
      return r.id = id
    })
    if(d[0]){
      return id + " (" + d[0].name + ") ";
    }else{
      return id;
    }
  }
}
