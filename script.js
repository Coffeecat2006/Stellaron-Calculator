// 全局變量
let characterData = [];
let lightconeData = [];
let relicData = [];
let statData = [];
let lightconeDescData = [];
let instrumentDescData = [];

// 初始化應用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // 載入所有數據
        await loadAllData();
        
        // 初始化UI
        initializeUI();
        
        // 綁定事件
        bindEvents();
        
        console.log('應用初始化完成');
    } catch (error) {
        console.error('初始化失敗:', error);
        alert('數據載入失敗，請檢查CSV文件是否存在');
    }
}

// 載入所有數據
async function loadAllData() {
    characterData = await loadCSV('assets/data/角色資料.csv');
    lightconeData = await loadCSV('assets/data/光錐資料.csv');
    relicData = await loadCSV('assets/data/儀器資料.csv');
    statData = await loadCSV('assets/data/儀器詞條資料.csv');
    lightconeDescData = await loadCSV('assets/data/光錐敘述.csv');
    instrumentDescData = await loadCSV('assets/data/儀器敘述.csv');
}

// 載入CSV文件
async function loadCSV(filename) {
    try {
        const response = await fetch(filename);
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error(`載入 ${filename} 失敗:`, error);
        return [];
    }
}

// 解析CSV
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // 正確解析CSV，處理包含逗號的欄位值
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }
    
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        
        data.push(row);
    }
    
    return data;
}

// 初始化UI
function initializeUI() {
    populateCharacterSelect();
    populateLightconeSelect();
    populateRelicSelects();
    populateStatOptions();
    // 隱藏角色和光錐資訊區域
    const characterInfo = document.querySelector('.character-config-info');
    const lightconeInfo = document.querySelector('.lightcone-config-info');
    if (characterInfo) characterInfo.style.display = 'none';
    if (lightconeInfo) lightconeInfo.style.display = 'none';
    // 頁面載入時也更新一次角色和光錐資訊
    updateCharacterData();
    updateLightconeData();
}

// 填充角色選擇
function populateCharacterSelect() {
    const select = document.getElementById('character-select');
    select.innerHTML = '<option value="">請選擇角色</option>';
    
    characterData.forEach(character => {
        if (character.角色 && character.角色.trim()) {
            const option = document.createElement('option');
            option.value = character.角色;
            option.textContent = character.角色;
            select.appendChild(option);
        }
    });
}

// 填充光錐選擇
function populateLightconeSelect() {
    const select = document.getElementById('lightcone-select');
    select.innerHTML = '<option value="">請選擇光錐</option>';
    
    lightconeData.forEach(lightcone => {
        if (lightcone.光錐 && lightcone.光錐.trim()) {
            const option = document.createElement('option');
            option.value = lightcone.光錐;
            option.textContent = lightcone.光錐;
            select.appendChild(option);
        }
    });
}

// 填充儀器選擇
function populateRelicSelects() {
    const outerRelic1 = document.getElementById('outer-relic-1');
    const outerRelic2 = document.getElementById('outer-relic-2');
    const innerRelic = document.getElementById('inner-relic');
    
    // 清空選項
    outerRelic1.innerHTML = '<option value="">請選擇外圈儀器1</option>';
    outerRelic2.innerHTML = '<option value="">請選擇外圈儀器2 (可選)</option>';
    innerRelic.innerHTML = '<option value="">請選擇內圈儀器</option>';
    
    relicData.forEach(relic => {
        if (relic.儀器 && relic.儀器.trim()) {
            // 外圈儀器
            if (relic.種類 === '外圈') {
                const option1 = document.createElement('option');
                option1.value = relic.儀器;
                option1.textContent = relic.儀器;
                outerRelic1.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = relic.儀器;
                option2.textContent = relic.儀器;
                outerRelic2.appendChild(option2);
            }
            
            // 內圈儀器
            if (relic.種類 === '內圈') {
                const option3 = document.createElement('option');
                option3.value = relic.儀器;
                option3.textContent = relic.儀器;
                innerRelic.appendChild(option3);
            }
        }
    });
}

