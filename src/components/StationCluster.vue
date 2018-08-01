<template>

     <div id="cluster">
<!--      
    <div id="view_send_form"><input type="button" class="btn4" value="Send spot"></div>
    
   <form id="send_spot">
      <table id="send_spot_layout">
        <tr>
          <td class="spot_call" style="color: #aaa;">DX call</td>
          <td class="spot_band" style="color: #aaa;">MHz</td>
          <td class="spot_text" style="color: #aaa;">Info</td>
          <td class="spot_spotter" style="color: #aaa;">Your call</td>
          <td class="spot_btn"></td>
        </tr>
        <tr>
          <td class="spot_call"><input type="text" id="spot_call" value="R7AB/M" disabled /></td>
          <td class="spot_band"><input type="text" id="spot_band" value="14018.9" /></td>
          <td class="spot_text"><input type="text" id="spot_text" value="www.TNXQSO.com" /></td>
          <td class="spot_spotter"><input type="text" id="spot_spotter" value="R7CL" /></td>
          <td class="spot_btn"><input type="button" id="button_send_spot" class="btn4" value="Send spot" /></td>
        </tr>
        <tr>
          <td class="spot_text text_btns" colspan="5">
            <input type="button" class="add_text_btn" value="RDA" /> 
            <input type="button" class="add_text_btn" value="RAFA" /> 
            <input type="button" class="add_text_btn" value="Locator" /> 
            <input type="button" class="add_text_btn" value="User#1" /> 
            <input type="button" class="add_text_btn" value="User#2" /> 
          </td>
        </tr>
      </table>
      </form>

      <div id="spam" class="warning"><div id="warning_border">
          <span>Spam protection!</span> &nbsp; This spot can be send after <b>45</b> second.
      </div></div>
 --> 


        <table id="cluster">
            <tr v-for="spot in data" :class="{new: spot.new, highlight: spot.highlight}">
                <td class="time">{{spot.time}}z</td>
                <td class="band">{{spot.freq}}</td>
                <td class="mode">{{spot.subMode ? spot.subMode : spot.mode}}</td>
                <td class="call">
                    <a :href="'http://qrz.com/db/' + spot.cs" target="_blank" 
                        rel="noopener" title="Link to QRZ.com">{{replace0(spot.cs)}}</a>
                </td>
                <td class="text">{{spot.text}}</td>
                <td class="spotter">{{spot.de}}</td>
            </tr>
        </table>
        <a href="http://adxcluster.com" target="_blank" rel="noopener">adxcluster.com</a>                   
    </div>
</template>

<script>
import {replace0} from '../utils'
import tabMixin from '../station-tab-mixin'
export default {
  mixins: [tabMixin],
  name: 'StationCluster',
  data () {
    return {
      tabId: 'cluster',
      replace0: replace0
    }
  }
}
</script>

<style scoped>
</style>
