const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve('num-data.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const zodiacMap = {
    rat: '鼠', ox: '牛', tiger: '虎', rabbit: '兔', dragon: '龙', snake: '蛇',
    horse: '马', goat: '羊', monkey: '猴', rooster: '鸡', dog: '狗', pig: '猪'
};

const attributes = {
    poultryBeast: { '家禽': ['牛','马','羊','鸡','狗','猪'], '野兽': ['鼠','虎','兔','龙','蛇','猴'] },
    luckiness: { '吉美': ['兔','龙','蛇','马','羊','鸡'], '凶丑': ['鼠','牛','虎','猴','狗','猪'] },
    yinYang: { '阴性': ['鼠','龙','蛇','马','狗','猪'], '阳性': ['牛','虎','兔','羊','猴','鸡'] },
    stroke: { '单笔': ['鼠','龙','马','蛇','鸡','猪'], '双笔': ['虎','猴','狗','兔','羊','牛'] },
    skyEarth: { '天肖': ['兔','马','猴','猪','牛','龙'], '地肖': ['蛇','羊','鸡','狗','鼠','虎'] },
    ziBianHuaZhong: { '自边': ['鼠','牛','虎','鸡','狗','猪'], '画中': ['兔','龙','蛇','马','羊','猴'] },
    gender: { '女肖': ['兔','蛇','羊','鸡','猪'], '男肖': ['鼠','牛','虎','龙','马','猴','狗'] },
    threeHarmony: {
        '鼠龙猴': ['鼠','龙','猴'],
        '牛蛇鸡': ['牛','蛇','鸡'],
        '虎马狗': ['虎','马','狗'],
        '兔羊猪': ['兔','羊','猪']
    },
    sixHarmony: {
        '鼠牛': ['鼠','牛'],
        '龙鸡': ['龙','鸡'],
        '虎猪': ['虎','猪'],
        '蛇猴': ['蛇','猴'],
        '兔狗': ['兔','狗'],
        '马羊': ['马','羊']
    },
    fourArts: {
        '琴': ['兔','蛇','鸡'],
        '棋': ['鼠','牛','狗'],
        '书': ['虎','龙','马'],
        '画': ['羊','猴','猪']
    },
    zodiacColor: {
        '红肖': ['马','兔','鼠','鸡'],
        '蓝肖': ['蛇','虎','猪','猴'],
        '绿肖': ['羊','龙','牛','狗']
    },
    season: {
        '春天': ['兔','虎','龙'],
        '夏天': ['马','蛇','羊'],
        '秋天': ['鸡','猴','狗'],
        '冬天': ['鼠','猪','牛']
    }
};

const directionMap = {
    '春天': '东方',
    '夏天': '南方',
    '秋天': '西方',
    '冬天': '北方'
};

const fiveFuList = ['鼠', '虎', '兔', '蛇', '猴', '龙'];

data.forEach(item => {
    const zEn = item.chineseZodiac;
    const zCn = zodiacMap[zEn];
    
    if (!zCn) return;

    // Apply attributes
    for (const [key, map] of Object.entries(attributes)) {
        for (const [val, list] of Object.entries(map)) {
            if (list.includes(zCn)) {
                item[key] = val;
                break;
            }
        }
    }
    
    // Direction based on Season
    if (item.season) {
        item.direction = directionMap[item.season];
    }

    // Five Fu
    item.fiveFu = fiveFuList.includes(zCn) ? "true" : "false";
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log('Successfully updated num-data.json with integrated data.');
