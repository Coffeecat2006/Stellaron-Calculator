// 全局變量
let characterData = [];
let lightconeData = [];
let relicData = [];
let statData = [];
let lightconeDescData = [];
let instrumentDescData = [];
let characterStatData = [];
let ratingData = [];
let lightconeRecommendationData = [];
let relicRecommendationData = [];

// 副詞條數值範圍
const subStatRanges = {
    'HP': [33.87, 38.1, 42.34],
    'ATK': [16.94, 19.05, 21.17],
    'DEF': [16.94, 19.05, 21.17],
    'HP%': [3.46, 3.89, 4.32],
    'ATK%': [3.46, 3.89, 4.32],
    'DEF%': [4.32, 4.86, 5.4],
    '暴擊率': [2.59, 2.92, 3.24],
    '暴擊傷害': [5.18, 5.83, 6.48],
    '效果命中': [3.46, 3.89, 4.32],
    '效果抵抗': [3.46, 3.89, 4.32],
    '擊破特攻': [5.18, 5.83, 6.48],
    '速度': [2, 2.3, 2.6]
};

// 主詞條滿級數值
const mainStatMaxValues = {
    'HP': 705.6,
    'ATK': 352.8,
    'HP%': 43.2,
    'ATK%': 43.2,
    'DEF%': 54,
    '暴擊率': 32.4,
    '暴擊傷害': 64.8,
    '效果命中': 43.2,
    '效果抵抗': 43.2,
    '擊破特攻': 64.8,
    '速度': 25.032,
    '元素傷害加成': 38.88,
    '治療量加成': 34.56,
    '能量恢復效率': 19.44
};

// 初始化應用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // 修改所有數值輸入框的step屬性為0.01（支持小數後兩位）
    document.querySelectorAll('input[type="number"]').forEach(input => {
        if (input.getAttribute('step') === '0.1') {
            input.setAttribute('step', '0.01');
        }
    });
});

