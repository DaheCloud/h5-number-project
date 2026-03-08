const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---

const OUTPUT_FILE = path.join(__dirname, '../src/data/data.json');

// 纳音五行表 (60甲子)
const NA_YIN = {
  "甲子": "金", "乙丑": "金", "丙寅": "火", "丁卯": "火", "戊辰": "木", "己巳": "木",
  "庚午": "土", "辛未": "土", "壬申": "金", "癸酉": "金", "甲戌": "火", "乙亥": "火",
  "丙子": "水", "丁丑": "水", "戊寅": "土", "己卯": "土", "庚辰": "金", "辛巳": "金",
  "壬午": "木", "癸未": "木", "甲申": "水", "乙酉": "水", "丙戌": "土", "丁亥": "土",
  "戊子": "火", "己丑": "火", "庚寅": "木", "辛卯": "木", "壬辰": "水", "癸巳": "水",
  "甲午": "金", "乙未": "金", "丙申": "火", "丁酉": "火", "戊戌": "木", "己亥": "木",
  "庚子": "土", "辛丑": "土", "壬寅": "金", "癸卯": "金", "甲辰": "火", "乙巳": "火",
  "丙午": "水", "丁未": "水", "戊申": "土", "己酉": "土", "庚戌": "金", "辛亥": "金",
  "壬子": "木", "癸丑": "木", "甲寅": "水", "乙卯": "水", "丙辰": "土", "丁巳": "土",
  "戊午": "火", "己未": "火", "庚申": "木", "辛酉": "木", "壬戌": "水", "癸亥": "水"
};

const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ZODIAC_MAP = { "子": "鼠", "丑": "牛", "寅": "虎", "卯": "兔", "辰": "龙", "巳": "蛇", "午": "马", "未": "羊", "申": "猴", "酉": "鸡", "戌": "狗", "亥": "猪" };