// 填充詞條選項
function populateStatOptions() {
    const mainStatOptions = {
        'head': ['HP'],
        'hands': ['ATK'],
        'body': ['HP%', 'ATK%', 'DEF%', '暴擊率', '暴擊傷害', '治療量加成', '效果命中'],
        'feet': ['HP%', 'ATK%', 'DEF%', '速度'],
        'sphere': ['HP%', 'ATK%', 'DEF%', '元素傷害加成'],
        'rope': ['HP%', 'ATK%', 'DEF%', '擊破特攻', '能量恢復效率']
    };
    
    const mainStatValues = {
        'HP': 705,
        'ATK': 352,
        'HP%': 43.2,
        'ATK%': 43.2,
        'DEF%': 54,
        '暴擊率': 32.4,
        '暴擊傷害': 64.8,
        '治療量加成': 34.5,
        '效果命中': 43.2,
        '速度': 25,
        '元素傷害加成': 38.8,
        '擊破特攻': 64.8,
        '能量恢復效率': 19.4
    };
    
    const subStatOptions = [
        '固定HP', '固定ATK', 'HP%', 'ATK%', 'DEF%', 
        '暴擊率', '暴擊傷害', '效果命中', '效果抵抗', '擊破特攻', '速度'
    ];
    
    // 填充主詞條選項
    Object.keys(mainStatOptions).forEach(piece => {
        const select = document.querySelector(`[data-piece="${piece}"] .main-stat-select`);
        const input = document.querySelector(`[data-piece="${piece}"] .main-stat-value`);
        if (select) {
            select.innerHTML = '<option value="">請選擇主詞條</option>';
            mainStatOptions[piece].forEach(stat => {
                const option = document.createElement('option');
                option.value = stat;
                option.textContent = stat;
                select.appendChild(option);
            });
            
            // 頭部和手部預設主詞條並預設數值
            if (piece === 'head') {
                select.value = 'HP';
                if (input) {
                    input.value = mainStatValues['HP'];
                }
            } else if (piece === 'hands') {
                select.value = 'ATK';
                if (input) {
                    input.value = mainStatValues['ATK'];
                }
            }
            
            // 為所有部位的主詞條選擇添加事件監聽器
            select.addEventListener('change', function() {
                const selectedValue = this.value;
                if (selectedValue && mainStatValues[selectedValue]) {
                    input.value = mainStatValues[selectedValue];
                } else {
                    input.value = '';
                }
            });
        }
    });
    
    // 填充副詞條選項
    document.querySelectorAll('.sub-stat-type').forEach(select => {
        select.innerHTML = '<option value="">請選擇副詞條類型</option>';
        subStatOptions.forEach(stat => {
            const option = document.createElement('option');
            option.value = stat;
            option.textContent = stat;
            select.appendChild(option);
        });
    });
}

// 綁定事件
function bindEvents() {
    document.getElementById('calculate-btn').addEventListener('click', calculateDamage);
    // 角色選擇變化時更新相關數據
    document.getElementById('character-select').addEventListener('change', updateCharacterData);
    document.getElementById('eidolon-select').addEventListener('change', updateCharacterData);
    document.getElementById('lightcone-select').addEventListener('change', updateLightconeData);
    document.getElementById('superimpose-select').addEventListener('change', updateLightconeData);
    document.getElementById('outer-relic-1').addEventListener('change', updateInstrumentInfo);
    document.getElementById('outer-relic-2').addEventListener('change', updateInstrumentInfo);
    document.getElementById('inner-relic').addEventListener('change', updateInstrumentInfo);
    // 頁面載入時也更新一次光錐資訊
    updateLightconeData();
    updateInstrumentInfo();
}

// 更新角色數據並顯示角色資訊
function updateCharacterData() {
    const characterName = document.getElementById('character-select').value;
    const eidolon = parseInt(document.getElementById('eidolon-select').value);
    const infoBlock = document.querySelector('.character-config-info');
    if (characterName) {
        const character = characterData.find(c => c.角色 === characterName);
        if (character) {
            // 頭像
            const avatar = document.getElementById('character-avatar');
            avatar.src = `assets/img/characters/${characterName}.png`;
            avatar.style.display = '';
            // 角色資訊
            document.getElementById('char-info-path').textContent = character.命途 || '';
            document.getElementById('char-info-element').textContent = character.屬性 || '';
            document.getElementById('char-info-star').textContent = character.星數 || '';
            document.getElementById('char-info-hp').textContent = character.生命值 || '';
            document.getElementById('char-info-atk').textContent = character.攻擊力 || '';
            document.getElementById('char-info-def').textContent = character.防禦力 || '';
            document.getElementById('char-info-speed').textContent = character.速度 || '';
            document.getElementById('char-info-energy').textContent = character.能量上限 || '';
            document.getElementById('char-info-version').textContent = character.推出版本 || '';
            infoBlock.style.display = 'flex';
        } else {
            infoBlock.style.display = 'none';
        }
    } else {
        infoBlock.style.display = 'none';
    }
}

// 更新光錐數據並顯示光錐資訊
function updateLightconeData() {
    const lightconeName = document.getElementById('lightcone-select').value;
    const superimpose = parseInt(document.getElementById('superimpose-select').value);
    const infoBlock = document.querySelector('.lightcone-config-info');
    const descElem = document.getElementById('lc-info-desc');
    if (lightconeName) {
        const lightcone = lightconeData.find(l => l.光錐 === lightconeName);
        const descRow = lightconeDescData.find(l => l.光錐 === lightconeName);
        if (lightcone) {
            // 頭像
            const avatar = document.getElementById('lightcone-avatar');
            avatar.onerror = function() {
                // 若png不存在，嘗試jpg
                if (!this.src.endsWith('.jpg')) {
                    this.src = `assets/img/light_cone/${lightconeName}.jpg`;
                } else {
                    this.style.display = 'none';
                }
            };
            avatar.src = `assets/img/light_cone/${lightconeName}.png`;
            avatar.style.display = '';
            // 資訊
            document.getElementById('lc-info-path').textContent = lightcone.命途 || '';
            document.getElementById('lc-info-star').textContent = lightcone.星數 || '';
            document.getElementById('lc-info-hp').textContent = lightcone['生命值白值'] || '';
            document.getElementById('lc-info-atk').textContent = lightcone['攻擊力白值'] || '';
            document.getElementById('lc-info-def').textContent = lightcone['防禦力白值'] || '';
            descElem.textContent = descRow ? descRow.敘述 : '';
            infoBlock.style.display = 'flex';
        } else {
            infoBlock.style.display = 'none';
            descElem.textContent = '';
        }
    } else {
        infoBlock.style.display = 'none';
        descElem.textContent = '';
    }
}