async function initializeApp() {
    try {
        // 載入所有數據
        await loadAllData();
        
        // 初始化UI
        initializeUI();
        
        // 綁定事件
        bindEvents();
        
    
    } catch (error) {
        console.error('初始化失敗:', error);
        showNotification('數據載入失敗，請檢查CSV文件是否存在', 'error');
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
    characterStatData = await loadCSV('assets/data/角色詞條資料.csv');
    ratingData = await loadCSV('assets/data/儀器評分.csv');
    lightconeRecommendationData = await loadCSV('assets/data/角色光錐推薦.csv');
    relicRecommendationData = await loadCSV('assets/data/角色儀器推薦.csv');
    
    // 測試光錐數據讀取
    testLightconeData();
}

// 載入CSV文件
async function loadCSV(filename) {
    try {
        // 添加多重緩存破壞機制確保獲取最新數據
        const cacheBuster = new Date().getTime();
        const randomId = Math.random().toString(36).substring(2);
        
        const response = await fetch(`${filename}?t=${cacheBuster}&r=${randomId}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
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

// 刷新所有數據
async function refreshAllData() {
    const refreshBtn = document.getElementById('refresh-data-btn');
    const refreshIcon = refreshBtn.querySelector('.refresh-icon');
    const refreshText = refreshBtn.querySelector('.refresh-text');
    
    try {
        // 開始載入狀態
        refreshBtn.disabled = true;
        refreshBtn.classList.add('loading');
        refreshText.textContent = '載入中...';
        
    
        
        // 重新載入所有CSV數據
        await loadAllData();
        
        // 重新初始化UI
        initializeUI();
        

        
    } catch (error) {
        console.error('重新載入數據失敗:', error);
        showNotification('數據更新失敗，請檢查網路連接或稍後重試', 'error');
    } finally {
        // 恢復按鈕狀態
        refreshBtn.disabled = false;
        refreshBtn.classList.remove('loading');
        refreshText.textContent = '重新載入數據';
    }
}

// 顯示通知訊息
function showNotification(message, type = 'info') {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 顯示動畫
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 3秒後自動消失
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 填充角色選擇
function populateCharacterSelect() {
    // 現在使用模態窗口選擇角色，只需要確保隱藏的input元素有正確的初始狀態
    const select = document.getElementById('character-select');
    select.value = '';
    
    // 確保按鈕顯示正確的初始文字
    const buttonText = document.getElementById('character-select-text');
    if (buttonText) {
        buttonText.textContent = '請選擇角色';
    }
}

// 填充光錐選擇
function populateLightconeSelect() {
    // 現在使用模態窗口選擇光錐，只需要確保隱藏的select元素有正確的初始狀態
    const select = document.getElementById('lightcone-select');
    select.value = '';
    
    // 確保按鈕顯示正確的初始文字
    const buttonText = document.getElementById('lightcone-select-text');
    if (buttonText) {
        buttonText.textContent = '請選擇光錐';
    }
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
        'HP', 'ATK', 'DEF', 'HP%', 'ATK%', 'DEF%', 
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
    document.getElementById('lightcone-select-btn').addEventListener('click', openLightconeModal);
    document.getElementById('character-select-btn').addEventListener('click', openCharacterModal);
    document.getElementById('relic-select-btn').addEventListener('click', openRelicModal);
    document.getElementById('superimpose-select').addEventListener('change', updateLightconeData);
    document.getElementById('outer-relic-1').addEventListener('change', updateInstrumentInfo);
    document.getElementById('outer-relic-2').addEventListener('change', updateInstrumentInfo);
    document.getElementById('inner-relic').addEventListener('change', updateInstrumentInfo);
    // 刷新數據按鈕
    document.getElementById('refresh-data-btn').addEventListener('click', refreshAllData);
    
    // 綁定隨機按鈕事件
    document.querySelectorAll('.random-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const piece = this.dataset.piece;
            randomizeRelic(piece, 'normal');
        });
    });
    
    // 綁定幸運隨機按鈕事件
    document.querySelectorAll('.lucky-random-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const piece = this.dataset.piece;
            randomizeRelic(piece, 'lucky');
        });
    });
    
    // 綁定超級幸運隨機按鈕事件
    document.querySelectorAll('.super-lucky-random-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const piece = this.dataset.piece;
            randomizeRelic(piece, 'super');
        });
    });
    
    // 綁定隨機資訊按鈕事件
    document.querySelectorAll('.random-info-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            openRandomInfoModal();
        });
    });
    
    // 鍵盤快捷鍵 - Ctrl+R 或 F5 刷新數據
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey && event.key === 'r') || event.key === 'F5') {
            event.preventDefault(); // 阻止瀏覽器默認刷新行為
            refreshAllData();
        }
    });
    
    // 頁面載入時也更新一次光錐資訊
    updateLightconeData();
    updateInstrumentInfo();
    
    // 為儀器詞條輸入框添加事件監聽器
    document.addEventListener('input', function(event) {
        if (event.target.matches('.sub-stat-value, .main-stat-value')) {
            // 當儀器詞條數值變化時更新評分
            updateAllRelicRatings();
        }
    });
    
    document.addEventListener('change', function(event) {
        if (event.target.matches('.sub-stat-type, .main-stat-select')) {
            // 當儀器詞條類型變化時更新評分
            updateAllRelicRatings();
        }
        if (event.target.matches('.sub-stat-type, .sub-stat-value')) {
            // 當副詞條變化時移除強化指示器
            const pieceElement = event.target.closest('.relic-piece');
            if (pieceElement) {
                removeEnhancementIndicators(pieceElement);
            }
        }
        if (event.target.matches('.sub-stat-type')) {
            // 當副詞條類型變化時更新選中樣式
            updateSelectedSubStatStyle(event.target);
        }
    });
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
            // 更新攻擊類型選項
            updateAttackTypeOptions(character);
            // 更新主詞條和副詞條選項的優先級
            updateStatOptionsPriority(character);
            // 更新所有副詞條的選中樣式
            updateAllSelectedSubStatStyles();
            // 更新儀器評分顯示
            updateAllRelicRatings();
            // 檢查命途匹配
            checkPathMismatch();
            // 如果光錐選擇模態窗口是打開的，更新光錐網格以顯示專武
            const modal = document.getElementById('lightconeModal');
            if (modal && modal.classList.contains('open')) {
                updateLightconeGrid();
            }
        } else {
            infoBlock.style.display = 'none';
            updateAttackTypeOptions(null);
            updateStatOptionsPriority(null);
            updateAllRelicRatings();
        }
    } else {
        infoBlock.style.display = 'none';
        updateAttackTypeOptions(null);
        updateStatOptionsPriority(null);
        updateAllRelicRatings();
    }
}

// 更新攻擊類型選項
function updateAttackTypeOptions(character) {
    const attackTypeSelect = document.getElementById('attack-type');
    const currentValue = attackTypeSelect.value;
    
    // 清空現有選項
    attackTypeSelect.innerHTML = '<option value="">請選擇攻擊類型</option>';
    
    // 定義所有攻擊類型
    const attackTypes = [
        '普攻',
        '戰技', 
        '終結技',
        '追加攻擊',
        '強化普攻',
        '強化戰技',
        'dot攻擊',
        '憶靈攻擊',
        '強化追加攻擊',
        '強化憶靈攻擊'
    ];
    
    attackTypes.forEach(attackType => {
        const option = document.createElement('option');
        option.value = attackType;
        
        if (character && !hasAttackType(character, attackType)) {
            // 如果角色沒有這種攻擊方式，在選項中註記
            option.textContent = `${attackType} (該角色沒有此攻擊方式)`;
            option.disabled = true;
            option.style.color = '#999';
        } else {
            option.textContent = attackType;
        }
        
        attackTypeSelect.appendChild(option);
    });
    
    // 嘗試恢復之前選擇的值
    if (currentValue && attackTypeSelect.querySelector(`option[value="${currentValue}"]`)) {
        attackTypeSelect.value = currentValue;
    }
}

// 更新主詞條和副詞條選項的優先級
function updateStatOptionsPriority(character) {
    if (!character) {
        // 如果沒有選擇角色，清除所有優先級樣式
        clearStatOptionsPriority();
        return;
    }
    
    const characterName = character.角色;
    const characterStatInfo = characterStatData.find(c => c.角色 === characterName);
    
    if (!characterStatInfo) {
        clearStatOptionsPriority();
        return;
    }
    
    // 更新主詞條選項優先級
    updateMainStatPriority(characterStatInfo);
    
    // 更新副詞條選項優先級
    updateSubStatPriority(characterStatInfo);
}

// 清除所有優先級樣式
function clearStatOptionsPriority() {
    // 清除主詞條樣式
    document.querySelectorAll('.main-stat-select option').forEach(option => {
        option.classList.remove('option-recommended');
        option.textContent = option.textContent.replace(' (推薦)', '');
    });
    
    // 清除副詞條樣式
    document.querySelectorAll('.sub-stat-type option').forEach(option => {
        option.classList.remove('option-important', 'option-secondary');
        option.textContent = option.textContent.replace(' (重要)', '').replace(' (次要)', '');
    });
}

// 更新主詞條選項優先級
function updateMainStatPriority(characterStatInfo) {
    const pieceMapping = {
        'body': '軀幹推薦主詞條',
        'feet': '腳部推薦主詞條', 
        'sphere': '位面球推薦主詞條',
        'rope': '連結繩推薦主詞條'
    };
    
    Object.keys(pieceMapping).forEach(piece => {
        const select = document.querySelector(`[data-piece="${piece}"] .main-stat-select`);
        if (!select) return;
        
        const recommendedStats = characterStatInfo[pieceMapping[piece]];
        if (!recommendedStats || recommendedStats.trim() === '') return;
        
        // 解析推薦主詞條（用/分隔）
        const recommended = recommendedStats.split('/').map(s => s.trim()).filter(s => s);
        
        // 重新排序選項
        const options = Array.from(select.options);
        const firstOption = options[0]; // 保留"請選擇主詞條"選項
        const otherOptions = options.slice(1);
        
        // 分類選項
        const recommendedOptions = [];
        const normalOptions = [];
        
        otherOptions.forEach(option => {
            if (recommended.includes(option.value)) {
                option.classList.add('option-recommended');
                option.textContent = option.value + ' (推薦)';
                recommendedOptions.push(option);
            } else {
                option.classList.remove('option-recommended');
                option.textContent = option.value;
                normalOptions.push(option);
            }
        });
        
        // 清空select並重新添加
        select.innerHTML = '';
        select.appendChild(firstOption);
        recommendedOptions.forEach(option => select.appendChild(option));
        normalOptions.forEach(option => select.appendChild(option));
    });
}

// 更新副詞條選項優先級
function updateSubStatPriority(characterStatInfo) {
    const subStatMapping = {
        'HP': 'HP',
        'ATK': 'ATK',
        'DEF': 'DEF',
        'HP%': 'HP%',
        'ATK%': 'ATK%',
        'DEF%': 'DEF%',
        '暴擊率': '暴擊率',
        '暴擊傷害': '暴擊傷害',
        '效果命中': '效果命中',
        '效果抵抗': '效果抵抗',
        '擊破特攻': '擊破特攻',
        '速度': '速度'
    };
    
    document.querySelectorAll('.sub-stat-type').forEach(select => {
        const options = Array.from(select.options);
        const firstOption = options[0]; // 保留"請選擇副詞條類型"選項
        const otherOptions = options.slice(1);
        
        // 分類選項
        const importantOptions = [];
        const secondaryOptions = [];
        const normalOptions = [];
        
        otherOptions.forEach(option => {
            const statName = option.value;
            const priority = characterStatInfo[subStatMapping[statName]];
            
            if (priority === '重要') {
                option.classList.remove('option-secondary');
                option.classList.add('option-important');
                option.textContent = statName;
                importantOptions.push(option);
            } else if (priority === '次要') {
                option.classList.remove('option-important');
                option.classList.add('option-secondary');
                option.textContent = statName;
                secondaryOptions.push(option);
            } else {
                option.classList.remove('option-important', 'option-secondary');
                option.textContent = statName;
                normalOptions.push(option);
            }
        });
        
        // 清空select並重新添加
        select.innerHTML = '';
        select.appendChild(firstOption);
        importantOptions.forEach(option => select.appendChild(option));
        secondaryOptions.forEach(option => select.appendChild(option));
        normalOptions.forEach(option => select.appendChild(option));
    });
}

// 計算單個儀器評分
function calculateRelicRating(relicStats, character) {
    if (!character || !ratingData || ratingData.length === 0) {
        return 0;
    }
    
    const characterName = character.角色;
    const characterStatInfo = characterStatData.find(c => c.角色 === characterName);
    
    if (!characterStatInfo) {
        return 0;
    }
    
    let totalRating = 0;
    
    // 計算4個副詞條的評分
    relicStats.sub.forEach(subStat => {
        if (!subStat.type || !subStat.value || subStat.value === 0) return;
        
        // 找到評分數據
        const ratingInfo = ratingData.find(r => r.詞條 === subStat.type);
        if (!ratingInfo) return;
        
        // 獲取該角色對這個副詞條的重要性
        const importance = characterStatInfo[subStat.type];
        
        // 根據重要性選擇評分係數
        let ratingCoeff = 0;
        if (importance === '重要') {
            ratingCoeff = parseFloat(ratingInfo['評分(重要)']) || 0;
        } else if (importance === '次要') {
            ratingCoeff = parseFloat(ratingInfo['評分(次要)']) || 0;
        } else {
            ratingCoeff = parseFloat(ratingInfo['評分(不需要)']) || 0;
        }
        
        // 計算該副詞條的評分
        const statValue = parseFloat(subStat.value) || 0;
        const statRating = statValue * ratingCoeff;
        
        totalRating += statRating;
    });
    
    return Math.round(totalRating * 10) / 10; // 保留一位小數
}

// 計算所有儀器的總評分
function calculateTotalRelicRating(character) {
    if (!character) return 0;
    
    const relicStats = collectRelicStats();
    let totalRating = 0;
    
    // 計算6個部位的評分
    Object.values(relicStats).forEach(pieceStats => {
        const pieceRating = calculateRelicRating(pieceStats, character);
        totalRating += pieceRating;
    });
    
    return Math.round(totalRating * 10) / 10; // 保留一位小數
}

// 更新所有儀器評分顯示
function updateAllRelicRatings() {
    const characterName = document.getElementById('character-select').value;
    const character = characterData.find(c => c.角色 === characterName);
    
    if (!character) {
        // 如果沒有選擇角色，顯示 "-"
        document.querySelectorAll('.rating-value').forEach(elem => {
            elem.textContent = '-';
        });
        const totalRatingElem = document.getElementById('total-relic-rating');
        if (totalRatingElem) totalRatingElem.textContent = '-';
        return;
    }
    
    const relicStats = collectRelicStats();
    
    // 更新每個部位的評分
    Object.keys(relicStats).forEach(piece => {
        const pieceElement = document.querySelector(`[data-piece="${piece}"]`);
        if (pieceElement) {
            const ratingElement = pieceElement.querySelector('.rating-value');
            if (ratingElement) {
                const rating = calculateRelicRating(relicStats[piece], character);
                ratingElement.textContent = rating;
            }
        }
    });
    
    // 更新總評分
    const totalRating = calculateTotalRelicRating(character);
    const totalRatingElem = document.getElementById('total-relic-rating');
    if (totalRatingElem) {
        totalRatingElem.textContent = totalRating;
    }
}

// 更新光錐數據並顯示光錐資訊
function updateLightconeData() {
    const lightconeName = document.getElementById('lightcone-select').value;
    const superimpose = parseInt(document.getElementById('superimpose-select').value);
    const infoBlock = document.querySelector('.lightcone-config-info');
    const descElem = document.getElementById('lc-info-desc');
    const buttonText = document.getElementById('lightcone-select-text');
    
    // 更新按鈕顯示文字
    if (buttonText) {
        buttonText.textContent = lightconeName || '請選擇光錐';
    }
    
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
            
            // 檢查命途匹配
            checkPathMismatch();
        } else {
            infoBlock.style.display = 'none';
            descElem.textContent = '';
        }
    } else {
        infoBlock.style.display = 'none';
        descElem.textContent = '';
        // 隱藏警示
        const warningElem = document.getElementById('path-mismatch-warning');
        if (warningElem) warningElem.style.display = 'none';
    }
    
    // 更新光錐卸下按鈕狀態（如果模態窗口正在打開）
    const modal = document.getElementById('lightconeModal');
    if (modal && modal.classList.contains('open')) {
        updateLightconeRemoveButton();
    }
}

// 檢查角色與光錐命途匹配
function checkPathMismatch() {
    const characterName = document.getElementById('character-select').value;
    const lightconeName = document.getElementById('lightcone-select').value;
    const warningElem = document.getElementById('path-mismatch-warning');
    
    if (!warningElem) return;
    
    if (characterName && lightconeName) {
        const character = characterData.find(c => c.角色 === characterName);
        const lightcone = lightconeData.find(l => l.光錐 === lightconeName);
        
        if (character && lightcone) {
            const characterPath = character.命途;
            const lightconePath = lightcone.命途;
            
            if (characterPath && lightconePath && characterPath !== lightconePath) {
                // 命途不匹配，顯示警示
                warningElem.style.display = 'block';
            } else {
                // 命途匹配，隱藏警示
                warningElem.style.display = 'none';
            }
        } else {
            warningElem.style.display = 'none';
        }
    } else {
        warningElem.style.display = 'none';
    }
}

// 更新儀器敘述與圖片
function updateInstrumentInfo() {
    const outer1 = document.getElementById('outer-relic-1').value;
    const outer2 = document.getElementById('outer-relic-2').value;
    const inner = document.getElementById('inner-relic').value;
    const infoBlock = document.getElementById('instrument-info-block');
    const outerImgs = document.getElementById('outer-relic-imgs');
    const innerImgs = document.getElementById('inner-relic-imgs');
    const descList = document.getElementById('instrument-desc-list');
    
    // 清空現有內容
    outerImgs.innerHTML = '';
    innerImgs.innerHTML = '';
    descList.innerHTML = '';
    let show = false;
    
    // 儲存已顯示過的儀器，避免重複
    const shown = new Set();
    
    // 檢查外圈儀器配置
    const hasOuter1 = outer1 && outer1.trim() !== '';
    const hasOuter2 = outer2 && outer2.trim() !== '';
    const isSameOuter = hasOuter1 && hasOuter2 && outer1 === outer2;
    const isSingleOuter = hasOuter1 && !hasOuter2;
    const shouldShow4P = isSingleOuter || isSameOuter;
    
    // 處理外圈儀器顯示
    if (hasOuter1) {
        const a = instrumentDescData.find(i => i.儀器 === outer1);
        if (a) {
            outerImgs.innerHTML += `<img src="assets/img/instrument/${outer1}.png" alt="${outer1}">`;
            descList.innerHTML += `<div><span class='instrument-desc-title'>兩件套效果</span>${a['2P敘述']||''}</div>`;
            shown.add(outer1);
            show = true;
            
            // 如果應該顯示4P效果，立即在2P後面顯示
            if (shouldShow4P && a['4P敘述']) {
                descList.innerHTML += `<div><span class='instrument-desc-title'>四件套效果</span>${a['4P敘述']}</div>`;
            }
        }
    }
    
    // 處理第二個外圈儀器（如果與第一個不同）
    if (hasOuter2 && outer2 !== outer1) {
        const b = instrumentDescData.find(i => i.儀器 === outer2);
        if (b) {
            outerImgs.innerHTML += `<img src="assets/img/instrument/${outer2}.png" alt="${outer2}">`;
            descList.innerHTML += `<div><span class='instrument-desc-title'>兩件套效果</span>${b['2P敘述']||''}</div>`;
            shown.add(outer2);
            show = true;
        }
    }
    
    // 處理內圈儀器
    if (inner) {
        const c = instrumentDescData.find(i => i.儀器 === inner);
        if (c) {
            innerImgs.innerHTML += `<img src="assets/img/instrument/${inner}.png" alt="${inner}">`;
            descList.innerHTML += `<div><span class='instrument-desc-title'>兩件套效果</span>${c['2P敘述']||''}</div>`;
            shown.add(inner);
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
function getLightconeEffects(lightcone, superimpose, attackType, character, config, stats) {
    const effects = {
        atkBonus: 0,
        dmgBonus: 0,
        critRate: 0,
        critDmg: 0,
        defReduction: 0,
        vulnerability: 0,
        hpBonus: 0,
        defBonus: 0,
        speedBonus: 0,
        breakEffect: 0,
        healingBonus: 0,
        effectHit: 0,
        effectRes: 0,
        energyRegen: 0,
        resistanceReduction: 0
    };
    
    if (!lightcone) return effects;
    
    // 根據疊影等級獲取對應的效果索引
    const superimposeIndex = Math.min(superimpose - 1, 4); // S1-S5 對應索引 0-4
    
    // 處理效果1到效果19
    for (let i = 1; i <= 19; i++) {
        const effectType = lightcone[`效果${i}`];
        const effectTarget = lightcone[`效果${i}對象`];
        const effectCondition = lightcone[`效果${i}條件`];
        const effectConditionValue = lightcone[`效果${i}條件值`];
        const effectValue = lightcone[`效果${i}數值`];
        
        // 跳過空效果
        if (!effectType || !effectValue) continue;
        
        // 檢查目標是否為自身（目前只處理自身效果）
        if (effectTarget && effectTarget !== '自身' && effectTarget !== '我方全體' && effectTarget !== '我方單體') {
            continue;
        }
        
        // 檢查條件是否滿足
        if (!checkLightconeEffectCondition(effectCondition, effectConditionValue, character, config, stats, attackType)) {
            continue;
        }
        
        // 解析效果數值（支援疊影等級）
        let value = 0;
        if (effectValue.includes('/')) {
            const values = effectValue.split('/');
            if (values[superimposeIndex]) {
                value = parseFloat(values[superimposeIndex].replace('%', '')) || 0;
            }
        } else {
            value = parseFloat(effectValue.replace('%', '')) || 0;
        }
        
        // 根據效果類型添加到對應的效果中
        switch (effectType) {
            case '攻擊力':
                effects.atkBonus += value;
                break;
            case '增傷':
                effects.dmgBonus += value;
                break;
            case '暴擊率':
            case '爆擊率':
                effects.critRate += value;
                break;
            case '暴擊傷害':
            case '爆擊傷害':
                effects.critDmg += value;
                break;
            case '減防':
                effects.defReduction += value;
                break;
            case '易傷':
                effects.vulnerability += value;
                break;
            case '生命值':
                effects.hpBonus += value;
                break;
            case '防禦力':
                effects.defBonus += value;
                break;
            case '速度':
                effects.speedBonus += value;
                break;
            case '擊破特攻':
                effects.breakEffect += value;
                break;
            case '治療量加成':
                effects.healingBonus += value;
                break;
            case '效果命中':
                effects.effectHit += value;
                break;
            case '效果抵抗':
                effects.effectRes += value;
                break;
            case '能量恢復效率':
                effects.energyRegen += value;
                break;
            case '抗性穿透':
                effects.resistanceReduction += value;
                break;
            case '受到傷害降低':
                // 這個可以轉換為易傷的負值或其他處理
                break;
            default:
                // 未知效果類型，可以在這裡添加日誌
                console.warn(`未知的光錐效果類型: ${effectType}`);
                break;
        }
    }
    
    return effects;
}

// 檢查光錐效果條件是否滿足
function checkLightconeEffectCondition(condition, conditionValue, character, config, stats, attackType) {
    if (!condition || condition === '無' || condition === '' || condition.trim() === '') {
        return true; // 無條件總是滿足
    }
    
    // 處理複合條件（用/分隔）
    if (condition.includes('/') && conditionValue && conditionValue.includes('/')) {
        const conditions = condition.split('/');
        const values = conditionValue.split('/');
        
        // 所有條件都必須滿足（AND邏輯）
        for (let i = 0; i < conditions.length && i < values.length; i++) {
            if (!checkSingleLightconeCondition(conditions[i].trim(), values[i].trim(), character, config, stats, attackType)) {
                return false;
            }
        }
        return true;
    }
    
    // 處理單一條件
    return checkSingleLightconeCondition(condition, conditionValue, character, config, stats, attackType);
}

// 檢查單一光錐條件
function checkSingleLightconeCondition(condition, conditionValue, character, config, stats, attackType) {
    // 安全檢查
    if (!character || !config) {
        return false;
    }
    
    switch (condition) {
        case '角色屬性':
            return character && character.屬性 === conditionValue;
            
        case '敵人弱點':
            return config && config.enemy && config.enemy.weaknesses && config.enemy.weaknesses.includes(conditionValue);
            
        case '敵人韌性條':
            if (conditionValue === '已破韌性條') {
                return config && config.enemy && config.enemy.toughnessBroken;
            } else if (conditionValue === '未破韌性條') {
                return config && config.enemy && !config.enemy.toughnessBroken;
            }
            return false;
            
        case '攻擊種類':
            // 檢查當前攻擊種類是否匹配
            if (!attackType) {
                return false;
            }
            
            // 攻擊類型映射表（HTML選項 -> CSV條件值）
            const attackTypeMapping = {
                '普攻': '普通攻擊',
                '強化普攻': '普通攻擊',
                '戰技': '戰技',
                '強化戰技': '戰技',
                '終結技': '終結技',
                '追加攻擊': '追加攻擊',
                '強化追加攻擊': '追加攻擊',
                'dot攻擊': 'dot攻擊',
                '憶靈攻擊': '憶靈攻擊',
                '強化憶靈攻擊': '憶靈攻擊',
                '擊破傷害': '擊破傷害',
                '持續傷害': 'dot攻擊'  // 持續傷害映射到dot攻擊
            };
            
            // 將HTML中的攻擊類型映射到CSV中的條件值
            const mappedAttackType = attackTypeMapping[attackType] || attackType;
            
            return mappedAttackType === conditionValue;
            
        default:
            // 處理數值比較條件 (例如: 值(速度)>, 值(能量上限)>, 值(生命值)>)
            if (condition.startsWith('值(') && condition.includes(')')) {
                const match = condition.match(/值\(([^)]+)\)(.+)/);
                if (match) {
                    const statName = match[1];
                    const operator = match[2];
                    
                    // 獲取角色對應的數值
                    let statValue = 0;
                    
                    // 從統計數據中獲取數值
                    switch (statName) {
                        case '速度':
                            statValue = stats && stats.totalSpeed !== undefined ? stats.totalSpeed : (parseFloat(character.速度) || 0);
                            break;
                        case '擊破特攻':
                            statValue = stats && stats.breakEffect !== undefined ? stats.breakEffect : 0;
                            break;
                        case '攻擊力':
                            statValue = stats && stats.totalAtk !== undefined ? stats.totalAtk : 0;
                            break;
                        case '生命值':
                            statValue = stats && stats.totalHp !== undefined ? stats.totalHp : 0;
                            break;
                        case '防禦力':
                            statValue = stats && stats.totalDef !== undefined ? stats.totalDef : 0;
                            break;
                        case '暴擊率':
                        case '爆擊率':
                            statValue = stats && stats.critRate !== undefined ? stats.critRate : 0;
                            break;
                        case '暴擊傷害':
                        case '爆擊傷害':
                            statValue = stats && stats.critDmg !== undefined ? stats.critDmg : 0;
                            break;
                        case '效果命中':
                            statValue = stats && stats.effectHit !== undefined ? stats.effectHit : 0;
                            break;
                        case '效果抵抗':
                        case '效果抗性':
                            statValue = stats && stats.effectRes !== undefined ? stats.effectRes : 0;
                            break;
                        case '能量恢復效率':
                            statValue = stats && stats.energyRegen !== undefined ? stats.energyRegen : 100;
                            break;
                        case '治療量加成':
                            statValue = stats && stats.healingBonus !== undefined ? stats.healingBonus : 0;
                            break;
                        case '能量上限':
                            statValue = character && character.能量上限 ? parseFloat(character.能量上限) : 0;
                            break;
                        default:
                            // 如果找不到對應的屬性，嘗試直接從stats中獲取
                            if (stats && stats[statName] !== undefined) {
                                statValue = stats[statName];
                            } else if (character && character[statName] !== undefined) {
                                statValue = parseFloat(character[statName]) || 0;
                            }
                            break;
                    }
                    
                    // 解析條件值
                    const targetValue = parseFloat(conditionValue.replace('%', '')) || 0;
                    
                    // 執行比較
                    switch (operator) {
                        case '<':
                            return statValue < targetValue;
                        case '>':
                            return statValue > targetValue;
                        case '<=':
                            return statValue <= targetValue;
                        case '>=':
                            return statValue >= targetValue;
                        case '=':
                        case '==':
                            return statValue === targetValue;
                        default:
                            return false;
                    }
                }
            }
            return false;
    }
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
        '追加攻擊': '追加攻擊',
        '強化追加攻擊': '追加攻擊',
        'dot攻擊': 'dot攻擊',
        '憶靈攻擊': '憶靈攻擊',
        '強化憶靈攻擊': '憶靈攻擊'
    };
    
    const mappedAttackType = typeMapping[attackType];
    if (!mappedAttackType) return false;
    
    // 檢查效果類型是否包含映射後的攻擊類型
    return effectType.includes(mappedAttackType);
}

// 檢查角色是否有特定的攻擊方式
function hasAttackType(character, attackType) {
    if (!character) return false;
    
    // 檢查對應的攻擊、生命、防禦倍率是否都為空
    const attackField = `${attackType}(攻擊)倍率`;
    const hpField = `${attackType}(生命)倍率`;
    const defField = `${attackType}(防禦)倍率`;
    
    const attackValue = character[attackField];
    const hpValue = character[hpField];
    const defValue = character[defField];
    
    // 如果三個倍率都為空或都為0，則認為該角色沒有這種攻擊方式
    const isEmpty = (value) => !value || value.trim() === '' || value === '0' || value === '0%';
    
    return !(isEmpty(attackValue) && isEmpty(hpValue) && isEmpty(defValue));
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
        resistanceReduction: 0,
        // 新增的角色屬性
        baseHp: 0,
        totalHp: 0,
        baseDef: 0,
        totalDef: 0,
        baseSpeed: 0,
        totalSpeed: 0,
        breakEffect: 0,
        healingBonus: 0,
        effectHit: 0,
        effectRes: 0,
        energyRegen: 100  // 初始值100%
    };
    // 基礎攻擊力
    let lightconeBase = 0, lightconeHP = 0, lightconeDEF = 0;
    if (lightcone) {
        lightconeBase = parseFloat(lightcone.攻擊力白值 || 0);
        lightconeHP = parseFloat(lightcone.生命值白值 || 0);
        lightconeDEF = parseFloat(lightcone.防禦力白值 || 0);
    }
    stats.baseAtk = parseFloat(character.攻擊力 || 0) + lightconeBase;
    stats.baseHp = parseFloat(character.生命值 || 0) + lightconeHP;
    stats.baseDef = parseFloat(character.防禦力 || 0) + lightconeDEF;
    stats.baseSpeed = parseFloat(character.速度 || 0);

    // 儀器詞條加成
    const relicStats = calculateRelicStats(config.relicStats);
    // 行跡加成（要在加總前）
    applyCharacterTraces(relicStats, character);

    // 判斷命途
    let lightconeEffects = { 
        atkBonus: 0, dmgBonus: 0, critRate: 0, critDmg: 0, defReduction: 0, vulnerability: 0,
        hpBonus: 0, defBonus: 0, speedBonus: 0, breakEffect: 0, healingBonus: 0, effectHit: 0, effectRes: 0, energyRegen: 0, resistanceReduction: 0
    };
    if (lightcone && character.命途 && lightcone.命途 && character.命途 === lightcone.命途) {
        // 創建臨時stats用於條件檢查
        const tempStats = {
            baseAtk: stats.baseAtk,
            totalAtk: stats.baseAtk * (1 + relicStats.atkBonus / 100) + relicStats.atkFlat,
            baseHp: stats.baseHp,
            totalHp: stats.baseHp * (1 + relicStats.hpBonus / 100) + relicStats.hpFlat,
            baseDef: stats.baseDef,
            totalDef: stats.baseDef * (1 + relicStats.defBonus / 100) + relicStats.defFlat,
            baseSpeed: stats.baseSpeed,
            totalSpeed: stats.baseSpeed + relicStats.speedFlat,
            critRate: 5 + relicStats.critRate,
            critDmg: 50 + relicStats.critDmg,
            breakEffect: relicStats.breakEffect,
            healingBonus: relicStats.healingBonus,
            effectHit: relicStats.effectHit,
            effectRes: relicStats.effectRes,
            energyRegen: 100 + relicStats.energyRegen
        };
        lightconeEffects = getLightconeEffects(lightcone, config.lightcone.superimpose, config.attackType, character, config, tempStats);
    }
    
    // 先計算基礎統計數據（不包含儀器效果）
    const baseCritRate = 5;
    const baseCritDmg = 50;
    stats.critRate = baseCritRate + relicStats.critRate + lightconeEffects.critRate;
    stats.critDmg = baseCritDmg + relicStats.critDmg + lightconeEffects.critDmg;
    stats.totalAtk = stats.baseAtk * (1 + (relicStats.atkBonus + lightconeEffects.atkBonus) / 100) + relicStats.atkFlat;
    stats.totalHp = stats.baseHp * (1 + relicStats.hpBonus / 100) + relicStats.hpFlat;
    stats.totalDef = stats.baseDef * (1 + relicStats.defBonus / 100) + relicStats.defFlat;
    stats.totalSpeed = stats.baseSpeed + relicStats.speedFlat;
    stats.breakEffect = relicStats.breakEffect;
    stats.healingBonus = relicStats.healingBonus;
    stats.effectHit = relicStats.effectHit;
    stats.effectRes = relicStats.effectRes;
    stats.energyRegen = 100 + relicStats.energyRegen;
    
    // 現在計算儀器效果（傳入包含基礎統計的stats）
    const relicEffects = getRelicEffects(config.relics, character, config, stats);
    
    // 應用儀器效果到最終統計
    stats.atkBonus = relicStats.atkBonus + relicEffects.atkBonus + lightconeEffects.atkBonus;
    stats.totalAtk = stats.baseAtk * (1 + stats.atkBonus / 100) + relicStats.atkFlat;
    // 技能倍率
    stats.skillMultiplier = getSkillMultiplier(character, config.attackType, config.character.eidolon);
    // 增傷加成
    stats.dmgBonus = relicStats.dmgBonus + relicEffects.dmgBonus + lightconeEffects.dmgBonus;
    // 暴擊相關（重新計算包含儀器效果）
    stats.critRate = baseCritRate + relicStats.critRate + relicEffects.critRate + lightconeEffects.critRate;
    stats.critDmg = baseCritDmg + relicStats.critDmg + relicEffects.critDmg + lightconeEffects.critDmg;
    // 其他加成
    stats.vulnerability = relicStats.vulnerability + relicEffects.vulnerability + lightconeEffects.vulnerability;
    stats.defReduction = relicStats.defReduction + relicEffects.defReduction + lightconeEffects.defReduction;
    stats.resistanceReduction = relicStats.resistanceReduction;
    
    // 重新計算最終角色屬性（包含儀器效果和光錐效果）
    stats.totalHp = stats.baseHp * (1 + (relicStats.hpBonus + relicEffects.hpBonus + lightconeEffects.hpBonus) / 100) + relicStats.hpFlat;
    stats.totalDef = stats.baseDef * (1 + (relicStats.defBonus + relicEffects.defBonus + lightconeEffects.defBonus) / 100) + relicStats.defFlat;
    stats.totalSpeed = stats.baseSpeed * (1 + (relicEffects.speedBonus + lightconeEffects.speedBonus) / 100) + relicStats.speedFlat;
    stats.breakEffect = relicStats.breakEffect + relicEffects.breakEffect + lightconeEffects.breakEffect;
    stats.healingBonus = relicStats.healingBonus + relicEffects.healingBonus + lightconeEffects.healingBonus;
    stats.effectHit = relicStats.effectHit + relicEffects.effectHit + lightconeEffects.effectHit;
    stats.effectRes = relicStats.effectRes + relicEffects.effectRes + lightconeEffects.effectRes;
    stats.energyRegen = 100 + relicStats.energyRegen + relicEffects.energyRegen + lightconeEffects.energyRegen;
    stats.resistanceReduction = relicStats.resistanceReduction + lightconeEffects.resistanceReduction;
    
    return stats;
}

// 計算儀器詞條統計
function calculateRelicStats(relicStats) {
    const stats = {
        atkBonus: 0,
        atkFlat: 0,
        hpBonus: 0,
        hpFlat: 0,
        defBonus: 0,
        defFlat: 0,
        speedBonus: 0,
        speedFlat: 0,
        breakEffect: 0,
        healingBonus: 0,
        effectHit: 0,
        effectRes: 0,
        dmgBonus: 0,
        critRate: 0,
        critDmg: 0,
        vulnerability: 0,
        defReduction: 0,
        resistanceReduction: 0,
        energyRegen: 0
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
        case 'ATK':
            stats.atkFlat += numValue;
            break;
        case 'HP':
            stats.hpFlat += numValue;
            break;
        case 'DEF':
            stats.defFlat += numValue;
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
            stats.hpBonus += numValue;
            break;
        case 'DEF%':
            stats.defBonus += numValue;
            break;
        case '速度':
            stats.speedFlat += numValue;
            break;
        case '擊破特攻':
            stats.breakEffect += numValue;
            break;
        case '效果命中':
            stats.effectHit += numValue;
            break;
        case '效果抵抗':
            stats.effectRes += numValue;
            break;
        case '治療量加成':
            stats.healingBonus += numValue;
            break;
        case '能量恢復效率':
            stats.energyRegen += numValue;
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
            // 追加攻擊受E5星魂影響
            arr = character['追加攻擊(攻擊)倍率']?.split('/') || [];
            val = arr[eidolon >= 5 ? 1 : 0];
            break;
        case '強化普攻':
            // 強化普攻按照普攻的星魂規則處理
            arr = character['強化普攻(攻擊)倍率']?.split('/') || [];
            val = arr[eidolon >= 3 ? 1 : 0];
            break;
        case '強化戰技':
            // 強化戰技按照戰技的星魂規則處理
            arr = character['強化戰技(攻擊)倍率']?.split('/') || [];
            val = arr[eidolon >= 5 ? 1 : 0];
            break;
        case 'dot攻擊':
            // dot攻擊倍率不受星魂影響
            arr = character['dot攻擊(攻擊)倍率']?.split('/') || [];
            val = arr[0]; // 總是使用第一個數值
            break;
        case '憶靈攻擊':
            // 憶靈攻擊倍率在E5(含)以上會提高
            arr = character['憶靈攻擊(攻擊)倍率']?.split('/') || [];
            val = arr[eidolon >= 5 ? 1 : 0];
            break;
        case '強化追加攻擊':
            // 強化追加攻擊按照追加攻擊的星魂規則處理（E5+）
            arr = character['強化追加攻擊(攻擊)倍率']?.split('/') || [];
            val = arr[eidolon >= 5 ? 1 : 0];
            break;
        case '強化憶靈攻擊':
            // 強化憶靈攻擊按照憶靈攻擊的星魂規則處理（E5+）
            arr = character['強化憶靈攻擊(攻擊)倍率']?.split('/') || [];
            val = arr[eidolon >= 5 ? 1 : 0];
            break;
    }
    // 處理各種倍率格式
    if (!val) return 0;
    
    // 轉換為字符串進行處理
    val = String(val).trim();
    
    // 忽略空、0、'0%'
    if (val === '' || val === '0' || val === '0%') return 0;
    
    // 移除%符號
    if (val.endsWith('%')) {
        val = val.replace('%', '');
    }
    
    // 轉換為數值
    const numValue = parseFloat(val);
    
    // 檢查是否為有效數值
    if (isNaN(numValue)) return 0;
    
    return numValue;
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
function getRelicEffects(relics, character, config, stats) {
    const effects = {
        dmgBonus: 0,
        atkBonus: 0,
        critRate: 0,
        critDmg: 0,
        defReduction: 0,
        resistanceReduction: 0,
        vulnerability: 0,
        hpBonus: 0,
        defBonus: 0,
        speedBonus: 0,
        breakEffect: 0,
        healingBonus: 0,
        effectHit: 0,
        effectRes: 0,
        energyRegen: 0
    };
    
    // 外圈儀器
    const outer1 = relicData.find(r => r.儀器 === relics.outer1 && r.種類 === '外圈');
    const outer2 = relicData.find(r => r.儀器 === relics.outer2 && r.種類 === '外圈');
    const inner = relicData.find(r => r.儀器 === relics.inner && r.種類 === '內圈');
    
    // 檢查外圈儀器配置
    const hasOuter1 = outer1 && relics.outer1 && relics.outer1.trim() !== '';
    const hasOuter2 = outer2 && relics.outer2 && relics.outer2.trim() !== '';
    const isSameOuter = hasOuter1 && hasOuter2 && relics.outer1 === relics.outer2;
    const isSingleOuter = hasOuter1 && !hasOuter2;
    
    // 處理儀器效果的通用函數
    function processRelicEffects(relic, isPiece2, isPiece4) {
        if (!relic) return;
        
        // 處理效果1到效果5
        for (let i = 1; i <= 5; i++) {
            const effectType = relic[`效果${i}`];
            const effectRange = relic[`效果${i}範圍`];
            const effectTarget = relic[`效果${i}對象`];
            const effectCondition = relic[`效果${i}條件`];
            const effectConditionValue = relic[`效果${i}條件值`];
            const effectValue = relic[`效果${i}數值`];
            
            // 跳過空效果
            if (!effectType || !effectRange || !effectValue) continue;
            
            // 檢查範圍是否匹配
            const shouldApply = (effectRange === '2P' && isPiece2) || (effectRange === '4P' && isPiece4);
            if (!shouldApply) continue;
            
            // 檢查條件是否滿足
            if (!checkRelicEffectCondition(effectCondition, effectConditionValue, character, config, stats)) {
                continue;
            }
            
            // 解析效果數值
            const value = parseFloat(effectValue.replace('%', '')) || 0;
            
            // 根據效果類型添加到對應的效果中
            switch (effectType) {
                case '增傷':
                    effects.dmgBonus += value;
                    break;
                case '攻擊力':
                    effects.atkBonus += value;
                    break;
                case '爆擊率':
                    effects.critRate += value;
                    break;
                case '爆擊傷害':
                    effects.critDmg += value;
                    break;
                case '減防':
                    effects.defReduction += value;
                    break;
                case '生命值':
                    effects.hpBonus += value;
                    break;
                case '防禦力':
                    effects.defBonus += value;
                    break;
                case '速度':
                    effects.speedBonus += value;
                    break;
                case '擊破特攻':
                    effects.breakEffect += value;
                    break;
                case '治療量加成':
                    effects.healingBonus += value;
                    break;
                case '效果命中':
                    effects.effectHit += value;
                    break;
                case '效果抵抗':
                    effects.effectRes += value;
                    break;
                case '能量恢復效率':
                    effects.energyRegen += value;
                    break;
                case '受到傷害降低':
                    // 這個可以轉換為易傷的負值或其他處理
                    break;
                default:
                    // 未知效果類型，可以在這裡添加日誌
                    break;
            }
        }
    }
    
    // 處理外圈儀器效果
    if (isSingleOuter) {
        // 只有一個外圈儀器：觸發2P和4P效果
        processRelicEffects(outer1, true, false);  // 2P效果
        processRelicEffects(outer1, false, true);  // 4P效果
    } else if (isSameOuter) {
        // 兩個相同外圈儀器：觸發2P和4P效果
        processRelicEffects(outer1, true, false);  // 2P效果
        processRelicEffects(outer1, false, true);  // 4P效果
    } else {
        // 兩個不同外圈儀器：分別觸發各自的2P效果
        if (hasOuter1) {
            processRelicEffects(outer1, true, false);
        }
        if (hasOuter2) {
            processRelicEffects(outer2, true, false);
        }
    }
    
    // 處理內圈儀器的2P效果
    if (inner) {
        processRelicEffects(inner, true, false);
    }
    
    return effects;
}

// 檢查儀器效果條件是否滿足
function checkRelicEffectCondition(condition, conditionValue, character, config, stats) {
    if (!condition || condition === '無') {
        return true; // 無條件總是滿足
    }
    
    // 處理複合條件（用/分隔）
    if (condition.includes('/') && conditionValue.includes('/')) {
        const conditions = condition.split('/');
        const values = conditionValue.split('/');
        
        // 所有條件都必須滿足（AND邏輯）
        for (let i = 0; i < conditions.length && i < values.length; i++) {
            if (!checkSingleCondition(conditions[i].trim(), values[i].trim(), character, config, stats)) {
                return false;
            }
        }
        return true;
    }
    
    // 處理單一條件
    return checkSingleCondition(condition, conditionValue, character, config, stats);
}

// 檢查單一條件
function checkSingleCondition(condition, conditionValue, character, config, stats) {
    switch (condition) {
        case '角色屬性':
            return character && character.屬性 === conditionValue;
            
        case '敵人弱點':
            return config && config.enemy && config.enemy.weaknesses.includes(conditionValue);
            
        case '攻擊種類':
            // 檢查當前攻擊種類是否匹配
            if (!config || !config.attackType) {
                return false;
            }
            const attackType = config.attackType;
            
            // 攻擊類型映射表（HTML選項 -> CSV條件值）
            const attackTypeMapping = {
                '普攻': '普通攻擊',
                '強化普攻': '普通攻擊',
                '戰技': '戰技',
                '強化戰技': '戰技',
                '終結技': '終結技',
                '追加攻擊': '追加攻擊',
                '強化追加攻擊': '追加攻擊',
                'dot攻擊': 'dot攻擊',
                '憶靈攻擊': '憶靈攻擊',
                '強化憶靈攻擊': '憶靈攻擊'
            };
            
            // 將HTML中的攻擊類型映射到CSV中的條件值
            const mappedAttackType = attackTypeMapping[attackType] || attackType;
            
            return mappedAttackType === conditionValue;
            
        default:
            // 處理數值比較條件 (例如: 值(速度)<, 值(擊破特攻)>=)
            if (condition.startsWith('值(') && condition.includes(')')) {
                const match = condition.match(/值\(([^)]+)\)(.+)/);
                if (match) {
                    const statName = match[1];
                    const operator = match[2];
                    
                    // 獲取角色對應的數值
                    let statValue = 0;
                    
                    // 從統計數據中獲取數值，支持效果抗性別名
                    switch (statName) {
                        case '速度':
                            statValue = stats && stats.totalSpeed !== undefined ? stats.totalSpeed : (parseFloat(character.速度) || 0);
                            break;
                        case '擊破特攻':
                            statValue = stats && stats.breakEffect !== undefined ? stats.breakEffect : 0;
                            break;
                        case '攻擊力':
                            statValue = stats && stats.totalAtk !== undefined ? stats.totalAtk : 0;
                            break;
                        case '生命值':
                            statValue = stats && stats.totalHp !== undefined ? stats.totalHp : 0;
                            break;
                        case '防禦力':
                            statValue = stats && stats.totalDef !== undefined ? stats.totalDef : 0;
                            break;
                        case '暴擊率':
                        case '爆擊率':  // 支持CSV中使用的詞彙
                            statValue = stats && stats.critRate !== undefined ? stats.critRate : 0;
                            break;
                        case '暴擊傷害':
                        case '爆擊傷害':  // 支持CSV中使用的詞彙
                            statValue = stats && stats.critDmg !== undefined ? stats.critDmg : 0;
                            break;
                        case '效果命中':
                            statValue = stats && stats.effectHit !== undefined ? stats.effectHit : 0;
                            break;
                        case '效果抵抗':
                        case '效果抗性':  // 支持效果抗性別名
                            statValue = stats && stats.effectRes !== undefined ? stats.effectRes : 0;
                            break;
                        case '能量恢復效率':
                            statValue = stats && stats.energyRegen !== undefined ? stats.energyRegen : 100;
                            break;
                        case '治療量加成':
                            statValue = stats && stats.healingBonus !== undefined ? stats.healingBonus : 0;
                            break;
                        default:
                            // 如果找不到對應的屬性，嘗試直接從stats中獲取
                            if (stats && stats[statName] !== undefined) {
                                statValue = stats[statName];
                            } else if (character && character[statName] !== undefined) {
                                statValue = parseFloat(character[statName]) || 0;
                            }
                            break;
                    }
                    
                    // 解析條件值
                    const targetValue = parseFloat(conditionValue.replace('%', '')) || 0;
                    
                    // 執行比較
                    switch (operator) {
                        case '<':
                            return statValue < targetValue;
                        case '>':
                            return statValue > targetValue;
                        case '<=':
                            return statValue <= targetValue;
                        case '>=':
                            return statValue >= targetValue;
                        case '=':
                        case '==':
                            return statValue === targetValue;
                        default:
                            return false;
                    }
                }
            }
            return false;
    }
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
    
    // 檢查是否為dot攻擊
    const isDotAttack = config.attackType === 'dot攻擊';
    
    // dot攻擊不會暴擊，其他攻擊類型計算暴擊
    let fullCritDamage, expectedDamage;
    
    if (isDotAttack) {
        // dot攻擊不會暴擊，所有傷害都是基礎傷害
        fullCritDamage = baseDamage;
        expectedDamage = baseDamage;
    } else {
    // 暴擊傷害（假設暴率100%）
        fullCritDamage = baseDamage * (1 + stats.critDmg / 100);
    
    // 期望值傷害（1 + 暴擊率% * 暴擊傷害%）
        // 確保暴擊率不超過100%
        const effectiveCritRate = Math.min(100, stats.critRate);
        expectedDamage = baseDamage * (1 + effectiveCritRate / 100 * stats.critDmg / 100);
    }
    
    return {
        damage: {
        base: nonCritDamage,
        crit: fullCritDamage,
        average: expectedDamage
        },
        actualResistance: enemyResistance
    };
}

// 生成數值分解顯示
function generateStatBreakdown(baseValue, totalValue, decimalPlaces) {
    const safeNumber = (value) => isNaN(value) || value === null || value === undefined ? 0 : value;
    const base = safeNumber(baseValue);
    const total = safeNumber(totalValue);
    const difference = total - base;
    
    if (Math.abs(difference) < 0.01) {
        // 如果差值很小，只顯示基礎值
        return `<span class="base-value">${base.toFixed(decimalPlaces)}</span>`;
    } else if (difference > 0) {
        // 正值用藍色顯示
        return `<span class="base-value">${base.toFixed(decimalPlaces)}</span><span class="bonus-value">+${difference.toFixed(decimalPlaces)}</span>`;
    } else {
        // 負值用紅色顯示
        return `<span class="base-value">${base.toFixed(decimalPlaces)}</span><span class="penalty-value">${difference.toFixed(decimalPlaces)}</span>`;
    }
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
    
    // 顯示角色屬性
    document.getElementById('total-hp').textContent = safeNumber(stats.totalHp).toFixed(decimalPlaces);
    document.getElementById('total-def').textContent = safeNumber(stats.totalDef).toFixed(decimalPlaces);
    document.getElementById('total-speed').textContent = safeNumber(stats.totalSpeed).toFixed(decimalPlaces);
    document.getElementById('total-break-effect').textContent = safeNumber(stats.breakEffect).toFixed(decimalPlaces) + '%';
    document.getElementById('total-healing-bonus').textContent = safeNumber(stats.healingBonus).toFixed(decimalPlaces) + '%';
    document.getElementById('total-effect-hit').textContent = safeNumber(stats.effectHit).toFixed(decimalPlaces) + '%';
    document.getElementById('total-effect-res').textContent = safeNumber(stats.effectRes).toFixed(decimalPlaces) + '%';
    document.getElementById('total-energy-regen').textContent = safeNumber(stats.energyRegen || 100).toFixed(decimalPlaces) + '%';
    
    // 添加數值分解顯示
    document.getElementById('atk-breakdown').innerHTML = generateStatBreakdown(stats.baseAtk, stats.totalAtk, decimalPlaces);
    document.getElementById('hp-breakdown').innerHTML = generateStatBreakdown(stats.baseHp, stats.totalHp, decimalPlaces);
    document.getElementById('def-breakdown').innerHTML = generateStatBreakdown(stats.baseDef, stats.totalDef, decimalPlaces);
    document.getElementById('speed-breakdown').innerHTML = generateStatBreakdown(stats.baseSpeed, stats.totalSpeed, decimalPlaces);
    
    // 更新總儀器評分顯示
    updateAllRelicRatings();
    
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

// 隨機生成儀器
function randomizeRelic(piece, mode = 'normal') {
    const pieceElement = document.querySelector(`[data-piece="${piece}"]`);
    if (!pieceElement) return;
    
    // 獲取當前角色
    const characterName = document.getElementById('character-select').value;
    const character = characterName ? characterData.find(c => c.角色 === characterName) : null;
    const characterStatInfo = character ? characterStatData.find(c => c.角色 === characterName) : null;
    
    // 隨機主詞條
    randomizeMainStat(pieceElement, piece, characterStatInfo);
    
    // 隨機副詞條
    randomizeSubStats(pieceElement, characterStatInfo, mode);
    
    // 更新評分
    updateAllRelicRatings();
}

// 隨機主詞條
function randomizeMainStat(pieceElement, piece, characterStatInfo) {
    const mainStatSelect = pieceElement.querySelector('.main-stat-select');
    const mainStatValue = pieceElement.querySelector('.main-stat-value');
    
    // 如果用戶已經選擇了主詞條，就不要動
    if (mainStatSelect.value) {
        // 但要更新數值為滿級數值
        const statType = mainStatSelect.value;
        if (mainStatMaxValues[statType] !== undefined) {
            mainStatValue.value = mainStatMaxValues[statType];
        }
        return;
    }
    
    // 獲取可選的主詞條
    const availableOptions = Array.from(mainStatSelect.options).slice(1).map(option => option.value);
    let selectedStat;
    
    if (characterStatInfo) {
        // 嘗試從推薦主詞條中選擇
        const pieceMapping = {
            'body': '軀幹推薦主詞條',
            'feet': '腳部推薦主詞條', 
            'sphere': '位面球推薦主詞條',
            'rope': '連結繩推薦主詞條'
        };
        
        const recommendedStats = characterStatInfo[pieceMapping[piece]];
        if (recommendedStats && recommendedStats.trim() !== '') {
            const recommended = recommendedStats.split('/').map(s => s.trim()).filter(s => s);
            const availableRecommended = recommended.filter(stat => availableOptions.includes(stat));
            
            if (availableRecommended.length > 0) {
                selectedStat = availableRecommended[Math.floor(Math.random() * availableRecommended.length)];
            }
        }
    }
    
    // 如果沒有推薦主詞條或角色未選擇，從所有可選項中隨機
    if (!selectedStat) {
        selectedStat = availableOptions[Math.floor(Math.random() * availableOptions.length)];
    }
    
    // 設置主詞條
    mainStatSelect.value = selectedStat;
    if (mainStatMaxValues[selectedStat] !== undefined) {
        mainStatValue.value = mainStatMaxValues[selectedStat];
    }
}

// 權重隨機系統
const subStatWeights = {
    'HP': [1, 4, 9],
    'ATK': [1, 4, 9],
    'DEF': [1, 4, 9],
    'HP%': [1, 4, 9],
    'ATK%': [1, 4, 9],
    'DEF%': [1, 4, 9],
    '暴擊率': [1, 4, 9],
    '暴擊傷害': [1, 4, 9],
    '效果命中': [1, 4, 9],
    '效果抵抗': [1, 4, 9],
    '擊破特攻': [1, 4, 9],
    '速度': [1, 4, 9]
};

// 權重隨機選擇數值
function getWeightedRandomValue(statType, useWeights = false) {
    const ranges = subStatRanges[statType];
    
    if (!useWeights) {
        // 普通隨機：等機率選擇
        return ranges[Math.floor(Math.random() * ranges.length)];
    }
    
    // 權重隨機：根據權重選擇
    const weights = subStatWeights[statType];
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return ranges[i];
        }
    }
    
    // 如果出現意外，返回最高值
    return ranges[ranges.length - 1];
}

// 隨機副詞條
function randomizeSubStats(pieceElement, characterStatInfo, mode = 'normal') {
    const subStatElements = pieceElement.querySelectorAll('.sub-stat');
    
    // 獲取所有可能的副詞條類型
    const allSubStats = Object.keys(subStatRanges);
    
    // 確定重要和次要的副詞條
    let importantStats = [];
    let secondaryStats = [];
    let normalStats = [];
    
    if (characterStatInfo) {
        allSubStats.forEach(stat => {
            const priority = characterStatInfo[stat];
            if (priority === '重要') {
                importantStats.push(stat);
            } else if (priority === '次要') {
                secondaryStats.push(stat);
            } else {
                normalStats.push(stat);
            }
        });
    } else {
        normalStats = [...allSubStats];
    }
    
    // 選擇4個副詞條
    let selectedStats = [];
    
    if (characterStatInfo && importantStats.length > 0) {
        const shuffledImportant = [...importantStats].sort(() => Math.random() - 0.5);
        
        if (mode === 'super') {
            // 超級幸運模式：100%機率有3重要副詞條，75%機率有4重要副詞條
            const numImportant = Math.random() < 0.75 ? 4 : 3;
            selectedStats.push(...shuffledImportant.slice(0, Math.min(numImportant, shuffledImportant.length)));
            
            // 如果重要副詞條不足，用次要副詞條補充
            if (selectedStats.length < numImportant) {
                const remaining = [...secondaryStats].filter(stat => !selectedStats.includes(stat));
                const shuffledRemaining = remaining.sort(() => Math.random() - 0.5);
                selectedStats.push(...shuffledRemaining.slice(0, numImportant - selectedStats.length));
            }
            
            // 剩餘位置從其他副詞條中選
            const remaining = [...secondaryStats, ...normalStats].filter(stat => !selectedStats.includes(stat));
            const shuffledRemaining = remaining.sort(() => Math.random() - 0.5);
            selectedStats.push(...shuffledRemaining.slice(0, 4 - selectedStats.length));
        } else if (mode === 'lucky') {
            // 幸運模式：100%機率有2重要副詞條，50%機率有3重要副詞條
            const numImportant = Math.random() < 0.5 ? 3 : 2;
            selectedStats.push(...shuffledImportant.slice(0, Math.min(numImportant, shuffledImportant.length)));
            
            // 如果重要副詞條不足，用次要副詞條補充
            if (selectedStats.length < numImportant) {
                const remaining = [...secondaryStats].filter(stat => !selectedStats.includes(stat));
                const shuffledRemaining = remaining.sort(() => Math.random() - 0.5);
                selectedStats.push(...shuffledRemaining.slice(0, numImportant - selectedStats.length));
            }
            
            // 剩餘位置從其他副詞條中選
            const remaining = [...secondaryStats, ...normalStats].filter(stat => !selectedStats.includes(stat));
            const shuffledRemaining = remaining.sort(() => Math.random() - 0.5);
            selectedStats.push(...shuffledRemaining.slice(0, 4 - selectedStats.length));
        } else {
            // 普通模式：100%機率有1重要副詞條，50%機率有2重要副詞條
            const numImportant = Math.random() < 0.5 ? 2 : 1;
            selectedStats.push(...shuffledImportant.slice(0, Math.min(numImportant, shuffledImportant.length)));
            
            // 剩餘位置從其他類型中選
            const remaining = [...secondaryStats, ...normalStats].filter(stat => !selectedStats.includes(stat));
            const shuffledRemaining = remaining.sort(() => Math.random() - 0.5);
            selectedStats.push(...shuffledRemaining.slice(0, 4 - selectedStats.length));
        }
    } else {
        // 沒有角色或沒有重要副詞條，隨機選4個
        const shuffled = allSubStats.sort(() => Math.random() - 0.5);
        selectedStats = shuffled.slice(0, 4);
    }
    
    // 確保有4個副詞條
    while (selectedStats.length < 4) {
        const remaining = allSubStats.filter(stat => !selectedStats.includes(stat));
        if (remaining.length > 0) {
            selectedStats.push(remaining[Math.floor(Math.random() * remaining.length)]);
        } else {
            break;
        }
    }
    
    // 設置副詞條基礎值和強化
    const enhancementCounts = [0, 0, 0, 0]; // 4個副詞條的強化次數
    const finalValues = []; // 儲存最終數值
    
    // 先設置基礎值
    subStatElements.forEach((subStatElement, index) => {
        if (index < selectedStats.length) {
            const statType = selectedStats[index];
            const statTypeSelect = subStatElement.querySelector('.sub-stat-type');
            
            // 設置類型
            statTypeSelect.value = statType;
            
            // 設置基礎值（超級幸運模式使用權重隨機）
            const baseValue = getWeightedRandomValue(statType, mode === 'super');
            finalValues[index] = baseValue;
        } else {
            // 清空多餘的副詞條
            const statTypeSelect = subStatElement.querySelector('.sub-stat-type');
            const statValueInput = subStatElement.querySelector('.sub-stat-value');
            statTypeSelect.value = '';
            statValueInput.value = '';
            finalValues[index] = 0;
        }
    });
    
    // 隨機總強化次數
    const totalEnhancements = (mode === 'super' || mode === 'lucky') ? 5 : (Math.random() < 0.5 ? 4 : 5);
    
    // 分配強化次數
    for (let i = 0; i < totalEnhancements; i++) {
        const availableSlots = [];
        
        if ((mode === 'super' || mode === 'lucky') && characterStatInfo) {
            // 幸運/超級幸運模式：重要副詞條的機率是其他副詞條的倍數
            const multiplier = mode === 'super' ? 3 : 2; // 超級幸運3倍，幸運2倍
            
            for (let j = 0; j < Math.min(selectedStats.length, 4); j++) {
                const statType = selectedStats[j];
                const priority = characterStatInfo[statType];
                
                if (priority === '重要') {
                    // 重要副詞條加入多次，增加被選中的機率
                    for (let k = 0; k < multiplier; k++) {
                        availableSlots.push(j);
                    }
                } else {
                    availableSlots.push(j);
                }
            }
        } else {
            // 普通模式：所有副詞條機率相等
            for (let j = 0; j < Math.min(selectedStats.length, 4); j++) {
                availableSlots.push(j);
            }
        }
        
        if (availableSlots.length > 0) {
            const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
            enhancementCounts[randomSlot]++;
            
            // 增加該副詞條的數值（超級幸運模式使用權重隨機）
            const statType = selectedStats[randomSlot];
            const enhanceValue = getWeightedRandomValue(statType, mode === 'super');
            finalValues[randomSlot] += enhanceValue;
        }
    }
    
    // 設置最終數值
    subStatElements.forEach((subStatElement, index) => {
        const statValueInput = subStatElement.querySelector('.sub-stat-value');
        if (index < selectedStats.length) {
            statValueInput.value = finalValues[index].toFixed(2);
        }
    });
    
    // 添加強化次數指示器
    addEnhancementIndicators(pieceElement, enhancementCounts);
    
    // 更新所有副詞條的選中樣式
    subStatElements.forEach((subStatElement) => {
        const statTypeSelect = subStatElement.querySelector('.sub-stat-type');
        updateSelectedSubStatStyle(statTypeSelect);
    });
}

// 添加強化次數指示器
function addEnhancementIndicators(pieceElement, enhancementCounts) {
    // 先移除現有的指示器
    removeEnhancementIndicators(pieceElement);
    
    const subStatElements = pieceElement.querySelectorAll('.sub-stat');
    subStatElements.forEach((subStatElement, index) => {
        const statTypeSelect = subStatElement.querySelector('.sub-stat-type');
        
        // 檢查是否有副詞條
        if (statTypeSelect.value) {
            const count = enhancementCounts[index];
            
            // 創建指示器
            const indicator = document.createElement('div');
            indicator.className = 'enhancement-indicator';
            indicator.textContent = count;
            
            // 檢查是否為重要副詞條
            const currentCharacter = document.getElementById('character-select').value;
            const characterStatInfo = characterStatData.find(char => char.角色 === currentCharacter);
            const isImportant = characterStatInfo && characterStatInfo[statTypeSelect.value] === '重要';
            
            // 根據重要性和強化次數設置樣式
            if (count === 0) {
                indicator.classList.add('enhancement-zero');
            } else if (isImportant) {
                indicator.classList.add('enhancement-important');
            } else {
                indicator.classList.add('enhancement-normal');
            }
            
            // 創建包裝容器
            const wrapper = document.createElement('div');
            wrapper.className = 'sub-stat-type-with-indicator';
            
            // 插入指示器
            statTypeSelect.parentNode.insertBefore(wrapper, statTypeSelect);
            wrapper.appendChild(indicator);
            wrapper.appendChild(statTypeSelect);
        }
    });
}

// 移除強化次數指示器
function removeEnhancementIndicators(pieceElement) {
    const indicators = pieceElement.querySelectorAll('.enhancement-indicator');
    const wrappers = pieceElement.querySelectorAll('.sub-stat-type-with-indicator');
    
    wrappers.forEach(wrapper => {
        const select = wrapper.querySelector('.sub-stat-type');
        if (select) {
            wrapper.parentNode.insertBefore(select, wrapper);
        }
        wrapper.remove();
    });
}

// 更新選中副詞條的樣式
function updateSelectedSubStatStyle(selectElement) {
    const selectedValue = selectElement.value;
    const currentCharacter = document.getElementById('character-select').value;
    const characterStatInfo = characterStatData.find(char => char.角色 === currentCharacter);
    
    // 移除現有的特殊樣式
    selectElement.classList.remove('selected-important', 'selected-secondary');
    
    if (selectedValue && characterStatInfo) {
        const priority = characterStatInfo[selectedValue];
        if (priority === '重要') {
            selectElement.classList.add('selected-important');
        } else if (priority === '次要') {
            selectElement.classList.add('selected-secondary');
        }
    }
}

// 更新所有副詞條的選中樣式
function updateAllSelectedSubStatStyles() {
    document.querySelectorAll('.sub-stat-type').forEach(selectElement => {
        updateSelectedSubStatStyle(selectElement);
    });
}

// 隨機資訊模態窗口功能
function openRandomInfoModal() {
    const modal = document.getElementById('randomInfoModal');
    modal.classList.add('open');
    
    // 綁定關閉按鈕事件
    const closeBtn = modal.querySelector('.random-info-modal-close');
    closeBtn.addEventListener('click', closeRandomInfoModal);
    
    // 綁定側邊欄切換事件
    const sidebarItems = modal.querySelectorAll('.random-info-modal-sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            switchRandomInfoSection(section);
            
            // 更新側邊欄選中狀態
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 綁定背景點擊關閉事件
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeRandomInfoModal();
        }
    });
    
    // 綁定ESC鍵關閉事件
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeRandomInfoModal();
        }
    });
}

function closeRandomInfoModal() {
    const modal = document.getElementById('randomInfoModal');
    modal.classList.remove('open');
    
    // 移除事件監聽器
    const closeBtn = modal.querySelector('.random-info-modal-close');
    closeBtn.removeEventListener('click', closeRandomInfoModal);
    
    modal.removeEventListener('click', function(e) {
        if (e.target === modal) {
            closeRandomInfoModal();
        }
    });
    
    document.removeEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeRandomInfoModal();
        }
    });
}

function switchRandomInfoSection(section) {
    // 隱藏所有區域
    document.querySelectorAll('.random-info-section-modal').forEach(section => {
        section.style.display = 'none';
    });
    
    // 顯示選中的區域
    const targetSection = document.getElementById(section + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// 光錐選擇模態窗口相關函數
let selectedLightcone = null;
let filteredLightcones = [];

// 打開光錐選擇模態窗口
function openLightconeModal() {
    const modal = document.getElementById('lightconeModal');
    modal.classList.add('open');
    
    // 初始化篩選器
    initializeLightconeFilters();
    
    // 初始化光錐網格
    updateLightconeGrid();
    
    // 綁定模態窗口事件
    bindLightconeModalEvents();
}

// 關閉光錐選擇模態窗口
function closeLightconeModal() {
    const modal = document.getElementById('lightconeModal');
    modal.classList.remove('open');
}

// 初始化光錐篩選器
function initializeLightconeFilters() {
    // 重置所有篩選器
    document.querySelectorAll('.path-checkbox, .star-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 默認顯示所有光錐
    filteredLightcones = [...lightconeData];
}

// 更新光錐網格顯示
function updateLightconeGrid() {
    const grid = document.getElementById('lightcone-grid');
    grid.innerHTML = '';
    
    // 獲取當前選中的角色
    const currentCharacter = document.getElementById('character-select').value;
    
    // 獲取角色信息
    const characterInfo = characterData.find(c => c.角色 === currentCharacter);
    const characterPath = characterInfo ? characterInfo.命途 : null;
    const is6StarCharacter = characterInfo && characterInfo.星數 === '6星';
    
    // 過濾光錐：6星光錐只在選擇6星角色時顯示
    const availableLightcones = filteredLightcones.filter(lightcone => {
        if (lightcone.星數 === '6星') {
            return is6StarCharacter;
        }
        return true;
    });
    
    // 獲取角色推薦光錐
    const characterRecommendation = lightconeRecommendationData.find(rec => rec.角色 === currentCharacter);
    const recommendedLightcones = [];
    const lowerTierLightcones = [];
    
    if (characterRecommendation) {
        // 處理金色推薦
        for (let i = 1; i <= 6; i++) {
            const lightconeName = characterRecommendation[`推薦第${i}順位`];
            if (lightconeName && lightconeName.trim()) {
                recommendedLightcones.push({
                    name: lightconeName,
                    priority: i,
                    tier: 'recommended'
                });
            }
        }
        
        // 處理藍色下位替代
        for (let i = 1; i <= 6; i++) {
            const lightconeName = characterRecommendation[`下位第${i}順位`];
            if (lightconeName && lightconeName.trim()) {
                lowerTierLightcones.push({
                    name: lightconeName,
                    priority: i + 100, // 下位替代的優先級較低
                    tier: 'lower'
                });
            }
        }
    }
    
    // 分類光錐
    const signatureWeapons = [];
    const recommendedWeapons = [];
    const lowerTierWeapons = [];
    const samePathWeapons = [];
    const otherWeapons = [];
    
    availableLightcones.forEach(lightcone => {
        // 檢查是否為專武
        const isSignature = lightcone.專武 && lightcone.專武 === currentCharacter;
        
        // 檢查是否為推薦光錐
        const recommendation = recommendedLightcones.find(rec => rec.name === lightcone.光錐);
        const lowerTierRecommendation = lowerTierLightcones.find(rec => rec.name === lightcone.光錐);
        const isRecommended = !!recommendation;
        const isLowerTier = !!lowerTierRecommendation;
        
        // 檢查是否為同命途光錐
        const isSamePath = characterPath && lightcone.命途 === characterPath;
        
        if (isSignature) {
            signatureWeapons.push({ lightcone, priority: 0, tier: 'signature' });
        } else if (isRecommended) {
            recommendedWeapons.push({ lightcone, priority: recommendation.priority, tier: 'recommended' });
        } else if (isLowerTier) {
            lowerTierWeapons.push({ lightcone, priority: lowerTierRecommendation.priority, tier: 'lower' });
        } else if (isSamePath) {
            samePathWeapons.push({ lightcone, priority: 999, tier: 'same-path' });
        } else {
            otherWeapons.push({ lightcone, priority: 1000, tier: 'other' });
        }
    });
    
    // 對推薦光錐按優先級排序
    recommendedWeapons.sort((a, b) => a.priority - b.priority);
    lowerTierWeapons.sort((a, b) => a.priority - b.priority);
    
    // 合併所有光錐，按優先級排序
    const allWeapons = [
        ...signatureWeapons,
        ...recommendedWeapons,
        ...lowerTierWeapons,
        ...samePathWeapons,
        ...otherWeapons
    ];
    
    // 顯示光錐卡片
    allWeapons.forEach(({ lightcone, tier }) => {
        const card = createLightconeCard(lightcone, tier);
        grid.appendChild(card);
    });
}

// 創建光錐卡片
function createLightconeCard(lightcone, tier = 'other') {
    const card = document.createElement('div');
    card.className = 'lightcone-card';
    card.dataset.lightcone = lightcone.光錐;
    
    // 檢查是否為當前選中的光錐
    const currentLightcone = document.getElementById('lightcone-select').value;
    if (lightcone.光錐 === currentLightcone) {
        card.classList.add('selected');
    }
    
    // 檢查是否為當前角色的專武
    const currentCharacter = document.getElementById('character-select').value;
    const isSignatureWeapon = lightcone.專武 && lightcone.專武 === currentCharacter;
    if (isSignatureWeapon) {
        card.classList.add('signature-weapon');
    }
    
    // 檢查是否為推薦光錐或下位替代
    const characterRecommendation = lightconeRecommendationData.find(rec => rec.角色 === currentCharacter);
    let isRecommended = false;
    let isLowerTier = false;
    
    if (characterRecommendation) {
        // 檢查金色推薦
        for (let i = 1; i <= 6; i++) {
            const lightconeName = characterRecommendation[`推薦第${i}順位`];
            if (lightconeName && lightconeName.trim() === lightcone.光錐) {
                isRecommended = true;
                break;
            }
        }
        
        // 檢查藍色下位替代
        if (!isRecommended) {
            for (let i = 1; i <= 6; i++) {
                const lightconeName = characterRecommendation[`下位第${i}順位`];
                if (lightconeName && lightconeName.trim() === lightcone.光錐) {
                    isLowerTier = true;
                    break;
                }
            }
        }
    }
    
    // 為推薦光錐添加樣式類（但不覆蓋專武）
    if (isRecommended && !isSignatureWeapon) {
        card.classList.add('recommended-weapon');
    } else if (isLowerTier && !isSignatureWeapon) {
        card.classList.add('lower-tier-weapon');
    }
    
    // 光錐圖片
    const image = document.createElement('img');
    image.className = 'lightcone-image';
    image.src = `assets/img/light_cone/${lightcone.光錐}.png`;
    image.alt = lightcone.光錐;
    image.onerror = function() {
        // 嘗試jpg格式
        if (this.src.endsWith('.png')) {
            this.src = `assets/img/light_cone/${lightcone.光錐}.jpg`;
        } else {
            // 如果jpg也不存在，顯示預設圖片或隱藏
            this.style.display = 'none';
        }
    };
    
    // 光錐名稱
    const name = document.createElement('div');
    name.className = 'lightcone-name';
    name.textContent = lightcone.光錐;
    
    // 光錐信息（命途和星數）
    const info = document.createElement('div');
    info.className = 'lightcone-info';
    
    const path = document.createElement('span');
    path.className = `lightcone-path ${getPathClass(lightcone.命途)}`;
    path.textContent = lightcone.命途;
    
    const stars = document.createElement('span');
    stars.className = 'lightcone-stars';
    stars.textContent = '⭐'.repeat(parseInt(lightcone.星數) || 0);
    
    info.appendChild(path);
    info.appendChild(stars);
    
    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(info);
    
    // 添加專武標記
    if (isSignatureWeapon) {
        const signatureBadge = document.createElement('div');
        signatureBadge.className = 'signature-badge';
        signatureBadge.textContent = '專武';
        card.appendChild(signatureBadge);
    }
    
    // 添加推薦標記
    if (isRecommended && !isSignatureWeapon) {
        const recommendBadge = document.createElement('div');
        recommendBadge.className = 'recommend-badge';
        recommendBadge.textContent = '推薦';
        card.appendChild(recommendBadge);
    } else if (isLowerTier && !isSignatureWeapon) {
        const lowerTierBadge = document.createElement('div');
        lowerTierBadge.className = 'lower-tier-badge';
        lowerTierBadge.textContent = '下位';
        card.appendChild(lowerTierBadge);
    }
    
    // 點擊事件
    card.addEventListener('click', () => selectLightcone(lightcone));
    
    return card;
}

// 獲取命途對應的CSS類名
function getPathClass(path) {
    const pathMap = {
        '毀滅': 'destruction',
        '巡獵': 'hunt',
        '智識': 'erudition',
        '同諧': 'harmony',
        '虛無': 'nihility',
        '存護': 'preservation',
        '豐饒': 'abundance',
        '記憶': 'remembrance'
    };
    return pathMap[path] || '';
}

// 選擇光錐
function selectLightcone(lightcone) {
    // 更新隱藏的select元素
    document.getElementById('lightcone-select').value = lightcone.光錐;
    
    // 更新按鈕顯示文字
    document.getElementById('lightcone-select-text').textContent = lightcone.光錐;
    
    // 更新光錐數據顯示
    updateLightconeData();
    
    // 關閉模態窗口
    closeLightconeModal();
}

// 應用篩選器
function applyLightconeFilters() {
    const selectedPaths = Array.from(document.querySelectorAll('.path-checkbox:checked')).map(cb => cb.value);
    const selectedStars = Array.from(document.querySelectorAll('.star-checkbox:checked')).map(cb => cb.value);
    
    filteredLightcones = lightconeData.filter(lightcone => {
        // 命途篩選
        const pathMatch = selectedPaths.length === 0 || selectedPaths.includes(lightcone.命途);
        
        // 星數篩選 (處理"5星"格式)
        const lightconeStarNumber = lightcone.星數 ? lightcone.星數.replace('星', '') : '';
        const starMatch = selectedStars.length === 0 || selectedStars.includes(lightconeStarNumber);
        
        return pathMatch && starMatch;
    });
    
    updateLightconeGrid();
}

// 清除所有篩選器
function clearAllFilters() {
    document.querySelectorAll('.path-checkbox, .star-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    applyLightconeFilters();
}

// 全選所有篩選器
function selectAllFilters() {
    document.querySelectorAll('.path-checkbox, .star-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
    applyLightconeFilters();
}

// 綁定光錐模態窗口事件
function bindLightconeModalEvents() {
    // 關閉按鈕
    const closeBtn = document.querySelector('.lightcone-modal-close');
    closeBtn.removeEventListener('click', closeLightconeModal); // 移除舊的監聽器
    closeBtn.addEventListener('click', closeLightconeModal);
    
    // 點擊背景關閉
    const modal = document.getElementById('lightconeModal');
    modal.removeEventListener('click', handleModalBackgroundClick); // 移除舊的監聽器
    modal.addEventListener('click', handleModalBackgroundClick);
    
    // 篩選器變化事件
    document.querySelectorAll('.path-checkbox, .star-checkbox').forEach(checkbox => {
        checkbox.removeEventListener('change', applyLightconeFilters); // 移除舊的監聽器
        checkbox.addEventListener('change', applyLightconeFilters);
    });
    
    // 篩選器按鈕事件
    const clearBtn = document.querySelector('.filter-clear-btn');
    const allBtn = document.querySelector('.filter-all-btn');
    
    clearBtn.removeEventListener('click', clearAllFilters); // 移除舊的監聽器
    clearBtn.addEventListener('click', clearAllFilters);
    
    allBtn.removeEventListener('click', selectAllFilters); // 移除舊的監聽器
    allBtn.addEventListener('click', selectAllFilters);
    
    // 卸下光錐按鈕事件
    const removeBtn = document.querySelector('.lightcone-remove-btn');
    removeBtn.removeEventListener('click', removeLightcone);
    removeBtn.addEventListener('click', removeLightcone);
    
    // 更新卸下按鈕狀態
    updateLightconeRemoveButton();
    
    // ESC鍵關閉
    document.removeEventListener('keydown', handleEscapeKey); // 移除舊的監聽器
    document.addEventListener('keydown', handleEscapeKey);
}

// 處理模態窗口背景點擊
function handleModalBackgroundClick(event) {
    if (event.target === event.currentTarget) {
        closeLightconeModal();
    }
}

// 處理ESC鍵
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        const lightconeModal = document.getElementById('lightconeModal');
        const characterModal = document.getElementById('characterModal');
        if (lightconeModal.classList.contains('open')) {
            closeLightconeModal();
        } else if (characterModal.classList.contains('open')) {
            closeCharacterModal();
        }
    }
}

// 角色選擇模態窗口功能
let filteredCharacters = [];

// 打開角色選擇模態窗口
function openCharacterModal() {
    const modal = document.getElementById('characterModal');
    modal.classList.add('open');
    
    // 初始化篩選器
    initializeCharacterFilters();
    
    // 初始化角色網格
    updateCharacterGrid();
    
    // 綁定模態窗口事件
    bindCharacterModalEvents();
}

// 關閉角色選擇模態窗口
function closeCharacterModal() {
    const modal = document.getElementById('characterModal');
    modal.classList.remove('open');
}

// 初始化角色篩選器
function initializeCharacterFilters() {
    // 重置所有篩選器
    document.querySelectorAll('.character-star-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.character-path-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.character-element-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 默認顯示所有角色
    filteredCharacters = [...characterData];
}

// 更新角色網格顯示
function updateCharacterGrid() {
    const grid = document.getElementById('character-grid');
    grid.innerHTML = '';
    
    // 過濾角色：6星角色有20%機率出現
    const charactersToShow = filteredCharacters.filter(character => {
        if (character.星數 === '6星') {
            // 6星角色有20%機率出現
            return Math.random() < 0.2;
        }
        return true;
    });
    
    charactersToShow.forEach(character => {
        const card = createCharacterCard(character);
        grid.appendChild(card);
    });
}

// 創建角色卡片
function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.character = character.角色;
    
    // 檢查是否為當前選中的角色
    const currentCharacter = document.getElementById('character-select').value;
    if (character.角色 === currentCharacter) {
        card.classList.add('selected');
    }
    
    // 角色圖片
    const image = document.createElement('img');
    image.className = 'character-image';
    image.src = `assets/img/characters/${character.角色}.png`;
    image.alt = character.角色;
    image.onerror = function() {
        // 嘗試jpg格式
        if (this.src.endsWith('.png')) {
            this.src = `assets/img/characters/${character.角色}.jpg`;
        } else {
            // 如果jpg也不存在，顯示預設圖片或隱藏
            this.style.display = 'none';
        }
    };
    
    // 角色名稱
    const name = document.createElement('div');
    name.className = 'character-name';
    name.textContent = character.角色;
    
    // 角色信息（命途和星數）
    const info = document.createElement('div');
    info.className = 'character-info';
    
    // 左側容器（命途和屬性）
    const infoLeft = document.createElement('div');
    infoLeft.className = 'character-info-left';
    
    const path = document.createElement('span');
    path.className = `character-path ${getPathClass(character.命途)}`;
    path.textContent = character.命途;
    
    // 添加屬性圖標
    const element = document.createElement('span');
    element.className = 'character-element';
    
    const elementImg = document.createElement('img');
    elementImg.src = `assets/img/elements/${character.屬性}.png`;
    elementImg.alt = character.屬性;
    elementImg.onerror = function() {
        // 如果圖片不存在，顯示文字
        element.textContent = character.屬性;
        element.removeChild(this);
    };
    
    element.appendChild(elementImg);
    
    infoLeft.appendChild(path);
    infoLeft.appendChild(element);
    
    // 右側星數
    const stars = document.createElement('span');
    stars.className = 'character-stars';
    stars.textContent = '⭐'.repeat(parseInt(character.星數) || 0);
    
    info.appendChild(infoLeft);
    info.appendChild(stars);
    
    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(info);
    
    // 點擊事件
    card.addEventListener('click', () => selectCharacter(character));
    
    return card;
}

// 選擇角色
function selectCharacter(character) {
    // 更新隱藏的input元素
    document.getElementById('character-select').value = character.角色;
    
    // 更新按鈕顯示文字
    document.getElementById('character-select-text').textContent = character.角色;
    
    // 觸發change事件來更新角色數據顯示
    const event = new Event('change', { bubbles: true });
    document.getElementById('character-select').dispatchEvent(event);
    
    // 關閉模態窗口
    closeCharacterModal();
}

// 應用角色篩選器
function applyCharacterFilters() {
    const selectedStars = Array.from(document.querySelectorAll('.character-star-checkbox:checked')).map(cb => cb.value);
    const selectedPaths = Array.from(document.querySelectorAll('.character-path-checkbox:checked')).map(cb => cb.value);
    const selectedElements = Array.from(document.querySelectorAll('.character-element-checkbox:checked')).map(cb => cb.value);
    
    filteredCharacters = characterData.filter(character => {
        // 6星角色不參與篩選器，由updateCharacterGrid中的機率控制
        if (character.星數 === '6星') {
            return true;
        }
        
        // 星數篩選 (處理"5星"格式)
        const characterStarNumber = character.星數 ? character.星數.replace('星', '') : '';
        const starMatch = selectedStars.length === 0 || selectedStars.includes(characterStarNumber);
        
        // 命途篩選
        const pathMatch = selectedPaths.length === 0 || selectedPaths.includes(character.命途);
        
        // 屬性篩選
        const elementMatch = selectedElements.length === 0 || selectedElements.includes(character.屬性);
        
        return starMatch && pathMatch && elementMatch;
    });
    
    updateCharacterGrid();
}

// 清除所有角色篩選器
function clearAllCharacterFilters() {
    document.querySelectorAll('.character-star-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.character-path-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.character-element-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    applyCharacterFilters();
}

// 全選所有角色篩選器
function selectAllCharacterFilters() {
    document.querySelectorAll('.character-star-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
    document.querySelectorAll('.character-path-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
    document.querySelectorAll('.character-element-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
    applyCharacterFilters();
}

// 綁定角色模態窗口事件
function bindCharacterModalEvents() {
    // 關閉按鈕
    const closeBtn = document.querySelector('.character-modal-close');
    closeBtn.removeEventListener('click', closeCharacterModal);
    closeBtn.addEventListener('click', closeCharacterModal);
    
    // 點擊背景關閉
    const modal = document.getElementById('characterModal');
    modal.removeEventListener('click', handleCharacterModalBackgroundClick);
    modal.addEventListener('click', handleCharacterModalBackgroundClick);
    
    // 篩選器變化事件
    document.querySelectorAll('.character-star-checkbox').forEach(checkbox => {
        checkbox.removeEventListener('change', applyCharacterFilters);
        checkbox.addEventListener('change', applyCharacterFilters);
    });
    
    document.querySelectorAll('.character-path-checkbox').forEach(checkbox => {
        checkbox.removeEventListener('change', applyCharacterFilters);
        checkbox.addEventListener('change', applyCharacterFilters);
    });
    
    document.querySelectorAll('.character-element-checkbox').forEach(checkbox => {
        checkbox.removeEventListener('change', applyCharacterFilters);
        checkbox.addEventListener('change', applyCharacterFilters);
    });
    
    // 篩選器按鈕事件
    const clearBtn = document.querySelector('.character-filter-clear-btn');
    const allBtn = document.querySelector('.character-filter-all-btn');
    
    clearBtn.removeEventListener('click', clearAllCharacterFilters);
    clearBtn.addEventListener('click', clearAllCharacterFilters);
    
    allBtn.removeEventListener('click', selectAllCharacterFilters);
    allBtn.addEventListener('click', selectAllCharacterFilters);
}

// 處理角色模態窗口背景點擊
function handleCharacterModalBackgroundClick(event) {
    if (event.target === event.currentTarget) {
        closeCharacterModal();
    }
}

// 光錐卸下功能
function removeLightcone() {
    // 清空光錐選擇
    document.getElementById('lightcone-select').value = '';
    document.getElementById('lightcone-select-text').textContent = '請選擇光錐';
    
    // 更新光錐數據顯示
    updateLightconeData();
    
    // 關閉模態窗口
    closeLightconeModal();
}

// 更新光錐卸下按鈕的顯示狀態
function updateLightconeRemoveButton() {
    const removeBtn = document.getElementById('lightcone-remove-btn');
    const currentLightcone = document.getElementById('lightcone-select').value;
    
    if (currentLightcone) {
        removeBtn.style.display = 'inline-block';
    } else {
        removeBtn.style.display = 'none';
    }
}

// 測試光錐數據讀取
function testLightconeData() {
    // 測試功能已移除
}

// 儀器選擇模態窗口相關函數
let selectedOuterRelics = [];
let selectedInnerRelic = null;
let filteredRelics = [];

// 打開儀器選擇模態窗口
function openRelicModal() {
    const modal = document.getElementById('relicModal');
    modal.classList.add('open');
    
    // 初始化選擇狀態
    initializeRelicSelection();
    
    // 初始化篩選器
    initializeRelicFilters();
    
    // 初始化儀器網格
    updateRelicGrid();
    
    // 綁定模態窗口事件
    bindRelicModalEvents();
}

// 關閉儀器選擇模態窗口
function closeRelicModal() {
    const modal = document.getElementById('relicModal');
    modal.classList.remove('open');
}

// 初始化儀器選擇狀態
function initializeRelicSelection() {
    // 從隱藏的select元素讀取當前選擇
    const outer1 = document.getElementById('outer-relic-1').value;
    const outer2 = document.getElementById('outer-relic-2').value;
    const inner = document.getElementById('inner-relic').value;
    
    selectedOuterRelics = [outer1, outer2].filter(v => v);
    selectedInnerRelic = inner || null;
}

// 初始化儀器篩選器
function initializeRelicFilters() {
    // 重置所有篩選器
    document.querySelectorAll('.relic-type-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 默認顯示所有儀器
    filteredRelics = [...relicData];
}

// 更新儀器網格顯示
function updateRelicGrid() {
    const grid = document.getElementById('relic-grid');
    grid.innerHTML = '';
    
    // 獲取當前選中的角色
    const currentCharacter = document.getElementById('character-select').value;
    
    // 獲取角色推薦儀器
    const characterRecommendation = relicRecommendationData.find(rec => rec.角色 === currentCharacter);
    const recommendedOuterRelics = [];
    const recommendedInnerRelics = [];
    
    if (characterRecommendation) {
        // 處理外圈推薦
        for (let i = 1; i <= 5; i++) {
            const outerRec = characterRecommendation[`外圈第${i}順位`];
            if (outerRec && outerRec.trim()) {
                recommendedOuterRelics.push({
                    recommendation: outerRec,
                    priority: i
                });
            }
        }
        
        // 處理內圈推薦
        for (let i = 1; i <= 4; i++) {
            const innerRec = characterRecommendation[`內圈第${i}順位`];
            if (innerRec && innerRec.trim()) {
                recommendedInnerRelics.push({
                    recommendation: innerRec,
                    priority: i
                });
            }
        }
    }
    
    // 分類儀器
    const outerRecommendedRelics = [];
    const innerRecommendedRelics = [];
    const otherOuterRelics = [];
    const otherInnerRelics = [];
    
    filteredRelics.forEach(relic => {
        const isOuter = relic.種類 === '外圈';
        const isInner = relic.種類 === '內圈';
        
        let isRecommended = false;
        let priority = 999;
        
        if (isOuter) {
            // 檢查是否為推薦外圈儀器
            for (const rec of recommendedOuterRelics) {
                if (rec.recommendation.trim() === relic.儀器) {
                    isRecommended = true;
                    priority = rec.priority;
                    break;
                }
            }
            
            if (isRecommended) {
                outerRecommendedRelics.push({ relic, priority });
            } else {
                otherOuterRelics.push({ relic, priority: 999 });
            }
        } else if (isInner) {
            // 檢查是否為推薦內圈儀器
            for (const rec of recommendedInnerRelics) {
                if (rec.recommendation.trim() === relic.儀器) {
                    isRecommended = true;
                    priority = rec.priority;
                    break;
                }
            }
            
            if (isRecommended) {
                innerRecommendedRelics.push({ relic, priority });
            } else {
                otherInnerRelics.push({ relic, priority: 999 });
            }
        }
    });
    
    // 對推薦儀器按優先級排序
    outerRecommendedRelics.sort((a, b) => a.priority - b.priority);
    innerRecommendedRelics.sort((a, b) => a.priority - b.priority);
    
    // 合併所有儀器，按優先級排序
    const allRelics = [
        ...outerRecommendedRelics,
        ...innerRecommendedRelics,
        ...otherOuterRelics,
        ...otherInnerRelics
    ];
    
    // 顯示儀器卡片
    allRelics.forEach(({ relic }) => {
        const card = createRelicCard(relic);
        grid.appendChild(card);
    });
    
    // 更新選擇狀態顯示
    updateRelicSelectionDisplay();
}

// 創建儀器卡片
function createRelicCard(relic) {
    const card = document.createElement('div');
    card.className = 'relic-card';
    card.dataset.relic = relic.儀器;
    card.dataset.type = relic.種類;
    
    // 檢查是否為已選中的儀器
    const isSelected = (relic.種類 === '外圈' && selectedOuterRelics.includes(relic.儀器)) ||
                      (relic.種類 === '內圈' && selectedInnerRelic === relic.儀器);
    if (isSelected) {
        card.classList.add('selected');
    }
    
    // 檢查是否為推薦儀器
    const currentCharacter = document.getElementById('character-select').value;
    const characterRecommendation = relicRecommendationData.find(rec => rec.角色 === currentCharacter);
    let isRecommended = false;
    
    if (characterRecommendation) {
        const recommendations = relic.種類 === '外圈' ? 
            [characterRecommendation.外圈第1順位, characterRecommendation.外圈第2順位, characterRecommendation.外圈第3順位, characterRecommendation.外圈第4順位, characterRecommendation.外圈第5順位] :
            [characterRecommendation.內圈第1順位, characterRecommendation.內圈第2順位, characterRecommendation.內圈第3順位, characterRecommendation.內圈第4順位];
        
        isRecommended = recommendations.some(rec => rec && rec.trim() === relic.儀器);
    }
    
    if (isRecommended) {
        card.classList.add('recommended-relic');
    }
    
    // 儀器圖片
    const image = document.createElement('img');
    image.className = 'relic-image';
    image.src = `assets/img/instrument/${relic.儀器}.png`;
    image.alt = relic.儀器;
    image.onerror = function() {
        // 嘗試jpg格式
        if (this.src.endsWith('.png')) {
            this.src = `assets/img/instrument/${relic.儀器}.jpg`;
        } else {
            // 如果jpg也不存在，顯示預設圖片或隱藏
            this.style.display = 'none';
        }
    };
    
    // 儀器名稱
    const name = document.createElement('div');
    name.className = 'relic-name';
    name.textContent = relic.儀器;
    
    // 儀器信息（類型）
    const info = document.createElement('div');
    info.className = 'relic-info';
    
    const type = document.createElement('span');
    type.className = 'relic-type';
    type.textContent = relic.種類;
    
    info.appendChild(type);
    
    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(info);
    
    // 添加推薦標記
    if (isRecommended) {
        const recommendBadge = document.createElement('div');
        recommendBadge.className = 'recommend-badge';
        recommendBadge.textContent = '推薦';
        card.appendChild(recommendBadge);
    }
    
    // 點擊事件
    card.addEventListener('click', () => selectRelic(relic));
    
    return card;
}

// 選擇儀器
function selectRelic(relic) {
    if (relic.種類 === '外圈') {
        // 外圈儀器邏輯：最多選擇2個
        const index = selectedOuterRelics.indexOf(relic.儀器);
        if (index > -1) {
            // 已選中，取消選擇
            selectedOuterRelics.splice(index, 1);
        } else {
            // 未選中，添加選擇
            if (selectedOuterRelics.length < 2) {
                selectedOuterRelics.push(relic.儀器);
            } else {
                // 已選滿2個，替換第一個
                selectedOuterRelics[0] = selectedOuterRelics[1];
                selectedOuterRelics[1] = relic.儀器;
            }
        }
    } else if (relic.種類 === '內圈') {
        // 內圈儀器邏輯：只能選擇1個
        if (selectedInnerRelic === relic.儀器) {
            // 已選中，取消選擇
            selectedInnerRelic = null;
        } else {
            // 選擇新的內圈儀器
            selectedInnerRelic = relic.儀器;
        }
    }
    
    // 更新隱藏的select元素
    updateHiddenSelects();
    
    // 重新渲染網格以更新選中狀態
    updateRelicGrid();
    
    // 更新儀器信息顯示
    updateInstrumentInfo();
}

// 更新隱藏的select元素
function updateHiddenSelects() {
    const outer1Select = document.getElementById('outer-relic-1');
    const outer2Select = document.getElementById('outer-relic-2');
    const innerSelect = document.getElementById('inner-relic');
    
    // 更新外圈儀器選擇
    outer1Select.value = selectedOuterRelics[0] || '';
    outer2Select.value = selectedOuterRelics[1] || '';
    
    // 更新內圈儀器選擇
    innerSelect.value = selectedInnerRelic || '';
    
    // 更新按鈕文字
    updateRelicButtonText();
}

// 更新儀器選擇按鈕文字
function updateRelicButtonText() {
    const buttonText = document.getElementById('relic-select-text');
    
    const parts = [];
    
    if (selectedOuterRelics.length > 0) {
        if (selectedOuterRelics.length === 1) {
            parts.push(`${selectedOuterRelics[0]}(4件套)`);
        } else {
            parts.push(`${selectedOuterRelics[0]}+${selectedOuterRelics[1]}(各2件套)`);
        }
    }
    
    if (selectedInnerRelic) {
        parts.push(`${selectedInnerRelic}(2件套)`);
    }
    
    if (parts.length > 0) {
        buttonText.textContent = parts.join(' | ');
    } else {
        buttonText.textContent = '請選擇儀器';
    }
}

// 更新選擇狀態顯示
function updateRelicSelectionDisplay() {
    const outerList = document.querySelector('.selected-outer-list');
    const innerList = document.querySelector('.selected-inner-list');
    
    // 更新外圈顯示
    if (selectedOuterRelics.length > 0) {
        if (selectedOuterRelics.length === 1) {
            outerList.textContent = `${selectedOuterRelics[0]} (4件套)`;
        } else {
            outerList.textContent = `${selectedOuterRelics[0]} + ${selectedOuterRelics[1]} (各2件套)`;
        }
    } else {
        outerList.textContent = '無';
    }
    
    // 更新內圈顯示
    if (selectedInnerRelic) {
        innerList.textContent = `${selectedInnerRelic} (2件套)`;
    } else {
        innerList.textContent = '無';
    }
}

// 應用儀器篩選器
function applyRelicFilters() {
    const selectedTypes = Array.from(document.querySelectorAll('.relic-type-checkbox:checked')).map(cb => cb.value);
    
    filteredRelics = relicData.filter(relic => {
        // 類型篩選
        const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(relic.種類);
        return typeMatch;
    });
    
    updateRelicGrid();
}

// 清除所有篩選器
function clearAllRelicFilters() {
    document.querySelectorAll('.relic-type-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    applyRelicFilters();
}

// 全選所有篩選器
function selectAllRelicFilters() {
    document.querySelectorAll('.relic-type-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
    applyRelicFilters();
}

// 清空儀器選擇
function clearRelicSelection() {
    selectedOuterRelics = [];
    selectedInnerRelic = null;
    updateHiddenSelects();
    updateRelicGrid();
    updateInstrumentInfo();
}

// 綁定儀器模態窗口事件
function bindRelicModalEvents() {
    const modal = document.getElementById('relicModal');
    const closeBtn = document.querySelector('.relic-modal-close');
    const clearBtn = document.querySelector('.relic-filter-clear-btn');
    const allBtn = document.querySelector('.relic-filter-all-btn');
    const clearSelectionBtn = document.querySelector('.relic-clear-selection-btn');
    
    // 關閉按鈕
    if (closeBtn) {
        closeBtn.removeEventListener('click', closeRelicModal);
        closeBtn.addEventListener('click', closeRelicModal);
    }
    
    // 篩選器按鈕
    if (clearBtn) {
        clearBtn.removeEventListener('click', clearAllRelicFilters);
        clearBtn.addEventListener('click', clearAllRelicFilters);
    }
    
    if (allBtn) {
        allBtn.removeEventListener('click', selectAllRelicFilters);
        allBtn.addEventListener('click', selectAllRelicFilters);
    }
    
    if (clearSelectionBtn) {
        clearSelectionBtn.removeEventListener('click', clearRelicSelection);
        clearSelectionBtn.addEventListener('click', clearRelicSelection);
    }
    
    // 篩選器變化事件
    document.querySelectorAll('.relic-type-checkbox').forEach(checkbox => {
        checkbox.removeEventListener('change', applyRelicFilters);
        checkbox.addEventListener('change', applyRelicFilters);
    });
    
    // 點擊背景關閉
    modal.removeEventListener('click', handleRelicModalBackgroundClick);
    modal.addEventListener('click', handleRelicModalBackgroundClick);
}

// 處理背景點擊
function handleRelicModalBackgroundClick(event) {
    if (event.target === event.currentTarget) {
        closeRelicModal();
    }
}

// 處理ESC鍵
function handleRelicModalEscapeKey(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('relicModal');
        if (modal.classList.contains('open')) {
            closeRelicModal();
        }
    }
}