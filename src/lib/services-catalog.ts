// 服務項目清單的共用資料來源：/services 頁面（含 OfferCatalog 結構化資料）與 /llms-full.txt 共用同一份。
// 內容即原頁面既有文字，未改寫、未新增。
export type CoreService = { href: string; title: string; desc: string };
export type CatalogService = { name: string; desc: string };

// 核心服務（有獨立分頁）
export const CORE_SERVICES: CoreService[] = [
  { href: "/method", title: "運動矯正", desc: "帶你把發力做在對的位置，重建站姿與出力，不硬扳、不喀一聲。" },
  { href: "/services/body-care", title: "全身運動矯正", desc: "從發力與排列全面評估，協助歪斜回正、緩解痠痛。" },
  { href: "/services/personal-training", title: "一對一訓練", desc: "個人化肌力與動作訓練，讓運動矯正成果維持得住。" },
  { href: "/services/body-sculpting", title: "體雕・體態訓練", desc: "從張力平衡與訓練改善身形線條，而非單純減重。" },
];

// 運動矯正動作類
export const ADJUST_SERVICES: CatalogService[] = [
  { name: "全身運動矯正", desc: "整體放鬆過度緊繃的部位，協助關節排列回到較理想的位置。" },
  { name: "體態運動矯正", desc: "針對高低肩、骨盆歪斜、身體左右不對稱，重建對稱的站姿與發力。" },
  { name: "痠痛運動矯正", desc: "處理肩頸、上背、腰部等因張力失衡造成的痠、緊、卡。" },
  { name: "運動矯正動作", desc: "找出錯誤的發力與動作模式，重新建立正確的出力方式。" },
  { name: "動作失能運動矯正", desc: "改善受限的關節活動度，讓卡住的動作恢復順暢。" },
  { name: "運動按摩放鬆", desc: "針對運動後肌肉與筋膜的緊繃痠痛，進行按摩與拉伸放鬆。" },
];

// 訓練健身類
export const TRAIN_SERVICES: CatalogService[] = [
  { name: "肌力訓練", desc: "喚醒該出力卻偷懶的肌群，建立穩定身體的基礎肌力。" },
  { name: "減肥減脂計畫", desc: "搭配訓練與生活習慣，循序漸進改善體態與體組成。" },
  { name: "重量肌力訓練", desc: "以漸進負荷提升肌力與肌耐力，強化身體支撐力。" },
  { name: "全身張力平衡", desc: "重建全身肌肉張力的左右、前後平衡，減少代償。" },
  { name: "一對一健身教練", desc: "教練全程一對一帶領，依個人狀況設計專屬課表。" },
];
