<template>
    <div id="app">
     <table class="tabs">
        <tr>
            <td id="station_title">
                <h1>{{stationCS}}</h1>
                {{stationTitle}}
            </td>
        <td rowspan="2" id="status">
            <div id="status_block_top" class="status_online">
                Station <b>ONLINE</b>
            </div>
            <table id="status_block_info"><tr>
                <td id="current_loc">
                    <span>15 jul 2017 18:23z</span><br/>RDA&nbsp;<b>KR-27</b><br/>RAFA&nbsp;<b>XRKF</b><br/><b>LN06LC</b>
                </td>
            </tr></table>
        </td>
    </tr>
    <tr>
        <td>
            <router-link to="/info" tag="div" id="tab_info" class="tab" 
                active-class="active_tab" v-if="enable.stationInfo">Info</router-link>
            <router-link to="/news" tag="div" id="tab_news" class="tab" 
                active-class="active_tab" v-if="enable.news"
                 :class="{updated_tab: tabsUnread.news }">News</router-link>
            <router-link to="/log" tag="div" id="tab_log" class="tab" 
                active-class="active_tab" v-if="enable.log">Online log</router-link>
            <router-link to="/map" tag="div" id="tab_map" class="tab" 
                active-class="active_tab" v-if="enable.map">Map</router-link>
            <router-link to="/adxcluster" tag="div" id="tab_adxc" class="tab" 
                active-class="active_tab" v-if="enable.cluster" 
                :class="{updated_tab: tabsUnread.cluster }">ADXcluster</router-link>
            <router-link to="/chat" tag="div" id="tab_chat" class="tab" 
                active-class="active_tab" v-if="enable.chat">Chat</router-link>
            <router-link to="/instagram" tag="div" id="tab_instagram" class="tab" 
                active-class="active_tab" v-if="enable.instagram">Instagram</router-link>
            <router-link to="/donate" tag="div" id="tab_donate" class="tab" 
                active-class="active_tab" v-if="enable.donate">Support us</router-link>
        </td>
    </tr></table>
    <router-view></router-view>
    </div>

</template>

<script>
import stationSettings from './station-settings-service'
import clusterService from './cluster-service'
import newsService from './news-service'
import chatService from './chat-service'
import storage from './storage'

const tabsReadStorageKey = 'stationTabsRead'
const tabs = {
  cluster: { service: clusterService, interval: 60000 },
  news: { service: newsService, interval: 60000 },
  chat: { service: chatService, interval: 5000 }
}

export default {
  name: 'station',
  data () {
    let tabsRead = storage.load( tabsReadStorageKey, 'local' )
    if (!tabsRead) {
      tabsRead = {}
    }
    const tabsUnread = {}
    for (const id in tabs) {
      tabs[id].updated = null
      tabsUnread[id] = false
      if ( id in tabsRead ) {
        tabs[id].read = tabsRead[id]
      }
    }
    return {
      tabs: tabs,
      tabsRead: tabsRead,
      tabsUnread: tabsUnread,
      enable: {},
      stationCS: null,
      stationTitle: null,
      stationInfo: null,
      stationSettings: null
    }
  },
  mounted: function () {
    const vm = this
    stationSettings.load()
      .then( function () {
        vm.stationCS = stationSettings.data.station.callsign
        vm.stationTitle = stationSettings.data.station.title
        vm.enable = stationSettings.data.enable
        vm.stationSettings = stationSettings.data
        if ( stationSettings.data.enable.stationInfo ) {
          vm.stationInfo = stationSettings.data.station.info
        }
      })
    for (const id in vm.tabs) {
      const tab = vm.tabs[id]
      tab.service.load()
      tab.intervalId = setInterval( tab.service.load, tab.interval )
      tab.service.onUpdate( function () {
        tab.updated = tab.service.lastModified
        vm.tabUnread( id )
      })
    }
  },
  beforeDestroy () {
    for (const id in this.tabs) {
      clearInterval( this.tabs[id].intervalId )
    }
  },
  methods: {
    tabRead: function ( id ) {
      const tab = this.tabs[id]
      if ( tab.updated && tab.read !== tab.updated ) {
        tab.read = tab.updated
        this.tabsRead[id] = tab.read
        this.tabUnread( id )
        storage.save( tabsReadStorageKey, this.tabsRead, 'local' )
      }
    },
    tabUnread: function ( id ) {
      const tab = this.tabs[id]
      this.tabsUnread[id] = tab.updated ? tab.updated !== tab.read : false
    }
  }
}
</script>

<style>
body, html{
    margin:0;
    padding:0;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    line-height: 1.5em;
    color: #333;
    position: relative;
    background: #fff url("/static/images/background.jpg") top left;
    text-align: center;
    position: relative;
}
input, button, textarea{
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    padding: 5px;
    margin: 5px 0;
}
.btn{
    padding: 5px 15px;
    background-color: #6B8AAE;
    color: #fff;
    text-align: center;
    box-shadow: 3px 3px 6px rgba(0,0,0,0.3); /* Параметры тени */
    border: none;
    border-radius: 10px;
    cursor: pointer;
}
.btn2{
    background-color: #ddd;
    color: #333;
    border: 1px solid #ccc;
}

 .ng-hide{
    display: none;
 }