// 更新儀器敘述與圖片
function updateInstrumentInfo() {
    const outer1 = document.getElementById('outer-relic-1').value;
    const outer2 = document.getElementById('outer-relic-2').value;
    const inner = document.getElementById('inner-relic').value;
    const infoBlock = document.getElementById('instrument-info-block');
    const imgList = document.getElementById('instrument-img-list');
    const descList = document.getElementById('instrument-desc-list');
    imgList.innerHTML = '';
    descList.innerHTML = '';
    let show = false;
    // 儲存已顯示過的儀器，避免重複
    const shown = new Set();
    // 外圈1
    if (outer1) {
        const a = instrumentDescData.find(i => i.儀器 === outer1);
        if (a) {
            imgList.innerHTML += `<img src="assets/img/instrument/${outer1}.png" alt="${outer1}">`;
            descList.innerHTML += `<div><span class='instrument-desc-title'>兩件套效果</span>${a['2P敘述']||''}</div>`;
            shown.add(outer1);
            show = true;
        }
    }
    // 外圈2
    if (outer2 && outer2 !== outer1) {
        const b = instrumentDescData.find(i => i.儀器 === outer2);
        if (b) {
            imgList.innerHTML += `<img src="assets/img/instrument/${outer2}.png" alt="${outer2}">`;
            descList.innerHTML += `<div><span class='instrument-desc-title'>兩件套效果</span>${b['2P敘述']||''}</div>`;
            shown.add(outer2);
            show = true;
        }
    }
    // 內圈
    if (inner) {
        const c = instrumentDescData.find(i => i.儀器 === inner);
        if (c) {
            imgList.innerHTML += `<img src="assets/img/instrument/${inner}.png" alt="${inner}">`;
            descList.innerHTML += `<div><span class='instrument-desc-title'>兩件套效果</span>${c['2P敘述']||''}</div>`;
            shown.add(inner);
            show = true;
        }
    }
    // 如果外圈1和外圈2相同且有選，顯示四件套
    if (outer1 && outer2 && outer1 === outer2) {
        const a = instrumentDescData.find(i => i.儀器 === outer1);
        if (a) {
            descList.innerHTML += `<div><span class='instrument-desc-title'>四件套效果</span>${a['4P敘述']||''}</div>`;
            show = true;
        }
    }
    infoBlock.style.display = show ? 'flex' : 'none';
}

// 收集儀器詞條數據
function collectRelicStats() {
    const stats = {
        head: { main: {}, sub: [] },
        hands: { main: {}, sub: [] },
        body: { main: {}, sub: [] },
        feet: { main: {}, sub: [] },
        sphere: { main: {}, sub: [] },
        rope: { main: {}, sub: [] }
    };
    
    Object.keys(stats).forEach(piece => {
        const pieceElement = document.querySelector(`[data-piece="${piece}"]`);
        if (pieceElement) {
            // 主詞條
            const mainType = pieceElement.querySelector('.main-stat-select').value;
            const mainValue = parseFloat(pieceElement.querySelector('.main-stat-value').value) || 0;
            if (mainType) {
                stats[piece].main = { type: mainType, value: mainValue };
            }
            
            // 副詞條
            pieceElement.querySelectorAll('.sub-stat').forEach((subStat, index) => {
                const subType = subStat.querySelector('.sub-stat-type').value;
                const subValue = parseFloat(subStat.querySelector('.sub-stat-value').value) || 0;
                if (subType) {
                    stats[piece].sub.push({ type: subType, value: subValue });
                }
            });
        }
    });
    
    return stats;
}

// 收集配置數據
function collectConfiguration() {
    // 收集選中的敵人弱點
    const selectedWeaknesses = [];
    document.querySelectorAll('.weakness-checkbox:checked').forEach(checkbox => {
        selectedWeaknesses.push(checkbox.value);
    });

    return {
        character: {
            name: document.getElementById('character-select').value,
            eidolon: parseInt(document.getElementById('eidolon-select').value)
        },
        lightcone: {
            name: document.getElementById('lightcone-select').value,
            superimpose: parseInt(document.getElementById('superimpose-select').value)
        },
        relics: {
            outer1: document.getElementById('outer-relic-1').value,
            outer2: document.getElementById('outer-relic-2').value,
            inner: document.getElementById('inner-relic').value
        },
        attackType: document.getElementById('attack-type').value,
        enemy: {
            level: parseInt(document.getElementById('enemy-level').value) || 90,
            resistance: parseFloat(document.getElementById('enemy-resistance').value) || 0,
            weaknesses: selectedWeaknesses,
            toughnessBroken: document.getElementById('toughness-broken').value === 'true'
        },
        relicStats: collectRelicStats()
    };
}

