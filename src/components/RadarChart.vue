<template>
  <canvas ref="canvasEl"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  Chart,
  RadarController,         // <-- important
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'

// Register everything needed for a radar chart
Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const props = defineProps({
  points: {
    type: Array,
    required: true, // [n,n,n,n,n,n,n]
    validator: v => Array.isArray(v) && v.length === 7
  },
  name: { type: String, default: 'This Match' }
})

const canvasEl = ref(null)
let chart

// Local labels + a static “benchmark” dataset
const labels = [
  'Foot Traffic',
  'Avg Order $',
  'Category Fit',
  'Margin',
  'Lead Time',
  'Brand Alignment',
  'Geo Proximity'
]

const buildData = () => ({
  labels,
  datasets: [
    {
      label: "Duffey's Dapper Duds",
      data: [65, 59, 90, 81, 56, 55, 40],
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'rgb(255, 99, 132)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(255, 99, 132)'
    },
    {
      label: props.name,
      data: props.points,
      fill: true,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)',
      pointBackgroundColor: 'rgb(54, 162, 235)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(54, 162, 235)'
    }
  ]
})

const config = () => ({
  type: 'radar',
  data: buildData(),
  options: {
    responsive: true,
    elements: { 
        line: { 
            borderWidth: 3 
        } 
    },
    scales: { 
        r: { 
            beginAtZero: true, 
            suggestedMax: 100,
            ticks: { backdropColor:'rgba(255, 255, 255, 0.0)', color:'rgba(255, 255, 255, 1.0)',stepSize: 20},
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
        } 
    },
    plugins: { 
        legend: { 
            position: 'top' 
        } 
    }
  }
})

onMounted(() => {
  chart = new Chart(canvasEl.value.getContext('2d'), config())
})

watch(
  () => [props.points, props.name],
  () => {
    if (!chart) return
    // Update just the dynamic series (2nd dataset)
    chart.data.datasets[1].data = props.points
    chart.data.datasets[1].label = props.name
    chart.update()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>

<style scoped>
canvas { max-width: 100%; }
</style>
