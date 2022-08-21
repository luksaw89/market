<template>
  <div v-if="!loading">
    <div>
      Price on 
      <input 
        type="text"
        v-model="ticker"
        @change="loadChart"
      />  
       on {{ calcMouseDate() }} was
      ${{ calcMousePrice() }}
      <button @click="startLineMode">Line</button>
    </div>
    <svg
      ref="svg" 
      width="1000" 
      height="550"
      @mousemove="onMouseMove"
      @click="onSvgClick"
    >
      <template v-for="(candle, index) in candles">
        <rect 
          :key="candle.date"
          :x="index * (candleWidth + candleMargin)"
          :y="calcY(candle)"
          :width="candleWidth" 
          :height="calcHeight(candle)" 
          :fill="candle.color"
        />
        <line
          :key="`${candle.date}-line`" 
          :x1="index * (candleWidth + candleMargin) + candleWidth / 2" 
          :y1="calcHigh(candle)" 
          :x2="index * (candleWidth + candleMargin) + candleWidth / 2" 
          :y2="calcLow(candle)" 
          :stroke="candle.color" 
        />
        <rect
          :key="`${candle.date}-volume`" 
          :x="index * (candleWidth + candleMargin)"
          :y="calcVolumeY(candle)"
          :width="candleWidth"
          :height="calcVolumeHeight(candle)"
          :fill="candle.color"
        />  
      </template>
      <line
        :x1="0" 
        :y1="mouseY" 
        :x2="1000" 
        :y2="mouseY" 
        stroke="grey" 
      />
      <line
        :x1="mouseX" 
        :y1="0" 
        :x2="mouseX" 
        :y2="550" 
        stroke="grey" 
      />
      <line
        v-if="lineMode.x1 !== null"
        :x1="lineMode.x1" 
        :y1="lineMode.y1" 
        :x2="lineMode.x2 || mouseX" 
        :y2="lineMode.y2 || mouseY" 
        stroke="blue" 
      />
      <line
        v-for="(line, index) in lines"
        :key="index"
        :x1="line.x1" 
        :y1="line.y1" 
        :x2="line.x2" 
        :y2="line.y2" 
        stroke="blue" 
      />
    </svg>
  </div>
  <div v-else>loading

  </div>
</template>

<script>
import { throttle } from 'lodash';
import getMinValue from './helpers/getMinValue';
import getMaxValue from './helpers/getMaxValue';
import getMaxVolume from './helpers/getMaxVolume';
import { getDataDaily } from './helpers/alphavantage';

export default {
  name: 'App',
  data() {
    return {
      loading: true,
      ticker: 'AAPL',
      candles: [],
      minPrice: 0,
      maxPrice: 0,
      maxVolume: 0,
      candleWidth: 0,
      candleMargin: 0,
      mouseX: 0,
      mouseY: 0,
      lineMode: {
        enabled: false,
        x1: null,
        y1: null,
        x2: null,
        y2: null,
      },
      lines: [],
    };
  },
  created() {
    this.loadChart(); 
  },
  methods: {
    onMouseMove: throttle(function (event) {
      const position = this.$refs.svg.getBoundingClientRect();
      this.mouseX = event.clientX - position.x;
      this.mouseY = event.clientY - position.y;
    }, 100),
    onSvgClick(event) {
      if (this.lineMode.enabled) {
        this.addLine(event);   
      } 
    },
    addLine(event) {
      const position = this.$refs.svg.getBoundingClientRect();
      if (this.lineMode.x1 == null) {
        this.lineMode.x1 = event.clientX - position.x;
        this.lineMode.y1 = event.clientY - position.y;
      } else {
        this.lineMode.x2 = event.clientX - position.x;
        this.lineMode.y2 = event.clientY - position.y;
        this.lineMode.enabled = false;
        this.lines.push({
          x1: this.lineMode.x1,
          y1: this.lineMode.y1,
          x2: this.lineMode.x2,
          y2: this.lineMode.y2,
        });
        this.lineMode.x1 = null;          
        this.lineMode.y1 = null;          
        this.lineMode.x2 = null;          
        this.lineMode.y2 = null;          
      }
    },
    async loadChart() {
      this.loading = true;
      this.candles = await getDataDaily(this.ticker);
      this.minPrice = getMinValue(this.candles);
      this.maxPrice = getMaxValue(this.candles);
      this.maxVolume = getMaxVolume(this.candles);
      this.scale = 500 / (this.maxPrice - this.minPrice);
      this.scaleVolume = 50 / this.maxVolume;
      this.candleWidth = 1000 / (this.candles.length * 1.25);
      this.candleMargin = this.candleWidth / 4;
      this.loading = false;
    },
    calcY(candle) {
      return (this.maxPrice - Math.max(candle.open, candle.close)) * this.scale;
    },
    calcHeight(candle) {
      return Math.abs(candle.open - candle.close) * this.scale;
    },
    calcHigh(candle) {
      return (this.maxPrice - candle.high) * this.scale;
    },
    calcLow(candle) {
      return (this.maxPrice - candle.low) * this.scale;
    },
    calcVolumeY(candle) {
      return 500 + (this.maxVolume - candle.volume) * this.scaleVolume;
    },
    calcVolumeHeight(candle) {
      return candle.volume * this.scaleVolume;
    },
    calcMousePrice() {
      return Math.round((this.maxPrice - (this.mouseY / this.scale)) * 100) / 100;
    },
    calcMouseDate() {
      const index = Math.floor(this.mouseX / (this.candleWidth + this.candleMargin));
      return this.candles[index].date;
    },
    startLineMode() {
      this.lineMode.enabled = true;
    }
  }
}
</script>
