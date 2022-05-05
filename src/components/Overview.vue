<template>
    <div>
        <div class="frame_header" style="min-width:2560px; overflow:visible;z-index:999">
            <label style="font-weight:bold;font-size:25px">FACTOR RANK TIMESERIES</label>


            <!-- <label style="font-size:20px">Graph:</label>
            <div class="custom-control custom-radio custom-control-inline"
                style="margin-left:-5px;">
                <input type="radio" class="custom-control-input" 
                    id="circle" 
                    @click="changeGraphSelection('circle')"
                    name="graph_radio_group"
                    checked>
                <label style="font-size:20px" class="custom-control-label" for="circle">Circular</label>
            </div>

            <div class="custom-control custom-radio custom-control-inline"
                style="margin-left:-25px">
                <input type="radio" class="custom-control-input" 
                    id="stream" 
                    @click="changeGraphSelection('stream')"
                    name="graph_radio_group">
                <label style="font-size:20px" class="custom-control-label" for="stream">Stream</label>
            </div> -->

            <div class="vl1"></div>
            <div class="vl2"></div>
            <div class="vl3"></div>

            <label style="font-size:20px; margin-left:60px;">Factor Return:</label>
            <div class="custom-control custom-radio custom-control-inline"
                style="margin-left:-5px">
                <input type="radio"
                    class="custom-control-input"
                    id="real_time" 
                    @click="changeCycleSelection('real_time')"
                    name="cycle_radio_group"
                    checked>
                <label style="font-size:20px;margin-top:0px" class="custom-control-label" for="real_time">Slot</label>
            </div>
            <div class="custom-control custom-radio custom-control-inline"
                style="margin-left:-25px">
                <input 
                    type="radio" 
                    class="custom-control-input" 
                    id="cumulative" 
                    @click="changeCycleSelection('cumulative')"
                    name="cycle_radio_group">
                <label style="font-size:20px;margin-top:0px" class="custom-control-label" for="cumulative">Sum</label>
            </div>

            
            <!-- <span>Checked names: {{ checkedNames }}</span> -->
            
            <!-- <div style="border-left: 2px solid grey; " class="vl"></div> -->
            
                
            <label style="display:inline;
                margin-left: 20px;
                float: right;
                text-align: right;
                font-size: 20px;" for="cirlce_range_slider">Filter</label>
            <div style="
                display:inline;
                margin-left: 20px;
                margin-top: 6px;
                float: right;
                font-size: 20px;
                ">
                <input type="range" @change="changeSlider" class="custom-range" id="cirlce_range_slider" value="0">
            </div>
            <label style="font-size:20px">top {{100 - slider_value}}% returns</label>

            <label style="font-size:20px; margin-left:60px;">Display Axis:</label>
            <input type="checkbox" id="positive" value="positive" style="margin-left:10px;" v-model="checkedNames">
            <label for="positive" style="font-size:20px; margin-right:5px">Positive</label>
            <input type="checkbox" id="negative" value="negative" style="margin-left:10px;" v-model="checkedNames">
            <label for="negative" style="font-size:20px; margin-right:5px">Negative</label>
            

            <label style="font-size:20px; margin-left:60px">Bar Transparency:</label>
            <div class="custom-control custom-radio custom-control-inline"
                style="margin-left:-5px">
                <input type="radio" class="custom-control-input" 
                    id="std" 
                    @click="changeOpacitySelection('std')"
                    name="opacity_radio_group"
                    checked>
                <label style="font-size:20px;margin-top:0px" class="custom-control-label" for="std">Stability</label>
            </div>

            <div class="custom-control custom-radio custom-control-inline"
                style="margin-left:-25px">
                <input type="radio" class="custom-control-input" 
                    id="sen" 
                    @click="changeOpacitySelection('sen')"
                    name="opacity_radio_group">
                <label style="font-size:20px;margin-top:0px" class="custom-control-label" for="sen">Uniqueness</label>
            </div>
            
            <label style="display:inline;
                margin-left: 20px;
                float: right;
                text-align: right;
                font-size: 20px;" for="column_width">Width</label>
            <div style="
                display:inline;
                margin-left: 20px;
                margin-top: 6px;
                float: right;
                font-size: 20px;
                ">
                <input type="range" @change="changeSlider" class="custom-range" id="column_width" value="50">
            </div>
            <label style="font-size:20px">{{column_width}}%</label>


           
        </div>
        <div class="draw-area">
            <svg></svg>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    // ghj
    import * as d3v1 from 'd3'
    import { UiRadioGroup } from 'keen-ui';
    import NetService from '@/services/net-service';
    import $ from 'jquery';
    import C from './constants.js';
    const fix_prompt_height = 20, fix_prompt_top = 10;
    const Cycle = [
        {
            label: 'Real Time',
            value: 'real_time'
        },
        {
            label: 'Cumulative',
            value: 'cumulative'
        },
    ];
    const Graph = [
        {
            label: 'Circle',
            value: 'circle'
        },
        {
            label: 'Stream',
            value: 'stream'
        },
    ];
    export default{
        name: "Overview",
        components: {
            UiRadioGroup,
        },
        data(){
            return {
                importance_selection: 'importance_w',
                // importance_selection: 'importance_contri',
                cycle_selection: 'real_time',
                // graph_selection: 'circle',
                checkedNames: ["positive", "negative"],
                opacity_selection: 'std',

                slider_value: 0,
                column_width: 50,
                cycle: 'real_time',
                graph: 'circle',
                options: {
                    Cycle,
                    Graph
                },
            };
        },
        computed: {
            // ...mapState(['width','height','selected_factors']),
            ...mapState(['start_date','end_date','width','height','selected_factors','data_aggragate']),
            data_overview(){
                return this.$store.state.data_overview;
            },
            rt_streamgraph_data(){
              return this.$store.state.rt_streamgraph_data;
            },
            ac_streamgraph_data(){
              return this.$store.state.ac_streamgraph_data;
            },
            width_or_height(){
                return [this.width, this.height];
            }
        },
        mounted(){

        },
        watch:{
            data_overview: 'new_draw',
            width_or_height: 'new_draw',
            selected_factors: 'new_draw',
            checkedNames: 'new_draw',
            deep: true,
            immediate: true,

            cycle_selection: "new_draw",
            // graph_selection: "new_draw",
            opacity_selection: "new_draw",

        },
        methods:{
            changeSlider(){
              this.slider_value = $('#cirlce_range_slider').val();
              this.column_width = $('#column_width').val();
              this.new_draw();
              //if(this.importance_selection == "importance_w" ||
              //  this.importance_selection == "cumulative_w"){
              //  this.slider_value = $('#cirlce_range_slider').val();
              //  this.draw_overview();
              //}
            },

          changeCycleSelection(cycle_selection){
            this.cycle_selection = cycle_selection
          },
          changeGraphSelection(graph_selection){
            this.graph_selection = graph_selection
          },
          changeOpacitySelection(opacity_selection){
            this.opacity_selection = opacity_selection
          },

          new_draw(){
            this.draw_overview(this.cycle_selection)
          },

            

            draw_overview(cycle_selection){
                // console.log("opacity_selection", this.opacity_selection)
                console.log("checkedNames", this.checkedNames, this.checkedNames.length)
                // console.log('data_aggragate1:', this.data_aggragate);

                if(this.data_aggragate === undefined) {
                    return
                }
                let data = JSON.parse(JSON.stringify(this.data_overview))   // 防止覆盖！
                if(data === undefined){
                    return;
                }
                ["positive", "negative"].forEach(s => {
                    // console.log(s, this.checkedNames, this.checkedNames.includes(s))
                    if (!this.checkedNames.includes(s)) {
                        data.forEach(d => {
                            Object.values(d).forEach(factor => {
                                if(factor.hasOwnProperty("sen")){
                                    let v = 0
                                    factor["contri_" + s] = v
                                    factor["cumulative_" + s] = v
                                    factor["value_" + s] = v
                                    factor["weight_" + s] = v
                                }
                            })
                        })
                    }
                })
                
                let group_name = {
                    'A': 'transaction_friction_factor',
                    'B': 'momentum_factor',
                    'C': 'value_factor',
                    'D': 'growth_factor',
                    'E': 'profit_factor',
                    'F': 'financial_liquidity_factor',
                }

                // console.log("data_aggregate", this.data_aggragate)
                let aggregate_json = {}
                let aggregate_map = {}
                for(let key in this.data_aggragate.positive) {
                    let group = group_name[key]
                    aggregate_json[group] = 0
                    aggregate_map[group] = {}
                    for(let k in this.data_aggragate.positive[key]) {
                        aggregate_json[group] += this.data_aggragate.positive[key][k] - this.data_aggragate.negative[key][k]
                        aggregate_map[group][k] = {
                            "1": this.data_aggragate.positive[key][k],
                            "-1": this.data_aggragate.negative[key][k]
                        }
                    }
                }
                // let aggregate_map = {}
                // for(let k in data[0]) {
                //     let t = data[0][k].type
                //     if(aggregate_map.hasOwnProperty(t)) aggregate_map[t] = 0
                //     if(aggregate_json.hasOwnProperty(k)) aggregate_map[t] += aggregate_json[k]
                //     else console.log("!!1", k)
                // }
                

                // let aggregate_map = {}
                let little_factors = {}
                for(let k in data[data.length-1]) {
                    let d = data[data.length-1][k]
                    let t = d.type
                    if(t !== undefined) {
                        if(!little_factors.hasOwnProperty(t)) {
                            // aggregate_map[t] = 0
                            little_factors[t] = []
                        }
                        // aggregate_map[t] = d.cumulative_positive - d.cumulative_negative
                        little_factors[t].push(k)
                    }
                }
                let aggragate_lis = []
                for(let k in aggregate_json) aggragate_lis.push([k, aggregate_json[k]])
                // aggragate_lis.forEach(d => d[1] = Math.sqrt(d[1]))  // 比例调整
                let sum = aggragate_lis.map(d=>d[1]).reduce((a,b)=>a+b)
                aggragate_lis.forEach(d => d[1] = d[1] / sum)
                aggragate_lis = aggragate_lis.sort((a,b)=>b[1]-a[1])
                console.log("data", data)
                console.log("aggregate", aggregate_map, aggregate_json, aggragate_lis)
                // 一大堆因子都找不到！！！！！！！
                
                
                var percent_circle = this.slider_value / 100;

                var radio_selection = undefined;
                switch(cycle_selection){
                    case 'real_time': radio_selection = "weight"; break;
                    case 'cumulative': radio_selection = "cumulative"; break;
                };

                var selection = {
                    "1": radio_selection + "_positive",
                    "-1": radio_selection + "_negative"
                }

                var d3 = d3v3;
                var sensitivity_max = 0;
                var abs_contri_list = [];

                data.forEach(item=>{
                    Object.values(item).forEach(d=>{
                        if(d.hasOwnProperty("sen")){
                            abs_contri_list.push(d[selection["1"]] > 0? Math.abs(d[selection["1"]]): Math.abs(d[selection["-1"]]))
                            if(this.opacity_selection == "sen")
                                sensitivity_max = d.sen > sensitivity_max? d.sen: sensitivity_max;
                            else
                                sensitivity_max = d.std > sensitivity_max? d.std: sensitivity_max;
                        }
                    })
                });
                abs_contri_list.sort((a, b) => a - b);

                // console.log("abs_contri_list", abs_contri_list);
                var r_sum = {
                    "1": 0,
                    "-1": 0
                }
                var minimal_contri = abs_contri_list[Math.floor(abs_contri_list.length * percent_circle)];
                // console.log("percent_circle: ",percent_circle);
                // console.log("minimal_contri: ",minimal_contri);

                data.forEach(item=>{
                    Object.values(item).forEach(d=>{
                        if(d.hasOwnProperty("sen")){
                            for(let s in selection) {
                                let abs_contri = Math.abs(d[selection[s]])
                                abs_contri = abs_contri < minimal_contri ? 0: abs_contri;
                                r_sum[s] += Math.sqrt(abs_contri / Math.PI);
                            }
                        }
                    })
                    // console.log("r_sum: ",r_sum);
                });

                var root_div = d3.select(this.$el);
                var bounding_rect = root_div.node().getBoundingClientRect()

                var margin = { top: 10, right: 100, bottom: 10, left: 60 },
                    legend_shorten = {
                        "transaction_friction_factor": "Transaction",
                        "momentum_factor": "Momentum",
                        "value_factor": "Value",
                        "growth_factor": "Growth",
                        "profit_factor": "Profit",
                        "financial_liquidity_factor": "Liquidity",
                    },

                    // tick_size = 30,
                    // width = tick_size * data.length - margin.left - margin.right,
                    width = bounding_rect.width * 0.7  - margin.left - margin.right,
                    axis_offset = 15,
                    height = bounding_rect.height - margin.top - margin.bottom - C.FRAME_HEADER_HEIGHT
                    ;
                console.log("column_width", this.column_width)
                let width_for_circles = width * this.column_width / 3600

                var height_for_circles = {
                    "1": height * r_sum["1"] / (r_sum["1"] + r_sum["-1"]) - axis_offset,
                    "-1": height * r_sum["-1"] / (r_sum["1"] + r_sum["-1"]) - axis_offset
                }

                var y_scale = {
                    "1": d3.scale
                    .linear()
                    .domain([0, height_for_circles["1"]])
                    .range([0, height_for_circles["1"]]),
                    "-1": d3.scale
                    .linear()
                    .domain([0, height_for_circles["-1"]])
                    .range([height, height - height_for_circles["-1"]])
                }
                var dates = new Set(data.map(d=>d.date));
                dates = [...dates].sort();
                var parse = d3.time.format("%Y-%m-%d").parse;
                // Set x, y and colors
                var x_scale = d3.scale
                    .ordinal()
                    .domain(dates.map(function (d) {
                        return parse(d);
                    }))
                    .rangeRoundBands([0, width]);

                var opacity_scale_std = d3.scale
	                .linear()
                    .domain([50, 0.05])
                    // .domain([sensitivity_max, 0])  ghj
                    .range([C.MIN_OPACITY + 0.2, C.MAX_OPACITY + 0.2]);
                    // .range([C.MIN_OPACITY, C.MAX_OPACITY]);  ghj

                var opacity_scale_sen = d3.scale
                    .linear()
                    .domain([0, sensitivity_max])
                    // .domain([0, Math.sqrt(sensitivity_max)])  ghj
                    .range([C.MIN_OPACITY + 0.2, C.MAX_OPACITY + 0.2]);

                var colors = d3.scale.ordinal()
                    .domain(Object.keys(legend_shorten))
                    .range(C.FACTOR_TYPE_COLORMAP);
                
                d3.select(this.$el)
                    .select(".draw-area")
                    .select("svg")
                    .remove();

                // 第二个视图 factor view
                let width2 = bounding_rect.width * 0.3 - 50
                let empty_ratio = 0.1

                // 同一个svg内的才能够互相操控！！！！！！！！！！1
                // let root_svg2 = d3
                //     .select(this.$el)
                //     .select(".draw-area")
                //     .append("svg")
                //     // .attr("width", width + margin.left + margin.right + legends_width)
                //     .attr("width", width2)
                //     .attr("height", height + margin.top + margin.bottom)
                //     ;
                // var svg2 = root_svg2.append("g")
                //         .attr("transform", "translate(0," + margin.top + ")");

                let aggregate_data = []
                let y_index = 0 
                let all_sum = Object.values(aggregate_json).reduce((a,b) => a+b)
                aggragate_lis.forEach(d =>{
                    let t = d[0]
                    // 大类因子
                    let x_index = 0
                    y_index += empty_ratio

                    let l_sort = []
                    for(let l in aggregate_map[t]) {
                        l_sort.push([l, aggregate_map[t][l]["1"] - aggregate_map[t][l]["-1"]])
                    }
                    l_sort.sort((a,b) => b[1] - a[1])
                    console.log("l_sort", l_sort)

                    l_sort.map(d=>d[0]).forEach(function(l) {
                        // 小类因子
                        let positive = aggregate_map[t][l]["1"],
                            negative = aggregate_map[t][l]["-1"]
                        
                        aggregate_data.push({
                            y: y_index,
                            x: x_index,
                            h: aggregate_json[t] / all_sum,
                            w: (positive - negative) / aggregate_json[t],
                            positive_ratio: positive / (positive - negative),
                            l: l,
                            t: t,
                            positive: positive,
                            negative: negative,
                            active: false
                        })
                        x_index += aggregate_data[aggregate_data.length - 1].w
                    })
                    y_index += aggregate_data[aggregate_data.length - 1].h
                })
                    

                let compress_ratio = 1 + empty_ratio * (Object.keys(aggregate_json).length)
                for(let t in aggregate_data) {
                    aggregate_data[t].h /= compress_ratio
                    aggregate_data[t].y /= compress_ratio
                }
                
                console.log("aggregate_data", aggregate_data)



                let that = this
                


                // 第一个视图
                var root_svg = d3
                    .select(this.$el)
                    .select(".draw-area")
                    .append("svg")
                    // .attr("width", width + margin.left + margin.right + legends_width)
                    .attr("width", bounding_rect.width)
                    .attr("height", height + margin.top + margin.bottom)
                    ;
                
                // #### Linear Gradient
                // drawing circles

                var svg = root_svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var all_data = [];
                var opacity_selection = this.opacity_selection
                var all_factors = [
                        'QRG', 'CRG', 'saleinv', 'salecash', 'CFdebt', 'QR', 'CR', 'RDsales', 'RD', 'cashpr', 
                        'cash', 'CT', 'PA', 'ROA', 'ROE', 'ACCP', 'ACC', 'TAXchg', 'PMG', 'SgINVg', 'SG', 'INVchg',
                        'INVG', 'BVEG', 'LG', 'AG', 'SP', 'DP', 'OCFP', 'CFP', 'EP', 'LEV', 'AM', 'BM', 'lagretn', 
                        'imom', 'momchg', 'mom6', 'mom12', 'age', 'sharechg', 'LM', 'illq', 'retnmax', 'std_dvol', 
                        'volumed', 'std_turn', 'turn', 'coskew', 'skew', 'idskew', 'total_vol', 'idvol', 'betad', 'beta', 
                        'size'
                    ]

                let add_data = (d, s, factor) => {
                    let contri = Math.abs(d[factor][selection[s]]);
                    contri = contri < minimal_contri ? 0: contri;
                    let res = { 
                        x: parse(d.date),                   // x坐标，y0为y坐标
                        dt: d.date,
                        v: contri,
                        h: Math.sqrt(contri),  // height
                        s: s,
                        t: d[factor]["type"], 
                        l: factor,
                        active: false,
                        opacity:  d[factor][opacity_selection == 'sen'? "sen": "std"],
                    };
                    all_data.push(res);
                    return res;
                }

                // Transpose the data into layers
                for(let s in selection){
                    d3.layout.stack()(
                        all_factors.map(factor => 
                            data.map(d => 
                                d.hasOwnProperty(factor) && d[factor][selection[s]] * s > 0?     // 因子与s同号且非0
                                add_data(d, s, factor): {x: parse(d.date), h:0}   // h=0 则不会被显示
                        )
                    ));
                }

                console.log("all data:", all_data)

              // Seperate Connect
              
            var data_dict = {};
            all_data.forEach(d => {
                if(d.dt in data_dict === false){
                    data_dict[d.dt] = []
                }
                data_dict[d.dt].push(d)
            })
            Object.values(data_dict).forEach(d=>d.sort(
                (d1, d2) => d1.s === d2.s? d2.h - d1.h: d2.s - d1.s
            ))

            console.log("data_dict:", data_dict)  // 这里输出是无效的，因为后面对 data_dict进行了重新排序！

            // Object.values(data_dict).forEach(d=>d.sort(
            //     (d1, d2) => d2.y * d2.s - d1.y * d1.s
            // ))

            // console.log("data_dict2:", data_dict)

            // console.log("sssssssssss", data_dict)
            // 排序：组内大到小，组间大到小
            let rank_dict = {}
            let rank_max = {
                    "1": [0, 0, 0, 0, 0, 0],    // rank:1-6，每个rank中最大的一项
                    "-1": [0, 0, 0, 0, 0, 0]
                }
            let get_h_sum = d => d.length == 0? 0:d.map(x => x.h).reduce((a, b) => a + b)
            for(var k in data_dict) {
                // 每个横截面上：
                // + [6类dict]，每类均为list，类内从大到小；类间从大到小
                // - [6类dict]，从大到小
                let v = data_dict[k]
                let new_dic = {
                    "1": {},
                    "-1": {}
                }
                v.forEach(d=>{
                    new_dic["1"][d.t] = []
                    new_dic["-1"][d.t] = []
                })
                v.forEach(d=> new_dic[String(d.s)][d.t].push(d))
                
                rank_dict[k] = {
                    "1": [],
                    "-1": []
                }

                for(let s in new_dic) {
                    let arr = Object.values(new_dic[s]).sort((a, b) => get_h_sum(b) - get_h_sum(a))
                    rank_dict[k][s] = arr
                    arr.map(get_h_sum).map((v, i)=> {
                        rank_max[s][i] = Math.max(rank_max[s][i], v)
                    })
                }
            }

            console.log("rank", rank_dict, rank_max)

            // 添加灰线
            for(let s in rank_max) {
                let offset = 0
                let f =  height_for_circles[s] / rank_max[s].reduce((a, b) => a + b)
                rank_max[s].forEach(d => {
                    if (d!==0){
                        svg.append('line')
                        .attr('id', 'limit')
                        .attr('x1', 30)
                        .attr('y1', y_scale[s](offset * f))
                        .attr('x2', width - 30)
                        .attr('y2', y_scale[s](offset * f))
                        .style('stroke', "#9FAAAE")
                        .style('stroke-width', 1)
                        // .style('stroke-dasharray', 6)
                        offset += d
                    }
                })
                
            }
            

            // data_dict = new_data_dict
            // console.log("data_dict", data_dict)
            // console.log("new_data_dict", new_data_dict)

            // Object.values(data_dict).forEach(m => {
            //     // 对于每个截面上的54个因子
            //     var sum = {
            //         "1": 0,
            //         "-1": 0
            //     }
            //     m.forEach(d => {
            //         d.y0 = sum[d.s] - d.y * d.s / 2
            //         // d.y0 = d.y0 - d.y * d.s / 2
            //         sum[d.s] += d.y
            //     })
            //     m.forEach(d => {
            //         d.y0 = d.y0  * height_for_circles[d.s] / sum[d.s]
            //         d.y = d.y * height_for_circles[d.s] / sum[d.s]
            //     })
            // })

            for (let k in rank_dict) {
                // 截面 1/12
                let day = rank_dict[k]
                for(let s in day) {
                    // 正负 1/2
                    let m = day[s]
                    let group_offset = 0
                    m.forEach((group, i) => {
                        // group 1/6
                        // let factor_offset = 0
                        // group.forEach(d => {
                        //     // factor 1/n
                        //     d.y = group_offset + factor_offset
                        //     factor_offset += d.h
                        // })
                        let h0 = get_h_sum(group) / group.length
                        group.forEach((d, i) => {
                            d.h0 = h0   // 组均高
                            d.y = group_offset + h0 * i
                        })

                        group_offset += rank_max[s][i]
                    })
                }
            }
            Object.values(data_dict).forEach(m => {
                // 对于每个截面上的54个因子
                m.forEach(d => {
                    let f = height_for_circles[d.s] / rank_max[d.s].reduce((a, b) => a + b)
                    d.y = d.y  * f
                    d.h = d.h * f
                    d.h0 = d.h0 * f
                })
            })
              
              // For Overview xAxis Display
                var dates_dict = {}
                var month_dict = {
                  "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "May","6": "Jun",
                  "7": "Jul", "8": "Aug", "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
                }
                var pre_year, pre_month, pre_week = 0, pre_day = 0
                var tmp_year, tmp_month, tmp_day
              for(var dt of dates){
                var tmp_date = parse(dt)
                tmp_year = tmp_date.getFullYear()
                tmp_month = tmp_date.getMonth()
                tmp_day = tmp_date.getDay()
                if(pre_year != tmp_year){
                  pre_year = tmp_year
                  pre_month = tmp_month
                  pre_day = tmp_day
                  dates_dict[tmp_date] = pre_year
                  pre_week = 1
                }
                else if(pre_month != tmp_month){
                  pre_month = tmp_month
                  pre_day = tmp_day
                  dates_dict[tmp_date] = month_dict[pre_month + 1]
                  pre_week = 1
                }
                else if(tmp_day <= pre_day){
                  pre_week += 1
                  pre_day = tmp_day
                  dates_dict[tmp_date] = pre_week
                }
                else{
                  pre_day = tmp_day
                  dates_dict[tmp_date] = ""
                }
              }
            //   let dates_keys = Object.keys(dates_dict)
            //   dates_dict[dates_keys[dates_keys.length - 1]] = "Total"
                  
                var xAxis = d3.svg
                    .axis()
                    .scale(x_scale)
                    .orient("bottom")
                    .tickFormat(d =>  dates_dict[d]);
                
                // var xAxis_year = d3.svg
                //     .axis()
                //     .scale(x)
                //     .orient("bottom")
                //     .tickFormat(d3.time.format("%Y"))
                //     .tickSize(0)
                //     ;

                svg
                    .append("g")
                    .attr("class", "axis_overview")
                    // .attr("transform", "translate(0," + height / 2 + ")")
                    .attr("transform", "translate(0," + (height_for_circles["1"]) + ")")
                    .call(xAxis)
                    // .selectAll("text")


            let get_line_x = d => {
                return x_scale(d.x) + x_scale.rangeBand() / 2
            }
            let get_line_y = d => {
                // 以前的bug，试了很久！！！！！！！！！
                let l = d.y + d.h0 / 2
                return y_scale[d.s](l)
            }
            // (x,y)矩形左上角的位置！！！！
            let get_w = d => {
                return d.active? width_for_circles * d.h / d.h0: width_for_circles
                // v = h = w * h0  宽度 × 均高 = 真实高度
            }
            let get_x = d => {
                // console.log("scale", x_scale.rangeBand(), x_scale(d.x) , d.w/2)
                return get_line_x(d) - get_w(d)/2;
            }
            let depart_ratio = 1
            let get_h = d => {
                return d.active? d.h0 * depart_ratio : d.h0
            }
            let get_y = d => {
                // console.log("y", y_scale[d.s](d.y + d.h0 * (1 - d.s) /2))
                // let l = d.y  + d.h0 / 2 - get_h(d) * d.s /2 
                // return y_scale[d.s](l)
                return get_line_y(d) - get_h(d) /2      // 先找中心点，再平移到左上
            }
            let get_c = d => d.active? "red": colors(d.t)
            // 矩形中心点的位置
            

                
            // For connect
            var lines = svg.append("g")
                .classed("lines", true);
            var hover_line_svg = svg.append("g")
              .classed("hover_line", true)
            var all_lines = [];
            var hover_line = [];
            var add_line = (factor_name, line_list)=>{
                let points = [];
                let add_points = (x, y, d) => {
                    // 每次添加左侧和右侧点
                    // console.log("d", d)
                    points.push([x - get_w(d)/2, y, d])
                    points.push([x + get_w(d)/2, y, d])
                }
                let exist_dts = new Set();
                let default_d = undefined;
                svg.selectAll('.rect.'+factor_name)
                    .each(d=> {
                        default_d = JSON.parse(JSON.stringify(d))
                        exist_dts.add(d.dt)
                        add_points(get_line_x(d), d.h == 0? height_for_circles["1"]: get_line_y(d), d)
                    })
                if (default_d === undefined) return    // 不存在柱子则直接返回
                // 某个日期为空，则区y=中间值
                dates.forEach((dt)=>{
                    if(! exist_dts.has(dt)){
                        let x_temp = x_scale(parse(dt)) + x_scale.rangeBand() / 2;
                        let y_temp = height_for_circles["1"];
                        let d = {
                            'dt': dt,
                            'h': 0,
                            'x': parse(dt),
                            'y': y_temp,
                            'w': 0,
                        }
                        // console.log("dt", d)
                        for(let k in d) {
                            default_d[k] = d[k]
                        }
                        add_points(x_temp, y_temp, default_d)
                          }
                })
                points.sort(function(a, b){return a[0] - b[0]});

                // console.log("points", points)

                line_list.push(points);
            };

            /* sunye 20220319
            line_list 表示一组线
            d 表示一根线
            x 表示一个点，即rect， 通过 get_x, get_y
            rect为柱子对象，包括： t v l 等属性
            */ 
            var color_dic = {
                "transaction_friction_factor": "#3690c0", 
                "momentum_factor" : "#996699", 
                "value_factor": "#84a7b2", 
                "growth_factor": "#509766", 
                "profit_factor": "#EEAD0E", 
                "financial_liquidity_factor": "#CD6600"
            }

            
            var draw_lines = (line_list, svg, c=null)=>{
                svg.selectAll(".polygon").remove();
                svg.selectAll(".line").remove();

                if (line_list.length == 0) return
                // console.log("line_list", line_list, line_list[0])
                
                let get_color = d => {
                    if(!c && typeof(c) !== 'undefined' && c != 0 && d.length) {
                        return color_dic[d[0][2].t]
                    }else{
                        return c
                    }
                }

                let polygon_list = []
                let path_list = []
                let min_width = 6
                line_list.forEach(function(d) {
                    //（线宽 != 柱宽）正、倒各来一次
                    let alpha = d.map(x => x[2].h / x[2].h0).reduce((a,b) => Math.max(a, b))
                    if(d.length == 0 || Math.abs(alpha) < 0.0001) return  // 线不存在

                    // console.log("alpha", d, alpha)

                    let points = []
                    let last_point = undefined
                    let line_point = undefined
                    let first = true
                    d.forEach(x => {
                        let lw = x[2].h / alpha * depart_ratio
                        // if (lw < min_width) lw = min_width
                            
                        if (line_point !== undefined) {
                            path_list.push([line_point, x])
                            line_point = undefined
                        }
                        else  if (lw < min_width) {
                            if (!first) line_point = x
                            else {
                                if (last_point !== undefined)
                                    path_list.push([last_point, x])
                            }
                        }
                        last_point = x


                        if (first) {
                            points.push([x[0], x[1] + lw / 2])
                            points.push([x[0], x[1] + get_h(x[2]) / 2])
                        } else {
                            points.push([x[0], x[1] + get_h(x[2]) / 2])
                            points.push([x[0], x[1] + lw / 2])
                        }
                        first = !first
                    })
                    
                    for(let i=d.length-1;i>=0;i--) {
                        let x = d[i]
                        let lw = x[2].h / alpha * depart_ratio
                        // if (lw < min_width) lw = min_width
                        if (first) {
                            points.push([x[0], x[1] - lw / 2])
                            points.push([x[0], x[1] - get_h(x[2]) / 2])
                        } else {
                            points.push([x[0], x[1] - get_h(x[2]) / 2])
                            points.push([x[0], x[1] - lw / 2])
                        }
                        first = !first
                    }
                    // 最后保存颜色
                    points.push(get_color(d))
                    polygon_list.push(points)
                })
                // console.log("polygon_path_list", polygon_list, path_list)

                svg.selectAll(".polygon")
                    .data(polygon_list)
                    .enter()
                    .append('polygon')
                    .classed("polygon", true)
                    .attr({
                      "points": d => d.slice(0, d.length-1),
                      "stroke": 'none',
                      "fill": "red", // d => d[d.length-1],
                      "opacity": "0.3"
                    })

                svg.selectAll(".line")
                    .data(path_list)
                    .enter()
                    .append("path")
                    .classed("line", true)
                    .attr({
                      "d": d3.svg.line()
                                .x(d => d[0])
                                .y(d => d[1]),
                                // .interpolate("monotone"),
                      "stroke": "red", //d => get_color(d),
                    // "stroke": 'red',
                      "stroke-width": min_width/3,
                      "fill": "none",
                      "opacity": "0.3"
                    })
            };

            let new_attr = {
                'x': get_x,
                'y': get_y,
                'width': get_w,
                'height': get_h
            }
            let rect = undefined
            let rect2 = undefined
            let text2 = undefined
            let activate_rect = function() {
                rect.attr(new_attr)
                    .style("stroke", d=>d.active? "white": "none")
                    .style("stroke-width", 1)
                    .style("cursor", d=>d.active? "pointer": "default")
                    // .style("fill", 'red')

                rect2.style("cursor", d=>d.active?  "pointer": "default") 
                    .style("stroke", d=>d.active? "red":"none")
                    .style("stroke-width", 3)
            }
            let get_tdts = d => d.t + d.dt + d.s
            let data_tdts = {} // 相同大类、时间、正负
            let data_l = {} // 相同小类
            let class_dic = {}  // 小类到大类的映射
            all_data.forEach(d=>{
                let tdts = get_tdts(d)
                let l = d.l
                if(!data_tdts.hasOwnProperty(tdts)) data_tdts[tdts] = []
                if(!data_l.hasOwnProperty(l)) data_l[l] = []
                data_tdts[tdts].push(d)
                data_l[l].push(d)
                class_dic[l] = d.t
            })
            let activate_selected = selected_factors => 
                selected_factors.forEach(l => {
                    if(data_l.hasOwnProperty(l))
                        data_l[l].forEach(d=> d.active = true)
                    aggregate_data.forEach(d=>{
                        if(selected_factors.includes(d.l)) {
                            d.active = true
                        }
                    })
                })
            activate_selected(this.selected_factors)
            
            rect = svg
                .selectAll('rect')
                .data(all_data)
                .enter()
                .append('rect')
                .attr(new_attr)
                // d.l（小类）: QRG
                // get_class(d.dt, d.s): dt2014-01-011
                // d.t（大类）: financial_liquidity_factor
                .attr('class',   d => "rect " + d.l + " " + get_tdts(d.t, d.dt, d.s))
                .style('fill', get_c)  //d => colors(d.t)
                .style("fill-opacity", d => opacity_selection == 'sen'? opacity_scale_sen(d.opacity): opacity_scale_std(d.opacity))
                .on("mouseover", function(d) {
                    // d3.selectAll('.'+ get_class(d.t, d.dt, d.s)).attr(new_attr)
                    // d3.selectAll('.'+d.l).attr(new_attr)
                    data_tdts[get_tdts(d)].forEach(d=> d.active = true)
                    data_l[d.l].forEach(d=> d.active = true)
                    activate_rect()

                    d3.select(this)
                        .style("cursor", "pointer") 
                        .style("stroke", "red")
                        .style("stroke-width", 2)

                    add_line(d.l, hover_line)
                    // console.log("hover_line", hover_line)
                    draw_lines(hover_line, hover_line_svg, "red")
                })
                .on("mouseout", function(d) {
                    // d3.selectAll('.' + get_class(d.t, d.dt, d.s)).attr(old_attr)
                    // if(!that.selected_factors.includes(d.l)) {
                    //     d3.selectAll('.'+d.l).attr(old_attr)
                    // }
                    all_data.forEach(d=> d.active = false)
                    activate_selected(that.selected_factors)
                    activate_rect()

                    d3.select(this)
                        .style("stroke", "none")
                        .style("cursor", "default")
                        ;

                    hover_line.pop();
                    draw_lines(hover_line, hover_line_svg)
                })
                .on("click", function(d){
                    if(that.selected_factors.includes(d.l)){
                        that.$store.commit('rm_selected_factor', d.l);
                    } else {
                        that.$store.commit('add_select_factor', d.l);
                    }
                    // commit 操作会刷新整个页面，造成断裂！！！
                })
                .each(function(d){
                    d3.select(this).append("title")
                        .classed("tooltip", true)
                        .text(function(d) { 
                            //let txt = d.l + '(' + legend_shorten[d.t] + '): ' + d.v.toFixed(2) + "%\nsen:" + d.sen.toFixed(2)

                            //ghj Modification 20200901
                            let txt = d.l + '(' + legend_shorten[d.t] + '): ' + d.v.toFixed(2) + "%\nVolability/uniqueness:" + Math.sqrt(d.opacity).toFixed(2) + "%"
                            // let txt = d.l + '(' + legend_shorten[d.t] + '): ' + d.v.toFixed(2)
                            // if(radio_selection === "contri" || radio_selection === "weight"){
                            //     txt += "%";
                            // }
                            return txt;
                        });
                })
            ;

            let add_text = function(cor_x, lis, fontsize, height, interval) {
                let text_offset = 0
                let total = 1 + interval * lis.length
                svg.selectAll("mytext")
                    .data(lis)
                    .enter()
                    .append("text")
                    .attr('class', d => legend_shorten[d[0]] + " mytext")
                    .attr("text-anchor", "middle")
                    .attr('x', cor_x)
                    .attr('y', d => {
                            text_offset += d[1] + interval
                            return height * (text_offset - d[1]/2) / total
                        })
                    .text(d => legend_shorten[d[0]])
                    .style('font-size', fontsize + 'px')
                    // .style('font-family', 'Arial')
                    // .style('color', d => color_dic[d[0]] + "!important")
                    .on("mouseover", function(d) {
                        d3.select(this).style('font-size', (fontsize+2) + 'px')
                        little_factors[d[0]].forEach(l => {
                            if (data_l.hasOwnProperty(l))
                                data_l[l].forEach(d=> d.active = true)
                            activate_rect()
                            add_line(l, hover_line)
                            // console.log("hover_line", hover_line)
                        })
                        draw_lines(hover_line, hover_line_svg, "red")
                    })
                    .on("mouseleave", function(d) {
                        d3.select(this).style('font-size', fontsize + 'px')
                        all_data.forEach(d=> d.active = false)
                        activate_selected(that.selected_factors)
                        activate_rect()
                        little_factors[d[0]].forEach(l => hover_line.pop());
                        draw_lines(hover_line, hover_line_svg)
                    })
                    .on("click", function(d){
                        little_factors[d[0]].forEach(l => {
                            if(that.selected_factors.includes(l)){
                                that.$store.commit('rm_selected_factor', l);
                            } else {
                                that.$store.commit('add_select_factor', l);
                            }
                        })
                    })
            }

            add_text(width + 30, aggragate_lis, 18, height, empty_ratio)


            // console.log("rankmax", rank_max['1'])
            // let rank_lis = rank_max['1']
            // let rank_names = Object.values(rank_dict)[0]["1"].map(d => d[0].t)
            // add_text(0, rank_lis.map((d, i)=>[rank_names[i], d/rank_lis.reduce((a,b) => a+b)]), 
            //     14, height_for_circles["1"], 0)
            
            let rank_l_names = {
                "1": [],
                "-1": []
            }
            for (let t in rank_dict[dates[0]]) {
                let m = rank_dict[dates[0]][t]
                m.forEach(d => {
                    d.forEach(x => {
                        rank_l_names[t].push(x.l)
                    })
                })
            }
            // let rank_l_names1 = rank_l_names["1"].concat(rank_l_names["-1"].reverse())
            // let sort_selected_factors = JSON.parse(JSON.stringify(this.selected_factors))
            // console.log("rank_l_names", rank_l_names1)
            // sort_selected_factors.sort((a, b) => rank_l_names1.indexOf(a) - rank_l_names1.indexOf(b))
            // console.log("selected:", this.selected_factors, sort_selected_factors)
            let selected_title = ["Selected", "Factors:"]
            svg.selectAll("selectedtext")
                .data(selected_title.concat(this.selected_factors))
                .enter()
                .append("text")
                .attr('class', d => legend_shorten[class_dic[d]] + " selectedtext")
                .attr("text-anchor", "middle")
                .attr('x', -15)
                .attr('y', (d, i) => i * 25 + 20)
                .text(d => d)
                .style('font-size', d => selected_title.includes(d)? '18px': '16px')
                .on("click", function(d){
                    if(that.selected_factors.includes(d)){
                        that.$store.commit('rm_selected_factor', d);
                    }
                })


            let mouseover = function(d) {
                    d.active = true
                    data_l[d.l].forEach(d=> d.active = true)
                    // console.log(data_l[d.l][0].active, rect)
                    activate_rect()
                    add_line(d.l, hover_line)
                    // console.log("svg", svg)
                    // console.log("hover_line", hover_line, hover_line[0])
                    draw_lines(hover_line, hover_line_svg, "red")
                }
            let mouseout = function(d) {
                    d.active = false
                    all_data.forEach(d=> d.active = false)
                    activate_selected(that.selected_factors)
                    activate_rect()
                    hover_line.pop();
                    draw_lines(hover_line, hover_line_svg)
                }
            let click = function(d){
                    if(that.selected_factors.includes(d.l)){
                        that.$store.commit('rm_selected_factor', d.l);
                    } else {
                        that.$store.commit('add_select_factor', d.l);
                    }
                    // commit 操作会刷新整个页面，造成断裂！！！
                }
            let oneach = function(d){
                    d3.select(this).append("title")
                        .classed("tooltip", true)
                        .text(function(d) { 
                            //let txt = d.l + '(' + legend_shorten[d.t] + '): ' + d.v.toFixed(2) + "%\nsen:" + d.sen.toFixed(2)

                            //ghj Modification 20200901
                            let txt = d.l + '(' + legend_shorten[d.t] + ')\n'
                            txt += "positive: " + d.positive.toFixed(2)  + "\nnegative: " + d.negative.toFixed(2)
                            return txt;
                        });
                }
            


            let width_left = width + margin.right
            rect2 = svg
                .selectAll('rect2')
                .data(aggregate_data)
                .enter()
                .append('rect')
                // d.l（小类）: QRG
                // get_class(d.dt, d.s): dt2014-01-011
                // d.t（大类）: financial_liquidity_factor
                .attr({
                    'x': d => d.x * width2 + width_left,
                    'y': d => d.y * height,
                    'width': d => d.w * width2 - 2,
                    'height': d => d.h * height
                })
                .attr('class',  d => "rect2 " + d.l)
                .style('fill', d => color_dic[d.t])
                .style("fill-opacity", 0.7)
                .style("stroke", d => d.active? "red": "none")
                .style("stroke-width", 3)
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("click", click)
                .each(oneach)

            text2 = svg
                .selectAll('mytext2')
                .data(aggregate_data)
                .enter()
                .append('text')
                // d.l（小类）: QRG
                // get_class(d.dt, d.s): dt2014-01-011
                // d.t（大类）: financial_liquidity_factor
                .attr("transform", d => {
                    let x = (d.x + d.w/2) * width2 + width_left,
                        y = d.y * height - 10
                    return "translate("+x+","+y+")rotate(-30)"
                })       // 设定坐标 => rotate
                .attr("text-anchor", "middle")
                .attr('class',  d => "mytext2 " + d.l)
                .text(d => d.l)
                .style('fill', d => d.active? "red": "black")
                .style("font-size", "18px")
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("click", click)
                .each(oneach)


            svg.selectAll('myline')
                .data(aggregate_data)
                .enter()
                .append('line')
                .attr('x1', d=>d.x * width2 + width_left)
                .attr('y1', d=>(d.y + d.h * d.positive_ratio) *height)
                .attr('x2', d=>(d.x + d.w) * width2 + width_left)
                .attr('y2', d=>(d.y + d.h * d.positive_ratio) * height)
                .style('stroke', "white")
                .style('stroke-width', 2)
                .style('stroke-dasharray', 6)


            // 在最后activate
            activate_rect()
            for(let i = 0;i < this.selected_factors.length;i++){
                let factor_name = this.selected_factors[i];
                add_line(factor_name, all_lines);
            }
            console.log("count of selected factors",this.selected_factors.length)
            if (this.selected_factors.length != 56){
                draw_lines(all_lines, lines);
            }else {
              // draw_lines(all_lines, "white", lines);
            }
            // draw_lines(all_lines, "green", lines);

            },
        }
    }
