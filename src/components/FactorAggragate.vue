<template>
    <div style="position: relative ;padding-left: 0px">
        <div class="frame_header">
            <!-- <label style="font-weight: bold;">Aggragate</label> -->
            
        </div>

        <div id="bars" class="draw-area" style="position:absolute;float:left;width:95%;" ref="chartRef"
            :style="{'height': (factor_aggragate_height - frame_header_height) + 'px'}">
<!--            <svg></svg>-->
        </div>

        <!-- <div style="position:absolute;right:0;float:left;width:18%; overflow:auto; margin-top:-2px;"
            :style="{'height': (factor_aggragate_height - frame_header_height - 32) + 'px'}">
            <v-table
                is-horizontal-resize
                is-vertical-resize
                :title-row-height=0
                :row-click="del_table_row"
                style="width:100%;"
                :columns="columns"
                :table-data="tableData"
                row-hover-color="#eee"
            ></v-table>
        </div> -->

        <!--
        <div style="float:left;width:21%;overflow:hidden">
            <ui-button
                color="primary"
                size="small"
                icon="arrow_downward"
                iconPosition="right"
                :disabled="get_disabled_draw_btn"
                @click="getDataBunchBacktest"
                style="width:100%;height:32px"
                >
                draw
            </ui-button>
        </div>
        -->
    </div>
</template>