// 計算傷害
function calculateDamage() {
    const config = collectConfiguration();
    
    // 驗證輸入
    if (!validateInput(config)) {
        return;
    }
    
    try {
        // 獲取角色數據
        const character = characterData.find(c => c.角色 === config.character.name);
        if (!character) {
            alert('無法找到角色數據');
            return;
        }
        
        // 獲取光錐數據（如果選擇了的話）
        let lightcone = null;
        if (config.lightcone.name) {
            lightcone = lightconeData.find(l => l.光錐 === config.lightcone.name);
            if (!lightcone) {
                alert('無法找到光錐數據');
                return;
            }
        }
        
        // 計算各項數值
        const stats = calculateStats(config, character, lightcone);
        
        // 計算最終傷害
        const damageResult = calculateFinalDamage(config, stats);
        
        // 顯示結果
        displayResults(damageResult.damage, stats, damageResult.actualResistance);
        
    } catch (error) {
        console.error('計算錯誤:', error);
        alert('計算過程中發生錯誤: ' + error.message);
    }
}

// 驗證輸入
function validateInput(config) {
    if (!config.character.name) {
        alert('請選擇角色');
        return false;
    }
    if (!config.attackType) {
        alert('請選擇攻擊類型');
        return false;
    }
    return true;
}

// 獲取光錐效果加成
function getLightconeEffects(lightcone, superimpose, attackType) {
    const effects = {
        atkBonus: 0,
        dmgBonus: 0,
        critRate: 0,
        critDmg: 0,
        defReduction: 0,
        vulnerability: 0
    };
    
    if (!lightcone) return effects;
    
    // 根據疊影等級獲取對應的效果
    const superimposeIndex = Math.min(superimpose - 1, 4); // S1-S5 對應索引 0-4
    

    
    // 攻擊力加成（攻擊力欄位）
    if (lightcone['攻擊力'] && lightcone['攻擊力'] !== '0' && lightcone['攻擊力'] !== '0%') {
        const atkValues = lightcone['攻擊力'].split('/');
        if (atkValues[superimposeIndex]) {
            effects.atkBonus += parseFloat(atkValues[superimposeIndex].replace('%', '')) || 0;
        }
    }
    
    // 增攻效果（根據攻擊類型）
    if (lightcone['增攻'] && lightcone['增攻'] !== '0' && lightcone['增攻'] !== '0%') {
        const atkValues = lightcone['增攻'].split('/');
        if (atkValues[superimposeIndex]) {
            // 檢查增攻類型是否匹配當前攻擊類型
            const atkType = lightcone['增攻類型'];
            if (isAttackTypeMatch(atkType, attackType)) {
                effects.atkBonus += parseFloat(atkValues[superimposeIndex].replace('%', '')) || 0;
            }
        }
    }
    
    // 增傷效果（根據攻擊類型）
    if (lightcone['增傷'] && lightcone['增傷'] !== '0' && lightcone['增傷'] !== '0%') {
        const dmgValues = lightcone['增傷'].split('/');
        if (dmgValues[superimposeIndex]) {
            // 檢查增傷類型是否匹配當前攻擊類型
            const dmgType = lightcone['增傷類型'];

            if (isAttackTypeMatch(dmgType, attackType)) {
                effects.dmgBonus += parseFloat(dmgValues[superimposeIndex].replace('%', '')) || 0;
            }
        }
    }
    
    // 暴擊率加成
    if (lightcone['爆擊率'] && lightcone['爆擊率'] !== '0' && lightcone['爆擊率'] !== '0%') {
        const critRateValues = lightcone['爆擊率'].split('/');
        if (critRateValues[superimposeIndex]) {
            effects.critRate += parseFloat(critRateValues[superimposeIndex].replace('%', '')) || 0;
        }
    }
    
    // 暴擊傷害加成
    if (lightcone['爆擊傷害'] && lightcone['爆擊傷害'] !== '0' && lightcone['爆擊傷害'] !== '0%') {
        const critDmgValues = lightcone['爆擊傷害'].split('/');
        if (critDmgValues[superimposeIndex]) {
            effects.critDmg += parseFloat(critDmgValues[superimposeIndex].replace('%', '')) || 0;
        }
    }
    
    // 減防效果（根據攻擊類型）
    if (lightcone['減防'] && lightcone['減防'] !== '0' && lightcone['減防'] !== '0%') {
        const defValues = lightcone['減防'].split('/');
        if (defValues[superimposeIndex]) {
            // 檢查減防類型是否匹配當前攻擊類型
            const defType = lightcone['減防類型'];
            if (isAttackTypeMatch(defType, attackType)) {
                effects.defReduction += parseFloat(defValues[superimposeIndex].replace('%', '')) || 0;
            }
        }
    }
    
    // 抗穿效果（根據攻擊類型）
    if (lightcone['抗穿'] && lightcone['抗穿'] !== '0' && lightcone['抗穿'] !== '0%') {
        const vulnValues = lightcone['抗穿'].split('/');
        if (vulnValues[superimposeIndex]) {
            // 檢查抗穿類型是否匹配當前攻擊類型
            const vulnType = lightcone['抗穿類型'];
            if (isAttackTypeMatch(vulnType, attackType)) {
                effects.vulnerability += parseFloat(vulnValues[superimposeIndex].replace('%', '')) || 0;
            }
        }
    }
    

    return effects;
}

