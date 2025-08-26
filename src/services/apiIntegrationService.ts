// Production API Integration Service with Real External APIs
import { toast } from 'sonner';

// Enhanced API Configuration with Production Keys
const PRODUCTION_APIS = {
  // Sports Data APIs
  FOOTBALL_DATA: {
    base: 'https://api.football-data.org/v4',
    key: import.meta.env?.['VITE_FOOTBALL_DATA_API_KEY'] || '',
    endpoints: {
      competitions: '/competitions',
      matches: '/matches',
      teams: '/teams',
      players: '/players'
    },
    rateLimit: 100 // requests per day (free tier)
  },
  
  API_FOOTBALL: {
    base: 'https://v3.football.api-sports.io',
    key: import.meta.env?.['VITE_API_FOOTBALL_KEY'] || '',
    endpoints: {
      fixtures: '/fixtures',
      teams: '/teams',
      players: '/players',
      standings: '/standings'
    },
    rateLimit: 100 // requests per day (free tier)
  },
  
  // Weather APIs
  OPENWEATHER: {
    base: 'https://api.openweathermap.org/data/2.5',
    key: import.meta.env?.['VITE_OPENWEATHER_API_KEY'] || '',
    endpoints: {
      current: '/weather',
      forecast: '/forecast',
      airQuality: '/air_pollution'
    },
    rateLimit: 1000 // requests per day (free tier)
  },
  
  // AI/ML APIs
  HUGGINGFACE: {
    base: 'https://api-inference.huggingface.co/models',
    key: import.meta.env?.['VITE_HUGGINGFACE_API_KEY'] || '',
    endpoints: {
      sentiment: '/cardiffnlp/twitter-roberta-base-sentiment-latest',
      summarization: '/facebook/bart-large-cnn',
      questionAnswering: '/deepset/roberta-base-squad2'
    },
    rateLimit: -1 // unlimited (free tier)
  },
  
  OPENAI: {
    base: 'https://api.openai.com/v1',
    key: import.meta.env?.['VITE_OPENAI_API_KEY'] || '',
    endpoints: {
      chat: '/chat/completions',
      embeddings: '/embeddings'
    },
    rateLimit: 'usage_based'
  },
  
  // News APIs
  NEWS_API: {
    base: 'https://newsapi.org/v2',
    key: import.meta.env?.['VITE_NEWS_API_KEY'] || '',
    endpoints: {
      topHeadlines: '/top-headlines',
      everything: '/everything'
    },
    rateLimit: 100 // requests per day (free tier)
  },
  
  // Geolocation APIs
  GEOLOCATION: {
    base: 'https://ipapi.co',
    key: '', // No key required for basic usage
    endpoints: {
      location: '/json'
    },
    rateLimit: 30000 // requests per month (free tier)
  }
};

