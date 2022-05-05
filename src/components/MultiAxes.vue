<template>
  <div>
    <!--
    <ui-collapsible open title="Stock View" style="width:100%">
    </ui-collapsible>min-width: 5000px; 
    -->
    <div class="frame_header" style="width:100%; position:absolute; z-index:9">
      <label style="width:100%; text-align:left; font-weight:bold; font-size:25px">STOCK RANK TIMESERIES</label>

      <div style="position:absolute; margin-left:400px"> 
        <label style="text-align:left;font-size:20px">Top Stocks:</label>
      </div>
      <div style="position:absolute; margin-left:550px; margin-top:-10px"> 
        <ui-radio-group
            name="top_nstocks"
            :options="stocks_options"
            v-model="top_nstocks"
            :vertical="false"
        >
        </ui-radio-group>
      </div>

      <ui-select
        style="width:200px; text-align:left;position:absolute; margin-left:850px; margin-top:10px; font-size:20px"
        placeholder="Choose Page"
        :options="pages"
        v-model="whichPage"
        >
      </ui-select>

      <div style="position:absolute; margin-left:1300px"> 
        
        <ui-button
            color="default"
            icon="arrow_forward"
            iconPosition="right"
            size="small"
            @click="append_stocks(top_nstocks)"
            style="width:100%; height:40px; font-size:20px"
            >
            ADD PORTFOLIO
        </ui-button>

        <!--
        <ui-icon-button
            color="primary"
            size="mini"
            icon="add"
            @click="append_stocks(top_nstocks)"
            style="top:100%;"
        >
        </ui-icon-button>
        -->
      </div>

      <!-- <ui-select
        style="width:200px; text-align:left"
        placeholder="Choose Page"
        :options="pages"
        v-model="whichPage"
        >
      </ui-select> -->
    </div>

    <div style="margin-top: 90px" v-if="show_draw_area">
      <div v-for="plate in display_data">
          <div style="margin-top: -30px"
            v-for="stock in plate.data"
          >
            <FactorAxis
              v-bind:input_data="stock"
              v-bind:key="key_count"
            >
            </FactorAxis>
          </div>
      </div>
    </div>

    <!--
    <div v-if="show_frame_header_title" >
      <div class="frame_header" style="float:left;">
        <label style="width:100%; text-align:left;">Stock View</label>
      </div>
    </div>
    -->

  </div>
</template>

<script>
import * as d3 from "d3"
import {UiCollapsible, UiSelect, UiIconButton, UiButton, UiRadioGroup} from 'keen-ui';
import FactorAxis from "@/components/FactorAxis";
import FluctuationLine from "@/components/FluctuationLine";
import { mapState } from 'vuex';
import NetService from '@/services/net-service';