// 檢查攻擊類型是否匹配
function isAttackTypeMatch(effectType, attackType) {
    if (!effectType || !attackType) return false;
    
    // 將攻擊類型映射到效果類型
    const typeMapping = {
        '普攻': '普通攻擊',
        '強化普攻': '普通攻擊',
        '戰技': '戰技',
        '強化戰技': '戰技',
        '終結技': '終結技',
        '追加攻擊': '追加攻擊'
    };
    
    const mappedAttackType = typeMapping[attackType];
    if (!mappedAttackType) return false;
    
    // 檢查效果類型是否包含映射後的攻擊類型
    return effectType.includes(mappedAttackType);
}

// 將角色行跡加成套用到stats
function applyCharacterTraces(stats, character) {
    const traceMap = [
        { key: '行跡(攻擊)', type: 'ATK%' },
        { key: '行跡(生命)', type: 'HP%' },
        { key: '行跡(防禦)', type: 'DEF%' },
        { key: '行跡(速度)', type: '速度' },
        { key: '行跡(爆率)', type: '暴擊率' },
        { key: '行跡(爆傷)', type: '暴擊傷害' },
        { key: '行跡(增傷)', type: '元素傷害加成' },
        { key: '行跡(擊破特攻)', type: '擊破特攻' },
        { key: '行跡(效果命中)', type: '效果命中' },
        { key: '行跡(效果抗性)', type: '效果抵抗' }
    ];
    traceMap.forEach(trace => {
        const val = character[trace.key];
        if (val && val !== '0' && val !== '0%') {
            addStatValue(stats, trace.type, val);
        }
    });
}

// 計算各項數值
function calculateStats(config, character, lightcone) {
    const stats = {
        baseAtk: 0,
        totalAtk: 0,
        atkBonus: 0,
        skillMultiplier: 0,
        dmgBonus: 0,
        critRate: 0,
        critDmg: 0,
        vulnerability: 0,
        defReduction: 0,
        resistanceReduction: 0
    };
    // 基礎攻擊力
    let lightconeBase = 0, lightconeHP = 0, lightconeDEF = 0;
    if (lightcone) {
        lightconeBase = parseFloat(lightcone.攻擊力白值 || 0);
        lightconeHP = parseFloat(lightcone.生命值白值 || 0);
        lightconeDEF = parseFloat(lightcone.防禦力白值 || 0);
    }
    stats.baseAtk = parseFloat(character.攻擊力 || 0) + lightconeBase;
    // 儲存基礎生命/防禦（如未來要用）
    // stats.baseHP = parseFloat(character.生命值 || 0) + lightconeHP;
    // stats.baseDEF = parseFloat(character.防禦力 || 0) + lightconeDEF;

    // 儀器詞條加成
    const relicStats = calculateRelicStats(config.relicStats);
    // 儀器效果
    const relicEffects = getRelicEffects(config.relics);
    // 行跡加成（要在加總前）
    applyCharacterTraces(relicStats, character);

    // 判斷命途
    let lightconeEffects = { atkBonus: 0, dmgBonus: 0, critRate: 0, critDmg: 0, defReduction: 0, vulnerability: 0 };
    if (lightcone && character.命途 && lightcone.命途 && character.命途 === lightcone.命途) {
        lightconeEffects = getLightconeEffects(lightcone, config.lightcone.superimpose, config.attackType);
    }
    // 攻擊力加成
    stats.atkBonus = relicStats.atkBonus + relicEffects.atkBonus + lightconeEffects.atkBonus;
    stats.totalAtk = stats.baseAtk * (1 + stats.atkBonus / 100) + relicStats.atkFlat;
    // 技能倍率
    stats.skillMultiplier = getSkillMultiplier(character, config.attackType, config.character.eidolon);
    // 增傷加成
    stats.dmgBonus = relicStats.dmgBonus + relicEffects.dmgBonus + lightconeEffects.dmgBonus;
    // 暴擊相關
    const baseCritRate = 5;
    const baseCritDmg = 50;
    stats.critRate = baseCritRate + relicStats.critRate + relicEffects.critRate + lightconeEffects.critRate;
    stats.critDmg = baseCritDmg + relicStats.critDmg + lightconeEffects.critDmg;
    // 其他加成
    stats.vulnerability = relicStats.vulnerability + relicEffects.vulnerability + lightconeEffects.vulnerability;
    stats.defReduction = relicStats.defReduction + relicEffects.defReduction + lightconeEffects.defReduction;
    stats.resistanceReduction = relicStats.resistanceReduction;
    return stats;
}

