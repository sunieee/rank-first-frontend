draw_streamgraph(cycle_selection) {
    var root_div = d3v1.select(this.$el);
    var bounding_rect = root_div.node().getBoundingClientRect()
    var margin = { top: 25, right: 0, bottom: 25, left: 10 }
    var width = bounding_rect.width - margin.left - margin.right
    var height = bounding_rect.height - margin.top - margin.bottom - C.FRAME_HEADER_HEIGHT

    var
        legends = [
            "transaction_friction_factor",
            "momentum_factor",
            "value_factor",
            "growth_factor",
            "profit_factor",
            "financial_liquidity_factor",
        ],
        legend_shorten = {
            "transaction_friction_factor": "Transaction",
            "momentum_factor": "Momentum",
            "value_factor": "Value",
            "growth_factor": "Growth",
            "profit_factor": "Profit",
            "financial_liquidity_factor": "Liquidity",
        },
        legends_width = bounding_rect.width / 12,
        legends_fond_size = legends_width / 7;

    var colors = d3v1.scaleOrdinal()
        .domain(Object.keys(legend_shorten))
        .range(C.FACTOR_TYPE_COLORMAP);

    d3v1.select(this.$el)
        .select(".draw-area")
        .select("svg")
        .remove();

    var root_svg = d3v1
        .select(this.$el)
        .select(".draw-area")
        .append("svg")
        // .attr("width", width + margin.left + margin.right + legends_width)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // #### Linear Gradient
    var paddings = [
        0, width / 5.9, width / 5.9, width / 6.3, width / 6.4, width / 6.6,
    ];

    var legend = root_svg.append("g")
        .selectAll(".legend")
        .data(legends)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + (margin.left + width / 25 + i * paddings[i]) + "," + legends_fond_size + ")" });

    legend.append('defs').append('linearGradient')
        .attr('id', (d) => {
            return 'legend_' + d;
        });

    for (let i = 0; i < legends.length; i++) {
        let gradient = legend.select("#legend_" + legends[i]);
        gradient.append('stop')
            .style('stop-color', C.FACTOR_TYPE_COLORMAP[i])
            .attr('offset', '0');
        gradient.append('stop')
            .style('stop-color', C.FACTOR_TYPE_COLORMAP_MIN_OPACITY[i])
            .attr('offset', '1');;
    }
    legend.append('rect')
        .style("fill", (d) => {
            return "url(#" + 'legend_' + d + ")"
        })
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', legends_width)
        .attr('height', legends_fond_size);

    legend.append('text')
        .attr("x", (d, i) => {
            return legends_width * 1.05;
        })
        .attr("y", legends_fond_size)
        .text(function(d, i) {
            return legend_shorten[d];
        })
        .attr("class", "textselected")
        .style("text-anchor", "start")
        .style("font-size", 1.1 * legends_fond_size);

    // ****

    let data = null
    if (cycle_selection == "real_time") {
        data = this.rt_streamgraph_data
    } else {
        data = this.ac_streamgraph_data
    }

    var svg = root_svg
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + (margin.top + legends_fond_size) + ")");

    // var keys = ["financial_liquidity_factor_negative",
    //             "growth_factor_negative",
    //             "momentum_factor_negative",
    //             "profit_factor_negative",
    //             "transaction_friction_factor_negative",
    //             "value_factor_negative",
    //             "value_factor_positive",
    //             "transaction_friction_factor_positive",
    //             "profit_factor_positive",
    //             "momentum_factor_positive",
    //             "growth_factor_positive",
    //             "financial_liquidity_factor_positive"]

    var keys = [
        "transaction_friction_factor_negative",
        "momentum_factor_negative",
        "value_factor_negative",
        "growth_factor_negative",
        "profit_factor_negative",
        "financial_liquidity_factor_negative",
        "financial_liquidity_factor_positive",
        "profit_factor_positive",
        "growth_factor_positive",
        "value_factor_positive",
        "momentum_factor_positive",
        "transaction_friction_factor_positive",
    ]

    // Add X axis
    var parse = d3v3.time.format("%Y-%m-%d").parse;

    var dates_set = new Set();
    for (let item in data) {
        dates_set.add(data[item].date)
    }
    dates_set = [...dates_set];
    dates_set.sort();

    var x = d3v3.scale
        .ordinal()
        .domain(dates_set.map(function(d) {
            return parse(d);
        }))
        .rangeRoundBands([60, width + 20]);

    // For Overview xAxis Display
    var dates_dict = {}
    var month_dict = {
        "1": "Jan",
        "2": "Feb",
        "3": "Mar",
        "4": "Apr",
        "5": "May",
        "6": "Jun",
        "7": "Jul",
        "8": "Aug",
        "9": "Sep",
        "10": "Oct",
        "11": "Nov",
        "12": "Dec",
    }
    var pre_year, pre_month, pre_week = 0,
        pre_day = 0
    var tmp_year, tmp_month, tmp_day
    for (var dt of dates_set) {
        var tmp_date = parse(dt)
        tmp_year = tmp_date.getFullYear()
        tmp_month = tmp_date.getMonth()
        tmp_day = tmp_date.getDay()
        if (pre_year != tmp_year) {
            pre_year = tmp_year
            pre_month = tmp_month
            pre_day = tmp_day
            dates_dict[tmp_date] = pre_year
            pre_week = 1
        } else if (pre_month != tmp_month) {
            pre_month = tmp_month
            pre_day = tmp_day
            dates_dict[tmp_date] = month_dict[pre_month + 1]
            pre_week = 1
        } else if (tmp_day <= pre_day) {
            pre_week += 1
            pre_day = tmp_day
            dates_dict[tmp_date] = pre_week
        } else {
            pre_day = tmp_day
            dates_dict[tmp_date] = ""
        }
    }

    // var x = d3v1.scaleLinear()
    //   .domain(d3v1.extent(data, function(d) { return d.date;  }))
    //   .range([ 0, width  ]);
    svg.append("g")
        .attr("transform", "translate(0," + height * 0.95 + ")")
        //.call(d3v1.axisBottom(x).tickSize(-height*.7).tickValues([1900, 1925, 1975, 2000]))
        .call(d3v1.axisBottom(x).tickSize(-height * 0.9)
            .tickFormat((d) => {
                return dates_dict[d]
            }))
        .select(".domain").remove()
        // Customization
    svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

    // // Add X axis label:
    // svg.append("text")
    //     .attr("text-anchor", "end")
    //     .attr("x", width - 90)
    //     .attr("y", height - 20 )
    //     .text("Time (year)");

    // Add Y axis
    var pos_keys = ["value_factor_positive",
        "transaction_friction_factor_positive",
        "profit_factor_positive",
        "momentum_factor_positive",
        "growth_factor_positive",
        "financial_liquidity_factor_positive"
    ]
    var neg_keys = ["financial_liquidity_factor_negative",
        "growth_factor_negative",
        "momentum_factor_negative",
        "profit_factor_negative",
        "transaction_friction_factor_negative",
        "value_factor_negative"
    ]
    var pos_max = 0
    var neg_max = 0

    for (let item in data) {
        var temp_pos = 0
        var temp_neg = 0
        for (let key in data[item]) {
            if (pos_keys.indexOf(key) != -1) {
                temp_pos += data[item][key]
            } else if (neg_keys.indexOf(key) != -1) {
                temp_neg += data[item][key]
            }
        }
        pos_max = Math.max(pos_max, temp_pos)
        neg_max = Math.max(neg_max, temp_neg)
    }

    // Pos Y Tip
    var PosTooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", 30)
        .style("opacity", 1)
        .style("font-size", 17)
    PosTooltip.text((pos_max).toFixed(2) + "%")

    // Neg Y Tip
    var NegTooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", height - 20)
        .style("opacity", 1)
        .style("font-size", 17)
    NegTooltip.text(-(neg_max).toFixed(2) + "%")

    var y = d3v1.scaleLinear()
        .domain([-neg_max, pos_max])
        .range([height * 0.9, height * 0.05]);

    // color palette
    var color_list = ["#996699", "#3690c0", "#509766", "#EEAD0E", "#84a7b2", "#CD6600",
        "#CD6600", "#84a7b2", "#EEAD0E", "#509766", "#3690c0", "996699"
    ]
    var color = d3v1.scaleOrdinal()
        .domain(keys)
        .range(C.FACTOR_TYPE_COLORMAP_STREAMGRAPH);

    //stack the data?
    var stackedData = d3v1.stack()
        .offset(d3v1.stackOffsetSilhouette)
        .keys(keys)
        (data)

    // create a tooltip
    var Tooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", 10)
        .style("opacity", 0)
        .style("font-size", 17)

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        Tooltip.style("opacity", 1)
        d3v1.selectAll(".myArea").style("opacity", .2)
        d3v1.select(this)
            .style("stroke", "black")
            .style("opacity", 1)

    }
    var mousemove = function(d, i) {
        var grp = keys[i]
        Tooltip.text(grp)
    }
    var mouseleave = function(d) {
        Tooltip.style("opacity", 0)
        d3v1.selectAll(".myArea").style("opacity", 1).style("stroke", "none")

    }

    // Area generator
    var area = d3v1.area()
        .x(function(d) { return x(parse(d.data.date)); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
        .curve(d3v1.curveMonotoneX);

    // Show the areas
    svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        // })
},