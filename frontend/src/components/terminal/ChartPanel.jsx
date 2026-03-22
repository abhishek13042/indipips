import React, { useRef, useEffect } from 'react'

const ChartPanel = ({ symbol }) => {
  const containerRef = useRef(null)
  const widgetRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear container
    containerRef.current.innerHTML = ''

    // Create widget container
    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container'
    widgetContainer.style.height = '100%'
    widgetContainer.style.width = '100%'

    const chartDiv = document.createElement('div')
    chartDiv.className = 'tradingview-widget-container__widget'
    chartDiv.style.height = '100%'
    chartDiv.style.width = '100%'
    widgetContainer.appendChild(chartDiv)

    // Create script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.type = 'text/javascript'
    
    const config = {
      autosize: true,
      symbol: symbol,
      interval: '5',
      timezone: 'Asia/Kolkata',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: 'tv_chart_' + Math.random().toString(36).substring(7),
      backgroundColor: '#060B14',
      gridColor: 'rgba(30, 45, 64, 0.5)',
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: false,
    }

    script.textContent = JSON.stringify(config)
    widgetContainer.appendChild(script)
    containerRef.current.appendChild(widgetContainer)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol])

  return (
    <div
      ref={containerRef}
      style={{
        gridArea: 'chart',
        height: '100%',
        width: '100%',
        background: '#060B14',
        overflow: 'hidden',
      }}
    >
      {/* LOADING STATE - Show while widget loads */}
      {!widgetRef.current && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{
            width: 32, height: 32,
            border: '2px solid #1E2D40',
            borderTop: '2px solid #2563EB',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ color: '#94A3B8', fontSize: 13 }}>Loading chart...</div>
        </div>
      )}
    </div>
  )
}

export default React.memo(ChartPanel, (prevProps, nextProps) => {
  return prevProps.symbol === nextProps.symbol
})