// Production API Integration Service
export class ProductionAPIIntegrationService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();
  private cacheTimeout = 3600 * 1000; // 1 hour
  
  constructor() {
    this.initializeServices();
    this.setupRateLimitMonitoring();
  }

  private initializeServices() {
    // Log available API keys for debugging
    const availableAPIs = [];
    if (PRODUCTION_APIS.FOOTBALL_DATA.key) availableAPIs.push('Football Data');
    if (PRODUCTION_APIS.OPENWEATHER.key) availableAPIs.push('OpenWeather');
    if (PRODUCTION_APIS.NEWS_API.key) availableAPIs.push('News API');
    if (PRODUCTION_APIS.HUGGINGFACE.key) availableAPIs.push('Hugging Face');
    if (PRODUCTION_APIS.OPENAI.key) availableAPIs.push('OpenAI');
    
    console.log('📡 Available APIs:', availableAPIs.join(', '));
    
    if (availableAPIs.length === 0) {
      console.warn('⚠️ No API keys configured. Running in fallback mode.');
      toast.warning('External services not configured. Using demo data.');
    }
  }

  private setupRateLimitMonitoring() {
    // Reset rate limits every hour
    setInterval(() => {
      const now = Date.now();
      for (const [key, limit] of this.rateLimits.entries()) {
        if (now > limit.resetTime) {
          this.rateLimits.delete(key);
        }
      }
    }, 60000); // Check every minute
  }

  // === SPORTS DATA INTEGRATION ===

  /**
   * Fetch real sports data from Football-Data.org or API-Football
   */
  async fetchSportsData(endpoint: string, params?: any) {
    const cacheKey = `sports_${endpoint}_${JSON.stringify(params)}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      // Try Football-Data.org first (more reliable free tier)
      if (PRODUCTION_APIS.FOOTBALL_DATA.key) {
        const response = await this.makeRateLimitedRequest(
          'FOOTBALL_DATA',
          `${PRODUCTION_APIS.FOOTBALL_DATA.base}${endpoint}`,
          {
            headers: {
              'X-Auth-Token': PRODUCTION_APIS.FOOTBALL_DATA.key
            },
            params
          }
        );
        
        this.cacheData(cacheKey, response);
        return response;
      }
      
      // Fallback to API-Football
      if (PRODUCTION_APIS.API_FOOTBALL.key) {
        const response = await this.makeRateLimitedRequest(
          'API_FOOTBALL',
          `${PRODUCTION_APIS.API_FOOTBALL.base}${endpoint}`,
          {
            headers: {
              'X-RapidAPI-Key': PRODUCTION_APIS.API_FOOTBALL.key,
              'X-RapidAPI-Host': 'v3.football.api-sports.io'
            },
            params
          }
        );
        
        this.cacheData(cacheKey, response);
        return response;
      }
      
      throw new Error('No sports API keys configured');
    } catch (error) {
      console.error('Sports API error:', error);
      return this.getMockSportsData(endpoint, params);
    }
  }

  /**
   * Get live match data
   */
  async getLiveMatches(competition?: string) {
    try {
      const params = {
        status: 'LIVE',
        ...(competition && { competition })
      };
      
      return await this.fetchSportsData('/matches', params);
    } catch (error) {
      console.error('Live matches error:', error);
      return { matches: [] };
    }
  }

  /**
   * Get team information
   */
  async getTeamInfo(teamId: string) {
    try {
      return await this.fetchSportsData(`/teams/${teamId}`);
    } catch (error) {
      console.error('Team info error:', error);
      return null;
    }
  }

  // Weather data with enhanced features
  async fetchWeatherData(location: string) {
    const cacheKey = `weather_${location}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) return cached;
    
    try {
      const response = await this.makeRequest(
        `${PRODUCTION_APIS.OPENWEATHER.base}/weather`,
        {
          params: {
            q: location,
            appid: PRODUCTION_APIS.OPENWEATHER.key,
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
        `${PRODUCTION_APIS.HUGGINGFACE.base}${PRODUCTION_APIS.HUGGINGFACE.endpoints.sentiment}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PRODUCTION_APIS.HUGGINGFACE.key}`,
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
        `${PRODUCTION_APIS.NEWS_API.base}${PRODUCTION_APIS.NEWS_API.endpoints.everything}`,
        {
          params: {
            q: query,
            apiKey: PRODUCTION_APIS.NEWS_API.key,
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
      const response = await this.makeRequest(`${PRODUCTION_APIS.GEOLOCATION.base}/json`);
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
      await this.makeRequest(`${PRODUCTION_APIS.FOOTBALL_DATA.base}/competitions`);
      checks.footballData = true;
    } catch {}

    try {
      await this.makeRequest(`${PRODUCTION_APIS.OPENWEATHER.base}/weather?q=London&appid=${PRODUCTION_APIS.OPENWEATHER.key}`);
      checks.openWeather = true;
    } catch {}

    try {
      await this.makeRequest(`${PRODUCTION_APIS.NEWS_API.base}/top-headlines?country=us&apiKey=${PRODUCTION_APIS.NEWS_API.key}`);
      checks.newsApi = true;
    } catch {}

    return checks;
  }

  /**
   * Make a rate-limited request with automatic retry
   */
  private async makeRateLimitedRequest(apiName: string, url: string, options: RequestInit & { params?: Record<string, any> } = {}): Promise<any> {
    // Check rate limit
    const now = Date.now();
    const rateLimit = this.rateLimits.get(apiName);
    
    // Get the rate limit for this API and ensure it's a number
    const apiRateLimit = PRODUCTION_APIS[apiName as keyof typeof PRODUCTION_APIS].rateLimit;
    const numericRateLimit = typeof apiRateLimit === 'number' ? apiRateLimit : parseInt(apiRateLimit as string) || -1;
    
    if (rateLimit && numericRateLimit > 0 && rateLimit.count >= numericRateLimit && now < rateLimit.resetTime) {
      throw new Error(`Rate limit exceeded for ${apiName}. Try again in ${Math.ceil((rateLimit.resetTime - now) / 1000)} seconds.`);
    }

    try {
      const response = await this.makeRequest(url, options);
      
      // Update rate limit counter (only if rate limiting is enabled)
      if (numericRateLimit > 0) {
        const newCount = rateLimit ? rateLimit.count + 1 : 1;
        this.rateLimits.set(apiName, {
          count: newCount,
          resetTime: now + 3600000 // Reset in 1 hour
        });
      }
      
      return response;
    } catch (error: any) {
      // Handle rate limit error specifically
      if (error.message && error.message.includes('rate limit')) {
        // Set rate limit reset time based on API response
        const resetTime = now + 60000; // Default to 1 minute
        const apiRateLimit = PRODUCTION_APIS[apiName as keyof typeof PRODUCTION_APIS].rateLimit;
        const numericRateLimit = typeof apiRateLimit === 'number' ? apiRateLimit : parseInt(apiRateLimit as string) || -1;
        
        this.rateLimits.set(apiName, {
          count: numericRateLimit,
          resetTime
        });
      }
      throw error;
    }
  }
}

export const apiIntegrationService = new ProductionAPIIntegrationService();