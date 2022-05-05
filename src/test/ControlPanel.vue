<template>
    <div style="font-size:15px">

        <!-- date picker row -->
        <div style="font-weight: bold; font-size:20px">
            <p align="left" style="color:white">INVESTMENT TIME:</p >
        </div>
        <div
            :style="{
                'margin-top':date_picker_row_margin_top + 'px',
                'min-height': date_picker_row_min_height +'px',
            }">
            <div> 
                <ui-datepicker
                    placeholder="Select a start date"
                    v-model="start_date"
                    style="width: 50%; float: left; color:rgba(0,0,0);"
                    :customFormatter="date_format"
                >
                Start Date
                </ui-datepicker>
            </div>
            <div> 
                <ui-datepicker
                    placeholder="Select a end date"
                    v-model="end_date"
                    style="width: 50%; float: left"
                    :customFormatter="date_format"
                >
                End Date
                </ui-datepicker>
            </div>
        </div>

        <!-- model select row -->
        <div
            :style="{
                'margin-top':model_select_row_margin_top + 'px',
                'min-height': model_select_row_min_height +'px',
            }">
            <ui-radio-group
                name="time_interval"
                :options="interval_options"
                v-model="time_interval"
                :vertical="false"
            >
            Display Interval
            </ui-radio-group>
        </div>



        <div style="margin-top:10px;font-weight: bold; font-size:18px">
            <p align="left" style="color:white">STOCK LIST:</p >
        </div>


        <div style="margin-top:-10px;margin-right:100px">
            <ui-select
                label="Initial Stock Pool"
                multiple
                placeholder="Choose Stock Space"
                :options="IndexList"
                v-model="indexSpace"
            >
            </ui-select>

            <ui-select
                label="Ranking Strategy"
                placeholder="Choose Rencent Exposure"
                :options="strategies"
                v-model="strategy"
            >
            </ui-select>
        </div>

        <!-- <div style="margin-top:-10px;margin-left:200px;">
            <p style="color:white"> Dolorem</p>
        </div> -->

        <ui-button
            color="default"
            icon="arrow_forward"
            iconPosition="right"
            size="normal"
            style="position:left; width: 83.5%;font-size:18px;"
            :disabled="get_disabled_draw_btn"
            @click="draw_and_sort"
        >
        Sort & Draw
        </ui-button>

        <!-- 20201122 -->
        <div id="lb"
            style="overflow:auto;height:1500px;margin-top:70px;">
            <div>
                <ui-collapsible v-bind:title="'All stocks in market'" style="width: 90%;margin-bottom: 20px;" open></ui-collapsible>
                    <div style="overflow:scroll;height:1200px;margin-top:-20px">
                    <div
                        class="row"
                        v-for="(sts_code, sindex) in market.data"
                        v-bind:key="sindex"
                        
                    >
                        <ui-alert :dismissible="false" remove-icon v-show="true"
                                style="
                                margin-top:0px;
                                margin-left:4%;
                                margin-right:14%;
                                margin-bottom:0%;
                                "
                        >
                            {{sts_code}}
                        </ui-alert>
                    </div>
                    </div>
            </div>
        </div>
        <!-- 20201122 END -->



        <!-- table row -->
        <div 
            style="overflow:auto;"
            :style="{
              'height':table_row_height + 'px',
              'margin-top':60 + 'px',
              }">
            <div
                v-for="(ts_codes, industry, iindex) in get_stocks_with_type"
                v-bind:key="iindex"
            >
                <ui-collapsible v-bind:title="industry" style="width: 90%;">
                    <div
                        class="row"
                        v-for="(ts_code, index) in ts_codes"
                        v-bind:key="index"
                    >
                        <ui-alert
                            @dismiss="drop_stock(ts_code)"
                            remove-icon v-show="true"
                            style="
                                margin-left:5%;
                                margin-right:5%;
                                margin-bottom:1%;
                                "
                        >
                        {{index + 1}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ts_code}}
                        </ui-alert>
                    </div>
                </ui-collapsible>
            </div>
        </div>
        
        <!-- confirm row -->
        <!--
        <ui-button
            color="default"
            icon="arrow_forward"
            iconPosition="right"
            size="normal"
            style="position:absolute; width: 80%;"
            :style="{'top': control_panel_height - 36 - 20 +'px'}"
            :disabled="get_disabled_draw_btn"
            @click="draw_and_sort"
        >
        Sort & Draw
        </ui-button>
        -->
    </div>
