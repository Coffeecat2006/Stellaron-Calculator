# 星核演算機 - Stellaron Calculator

崩壞星穹鐵道傷害計算器

## 功能特色

### 📊 完整的傷害計算系統
- 支援所有角色的基礎數值和技能倍率
- 光錐效果自動計算
- 儀器套裝效果支援
- 詳細的詞條配置

### 🎯 智能抗性計算系統 ⭐ 新功能
- **自動屬性匹配**：根據角色屬性與敵人弱點自動調整抗性
  - 角色屬性匹配敵人弱點：維持設定抗性
  - 角色屬性不匹配敵人弱點：抗性增加20%
- **韌性條狀態**：可設定敵人韌性條狀態
  - 未破韌性條：韌性條減傷10%
  - 已破韌性條：韌性條減傷0%

### 💎 精美的用戶界面
- 現代化深色主題設計
- 響應式佈局，支援各種螢幕尺寸
- 角色和光錐資訊自動顯示
- 儀器套裝效果可視化

## 使用方法

### 1. 基本配置
1. 選擇角色和星魂等級
2. 選擇光錐和疊影等級
3. 選擇攻擊類型
4. 配置儀器套裝

### 2. 敵人設定 ⭐ 更新
1. 設定敵人等級
2. 設定敵人基礎抗性
3. **選擇敵人弱點**：系統會自動根據角色屬性匹配
4. **設定韌性條狀態**：選擇未破韌性條或已破韌性條

### 3. 詞條配置
1. 為每個儀器部位設定主詞條和數值
2. 配置副詞條類型和數值
3. 系統會自動計算總屬性加成

### 4. 計算結果
- 點擊「計算傷害」按鈕
- 查看未爆擊、全暴擊和期望值傷害
- 檢視詳細的屬性分解
- **查看實際抗性**：顯示經過屬性匹配調整後的最終抗性

## 計算公式

```
最終傷害 = (角色基礎攻擊力 + 光錐基礎攻擊力) × (1 + 攻擊力加成%) + 攻擊力加成值] × 技能倍率 × (1 + 增傷加成%) × (1 + 易傷加成%) × (1 + 暴擊率% × 暴擊傷害) × (200 + 10 × 角色等級) / [(200 + 10 × 敵人等級) × (1 - 敵人減防% - 角色無視防御%) + 200 + 10 × 角色等級] × (1 - 實際抗性% + 抗性降低%) × (1 - 韌性條減傷%)
```

### 抗性計算邏輯 ⭐ 新功能
```
實際抗性 = 敵人設定抗性 + 屬性不匹配懲罰
屬性不匹配懲罰 = 角色屬性不在敵人弱點中 ? 20% : 0%
韌性條減傷 = 韌性條已破 ? 0% : 10%
```

## 使用範例

### 範例1：屬性匹配
- 角色：希兒（量子屬性）
- 敵人弱點：量子、虛數、風
- 敵人設定抗性：10%
- **實際抗性：10%**（無額外懲罰）

### 範例2：屬性不匹配
- 角色：開拓者（物理屬性）
- 敵人弱點：無
- 敵人設定抗性：0%
- **實際抗性：20%**（+20%屬性不匹配懲罰）

## 技術規格

- 純前端實現，無需伺服器
- 支援所有現代瀏覽器
- 響應式設計，支援行動裝置
- 數據來源：遊戲內官方數值

## 更新日誌

### v2.1.0 - 抗性計算系統更新
- ✨ 新增智能屬性匹配抗性計算
- ✨ 新增韌性條狀態設定
- ✨ 新增實際抗性顯示
- 🔧 優化計算邏輯精確度
- 📚 完善使用說明文件

### v2.0.0 - 界面全面重構
- 🎨 全新的深色主題設計
- 📱 響應式佈局優化
- 🖼️ 角色和光錐圖片顯示
- 🔧 儀器套裝效果可視化
- ⚡ 性能優化和bug修復

## 開發者

本項目為崩壞星穹鐵道玩家社群開發的免費工具，歡迎回饋和建議。

## 授權

本項目僅供學習和個人使用，遊戲相關資料版權歸miHoYo所有。 