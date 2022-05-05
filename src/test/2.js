var tmp_pos_max = [0];
var tmp_neg_max = [0];
var tmp_pos_sum = [];
var tmp_neg_sum = [];

Object.values(data_dict).forEach(m => {
    var pos_i = 1
    var neg_i = 1
    m.forEach(function(d) {
        if (d.s === 1) {
            if (pos_i >= tmp_pos_max.length) {
                tmp_pos_max.push(d.y)
            } else {
                tmp_pos_max[pos_i] = Math.max(d.y, tmp_pos_max[pos_i])
            }
            pos_i += 1
        } else if (d.s === -1) {
            if (neg_i >= tmp_neg_max.length) {
                tmp_neg_max.push(d.y)
            } else {
                tmp_neg_max[neg_i] = Math.max(d.y, tmp_neg_max[neg_i])
            }
            neg_i += 1
        }
    })
})

var sum_max = 0
for (var i = 0; i < tmp_pos_max.length; i++) {
    sum_max += tmp_pos_max[i]
    tmp_pos_sum.push(sum_max)
}

var sum_max = 0
for (var i = 0; i < tmp_neg_max.length; i++) {
    sum_max += tmp_neg_max[i]
    tmp_neg_sum.push(sum_max)
}


Object.values(data_dict).forEach(m => {
    var pos_i = 0
    var neg_i = 0
    m.forEach(function(d) {
        if (d.s === 1) {
            d.y0 = tmp_pos_sum[pos_i] * height_for_positive_circles / tmp_pos_sum[tmp_pos_sum.length - 1]
            d.y = d.y * height_for_positive_circles / tmp_pos_sum[tmp_pos_sum.length - 1]
            pos_i += 1
            d.y0 = d.y0 + (tmp_pos_max[pos_i] - d.y) / 2
        } else {
            d.y0 = tmp_neg_sum[neg_i] * height_for_negative_circles / tmp_neg_sum[tmp_neg_sum.length - 1]
            d.y = d.y * height_for_negative_circles / tmp_neg_sum[tmp_neg_sum.length - 1]
            neg_i += 1
            d.y0 = d.y0 + (tmp_neg_max[neg_i] - d.y) / 2
        }
    })
})