const WebSocket = require('ws');
const protobuf = require('protobufjs');
const path = require('path');
const socketIO = require('../utils/socket');
const axios = require('axios');
const priceFeed = require('../utils/priceFeed');

class UpstoxFeedService {
  constructor() {
    this.ws = null;
    this.root = null;
    this.MarketDataFeed = null;
    this.instruments = new Set();
    this.accessToken = null;
    this.isConnected = false;
  }

  async init(accessToken) {
    this.accessToken = accessToken;
    try {
      this.root = await protobuf.load(path.join(__dirname, '../proto/marketData.proto'));
      this.MarketDataFeed = this.root.lookupType('com.upstox.marketdatafeeder.rpc.proto.MarketDataFeed');
      console.log('✅ Upstox Protobuf loaded.');
    } catch (error) {
      console.error('❌ Failed to load Upstox Protobuf:', error);
    }
  }

  async connect() {
    if (!this.accessToken) {
      console.error('❌ Cannot connect Upstox Feed: No Access Token.');
      return;
    }

    try {
      // Get the WebSocket URL from Upstox API
      const response = await axios.get('https://api.upstox.com/v2/feed/market-data-feed/authorize', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      const wsUrl = response.data.data.authorizedRedirectUri;
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.isConnected = true;
        console.log('🌐 Upstox WebSocket Feed Connected.');
        this.subscribe(); // Resubscribe if we have instruments
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data);
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        console.warn('⚠️ Upstox WebSocket Feed Closed. Reconnecting in 5s...');
        setTimeout(() => this.connect(), 5000);
      });

      this.ws.on('error', (err) => {
        console.error('❌ Upstox WebSocket Error:', err.message);
      });

    } catch (error) {
      console.error('❌ Failed to authorize Upstox Feed:', error.response?.data || error.message);
    }
  }

  handleMessage(data) {
    if (!this.MarketDataFeed) return;

    try {
      const message = this.MarketDataFeed.decode(data);
      const feeds = message.feeds;

      for (const [instrumentKey, feedData] of Object.entries(feeds)) {
        const ltp = feedData.ltp || feedData.full;
        if (ltp) {
          const price = ltp.last_price;
          
          // Update Global Price Feed
          priceFeed.setPrice(instrumentKey, price);

          // Notify Socket.io users in the instrument room
          socketIO.io.to(`price_${instrumentKey}`).emit('price_update', {
            instrument: instrumentKey,
            price: price,
            timestamp: new Date()
          });
          
          // Debug: console.log(`Tick: ${instrumentKey} -> ${price}`);
        }
      }
    } catch (error) {
      console.error('❌ Error decoding Upstox feed packet:', error);
    }
  }

  subscribe(instrumentKeys = []) {
    if (instrumentKeys.length > 0) {
      instrumentKeys.forEach(k => this.instruments.add(k));
    }

    if (this.isConnected && this.ws && this.instruments.size > 0) {
      const subMsg = {
        guid: "some-unique-guid",
        method: "sub",
        data: {
          mode: "ltp", // or "full"
          instrumentKeys: Array.from(this.instruments)
        }
      };
      this.ws.send(JSON.stringify(subMsg));
    }
  }

  unsubscribe(instrumentKeys) {
    if (this.isConnected && this.ws) {
      instrumentKeys.forEach(k => this.instruments.delete(k));
      const unsubMsg = {
        guid: "some-unique-guid",
        method: "unsub",
        data: {
          instrumentKeys: instrumentKeys
        }
      };
      this.ws.send(JSON.stringify(unsubMsg));
    }
  }
}

module.exports = new UpstoxFeedService();
