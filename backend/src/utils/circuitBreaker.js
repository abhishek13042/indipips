class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'unknown'
    this.failureThreshold = 
      options.failureThreshold || 5
    // Open after 5 failures
    
    this.successThreshold = 
      options.successThreshold || 2
    // Close after 2 successes in HALF_OPEN
    
    this.timeout = 
      options.timeout || 30000
    // Wait 30s before trying again
    
    this.monitorInterval = 
      options.monitorInterval || 60000
    // Log stats every 60 seconds
    
    // State
    this.state = 'CLOSED'
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = null
    this.totalRequests = 0
    this.totalFailures = 0
    this.totalSuccesses = 0
    
    // Start monitoring
    this.startMonitoring()
  }

  async execute(fn) {
    this.totalRequests++

    // OPEN state: reject immediately
    if (this.state === 'OPEN') {
      const timeSinceFailure = 
        Date.now() - this.lastFailureTime
      
      if (timeSinceFailure >= this.timeout) {
        // Try again — move to HALF_OPEN
        this.state = 'HALF_OPEN'
        this.successes = 0
        console.log('🔄 Circuit ' + 
          this.name + ' HALF_OPEN — testing')
      } else {
        // Still open — reject
        const error = new Error(
          this.name + ' service temporarily ' +
          'unavailable. Retry in ' +
          Math.ceil(
            (this.timeout - timeSinceFailure)
            / 1000
          ) + ' seconds.'
        )
        error.code = 'CIRCUIT_OPEN'
        throw error
      }
    }

    // CLOSED or HALF_OPEN: try the request
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error)
      throw error
    }
  }

  onSuccess() {
    this.totalSuccesses++
    this.failures = 0

    if (this.state === 'HALF_OPEN') {
      this.successes++
      if (this.successes >= 
          this.successThreshold) {
        this.state = 'CLOSED'
        console.log('✅ Circuit ' + 
          this.name + ' CLOSED — recovered')
      }
    }
  }

  onFailure(error) {
    this.totalFailures++
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.state === 'HALF_OPEN') {
      // Failed during test — back to OPEN
      this.state = 'OPEN'
      console.error('❌ Circuit ' + 
        this.name + ' back to OPEN')
      return
    }

    if (this.state === 'CLOSED' && 
        this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
      console.error('🔴 Circuit ' + 
        this.name + ' OPENED after ' + 
        this.failures + ' failures')
      
      // Alert: in production this would
      // send email/SMS to admin
      this.alertAdmin(error)
    }
  }

  alertAdmin(error) {
    // Log critical alert
    console.error('🚨 CIRCUIT BREAKER ALERT:', {
      service: this.name,
      state: this.state,
      failures: this.failures,
      lastError: error.message,
      timestamp: new Date().toISOString(),
    })
    // TODO: Send to Sentry + admin email
    // When Sentry is configured:
    // Sentry.captureException(error, {
    //   tags: { circuit: this.name }
    // })
  }

  getStats() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      failureRate: this.totalRequests > 0
        ? (
            (this.totalFailures / 
             this.totalRequests) * 100
          ).toFixed(1) + '%'
        : '0%',
      lastFailureTime: this.lastFailureTime
        ? new Date(
            this.lastFailureTime
          ).toISOString()
        : null,
    }
  }

  startMonitoring() {
    setInterval(() => {
      const stats = this.getStats()
      if (stats.state !== 'CLOSED' || 
          parseFloat(stats.failureRate) > 5) {
        console.warn('⚠️ Circuit stats:', stats)
      }
    }, this.monitorInterval)
  }

  reset() {
    this.state = 'CLOSED'
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = null
    console.log('🔄 Circuit ' + 
      this.name + ' manually reset')
  }
}

// Create circuit breakers for each service
const breakers = {
  database: new CircuitBreaker({
    name: 'database',
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000,
    // Open after 5 DB failures
    // Test every 30 seconds
  }),

  redis: new CircuitBreaker({
    name: 'redis',
    failureThreshold: 10,
    successThreshold: 3,
    timeout: 10000,
    // Redis can fail more — not critical
    // Opens after 10 failures
  }),

  razorpay: new CircuitBreaker({
    name: 'razorpay',
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 60000,
    // Payment gateway — strict
    // Open after 3 failures
    // Test every 60 seconds
  }),

  upstox: new CircuitBreaker({
    name: 'upstox',
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000,
    // Broker API circuit breaker
  }),

  kyc: new CircuitBreaker({
    name: 'kyc',
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
    // KYC provider (Digio)
  }),
}

// Helper: wrap any async function
// with circuit breaker protection
const withCircuitBreaker = (
  breakerName, fn
) => {
  const breaker = breakers[breakerName]
  if (!breaker) {
    console.warn('Unknown breaker:', 
      breakerName)
    return fn()
  }
  return breaker.execute(fn)
}

// Get all breaker stats for health check
const getAllBreakerStats = () => {
  return Object.fromEntries(
    Object.entries(breakers).map(
      ([name, breaker]) => [
        name, breaker.getStats()
      ]
    )
  )
}

module.exports = {
  breakers,
  withCircuitBreaker,
  getAllBreakerStats,
  CircuitBreaker,
}