<script>
    import * as echarts from 'echarts';
    import * as d3 from "d3";
    import { UiButton } from 'keen-ui';
    import 'vue-easytable/libs/themes-base/index.css'
    import { VTable } from 'vue-easytable'
    import { mapState } from 'vuex';
    import NetService from '@/services/net-service';
    import C from './constants.js';

    export default{
        name: "FactorAggragate",
        components: {
            UiButton,
            VTable,
        },
        data(){
            return {
                disabled_draw_btn: false,
                svg_width_percent: 1.0,
                columns: [
                    {field: 'factor', title: 'Factors', width: 70, titleAlign: 'center', columnAlign: 'center',isResize:true},
                ],
                frame_header_height: C.FRAME_HEADER_HEIGHT,
                chart: undefined,
                options: {},
                data: {},
                colorlist: {},
            };
        },
        computed: {
            ...mapState(['start_date', 'end_date', 'stock_list','width','height','selected_factors', 'data_aggragate']),
            width_or_height(){
                return [this.width, this.height];
            },
            get_disabled_draw_btn(){
                return this.disabled_draw_btn;
            },
            tableData(){
                let res = [];
                for(let i=0;i<this.selected_factors.length;i++){
                    res.push({"factor": this.selected_factors[i]});
                }
                if(this.selected_factors.length === 0){
                  res.push({"factor": "None"})
                }
                return res;
            },
            factor_aggragate_height(){
                return Math.floor((this.height - 15) * 0.41);
            },
        },
        watch:{
            data_aggragate: 'draw_aggragate',
            width_or_height: 'draw_aggragate',
            selected_factors: 'draw_aggragate',
            deep: true,
            immediate: true
        },
        mounted(){

        },
        methods:{
            del_table_row(rowIndex, rowData, column){
                this.$store.commit('rm_selected_factor', rowData["factor"]);
            },
            getDataBunchBacktest(){
                var that = this;
                new Promise(function(resolve){
                    that.disabled_draw_btn = true;
                    // action
                    let start_date = that.start_date;
                    let end_date = that.end_date;
                    let factors_list = that.selected_factors;
                    let kwargs = {};
                    for(let i in that.stock_list){
                        let ts_code = that.stock_list[i]['ts_code'];
                        let industry = that.stock_list[i]['industry'];
                        kwargs[industry + '_' + i] = ts_code
                    }
                    for(let i in factors_list){
                        let factor = factors_list[i];
                        kwargs['factor_' + i] = factor;
                    }
                    kwargs["prediction_model"] = 'ols';
                    NetService.get_bunch_single_backtest(start_date, end_date, kwargs, (res, err) => {
                        if(err){
                            // console.error(err);
                            resolve();
                            return
                        }
                        if(!res.data){
                            //console.log('data not exists!');
                            resolve();
                            return
                        }
                        // console.log("test bunch backtest: ",res.data);
                        that.$store.commit('draw_bunch_backtest', res.data);
                        that.$store.commit('reset_selected_stocks');
                        resolve()
                    });
                }).then(function(){
                    that.disabled_draw_btn = false;
                })
            },

            draw_aggragate(){
                //console.log('data_aggragate:', this.data_aggragate);
                let rawdata = this.data_aggragate;
                if(rawdata === undefined){
                    return;
                }
                // rawdata.positive.B['a'] = 'a';  //补长度
                // rawdata.positive.B['b'] = 'a';  //补长度
                // rawdata.positive.B['c'] = 'a';  //补长度
                // Object.keys(rawdata.positive).forEach(item => {
                //     console.log(item);
                //     const length = Object.keys(rawdata.positive[item]).length;
                //     console.log(length);
                //     if (length < 6) {
                //         for (let i = 0; i < 6 - length; i++) {
                //             rawdata.positive[item][i] = 0;
                //         }
                //     }
                // })

                const arr = {}
                const sum = {}
                console.log("raw data")
                console.log(rawdata.positive)
                // arr.A = Object.keys(rawdata.positive.A).sort(function(a, b){
                //     return rawdata.positive.A[a] > rawdata.positive.A[b]
                // })

                // console.log(typeof(rawdata.positive.A))
                arr.A = Object.keys(rawdata.positive.A).sort(function sortkeys(a,b){
                    return rawdata.positive.A[b] - rawdata.positive.A[a]
                })
                arr.B = Object.keys(rawdata.positive.B).sort(function sortkeys(a,b){
                    return rawdata.positive.B[b] - rawdata.positive.B[a]
                })
                arr.C = Object.keys(rawdata.positive.C).sort(function sortkeys(a,b){
                    return rawdata.positive.C[b] - rawdata.positive.C[a]
                })
                arr.D = Object.keys(rawdata.positive.D).sort(function sortkeys(a,b){
                    return rawdata.positive.D[b] - rawdata.positive.D[a]
                })
                arr.E = Object.keys(rawdata.positive.E).sort(function sortkeys(a,b){
                    return rawdata.positive.E[b] - rawdata.positive.E[a]
                })
                arr.F = Object.keys(rawdata.positive.F).sort(function sortkeys(a,b){
                    return rawdata.positive.F[b] - rawdata.positive.F[a]
                })

                sum.A = 0
                sum.B = 0
                sum.C = 0
                sum.D = 0
                sum.E = 0
                sum.F = 0

                const obj = {}
                const obj_width = {}
                const color_val = {}
                const color_type = {
                "A": "#3690c0", 
                "B" : "#996699", 
                "C": "#84a7b2", 
                "D": "#509766", 
                "E": "#EEAD0E", 
                "F": "#CD6600"
                }
                Object.keys(rawdata.positive).forEach(item => obj[item] = {})
              
                // console.log(rawdata.positive);
                for (let i = 0; i < 6; i++) {
                    let prop = '';
                    if (i === 0) prop = 'A';
                    if (i === 1) prop = 'B';
                    if (i === 2) prop = 'C';
                    if (i === 3) prop = 'D';
                    if (i === 4) prop = 'E';
                    if (i === 5) prop = 'F';
                    Object.keys(obj).forEach((item,index) => {
                        arr[prop].forEach((val, j) => {
                            // console.log(item, val, prop, val)
                            if (index === j) {
                                obj[item][val] = rawdata.positive[prop][val]
                                sum[prop] += obj[item][val]
                                color_val[val] = color_type[prop]
                            }
                        })
                    })
                }
                for (let i = 0; i < 6; i++) {
                    let prop = '';
                    if (i === 0) prop = 'A';
                    if (i === 1) prop = 'B';
                    if (i === 2) prop = 'C';
                    if (i === 3) prop = 'D';
                    if (i === 4) prop = 'E';
                    if (i === 5) prop = 'F';
                    Object.keys(obj).forEach((item,index) => {
                        arr[prop].forEach((val, j) => {
                            // console.log(item, val, prop, val)
                            if (index === j) {
                                obj_width[val] = rawdata.positive[prop][val] * 6/ sum[prop]
                            }
                        })
                    })
                }

                this.colorlist = color_val;
                this.data = rawdata.positive;
                this.data_width = obj_width;
                console.log("draw aggregate")
                console.log(this.selected_factors)
                // console.log(this.data);
                // console.log(this.data_width);
                this.drawBar();
                // const root_div = d3.select(this.$el);
                // const bounding_rect = root_div.node().getBoundingClientRect()
                //
                // const margin = {
                //     top: 5,
                //     right: 15,
                //     bottom: 10,
                //     left: 5
                // }
                // const width = bounding_rect.width * this.svg_width_percent - margin.left - margin.right;
                // const height = bounding_rect.height - margin.top - margin.bottom - C.FRAME_HEADER_HEIGHT;
                //
                // d3.select(this.$el)
                //     .select(".draw-area")
                //     .select("svg")
                //     .remove();
                //
                // var svg = d3.select(this.$el)
                //     .select(".draw-area")
                //     .append("svg")
                //     .attr("width", width + margin.left + margin.right)
                //     .attr("height", height + margin.top + margin.bottom )
                //     .append("g")
                //     .attr("transform", "translate(0," + margin.top + ")");

                /*
                // var tooltip = d3.select("body").append("div")
                //     .attr("class", "tooltip")
                //     .style("opacity", 0);

                var allValues = [];
                var data = rawdata['negative'];
                var bandNum = -1;
                Object.keys(data).forEach((key) => {
                    allValues = allValues.concat(d3.min(Object.values(data[key])));
                    bandNum = Math.max(bandNum, Object.keys(data[key]).length);
                });
                var bandWidth = width / bandNum / 2;
                var data = rawdata['positive'];
                Object.keys(data).forEach((key) => {
                    allValues = allValues.concat(d3.max(Object.values(data[key])));
                });

                var pad = height/12;
                var yScale = d3.scaleLinear()
                        .domain([0, d3.max(d3.extent(allValues).map(d => Math.abs(d)))])
                        .range([pad, 0]);

                var fill = d3.scaleOrdinal()
                        .domain(["A", "B", "C", "D", "E", "F"])
                        .range(C.FACTOR_TYPE_COLORMAP);

                // var legends = {
                //     "transaction_friction_factor": "Transaction",
                //     "momentum_factor": "Momentum",
                //     "value_factor": "Value",
                //     "growth_factor": "Growth",
                //     "profit_factor": "Profit",
                //     "financial_liquidity_factor": "Liquidity",
                // };

                // var legend = svg.append("g").selectAll('.legend')
                //         .data(Object.values(legends))
                //         .enter()
                //         .append('g')
                //         .attr("class", "legends")
                //         .attr("transform", (d, i) => "translate(0," + (pad + 2 * i * pad - 10) + ")");

                // legend.append('rect')
                //     .attr("x", 0)
                //     .attr("y", 0)
                //     .attr("width", 15)
                //     .attr("height", 15)
                //     .style("fill", (d, i) => fill(i))
                //     .on('mouseover',function(d) {
                //         d3.select(this)
                //             .style("cursor", "pointer");
                //         // tooltip.transition()
                //         //     .duration(200)
                //         //     .style("opacity", .9);
                //         // tooltip.html(d)
                //         //     .style("left", (d3.event.pageX) + "px")
                //         //     .style("top", (d3.event.pageY - 28) + "px");
                //     })
                //     .on('mouseout', function() {
                //         d3.select(this)
                //             .style("cursor", "default");
                //         // tooltip.transition()
                //         //     .duration(500)
                //         //     .style("opacity", 0);
                //     })
                //     .each(function(d){
                //         d3.select(this).append("title")
                //             .classed("tooltip", true)
                //             .text(function(d) { return d});
                //     });

                var that = this;
              console.log("Aggregate")
              console.log(data)

                Object.keys(rawdata).forEach((type, typeIdx) => {
                    var data = rawdata[type];

                    Object.keys(data).forEach((key, idx) => {
                        var xScale = d3.scaleBand()
                            .domain(Object.keys(data[key]))
                            .range([10, width])
                            .padding(1);

                        var classData = [];
                        Object.keys(data[key]).forEach((factor) => {
                            var temp = {};
                            temp.name = factor;
                            temp.value = data[key][factor];
                            classData.push(temp);
                        });

                        svg.append('g')
                            .selectAll(".bar")
                            .data(classData)
                            .enter()
                            .append("rect")
                            .attr("class", d => d.name)
                            .attr("x", d => xScale(d.name)- bandWidth/2)
                            .attr("width", bandWidth)
                            .attr("y", d =>  d.value > 0? yScale(d.value) + 2 * idx * pad:pad + 2 * idx * pad)
                            .attr("height", d => pad - yScale(Math.abs(d.value)))
                            // .style('fill',d=>{
                            //     if(that.selected_factors.indexOf(d.name) >= 0){
                            //         return d3.rgb(fill(key)).darker(2);
                            //     }
                            //     else{
                            //         return fill(key);
                            //     }
                            // })
                            .style('fill', fill(key))
                            .on('click',function clickevent() {
                                var factor_name = d3.select(this).attr("class");
                                if(that.selected_factors.indexOf(factor_name) >= 0){
                                    d3.select(that.$el).selectAll("."+factor_name).style("stroke", "none");
                                    // d3.select(this).style('fill',fill(key));
                                    that.$store.commit('rm_selected_factor', factor_name);
                                } else {
                                    d3.select(that.$el).selectAll("."+factor_name)
                                        .style("stroke", 'red')
                                        // .style("stroke", d3.rgb(fill(key)).darker(1))
                                        .style("stroke-width", 2)
                                        .style("stroke-opacity", 1);
                                    // d3.select(this).style('fill', d3.rgb(fill(key)).darker(2));
                                    that.$store.commit('add_select_factor', factor_name);
                                }
                            })
                            .on('mouseover', function over() {
                                var factor_name = d3.select(this).attr("class");
                                if(that.selected_factors.indexOf(factor_name) >= 0){
                                    d3.select(this)
                                        .style("cursor", "pointer");
                                } else {
                                    d3.select(this)
                                        .style("cursor", "pointer")
                                        .style("stroke", 'red')
                                        // .style("stroke", d3.rgb(fill(key)).darker(1))
                                        .style("stroke-width", 2)
                                        .style("stroke-opacity", 1);
                                }
                                // tooltip.transition()
                                //     .duration(200)
                                //     .style("opacity", .9);
                                // tooltip.html(d.value.toFixed(4))
                                //     .style("left", (d3.event.pageX) + "px")
                                //     .style("top", (d3.event.pageY - 28) + "px");
                            })
                            .on('mouseout', function out() {
                                var factor_name = d3.select(this).attr("class");
                                if(that.selected_factors.indexOf(factor_name) >= 0){
                                    d3.select(this)
                                        .style("cursor", "default");
                                } else {
                                    d3.select(this)
                                        .style("cursor", "default")
                                        .style("stroke", "none");
                                }
                                // tooltip.transition()
                                //     .duration(500)
                                //     .style("opacity", 0);
                            })
                            .each(function(d){
                                d3.select(this).append("title")
                                    .classed("tooltip", true)
                                    .text(function(d) { return d.value.toFixed(2) + '%' });
                            });

                        var xScale = d3.scaleBand()
                            .domain(Object.keys(data[key]))
                            .range([10, width])
                            .padding(1);

                        if(typeIdx == 0){
                            svg.append("g")
                                .attr("transform", "translate(0," + (pad + 2 * idx * pad) + ")")
                                .call(d3.axisBottom(xScale))
                                .selectAll("text")
                                .style("text-anchor", "middle")
                                .attr('x', d => {
                                    // return data[key][d] > 0? -5 : 20;
                                    return 0;
                                })
                                .attr('y', d =>{
                                    var posvalue = rawdata['positive'][key][d];
                                    var negvalue = Math.abs(rawdata['negative'][key][d]);
                                    if(posvalue > negvalue) {
                                        return pad / 2
                                    }
                                    else {
                                        return -(pad / 1.5)
                                    }
                                    // return data[key][d] > 0? (pad / 2) : -(pad / 1.5)
                                })
                                // .attr('transform', 'rotate(-65)')
                                .attr("transform", "rotate(-15)")
                        }

                    });

                });

                this.selected_factors.forEach(d=>{
                    // console.log(d);
                    d3.select(that.$el)
                        .selectAll("."+d)
                        .style('stroke', 'red')
                        // .style("stroke", () => {
                        //     var returncolor;
                        //     Object.keys(data).forEach((key) => {
                        //         if (Object.keys(data[key]).indexOf(d) >= 0){
                        //             returncolor = d3.rgb(fill(key)).darker(1);
                        //             return;
                        //         }
                        //     });
                        //     return returncolor;
                        // })
                        .style("stroke-width", 2)
                        .style("stroke-opacity", 1);
                });*/

            },
            dataSet () {
                // console.log(this.data_width)
                // console.log(this.data)
                // const dataArr = Object.keys(this.data).map(item => {
                //     const getData = () => {
                //         // console.log(this.data[item])/
                //         const itemArr = Object.keys(this.data[item]).map(val => {
                //             return {
                //                 value: this.data_width[val],
                //                 // height: this.data_width[item][val],
                //                 name: val,
                //                 flag: false,
                //                 itemStyle: {
                //                     opacity: 0.8,
                //                     borderWidth: this.selectList.indexOf(val) > -1 ? 5 : 0,
                //                     borderColor: '#f00'
                //                 }
                //             }
                //         })
                //         // console.log(itemArr)
                //         return itemArr
                //     };  
                //     const itemObj = {
                //         type: 'bar',
                //         stack: 'total',
                //         emphasis: {
                //             focus: 'item'
                //         },
                //         // barWidth: getHeightArr(),
                //         barWidth: 64,
                //         data: getData()
                //     };
                //     return itemObj
                // })
                // return dataArr
                let total = 0
                let itemTotalList = []
                
                let dataArr = Object.keys(this.data).map(item => {
                    const data = this.data[item]
                    let itemTotal = 0
                    const itemArr = Object.keys(data).map(val => {
                        itemTotal += data[val] || 0
                        let borderWidth_ = 1
                        let borderColor_ = '#fff'
                        let color_ = '#333'
                        let fontWeight_ = '500'

                        let duplicated = false; 
                        for (let i = 0; i < this.selected_factors.length; i++) {
                            if (this.selected_factors[i] === val) {
                                duplicated = true;
                                break;
                            }
                        }
                        if (duplicated) {
                            borderWidth_ = 2
                            borderColor_ = '#f00'
                            color_ = '#f00'
                            fontWeight_ = '700'
                        }
                        
                        return {
                            value: val === 'coskew' || val === 'BM' || val === 'total_vol' || val === 'std_dvol' || val === 'illq' ? 0 : data[val],
                            name: val,
                            itemStyle: {
                                color: this.colorlist[val],
                                borderWidth: borderWidth_,
                                borderColor: borderColor_,
                            },
                            label: {
                                color:color_,
                                fontWeight: fontWeight_,
                            },
                        }
                    })
                    itemTotalList.push(itemTotal)
                    total += itemTotal
                    itemArr.sortValue = itemTotal
                    return itemArr
                })
                //if (dataArr.length > 6) dataArr = dataArr.splice(6)
                dataArr = dataArr.sort((a, b) => b.sortValue - a.sortValue)
                itemTotalList = itemTotalList.sort((a, b) => b - a)
                // console.log(total);
                // console.log(itemTotalList);
                let heightList = itemTotalList.map(item => item / total * 80)
                heightList = heightList.map(item => {
                    if (item > 18) return 18
                    if(item < 5) return 5
                    return item
                })
                let top = 10
                let topList = heightList.map(item => {
                    const itemTop = top
                    top += item + 5
                    return itemTop
                })
                // return dataArr
                // console.log(heightList);
                // console.log(topList);

                const typeList = ['Transaction', 'Momentum', 'Value', 'Growth', 'Profit', 'Liquidity']

                const series = typeList.map((item, index) => {
                    return {
                        type: 'treemap',
                        name: item,
                        visibleMin: 0.1,
                        childrenVisibleMin: 0.1,
                        breadcrumb: {
                            show: false
                        },
                        nodeClick: false,
                        roam: false,
                        data: dataArr[index],
                        
                        height: heightList[index] + '%' ,
                        // height:  '20%',
                        top: topList[index] + '%',
                        // top: 20 * index + '%',
                        left: '0%',
                        width: '100%',
                        //color: 'yellow', 
                        label: {
                            fontSize: 16,
                            // offset: [0, - heightList[index]]
                            position: 'top',
                            color: '#333'

                        },
                        squareRatio: 0.0001
                        // itemStyle: {
                        //     borderWidth: 2,
                        //     borderColor: '#f00'
                        // },
                    }
                })
                return series
            },
            drawBar (data) {
                // if (this.chart !== undefined) {
                //     this.chart.off('click', this.handleChartClick)
                //     this.chart.dispose();
                // }
                this.chart = echarts.init(this.$refs.chartRef);
                this.options = {
                    tooltip: {
                        trigger: 'item',
                        textStyle: {
                            fontSize: 20
                        }
                    },
                    // legend: {
                    //     top: 15,
                    //     show: true,
                    //     data: [
                    //         {
                    //             name: 'Transaction',
                    //             icon: 'circle',
                    //             itemStyle: {
                    //                 color: '#3aa071'
                    //             }
                    //         },
                    //         {
                    //             name: 'Momentum',
                    //             icon: 'circle',
                    //             itemStyle: {
                    //                 color: '#f8c65a'
                    //             }
                    //         },
                    //         {
                    //             name: 'Value',
                    //             icon: 'circle',
                    //             itemStyle: {
                    //                 color: '#ed6566'
                    //             }
                    //         },
                    //         {
                    //             name: 'Growth',
                    //             icon: 'circle',
                    //             itemStyle: {
                    //                 color: '#72bedc'
                    //             }
                    //         },
                    //         {
                    //             name: 'Profit',
                    //             icon: 'circle',
                    //             itemStyle: {
                    //                 color: '#8fcb76'
                    //             }
                    //         },
                    //         {
                    //             name: 'Liquidity',
                    //             ticon: 'circle',
                    //             itemStyle: {
                    //                 color: '#536ec3'
                    //             }
                    //         },
                    //     ]
                    // },
                    // grid: {
                    //     left: 130
                    // },
                    // xAxis: {
                    //     type: 'value',
                    //     axisLabel: {
                    //         textStyle: {
                    //             fontSize: 20,
                    //             fontWeight: '700'
                    //         }
                    //     },
                    //     show: false,
                    // },
                    // yAxis: {
                    //     type: 'category',
                    //     data: ['Transaction', 'Momentum', 'Value', 'Growth', 'Profit', 'Liquidity'],
                    //     axisLabel: {
                    //         textStyle: {
                    //             fontSize: 20,
                    //             color: '#000'
                    //         }
                    //     },
                    //     axisLine: {
                    //         show: false
                    //     },
                    //     axisTick: {
                    //         show: false
                    //     }
                    // },
                    series: this.dataSet()
                }
                //console.log(this.options)
                this.chart.setOption(this.options)
                this.chart.on('click', (params) => {
                    const name = params.data.name

                    let duplicated = false; 
                    for (let i = 0; i < this.selected_factors.length; i++) {
                        if (this.selected_factors[i] === name) {
                            this.$store.commit('rm_selected_factor', name);
                            duplicated = true;
                            break;
                        }
                    }
                    if (!duplicated) {
                        this.$store.commit('add_select_factor', name);
                    }
                  
                    this.options.series = this.dataSet()
                    this.chart.setOption(this.options)
                    // if (this.selected_factors.indexOf(name) >= 0) {  // 之前的未添加点击功能的
                    //     this.$store.commit('rm_selected_factor', name);
                    // } else {
                    //     this.$store.commit('add_select_factor', name);
                    // }
                })
            },
        },
    }
</script>

<style>
    /* div.tooltip {
      position: absolute;
      text-align: center;
      width: 80px;
      height: 25px;
      padding: 2px;
      font: 12px sans-serif;
      background: lightsteelblue;
      border: 0px;
      border-radius: 8px;
      pointer-events: none;
    } */
</style>
