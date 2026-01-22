import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

// Radial Chart Component (Sales by Category)
function RadialChart({ stats }) {
  const categories = [
    { name: 'Toys', value: 35, color: '#FCD34D' },
    { name: 'Gadgets', value: 28, color: '#FBBF24' },
    { name: 'Electronics', value: 22, color: '#F59E0B' },
    { name: 'Games', value: 15, color: '#D97706' },
  ]

  const size = 220
  const centerX = size / 2
  const centerY = size / 2
  const innerRadius = 55
  const outerRadius = 95
  const total = categories.reduce((sum, cat) => sum + cat.value, 0)

  let currentAngle = -90

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mb-4">
        <defs>
          {categories.map((cat, i) => (
            <linearGradient key={i} id={`radialGradient${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={cat.color} stopOpacity="0.9" />
              <stop offset="50%" stopColor={cat.color} stopOpacity="0.7" />
              <stop offset="100%" stopColor={cat.color} stopOpacity="0.5" />
            </linearGradient>
          ))}
        </defs>

        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="#F9FAFB"
          stroke="#E5E7EB"
          strokeWidth="1"
        />

        {categories.map((cat, i) => {
          const angle = (cat.value / total) * 360
          const startAngle = currentAngle
          const endAngle = currentAngle + angle
          currentAngle = endAngle

          const startAngleRad = (startAngle * Math.PI) / 180
          const endAngleRad = (endAngle * Math.PI) / 180

          const x1 = centerX + innerRadius * Math.cos(startAngleRad)
          const y1 = centerY + innerRadius * Math.sin(startAngleRad)
          const x2 = centerX + outerRadius * Math.cos(startAngleRad)
          const y2 = centerY + outerRadius * Math.sin(startAngleRad)
          const x3 = centerX + outerRadius * Math.cos(endAngleRad)
          const y3 = centerY + outerRadius * Math.sin(endAngleRad)
          const x4 = centerX + innerRadius * Math.cos(endAngleRad)
          const y4 = centerY + innerRadius * Math.sin(endAngleRad)

          const largeArc = angle > 180 ? 1 : 0

          const path = `
            M ${x1} ${y1}
            L ${x2} ${y2}
            A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}
            L ${x4} ${y4}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}
            Z
          `

          const labelAngle = (startAngle + endAngle) / 2
          const labelRadius = (innerRadius + outerRadius) / 2
          const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180)
          const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180)

          return (
            <g key={i}>
              <path
                d={path}
                fill={`url(#radialGradient${i})`}
                stroke="white"
                strokeWidth="2.5"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="#111827"
                fontWeight="700"
                style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
              >
                {cat.name}
              </text>
            </g>
          )
        })}
      </svg>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 w-full px-4 mt-2">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center space-x-2.5 p-2 rounded-md hover:bg-gray-50 transition-colors">
            <div 
              className="w-3.5 h-3.5 rounded-full shadow-sm border-2 border-white" 
              style={{ backgroundColor: cat.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-black truncate">{cat.name}</p>
              <p className="text-xs text-gray-600 font-medium">{cat.value}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Radar Chart Component (Performance Overview)
function RadarChart({ stats }) {
  const metrics = [
    { label: 'Revenue', value: Math.min((stats?.totalRevenue || 0) / 1000, 100), max: 100 },
    { label: 'Orders', value: Math.min((stats?.totalOrders || 0) / 10, 100), max: 100 },
    { label: 'Products', value: Math.min((stats?.totalProducts || 0) / 5, 100), max: 100 },
    { label: 'Growth', value: 75, max: 100 },
    { label: 'Satisfaction', value: 85, max: 100 },
    { label: 'Efficiency', value: 70, max: 100 },
  ]

  const size = 320
  const centerX = size / 2
  const centerY = size / 2
  const radius = 115
  const numPoints = metrics.length

  // Calculate points for the radar
  const getPoint = (index, value) => {
    const angle = (index * 360) / numPoints - 90
    const rad = (angle * Math.PI) / 180
    const r = (value / 100) * radius
    return {
      x: centerX + r * Math.cos(rad),
      y: centerY + r * Math.sin(rad),
    }
  }

  // Generate path for the filled area
  const pathData = metrics
    .map((metric, i) => {
      const point = getPoint(i, metric.value)
      return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    })
    .join(' ') + ' Z'

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="radarGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FCD34D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.15" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grid circles with labels */}
        {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = Math.round(100 * ratio)
          const labelY = centerY - radius * ratio - 8
          return (
            <g key={i}>
              <circle
                cx={centerX}
                cy={centerY}
                r={radius * ratio}
                fill="none"
                stroke={i === 3 ? "#D1D5DB" : "#F3F4F6"}
                strokeWidth={i === 3 ? "2" : "1"}
                strokeDasharray={i === 3 ? "none" : "4 2"}
              />
              {i > 0 && (
                <text
                  x={centerX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#9CA3AF"
                  fontWeight="500"
                >
                  {value}%
                </text>
              )}
            </g>
          )
        })}

        {/* Grid lines */}
        {metrics.map((_, i) => {
          const angle = (i * 360) / numPoints - 90
          const rad = (angle * Math.PI) / 180
          const x = centerX + radius * Math.cos(rad)
          const y = centerY + radius * Math.sin(rad)
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )
        })}

        {/* Filled area */}
        <path
          d={pathData}
          fill="url(#radarGradient)"
          stroke="#FCD34D"
          strokeWidth="2.5"
          opacity="0.6"
          filter="url(#glow)"
        />

        {/* Data line */}
        <path
          d={pathData.replace(' Z', '')}
          fill="none"
          stroke="#FCD34D"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {metrics.map((metric, i) => {
          const point = getPoint(i, metric.value)
          return (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#FCD34D"
                stroke="white"
                strokeWidth="2.5"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(252,211,77,0.5))' }}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="2"
                fill="white"
              />
            </g>
          )
        })}

        {/* Labels with values */}
        {metrics.map((metric, i) => {
          const angle = (i * 360) / numPoints - 90
          const rad = (angle * Math.PI) / 180
          const labelRadius = radius + 30
          const x = centerX + labelRadius * Math.cos(rad)
          const y = centerY + labelRadius * Math.sin(rad)

          return (
            <g key={i}>
              <text
                x={x}
                y={y - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="#111827"
                fontWeight="600"
              >
                {metric.label}
              </text>
              <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#6B7280"
                fontWeight="500"
              >
                {Math.round(metric.value)}%
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Simple Area Chart Component (no external library needed)
function SimpleAreaChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  
  if (!data || data.length === 0) return null

  const maxOrders = Math.max(...data.map(d => d.orders || 0), 1)
  const maxRevenue = Math.max(...data.map(d => d.revenue || 0), 1)
  const chartHeight = 250
  const chartWidth = 100
  const padding = { top: 20, right: 20, bottom: 40, left: 40 }

  // Generate smooth SVG path for area chart using cubic bezier curves
  const generatePath = (dataKey, maxValue, smooth = false) => {
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * (chartWidth - padding.left - padding.right)
      const y = padding.top + (1 - (d[dataKey] || 0) / maxValue) * (chartHeight - padding.top - padding.bottom)
      return { x, y }
    })
    
    if (smooth && points.length > 2) {
      // Create smooth curve using cubic bezier
      let path = `M ${points[0].x},${points[0].y} `
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[Math.min(points.length - 1, i + 2)]
        
        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6
        
        path += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `
      }
      const lastPoint = points[points.length - 1]
      const firstPoint = points[0]
      path += `L ${lastPoint.x},${chartHeight - padding.bottom} L ${firstPoint.x},${chartHeight - padding.bottom} Z`
      return path
    } else {
      // Linear path
      const pathData = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ')
      const lastPoint = points[points.length - 1]
      const firstPoint = points[0]
      return `${pathData} L ${lastPoint.x},${chartHeight - padding.bottom} L ${firstPoint.x},${chartHeight - padding.bottom} Z`
    }
  }
  
  // Generate smooth line path using cubic bezier
  const generateLinePath = (dataKey, maxValue) => {
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * (chartWidth - padding.left - padding.right)
      const y = padding.top + (1 - (d[dataKey] || 0) / maxValue) * (chartHeight - padding.top - padding.bottom)
      return { x, y }
    })
    
    if (points.length > 2) {
      let path = `M ${points[0].x},${points[0].y} `
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[Math.min(points.length - 1, i + 2)]
        
        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6
        
        path += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `
      }
      return path
    } else {
      return points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ')
    }
  }

  const ordersPath = generatePath('orders', maxOrders, true)
  const revenuePath = generatePath('revenue', maxRevenue, true)
  const ordersLinePath = generateLinePath('orders', maxOrders)
  const revenueLinePath = generateLinePath('revenue', maxRevenue)

  return (
    <div className="relative" style={{ height: `${chartHeight}px` }}>
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
        <defs>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .chart-area {
              animation: fadeIn 0.6s ease-out;
            }
            .chart-line {
              animation: fadeIn 0.8s ease-out;
            }
          `}</style>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + ratio * (chartHeight - padding.top - padding.bottom)}
            x2={chartWidth - padding.right}
            y2={padding.top + ratio * (chartHeight - padding.top - padding.bottom)}
            stroke="#F3F4F6"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        ))}

        {/* Revenue area (gray, behind) */}
        <path
          d={revenuePath}
          fill="url(#revenueGradient)"
          opacity="0.25"
          className="chart-area"
        />

        {/* Orders area (yellow, on top) */}
        <path
          d={ordersPath}
          fill="url(#ordersGradient)"
          opacity="0.65"
          className="chart-area"
        />

        {/* Orders line - smooth curve */}
        <path
          d={ordersLinePath}
          fill="none"
          stroke="#FCD34D"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="chart-line"
          style={{ filter: 'drop-shadow(0 2px 6px rgba(252,211,77,0.4))' }}
        />

        {/* Revenue line - smooth curve */}
        <path
          d={revenueLinePath}
          fill="none"
          stroke="#6B7280"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
          className="chart-line"
        />

        {/* Hover points */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1 || 1)) * (chartWidth - padding.left - padding.right)
          const y = padding.top + (1 - (d.orders || 0) / maxOrders) * (chartHeight - padding.top - padding.bottom)
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="#FCD34D"
                stroke="white"
                strokeWidth="2.5"
                style={{ 
                  cursor: 'pointer', 
                  opacity: hoveredIndex === i ? 1 : 0.7,
                  filter: 'drop-shadow(0 2px 4px rgba(252,211,77,0.5))',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {hoveredIndex === i && (
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="#FCD34D"
                  opacity="0.2"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {/* Tooltip */}
              {hoveredIndex === i && (
                <g>
                  <defs>
                    <filter id="tooltipShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.1)"/>
                    </filter>
                  </defs>
                  <rect
                    x={x - 45}
                    y={y - 62}
                    width="90"
                    height="52"
                    fill="white"
                    stroke="#E5E7EB"
                    strokeWidth="2"
                    rx="8"
                    filter="url(#tooltipShadow)"
                  />
                  {/* Tooltip header */}
                  <rect
                    x={x - 45}
                    y={y - 62}
                    width="90"
                    height="18"
                    fill="#FCD34D"
                    rx="8"
                    rx2="0"
                  />
                  <text
                    x={x}
                    y={y - 50}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#111827"
                    fontWeight="700"
                  >
                    {d.label}
                  </text>
                  {/* Tooltip content */}
                  <line
                    x1={x - 40}
                    y1={y - 44}
                    x2={x + 40}
                    y2={y - 44}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                  <text
                    x={x - 35}
                    y={y - 28}
                    fontSize="9"
                    fill="#6B7280"
                    fontWeight="500"
                  >
                    Orders:
                  </text>
                  <text
                    x={x + 35}
                    y={y - 28}
                    textAnchor="end"
                    fontSize="11"
                    fill="#111827"
                    fontWeight="700"
                  >
                    {d.orders}
                  </text>
                  <text
                    x={x - 35}
                    y={y - 14}
                    fontSize="9"
                    fill="#6B7280"
                    fontWeight="500"
                  >
                    Revenue:
                  </text>
                  <text
                    x={x + 35}
                    y={y - 14}
                    textAnchor="end"
                    fontSize="11"
                    fill="#111827"
                    fontWeight="700"
                  >
                    ₹{(d.revenue || 0).toFixed(2)}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* X-axis labels with grid indicators */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1 || 1)) * (chartWidth - padding.left - padding.right)
          const showLabel = i % Math.ceil(data.length / 7) === 0 || i === data.length - 1
          return showLabel ? (
            <g key={i}>
              <line
                x1={x}
                y1={chartHeight - padding.bottom}
                x2={x}
                y2={chartHeight - padding.bottom + 5}
                stroke="#9CA3AF"
                strokeWidth="1.5"
              />
              <text
                x={x}
                y={chartHeight - padding.bottom + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#374151"
                fontWeight="500"
              >
                {d.label}
              </text>
            </g>
          ) : null
        })}

        {/* Y-axis labels with grid indicators */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = Math.round(maxOrders * (1 - ratio))
          const y = padding.top + ratio * (chartHeight - padding.top - padding.bottom)
          return (
            <g key={i}>
              <line
                x1={padding.left - 5}
                y1={y}
                x2={padding.left}
                y2={y}
                stroke="#9CA3AF"
                strokeWidth="1.5"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#374151"
                fontWeight="500"
              >
                {value}
              </text>
            </g>
          )
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="ordersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#FCD34D" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#9CA3AF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState('7') // '7', '30', or '90'

  useEffect(() => {
    fetchStats()
    fetchChartData()
  }, [])

  useEffect(() => {
    fetchChartData()
  }, [chartPeriod])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async () => {
    try {
      setChartLoading(true)
      const response = await api.get(`/admin/dashboard/chart-data?period=${chartPeriod}`)
      setChartData(response.data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setChartLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400"></div>
      </div>
    )
  }

  const statCards = [
    { 
      label: 'Total Revenue', 
      value: `₹${(stats?.totalRevenue || 0).toFixed(2)}`, 
      trend: '+12.5%',
      trendUp: true,
      description: 'Trending up this month'
    },
    { 
      label: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      trend: '+8.2%',
      trendUp: true,
      description: 'Orders for the last 6 months'
    },
    { 
      label: 'Total Products', 
      value: stats?.totalProducts || 0, 
      trend: '+5.1%',
      trendUp: true,
      description: 'Products in catalog'
    },
    { 
      label: 'Pending Orders', 
      value: stats?.pendingOrders || 0, 
      trend: '-20%',
      trendUp: false,
      description: 'Down 20% this period'
    },
  ]

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black mb-1">Dashboard</h1>
      </div>

      {/* Stats Grid - 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-600 mb-2">{stat.label}</p>
            <p className="text-2xl font-semibold text-black mb-3">{stat.value}</p>
            <div className="flex items-center space-x-1 mb-1">
              <span className={`text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-orange-600'}`}>
                {stat.trend}
              </span>
              {stat.trendUp ? (
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <div>
              <h2 className="text-base font-semibold text-black">Total Orders</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {chartPeriod === '7' ? 'Total for the last 7 days' :
                 chartPeriod === '30' ? 'Total for the last 30 days' :
                 'Total for the last 3 months'}
              </p>
            </div>
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setChartPeriod('90')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartPeriod === '90'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Last 3 months
              </button>
              <button
                onClick={() => setChartPeriod('30')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartPeriod === '30'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Last 30 days
              </button>
              <button
                onClick={() => setChartPeriod('7')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartPeriod === '7'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Last 7 days
              </button>
            </div>
          </div>
          <div className="p-5">
            {chartLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              </div>
            ) : chartData.length > 0 ? (
              <SimpleAreaChart data={chartData} />
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Radial Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-base font-semibold text-black">Sales by Category</h2>
            <p className="text-xs text-gray-500 mt-0.5">Last 6 months</p>
          </div>
          <div className="p-5">
            <RadialChart stats={stats} />
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-base font-semibold text-black">Performance Overview</h2>
          <p className="text-xs text-gray-500 mt-0.5">Showing metrics for the last 6 months</p>
        </div>
        <div className="p-5">
          <RadarChart stats={stats} />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-black">Recent Orders</h2>
            <p className="text-xs text-gray-500 mt-0.5">Latest customer orders</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-medium text-black hover:text-gray-700 transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="p-5">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Order #</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{order.customerInfo?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm font-medium text-black">₹{order.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-gray-600">No recent orders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
