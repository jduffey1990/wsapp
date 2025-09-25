<template>
  <canvas ref="canvasEl"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTheme } from 'vuetify'
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

const theme = useTheme() 
// tiny helper to add alpha to a hex color from the theme
const rgba = (hex, a = 0.22) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}


const canvasEl = ref(null)
let chart

// Local labels + a static “benchmark” dataset
const labels = [
  'Performance',
  'Product',
  'Brand',
  'Social',
  'Customer',
  'Wolesale',
]

const buildData = () => {
  const WARN    = theme.current.value.colors.warning   // '#D64933'
  const SUCCESS = theme.current.value.colors.success 
  return {
  labels,
  datasets: [
      {
        label: "Duffey's Dapper Duds",
        data: [65, 59, 90, 81, 56, 55],
        fill: true,
        backgroundColor: rgba(WARN, 0.20),
        borderColor: WARN,
        pointBackgroundColor: WARN,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: WARN
      },
      {
        label: props.name,
        data: props.points,
        fill: true,
        backgroundColor: rgba(SUCCESS, 0.25),
        borderColor: SUCCESS,
        pointBackgroundColor: SUCCESS,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: SUCCESS
      }
    ]
}
}

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
canvas { max-width: 833px; }
</style>