// 計算儀器詞條統計
function calculateRelicStats(relicStats) {
    const stats = {
        atkBonus: 0,
        atkFlat: 0,
        dmgBonus: 0,
        critRate: 0,
        critDmg: 0,
        vulnerability: 0,
        defReduction: 0,
        resistanceReduction: 0
    };
    
    Object.values(relicStats).forEach(piece => {
        // 主詞條
        if (piece.main.type) {
            addStatValue(stats, piece.main.type, piece.main.value);
        }
        
        // 副詞條
        piece.sub.forEach(sub => {
            addStatValue(stats, sub.type, sub.value);
        });
    });
    
    return stats;
}

// 添加數值到統計
function addStatValue(stats, type, value) {
    // 忽略空字串、0、'0'、'0%'、undefined、null
    if (value === '' || value === 0 || value === '0' || value === '0%' || value === undefined || value === null) return;
    
    // 處理數值，支援帶%和不帶%的輸入
    let numValue = 0;
    if (typeof value === 'string') {
        // 移除所有空格
        value = value.trim();
        // 如果是百分比格式，去掉%再轉換
        if (value.endsWith('%')) {
            numValue = parseFloat(value.replace('%', ''));
        } else {
            numValue = parseFloat(value);
        }
    } else {
        numValue = parseFloat(value);
    }
    
    // 檢查轉換後的數值是否有效
    if (isNaN(numValue) || numValue === 0) return;
    
    switch (type) {
        case 'ATK%':
            stats.atkBonus += numValue;
            break;
        case '固定ATK':
            stats.atkFlat += numValue;
            break;
        case '暴擊率':
            stats.critRate += numValue;
            break;
        case '暴擊傷害':
            stats.critDmg += numValue;
            break;
        case '元素傷害加成':
            stats.dmgBonus += numValue;
            break;
        case 'HP%':
            // 可以添加生命值相關計算
            break;
        case 'DEF%':
            // 可以添加防禦值相關計算
            break;
        case '速度':
            // 可以添加速度相關計算
            break;
        case '擊破特攻':
            // 可以添加擊破特攻相關計算
            break;
        case '效果命中':
            // 可以添加效果命中相關計算
            break;
        case '效果抵抗':
            // 可以添加效果抵抗相關計算
            break;
        // 可以添加更多詞條類型
    }
}

// 獲取技能倍率
function getSkillMultiplier(character, attackType, eidolon) {
    let multiplier = 0;
    let arr, val;
    switch (attackType) {
        case '普攻':
            arr = character['普攻(攻擊)倍率']?.split('/') || [];
            val = arr[eidolon >= 3 ? 1 : 0];
            break;
        case '戰技':
            arr = character['戰技(攻擊)倍率']?.split('/') || [];
            val = arr[eidolon >= 5 ? 1 : 0];
            break;
        case '終結技':
            arr = character['終結技(攻擊)倍率']?.split('/') || [];
            val = arr[eidolon >= 3 ? 1 : 0];
            break;
        case '追加攻擊':
            val = character['追加攻擊(攻擊)倍率'];
            break;
        case '強化普攻':
            val = character['強化普攻(攻擊)倍率'];
            break;
        case '強化戰技':
            val = character['強化戰技(攻擊)倍率'];
            break;
    }
    // 忽略空、0、'0%'
    if (!val || val === '0' || val === '0%') return 0;
    if (typeof val === 'string' && val.endsWith('%')) {
        val = parseFloat(val.replace('%', ''));
    }
    return parseFloat(val) || 0;
}

// 獲取儀器增傷加成
function getRelicDmgBonus(relics) {
    let bonus = 0;
    // 根據儀器資料計算增傷
    // 外圈儀器
    const outer1 = relicData.find(r => r.儀器 === relics.outer1 && r.種類 === '外圈');
    const outer2 = relicData.find(r => r.儀器 === relics.outer2 && r.種類 === '外圈');
    // 內圈儀器
    const inner = relicData.find(r => r.儀器 === relics.inner && r.種類 === '內圈');
    
    // 外圈：如果只選一個，P2+P4；選兩個，各P2
    if (outer1 && !relics.outer2) {
        // P2+P4
        if (outer1['2p增傷'] && outer1['2p增傷'] !== '0' && outer1['2p增傷'] !== '0%') {
            bonus += parseFloat(outer1['2p增傷'].replace('%', '')) || 0;
        }
        if (outer1['4p增傷'] && outer1['4p增傷'] !== '0' && outer1['4p增傷'] !== '0%') {
            bonus += parseFloat(outer1['4p增傷'].replace('%', '')) || 0;
        }
    } else {
        // 兩個外圈，各P2
        if (outer1 && outer1['2p增傷'] && outer1['2p增傷'] !== '0' && outer1['2p增傷'] !== '0%') {
            bonus += parseFloat(outer1['2p增傷'].replace('%', '')) || 0;
        }
        if (outer2 && outer2['2p增傷'] && outer2['2p增傷'] !== '0' && outer2['2p增傷'] !== '0%') {
            bonus += parseFloat(outer2['2p增傷'].replace('%', '')) || 0;
        }
    }
    // 內圈P2
    if (inner && inner['2p增傷'] && inner['2p增傷'] !== '0' && inner['2p增傷'] !== '0%') {
        bonus += parseFloat(inner['2p增傷'].replace('%', '')) || 0;
    }
    return bonus;
}

