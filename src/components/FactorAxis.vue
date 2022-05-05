<template>
  <div style="width:100%;" id='glyph_area'>
    <div style="width:100%;height:5px; position:relative; z-index:2">
      <p style='text-align:left;padding-left:50px;font-weight:bold;cursor:pointer;'
         v-bind:style="{color:selected?'red':'black'}"
         v-on:click="toggleStockSelection(stock_name)">
      {{stock_name}}
      </p>
    </div>
    <div style="overflow:auto; margin-top:-40px; position:relative; z-index:1">
      <svg>
        <g v-bind:transform='"translate(30," + height/2 + ")"'>
          <g id="glyphs">
            <g class="glyph"
              v-for="d in data_glyphs"
              v-bind:transform='"translate("+d.sx+","+d.sy+")"'
            >
              <voronoi-map
                v-bind:svg_width="d.size"
                v-bind:datapoint="d.data"
                v-bind:date="d.date"
                v-bind:sign="d.sign"
                v-bind:inner_circle_r="d.inner_circle_r"
                v-bind:pos_or_neg="d.pos_or_neg"
                v-on:AnchorsComputed="setAnchor"
                v-on:HoverFactor="addOneFactorConnection"
                v-on:LeaveFactor="drawFactorConnection"
              >
              </voronoi-map>
            </g>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import * as d3 from 'd3'
import VoronoiMap from '@/components/VoronoiMap';
import C from './constants.js'
import NetService from '@/services/net-service';

// if error_ratio > ERROR_RATIO_THRESHOLD, then the y position will be fixed
const ERROR_RATIO_THRESHOLD = 50;
const X_OFFSET = 20;