// 波色表
const COLOR_WAVES = {
    "红": [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
    "蓝": [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
    "绿": [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]
};

// 生肖静态属性
const ZODIAC_STATIC_ATTRS = {
    "家禽": ["牛", "马", "羊", "鸡", "狗", "猪"],
    "野兽": ["鼠", "虎", "兔", "龙", "蛇", "猴"],
    "单笔": ["鼠", "龙", "马", "蛇", "鸡", "猪"],
    "双笔": ["虎", "猴", "狗", "兔", "羊", "牛"],
    "女肖": ["兔", "蛇", "羊", "鸡", "猪", "（五宫肖）"],
    "男肖": ["鼠", "牛", "虎", "龙", "马", "猴", "狗"],
    "吉美": ["兔", "龙", "蛇", "马", "羊", "鸡"],
    "凶丑": ["鼠", "牛", "虎", "猴", "狗", "猪"],
    "天肖": ["兔", "马", "猴", "猪", "牛", "龙"],
    "地肖": ["蛇", "羊", "鸡", "狗", "鼠", "虎"],
    "阴性": ["鼠", "龙", "蛇", "马", "狗", "猪"],
    "阳性": ["牛", "虎", "兔", "羊", "猴", "鸡"],
    "白边": ["鼠", "牛", "虎", "鸡", "狗", "猪"],
    "黑中": ["兔", "龙", "蛇", "马", "羊", "猴"],
    "五福肖": ["鼠", "虎", "兔", "蛇", "猴（龙）"],
    // 色肖 (固定属性)
    "红肖": ["马", "兔", "鼠", "鸡"],
    "蓝肖": ["蛇", "虎", "猪", "猴"],
    "绿肖": ["羊", "龙", "牛", "狗"]
};

const ZODIAC_COMBOS = {
    "三合": [["鼠", "龙", "猴"], ["牛", "蛇", "鸡"], ["虎", "马", "狗"], ["兔", "羊", "猪"]],
    "六合": [["鼠", "牛"], ["龙", "鸡"], ["虎", "猪"], ["蛇", "猴"], ["兔", "狗"], ["马", "羊"]],
    "琴": [["兔", "蛇", "鸡"]],
    "棋": [["鼠", "牛", "狗"]],
    "书": [["虎", "龙", "马"]],
    "画": [["羊", "猴", "猪"]]
};

// --- HELPER FUNCTIONS ---

function getGanZhi(year) {
    const base = 1924; // 甲子
    const diff = (year - base) % 60;
    const offset = diff >= 0 ? diff : diff + 60;
    const gan = GAN[offset % 10];
    const zhi = ZHI[offset % 12];
    return { name: gan + zhi, zhi: zhi };
}

function getAttributes(num, currentYear) {
    // 规则: 数字 N 对应的年份 = CurrentYear - (N - 1)
    // 例如: 今年2026(马). 1号 -> 2026(马). 2号 -> 2025(蛇).
    const targetYear = currentYear - (num - 1);
    const gz = getGanZhi(targetYear);
    const zodiac = ZODIAC_MAP[gz.zhi];
    const wuxing = NA_YIN[gz.name];
    
    // Wave
    let wave = "红";
    for (const color in COLOR_WAVES) {
        if (COLOR_WAVES[color].includes(num)) {
            wave = color;
            break;
        }
    }

    return { num, zodiac, wuxing, wave };
}

// --- MAIN ---

function generate(year) {
    console.log(`Generating data for year: ${year} (${getGanZhi(year).name})...`);
    
    const result = {
        "生肖": {},
        "五行": {},
        "波色": {},
        "五门": {},
        "段位": {},
        "合数": {},
        "合单双": {},
        "其它属性": {}
    };

    // Initialize keys for consistency (optional, but good for structure)
    Object.values(ZODIAC_MAP).forEach(z => result["生肖"][z] = []);
    ["金", "木", "水", "火", "土"].forEach(w => result["五行"][w] = []);
    ["红", "蓝", "绿"].forEach(c => result["波色"][c] = []);

    for (let i = 1; i <= 49; i++) {
        const { zodiac, wuxing, wave } = getAttributes(i, year);

        // Fill categories
        result["生肖"][zodiac].push(i);
        result["五行"][wuxing].push(i);
        result["波色"][wave].push(i);

        // 五门
        let men = "";
        if (i <= 9) men = "1门";
        else if (i <= 18) men = "2门";
        else if (i <= 27) men = "3门";
        else if (i <= 37) men = "4门";
        else men = "5门";
        if (!result["五门"][men]) result["五门"][men] = [];
        result["五门"][men].push(i);

        // 段位
        const duan = Math.ceil(i / 7) + "段";
        if (!result["段位"][duan]) result["段位"][duan] = [];
        result["段位"][duan].push(i);

        // 合数
        const sum = Math.floor(i / 10) + (i % 10);
        const he = "合" + (sum < 10 ? "0" + sum : sum);
        if (!result["合数"][he]) result["合数"][he] = [];
        result["合数"][he].push(i);

        // 合单双
        const heDS = sum % 2 === 0 ? "双" : "单";
        if (!result["合单双"][heDS]) result["合单双"][heDS] = [];
        result["合单双"][heDS].push(i);
    }

    // Static Attributes
    for (const key in ZODIAC_STATIC_ATTRS) {
        result["其它属性"][key] = ZODIAC_STATIC_ATTRS[key];
    }
    // Combo Attributes
    for (const key in ZODIAC_COMBOS) {
        result["其它属性"][key] = ZODIAC_COMBOS[key].map(arr => arr.join("")); // Format as "鼠龙猴"
    }

    // Sort arrays
    const sortFn = (a, b) => a - b;
    for (const cat in result) {
        if (cat === "其它属性") continue;
        for (const key in result[cat]) {
            result[cat][key].sort(sortFn);
        }
    }

    return result;
}

// Check arguments
const args = process.argv.slice(2);
const year = args[0] ? parseInt(args[0]) : new Date().getFullYear();

const data = generate(year);

// Validate against existing if needed, or just write
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log(`Data generated successfully at ${OUTPUT_FILE}`);
