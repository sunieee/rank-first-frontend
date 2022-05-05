<template>
  <div class="draw-area">
      <svg></svg>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import * as d3 from 'd3'
import C from './constants.js'


export default {
  name: 'FluctuationLine',
  props: {
    input_data: {
      type: Object,
    }
  },
  computed: {
    ...mapState(['start_date','end_date', 'selected_factors', 'selected_stocks']),
  },
  watch: {
  },
  data() {
    return {
    }
  },
  mounted() {
    this.$nextTick(function foo() {
      this.drawStockView();
    })
  },
  methods: {
    drawStockView(){
            // bia start
            var d3 = d3v3;
            d3.select(this.$el)
                .select(".draw-area")
                .select("svg")
                .remove();

            var root_svg = d3
                .select(this.$el)
                .select(".draw-area")
                .append("svg")
                .attr("width", 200)
                .attr("height", 300)
                ;

            var svg = root_svg.append("g")
                .attr("transform", "translate(" + 20 + "," + (20 + 10) + ")");

            var yScale = d3.scale.linear().domain([20, -20]).range([0, 20]);
            var yAxis = d3.svg
                .axis()
                .scale(yScale)
                .orient("right");

            svg
              .append("g")
              .attr("class", "axis_new")
              .call(yAxis);

            var xScale = d3.scale.linear().domain([1, 12]).range([60, 200 - 60]);

            var dataBias = [[1, 0.1132], [2, -0.3458], [3, 0.7160], [4, 12.2340], [5, 5.8092], [6,-2.9967], [7, -2.8498], [8, 10.4163], [9, -19.8916], [10, 0.1530], [11, 10.5374], [12,-3.7550]];

            var genLine = d3.svg.line()
              .x(function(d){
                return xScale(d[0])
              })
              .y(function(d){
                return yScale(d[1])
              });

            svg
              .append("path")
              .attr('class', 'line')
              .attr('d', genLine(dataBias))
              .attr('stroke', 'blue')
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', '10')
              .attr('fill', 'none');
            //bias end
    }
  }
}

</script>