// 獲取儀器效果加成
function getRelicEffects(relics) {
    const effects = {
        dmgBonus: 0,
        atkBonus: 0,
        critRate: 0,
        defReduction: 0,
        resistanceReduction: 0,
        vulnerability: 0
    };
    
    // 外圈儀器
    const outer1 = relicData.find(r => r.儀器 === relics.outer1 && r.種類 === '外圈');
    const outer2 = relicData.find(r => r.儀器 === relics.outer2 && r.種類 === '外圈');
    const inner = relicData.find(r => r.儀器 === relics.inner && r.種類 === '內圈');
    
    // 檢查是否為相同外圈儀器（4P效果）
    const isSameOuter = outer1 && outer2 && relics.outer1 === relics.outer2;
    
    // 外圈效果
    if (outer1) {
        // 2P效果
        if (outer1['2p增傷'] && outer1['2p增傷'] !== '0' && outer1['2p增傷'] !== '0%') {
            effects.dmgBonus += parseFloat(outer1['2p增傷'].replace('%', '')) || 0;
        }
        if (outer1['2p增攻'] && outer1['2p增攻'] !== '0' && outer1['2p增攻'] !== '0%') {
            effects.atkBonus += parseFloat(outer1['2p增攻'].replace('%', '')) || 0;
        }
        if (outer1['2p爆擊率'] && outer1['2p爆擊率'] !== '0' && outer1['2p爆擊率'] !== '0%') {
            effects.critRate += parseFloat(outer1['2p爆擊率'].replace('%', '')) || 0;
        }
        if (outer1['2p減防'] && outer1['2p減防'] !== '0' && outer1['2p減防'] !== '0%') {
            effects.defReduction += parseFloat(outer1['2p減防'].replace('%', '')) || 0;
        }
        
        // 4P效果（只有相同儀器時觸發）
        if (isSameOuter) {
            if (outer1['4p增傷'] && outer1['4p增傷'] !== '0' && outer1['4p增傷'] !== '0%') {
                effects.dmgBonus += parseFloat(outer1['4p增傷'].replace('%', '')) || 0;
            }
            if (outer1['4p增攻'] && outer1['4p增攻'] !== '0' && outer1['4p增攻'] !== '0%') {
                effects.atkBonus += parseFloat(outer1['4p增攻'].replace('%', '')) || 0;
            }
            if (outer1['4p爆擊率'] && outer1['4p爆擊率'] !== '0' && outer1['4p爆擊率'] !== '0%') {
                effects.critRate += parseFloat(outer1['4p爆擊率'].replace('%', '')) || 0;
            }
            if (outer1['4p減防'] && outer1['4p減防'] !== '0' && outer1['4p減防'] !== '0%') {
                effects.defReduction += parseFloat(outer1['4p減防'].replace('%', '')) || 0;
            }
        }
    }
    
    // 第二個外圈儀器（如果不同）
    if (outer2 && !isSameOuter) {
        if (outer2['2p增傷'] && outer2['2p增傷'] !== '0' && outer2['2p增傷'] !== '0%') {
            effects.dmgBonus += parseFloat(outer2['2p增傷'].replace('%', '')) || 0;
        }
        if (outer2['2p增攻'] && outer2['2p增攻'] !== '0' && outer2['2p增攻'] !== '0%') {
            effects.atkBonus += parseFloat(outer2['2p增攻'].replace('%', '')) || 0;
        }
        if (outer2['2p爆擊率'] && outer2['2p爆擊率'] !== '0' && outer2['2p爆擊率'] !== '0%') {
            effects.critRate += parseFloat(outer2['2p爆擊率'].replace('%', '')) || 0;
        }
        if (outer2['2p減防'] && outer2['2p減防'] !== '0' && outer2['2p減防'] !== '0%') {
            effects.defReduction += parseFloat(outer2['2p減防'].replace('%', '')) || 0;
        }
    }
    
    // 內圈效果
    if (inner) {
        if (inner['2p增傷'] && inner['2p增傷'] !== '0' && inner['2p增傷'] !== '0%') {
            effects.dmgBonus += parseFloat(inner['2p增傷'].replace('%', '')) || 0;
        }
        if (inner['2p增攻'] && inner['2p增攻'] !== '0' && inner['2p增攻'] !== '0%') {
            effects.atkBonus += parseFloat(inner['2p增攻'].replace('%', '')) || 0;
        }
        if (inner['2p爆擊率'] && inner['2p爆擊率'] !== '0' && inner['2p爆擊率'] !== '0%') {
            effects.critRate += parseFloat(inner['2p爆擊率'].replace('%', '')) || 0;
        }
        if (inner['2p減防'] && inner['2p減防'] !== '0' && inner['2p減防'] !== '0%') {
            effects.defReduction += parseFloat(inner['2p減防'].replace('%', '')) || 0;
        }
    }
    
    return effects;
}

