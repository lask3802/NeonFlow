這是一份專為 **AI Agent (如 Cursor Composer, Windsurf, 或 GPT-4o)** 閱讀與執行而撰寫的完整遊戲企劃書。

這份文檔的結構經過優化，將「抽象的設計理念」轉化為「具體的程式邏輯」，能大幅減少 AI 寫出錯誤代碼的機率。

---

# 專案代號：Neon Flow (流體隧道) - 快速驗證原型企劃書

## 1. 專案概述 (Project Overview)

* **核心概念**：一款極簡風格的 3D 隧道滑行遊戲。玩家需在高速移動中，預判前方隧道的蜿蜒曲度，並將角色維持在隧道的「最佳路徑（中心點）」上。
* **驗證目標**：驗證「高頻預測」與「連續誤差回饋」帶來的快感，是否能脫離音樂節奏遊戲的框架獨立存在。
* **平台**：Web (HTML5 / Mobile Compatible)。
* **技術棧**：
* **Three.js** (3D 渲染)
* **Vanilla JavaScript** (無複雜框架，單一文件結構)
* **不需要外部素材** (所有圖形、紋理皆由程式碼生成)



---

## 快速啟動 (Prototype)

* 確認 `index.html` 與 `three.module.js` 位於同一資料夾。
* 使用本地伺服器開啟，例如：`python -m http.server`
* 在瀏覽器中進入：`http://localhost:8000/index.html`

---

## 2. 核心遊戲機制 (Core Mechanics)

### 2.1 玩家移動 (Player Movement)

* **角色定義**：一個發光的球體或錐體（The Ship）。
* **前進方式**：自動高速前進（沿著隧道的 Spline 曲線）。
* **操作方式**：
* **輸入**：滑鼠位置 (PC) 或 手指拖曳 (Mobile)。
* **映射**：輸入的 X/Y 座標映射到隧道截面的 X/Y 偏移量。
* **手感優化**：不使用 1:1 的絕對位置，而是帶有輕微 `lerp` (線性插值) 的跟隨，模擬慣性。



### 2.2 隧道生成與預測 (World & Prediction)

* **生成邏輯**：使用 `CatmullRomCurve3` 生成一條無限延伸的 3D 曲線路徑。
* **視覺預測**：隧道必須是半透明網格 (Wireframe) 或有流動線條，讓玩家能清楚看見前方 **3~5 秒** 的路徑彎曲方向。
* **Batch 預測體現**：玩家看到的不是「當前在哪」，而是「接下來隧道要急左轉，我現在就要開始往左偏移」。

### 2.3 評分與回饋迴圈 (Scoring & Feedback Loop) - **最重要**

這不是「撞到牆壁就死」的遊戲，而是「離中心越近越爽」的遊戲。

* **判定標準**：計算 `distance(PlayerPosition, TunnelCenterLine)`。
* **三段式狀態**：
1. **Perfect (Flow State)**：距離 < 閾值 A。
* *視覺*：角色發白光，隧道線條變亮，尾拖特效 (Trail) 變長。
* *分數*：每幀 +10 分，Combo 數字快速跳動。


2. **Good (Drifting)**：閾值 A < 距離 < 閾值 B。
* *視覺*：角色發黃光，標準狀態。
* *分數*：每幀 +2 分。


3. **Bad (Turbulence)**：距離 > 閾值 B (或是撞壁)。
* *視覺*：角色發紅光，畫面輕微抖動 (Camera Shake)，速度感視覺減弱。
* *分數*：分數停止增加，Combo 歸零。




* **容錯機制**：撞壁**不會**導致 Game Over，只會失去「爽感」與分數。

---

## 3. 技術實作規格 (Technical Implementation Specs)

### 3.1 渲染與相機 (Three.js Logic)

* **TubeGeometry**：利用 `THREE.TubeGeometry` 沿著 `CatmullRomCurve3` 生成隧道。
* **動態更新 (Infinite Tunnel)**：
* 將路徑分為多個 Segment。
* 當相機通過某個點時，移除身後的舊 Segment，在前方生成新的 Segment。
* *AI 提示*：這可以避免記憶體溢出，保持遊戲流暢。


* **相機跟隨 (Camera Follow)**：
* 相機位置 = 玩家位置後方某固定距離。
* **關鍵細節**：相機的 `lookAt` 目標不是玩家，而是「玩家前方 50 單位處的曲線點」。這樣相機才會順著隧道轉彎，而不是盯著玩家屁股看。