</script>

<style>
    svg {
        font: 10px sans-serif;
        shape-rendering: crispEdges;
    }

    .axis_new {
      fill: none;
      stroke: #777;
    }

    .axis_overview path {
        fill: none;
        stroke: #000;
    }

    .axis_overview line {
        fill: none;
        stroke: #000;
    }

    .axis_overview path.domain {
        stroke: none;
    }

    .ui-collapsible__body{
        padding: 0%;
    }

    .ui-collapsible__header {
        font-size: 20px;
    }

    .mytext {
        /* color: red;
        stroke: red; */
        font-size: 18px;
    }

    .Transaction {
        stroke: #3690c0;
    }
    .Momentum {
        Stroke: #996699;
    }
    .Value {
        Stroke: #84a7b2;
    }
    .Growth {
        Stroke: #509766;
    }
    .Profit {
        Stroke: #EEAD0E;
    }
    .Liquidity {
        Stroke: #CD6600;
    }
    .myrect.active {
        stroke: "red"
    }


    /*
    .ui-radio__label-text {
        color: black;
    }*/
/* .vl {
  border-left: 3px solid #868686;
  height: 30px;
  position: absolute;
  left: 27%;
  margin-top: 9px;
  top: 0;
} */
.vl1 {
  border-left: 3px solid #ffffff;
  height: 40px;
  position: absolute;
  left: 14.5%;
  margin-top: 7px;
  top: 0;
}
.vl2 {
  border-left: 3px solid #ffffff;
  height: 40px;
  position: absolute;
  left: 44.5%;
  margin-top: 7px;
  top: 0;
}
.vl3 {
  border-left: 3px solid #ffffff;
  height: 40px;
  position: absolute;
  left: 60%;
  margin-top: 7px;
  top: 0;
}
.vl4 {
  border-left: 3px solid #ffffff;
  height: 40px;
  position: absolute;
  left: 76%;
  margin-top: 7px;
  top: 0;
}
.vr {
  border-left: 3px solid #ffffff;
  height: 40px;
  position: absolute;
  left: 46.5%;
  margin-top: 7px;
  top: 0;
}

</style>