</template>
<script>
    //import { UiAutocomplete, UiCollapsible, UiAlert, UiSelect, UiButton, UiIconButton, UiDatepicker, UiRadioGroup} from 'keen-ui';
    import { UiAutocomplete, UiCollapsible, UiAlert, UiSelect, UiButton, UiIconButton, 
      UiDatepicker, UiRadioGroup, UiCheckboxGroup, UiSlider} from 'keen-ui';
    import NetService from '@/services/net-service';
    import * as market from '@/services/market'
    import { mapState } from 'vuex';

    const Groupblock = [
        {
            label: 'Z-100',
            value: 'zz100'
        },
        {
            label: 'Z-200',
            value: 'zz200'
        },
        {
            label: 'Z-500',
            value: 'zz500'
        }
    ];

    const Groupnum = [
        {
            label: '10',
            value: 10
        },
        {
            label: '20',
            value: 20
        },
        {
            label: '30',
            value: 30
        },
        {
            label: '50',
            value: 50
        }
    ];

    export default {
        name: 'ControlPanel',
        components: {
            UiAutocomplete,
            UiCollapsible,
            UiAlert,
            UiSelect,
            UiButton,
            UiIconButton,
            UiDatepicker,
            UiRadioGroup,
            UiCheckboxGroup,
            UiSlider,
        },
        data() {
            return {
                industries: [],
                // 不分类别
                stock_securities: [],
                // store the selection temporary
                stock_security: null,
                // store the selection temporary
                industry_selection: '',
                start_date: new Date(2014, 0, 1),
                end_date: new Date(2015, 0, 1),
                disabled_draw_btn: false,
                disabled_backtest_btn: false,
                // model_selection: 'lasso_cv',
                // model_options: [
                //     {
                //         label: 'LassoCV',
                //         value: 'lasso_cv'
                //     },
                //     {
                //         label: 'ELNetApp',
                //         value: 'elastic_net'
                //     },
                //     {
                //         label: 'Lasso',
                //         value: 'lasso'
                //     },
                //     {
                //         label: 'Integrate',
                //         value: 'integrate'
                //     }
                // ],
                time_interval: 'monthly',
                interval_options: [
                    {
                        label: 'Monthly',
                        value: 'monthly'
                    },
                    {
                        label: 'Weekly',
                        value: 'weekly'
                    },
                    {
                        label: 'Daily',
                        value: 'daily'
                    },
                ],
                // layout params
                industry_select_row_min_height: 100,
                industry_select_row_margin_top: 10,
                stock_select_row_min_height: 70,
                stock_select_row_margin_top: 10,
                date_picker_row_min_height: 50,
                date_picker_row_margin_top: 0,
                model_select_row_min_height: 70,
                model_select_row_margin_top: -20,

                //ghj

                // groupblock: [],
                // slider1: 7,
                // groupnum: 20,
                // options: {
                //     Groupblock,
                //     // Groupdate,
                //     Groupnum
                // },

                stk_entries: 20,
                indexSpace:['All the stocks'],
                IndexList : ['All the stocks','ZZ-100','ZZ-200','ZZ500','HS-300','SH-50','SH-100','SH-150','SZ-up','SZ-mid','SZ-down'],

                strategy: '',
                strategies:[
                    'Selected factor exposures in 1 month',
                    'Selected factor exposures in 3 months',
                    'Selected factor exposures in 6 months',
                    'All factor exposures in 1 month',
                    'All factor exposures in 3 months',
                    'All factor exposures in 6 months',],

                options: {
                    Groupnum,
                },
                market,
            }
        },
        mounted(){
            this.$nextTick(()=>{
                this.init();
            })
        },
        computed: {
            ...mapState(['height', 'stock_list', 'selected_factors']),
            get_stocks_with_type(){
                let res = {};
                let a = this.stock_list;
                for(let i in a){
                    let industry = a[i].industry;
                    if(res[industry] === undefined){
                        res[industry] = [];
                    }
                    res[industry].push(a[i].ts_code);
                }
                return res;
            },

            get_disabled_draw_btn(){
                return this.disabled_draw_btn;
            },

            get_disabled_backtest_btn(){
                return this.disabled_backtest_btn;
            },

            control_panel_height(){
                return this.height;
            },

            table_row_height(){
                let top_parts_height = this.industry_select_row_min_height + this.stock_select_row_min_height +
                    this.date_picker_row_min_height + this.model_select_row_min_height;
                let top_parts_margin = this.industry_select_row_margin_top + this.stock_select_row_margin_top + 
                    this.date_picker_row_margin_top + this.model_select_row_margin_top;

                return this.height - top_parts_height - top_parts_margin - 56 - 30;
            },

        },
        watch: {
          start_date(val, oldVal){
            this.draw_factor_view();
          },
          end_date(val, oldVal){
            this.draw_factor_view();
          },
          time_interval(val, oldVal){
            this.draw_factor_view();
          },
          stock_list(val, oldVal){
            this.draw();
          }
        },
        methods: {
            init(){
                NetService.all_securities((res, err) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    if(!res.data){
                        console.log('data not exists!');
                        return;
                    }
                    this.stock_securities = res.data;
                });
                NetService.all_industries((res, err) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    if(!res.data){
                        console.log('data not exists!');
                        return;
                    }
                    this.industries = res.data;
                });
            },

            draw_factor_view(){
              var prefixInteger=(num, n)=>{
                  return (Array(n).join(0) + num).slice(-n);
              }

              // let start_date = this.start_date.getFullYear() + '-' + prefixInteger(this.start_date.getMonth() + 1, 2) + '-01' ;
              // let end_date = this.end_date.getFullYear() + '-' + prefixInteger(this.end_date.getMonth() + 1, 2) + '-01';
              let start_date = this.start_date.getFullYear()
                + '-' + prefixInteger(this.start_date.getMonth() + 1, 2)
                + "-" + prefixInteger(this.start_date.getDate(), 2);
              let end_date = this.end_date.getFullYear()
                + '-' + prefixInteger(this.end_date.getMonth() + 1, 2)
                + "-" + prefixInteger(this.end_date.getDate(), 2);

              if(start_date >= end_date){
                  alert("Please choose proper date range!");
              }
              else{
                  this.$store.commit('start_date', start_date);
                  this.$store.commit('end_date', end_date);
              }
              var kwargs = {
                "0_Banking_0": "000001.SZ",
                "train_model": "integrate"
              };
              kwargs["selected_factors"] = this.selected_factors
              NetService.get_prediction_data(start_date, end_date, this.time_interval, kwargs, (res, err) => {
                  if(err){
                      console.error(err);
                      return;
                  }
                  if(!res.data){
                      console.log('data not exists!');
                      return;
                  }
                  this.$store.commit('draw_overview', res.data["overview"]);
                  this.$store.commit('draw_rt_streamgraph', res.data["rt_streamgraph"]);
                  this.$store.commit('draw_ac_streamgraph', res.data["ac_streamgraph"]);

                  this.$store.commit('draw_aggragate', res.data["overview_aggregate"]);
                  this.$store.commit('reset_selected_factors');
                  this.$store.commit('reset_selected_stocks');
                  this.$store.commit('reset_bunch_backtest');
                  this.$store.commit('reset_backtest');
              });
            },

            draw_and_sort(){
              this.append_factors_stocks()
            },

            append_factors_stocks() {
                // 将股票列表隐藏
                var leftbottom = document.getElementById("lb")
                leftbottom.style.display = 'none'

                // console.log("stock_list", this.stock_list)

                let all_factors = [
                        'QRG', 'CRG', 'saleinv', 'salecash', 'CFdebt', 'QR', 'CR', 'RDsales', 'RD', 'cashpr', 
                        'cash', 'CT', 'PA', 'ROA', 'ROE', 'ACCP', 'ACC', 'TAXchg', 'PMG', 'SgINVg', 'SG', 'INVchg',
                        'INVG', 'BVEG', 'LG', 'AG', 'SP', 'DP', 'OCFP', 'CFP', 'EP', 'LEV', 'AM', 'BM', 'lagretn', 
                        'imom', 'momchg', 'mom6', 'mom12', 'age', 'sharechg', 'LM', 'illq', 'retnmax', 'std_dvol', 
                        'volumed', 'std_turn', 'turn', 'coskew', 'skew', 'idskew', 'total_vol', 'idvol', 'betad', 'beta', 
                        'size']
            
                // let start_date = this.start_date
                var prefixInteger=(num, n)=>{
                  return (Array(n).join(0) + num).slice(-n);
                }
            
                let end_date = this.end_date.getFullYear()
                    + '-' + prefixInteger(this.end_date.getMonth() + 1, 2)
                    + "-" + prefixInteger(this.end_date.getDate(), 2);
                
                let selected_factors
                if(this.strategy.substring(0,1) == 'S'){
                    selected_factors = this.selected_factors;
                    var temp = this.strategy.substring(29,30)   //长度
                }else{
                    selected_factors = all_factors;
                    this.$store.commit('add_all_factors', all_factors);
                    var temp = this.strategy.substring(24,25)   //长度
                }
                // console.log(this.selected_factors, temp)
                var last_time = (dt_str, date_length) => {
                    console.log(dt_str)
                    let parts = dt_str.split("-");
                    let dt = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
                    dt.setDate(1);
                    let new_month;
                    let new_year;
                    if(dt.getMonth() - date_length >= 1){
                        new_month = dt.getMonth() - date_length;
                        new_year = dt.getFullYear();
                    }else{
                        new_month = dt.getMonth() - date_length + 12;
                        new_year = dt.getFullYear() - 1;
                    }
                    if(new_month < 9){
                        new_month = '0' + (new_month % 12 + 1);
                    }else{
                        new_month = new_month % 12 + 1;
                    }
            
                    return new_year + "-" + new_month + "-01";
                }
                
            
                let start_date
                var temp_int = parseInt(temp);
                start_date = last_time(end_date, temp_int);
                // console.log(start_date, end_date, selected_factors)
                NetService.get_recommend_stocks(start_date, end_date, selected_factors, (res, err) => {
                    // 删除之前已经存在的股票
                    this.$store.commit('clear_stocks');
                    console.log("res",res)
                    for(let i in res.data){
                        this.$store.commit('append_stock', res.data[i]);
                    }
                });
            },

            append_industry(){
                NetService.get_stocks_info(this.industry_selection, (res, err) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    if(!res.data){
                        console.log('data not exists!');
                        return;
                    }
                    this.$store.commit('clear_stocks');
                    for(let i in res.data){
                        this.$store.commit('append_stock', res.data[i]);
                    }
                });
            },

            date_format(original_date){
              var prefixInteger=(num, n)=>{
                  return (Array(n).join(0) + num).slice(-n);
              }

              let custom_format = original_date.getFullYear() 
                + "/" + prefixInteger(original_date.getMonth() + 1, 2)
                + "/" + prefixInteger(original_date.getDate(), 2);
              return custom_format
            },

            append_stock() {
                NetService.get_stock_info(this.stock_security, (res, err) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    if(!res.data){
                        console.log('data not exists!');
                        return;
                    }

                    this.$store.commit('append_stock', res.data);
                });
            },

            // 根据股票代码删除
            drop_stock(ts_code){
                this.$store.commit('drop_stock', ts_code);
            },
            

            draw(){
                var that = this;
                var prefixInteger=(num, n)=>{
                    return (Array(n).join(0) + num).slice(-n);
                }
                new Promise(function(resolve){

                    that.disabled_draw_btn = true;

                    if(that.stock_list.length <=0 ){
                        //alert("Please choose some securities!");
                        resolve();
                    }
                    else if(!(that.start_date instanceof Date) || !(that.end_date instanceof Date)){
                        alert("Please choose proper date range!");
                        resolve();
                    }
                    else{

                        // let start_date = that.start_date.getFullYear() + '-' + prefixInteger(that.start_date.getMonth() + 1, 2) + '-01' ;
                        // let end_date = that.end_date.getFullYear() + '-' + prefixInteger(that.end_date.getMonth() + 1, 2) + '-01';
                        let start_date = that.start_date.getFullYear()
                          + '-' + prefixInteger(that.start_date.getMonth() + 1, 2)
                          + "-" + prefixInteger(that.start_date.getDate(), 2);
                        let end_date = that.end_date.getFullYear()
                          + '-' + prefixInteger(that.end_date.getMonth() + 1, 2)
                          + "-" + prefixInteger(that.end_date.getDate(), 2);

                        if(start_date >= end_date){
                            alert("Please choose proper date range!");
                            resolve();
                        }
                        else{
                            that.$store.commit('start_date', start_date);
                            that.$store.commit('end_date', end_date);

                            let kwargs = {};
                            let global_index = 0;
                            for(let i in that.stock_list){
                                let ts_code = that.stock_list[i]['ts_code'];
                                let industry = that.stock_list[i]['industry'];
                                // kwargs[industry + '_' + (that.stock_list.length - 1 - i)] = ts_code
                                kwargs[global_index + '_' + industry + '_' + i] = ts_code
                                global_index += 1;
                            }
                            // kwargs["train_model"] = that.model_selection;
                            kwargs["train_model"] = "integrate";

                            // kwargs["factor_list"] = factor
                            kwargs["selected_factors"] = that.selected_factors

                            NetService.get_prediction_data(start_date, end_date, that.time_interval, kwargs, (res, err) => {
                                if(err){
                                    console.error(err);
                                    resolve()
                                    return;
                                }
                                if(!res.data){
                                    console.log('data not exists!');
                                    resolve()
                                    return;
                                }
                                // alert(Object.keys(res.data["overview"]))
                                // console.log(Object.keys(res.data["overview"]))
                                // console.log(res.data["overview"]["2015-06-01"])
                                // console.log(Object.keys(res.data["individuals"]))
                                // console.log(res.data["individuals"]["Banking"])
                                // console.log(Object.keys(res.data["overview_aggregate"]))
                                // console.log(res.data["overview_aggregate"]["positive"])

                                // that.$store.commit('draw_overview', res.data["overview"]);
                                that.$store.commit('draw_individuals', res.data["individuals"]);
                                // that.$store.commit('draw_aggragate', res.data["overview_aggregate"]);
                                // that.$store.commit('reset_selected_factors');
                                that.$store.commit('reset_selected_stocks');
                                that.$store.commit('reset_bunch_backtest');
                                that.$store.commit('reset_backtest');
                                resolve()
                            });
                        }
                    }
                }).then(function(){
                    that.disabled_draw_btn = false;
                })
            },
        }
    }