// 計算最終傷害
function calculateFinalDamage(config, stats) {
    const characterLevel = 80;
    const enemyLevel = config.enemy.level;
    let enemyResistance = config.enemy.resistance;
    
    // 獲取角色屬性
    const character = characterData.find(c => c.角色 === config.character.name);
    const characterElement = character ? character.屬性 : null;
    
    // 檢查角色屬性是否在敵人弱點中
    const isWeakness = config.enemy.weaknesses.includes(characterElement);
    
    // 如果角色屬性不在敵人弱點中，敵人抗性增加20%
    if (!isWeakness && characterElement) {
        enemyResistance += 20;
    }
    
    // 韌性條減傷邏輯
    let toughnessReduction = 0;
    if (!config.enemy.toughnessBroken) {
        toughnessReduction = 10; // 未破韌性條：韌性條減傷10%
    } else {
        toughnessReduction = 0;  // 已破韌性條：韌性條減傷0%
    }
    
    // 基礎傷害
    let baseDamage = stats.totalAtk * (stats.skillMultiplier / 100);
    
    // 增傷加成
    baseDamage *= (1 + stats.dmgBonus / 100);
    
    // 易傷加成
    baseDamage *= (1 + stats.vulnerability / 100);
    
    // 防禦計算
    const defenseMultiplier = (200 + 10 * characterLevel) / 
        ((200 + 10 * enemyLevel) * (1 - stats.defReduction / 100) + 200 + 10 * characterLevel);
    baseDamage *= defenseMultiplier;
    
    // 抗性計算
    baseDamage *= (1 - enemyResistance / 100 + stats.resistanceReduction / 100);
    
    // 韌性條減傷
    baseDamage *= (1 - toughnessReduction / 100);
    
    // 未爆擊傷害（基礎傷害）
    const nonCritDamage = baseDamage;
    
    // 暴擊傷害（假設暴率100%）
    const fullCritDamage = baseDamage * (1 + stats.critDmg / 100);
    
    // 期望值傷害（1 + 暴擊率% * 暴擊傷害%）
    const expectedDamage = baseDamage * (1 + stats.critRate / 100 * stats.critDmg / 100);
    
    return {
        damage: {
            base: nonCritDamage,
            crit: fullCritDamage,
            average: expectedDamage
        },
        actualResistance: enemyResistance
    };
}

// 顯示結果
function displayResults(damage, stats, actualResistance) {
    // 只用modal-decimal-places
    const decimalPlaces = parseInt(document.getElementById('modal-decimal-places').value) || 2;
    
    // 確保所有數值都是有效的
    const safeNumber = (value) => isNaN(value) || value === null || value === undefined ? 0 : value;
    
    document.getElementById('final-damage').textContent = safeNumber(damage.base).toFixed(decimalPlaces);
    document.getElementById('crit-damage').textContent = safeNumber(damage.crit).toFixed(decimalPlaces);
    document.getElementById('avg-damage').textContent = safeNumber(damage.average).toFixed(decimalPlaces);
    document.getElementById('base-atk').textContent = safeNumber(stats.baseAtk).toFixed(decimalPlaces);
    document.getElementById('total-atk').textContent = safeNumber(stats.totalAtk).toFixed(decimalPlaces);
    document.getElementById('atk-bonus').textContent = safeNumber(stats.atkBonus).toFixed(decimalPlaces) + '%';
    document.getElementById('skill-multiplier').textContent = safeNumber(stats.skillMultiplier).toFixed(decimalPlaces) + '%';
    document.getElementById('dmg-bonus').textContent = safeNumber(stats.dmgBonus).toFixed(decimalPlaces) + '%';
    document.getElementById('crit-rate').textContent = safeNumber(stats.critRate).toFixed(decimalPlaces) + '%';
    document.getElementById('crit-dmg').textContent = safeNumber(stats.critDmg).toFixed(decimalPlaces) + '%';
    document.getElementById('vulnerability').textContent = safeNumber(stats.vulnerability).toFixed(decimalPlaces) + '%';
    document.getElementById('def-reduction').textContent = safeNumber(stats.defReduction).toFixed(decimalPlaces) + '%';
    document.getElementById('resistance-reduction').textContent = safeNumber(stats.resistanceReduction).toFixed(decimalPlaces) + '%';
    
    // 顯示實際抗性值
    if (document.getElementById('actual-resistance')) {
        const resistanceValue = safeNumber(actualResistance);
        const resistanceText = resistanceValue.toFixed(decimalPlaces) + '%';
        document.getElementById('actual-resistance').textContent = resistanceText;
    }
    
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 浮動設定按鈕與設定彈窗互動
function setupSettingsModal() {
    const floatingBtn = document.getElementById('floating-settings-btn');
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('settings-modal-close');
    const modalDecimal = document.getElementById('modal-decimal-places');
    // 開啟彈窗
    floatingBtn.addEventListener('click', () => {
        modal.classList.add('open');
    });
    // 關閉彈窗
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
    });
    // 點modal外部也關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
    });
    // modal設定變動時觸發顯示
    modalDecimal.addEventListener('change', () => {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection.style.display !== 'none') {
            calculateDamage();
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    setupSettingsModal();
}); 