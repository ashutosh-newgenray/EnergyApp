import { LaravelProvider } from '../../providers/laravel/laravel';
import { Component, ViewChild } from '@angular/core';
import { Headers,Http } from '@angular/http';
import { IonicPage, NavController, ToastController, LoadingController } from 'ionic-angular';
import { Chart } from 'chart.js';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('quotesCanvas') quotesCanvas;
  @ViewChild('clientsCanvas') clientsCanvas;
  @ViewChild('sitesCanvas') sitesCanvas;

  quotesChart: any;
  sitesChart: any;
  clientsChart: any;

  totalClients:any = 0;
  totalSites:any = 0;
  totalQuotes:any = 0;
  quotes_config:any = {
    period:'DAY',
    type: 'line',
    data: {
      labels: [],
      datasets: [{
          label: "",
          backgroundColor: 'rgba(255, 99, 132,0.2)',
          borderColor: 'rgb(255, 99, 132)',
          data: [],
          fill: true,
      }]
    },
    options: {
      responsive: true,
      title:{
          display:false,
          text:'Quotations Generated'
      },
      tooltips: {
          mode: 'index',
          intersect: false,
      },
      hover: {
          mode: 'nearest',
          intersect: true
      },
      legend: {
        display: false
      },
      scales: {
          xAxes: [{display: true}],
          yAxes: [{
              ticks:{ beginAtZero: true,userCallback: function(label, index, labels) {if (Math.floor(label) === label) {return label;}}},
              display: true, scaleLabel: {display: false, labelString: 'No of Quotation'}}]
      }
    }
  };
  clients_config:any = {
    period:'DAY',
    type: 'line',
    data: {
      labels: [],
      datasets: [{
          label: "Clients",
          backgroundColor: 'rgba(255, 205, 86, 0.2)',
          borderColor: 'rgb(255, 205, 86)',
          data: [],
          fill: true,
      }]
    },
    options: {
      responsive: true,
      title:{
          display:false,
          text:'Clients'
      },
      tooltips: {
          mode: 'index',
          intersect: false,
      },
      hover: {
          mode: 'nearest',
          intersect: true
      },
      legend: {
        display: false
      },
      scales: {
          xAxes: [{display: true}],
          yAxes: [{
              ticks:{ beginAtZero: true,userCallback: function(label, index, labels) {if (Math.floor(label) === label) {return label;}}},
              display: true, scaleLabel: {display: false, labelString: 'No of Clients'}}]
      }
    }
  };

  sites_config:any = {
    period:'DAY',
    type: 'line',
    data: {
      labels: [],
      datasets: [{
          label: "Sites",
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          data: [],
          fill: true,
      }]
    },
    options: {
      responsive: true,
      title:{
          display:false,
          text:'Sites'
      },
      tooltips: {
          mode: 'index',
          intersect: false,
      },
      hover: {
          mode: 'nearest',
          intersect: true
      },
      legend: {
        display: false
      },
      scales: {
          xAxes: [{display: true}],
          yAxes: [{
              ticks:{ beginAtZero: true,userCallback: function(label, index, labels) {if (Math.floor(label) === label) {return label;}}},
              display: true, scaleLabel: {display: false, labelString: 'No of Sites'}}]
      }
    }
  };
  loading:any;

  constructor(public navCtrl: NavController,
    public laravel:LaravelProvider,
    public http:Http,
    public toast: ToastController,
    public LoadingCtrl: LoadingController
  ) {
    
    
  }

  ngOnInit() {
    this.getTotalStatistics();
  }

  drawChart() {
    this.quotesChart = new Chart(this.quotesCanvas.nativeElement, this.quotes_config);
    this.clientsChart = new Chart(this.clientsCanvas.nativeElement, this.clients_config);
    this.sitesChart = new Chart(this.sitesCanvas.nativeElement, this.sites_config);
  }

  getTotalStatistics(refresher = null) {
    let loading = this.LoadingCtrl.create({
      content: "Please wait.."
    });
    loading.present();
    
    let headers = new Headers();
    let token:string = this.laravel.getToken();
    headers.append('Authorization', token);

    this.http.get(this.laravel.getAllStatistics(),{
        headers: headers
    }).subscribe(response=>{
      this.totalClients = response.json().totalClients;
      this.totalSites = response.json().totalSites;
      this.totalQuotes = response.json().totalQuotes;
      let resQD = response.json().quotesData;
      let resCD = response.json().clientsData;
      let resSD = response.json().sitesData;

      if(resQD){
        let quoteslabel = [];
        let quoteData = [];
        for (var keyqd in resQD) {
          if (resQD.hasOwnProperty(keyqd)) {
              if(this.quotes_config.period === 'MONTH'){
                quoteslabel.push(keyqd.slice(3));
              }else{
                quoteslabel.push(keyqd);
              }
  
              quoteData.push(parseFloat(resQD[keyqd]));
          }
        }
        this.quotes_config.data.labels = quoteslabel;
        this.quotes_config.data.datasets[0].data = quoteData;
      }
      
      if(resCD){
        let clientslabel = [];
        let clientData = [];
        for (var keycd in resCD) {
          if (resCD.hasOwnProperty(keycd)) {
              if(this.clients_config.period === 'MONTH'){
                clientslabel.push(keycd.slice(3));
              }else{
                clientslabel.push(keycd);
              }
  
              clientData.push(parseFloat(resCD[keycd]));
          }
        }
        this.clients_config.data.labels = clientslabel;
        this.clients_config.data.datasets[0].data = clientData;
      }
      
      if(resSD){
        let siteslabel = [];
        let siteData = [];
        for (var keysd in resSD) {
          if (resSD.hasOwnProperty(keysd)) {
              if(this.sites_config.period === 'MONTH'){
                siteslabel.push(keysd.slice(3));
              }else{
                siteslabel.push(keysd);
              }
  
              siteData.push(parseFloat(resSD[keysd]));
          }
        }
        this.sites_config.data.labels = siteslabel;
        this.sites_config.data.datasets[0].data = siteData;
      }
      
      this.drawChart();
      loading.dismiss();
      if(refresher != null){
        refresher.complete()
      }
    },
    error=>{
      loading.dismiss();
      if(error.json().error != 'Unauthenticated.'){
        this.toast.create({
          message: 'Something went wrong. Please contact your app developer',
          duration: 3000
        }).present();
      }else{
        this.navCtrl.setRoot('LoginPage');
      }

      if(refresher != null){
        refresher.complete()
      }
      
    });
  }

  goToSites(){
    this.navCtrl.push('SitesPage');
  }

  goToClients(){
    this.navCtrl.push('ClientsPage');
  }

  goToQuotes(){
    this.navCtrl.push('QuotesPage');
  }

  settings(){
    this.navCtrl.push('SettingPage');
  }

  doRefresh(refresher) {
    this.getTotalStatistics(refresher);
  }
}