</script>

<style scoped>
>>> .ui-select__display-value.is-placeholder {
  color: rgb(255 255 255 / 1);
}

>>> .ui-datepicker__label-text{
  color:white
}

>>> .ui-datepicker__display{
  color:white
}

>>> .ui-radio__label-text{
  color:white
}

>>> .ui-radio-group__label-text{
  color:white
}

>>> .ui-checkbox-group__label-text{
  color:white
}

>>> .ui-checkbox__label-text{
  color:white
}

/* Before Click */
>>> .ui-checkbox__checkmark:before {
    background-color: grey;
    border-color: white;
}

/* Inner After Click */
>>> .ui-checkbox__checkmark:after {
    background-color: grey;
}

/* Outer After Click */
>>> .ui-checkbox--color-primary.is-checked .ui-checkbox__checkmark:before {
    background-color: grey;
    border-color: white;
}

/* Stocks List Background */
>>> .ui-alert--type-info .ui-alert__body {
    background-color: #606060;
}

/* Stocks List Text Color */
>>> .ui-alert__body {
    color: white;
}

>>> .ui-collapsible__body {
    border: 1px solid #40404000;
}

/*Stocks Space Text Color*/
>>> .ui-select__label-text {
    color: white;
}
>>> .ui-select__display {
    color: white;
}
>>> .ui-select__display {
    border-bottom-color: rgba(255,255,255,.40);
  }

