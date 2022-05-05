<template>
  <g></g>
</template>

<script>
import { mapState } from 'vuex';
import * as d3Base from 'd3'
import {voronoiMapSimulation} from 'd3-voronoi-map'
import C from './constants.js'

const d3 = Object.assign(d3Base, {voronoiMapSimulation})

export default {
  name: 'VoronoiMap',
  data() {
    return {
      sector_keys: ["selected_sum", "unselected_sum"],
      gap_size: 2,
      anchors: [],
    }
  },
  props: {
    svg_width: {
      type: Number,
      default: 0
    },
    datapoint: {
      type: Object,
      default: {}
    },
    date: {
      type: String
    },
    sign: {
      type: String
    },
    inner_circle_r: {
      type: Number,
      default: 0,
    },
    pos_or_neg: {
      type: Number,
      default: 1
    }
  },
  computed: {
    ...mapState(['selected_factors_for_stocks']),
    max_sector_size: function () {
      return (this.svg_width) / 2;
    }
  },
  mounted() {
    this.$nextTick(function foo() {
      this.initLayout();
      this.drawCircle(this.datapoint);
    });
  },
  methods: {
    initLayout() {
      var svg_width = this.svg_width;
      var svg_height = this.svg_width;

      this.svg = d3.select(this.$el)
        .attr("width", svg_width)
        .attr("height", svg_height);

      //this.fillScale = d3.scaleOrdinal()
      //  .domain(["A", "B", "C", "D", "E", "F"])
      //  // .range(["#CD6600", "#0047B6", "#84a7b2","#3690c0", "#EEAD0E", "#996699"]);
      //  .range(C.FACTOR_TYPE_COLORMAP)

      this.fillScale = d3.scaleOrdinal()
        .domain([0, 5])
        .range(C.FACTOR_TYPE_COLORMAP)

      this.container = this.svg.append("g")
        .classed("container", true);
        // .attr("transform", "translate("+[svg_width/2, svg_height/2]+")");

      // this.container.append("g")
      //   .classed('cells', true);
    },
    // Entry point to draw a complete circle with six sectors
    drawCircle(datapoint) {
      var sectors_info = datapoint
      console.log("+++++++++++++")
      console.log("datapoint", datapoint)
      console.log("section_info", sectors_info["selected_factors"])
      console.log("+++++++++++++")
      var sum_size = sectors_info['sum']
      var sizes = [0.1,3,1,1,1,1]
      var max_size = Math.max(...sizes);
      var sector_size_scaler =  d3.scaleSqrt()
        .domain([0, max_size])
        .range([this.inner_circle_r, this.inner_circle_r + this.max_sector_size])

      // Draw Sector
      var sum = sectors_info['selected_sum'] + sectors_info['unselected_sum']
      var proportion = 0
      var i = 0
      for (let factor in sectors_info["selected_factors"]){
        var outer_r = this.inner_circle_r
        var inner_r = 0
        var start_ang = proportion * 2 * Math.PI
        proportion += sectors_info["selected_factors"][factor] / sum
        var end_ang = proportion * 2 * Math.PI
        this.drawSector(sectors_info["selected_factors"], inner_r, outer_r, start_ang, end_ang, factor, i);
        i += 1
      }

      // console.log("selected_factors_for_stocks", this.selected_factors_for_stocks)

      // Draw Unselected Factors
      var i = -1
      {
        var outer_r = this.inner_circle_r
        var inner_r = 0
        var start_ang = proportion * 2 * Math.PI
        var end_ang = 2 * Math.PI
        this.drawSector(sectors_info, inner_r, outer_r, start_ang, end_ang, "unselected_sum", i);
      }
      // this.sector_keys.forEach((k, i) => {
      //   var size = 0;
      //   size = Math.abs(sectors_info[k])
      //   var outer_r = this.inner_circle_r
      //   var inner_r = 0
      //   // var outer_r = sector_size_scaler(size * 0.5);
      //   // var inner_r = sector_size_scaler(size * 0.01);
      //   this.drawSector(sectors_info, inner_r, outer_r, proportion, k, i);
      // })

      // draw the circle representing the bias
      var bias_circle = this.container.selectAll("circle")
        .data([this.inner_circle_r])
        .enter()
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        //.attr("r", this.inner_circle_r)
        .attr("r", 0)
        .style('stroke', 'black')
        //.style('stroke', sectors_info.bias*this.pos_or_neg>0 ? 'black' : 'white')
        .style("fill", "white");

      // Update anchors after drawing all sectors
      // Notify FactorAxis a set of anchors have been computed
      this.$emit("AnchorsComputed", {
        anchors: this.anchors,
        date: this.date,
        sign: this.sign,
      })

    },
    shrinkTowardsCenterByLen(point, shrink_len) {
      var x = point[0];
      var y = point[1];
      var len = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      var ux = x / len;
      var uy = y / len;
      var nx = x - ux * shrink_len;
      var ny = y - uy * shrink_len;
      return [nx, ny]
    },

    // Draw a sector, including the triangle and the voronoi map
    drawSector(sector_info, inner_r, outer_r, start_ang, end_ang, key, i) {
      inner_r = 0

      // shift the sector a bit from the center
      // var sx = this.gap_size * Math.cos((start_ang+end_ang)/2);
      // var sy = this.gap_size * Math.sin((start_ang+end_ang)/2);
      var sx = 0;
      var sy = 0;

      var sector = this.container.append("g")
        .classed("sector", true)
        .attr("transform", "translate("+[sx, sy]+")");

      var triangle = sector.append("g")
        .classed("triangle", true)

      var cells = sector.append("g")
        .classed("cells", true)

      if (i === -1){
        var fill_color = d3.rgb("#D0D0D0")
      }
      else{
        var fill_color = d3.rgb(this.fillScale(i%6));
      }
        fill_color = d3.hsl(fill_color)
        fill_color.s *= 0.9

      var polygon = this.calculateRingSectorPolygon(
        start_ang, end_ang, inner_r, outer_r
      );

      var temp = cells.selectAll(".cell").data([polygon])
      this.drawClosedPath(temp, sector_info, cells, fill_color, key);

    },
    // start_ang and end_ang are in radian
    calculateRingSectorPolygon(start_ang, end_ang, inner_r, outer_r) {
      var increment = Math.PI/60;
      var polygon = [];

      // add the inner points
      // The polygon can only be convex, and thus the inner boundary cannot be an arc.
      if (inner_r === 0) {
        polygon.push([0,0]);
      }else {
        polygon.push([inner_r*Math.cos(start_ang), inner_r*Math.sin(start_ang)]);
        polygon.push([inner_r*Math.cos(end_ang), inner_r*Math.sin(end_ang)]);
      }

      // add the outer points
      for (var a=end_ang; a>=start_ang; a-=increment) {
        polygon.push(
          [outer_r*Math.cos(a), outer_r*Math.sin(a)]
        )
      }
      return polygon
    },
    // https://stackoverflow.com/questions/12062561/calculate-svg-path-centroid-with-d3-js
    getBoundingBoxCenter(selection) {
      // get the DOM element from a D3 selection
      // you could also use "this" inside .each()
      // var element = selection.node();
      var element = selection;
      // use the native SVG interface to get the bounding box
      var bbox = element.getBBox();
      // return the center of the bounding box
      return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
    },
    // Draw a closed path and some other events needed for top 5 factors
    drawClosedPath(cells, single_top, ele, fill_color, sector_category_key){
      var that = this;
      cells.enter()
        .append("path")
          .classed("cell", true)
        .merge(cells)
          .attr("d", function(d){return "M"+d.join(",")+"z"; })
          .style("fill", fill_color)
          .style("fill-opacity", "1")
          .style('stroke', "white")
          .style('stroke-width', '1px')
          .attr('pointer-events', 'all')
          .on("mouseover", function(d) {
            // d3.select(this).style("fill", d3.select(this).attr('stroke')).attr('opacity', 0.3);
            d3.select(this)
              // .style("fill-opacity", "0.8")
              .style("cursor", "pointer")
              .style("stroke", "red")
              .style("stroke-width", 2)
          })
          .on("mouseout", function(d) {
            // d3.select(this).style("fill", "none").attr('opacity', 1);
            d3.select(this)
              // .style("fill-opacity", "0.4")
              .style('stroke', "white")
              .style('stroke-width', '1px')
              .style("cursor", "default")
            that.$emit("LeaveFactor")
          })
          .each(function(d) {
            d3.select(this).append("title")
              .classed("tooltip", true)
              .text(() => sector_category_key + ":" + single_top[sector_category_key].toFixed(2) + "%");
          })

      // cells.enter()
      //   .append("path")
      //     .classed("cell", true)
      //   .merge(cells)
      //     .attr("d", function(d){return "M"+d.join(",")+"z"; })
      //     // .style("fill", fill_color)
      //     .style("fill", "white")
      //     // .style("fill-opacity", "0.4")
      //     .style('stroke', fill_color)
      //     .style('stroke-width', '2px')
      //     .attr('pointer-events', 'all')
      //     .on("mouseover", function(d) {
      //       // d3.select(this).style("fill", d3.select(this).attr('stroke')).attr('opacity', 0.3);
      //       d3.select(this)
      //         // .style("fill-opacity", "0.8")
      //         .style("cursor", "pointer")
      //         .style("stroke", "red")
      //         .style("stroke-width", 2)
      //     })
      //     .on("mouseout", function(d) {
      //       // d3.select(this).style("fill", "none").attr('opacity', 1);
      //       d3.select(this)
      //         // .style("fill-opacity", "0.4")
      //         // .style('stroke', "white")
      //         .style('stroke', fill_color)
      //         .style('stroke-width', '2px')
      //         .style("cursor", "default")
      //       that.$emit("LeaveFactor")
      //     })
      //     .each(function(d) {
      //       d3.select(this).append("title")
      //         .classed("tooltip", true)
      //         .text(() => sector_category_key + ":" + single_top[sector_category_key].toFixed(2) + "%");
      //     })
      

// TEMP
      // var that = this;
      // cells.enter()
      //   .append("path")
      //     .classed("cell", true)
      //   .merge(cells)
      //     .attr("d", function(d){ return "M"+d.join(",")+"z"; })
      //     .style("fill", fill_color)
      //     // .style("fill-opacity", "0.4")
      //     .style('stroke', "white")
      //     .style('stroke-width', '1px')
      //     .attr('pointer-events', 'all')
      //     .on("mouseover", function(d) {
      //       // d3.select(this).style("fill", d3.select(this).attr('stroke')).attr('opacity', 0.3);
      //       d3.select(this)
      //         // .style("fill-opacity", "0.8")
      //         .style("cursor", "pointer")
      //         .style("stroke", "red")
      //         .style("stroke-width", 2)

      //       console.log( "single_top" )
      //       console.log( single_top )
      //       that.$emit("HoverFactor", "unselected_sum")
      //       //if (single_top !== null) {
      //       //  for (var key in single_top){
      //       //    that.$emit("HoverFactor", key)
      //       //    // that.$emit("HoverFactor", single_top.top5[0].factor_name)
      //       //  }
      //       //} else {
      //       //  that.$emit("HoverFactor", d.site.originalObject.data.originalData.name)
      //       //}
      //     })
      //     .on("mouseout", function(d) {
      //       // d3.select(this).style("fill", "none").attr('opacity', 1);
      //       d3.select(this)
      //         // .style("fill-opacity", "0.4")
      //         .style('stroke', "white")
      //         .style('stroke-width', '1px')
      //         .style("cursor", "default")
      //       that.$emit("LeaveFactor")
      //     })
      //     .each(function(d) {
      //       var center = that.getBoundingBoxCenter(this);
      //       var this_name, this_weight, this_sum;
      //       if (single_top === null) {
      //         this_weight = d.site.originalObject.data.originalData.weight;
      //         this_name = d.site.originalObject.data.originalData.name.toString();
      //         this_sum = d.site.originalObject.data.originalData.size;
      //       } else {
      //         for (var key in single_top){
      //           this_weight = single_top[key];
      //           this_name = key.toString();
      //           this_sum = 1;
      //         }
      //         // this_weight = single_top.top5[0].ratio;
      //         // this_name = single_top.top5[0].factor_name.toString();
      //         // this_sum = single_top.size;
      //       }
      //       that.anchors.push({
      //         name: this_name,
      //         center: center
      //       });
      //       d3.select(this)
      //         .on("click", function(d) {
      //           console.log("this")
      //           console.log(that)

      //           let factor_name = this_name;
      //           let isin = false;
      //           for(let i=0;i<that.selected_factors_for_stocks.length;i++){
      //               if(that.selected_factors_for_stocks[i] === factor_name){
      //                   isin = true;
      //                   break;
      //               }
      //           }
      //           if(isin){
      //               that.$store.commit('rm_selected_factor_for_stocks', factor_name);
      //           }
      //           else{
      //               that.$store.commit('add_select_factor_for_stocks', factor_name);
      //           }
      //         })
      //       d3.select(this).append("title")
      //         .classed("tooltip", true)
      //         // .text(() => this_name+" ("+ that.complete_type[sector_category_key]+"):" + (this_weight * this_sum).toFixed(2) + "%");
      //         .text(() => this_name+" ("+ that.complete_type[sector_category_key]+"):" + (this_weight).toFixed(2) + "%");
      //     })


    },
  }
}
</script>
