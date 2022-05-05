var tmp_max = {
    "1": [0],
    "-1": [0]
}
var tmp_sum = {
    "1": [],
    "-1": []
}

Object.values(data_dict).forEach(m => {
    var index = {
        "1": 1,
        "-1": 1
    }
    m.forEach(d => {
        let s = String(d.s)
        if (index[s] >= tmp_max[s].length) {
            tmp_max[s].push(d.y)
        } else {
            tmp_max[s][index[s]] = Math.max(d.y, tmp_max[s][index[s]])
        }
        index[s] += 1
    })
})

for (let t in tmp_max) {
    var sum_max = 0
    tmp_max[t].forEach(k => {
        sum_max += k
        tmp_sum[t].push(sum_max)
    })
}

Object.values(data_dict).forEach(m => {
    var index = {
        "1": 0,
        "-1": 0
    }
    m.forEach(d => {
        let s = String(d.s)
        let sum = tmp_sum[s]
        d.y0 = sum[index[s]] * height_for_positive_circles / sum[sum.length - 1]
        d.y = d.y * height_for_positive_circles / sum[sum.length - 1]
        index[s] += 1
        d.y0 = d.y0 + (tmp_max[s][index[s]] - d.y) / 2
    })
})