.clearboth{ clear: both; }




/* =============================   H E A D   T A B S   T A B L E   ==================================== */

table.tabs{
    width: 1202px;
    margin: 10px auto 0px auto;
    background: url("/static/images/tabs_line.png") bottom left repeat-x;
    border-collapse: collapse;
}
table.index_tabs{
    width: 802px;
}


table.tabs td{
    vertical-align: bottom;
    text-align: left;
    padding: 0;
}

table.tabs td#station_title{
    color: #777;
    padding: 5px 0 20px 0;
    text-align: center;
}
table.tabs td#station_title h1{
    margin: 0;
    padding: 5px 0 10px 0;
    font-size: 48px;
    font-weight: bold;
    background-color: #555;
    -webkit-background-clip: text;
    -moz-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: rgba(255,255,255,0.4) 1px 2px 3px;
}


table.tabs td#status{
    width: 150px;
    text-align: center;
}
#status_block_top{
    color: #fff;
    padding:  5px 5px;
    border-radius: 10px 10px 0px 0px;
    font-size: 14px;
    text-align: center;
    line-height: 16px;
}
.status_offline{
    background-color: #ff4949;
}
.status_online{
    background-color: #4ab54a;
}


table#status_block_info{
    width: 100%;
    padding: 0px;
    margin: 0;
    border-collapse: collapse;
    background: #e3f9e3  url("/static/images/tabs_background_status.png") bottom left no-repeat;
    border: 1px solid #ccc;
    border-top: none;
}
table#status_block_info td{
    font-size: 14px;
    line-height: 18px;
    text-align: center;
    vertical-align: middle;
}
table#status_block_info td#current_op{
    width: 60px;
    padding: 5px 0;
}
table#status_block_info td#current_op img{
    width: 50px;
    height: 50px;
    border-radius: 25px;
    border: 1px solid #4ab54a;
    padding: 1px;
}
#status_block_info span{
    display: inline-block;
    margin-bottom: 5px;
    font-size: 10px;
    color: #777;
}


table.tabs td#logo{
    text-align: center;
    padding: 10px 0 20px 0;
}

table.tabs td#login{
    text-align: right;
}











/* =============================   T A B S  ==================================== */
.tab{
    display: inline-block;   
    padding: 7px 20px 7px 20px;
    margin: 0;
    font-size: 14px;
    text-align: center;
    line-height: 1em;
    background: #f5f5f5  url("/static/images/tabs_background.jpg") bottom left no-repeat;
    border: 1px solid #ccc;
    border-radius: 10px 10px 0px 0px;
    cursor: pointer;
}
#tab_donate{
    font-weight: bold;
    color: #900;
}
.updated_tab{
    background: #f5f5f5  url("/static/images/tabs_background.jpg") bottom right no-repeat;
    padding-right: 35px;
}
.active_tab{
    background: #fff;
    font-weight: bold;
    border-bottom: 1px solid #fff;
}













/* =============================   L I S T   ==================================== */

.list{
    width: 1200px;
    padding: 10px 0 300px 0;
    margin: 0px auto;
    background-color: #fff;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    margin-bottom: 50px;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3);
}
.list a {
    color: #333;
    text-decoration: none;
}

.index_list{
    width: 800px;
    padding-top: 50px;
}



.index_station{
    font-size: 14px;
    line-height: 30px;
    padding: 0 50px;
    margin-bottom: 50px;
}
.index_station img{
    float: left;
    margin-right: 20px;
    height: 150px;
}
.index_station span.callsign{
    font-size: 36px;
    font-weight: bold;
    padding-right: 10px;
    text-decoration: underline;
    color: #449;
}




































/*              I N F O            */
#info{
    width: 900px;
    margin: 10px auto;
    text-align: left;
}
.info_block{ 
    margin: 0 0 20px 0;
    padding: 0;
    background-color: white;
    border: 1px solid #ddd;
}
.info_date{ 
    font-weight: bold;
    font-size: 12px;
    background-color: #ddd;
    color: #000;
    padding: 3px;
    line-height: 1em;
    width: 130px;
}
.info_block p{ 
    padding: 10px 20px;
    margin: 0;
    text-indent: 1em;
}












/*              O N L I N E   L O G             */

#call_search{
    margin: 20px 0;
    text-align: center;
}
#call_search input{
    font-weight: bold;
    text-align: center;
}







table#log { 
    border-collapse: collapse; 
    margin: 10px auto;
}
table#log td{ 
    padding: 7px 20px;
    text-align: center;
    vertical-align: middle;
    border: 1px solid #ddd;
    font-size: 14px;
    line-height: 1em;
    color: #333;
}
table#log td.date, table#log td.rst{ 
    
}
table#log td.mycall{ 
    font-weight: bold;
    width: 80px;
    font-size: 16px;
    color: #555;
}
table#log td.urcall{ 
    background-color: #f9ffec;
    font-weight: bold;
    width: 100px;
    font-size: 16px;
}
table#log td.head{ 
    background-color: #f5f5f5;
}
table#log tr.new_qso{ 
    background-color: #DFFAFD;
}











