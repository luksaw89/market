<template>
  <div>
    <input 
      type="text"
      v-model="ticker"
    /> 
    <price-chart :ticker="ticker" />
  </div>
</template>

<script>

import PriceChart from './components/priceChart.vue';

export default {
  name: 'App',
  components: {
    PriceChart,
  },
  data() {
    return {
      ticker: 'AAPL',
    };
  },
  methods: {
  }
}
</script>