export default {
  name: 'FactorAxis',
  components: {
    VoronoiMap
  },
  props: {
    input_data: {
      type: Object,
    }
  },
  computed: {
    ...mapState(['start_date','end_date', 'selected_factors_for_stocks', 'selected_stocks']),
  },
  watch: {
    input_data: 'initialize',
    selected_factors_for_stocks: 'drawFactorConnection',
    selected_stocks: "updateStockSelection",
  },
  data() {
    return {
      datapointKeys: ['positive', 'negative'],
      height:0,
      width:0,
      data_glyphs: [], // datapoints for voronoi map
      dates: [], // dates in the given data
      anchors: {}, // stores the information needed for each connectFactor(), indexed by dates
      stock_name: "",
      last_len: 0,
      selected: false, // whether this stock is selected in E
    }
  },
  mounted() {
    this.$nextTick(function foo() {
      this.initializeDrawingArea();
      this.initialize();
      this.updateStockSelection();
    })
  },
  methods: {
    maxOfObject(p) {
      var max = -1e7
      for (var key in p) {
        if (p.hasOwnProperty(key)) {
          if (p[key] > max) {
            max = p[key]
          }
        }
      }
      return max
    },
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
    updateStockSelection() {
      this.selected = this.checkStockSelection(this.stock_name);
    },
    toggleStockSelection(stock_name) {
      var isin = this.checkStockSelection(stock_name);
      if (isin) {
        this.$store.commit('rm_selected_stock', stock_name);
      }else {
        this.$store.commit('add_select_stock', stock_name);
      }
      this.getDataForeturn()
    },

    // ghj stockReturn
    getDataForeturn() {
      var that = this;
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

    initializeDrawingArea() {
      var glyphSVG = d3.select(this.$el).select("svg")
      this.drawArea = glyphSVG.select("g")
      var drawArea = this.drawArea
      this.xAxis = drawArea.append("g")
        .classed("x-axis", true)
      this.yAxis = drawArea.append("g")
        .classed("y-axis", true)

      // For connectFactor
      this.lines = drawArea.append("g")
        .classed("lines", true);

      // For drawCloseLine
      this.close = drawArea.append("g")
        .classed("close",true)
      this.close_true = this.close.append("g")
        .classed("close-true", true)
      this.close_predicted = this.close.append("g")
        .classed("close_predicted", true)

      // For ArimaLines
      this.arimaLines = drawArea.append('g')
        .classed('arima-lines', true)

      // For drawErrorBars
      this.errorBars = drawArea.append('g')
        .classed('error-bars', true)

      // For Alpha Dot
      this.alphaDot = drawArea.append('g')
        .classed('alpha-dot', true)
    },
    calculateErrorRatio(stock) {
      // calculate the offset_y for each month of the stock
      for (var idx = 0; idx < stock.length; ++idx) {
        var datapoint = stock[idx];
        var close_data = this.object2Array(datapoint.close).map(d => d[1]);
        var predicted_close_data = this.object2Array(datapoint.predicted_close).map(d => d[1]);
        var close_starting = close_data[0];
        var close_ending = close_data[close_data.length-1];
        var predicted_close_ending = predicted_close_data[predicted_close_data.length-1];
        stock[idx].error_ratio = Math.abs((close_ending - predicted_close_ending) / close_starting);
      }
      return stock;
    },
    initialize() {
      // initialize the data
      this.stock_name = Object.keys(this.input_data)[0]
      this.data = this.input_data[this.stock_name]
      // this following line does not work as a way to reload all the voronoi maps
      this.data_glyphs = []
      this.dates = []
      this.anchors = {}

      var stock = this.data;

      var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 20
      };

      // var month_width = 80;
      // var width = month_width * stock.length - margin.right - margin.left;
      // var height = 600 - margin.top - margin.bottom;
      // var width = document.getElementById('glyph_area').clientWidth - margin.left - margin.right;
      // var height = document.getElementById('glyph_area').clientHeight;

      var root_div = d3.select(this.$el);
      var bounding_rect = root_div.node().getBoundingClientRect();
      var width = bounding_rect.width - margin.left - margin.right;
      // var height = bounding_rect.height;
      var height = C.FACTOR_AXIS_HEIGHT;

      this.width = width;
      this.height = height;

      var glyphSVG = d3.select(this.$el).select("svg")
        .attr("width", width)
        .attr("height", height)

      var allBias = [];
      var allSum = [];
      stock.forEach((value) => {
        allBias.push(Math.abs(value['positive']['bias']));
        allSum.push(value['positive']['selected_sum'] + value['positive']['unselected_sum']);
        allSum.push(Math.abs(value['negative']['selected_sum'] + value['negative']['unselected_sum']));
      });

      // var maxSum = Math.max(...allSum);
      // var positionScale = d3.scaleLinear().domain([0, maxSum]).range([0, height/2-50]);
      // var maxBias = Math.max(...allBias);
      // var biasScale = d3.scaleLinear().domain([0, maxBias]).range([100, 20]);

      // stock = this.calculateErrorRatio(stock);
      var max_pct_change_1 = Math.max(...stock.map(d=>1.5 * (Math.abs(d.beta + d.alpha + d.high_limitation))));
      var max_pct_change_2 = Math.max(...stock.map(d=>1.5 * (Math.abs(d.beta + d.alpha + d.low_limitation))));
      var max_pct_change_3 = Math.max(...stock.map(d=>1.5 * (Math.abs(d.pct_change))));
      var max_pct_change = Math.max(max_pct_change_1, max_pct_change_2, max_pct_change_3)

      // For All Stock
      // var max_pct_change = 10

      if(max_pct_change > ERROR_RATIO_THRESHOLD) {
        var glyph_y_scale = d3.scaleLinear().domain([0, ERROR_RATIO_THRESHOLD, max_pct_change])
            .range([C.GLYPH_CENTER_TO_BAR, height/2-C.MARGIN_HEIGHT_FOR_GLYPH, height/2-C.MARGIN_HEIGHT_FOR_GLYPH]);
        var glyph_y_scale_for_axis = d3.scaleLinear().domain([-ERROR_RATIO_THRESHOLD, ERROR_RATIO_THRESHOLD])
            .range([-(height/2-C.MARGIN_HEIGHT_FOR_GLYPH), height/2-C.MARGIN_HEIGHT_FOR_GLYPH])
        var error_bar_opcaity_scale = d3.scaleLinear().domain([0, ERROR_RATIO_THRESHOLD, max_pct_change]).range([0.2, 1, 1]);

        // scale for arima line
        var arima_y_scale = d3.scaleLinear().domain([-max_pct_change, max_pct_change])
            .range([-height/2 + C.MARGIN_HEIGHT_FOR_GLYPH, height/2 - C.MARGIN_HEIGHT_FOR_GLYPH])
      } else if(max_pct_change <= ERROR_RATIO_THRESHOLD) {
        var glyph_y_scale = d3.scaleLinear().domain([0, max_pct_change]).range([C.GLYPH_CENTER_TO_BAR, height/2-C.MARGIN_HEIGHT_FOR_GLYPH]);
        var glyph_y_scale_for_axis = d3.scaleLinear().domain([max_pct_change, -max_pct_change])
            .range([-(height/2-C.MARGIN_HEIGHT_FOR_GLYPH), height/2-C.MARGIN_HEIGHT_FOR_GLYPH])
        var error_bar_opcaity_scale = d3.scaleLinear().domain([0, max_pct_change]).range([0.2, 1]);

        // scale for arima line
        var arima_y_scale = d3.scaleLinear().domain([-max_pct_change, max_pct_change])
            .range([-height/2 + C.MARGIN_HEIGHT_FOR_GLYPH, height/2 - C.MARGIN_HEIGHT_FOR_GLYPH])
      }

      var maxSum = Math.max(...allSum);
      var glyph_size_scale = d3.scaleSqrt().domain([0, maxSum]).range([0, C.MAX_GLYPH_RADIUS]);

      // var maxBias = Math.max(...allBias);
      // var glyph_inner_circle_scale = d3.scaleSqrt().domain([0, maxBias]).range([0,10]);
      // var glyph_inner_circle_scale = d3.scaleSqrt().domain([0, max_pct_change]).range([0,20]);
      var bar_width = 20
      // var glyph_inner_circle_scale = d3.scaleSqrt().domain([0, max_pct_change]).range([0, (height/2-C.MARGIN_HEIGHT_FOR_GLYPH)/(Math.sqrt(bar_width/Math.PI))]);
      var glyph_inner_circle_scale = d3.scaleSqrt().domain([0, max_pct_change]).range([0, (height/2-C.MARGIN_HEIGHT_FOR_GLYPH)]);
      var glyph_y_scale = d3.scaleLinear().domain([0, max_pct_change]).range([C.GLYPH_CENTER_TO_BAR, height/2-C.MARGIN_HEIGHT_FOR_GLYPH]);

      var maxError = Math.max(...stock.map(d=>Math.abs(d.error)))
      var error_bar_width_scale = d3.scaleLinear().domain([0, maxError]).range([0, bar_width]);

      var drawArea = this.drawArea

      // Draw the time axis
      this.parseTime = d3.timeParse("%Y-%m-%d");
      var prev_monthday = (dt_str) => {
        let parts = dt_str.split("-");
        let dt = new Date(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
        // dt.setDate(1);
        // dt.setMonth(dt.getMonth()-1);
        return dt.getFullYear() + "-" + dt.getMonth() + "-" + dt.getDate();
      }
      var month_count = (d1, d2)=>{
        let months;
        let parts_d1 = d1.split("-");
        let parts_d2 = d2.split("-");
        d1 = new Date(parseInt(parts_d1[0]), parseInt(parts_d1[1]), parseInt(parts_d1[2]));
        d2 = new Date(parseInt(parts_d2[0]), parseInt(parts_d2[1]), parseInt(parts_d2[2]));
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth() + 1;
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
      }

      // !!! 2020 09 21 Need to be modified
      // this.x_scale = d3.scaleTime()
      //   // .domain(d3.extent(stock, (d) => this.parseTime(d['date'])))
      //   .domain([this.parseTime(this.start_date), this.parseTime(prev_monthday(this.end_date))])
      //   .range([X_OFFSET, width-50]);

      // max of relative values (divided by the starting value)
      // var maxClose = d3.max(this.data, d => this.maxOfObject(d['close']) / d['close'][Object.keys(d['close'])[0]])
      // var maxPredictedClose = d3.max(this.data, d => this.maxOfObject(d['predicted_close']) / d['predicted_close'][Object.keys(d['predicted_close'])[0]])
      // calculate the scale used for lines
      // this.yScale = d3.scaleLinear()
      //  .domain([-Math.max(maxClose, maxPredictedClose), Math.max(maxClose, maxPredictedClose)])
      //  .range([height/2, -height/2])
      // this.xAxis.call(d3.axisBottom(this.x_scale).ticks(stock.length).tickFormat(d3.timeFormat("%Y.%m")));
      // this.xAxis.call(d3.axisBottom(this.x_scale).ticks(month_count(this.start_date, this.end_date))
      //   .tickFormat(d3.timeFormat("%m")))


      // For Overview xAxis Display
      var dates_list = []
      for (var idx = 0; idx < stock.length; ++idx) {
        var datapoint = stock[idx];
        var dt = datapoint.date;
        dates_list.push(dt)
      }

      var dates_dict = {}
      var month_dict = {
        "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "May","6": "Jun",
        "7": "Jul", "8": "Aug", "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
      }
      var pre_year, pre_month, pre_week = 0, pre_day = 0
      var tmp_year, tmp_month, tmp_day
      var index = 0

      var pre_date

      for(var dt of dates_list){
        var tmp_date = this.parseTime(dt)

        if(pre_date){
          var pp_date = this.parseTime(pre_date)
          var sub_days = (tmp_date - pp_date) / 1000 / 3600 / 24
        }

        tmp_year = tmp_date.getFullYear()
        tmp_month = tmp_date.getMonth()
        tmp_day = tmp_date.getDay()
        if(pre_year != tmp_year){
          pre_year = tmp_year
          pre_month = tmp_month
          pre_day = tmp_day
          dates_dict[index] = pre_year
          pre_week = 1
        }
        else if(pre_month != tmp_month){
          pre_month = tmp_month
          pre_day = tmp_day
          dates_dict[index] = month_dict[pre_month + 1]
          pre_week = 1
        }
        else if(tmp_day <= pre_day || sub_days > 7){
          pre_week += 1
          pre_day = tmp_day
          dates_dict[index] = pre_week
        }
        else{
          pre_day = tmp_day
          dates_dict[index] = ""
        }
        index += 1
        pre_date = dt
      }

      var parseTime = d3.timeParse("%Y-%m-%d");
      var start_date = parseTime(dates_list[0])
      var end_date = parseTime(dates_list[dates_list.length - 1])

      this.x_scale = d3.scaleTime()
        .domain([start_date, end_date])
        .range([X_OFFSET, width-50]);
        // .range([20, 50]);

      //var x = d3.scale
      //    .ordinal()
      //    .domain(dates_list.map(function (d) {
      //        return this.parseTime(d);
      //    }))
      //    .rangeRoundBands([20, width - 20]);

      //this.xAxis.call(d3.axisBottom(this.x_scale)
      //  .tickFormat((d)=>{console.log(d); return dates_dict[d]}))
      //  .selectAll('text')
      //    .attr('x',10);

      this.x_scale = d3.scaleTime()
        // .domain(d3.extent(stock, (d) => this.parseTime(d['date'])))
        .domain([this.parseTime(this.start_date), this.parseTime(this.end_date)])
        .range([X_OFFSET, width-50]);
      
      this.xAxis.call(d3.axisBottom(this.x_scale).ticks(dates_list.length)
        .tickFormat((d, i)=>{return dates_dict[i]}))
      //this.xAxis.call(d3.axisBottom(this.x_scale).ticks(12)
      //  .tickFormat((d)=>{console.log(d); return d.getMonth()}))
      //  .selectAll('text')
      //    .attr('x',10);
      this.yAxis.call(d3.axisLeft(glyph_y_scale_for_axis)
        .tickFormat(d => `${d}%`).ticks(5))
        .selectAll('text')
          .attr('x',-8);
      // this.yAxis.call(d3.axisLeft(this.yScale));

      // this.drawCloseLine();

      // Count DatesList

      var datesList = [];
      for (var index = 0; index < stock.length; ++index){
        var datapoint = stock[index];
        datesList.push(datapoint["date"])
      }

      // Draw Vonoroi
      // For the factors in each month, draw glyphs for positive and negative respectively
      var glyphs = drawArea.select("#glyphs").raise()
      for (var idx = 0; idx < stock.length; ++idx) {
        var datapoint = stock[idx];
        // calculate the x position of the glyph
        // var sx = idx * month_width + X_OFFSET;
        var month = this.parseTime(datapoint['date'])
        // month.setDate(1)
        // var sx = this.x_scale(month)
        var sx = this.xScaleForAxis(datapoint['date'], datesList)
        // Get dates
        var date = datapoint.date;
        this.dates.push(date)
        this.anchors[date] = {}
        this.anchors[date]['offset'] = {}
        this.anchors[date]["anchors"] = {}

        if (datapoint.beta >= 0){
          var drawKey = "positive";
        }
        else{
          var drawKey = "negative";
        }

        var glyphInfo = datapoint[drawKey];

        // calculate the y position of the glyph
        var sy;
        var posOrNeg = datapoint.beta >= 0 ? 1 : -1;
        sy = glyph_y_scale(Math.abs(datapoint.beta));
        
        if (posOrNeg === 1 && drawKey === "positive" || posOrNeg === -1 && drawKey === "negative"){
          sy = - posOrNeg * glyph_y_scale(Math.abs(datapoint.beta));
        }
        else{
          sy = 0;
        }
        // Y for Inner Circle
        // var y_circle = -arima_y_scale(datapoint.pct_change >= 0 ? datapoint.high_limitation : datapoint.low_limitation)

        var start_y = datapoint.beta >= 0 ? 
          -glyph_y_scale(Math.abs(datapoint.beta)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(datapoint.bia) : 
          glyph_y_scale(Math.abs(datapoint.beta)) - C.GLYPH_CENTER_TO_BAR - arima_y_scale(datapoint.bia)
        // var g_height = datapoint.beta * datapoint.g_height >= 0 ? arima_y_scale(datapoint.g_height) : 0
        // var y_circle = start_y - g_height
        var y_circle = start_y
        y_circle = datapoint.beta * y_circle <= 0 ? y_circle : 0
        
        // var glyph_size = glyph_size_scale(Math.abs(glyphInfo['sum']));
        var glyph_size = glyph_size_scale(Math.abs(glyphInfo["selected_sum"]) + Math.abs(glyphInfo["unselected_sum"]))


        // Modify Bias in Json File
        // var inner_circle_r = glyph_inner_circle_scale(Math.abs(glyphInfo['sum']) / 2);
        // var inner_circle_r = glyph_inner_circle_scale(Math.abs(glyphInfo['selected_sum']) / 2 + Math.abs(glyphInfo["unselected_sum"]) / 2);

        // SL Y&R
        // var dot_y = -arima_y_scale(datapoint.pct_change)
        // var posOrNeg = datapoint.beta >= 0 ? 1 : -1;
        // var bar_near_y = - arima_y_scale(datapoint.bia)
        // var bar_far_y = posOrNeg === 1 ? - glyph_y_scale(Math.abs(datapoint.beta)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(datapoint.bia) :
        //   (glyph_y_scale(Math.abs(datapoint.beta)) - C.GLYPH_CENTER_TO_BAR) - arima_y_scale(datapoint.bia)
        // if (posOrNeg === 1){
        //   var far_y = dot_y < bar_far_y ? bar_far_y : dot_y;
        //   var near_y = dot_y < bar_near_y ? bar_near_y : dot_y;

        //   var sy = (far_y + 4 + near_y) / 2;
        // }
        // else{
        //   var far_y = dot_y < bar_far_y ? dot_y : bar_far_y;
        //   var near_y = dot_y < bar_near_y ? dot_y : bar_near_y;

        //   var sy = (far_y - 4 + near_y) / 2;
        // }

        // var inner_circle_r = (far_y - near_y) / 2;

        var dot_y = -arima_y_scale(datapoint.pct_change)
        var posOrNeg = datapoint.beta >= 0 ? 1 : -1;
        var bar_near_y = - arima_y_scale(datapoint.bia)
        // var inner_circle_r = glyph_inner_circle_scale(Math.abs(glyphInfo['selected_sum']) / 2 + Math.abs(glyphInfo["unselected_sum"]) / 2) * (Math.abs(datapoint.beta) / (Math.abs(glyphInfo['selected_sum']) + Math.abs(glyphInfo["unselected_sum"])));
        var inner_circle_r = glyph_inner_circle_scale(Math.abs(datapoint.beta)) * (Math.abs(datapoint.beta) / (Math.abs(glyphInfo['selected_sum']) + Math.abs(glyphInfo["unselected_sum"]))) / 2;
        console.log(Math.abs(datapoint.beta) / (Math.abs(glyphInfo['selected_sum']) + Math.abs(glyphInfo["unselected_sum"] )))
        console.log(inner_circle_r)
        console.log(-arima_y_scale(datapoint.beta))
        console.log("...")
        if (posOrNeg === 1){
          //var start_y = -glyph_y_scale(Math.abs(datapoint.beta)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(datapoint.bia)
          var start_y = - arima_y_scale((datapoint.beta)) - arima_y_scale(datapoint.bia)
          var line_length = arima_y_scale((datapoint.arima_res + datapoint.low_limitation))
          var lower_line_y = start_y - line_length

          var sy = Math.max(dot_y, bar_near_y, lower_line_y) + inner_circle_r * 1.2
        }
        else{
          //var start_y = glyph_y_scale(Math.abs(datapoint.beta)) - C.GLYPH_CENTER_TO_BAR - arima_y_scale(datapoint.bia)
          var start_y = - arima_y_scale((datapoint.beta)) - arima_y_scale(datapoint.bia)
          var line_length = arima_y_scale((datapoint.arima_res + datapoint.high_limitation))
          var upper_line_y = start_y - line_length

          var sy = Math.min(dot_y, bar_near_y, upper_line_y) - inner_circle_r * 1.2
        }

        //inner_circle_r: inner_circle_r > error_bar_width_scale(1) ? error_bar_width_scale(1) : inner_circle_r,

        var data_glyph = {
          data: glyphInfo,
          date: date,
          sign: drawKey,
          sx: sx,
          sy: sy,
          size: glyph_size,
          inner_circle_r: inner_circle_r,
          pos_or_neg: drawKey ==="positive" ? +1 : -1
        };
        this.data_glyphs.push(data_glyph);

        // Store position information for connectFactor
        this.anchors[date]['offset'] = {}
        this.anchors[date]['offset']["sx"] = sx
        this.anchors[date]['offset']["sy"] = sy
        

        // // Handle the positive and negative respectively
        // this.datapointKeys.forEach((k, i) => {
        //   var glyphInfo = datapoint[k];
        //   // console.log("XXX")
        //   // console.log(glyphInfo)
        //   // console.log("XXX")

        //   // var glyphPosition = glyphInfo['sum'];
        //   // var glyph_size = biasScale(Math.abs(glyphInfo['bias']));

        //   // calculate the y position of the glyph
        //   var sy;
        //   var posOrNeg = datapoint.pct_change >= 0 ? 1 : -1;
        //   sy = glyph_y_scale(Math.abs(datapoint.pct_change));
        //   
        //   if (posOrNeg === 1 && k === "positive" || posOrNeg === -1 && k === "negative"){
        //     sy = - posOrNeg * glyph_y_scale(Math.abs(datapoint.pct_change));
        //   }
        //   else{
        //     sy = 0;
        //   }

        //   // if (k === "positive") {
        //   //   // sy = - positionScale(Math.a3s(glyphPosition));
        //   //   sy = - glyph_y_scale(Math.abs(datapoint.pct_change));
        //   // }else {
        //   //   // sy = + positionScale(Math.abs(glyphPosition));
        //   //   sy = + glyph_y_scale(Math.abs(datapoint.pct_change));
        //   // }

        //   var glyph_size = glyph_size_scale(Math.abs(glyphInfo['sum']));

        //   // Modify Bias in Json File
        //   // var inner_circle_r = glyph_inner_circle_scale(Math.abs(glyphInfo['bias']));
        //   var inner_circle_r = glyph_inner_circle_scale(Math.abs(glyphInfo['sum']) / 2);

        //   var data_glyph = {
        //     data: glyphInfo,
        //     date: date,
        //     sign: k,
        //     sx: sx,
        //     sy: sy,
        //     size: glyph_size,
        //     inner_circle_r: inner_circle_r,
        //     pos_or_neg: k==="positive" ? +1 : -1
        //   };
        //   this.data_glyphs.push(data_glyph);

        //   // Store position information for connectFactor
        //   this.anchors[date]['offset'][k] = {}
        //   this.anchors[date]['offset'][k]["sx"] = sx
        //   this.anchors[date]['offset'][k]["sy"] = sy
        // })
      }



      // Draw Error Bars
      var errorBars = this.errorBars.selectAll('.error-bars')
        .data(stock)
      errorBars.enter()
        .append('rect')
        // .attr('x', (d, i) => this.x_scale(this.parseTime(d.date)) - error_bar_width_scale(Math.abs(d.error))/2)
        .attr('x', (d, i) => this.xScaleForAxis(d['date'], datesList) - error_bar_width_scale(Math.abs(d.error))/2)
        .attr('width', (d) => error_bar_width_scale(Math.abs(d.error)))
        // .attr('y', (d) => - glyph_y_scale(Math.abs(d.pct_change)) + C.GLYPH_CENTER_TO_BAR)
        // .attr('height', (d) => 2 * (glyph_y_scale(Math.abs(d.pct_change)) - C.GLYPH_CENTER_TO_BAR))
        // .attr('y', (d) => C.GLYPH_CENTER_TO_BAR)
        // .attr('height', (d) => posOrNeg * (glyph_y_scale(Math.abs(d.pct_change)) - C.GLYPH_CENTER_TO_BAR))
        .attr('y', function(d){
          var posOrNeg = d.beta >= 0 ? 1 : -1;
          if (posOrNeg === 1){
            //return - glyph_y_scale(Math.abs(d.beta)) + C.GLYPH_CENTER_TO_BAR;
            return - arima_y_scale((d.beta));
          }
          else{
            return 0;
          }
        })
        .attr('height', function(d){
          var posOrNeg = d.beta >= 0 ? 1 : -1;
          if (posOrNeg === 1){
            //return (glyph_y_scale(Math.abs(d.beta)) - C.GLYPH_CENTER_TO_BAR);
            return Math.abs(-arima_y_scale((d.beta)));
          }
          else{
            //return (glyph_y_scale(Math.abs(d.beta)) - C.GLYPH_CENTER_TO_BAR);
            return Math.abs(arima_y_scale((d.beta)));
          }
        })
        //.style('fill',(d) => d.beta > 0? '#f26b44': '#7ac89f')
        .style('fill', '#ffffff')
        .style('stroke', (d) => d.beta > 0? C.BAR_COLOR["red"] : C.BAR_COLOR["green"])
        .style('stroke-width', '1.5')
        .style('opacity', '1')
        //.style('opacity', (d) => error_bar_opcaity_scale(Math.abs(d.pct_change)))
        // .on("mouseover", function(d) {
        //   d3.select(this)
        //     .style("stroke", "black")
        //     .style("stroke-width", 2)
        //     .style("stroke-opacity", 1)
        // })
        // .on("mouseout", function(d) {
        //   d3.select(this)
        //     .style("stroke", "none")
        // })
        .each(function(d) {
          var posOrNeg = d.beta >= 0 ? 1 : -1;

          d3.select(this).append("title")
            .classed("tooltip", true)
            .text(() => "Factor Return: " + d.beta.toFixed(2) + "%" + "\n"
              + "Stock Return: " + d.pct_change.toFixed(2) + "%" + "\n"
              + "Volatility(90%CI): " + (d.low_limitation + d.beta + d.arima_res + d.bia).toFixed(2) + "%~" + (d.high_limitation + d.beta + d.arima_res + d.bia).toFixed(2) + "%"
            )
            // .text(() => "beta: " + d.pct_change.toFixed(2) + "%\nprediction error: " + d.error.toFixed(2) + "%")
            //.text(() => "error: " + d.error.toFixed(2) + "%\nabsolute error: " + d.error_abs.toFixed(2) + "%")
        })

        // .attr('x', (d, i) => this.x_scale(this.parseTime(d.date)) - error_bar_width_scale(Math.abs(d.error))/2)
        .attr('x', (d, i) => this.xScaleForAxis(d['date'], datesList) - error_bar_width_scale(Math.abs(d.error))/2)
        .attr('width', (d) => error_bar_width_scale(Math.abs(d.error)))
        .attr('y', function(d){
          var posOrNeg = d.beta >= 0 ? 1 : -1;
          if (posOrNeg === 1){
            //return - glyph_y_scale(Math.abs(d.beta)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia)
            return - arima_y_scale((d.beta)) - arima_y_scale(d.bia)
          }
          else{
            return - arima_y_scale(d.bia);
          }
        })
        .attr('height', function(d){
          //var res = (glyph_y_scale(Math.abs(d.beta)) - C.GLYPH_CENTER_TO_BAR)
          var res = Math.abs(- arima_y_scale((d.beta)))
          // In case There is no bar displayed
          return res > 1 ? res : 1
        })


        // Draw Alpha Dot
        var alphaDot = this.alphaDot.selectAll('.alpha-dot').data(stock)
        console.log("stocks view")
        console.log(stock)

        alphaDot.enter()
        .append('circle')
        .attr('cx', (d) => this.xScaleForAxis(d['date'], datesList))
        .attr('cy', function(d){
          return -arima_y_scale(d.pct_change)
          // var bar_top = d.beta >= 0 ? -glyph_y_scale(Math.abs(d.beta)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia) : 
          //   glyph_y_scale(Math.abs(d.beta)) - C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia)
          // return bar_top - arima_y_scale(d.alpha)
        })
        .attr('r', 5)
        .attr('fill', (d) => d.beta > 0? C.BAR_COLOR["red"] : C.BAR_COLOR["green"])

        alphaDot.enter()
        .append('line')
        .attr('x1', (d) => this.xScaleForAxis(d['date'], datesList) - error_bar_width_scale(Math.abs(d.error)) / 2 * 2)
        .attr('x2', (d) => this.xScaleForAxis(d['date'], datesList) + error_bar_width_scale(Math.abs(d.error)) / 2 * 2)
        .attr('y1', function(d){
          return -arima_y_scale(d.pct_change)
        })
        .attr('y2', function(d){
          return -arima_y_scale(d.pct_change)
        })
        .attr('stroke', (d) => d.beta > 0? C.BAR_COLOR["red"] : C.BAR_COLOR["green"])
        .attr('stroke-width', '1.5px')

        // Draw Arima Lines Up
        var arimaLines = this.arimaLines.selectAll('.arima-lines')
          .data(stock)

        //Bias Sapce
        arimaLines.enter()
        .append('line')
        .attr('x1', (d) => this.xScaleForAxis(d['date'], datesList))
        .attr('y1', 0)
        .attr('x2', (d) => this.xScaleForAxis(d['date'], datesList))
        .attr('y2', function(d){return -arima_y_scale(d.bia)})
        .attr('stroke', (d) => d.bia >= 0 ? "red" : "green")
        .attr('stroke-width', '10px')

        //Upper Line
        arimaLines.enter()
          .append('line')
        .attr('x1', (d) => this.xScaleForAxis(d['date'], datesList))
        .attr('y1', 
          //(d) => d.beta >= 0 ? -glyph_y_scale(Math.abs(d.beta)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia) : 
          //  glyph_y_scale(Math.abs(d.beta)) - C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia))
          (d) => -arima_y_scale((d.beta)) - arima_y_scale(d.bia))
        .attr('x2', (d) => this.xScaleForAxis(d['date'], datesList))
        .attr('y2', function(d){
          //var start_y = d.beta >= 0 ? -glyph_y_scale(Math.abs(d.beta)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia) : 
          //  glyph_y_scale(Math.abs(d.beta)) - C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia)
          var start_y = -arima_y_scale((d.beta)) - arima_y_scale(d.bia)
          var line_length = arima_y_scale((d.arima_res + d.high_limitation))
          return start_y - line_length
        })
        .style('stroke', (d) => d.beta > 0? C.BAR_COLOR["red"] : C.BAR_COLOR["green"])
        .attr('stroke-width', '1.5px')

        //Lower Line
        arimaLines.enter()
          .append('line')
        .attr('x1', (d) => this.xScaleForAxis(d['date'], datesList))
        .attr('y1', 
          //(d) => d.beta >= 0 ? -glyph_y_scale(Math.abs(d.beta)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia) : 
          //  glyph_y_scale(Math.abs(d.beta)) - C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia))
          (d) => -arima_y_scale((d.beta)) - arima_y_scale(d.bia))
        .attr('x2', (d) => this.xScaleForAxis(d['date'], datesList))
        .attr('y2', function(d){
          //var start_y = d.beta >= 0 ? -glyph_y_scale(Math.abs(d.beta)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia) : 
          //  glyph_y_scale(Math.abs(d.beta)) - C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia)
          var start_y = -arima_y_scale((d.beta)) - arima_y_scale(d.bia)
          var line_length = arima_y_scale((d.arima_res + d.low_limitation))
          return start_y - line_length
        })
        .style('stroke', (d) => d.beta > 0? C.BAR_COLOR["red"] : C.BAR_COLOR["green"])
        .attr('stroke-width', '1.5px')


        // // Draw Arima Lines
        // var arimaLines = this.arimaLines.selectAll('.arima-lines')
        //   .data(stock)

        // arimaLines.enter()
        // .append('line')
        // // .attr('x1', (d) => this.x_scale(this.parseTime(d.date)))
        // .attr('x1', (d) => this.xScaleForAxis(d['date'], datesList))
        // .attr('y1', 0)
        // // .attr('x2', (d) => this.x_scale(this.parseTime(d.date)))
        // .attr('x2', (d) => this.xScaleForAxis(d['date'], datesList))
        // .attr('y2', function(d){arima_y_scale(Math.abs(d.bia))
        //   //console.log(arima_y_scale(d.arima_res))
        //   //console.log((Math.abs(d.arima_res)))
        //   return -arima_y_scale(d.bia)})
        // .attr('stroke', (d) => d.bia >= 0 ? "red" : "green")
        //   .attr('stroke-width', '10px')

        // arimaLines.enter()
        //   .append('line')
        // // .attr('x1', (d) => this.x_scale(this.parseTime(d.date)))
        // .attr('x1', (d) => this.xScaleForAxis(d['date'], datesList))
        // .attr('y1', 
        //   (d) => d.pct_change >= 0 ? -glyph_y_scale(Math.abs(d.pct_change)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia) : 
        //     glyph_y_scale(Math.abs(d.pct_change)) - C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia))
        // // .attr('x2', (d) => this.x_scale(this.parseTime(d.date)))
        // .attr('x2', (d) => this.xScaleForAxis(d['date'], datesList))
        // .attr('y2', function(d){
        //   // var CI = d.pct_change >= 0 ? d.high_limitation : d.low_limitation
        //   // var posOrNeg = d.pct_change >= 0 ? 1 : -1
        //   // return posOrNeg * (-glyph_y_scale(Math.abs(d.pct_change)) + C.GLYPH_CENTER_TO_BAR) - arima_y_scale(CI - d.arima_res)

        //   // var CI = d.pct_change >= 0 ? d.high_limitation : d.low_limitation
        //   // return -arima_y_scale(CI)

        //   var start_y = d.pct_change >= 0 ? -glyph_y_scale(Math.abs(d.pct_change)) + C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia) : 
        //     glyph_y_scale(Math.abs(d.pct_change)) - C.GLYPH_CENTER_TO_BAR - arima_y_scale(d.bia)
        //   var g_height = arima_y_scale(d.g_height)
        //   return start_y - g_height
        // })
        // //.attr('stroke', (d) => d.pct_change >= 0 ? "orange" : "orange")
        // .attr('stroke', "#FFD300")
        // .attr('stroke-width', '4px')


    },

    xScaleForAxis(singleDate, datesList){
      var index = datesList.indexOf(singleDate)
      var length = datesList.length
      var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      };
      var root_div = d3.select(this.$el);
      var bounding_rect = root_div.node().getBoundingClientRect();
      var width = bounding_rect.width - margin.left - margin.right;

      var leftEnd = X_OFFSET
      var rightEnd = width - 50

      return (index + 0.5) / length * (width - 50 - X_OFFSET) + X_OFFSET
    },

    setAnchor(data) {
      //console.log( "data" )
      //console.log(data)
      //console.log( "data" )
      var anchors = data.anchors;
      var date = data.date;
      var sign = data.sign;
      this.anchors[date]["anchors"][sign] = anchors;
    },
    vectorAdd(v1, v2) {
      var v = v1.slice;
      for (var i = 0; i < v1.length; i ++) {
        v[i] = v[i] + v2[i]
      }
      return v
    },
    drawFactorConnection() {
      this.clearConnectFactor();
      this.connectFactor(this.selected_factors_for_stocks);
    },
    addOneFactorConnection(name) {
      var factors = [];
      for (var i = 0; i < this.selected_factors_for_stocks.length; i ++) {
        factors.push(this.selected_factors_for_stocks[i]);
      }
      factors.push(name)
      this.clearConnectFactor();
      this.connectFactor(factors);
    },
    // Used to connect factors at different dates and show their changes
    connectFactor(names) {
      var lines_data = []

      for (var i = 0; i < names.length; i ++) {
        var name = names[i];
        var points = [];
        this.dates.forEach(d => {
          var offsets = this.anchors[d].offset;
          var anchors = this.anchors[d].anchors;

          // for (var i = 0; i < this.datapointKeys.length; i++) {
          //   var k = this.datapointKeys[i];
          //   var tops = anchors[k];
          //   var offset = offsets[k]
          //   var flag = false;
          //   for (var j = 0; j < tops.length; j++) {
          //     var factor = tops[j];
          //     if (factor.name.localeCompare(name) === 0) {
          //       points.push([offset.sx+factor.center[0], offset.sy+factor.center[1]]);
          //       flag = true;
          //       break;
          //     }
          //   }
          //   if (flag) {break;}
          //   // If no factor in tops of this date, add a default position
          //   if (i === this.datapointKeys.length-1) {
          //     points.push([offset.sx, 0])
          //   }
          // 8

          // for (var i = 0; i < this.datapointKeys.length; i++) {
          //   var k = this.datapointKeys[i];
          var tops;
          //console.log("anchors")
          //console.log(anchors)
          for (var key in anchors){
            tops = anchors[key];
          }
          var offset = offsets;
          var flag = false;
          for (var j = 0; j < tops.length; j++) {
            var factor = tops[j];
            if (factor.name.localeCompare(name) === 0) {
              points.push([offset.sx+factor.center[0], offset.sy+factor.center[1]]);
              flag = true;
              break;
            }
          }
          // If no factor in tops of this date, add a default position
          if (!flag) {
            points.push([offset.sx, 0])
          }
        })
        lines_data.push(points)
      }

      var lines = this.lines.selectAll(".line")
        .data(lines_data)
      lines.enter()
        .append("path")
        .classed("line", true)
        .merge(lines)
          .attr("d", d3.line()
                       .curve(d3.curveMonotoneX)
                       .x(function(d) { return d[0]; })
                       .y(function(d) { return d[1]; })
          )
          .attr("stroke", "red")
          .attr("stroke-width", "1.5")
          .attr("fill", "none");
    },
    clearConnectFactor() {
      var lines = this.lines.selectAll(".line")
        .data([]);
      lines.exit()
        .remove();
    },
    // To draw the lines of close and predicted_close
    drawCloseLine() {
      var closeLine = d3.line()
        .x(d => this.x_scale(this.parseTime(d[0])))
        .y(d => this.yScale(d[1]))

      // array of arraies of poiints, draw price line for each month separatly.
      var close_data = [];
      var predicted_close_data = [];
      this.data.forEach(d => {
        // close_data = close_data.concat(this.object2Array(d.close))
        // predicted_close_data = predicted_close_data.concat(this.object2Array(d.predicted_close))
        var close_this_month = this.object2Array(d.close);
        var predicted_close_this_month = this.object2Array(d.predicted_close);
        var starting_value = close_this_month[0][1];
        close_data.push(close_this_month.map(d => {
          d[1] = (d[1] - starting_value)/starting_value;
          return d;
        }))
        predicted_close_data.push(predicted_close_this_month.map(d => {
          d[1] = (d[1] - starting_value)/starting_value;
          return d;
        }))
      });

      var close_true_line = this.close_true.selectAll("path")

      close_true_line.data(close_data)
        .enter()
          .append("path")
        .merge(close_true_line)
          .attr("class", "line")
          .attr("d", closeLine)
          .attr("stroke", "red")
          .attr("stroke-width", "1")
          .attr("fill", "none");

      var close_predicted_line = this.close_predicted.selectAll("path")

      close_predicted_line.data(predicted_close_data)
        .enter()
          .append("path")
        .merge(close_predicted_line)
          .attr("class", "line")
          .attr("d", closeLine)
          .attr("stroke", "blue")
          .attr("stroke-width", "1")
          .attr("fill", "none");
    }
  }
}

</script>
