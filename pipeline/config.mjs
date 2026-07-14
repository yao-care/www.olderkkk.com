// pipeline/config.mjs
// olderkkk「身體小卡關」自助文系列產線設定（每 3 天 1 篇，離峰自動上線）。
export const MODEL = 'claude-sonnet-5';

export const PATHS = {
  health: 'src/content/health',      // 產出目錄（Astro content collection）
  topics: 'pipeline/topics.tsv',     // 題材佇列（slug \t 困擾 \t 部位提示）
  cursor: 'pipeline/state/cursor.json', // 帳本：下一題索引（隨文章一起 commit）
};

// 自動上線內容的合規閘門（YMYL 保健自助文，無人核准前的防呆）。
export const GUARD = {
  forbidden: ['治療', '根治', '療效', '治好', '痊癒', '醫療行為'], // 療效/醫療宣稱紅線，絕不可出現
  safety: /就醫|就診|醫生|醫師|醫療|專業|評估|檢查/,               // 至少要有就醫/專業安全提醒
  funnel: /\(\/method\)/,                                        // 至少要有導流到招牌頁 /method
};
