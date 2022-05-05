<template>
    <div>
        <div class="frame_header">
            <label style="font-weight:bold;font-size:25px">PORTFOLIO BACKTEST TIMESERIES</label>
        </div>
        <div class="draw-area" ref="chartRef" style="height:100%;padding-left: 8px;">
            <!-- <svg></svg> -->
        </div>
    </div>
</template>

<script>
    import * as echarts from 'echarts'; 
    import * as d3 from "d3";
    import { mapState } from 'vuex';
    import C from './constants.js';
    export default {
        name: "Backtest",
        data() {
            return {
                chart: {}
            }
        },
        computed: {
            ...mapState(['width', 'height', 'end_date', 'data_backtest']),
            width_or_height() {
                return [this.width, this.height]
            },
        },
        watch:{
            data_backtest: 'draw_backtest',
            width_or_height: 'draw_backtest',
            deep: true,
            immediate: true,
        },
        methods: {
            object2Array(p) {
                var arr = [];
                for (var key in p) {
                    if (p.hasOwnProperty(key)) {
                        arr.push([key, p[key]]);
                    }
                }
                return arr;
            },

            draw_backtest() {
                this.chart = echarts.init(this.$refs.chartRef);
                if (this.data_backtest===undefined || this.data_backtest[0]===undefined) return
                console.log("data_backtest",this.data_backtest)

                let regularize = lis => {
                    lis.forEach(d => {
                        d[1] = (d[1] - 1) * 100
                    })
                }

                let benchmark = this.object2Array(this.data_backtest[0]["benchmark"]).filter((item, index) => index % 5 === 0);
                let portfolio = this.object2Array(this.data_backtest[0]["portfolio"]).filter((item, index) => index % 5 === 0);

                regularize(benchmark)
                regularize(portfolio)
                console.log("data", benchmark, portfolio)
                this.chartOption= {
                    legend: {
                        data: this.allLegend,
                        textStyle: {
                            //图例字体大小
                            fontSize: 20,
                            },
                        itemHeight: 10,
                        x: 'center',
                        y: 'top'
                    },
                    tooltip: {},
                    grid: {
                       left: '4%',
                       right: '8%',
                       top: '10%',
                       bottom: '18%',
                       containLabel: true                 
                    },
                    xAxis: {
                        name: 'Date',
                        nameLocation: "end",
                        nameTextStyle:{ 
                            fontSize: 20,
                            color: "black"
                        },
                        type: 'category',
                        show: true,
                        axisLabel: {
                            textStyle: {
                                fontSize: 20,
                                color: '#000'
                            },
                            formatter: function(value) {//在这里写你需要的时间格式
                                var t_date = new Date(value);
                                let fill = d=> {
                                    d = String(d)
                                    return d.length ==1 ? "0" + d: d
                                }
                                return [fill(t_date.getMonth() + 1), fill(t_date.getDate())].join('-');
                            },
                            rotate: 0
                        },
                        
                    },
                    yAxis: {
                        name: 'Return(%)',
                        nameLocation: "end",
                        nameTextStyle:{ 
                            fontSize: 20,
                            color: "black"
                        },
                        type: 'value',
                        // min: 0.7, 
                        // max: 1.3,
                        axisLabel: {
                            textStyle: {
                                fontSize: 20,
                                color: '#000'
                            }
                        },
                        axisLine: {
                            show: true
                        },
                    },
                    series: []
                },
                this.chartOption.series = [
                    {
                        type: 'bar',
                        name: 'Stock Index',
                        data: benchmark.map(item => item[1]),
                        itemStyle: {
                            color: "#0080ff",
                        }
                    },
                    {
                        type: 'bar',
                        name: 'Portfolio',
                        data: portfolio.map(item => item[1]),
                        itemStyle: {
                            color: "#ff0000"
                        }
                }
                ]
                this.chartOption.xAxis.data = benchmark.map(item => item[0])
                this.chart.setOption(this.chartOption);


                // console.log(benchmark)
                // console.log(portfolio)
                // d3.select(this.$el)
                //     .select(".draw-area")
                //     .selectAll("svg")
                //     .remove();
                // if(this.data_backtest.length == 0) {
                //     return;
                // }
                // var that = this;
                // // 区域配置
                // var root_div = d3.select(this.$el);
                // var bounding_rect = root_div.node().getBoundingClientRect();
                // var margin = {top: 5, bottom: 5, left: 10, right: 10},
                //     width = bounding_rect.width - margin.left - margin.right,
                //     height = bounding_rect.height - margin.top - margin.bottom - C.FRAME_HEADER_HEIGHT;
                // var svg = d3
                //         .select(this.$el)
                //         .select(".draw-area")
                //         .append("svg")
                //         .attr("width", width + margin.left + margin.right)
                //         .attr("height", height + margin.top + margin.botom)
                //         .append("g")
                //         .attr("transform", "translate(" + margin.left + "," + margin.top +")");

                // // 获取数据
                // var return_vs_dates = [];

                // // 获取市场指标数据
                // var market_index_raw = (this.object2Array(this.data_backtest[0]["benchmark"]));

                // var market_index_return = market_index_raw.filter(d=>{
                //     return d != undefined;
                // });
                // console.log("market_index", market_index_return)
                // return_vs_dates.push({
                //     "data":market_index_return,
                //     "color":"#7cb9f2",
                //     "selected_color":"#7cb9f2",
                //     "opacity":1,
                //     "selected_opacity":1,
                //     "name":"benchmark",
                //     "selected":false,
                //     "type":"common",
                // });
                // // 获取股票组合数据
                // var portfolio_index_raw = this.object2Array(this.data_backtest[0]["portfolio"]);
                // var portfolio_return = portfolio_index_raw.filter(d=>{
                //     return d != undefined;
                // });
                // console.log("portfolio_return", portfolio_return)
                // return_vs_dates.push({
                //     "data":portfolio_return,
                //     "color":"red",
                //     "selected_color":"red",
                //     "opacity":0.6,
                //     "selected_opacity":1,
                //     "name":"portfolio",
                //     "selected":false,
                //     "type":"common",
                // });
                // var all_return = market_index_return.map(d => d[1]);
                // all_return = all_return.concat(portfolio_return.map(d => d[1]));
                // var max_return = Math.max(...all_return);
                // var min_return = Math.min(...all_return);

                // var all_date = [];
                // var all_date = market_index_return.map(d => d[0]);
                // all_date = all_date.concat(portfolio_return.map(d => d[0]));
                // // 坐标轴
                // var parseTime = d3.timeParse("%Y-%m-%d");
                // var xScale = d3.scaleTime()
                //                 .domain(d3.extent(all_date, d => parseTime(d)))
                //                 .range([0, width * 0.98]);

                // var padding = max_return * 0.05;
                // // var yScale = d3.scaleLinear()
                // //                 .domain([min_return - padding, max_return + padding])
                // //                 .range([height - 10, 10]);
                // var yScale = d3.scaleLinear()
                //                 .domain([min_return - padding, max_return + padding])
                //                 .range([height, 10]);

                // svg.append("g")
                //     .attr("transform", "translate("+[0, height * Math.abs(max_return + padding) / (Math.abs(max_return + padding) + Math.abs(min_return - padding)) + 70]+")")
                //     .call(d3.axisBottom(xScale).ticks(4).tickFormat(d3.timeFormat("%Y.%m")))
                //     .append("text")
                //     .text("%")
                //     .style("fill","black")
                //     .attr("text-anchor","end")//字体尾部对齐
                //     .attr("dx","40px")
                //     // .attr("dy","0px")
                //     .selectAll("text");

                // svg.append("g")
                //     .attr('x',40)
                //     .call(d3.axisRight(yScale).tickFormat(d => `${((d)*100).toFixed(0)}`).ticks(5))
                //     .selectAll('text')
                //     .attr('x',5);

                // var tooltip = d3.select("body")
                //                 .append("div")
                //                 .style("position", "absolute")
                //                 .style("visibility","hidden")
                //                 .style("background", "lightsteelblue")
                //                 .style("opacity", "0.8")
                //                 .style("padding", "5px");

                // var liner = d3.line()
                //                 .curve(d3.curveMonotoneX)
                //                 .x(d => {
                //                     return xScale(parseTime(d[0]))
                //                 })
                //                 .y(d => yScale(d[1]));

                // // draw lines for stocks
                // var lines = svg.append("g")
                //                 .classed("lines", true)
                //                 .selectAll("path")
                // lines.data(return_vs_dates)
                //     .enter()
                //     .append("path")
                //     .merge(lines)
                //     .attr("class", d => {
                //         return d.name;
                //     })
                //     .attr("d", d => liner(d.data))
                //     // .style("stroke-dasharray", "2")
                //     .attr("stroke", d => {
                //         return d.color;
                //     })
                //     .attr("opacity", d => {
                //         return d.opacity;
                //     })
                //     .attr("stroke-width", "2")
                //     .attr("fill", "none")
                //     .on("mouseover", function(d) {
                //         if(!d.selected) {
                //             d3.select(that.$el).selectAll('.'+d.name).style("cursor", "pointer");
                //             d3.select(that.$el).selectAll('.'+d.name).attr("stroke-width", '4').attr("opacity", d.selected_opacity)
                //         }
                //         tooltip.style("visibility", "visible");
                //     })
                //     .on("mouseout", function(d) {
                //         if (!d.selected) {
                //             d3.select(that.$el).selectAll('.'+d.name).style("cursor", "default");
                //             d3.select(that.$el).selectAll('.'+d.name).attr("stroke-width", '2').attr("opacity",d.opacity)
                //         }
                //         tooltip.style("visibility", "hidden");
                //     })
                //     .on("mousemove", function(d) {
                //         var svg_rect = svg.node().getBoundingClientRect();
                //         var x = event.pageX-svg_rect.left;
                //         var y = event.pageY-svg_rect.top + 10;

                //         var tooltip_txt = "";
                //             tooltip.style("top", (event.pageY-40)+"px").style("left", (event.pageX - 150)+"px");
                //         // }
                //         tooltip_txt += "date: " + d3.timeFormat("%Y.%m.%d")(xScale.invert(x)) + "<br/>" +
                //             "return: " +`${(yScale.invert(y)*100).toFixed(2)}` + '%';
                //         tooltip.html(tooltip_txt);
                //     })
                //     .on("click", function(d) {
                //         if (d.selected) {
                //             d3.select(that.$el).selectAll('.'+d.name).attr("stroke-width", '4').attr("stroke", d.color);
                //         }
                //         else {
                //             d3.select(that.$el).selectAll('.'+d.name).attr("stroke-width", '2').attr("stroke", d.selected_color);
                //         }
                //         d.selected = !(d.selected)
                //     });

                //     var legend_width = 25;
                //     var legend_height = 12;
                //     var legend_margin_left = bounding_rect.width - 5* legend_width - margin.right;
                //     // console.log(legend_margin_left)
                //     var legend = svg.append("g")
                //                     .selectAll('.legend')
                //                     .data(["portfolio return", "market return"])
                //                     .enter()
                //                     .append('g')
                //                     .attr("class", "legend")
                //                     .attr("transform", "translate(" + legend_margin_left/7 + "," + (margin.top + legend_height) + ")");
                //     legend.append('line')
                //             .attr("x1", 0)
                //             .attr("x2", legend_width + "px")
                //             .attr("y1", (d,i) => {
                //                 return i * legend_height * 1.1 + 1 * legend_height + "px";
                //             })
                //             .attr("y2", (d,i) => {
                //                 return i * legend_height * 1.1 + 1 * legend_height + "px";
                //             })
                //             // .attr("y1", (d,i) => {
                //             //     return i * legend_height * 1.1 + 9 * legend_height + "px";
                //             // })
                //             // .attr("y2", (d,i) => {
                //             //     return i * legend_height * 1.1 + 9 * legend_height + "px";
                //             // })
                //             .attr("stroke-width", 2)
                //             .attr("stroke", function(d) {
                //                 return {
                //                     "portfolio return": "red",
                //                     "market return": "#7cb9f2"
                //                 }[d];
                //             });
                //     legend.append('text')
                //             .attr("x", 1.5 * legend_width + "px")
                //             // .attr("y", (d,i) => {
                //             //     return i * legend_height * 1.1 + 9 * legend_height + "px";
                //             // })
                //             .attr("y", (d,i) => {
                //                 return i * legend_height * 1.1 + 1.4 * legend_height + "px";
                //             })
                //             .text(function (d, i) {
                //                 return d;
                //             })
                //             .style("text-anchor", "start")
                //             .style("font-size", 1.1 * legend_height + "px");

            },
        }
    }
</script>
