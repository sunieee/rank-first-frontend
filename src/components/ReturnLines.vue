<template>
  <div style="overflow-x:hidden;width:100%">
    <div style="overflow-x:hidden" class="draw-area">
      <svg>

      </svg>
    </div>
  </div>
</template>


<script>
import { mapState } from 'vuex';
import * as d3 from 'd3'

export default {
  name: 'ReturnLines',
  props: {
    input_data: {
      type: Object,
    },
  },
  computed: {
    ...mapState(['selected_stocks']),
  },
  watch: {
    // selected_stocks: "updateLinesColor"
  },
  data() {
    return {
      stock_name: "",
    }
  },
  mounted() {
    this.$nextTick(function foo() {
      this.initialize();
      this.checkStockSelection();
    })
  },
  methods: {
    object2Array(p) {
      var arr = []
      for (var key in p) {
        if (p.hasOwnProperty(key)) {
          arr.push([key, p[key]])
        }
      }
      return arr
    },
    checkStockSelection(stock_name) {
      var isin = false;
      for (var i = 0; i < this.selected_stocks.length; i++) {
        if (this.selected_stocks[i].localeCompare(stock_name) === 0) {
          isin = true;
          break
        }
      }
      return isin;
    },
    updateLinesColor() {
      var that = this;

      this.lines.each(function(d) {
        var stock_name = d.name;
        var selected = that.checkStockSelection(stock_name);
        if (selected) {
          d3.select(this).attr("stroke", "red");
        }else {
          if(stock_name !== "Stock Index"){
            d3.select(this).attr("stroke", "grey");
          }
        }
      })
    },
    initialize(plate) {
      var that = this;
      var plate = this.input_data;
      // ghj
      this.stock_keys = Object.keys(this.input_data);

      var root_div = d3.select(this.$el);
      var bounding_rect = root_div.node().getBoundingClientRect()
      var margin = { top: 5, right: 5, bottom: 5, left: 10 }

      // var height = bounding_rect.height;
      var height = document.documentElement.clientHeight * 0.3;
      var width = bounding_rect.width - margin.left - margin.right;

      let svg = root_div.select(".draw-area").select("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(10,0)")
        .attr("width", width)
        .attr("height", height)

      // process data of stocks
      var all_date = [];
      this.stock_keys.forEach(k => {
        all_date = all_date.concat(Object.keys(plate[k]))
      })
      var return_data = [];
      this.stock_keys.forEach(k => {
        var raw = plate[k]
        var starting_value = raw[Object.keys(raw)[0]]
        var price_vs_date = this.object2Array(raw);
        var return_vs_date = price_vs_date.map(d => {
          // d[1] = (d[1] - starting_value)/starting_value
          d[1] = d[1]
          return d
        })
        return_data.push({
          name: k,
          data: return_vs_date,
          selected: false,
        })
        // console.log("return_data", return_data)
      })
      // console.log("return_data",return_data)

    let filter = pattern => return_data.forEach(d => {
            let line_data = []
            let index_set = new Set()
            d.data.forEach(x=> {
                let date = d3.timeParse("%Y-%m-%d")(x[0])
                let index = d3.timeFormat(pattern)(date)
                if (!index_set.has(index)) {
                    index_set.add(index)
                    line_data.push(x)
                } else {
                    line_data[line_data.length-1] = x // 只添加最后一天
                }
            })
            // console.log("line1", line_data)
            d.data = line_data
        })
    
    let mean_records = return_data.map(d => d.data.length).reduce((a, b) => a+b) / return_data.length 
    if (mean_records < 100) {
        // 按周
        filter("%U")
    } else {
        // 按月
        filter("%B")
    }

    console.log("return_data", return_data)
    let dates = return_data[return_data.length - 1].data.map(d => new Date(d[0]))
    // console.log("dates", dates)


    let all_data = []
    let Portfolio = undefined
    return_data.forEach(d => {
        if (d.name != "Portfolio") {
            d.data.forEach((x, i) => {
                all_data.push({
                    "name": d.name,
                    // "selected": d.selected,
                    "date": dates[i],
                    "value": x[1] - 1
                })
            })
        } else {
            Portfolio = d.data.map((x, i) => {
                return {
                    "name": "Portfolio",
                    "date": dates[i],
                    "value": x[1] - 1
                }
            })
        }
    })

    console.log("Portfolio", Portfolio)


    all_data.sort((a,b) => b.value - a.value)
    all_data.sort((a,b) => b.date - a.date)
    // 字符串无法比较大小，但是日期可以
    

    let date_set = new Set()
    let position = 1
    let date_index = dates.length
    let pre_value = undefined
    all_data.forEach(d => {
        if(!date_set.has(d.date)) {
            date_set.add(d.date)
            position = 1
            date_index -= 1
        }
        d.position = position
        let port = Portfolio[date_index]
        if(!port.hasOwnProperty("position") && d.value <= port.value) {
            // 在相邻股票之间插值：不验证！！！
            if(d.value == port.value) port.position = position
            else port.position = position - (port.value - d.value) / (pre_value - d.value)
        }
        pre_value = d.value
        position += 1
    })

    all_data = all_data.concat(Portfolio)

    // console.log("all_data", all_data)
    // console.log("Portfolio", Portfolio)


    //   // prepare to draw
    //   this.parseTime = d3.timeParse("%Y-%m-%d");
    //   this.xScale = d3.scaleTime()
    //     .domain(d3.extent(all_date, d => this.parseTime(d)))
    //     .range([0, width]);

        ///////////////////////
        // Scales
        let get_class =  name => "class" + name.toLowerCase().replace(/ /g, '-').replace(/\./g, '')

        let data = all_data
        var x = d3.scaleBand()
            .domain(dates)
            .rangeRound([60, width - 60]);


        var y = d3.scaleLinear()
            .domain([
                d3.min(data, d => d['position']), 
                d3.max(data, d => d['position'])
            ])
            .range([70, height - 60]);


        let base_size = 12
        let size = x => Math.pow(Math.abs(x), 0.5) * base_size 
        // 理论上 S = v ^ 1.4,  r = v ^0.7 ， 这里取0.5比较舒服
        
        // console.log("size", size)

        ///////////////////////
        // Axis
        // 避免小数：http://www.qiutianaimeili.com/html/page/2020/04/20204226klm3p676el.html

        var xAxis = d3.axisBottom(x)
           .tickFormat((d, i) => {
               if(dates.length <= 6) return d3.timeFormat("%m-%d")(d)
               if(i%2 == 1) return ""
               return d3.timeFormat("%m-%d")(d)
           })

        var yAxis = d3.axisLeft(y)
            .ticks(d3.max(data, d => d['position']))

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(-" + x.bandwidth() / 2.0 + "," + (height - 40) + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + 35 + ",0)")
            .call(yAxis)


        ///////////////////////
        // Title
        svg.append("text")
            .text('Rank')
            .attr("class", "axistext")
            .attr("text-anchor", "middle")
            .attr("x", 30)
            .attr("y", 30)
            .style('color', "black")
            .style('font-size', "20px")

        svg.append("text")
            .text('Date')
            .attr("class", "axistext")
            .attr("text-anchor", "middle")
            .attr("x", 720)
            .attr("y", 465)
            .style('color', "black")
            .style('font-size', "20px")

        let color = d => {
            if (d == "Stock Index") return "#0080ff"
            if (d == "Portfolio") return "#ff0000"
            return "black"
        }
        var data_legend = ["Stock Index", "Portfolio",  "Stocks"]


        var legend = svg.selectAll(".legend") 
            .data(data_legend)
            .enter().append("g")
            .attr("class", d => "legend " + get_class(d))
            .attr("transform", function(d, i) { return "translate(  " + (i * 200 - 600) + ", 0)"; })
            .attr('opacity', '0.6')
            .on("mouseover", function(d) {
                svg.selectAll('.' + get_class(d))
                    .classed('active', true);
            })
            .on("mouseleave", function(d) {
                svg.selectAll('.' + get_class(d))
                    .classed('active', false);
            })
            .on("click", function(d) {
                svg.selectAll('.' + get_class(d))
                    .classed('click-active', function(d) {
                        // toggle state
                        return !d3.select(this).classed('click-active');
                    });
            })
            

        legend.append("rect")
            .attr("x", width - 50) //width是svg的宽度，x属性用来调整位置
            // .attr("x", (width / 160) * 157)  
            //或者可以用width的分数来表示，更稳定一些，这是我试出来的，下面同
            .attr("y", 20)
            .attr("width", 40)
            .attr("height", 3) //设低一些就是线，高一些就是面，很好理解
            .style("fill", d=>color(d));
        
        //绘制图例文字
        legend.append("text")
            .attr("x", width)
            // .attr("x", (width / 40) * 39)
            .attr("y", 30)
            .style("text-anchor", "begin") //样式对齐
            .style("font-size", "20px")
            .text(d=>d);

        // svg.selectAll("mytext")
        //     .data(currData)
        //     .enter()
        //     .append("text")
        //     // .attr({
        //     //     'class': "mytext",
        //     //     "text-anchor": "middle",
        //     //     'x': width -15,
        //     //     'y': d => y(d.position)
        //     // })
        //     .attr("class", d => get_class(d["name"]))
        //     .attr("text-anchor", "middle")
        //     .attr("x", width - 50)
        //     .attr("y", d => y(d.position) + 5)
        //     .attr('opacity', '0.6')
        //     .text(d => d.name)
        //     .style('font-size', '16px')
        //     .style('font-family', 'Arial')
        //     .style('color', get_color)

        ///////////////////////
        // Lines
        var names = d3.map(data, function(d) {
            return d['name'];
        }).keys();

        // console.log("names", names)
        var line = d3.line()
            .x(function(d) {
                return x(d['date']);
            })
            .y(function(d) {
                return y(d['position']);
            })

        names.forEach(function(name) {
            var currData = data.filter(function(d) {
                if (d['name'] == name) {
                    return d;
                }
            });

                // .interpolate("monotone")

            // console.log("curdata", currData)

            svg.append("path")
                .datum(currData)
                .attr("class", get_class(name))
                .attr("fill", "none")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 3)
                .attr("stroke-opacity", 0.3)
                .attr("stroke", 'black')
                .attr("d", line)
                
        });

        ///////////////////////
        // Nodes
        let get_color = d=> {
            if(d['value'] > 0) return color(d["name"])
            return 'white'
            }
        var node = svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("class", "point")
            .attr("cx", function(d) {
                return x(d['date']);
            })
            .attr("cy", function(d) {
                return y(d['position']);
            })
            .attr('fill', get_color)
            // replace spaces with - and remove '.' (from d.c. united)
            .attr("class", d => get_class(d["name"]))
            .attr("r", d => size(d["value"]))
            //.attr("r", function(d) { return size(d['goals_for']) })
            .attr("stroke-width", 1.5)
            .attr("stroke", "black")
            .attr('opacity', '0.6');

        ///////////////////////
        // Tooltips
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");

        let mouseover = function(d) {
                svg.selectAll('.' + get_class(d['name']))
                    .classed('active', true);

                var tooltip_str = "name: " + d['name'] +
                    "<br/>" + "date: " + d3.timeFormat("%b %d")(d['date']) +
                    "<br/>" + "return: " + (d['value'] * 100).toFixed(2) + "%" 
                    // +  "<br/>" + "class: " + get_class(d['name']) 

                tooltip.html(tooltip_str)
                    .style("visibility", "visible");
            }
        let mousemove = function(d) {
                tooltip.style("top", event.pageY - (tooltip.node().clientHeight + 5) + "px")
                    .style("left", event.pageX - (tooltip.node().clientWidth / 2.0) + "px");
            }
        let mouseout = function(d) {
                svg.selectAll('.' + get_class(d['name']))
                    .classed('active', false);

                tooltip.style("visibility", "hidden");
            }
        let click = function(d) {
                svg.selectAll('.' + get_class(d['name']))
                    .classed('click-active', function(d) {
                        // toggle state
                        return !d3.select(this).classed('click-active');
                    });
            }

        svg.selectAll("circle")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout)
            .on('click', click)

        
        var currData = data.filter(function(d) {
                if (d['date'] == dates[dates.length - 1]) {
                    return d;
                }
            });
        // console.log("text", currData)
        let text = svg
            .selectAll("mytext")
            .data(currData)
            .enter()
            .append("text")
            // .attr({
            //     'class': "mytext",
            //     "text-anchor": "middle",
            //     'x': width -15,
            //     'y': d => y(d.position)
            // })
            .attr("class", d => get_class(d["name"]))
            .attr("text-anchor", "middle")
            .attr("x", width - 50)
            .attr("y", d => y(d.position) + 5)
            .attr('opacity', '1')
            .text(d => {
                if (['Stock Index', 'Portfolio'].includes(d.name)) return ''
                return d.name
            })
            .style('font-size', '16px')
            .style('font-family', 'Arial')
            .style('color', get_color)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout)
            .on('click', click)

        svg.selectAll('.classstock-index')
            .classed('click-active', true);
        svg.selectAll('.classportfolio')
            .classed('click-active', true);
    },
  }
}

</script>

<style>
    .axistext {
        color: "red";
    }

    .click-active,
    .active {
        opacity: 1.0;
        stroke-opacity: 1.0;
        z-index: 1000;
        /*r: 8;*/
    }
    
    path.click-active {
        stroke-width: 3.0;
    }
    
    path.active {
        stroke-width: 3.0;
    }
    
    .axis text {
        font: 20px sans-serif;
    }
    
    .axis path,
    .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
    }
    
    /* .x.axis path {
        display: none;
    } */
    
    .tooltip {
        position: absolute;
        padding: 10px;
        font: 20px sans-serif;
        background: #222;
        color: #fff;
        border: 0px;
        border-radius: 8px;
        pointer-events: none;
        opacity: 0.9;
        visibility: hidden;
    }
    /* soccer team colors */
    /* http://teamcolors.arc90.com/ */
    
    .classstock-index {
        stroke: #0080ff;
    }

    .classportfolio {
        stroke: #ff0000;
    }
    
</style>