>>> .ui-datepicker__display {
    border-bottom-color: rgba(255,255,255,.40);
  }

/*
.ui-checkbox__checkmark:after {
    background-color: red;
}
*/
/*
.ui-checkbox--color-primary.is-checked .ui-checkbox__checkmark:after {
    background-color: grey;
    border-color: white;
}

.ui-checkbox--color-primary.is-checked .ui-checkbox__checkmark:before {
    background-color: grey;
    border-color: grey;
}

.ui-checkbox--color-primary:not(.-is-disabled).is-checked:hover .ui-checkbox__checkmark:before {
    background-color: grey;
    border-color: grey;
}

.ui-checkbox__checkmark:before {
    border-radius: .125rem;
    border: .125rem solid white;
    height: 100%;
    left: 0;
    top: 0;
    -webkit-transition: all .3s ease;
    transition: all .3s ease;
    width: 100%;
}
*/

>>> .ui-radio--color-primary.is-checked:not(.is-disabled) .ui-radio__inner-circle {
  background-color: #039600;
}

>>> .ui-radio--color-primary.is-checked:not(.is-disabled) .ui-radio__outer-circle {
  border-color: white;
}

>>> .ui-radio__outer-circle {
    background-color: transparent;
    border-radius: 50%;
    border:.125rem solid white;
    -webkit-transition: border-color .2s;
    transition: border-color .2s;
}
</style>
