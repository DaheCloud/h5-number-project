import rawData from '../data/data.json';

// Types
export type ZodiacKey = 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig';
export type WuxingKey = 'metal' | 'wood' | 'water' | 'fire' | 'earth';
export type WaveKey = 'red' | 'blue' | 'green';
export type OddEvenKey = 'odd' | 'even';
export type BigSmallKey = 'big' | 'small';

export interface LotteryNumber {
  id: number;
  zodiac: { key: ZodiacKey; label: string };
  wuxing: { key: WuxingKey; label: string };
  wave: { key: WaveKey; label: string };
  men: string; // "1门"
  duan: string; // "1段"
  heShu: string; // "合01"
  heDanShuang: string; // "单" or "双"
  // Derived properties for convenience
  oddAndEven: OddEvenKey;
  sumOddAndEven: OddEvenKey; // "oddSum" or "evenSum" in original code, but let's normalize
  head: number;
  tail: number;
}

// Mappings
const ZODIAC_MAP: Record<string, ZodiacKey> = {
  '鼠': 'rat', '牛': 'ox', '虎': 'tiger', '兔': 'rabbit', '龙': 'dragon', '蛇': 'snake',
  '马': 'horse', '羊': 'goat', '猴': 'monkey', '鸡': 'rooster', '狗': 'dog', '猪': 'pig',
};

const WUXING_MAP: Record<string, WuxingKey> = {
  '金': 'metal', '木': 'wood', '水': 'water', '火': 'fire', '土': 'earth',
};

const WAVE_MAP: Record<string, WaveKey> = {
  '红': 'red', '蓝': 'blue', '绿': 'green',
};

// Singleton Service
class LotteryDataService {
  private numbers: LotteryNumber[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    try {
      // Validation basic structure
      if (!rawData || !rawData['生肖'] || !rawData['五行'] || !rawData['波色']) {
        console.error('Data source is missing required categories');
        return;
      }

      // Initialize map for 49 numbers
      const map = new Map<number, Partial<LotteryNumber>>();
      for (let i = 1; i <= 49; i++) {
        map.set(i, { id: i });
      }

      // Populate data from JSON categories
      this.populateCategory(rawData['生肖'], (id, key) => {
        const enKey = ZODIAC_MAP[key];
        if (enKey) map.get(id)!.zodiac = { key: enKey, label: key };
      });

      this.populateCategory(rawData['五行'], (id, key) => {
        const enKey = WUXING_MAP[key];
        if (enKey) map.get(id)!.wuxing = { key: enKey, label: key };
      });

      this.populateCategory(rawData['波色'], (id, key) => {
        const enKey = WAVE_MAP[key];
        if (enKey) map.get(id)!.wave = { key: enKey, label: key };
      });
      
      this.populateCategory(rawData['五门'], (id, key) => {
        map.get(id)!.men = key;
      });

      this.populateCategory(rawData['段位'], (id, key) => {
        map.get(id)!.duan = key;
      });

      this.populateCategory(rawData['合数'], (id, key) => {
        map.get(id)!.heShu = key;
      });

      this.populateCategory(rawData['合单双'], (id, key) => {
        map.get(id)!.heDanShuang = key;
      });

      // Finalize and calculate derived props
      this.numbers = Array.from(map.values()).map(n => {
        if (!n.zodiac || !n.wuxing || !n.wave) {
          console.warn(`Number ${n.id} is missing core attributes`, n);
          // Fallback
          return {
            id: n.id!,
            zodiac: n.zodiac || { key: 'rat', label: '鼠' },
            wuxing: n.wuxing || { key: 'metal', label: '金' },
            wave: n.wave || { key: 'red', label: '红' },
            men: n.men || '',
            duan: n.duan || '',
            heShu: n.heShu || '',
            heDanShuang: n.heDanShuang || '',
            oddAndEven: (n.id! % 2 !== 0) ? 'odd' : 'even',
            sumOddAndEven: this.getSumOddEven(n.id!),
            head: Math.floor(n.id! / 10),
            tail: n.id! % 10
          } as LotteryNumber;
        }
        
        return {
            ...n,
            oddAndEven: (n.id! % 2 !== 0) ? 'odd' : 'even',
            sumOddAndEven: this.getSumOddEven(n.id!),
            head: Math.floor(n.id! / 10),
            tail: n.id! % 10
        } as LotteryNumber;
      }).sort((a, b) => a.id - b.id);

      this.initialized = true;
      console.log('Lottery Data Service Initialized', this.numbers.length);

    } catch (e) {
      console.error('Failed to initialize Lottery Data Service', e);
    }
  }

  private populateCategory(data: Record<string, number[]>, callback: (id: number, key: string) => void) {
    for (const [key, ids] of Object.entries(data)) {
      if (Array.isArray(ids)) {
        ids.forEach(id => {
            if (id >= 1 && id <= 49) callback(id, key);
        });
      }
    }
  }

  private getSumOddEven(id: number): OddEvenKey {
    const sum = Math.floor(id / 10) + (id % 10);
    return sum % 2 !== 0 ? 'odd' : 'even';
  }

  public getAllNumbers(): LotteryNumber[] {
    return this.numbers;
  }

  public getNumber(id: number): LotteryNumber | undefined {
    return this.numbers.find(n => n.id === id);
  }
  
  public getZodiacOptions() {
      // Return ordered list based on current year logic or just standard order
      // Ideally this order should come from the data source if "year" matters for ordering
      // For now, return standard map + raw keys
      return Object.entries(ZODIAC_MAP).map(([label, key]) => ({ key, label }));
  }

  public getRawData() {
      return rawData;
  }
}

export const lotteryDataService = new LotteryDataService();
