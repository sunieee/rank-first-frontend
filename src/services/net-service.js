import axios from 'axios';

const GET_REQUEST = 'get';
const POST_REQUEST = 'post';
const dev_api_url = 'http://152.136.185.123:9200/api';

function request(url, params, type, callback) {
    let func;
    if (type === GET_REQUEST) {
        func = axios.get;
    } else if (type === POST_REQUEST) {
        func = axios.post;
    }
    func(url, params).then((res) => {
        if (res.status === 200) {
            // console.log(res);
            callback(res);
        } else {
            callback(null);
        }
    }).catch((err) => {
        callback(null, err);
    })
}

function all_securities(callback) {
    const url = `${dev_api_url}/all_securities`;
    const params = {};
    request(url, params, GET_REQUEST, callback);
}

function all_industries(callback) {
    const url = `${dev_api_url}/all_industries`;
    const params = {};
    request(url, params, GET_REQUEST, callback);
}

function get_stock_info(code_or_name, callback) {
    const url = `${dev_api_url}/stock_info/${code_or_name}`;
    const params = {};
    request(url, params, GET_REQUEST, callback);
}

// 推荐股票 ghj
function get_recommend_stocks(start_date, end_date, selected_factors, callback) {
    const url = `${dev_api_url}/get_recommend_stocks`;
    const params = { "start_date": start_date, "end_date": end_date, "selected_factors": selected_factors };
    return request(url, params, POST_REQUEST, callback);
}

// 根据 industry 获取所有股票的信息
function get_stocks_info(industry, callback) {
    const url = `${dev_api_url}/industry/${industry}`;
    const params = {};
    request(url, params, GET_REQUEST, callback);
}

function get_prediction_data(start_date, end_date, time_interval, kwargs, callback) {
    const url = `${dev_api_url}/get_prediction_data`;
    const params = { "start_date": start_date, "end_date": end_date, "time_interval": time_interval, "kwargs": kwargs };
    // request(url, {params: params}, GET_REQUEST, callback);
    request(url, params, POST_REQUEST, callback);
}

function get_factor_view(start_date, end_date, callback) {
    const url = `${dev_api_url}/get_prediction_data`;
    const params = { "start_date": start_date, "end_date": end_date, "kwargs": kwargs };
    // request(url, {params: params}, GET_REQUEST, callback);
    request(url, params, POST_REQUEST, callback);
}

function get_bunch_single_backtest(start_date, end_date, kwargs, callback) {
    const url = `${dev_api_url}/get_bunch_single_backtest`;
    const params = { "start_date": start_date, "end_date": end_date, "kwargs": kwargs };
    // request(url, {params: params}, GET_REQUEST, callback);
    request(url, params, POST_REQUEST, callback);
}

function get_backtest(start_date, end_date, kwargs, callback) {
    const url = `${dev_api_url}/get_backtest`;
    const params = { "start_date": start_date, "end_date": end_date, "kwargs": kwargs };
    // request(url, {params:params}, GET_REQUEST, callback);
    request(url, params, POST_REQUEST, callback);
}

// ghj_stockReturn
function get_stocks_return(start_date, end_date, kwargs, callback) {
    const url = `${dev_api_url}/get_stocks_return`;
    const params = { "start_date": start_date, "end_date": end_date, "kwargs": kwargs };
    request(url, params, POST_REQUEST, callback);
}

export default {
    all_industries,
    all_securities,
    get_stock_info,
    get_stocks_info,
    get_prediction_data,
    get_bunch_single_backtest,
    get_backtest,
    get_recommend_stocks,
    get_stocks_return,
}