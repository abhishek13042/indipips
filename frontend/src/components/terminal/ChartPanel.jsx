import React, { useRef, useEffect } from 'react'

const ChartPanel = ({ symbol }) => {
  const containerRef = useRef(null)
  const widgetRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Destroy old widget if exists
    if (widgetRef.current) {
      containerRef.current.innerHTML = ''
      widgetRef.current = null
    }

    // Create new script
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
      backgroundColor: '#060B14',
      gridColor: '#1E2D40',
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      withdateranges: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
      container_id: 'tv-chart-' + symbol.replace(':', '-'),
    }

    script.textContent = JSON.stringify(config)

    const container = document.createElement('div')
    container.className = 'tradingview-widget-container'
    container.style.height = '100%'
    container.style.width = '100%'

    const chartDiv = document.createElement('div')
    chartDiv.id = 'tv-chart-' + symbol.replace(':', '-')
    chartDiv.style.height = '100%'
    chartDiv.style.width = '100%'

    container.appendChild(chartDiv)
    container.appendChild(script)

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(container)

    widgetRef.current = container

    return () => {
      // Cleanup on unmount or symbol change
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      widgetRef.current = null
    }
  }, [symbol]) // ONLY re-run on symbol change

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
