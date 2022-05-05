<template>
    <div id="app">
        <nav-bar></nav-bar>
        <div
            class="row"
            :style="{width: setting.width + 'px', height: setting.height + 'px', 'margin-top': setting.navbar_height + 'px'}" style="margin: auto; margin-top: 3px; margin-left: 0px; background-color:#B6B4B5"
        >
            <div class="col-2" style="background-color:#404040;">
              <control-panel style="margin-left: 5px; padding-left: 5px; width:100%; text-align:left;"></control-panel>
            </div>
            <div class="col-10">
                <div class="row">
                    <overview :style="{height: (setting.height) * 0.41 + 'px'}" style="width:100%; margin-top: 0px; background:white"></overview>
                </div>
                <div class="row">
                    <div class="col-8" style="padding:0; border-right-style: solid; border-color:#eeeeee">
                        <multi-axes :style="{height: (setting.height) * 0.59 + 'px'}" style="width:100%; margin-top: 0px; overflow:auto; background-color:white"></multi-axes>
                    </div>
                    <div class="col-4" style="padding:0">
                        <multi-lines :style="{height: (setting.height) * 0.34 + 'px'}" style="width:100%; margin-top: 0px; background-color:white"></multi-lines>
                        <backtest :style="{height: (setting.height) * 0.25  + 'px'}" style="width:100%; margin-top: 0px; background-color:white"></backtest>
                    </div>
                </div>
            </div>

            <!-- <div class="col-2" style="border-right: 1px solid rgba(0, 0, 0, 0.1); background:white">
              <control-panel style="margin-left: 5px; padding-left: 5px; width:100%; text-align:left;"></control-panel>
            </div> -->
            
        </div>
        <!-- <router-view/> -->
    </div>
</template>

<script>
    import 'keen-ui/dist/keen-ui.min.css';
    import 'bootstrap/dist/css/bootstrap.min.css';
    import NavBar from '@/components/NavBar';
    import ControlPanel from '@/components/ControlPanel';
    import Overview from '@/components/Overview';
    import Backtest from '@/components/Backtest';
    import MultiAxes from "@/components/MultiAxes";
    import FactorAggragate from "@/components/FactorAggragate";
    import MultiLines from "@/components/MultiLines";

    export default {
        name: "App",
        components: {
            NavBar,
            ControlPanel,
            Overview,
            Backtest,
            MultiAxes,
            FactorAggragate,
            MultiLines
        },
        data() {
            return {
                setting: {
                    width: 0,
                    height: 0,
                    navbar_height: 0,
                }
            };
        },
        mounted() {
            this.$nextTick(function foo() {
                this.initialize();
            });
        },
        methods: {
            initialize() {
                this.resize();
                window.addEventListener("resize", () => {
                    this.resize();
                });
            },

            resize(){
                this.setting.navbar_height = document.querySelector(".navbar").clientHeight;
                this.setting.height =
                    window.innerHeight -
                    document.querySelector(".navbar").clientHeight;
                // this.setting.width = window.innerWidth - 6;
                this.setting.width = window.innerWidth;
                this.$store.commit('height', this.setting.height);
                this.$store.commit('width', this.setting.width);
            }
        }
    };
</script>

<style>
    ::-webkit-scrollbar{
        display: none;
    }

    #app {
        /* font-family: "Avenir", Helvetica, Arial, sans-serif; */
        font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        overflow:hidden;
    }

    text {
        font-size: 15px
    }
    html{
        font-size:22px
    }
    label{
        margin-bottom: 6px
    }

    .frame_header{
        align-items: center;
        background-color: #eeeeee;
        display: flex;
        font-size: 15px;
        line-height: 1.5;
        margin: 0;
        min-height: 52px;
        padding: rem-calc(12px 16px);
        position: relative;
        width: 100%;
    }

    .frame_header label{
        font-size: 18px;
        margin-left: 16px;
        margin-top: 6px;
    }
</style>
