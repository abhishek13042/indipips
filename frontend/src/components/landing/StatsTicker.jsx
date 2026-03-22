const colors = { bg: '#0A0F1E', border: '#1F2937', text: '#F9FAFB', success: '#10B981', gold: '#F59E0B' }

export default function StatsTicker() {
  const items = [
    { icon: "🏆", text: "847 Active Traders" },
    { icon: "💰", text: "₹2.3 Crore Total Payouts" },
    { icon: "⚡", text: "Average Payout: 12 Hours" },
    { icon: "✅", text: "47 Traders Funded" },
    { icon: "🔥", text: "Highest Payout: ₹14.2L" }
  ]

  return (
    <div style={{ background: colors.bg, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, padding: '16px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .ticker-wrap { display: inline-flex; animation: ticker 40s linear infinite; }
        .ticker-item { display: inline-flex; align-items: center; gap: 8px; font-weight: 500; font-size: 14px; margin-right: 48px; color: ${colors.text}; }
      `}} />
      <div className="ticker-wrap">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <div key={i} className="ticker-item">
            <span>{item.icon}</span> <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
