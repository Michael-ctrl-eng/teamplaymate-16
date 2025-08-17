import { toast } from 'sonner';

// Ensure URL and RequestInit are globally available or imported if in a restricted environment
// For a typical web environment, these are globally available.
// If running in Node.js without a DOM-like environment, you might need polyfills or specific imports.
// Example for Node.js: import { URL } from 'url';
// Example for Node.js: import { RequestInit } from 'node-fetch'; // if using node-fetch

// Free API endpoints for enhanced platform capabilities
const FREE_APIS = {
  // Sports Data APIs
  FOOTBALL_DATA: {
    base: 'https://api.football-data.org/v4',
    key: 'demo-key', // Free tier available
    endpoints: {
      competitions: '/competitions',
      matches: '/matches',
      teams: '/teams',
      players: '/players'
    }
  },
  
  // Weather APIs
  OPENWEATHER: {
    base: 'https://api.openweathermap.org/data/2.5',
    key: 'demo-key', // Free tier available
    endpoints: {
      current: '/weather',
      forecast: '/forecast',
      airQuality: '/air_pollution'
    }
  },
  
  // AI/ML APIs
  HUGGINGFACE: {
    base: 'https://api-inference.huggingface.co/models',
    endpoints: {
      sentiment: '/cardiffnlp/twitter-roberta-base-sentiment-latest',
      summarization: '/facebook/bart-large-cnn',
      questionAnswering: '/deepset/roberta-base-squad2'
    }
  },
  
  // Geolocation APIs
  GEOLOCATION: {
    base: 'https://ipapi.co',
    endpoints: {
      location: '/json'
    }
  },
  
  // News APIs
  NEWS_API: {
    base: 'https://newsapi.org/v2',
    key: 'demo-key', // Free tier available
    endpoints: {
      topHeadlines: '/top-headlines',
      everything: '/everything'
    }
  }
};

// Enhanced API Integration Service
export class APIIntegrationService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    // Initialize with environment keys
    Object.keys(FREE_APIS).forEach(service => {
      const envKey = import.meta.env[`VITE_${service}_API_KEY`];
      if (envKey) {
        // Update keys from environment
        (FREE_APIS as any)[service].key = envKey;
      }
    });
  }

  // Enhanced sports data fetching with caching
  async fetchSportsData(endpoint: string, params?: any) {
    const cacheKey = `sports_${endpoint}_${JSON.stringify(params)}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      const response = await this.makeRequest(
        `${FREE_APIS.FOOTBALL_DATA.base}${endpoint}`,
        {
          headers: {
            'X-Auth-Token': FREE_APIS.FOOTBALL_DATA.key
          },
          params
        }
      );
      
      this.cacheData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Sports API error:', error);
      return this.getMockSportsData(endpoint, params);
    }
  }

  // Weather data with enhanced features
  async fetchWeatherData(location: string) {
    const cacheKey = `weather_${location}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      const response = await this.makeRequest(
        `${FREE_APIS.OPENWEATHER.base}/weather`,
        {
          params: {
            q: location,
            appid: FREE_APIS.OPENWEATHER.key,
            units: 'metric'
          }
        }
      );
      
      this.cacheData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getMockWeatherData(location);
    }
  }

  // AI-powered sentiment analysis
  async analyzeSentiment(text: string) {
    const cacheKey = `sentiment_${text.slice(0, 50)}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      const response = await this.makeRequest(
        `${FREE_APIS.HUGGINGFACE.base}${FREE_APIS.HUGGINGFACE.endpoints.sentiment}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: text })
        }
      );
      
      this.cacheData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return this.getMockSentiment(text);
    }
  }

  // Enhanced news fetching for sports
  async fetchSportsNews(query: string, country: string = 'us') {
    const cacheKey = `news_${query}_${country}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      const response = await this.makeRequest(
        `${FREE_APIS.NEWS_API.base}${FREE_APIS.NEWS_API.endpoints.everything}`,
        {
          params: {
            q: query,
            apiKey: FREE_APIS.NEWS_API.key,
            sortBy: 'publishedAt',
            pageSize: 10
          }
        }
      );
      
      this.cacheData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('News API error:', error);
      return this.getMockNews(query);
    }
  }

  // Geolocation for personalized content
  async getUserLocation() {
    try {
      const response = await this.makeRequest(`${FREE_APIS.GEOLOCATION.base}/json`);
      return response;
    } catch (error) {
      console.error('Geolocation error:', error);
      return { country: 'US', city: 'New York' };
    }
  }

  // Unified data aggregation
  async getComprehensiveTeamData(teamId: string) {
    const [sportsData, weather, news, location] = await Promise.allSettled([
      this.fetchSportsData(`/teams/${teamId}`),
      this.fetchWeatherData('London'), // Example location
      this.fetchSportsNews('football'), // Example query
      this.getUserLocation()
    ]);

    return {
      sportsData: sportsData.status === 'fulfilled' ? sportsData.value : null,
      weather: weather.status === 'fulfilled' ? weather.value : null,
      news: news.status === 'fulfilled' ? news.value : null,
      location: location.status === 'fulfilled' ? location.value : null,
    };
  }

  private async makeRequest(url: string, options?: RequestInit & { params?: Record<string, any> }): Promise<any> {
    const { params, ...fetchOptions } = options || {};
    let requestUrl = new URL(url);

    if (params) {
      Object.keys(params).forEach(key => requestUrl.searchParams.append(key, params[key]));
    }

    const response = await fetch(requestUrl.toString(), fetchOptions);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp < 3600 * 1000)) { // Cache for 1 hour
      return cached.data;
    }
    return null;
  }

  private cacheData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Mock data implementations (to avoid actual API calls during development/demo)
  private getMockSportsData(endpoint: string, params?: any): any {
    console.warn(`Using mock sports data for ${endpoint} with params ${JSON.stringify(params)}`);
    if (endpoint.includes('/teams')) {
      return { id: 'mock-team', name: 'Mock Team', players: [], matches: [] };
    } else if (endpoint.includes('/competitions')) {
      return { id: 'mock-comp', name: 'Mock Competition' };
    }
    return {};
  }

  private getMockWeatherData(location: string): any {
    console.warn(`Using mock weather data for ${location}`);
    return { name: location, main: { temp: 20, humidity: 60 }, weather: [{ description: 'clear sky' }] };
  }

  private getMockSentiment(text: string): any {
    console.warn(`Using mock sentiment for: ${text}`);
    return [{ label: 'neutral', score: 0.99 }];
  }

  private getMockNews(query: string): any {
    console.warn(`Using mock news for: ${query}`);
    return { articles: [{ title: `Mock News about ${query}`, description: 'This is a mock news article.' }] };
  }

  // Health check for all APIs
  async healthCheck(): Promise<Record<string, boolean>> {
    const checks = {
      footballData: false,
      openWeather: false,
      newsApi: false,
      geolocation: false
    };

    try {
      await this.makeRequest(`${FREE_APIS.FOOTBALL_DATA.base}/competitions`);
      checks.footballData = true;
    } catch {}

    try {
      await this.makeRequest(`${FREE_APIS.OPENWEATHER.base}/weather?q=London&appid=${FREE_APIS.OPENWEATHER.key}`);
      checks.openWeather = true;
    } catch {}

    try {
      await this.makeRequest(`${FREE_APIS.NEWS_API.base}/top-headlines?country=us&apiKey=${FREE_APIS.NEWS_API.key}`);
      checks.newsApi = true;
    } catch {}

    return checks;
  }
}

export const apiIntegrationService = new APIIntegrationService();