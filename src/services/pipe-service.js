import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        width: 0,
        height: 0,
        stock_list: [],
        start_date: undefined,
        end_date: undefined,

        data_overview: undefined,
        data_individuals: undefined,
        data_aggragate: undefined,
        rt_streamgraph_data: undefined,
        ac_streamgraph_data: undefined,

        selected_factors:[],
        selected_factors_for_stocks:[],
        data_bunch_backtest: undefined,
        selected_stocks:[],
        data_backtest:[],
    },
    mutations: {
        width(state, width){
            state.width = width;
        },
        height(state, height){
            state.height = height;
        },
        start_date(state, start_date){
            state.start_date = start_date;
        },
        end_date(state, end_date){
            state.end_date = end_date;
        },


        // control panel
        append_stock(state, stock) {
            // deduplicate
            var duplicated = false;
            // console.log('stock: ', stock);
            for (let i = 0; i < state.stock_list.length; i++) {
                let a = state.stock_list[i].ts_code;
                let b = stock.ts_code;
                if (a === b) {
                    duplicated = true;
                    console.log('break');
                    break;
                }
            }
            if (!duplicated) {
                // state.stock_list.unshift(stock);
                state.stock_list.push(stock);
            }
            // console.log('stock_list: ', state.stock_list);
        },

        drop_stock(state, ts_code) {
            // console.log('[before drop] stock: ', ts_code);
            let res = -1;
            for(let i=0;i<state.stock_list.length;i++){
                let stock = state.stock_list[i];
                if(stock.ts_code === ts_code){
                res = i;
                break;
                }
            }
            if (res >= 0) {
                state.stock_list.splice(res, 1);
            }
            // console.log('[after drop] stock: ', ts_code);
        },

        clear_stocks(state) {
            state.stock_list.splice(0,state.stock_list.length)
        },

        add_select_factor(state, factor_name){
            let duplicated = false;
            for (let i = 0; i < state.selected_factors.length; i++) {
                if (state.selected_factors[i] === factor_name) {
                    duplicated = true;
                    break;
                }
            }
            if (!duplicated) {
                state.selected_factors.unshift(factor_name);
            }
        },
        rm_selected_factor(state, factor_name){
            let res = -1;
            for(let i=0;i<state.selected_factors.length;i++){
                if (state.selected_factors[i] === factor_name) {
                    res = i;
                    break;
                }
            }
            if (res >= 0) {
                state.selected_factors.splice(res, 1);
            }
        },
        reset_selected_factors(state){
            state.selected_factors = [];
        },
        
        add_all_factors(state,factor_list){
            state.selected_factors = factor_list;
        },

        add_select_factor_for_stocks(state, factor_name){
            let duplicated = false;
            for (let i = 0; i < state.selected_factors_for_stocks.length; i++) {
                if (state.selected_factors_for_stocks[i] === factor_name) {
                    duplicated = true;
                    break;
                }
            }
            if (!duplicated) {
                state.selected_factors_for_stocks.unshift(factor_name);
            }
            console.log("pip_selected_factors_for_stocks", selected_factors_for_stocks)
        },
        rm_selected_factor_for_stocks(state, factor_name){
            let res = -1;
            for(let i=0;i<state.selected_factors_for_stocks.length;i++){
                if (state.selected_factors_for_stocks[i] === factor_name) {
                    res = i;
                    break;
                }
            }
            if (res >= 0) {
                state.selected_factors_for_stocks.splice(res, 1);
            }
        },
        reset_selected_factors_for_stocks(state){
            state.selected_factors_for_stocks = [];
        },

        add_select_stock(state, ts_code){
            let duplicated = false;
            for (let i = 0; i < state.selected_stocks.length; i++) {
                if (state.selected_stocks[i] === ts_code) {
                    duplicated = true;
                    break;
                }
            }
            if (!duplicated) {
                state.selected_stocks.unshift(ts_code);
            }
        },
        rm_selected_stock(state, ts_code){
            let res = -1;
            for(let i=0;i<state.selected_stocks.length;i++){
                if (state.selected_stocks[i] === ts_code) {
                    res = i;
                    break;
                }
            }
            if (res >= 0) {
                state.selected_stocks.splice(res, 1);
            }
        },
        reset_selected_stocks(state){
            state.selected_stocks = [];
        },

        draw_overview(state, overview_data){
            state.data_overview = [];
            for(let dt in overview_data){
                state.data_overview.push(overview_data[dt]);
            }
        },

        draw_rt_streamgraph(state, rt_streamgraph_data){
          state.rt_streamgraph_data = [];
          for(let dt in rt_streamgraph_data){
            state.rt_streamgraph_data.push(rt_streamgraph_data[dt]);
          }
        },

        draw_ac_streamgraph(state, ac_streamgraph_data){
          state.ac_streamgraph_data = [];
          for(let dt in ac_streamgraph_data){
            state.ac_streamgraph_data.push(ac_streamgraph_data[dt]);
          }
        },

        draw_aggragate(state, aggragate_data){
            state.data_aggragate = aggragate_data;
        },

        draw_individuals(state, individuals_data){
            state.data_individuals = individuals_data;
        },

        draw_bunch_backtest(state, bunch_backtest_data){
            state.data_bunch_backtest = bunch_backtest_data;
        },

        draw_backtest(state, backtest_data){
            state.data_backtest.push(backtest_data);
        },

        reset_bunch_backtest(state){
            state.data_bunch_backtest = undefined;
        },

        reset_backtest(state){
            state.data_backtest = [];
        }
    }
});

export default store;
