import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
)

export function chartTheme() {
  return {
    plugins: {
      legend: {
        labels: { color: 'rgba(255,255,255,0.75)' },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        titleColor: 'rgba(255,255,255,0.9)',
        bodyColor: 'rgba(255,255,255,0.8)',
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.6)' },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        ticks: { color: 'rgba(255,255,255,0.6)' },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
    },
  }
}