export default {
  name:"MultiAxes",
  components: {
    UiCollapsible,
    FactorAxis,
    FluctuationLine,
    UiSelect,
    UiIconButton,
    UiButton,
    UiRadioGroup, 
  },
  data() {
    return {
      // data for vue element (v-for etc.)
      vue_data: [],
      display_data: [],
      key_count: 100000,
      pages : [
        { label: 'Page 1', value: 1},
        { label: 'Page 2', value: 2},
        { label: 'Page 3', value: 3},
        { label: 'Page 4', value: 4},
        { label: 'Page 5', value: 5},
        { label: 'Page 6', value: 6},
        { label: 'Page 7', value: 7},
        { label: 'Page 8', value: 8},
        { label: 'Page 9', value: 9},
        { label: 'Page 10', value: 10},
        { label: 'Page 11', value: 11},
        { label: 'Page 12', value: 12},
        { label: 'Page 13', value: 13},
        { label: 'Page 14', value: 14},
        { label: 'Page 15', value: 15},
        { label: 'Page 16', value: 16},
        { label: 'Page 17', value: 17},
        { label: 'Page 18', value: 18},
        { label: 'Page 19', value: 19},
        { label: 'Page 20', value: 20},
      ],
      whichPage: {label:"Page 1", value: 1},
      stocks_options: [
        {label: 10, value: 10},
        {label: 20, value: 20},
        {label: 50, value: 50},
      ],
      top_nstocks: 10,
    }
  },
  computed: {
    ...mapState(['start_date', 'end_date' ,'data_individuals', 'selected_stocks']),
    show_frame_header_title(){
        if(this.data_individuals === undefined){
          return true;
        }
        else{
          return false;
        }
      },
      show_draw_area(){
        console.log(this.data_individuals)
        if(this.data_individuals === undefined){
          return false;
        }
        else{
          return true;
        }
      },
  },
  watch:{
      data_individuals: 'get_data',
      whichPage: 'get_data',
      deep: true,
      immediate: true,
  },
  methods:{
      get_data(){
        console.log("data_bunch_backtest:",this.$store.state.data_bunch_backtest);
        if(this.data_individuals == null)
          return
        this.vue_data = [];
        this.display_data = [];
        Object.entries(this.data_individuals).forEach(([key, value]) => {
          this.vue_data.push({
            name: key,
            data: value
          })
          this.display_data.push({
            name: key,
            data: value
          })
        });
        var new_data = []

        for(let i in this.vue_data[0].data){
          if((this.whichPage.value - 1) * 10 <= i && i < this.whichPage.value * 10){
            new_data.push(this.vue_data[0].data[i])
          }
        }
        this.display_data[0].data = new_data
        this.key_count += 1;

        // Sort the stocks by error_abs in each plate.
        // this.sortStocks();
      },

    append_stocks(top_nstocks){
      console.log(top_nstocks)
      console.log(this.data_individuals)
      var index = 0
      for(let stock_data of this.data_individuals["Stock Pool"]){
        var stock_name = Object.keys(stock_data)[0]
        console.log(stock_name)
        this.toggleStockSelection(stock_name)
        index += 1
        if(index >= top_nstocks)
          break;
      }
      this.getDataForeturn()

    },

      toggleStockSelection(stock_name) {
        this.$store.commit('add_select_stock', stock_name);
      },

      getDataForeturn() {
        var that = this;
        console.log(this.start_date)
        new Promise(function (resolve) {
          that.disabled_draw_btn = true;
          //action
          let start_date = that.start_date;
          let end_date = that.end_date;
          let kwargs = {};
          for(let i in that.selected_stocks){
            let ts_code = that.selected_stocks[i]
            kwargs['Stocks_' + i] = ts_code
          }
          NetService.get_stocks_return(start_date, end_date, kwargs, (res, err) => {
            if(err) {
              console.error(err);
              resolve();
              return
            }
            if(!res.data) {
              console.log('data not exists');
              resolve();
              return
            }
            that.$store.commit('draw_bunch_backtest', res.data);
            // that.$store.commit('reset_selected_stocks');
            resolve()
            })
        })
      },

      sortStocks() {
        this.vue_data.forEach(plate => {
          plate.data.sort((a, b) => {
            var a_err = this.getCumErr(a[Object.keys(a)[0]]);
            var b_err = this.getCumErr(b[Object.keys(b)[0]]);
            return a_err - b_err
          })
        })
      },
      getCumErr(stock) {
        var cum_error = d3.sum(stock, d => d.error_abs)
        return cum_error;
      }
  }
  // mounted() {
  //   this.$nextTick(function foo() {
  //     var that = this;
  //     d3.json("/static/temp(1).json", function(err, json) {
  //       if (err) {console.error(err);}
  //       console.log(json);
  //       Object.entries(json).forEach(([key, value]) => {
  //         console.log(key, value);
  //         that.vue_data.push({
  //           name: key,
  //           data: value
  //         })
  //       });
  //     })
  //   })
  // },
}
</script>

<style scoped>
    .ui-collapsible__body{
        padding: 0%;
    }

    .ui-collapsible__header {
        font-size: 18px;
    }

/*
>>> .ui-radio--color-primary.is-checked:not(.is-disabled) .ui-radio__inner-circle {
  background-color: #039600;
}
*/


/*
.test .ui-select{
      .ui-select__content{
        .ui-selecet__label{
          .ui-selecet__label-test{
            color:white;
          }
        }
      }
    }
*/

/*
.ui-select__label-text{
    color: black;
}
.ui-select__display{
    color: black;
}
.ui-select__display {
    border-bottom-color: rgba(255,255,255,.40);
  }
*/
</style>