### 3.2 視覺風格 (Visual Style)

* **配色 (Cyberpunk/Neon)**：
* 背景：深黑 (`#000000`) 或深紫霧 (`FogExp2`)。
* 隧道：青色 (`#00FFFF`) 或 霓虹粉 (`#FF00FF`) 的網格。
* 材質：使用 `MeshBasicMaterial` 搭配 `wireframe: true` 以節省效能並增強透視感。


* **速度感 (Speed Perception)**：
* 在隧道周圍生成流動的粒子 (Starfield effect)，粒子必須逆向飛過相機。
* 當玩家處於 Perfect 狀態時，動態增加相機的 FOV (從 75 變到 90)，創造「推背感」。



---

## 4. 給 AI 開發者的「開發細節與陷阱」提示 (Critical Prompts)

在開發過程中，請特別注意以下細節，這些是影響「手感」的關鍵：

### 4.1 座標系陷阱 (The Coordinate Problem)

* **問題**：在彎曲的隧道中，"Up" (上方) 是會改變的。簡單的 `position.x += input` 會在隧道翻轉時失效。
* **解決方案**：
* 使用 `Frenet Frames` (Three.js 的 Curve 類別自帶 `computeFrenetFrames`)。
* 或者更簡單的原型做法：只移動相機和玩家容器的 **Local Position**，而整個容器沿著世界座標的路徑移動。讓 AI 選擇最簡單的「Camera on Rails」實作方式。



### 4.2 暈眩感控制 (Motion Sickness Prevention)

* **要求**：相機的旋轉 (Roll) 必須平滑。
* **實作**：不要讓相機 100% 鎖定隧道的扭曲角度。給相機的 `up` 向量一個 `lerp` 插值，讓它像雲霄飛車一樣平滑地轉向，而不是生硬地切換角度。

### 4.3 預測的可讀性 (Readability)

* **要求**：如果隧道是純黑的，玩家看不見彎道。
* **實作**：隧道必須有縱向線條 (Longitudinal lines) 或網格，這樣彎道才會有透視上的「擠壓感」，玩家才能預判。

---

## 5. AI Agent 執行指令 (Copy & Paste Prompts)

以下是你可以直接貼給 Cursor / GPT-4 的指令集，分為兩階段。

### Phase 1: 基礎建設 (The Skeleton)

> "Generate a single HTML file containing a Three.js game prototype called 'Neon Flow'.
> 1. **Setup:** Initialize Three.js scene, renderer, and a camera. Add a deep fog effect.
> 2. **The Tunnel:** Create a `CatmullRomCurve3` with random points to form a winding path. Generate a `TubeGeometry` based on this path using a wireframe neon material.
> 3. **Movement:** Animate the camera to move automatically along the curve at a constant speed.
> 4. **LookAhead:** Ensure the camera looks at a point further down the curve, not just straight ahead, so it banks naturally with the turns.
> 5. **Infinite Loop:** For this prototype, just make the curve very long and loop the camera back to start when it reaches the end."
> 
> 

### Phase 2: 玩家與互動 (The Gameplay)

> "Now update the existing code to add the Player and Gameplay Mechanics:
> 1. **Player Object:** Add a glowing sphere mesh visible in front of the camera.
> 2. **Controls:** Map mouse movement (X/Y) to the sphere's position relative to the center of the screen/tunnel. Add a slight `lerp` for smooth movement.
> 3. **Scoring System (The Feedback):**
> * Calculate the distance of the player from the absolute center (0,0) of the tunnel cross-section.
> * If distance < 0.5 units: Change player color to White, add score, increase FOV slightly (Speed effect).
> * If distance > 0.5 units: Change player color to Red, stop scoring.
> 
> 
> 4. **UI:** Add a simple HTML overlay showing 'SCORE' and 'COMBO'."
> 
> 

---

## 6. 專案預期產出與驗證指標

開發完成後，請依據以下問題驗證 Prototype 是否成功：

1. **盲測**：不看分數，僅看畫面的隧道彎曲，玩家是否會「不自覺地」提前移動滑鼠去對準路徑？（如果有，Batch 預測成立）。
2. **心流**：在連續的彎道中，是否出現「我完全掌握了節奏」的感覺，即使沒有音樂節拍？
3. **挫折感**：撞到邊緣時，是否感覺「只是損失了效率」而不是「被打斷」？

這份企劃書已經準備好進行開發，你可以直接將 **第 5 節** 的指令丟給 AI Agent 開始製作。