#sponsor{ 
    width: 85%;
    margin: 10px auto 0px auto;
    background-color: #fdfbda;  
    border: 1px solid #aaa;
    border-radius: 7px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    padding: 10px 20px;
    font-size: 18px; 
    line-height: 1.5em;
    color: #000;
    text-align: left;
}

#donate iframe{
    margin: 30px 0;
    width: 436px;
}

#ppal{
    width: 300px;
    margin: 0 auto 20px auto;
    background-color: #fff;
    border: 1px solid #aaa;
    border-radius: 7px;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    padding: 13px 13px 5px 13px;
}
#ppal form{
    display: inline-block;
    width: 100px;
}












#cluster{
    font-size: 12px;
}
table#cluster { 
    border-collapse: collapse; 
    width: 800px;
    margin: 20px auto 5px auto;    
}
table#cluster td{ 
    padding: 5px;
    font-size: 16px;
    text-align: left;
    vertical-align: middle;
    border: 1px solid #ddd;
    line-height: 1em;
}
table#cluster td.time{ 
    width: 50px;
}
table#cluster td.band{ 
    width: 60px;
}
table#cluster td.mode{ 
    width: 30px;
    font-size: 12px;
    text-align: center;
}
table#cluster td.call{ 
    width: 80px;
    font-weight: bold;
}
table#cluster td.text{ 
    color: #777;
    font-size: 12px;
}
table#cluster td.spotter{ 
    width: 100px;
    color: #777;
    font-size: 12px;
    padding: 5px;
}







#gps_map{ 
    font-size: 14px;
}
#map{ 
    width: 1100px;
    height: 400px;
    padding: 0px;
    margin: 5px auto;
}
yandex-map {
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
}


#gps_map iframe{
    margin: 3px 0 50px 0;
}














table#message_form{
    width: 850px;
    padding: 0px;
    margin: 20px auto;
    border: none;
    border-collapse: collapse;
    text-align: center;
}
table#message_form td{
    padding: 0;
    margin: 0;
}
table#message_form td.note{
    font-size: 12px;
    vertical-align: top;
    color: #777;
    line-height: 12px;
}
table#message_form input#your_call{
    width: 150px;
    font-weight: bold;
    font-size: 18px;
    padding: 1px;
    border: 1px solid #999;
}
table#message_form input#message_text{
    width: 550px;
    text-align: left;
    border: 1px solid #999;
}



#chat_info{
    width: 120px;
    float: right;
    margin: 0px 20px 0 0;
    border: 1px solid #eee;
    text-align: left;
}
.chat_info_title{
    background-color: #eee;
    text-align: center;
    color: #777;
}
.chat_info_users1{
    padding: 10px 0 10px 20px;
    font-weight: bold;
    line-height: 1.5em;
    color: #777;
    font-size: 16px;
}
.chat_info_users2{
    padding: 10px 0 10px 20px;
    font-weight: bold;
    line-height: 1.5em;
    color: #999;
    font-size: 16px;
}
.chat_info_users span{

}



table#chat_window{
    width: 1000px;
    padding: 0px;
    margin: 20px 20px 20px 20px;
    border: 1px solid #ccc;
    font-size: 16px;
    border-collapse: collapse;
}
table#chat_window td{
    padding: 10px 5px;
    text-align: left;
    vertical-align: top;
}
table#chat_window tr{
    border: 1px solid #eee;
}
table#chat_window td.call{
    font-weight: bold;
    width: 150px;
    line-height: 14px;
    color: #009;
}
table#chat_window td.call span.date_time{
    font-size: 12px;
    font-weight: normal;
    color: #777;
}
table#chat_window td.call span.call{
    color: #00A;
}
table#chat_window tr.admin td.call span.call{
    color: #A00;
}
table#chat_window td.message{
    line-height: 1.5em;
    padding-top: 5px;
}




/* ===========================   L O G I N   /    R E G I S T E R  ==================================*/
#login_register{
    padding: 100px 20px;
}
#login_register span{
    font-size: 12px;
    color: #999;
}
#login_register input{
    margin: 0 0 20px 0;
}
#button_login{
    width: 200px;
}
#button_register{
    float: left;
}
#button_recovery{
    float: right;
}





/* ===========================   S E T U P  ==================================*/

#station_menu{
    text-align: right;
    padding: 0 20px;
}
#station_menu a{
    text-decoration: underline;
    color: #009;
    padding-right: 10px;
}
#button_clear_all{
    float: left;
}
.icon_info{
    cursor: pointer;
    float: right;
}

#station_setup{
    text-align: left;
    padding: 10px 30px;
}
#station_setup textarea{
    width: 670px;
    height: 150px;
}
.station_setup_block{
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
}
.block_settings{
    padding-left: 20px;
}
input#station_callsign { font-weight: bold; }
input#station_name { width: 580px; }
input#setup_cluster { width: 670px; }
input#admin_calls { width: 670px; }

#stations_link{
    font-size: 14px;
    padding-left: 30px;
}
#stations_link a{
    color: #009;
    text-decoration: underline;
    font-weight: bold;
}


</style>
