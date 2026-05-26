import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";

// ============================================================
// INDEXEDDB STORAGE
// ============================================================
const DB_NAME = "digitree_db";
const DB_VERSION = 1;
const STORE_NAME = "digitree_store";

const openDB = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  };
  req.onsuccess = e => resolve(e.target.result);
  req.onerror = e => reject(e.target.error);
});

const idbGet = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
};

const idbSet = async (key, value) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
};

const idbDel = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
};


// ============================================================
// I18N
// ============================================================
const TRANSLATIONS = {
  ja: {
    // ノードタグ
    tag_normal:   "通常",
    tag_winning:  "勝ち筋",
    tag_losing:   "負け筋",
    tag_key:      "重要",
    tag_mistake:  "裏目",
    tag_question: "要検討",
    // 行動タイプ
    act_turn_start:      "ターン開始時",
    act_evolution:       "進化",
    act_play:            "登場",
    act_attack:          "アタック",
    act_effect:          "効果",
    act_security_check:  "セキュ確認",
    act_move:            "移動",
    act_opponent_action: "相手行動",
    act_end_turn:        "ターン終了",
    // フェイズ
    ph_turn_start: "ターン開始時",
    ph_active:     "アクティブフェイズ",
    ph_draw:       "ドローフェイズ",
    ph_breeding:   "育成フェイズ",
    ph_main:       "メインフェイズ",
    ph_turn_end:   "ターン終了時",
    // UI
    node_editor:       "NODE EDITOR",
    select_node:       "ノードを選択",
    child_settings:    "子ノード設定",
    turn_increment:    "手数増加量（+ボタンで追加時）",
    same_move:         "同じ手数で分岐を作成します",
    increment_msg:     (n) => `親ノードの手数+${n}で作成します`,
    tag_label:         "タグ",
    basic_info:        "基本情報",
    node_name:         "ノード名",
    node_placeholder:  "1手目...",
    move_count:        "手数",
    phase_label:       "フェイズ",
    action_section:    "遷移行動",
    action_type:       "行動タイプ",
    action_desc:       "行動説明",
    action_placeholder:"例: X4でアタック",
    memory_label:      "メモリー",
    resource_label:    "リソース",
    my_sec:            "自SEC",
    opp_sec:           "相SEC",
    hand:              "手札",
    draw_label:        "ドロー",
    memo_label:        "メモ",
    memo_placeholder:  "思考メモ、勝ち筋、懸念点...",
    delete_btn:        "🗑 削除",
    delete_full:       "🗑 このノードを削除",
    confirm_title:     "ノードを削除",
    confirm_body:      "このノードと子ノードをすべて削除します。\nこの操作は元に戻せません。",
    cancel:            "キャンセル",
    op_mode: "操作モード",
    op_mode_exit: "✕操作モード",
    stack_on_top: "の上に重ねる",
    stack_on_bottom: "の下に重ねる",
    same_area: "同じエリアに出す",
    stack_label: "を",
    stack_against: "に対して：",
    delete_ok:         "削除する",
    stat_move:         "手",
    move_suffix:       (n) => `${n}手目`,
    canvas_axis:       (n) => `${n}手目`,
    my_hand_label: "自ドロー",
    opp_hand_label: "相ドロー",
    appearance_tab: "言語・色・文字",
    wrap_full: "折り返して表示",
    clip_short: "省略する",
    edit: "編集",
    add_child: "子ノード追加",
    duplicate: "複製",
    my_trash_label: "自捨札",
    opp_trash_label: "相捨札",
    insert_mode: "割込",
    cancel_insert: "✕割込",
    auto_layout: "整列",
    new_tree_short: "新規",
    save_list_short: "セーブ",
    delete_btn_short: "削除",
    new_tree: "新規作成",
    new_tree_confirm: "現在のツリーを破棄して新規作成しますか？",
    save_and_new: "💾 保存して新規作成",
    discard_and_new: "🗑 破棄して新規作成",
    input_display_label: "入力欄の表示",
    initial_board: "開始盤面",
    none_label: "なし",
    card_input_placeholder: "カード名を入力...",
    zone_hand: "手札",
    zone_breeding: "育成エリア",
    zone_main: "バトルエリア",
    zone_trash: "トラッシュ",
    zone_deck: "山札",
    zone_security: "セキュリティ",
    my_deck_label: "自山",
    opp_deck_label: "相山",
    trash_label: "捨札",
    reset_defaults: "↩ 初期設定に戻す",
    export_current: "📤 現在のツリーをエクスポート",
    export_all: "📤 全セーブデータをエクスポート",
    import_label: "📥 インポート（ツリー or 全データ）",
    clear_all: "🗑 全データを消去",
    zone_info: "盤面情報",
    node_color: "ノードカラー",
    lang_label: "言語",
    default_color: "ノードのデフォルトカラー",
    default_resource: "デフォルトリソース",
    resource_display: "リソース表示",
    tag_display: "盤面タグの表示",
    zone_display: "盤面情報の表示（全体）",
    data_mgmt: "データ管理",
    show_all: "全て表示",
    hide_all: "全て非表示",
    size_small: "小",
    size_normal: "普通",
    size_large: "大",
    header_reset:      "⌂",
    opp_arrow:         "相手←",
    self_arrow:        "→自分",
  },
  en: {
    tag_normal:   "Normal",
    tag_winning:  "Winning",
    tag_losing:   "Losing",
    tag_key:      "Key",
    tag_mistake:  "Mistake",
    tag_question: "Review",
    act_turn_start:      "Turn Start",
    act_evolution:       "Evolve",
    act_play:            "Play",
    act_attack:          "Attack",
    act_effect:          "Effect",
    act_security_check:  "Security",
    act_move:            "Move",
    act_opponent_action: "Opponent",
    act_end_turn:        "End Turn",
    ph_turn_start: "Turn Start",
    ph_active:     "Active Phase",
    ph_draw:       "Draw Phase",
    ph_breeding:   "Breeding Phase",
    ph_main:       "Main Phase",
    ph_turn_end:   "Turn End",
    node_editor:       "NODE EDITOR",
    select_node:       "Select a node",
    child_settings:    "Child Node Settings",
    turn_increment:    "Move increment (when adding child)",
    same_move:         "Create branch at same move",
    increment_msg:     (n) => `Parent move +${n}`,
    tag_label:         "Tag",
    basic_info:        "Basic Info",
    node_name:         "Node Name",
    node_placeholder:  "Move 1...",
    move_count:        "Move",
    phase_label:       "Phase",
    action_section:    "Action",
    action_type:       "Action Type",
    action_desc:       "Description",
    action_placeholder:"e.g. Attack with X4",
    memory_label:      "Memory",
    resource_label:    "Resources",
    my_sec:            "My SEC",
    opp_sec:           "Opp SEC",
    hand:              "Hand",
    draw_label:        "Draw",
    memo_label:        "Notes",
    memo_placeholder:  "Thoughts, winning lines, concerns...",
    delete_btn:        "🗑 Delete",
    delete_full:       "🗑 Delete this node",
    confirm_title:     "Delete Node",
    confirm_body:      "This will delete this node and all children.\nThis action cannot be undone.",
    cancel:            "Cancel",
    op_mode: "Move Mode",
    op_mode_exit: "✕ Move Mode",
    stack_on_top: "Stack on top of",
    stack_on_bottom: "Stack under",
    same_area: "Place in same area",
    stack_label: "",
    stack_against: "vs:",
    delete_ok:         "Delete",
    stat_move:         "Move",
    move_suffix:       (n) => `Move ${n}`,
    canvas_axis:       (n) => `M${n}`,
    my_hand_label: "My Hand",
    opp_hand_label: "Opp Hand",
    appearance_tab: "Lang / Color / Text",
    wrap_full: "Wrap",
    clip_short: "Clip",
    edit: "Edit",
    add_child: "Add Child",
    duplicate: "Duplicate",
    my_trash_label: "My Trash",
    opp_trash_label: "Opp Trash",
    insert_mode: "Insert",
    cancel_insert: "✕Insert",
    auto_layout: "Layout",
    new_tree_short: "New",
    save_list_short: "Saves",
    delete_btn_short: "Del",
    new_tree: "New Tree",
    new_tree_confirm: "Discard current tree and create new?",
    save_and_new: "💾 Save & New",
    discard_and_new: "🗑 Discard & New",
    input_display_label: "Input Field Display",
    initial_board: "Opening Board",
    none_label: "None",
    card_input_placeholder: "Enter card name...",
    zone_hand: "Hand",
    zone_breeding: "Breeding",
    zone_main: "Battle Area",
    zone_trash: "Trash",
    zone_deck: "Deck",
    zone_security: "Security",
    my_deck_label: "My Deck",
    opp_deck_label: "Opp Deck",
    trash_label: "Trash",
    reset_defaults: "↩ Reset Defaults",
    export_current: "📤 Export Current Tree",
    export_all: "📤 Export All Save Data",
    import_label: "📥 Import (Tree or All)",
    clear_all: "🗑 Clear All Data",
    zone_info: "Board Info",
    node_color: "Node Color",
    lang_label: "Language",
    default_color: "Default Node Color",
    default_resource: "Default Resources",
    resource_display: "Resource Display",
    tag_display: "Zone Tag Display",
    zone_display: "Board Info Display",
    data_mgmt: "Data Management",
    show_all: "Show All",
    hide_all: "Hide All",
    size_small: "S",
    size_normal: "M",
    size_large: "L",
    header_reset:      "⌂",
    opp_arrow:         "Opp←",
    self_arrow:        "→You",
  },
  zh: {
    tag_normal:   "普通",
    tag_winning:  "胜利线",
    tag_losing:   "失败线",
    tag_key:      "关键",
    tag_mistake:  "失误",
    tag_question: "待确认",
    act_turn_start:      "回合开始",
    act_evolution:       "进化",
    act_play:            "出场",
    act_attack:          "攻击",
    act_effect:          "效果",
    act_security_check:  "安保确认",
    act_move:            "移动",
    act_opponent_action: "对手行动",
    act_end_turn:        "回合结束",
    ph_turn_start: "回合开始",
    ph_active:     "主动阶段",
    ph_draw:       "抽卡阶段",
    ph_breeding:   "育成阶段",
    ph_main:       "主要阶段",
    ph_turn_end:   "回合结束",
    node_editor:       "节点编辑",
    select_node:       "请选择节点",
    child_settings:    "子节点设置",
    turn_increment:    "步数增量（添加子节点时）",
    same_move:         "以相同步数创建分支",
    increment_msg:     (n) => `父节点步数+${n}`,
    tag_label:         "标签",
    basic_info:        "基本信息",
    node_name:         "节点名称",
    node_placeholder:  "第1步...",
    move_count:        "步数",
    phase_label:       "阶段",
    action_section:    "行动",
    action_type:       "行动类型",
    action_desc:       "行动说明",
    action_placeholder:"例: X4攻击",
    memory_label:      "记忆体",
    resource_label:    "资源",
    my_sec:            "我方安保",
    opp_sec:           "对方安保",
    hand:              "手牌",
    draw_label:        "摸牌",
    memo_label:        "备注",
    memo_placeholder:  "思路、胜利线、注意点...",
    delete_btn:        "🗑 删除",
    delete_full:       "🗑 删除此节点",
    confirm_title:     "删除节点",
    confirm_body:      "将删除此节点及所有子节点。\n此操作无法撤销。",
    cancel:            "取消",
    op_mode: "操作模式",
    op_mode_exit: "✕操作模式",
    stack_on_top: "叠在上面",
    stack_on_bottom: "叠在下面",
    same_area: "放在同区域",
    stack_label: "将",
    stack_against: "对：",
    delete_ok:         "删除",
    stat_move:         "步",
    move_suffix:       (n) => `第${n}步`,
    canvas_axis:       (n) => `第${n}步`,
    my_hand_label: "我方手牌",
    opp_hand_label: "对方手牌",
    appearance_tab: "语言·颜色·文字",
    wrap_full: "换行显示",
    clip_short: "省略",
    edit: "编辑",
    add_child: "添加子节点",
    duplicate: "复制",
    my_trash_label: "我方废弃",
    opp_trash_label: "对方废弃",
    insert_mode: "插入",
    cancel_insert: "✕插入",
    auto_layout: "整理",
    new_tree_short: "新建",
    save_list_short: "存档",
    delete_btn_short: "删除",
    new_tree: "新建",
    new_tree_confirm: "放弃当前树并新建？",
    save_and_new: "💾 保存并新建",
    discard_and_new: "🗑 放弃并新建",
    input_display_label: "输入框显示",
    initial_board: "开局盘面",
    none_label: "无",
    card_input_placeholder: "输入卡牌名称...",
    zone_hand: "手牌",
    zone_breeding: "育成区",
    zone_main: "战斗区",
    zone_trash: "废弃区",
    zone_deck: "牌库",
    zone_security: "安保区",
    my_deck_label: "我方牌库",
    opp_deck_label: "对方牌库",
    trash_label: "废弃区",
    reset_defaults: "↩ 恢复默认",
    export_current: "📤 导出当前树",
    export_all: "📤 导出所有存档",
    import_label: "📥 导入",
    clear_all: "🗑 清除所有数据",
    zone_info: "盘面信息",
    node_color: "节点颜色",
    lang_label: "语言",
    default_color: "默认节点颜色",
    default_resource: "默认资源",
    resource_display: "资源显示",
    tag_display: "盘面标签显示",
    zone_display: "盘面信息显示",
    data_mgmt: "数据管理",
    show_all: "全部显示",
    hide_all: "全部隐藏",
    size_small: "小",
    size_normal: "中",
    size_large: "大",
    header_reset:      "⌂",
    opp_arrow:         "对手←",
    self_arrow:        "→己方",
  },
  ko: {
    tag_normal:   "일반",
    tag_winning:  "승리 루트",
    tag_losing:   "패배 루트",
    tag_key:      "중요",
    tag_mistake:  "실수",
    tag_question: "검토 필요",
    act_turn_start:      "턴 시작",
    act_evolution:       "진화",
    act_play:            "등장",
    act_attack:          "어택",
    act_effect:          "효과",
    act_security_check:  "시큐리티 확인",
    act_move:            "이동",
    act_opponent_action: "상대 행동",
    act_end_turn:        "턴 종료",
    ph_turn_start: "턴 시작",
    ph_active:     "액티브 페이즈",
    ph_draw:       "드로우 페이즈",
    ph_breeding:   "육성 페이즈",
    ph_main:       "메인 페이즈",
    ph_turn_end:   "턴 종료",
    node_editor:       "노드 편집기",
    select_node:       "노드를 선택하세요",
    child_settings:    "자식 노드 설정",
    turn_increment:    "수 증가량 (추가 시)",
    same_move:         "같은 수로 분기 생성",
    increment_msg:     (n) => `부모 노드 수+${n}`,
    tag_label:         "태그",
    basic_info:        "기본 정보",
    node_name:         "노드 이름",
    node_placeholder:  "1수...",
    move_count:        "수",
    phase_label:       "페이즈",
    action_section:    "행동",
    action_type:       "행동 타입",
    action_desc:       "행동 설명",
    action_placeholder:"예: X4로 어택",
    memory_label:      "메모리",
    resource_label:    "리소스",
    my_sec:            "내 SEC",
    opp_sec:           "상대 SEC",
    hand:              "패",
    draw_label:        "드로우",
    memo_label:        "메모",
    memo_placeholder:  "생각, 승리 루트, 주의점...",
    delete_btn:        "🗑 삭제",
    delete_full:       "🗑 이 노드 삭제",
    confirm_title:     "노드 삭제",
    confirm_body:      "이 노드와 모든 자식 노드를 삭제합니다.\n이 작업은 되돌릴 수 없습니다.",
    cancel:            "취소",
    op_mode: "이동 모드",
    op_mode_exit: "✕이동 모드",
    stack_on_top: "위에 겹치기",
    stack_on_bottom: "아래에 겹치기",
    same_area: "같은 구역에 놓기",
    stack_label: "",
    stack_against: "에 대해：",
    delete_ok:         "삭제",
    stat_move:         "수",
    move_suffix:       (n) => `${n}수`,
    canvas_axis:       (n) => `${n}수`,
    my_hand_label: "내 핸드",
    opp_hand_label: "상대 핸드",
    appearance_tab: "언어·색상·글자",
    wrap_full: "줄바꿈",
    clip_short: "생략",
    edit: "편집",
    add_child: "자식 노드 추가",
    duplicate: "복제",
    my_trash_label: "내 트래시",
    opp_trash_label: "상대 트래시",
    insert_mode: "삽입",
    cancel_insert: "✕삽입",
    auto_layout: "정렬",
    new_tree_short: "새로",
    save_list_short: "세이브",
    delete_btn_short: "삭제",
    new_tree: "새로 만들기",
    new_tree_confirm: "현재 트리를 버리고 새로 만드시겠습니까?",
    save_and_new: "💾 저장 후 새로 만들기",
    discard_and_new: "🗑 버리고 새로 만들기",
    input_display_label: "입력란 표시",
    initial_board: "시작 보드",
    none_label: "없음",
    card_input_placeholder: "카드 이름 입력...",
    zone_hand: "핸드",
    zone_breeding: "육성 영역",
    zone_main: "배틀 영역",
    zone_trash: "트래시",
    zone_deck: "덱",
    zone_security: "시큐리티",
    my_deck_label: "내 덱",
    opp_deck_label: "상대 덱",
    trash_label: "트래시",
    reset_defaults: "↩ 기본값 초기화",
    export_current: "📤 현재 트리 내보내기",
    export_all: "📤 모든 저장 데이터 내보내기",
    import_label: "📥 가져오기",
    clear_all: "🗑 모든 데이터 삭제",
    zone_info: "보드 정보",
    node_color: "노드 색상",
    lang_label: "언어",
    default_color: "기본 노드 색상",
    default_resource: "기본 리소스",
    resource_display: "리소스 표시",
    tag_display: "보드 태그 표시",
    zone_display: "보드 정보 표시",
    data_mgmt: "데이터 관리",
    show_all: "모두 표시",
    hide_all: "모두 숨김",
    size_small: "소",
    size_normal: "중",
    size_large: "대",
    header_reset:      "⌂",
    opp_arrow:         "상대←",
    self_arrow:        "→나",
  },
  es: {
    tag_normal:   "Normal",
    tag_winning:  "Victoria",
    tag_losing:   "Derrota",
    tag_key:      "Clave",
    tag_mistake:  "Error",
    tag_question: "Revisar",
    act_turn_start:      "Inicio turno",
    act_evolution:       "Evolución",
    act_play:            "Jugar",
    act_attack:          "Atacar",
    act_effect:          "Efecto",
    act_security_check:  "Seguridad",
    act_move:            "Mover",
    act_opponent_action: "Rival",
    act_end_turn:        "Fin turno",
    ph_turn_start: "Inicio de turno",
    ph_active:     "Fase activa",
    ph_draw:       "Fase de robo",
    ph_breeding:   "Fase de crianza",
    ph_main:       "Fase principal",
    ph_turn_end:   "Fin de turno",
    node_editor:       "EDITOR DE NODO",
    select_node:       "Selecciona un nodo",
    child_settings:    "Config. nodo hijo",
    turn_increment:    "Incremento de jugada (al añadir hijo)",
    same_move:         "Crear rama en la misma jugada",
    increment_msg:     (n) => `Jugada padre +${n}`,
    tag_label:         "Etiqueta",
    basic_info:        "Info básica",
    node_name:         "Nombre del nodo",
    node_placeholder:  "Jugada 1...",
    move_count:        "Jugada",
    phase_label:       "Fase",
    action_section:    "Acción",
    action_type:       "Tipo de acción",
    action_desc:       "Descripción",
    action_placeholder:"ej: Atacar con X4",
    memory_label:      "Memoria",
    resource_label:    "Recursos",
    my_sec:            "Mi SEC",
    opp_sec:           "SEC rival",
    hand:              "Mano",
    draw_label:        "Robo",
    memo_label:        "Notas",
    memo_placeholder:  "Ideas, líneas ganadoras...",
    delete_btn:        "🗑 Eliminar",
    delete_full:       "🗑 Eliminar este nodo",
    confirm_title:     "Eliminar nodo",
    confirm_body:      "Se eliminará este nodo y todos sus hijos.\nEsta acción no se puede deshacer.",
    cancel:            "Cancelar",
    op_mode: "Modo mover",
    op_mode_exit: "✕ Modo mover",
    stack_on_top: "Apilar encima de",
    stack_on_bottom: "Apilar debajo de",
    same_area: "Colocar en misma área",
    stack_label: "",
    stack_against: "vs:",
    delete_ok:         "Eliminar",
    stat_move:         "Jug",
    move_suffix:       (n) => `J${n}`,
    canvas_axis:       (n) => `J${n}`,
    my_hand_label: "Mi Mano",
    opp_hand_label: "Mano Rival",
    appearance_tab: "Idioma / Color / Texto",
    wrap_full: "Ajustar",
    clip_short: "Recortar",
    edit: "Editar",
    add_child: "Añadir hijo",
    duplicate: "Duplicar",
    my_trash_label: "Mi Descarte",
    opp_trash_label: "Descarte Rival",
    insert_mode: "Insertar",
    cancel_insert: "✕Insertar",
    auto_layout: "Ordenar",
    new_tree_short: "Nuevo",
    save_list_short: "Saves",
    delete_btn_short: "Borrar",
    new_tree: "Nuevo",
    new_tree_confirm: "¿Descartar árbol actual y crear uno nuevo?",
    save_and_new: "💾 Guardar y Nuevo",
    discard_and_new: "🗑 Descartar y Nuevo",
    input_display_label: "Mostrar Campos",
    initial_board: "Tablero Inicial",
    none_label: "Ninguno",
    card_input_placeholder: "Nombre de carta...",
    zone_hand: "Mano",
    zone_breeding: "Crianza",
    zone_main: "Área de Batalla",
    zone_trash: "Descarte",
    zone_deck: "Mazo",
    zone_security: "Seguridad",
    my_deck_label: "Mi Mazo",
    opp_deck_label: "Mazo Rival",
    trash_label: "Descarte",
    reset_defaults: "↩ Restablecer",
    export_current: "📤 Exportar árbol actual",
    export_all: "📤 Exportar todos los datos",
    import_label: "📥 Importar",
    clear_all: "🗑 Borrar todo",
    zone_info: "Info Tablero",
    node_color: "Color del Nodo",
    lang_label: "Idioma",
    default_color: "Color de Nodo Predeterminado",
    default_resource: "Recursos Predeterminados",
    resource_display: "Mostrar Recursos",
    tag_display: "Mostrar Etiquetas",
    zone_display: "Mostrar Info Tablero",
    data_mgmt: "Gestión de Datos",
    show_all: "Mostrar Todo",
    hide_all: "Ocultar Todo",
    size_small: "P",
    size_normal: "M",
    size_large: "G",
    header_reset:      "⌂",
    opp_arrow:         "Rival←",
    self_arrow:        "→Tú",
  },
};

const LANG_FLAGS = { ja: "🇯🇵", en: "🇺🇸", zh: "🇨🇳", ko: "🇰🇷", es: "🇪🇸" };

// ============================================================
// TYPES / CONSTANTS
// ============================================================

const NODE_COLORS = [
  { label: "デフォルト", value: null,      bg: null,      border: null },
  { label: "青",         value: "#1a3a5c", bg: "#0d2035", border: "#4a9eff" },
  { label: "緑",         value: "#0f2e1a", bg: "#071a0e", border: "#22c55e" },
  { label: "赤",         value: "#2e0f0f", bg: "#1a0707", border: "#ef4444" },
  { label: "紫",         value: "#1e1030", bg: "#110820", border: "#a855f7" },
  { label: "黄",         value: "#2a1e08", bg: "#180f00", border: "#f59e0b" },
  { label: "白",         value: "#1a1e2a", bg: "#101318", border: "#94a3b8" },
];
const NODE_TAGS = {
  normal:   { color: "#4a9eff", bg: "#1a2840", border: "#4a9eff" },
  winning:  { color: "#22c55e", bg: "#0f2a1a", border: "#22c55e" },
  losing:   { color: "#ef4444", bg: "#2a1010", border: "#ef4444" },
  key:      { color: "#f59e0b", bg: "#2a1e08", border: "#f59e0b" },
  mistake:  { color: "#a855f7", bg: "#1e1030", border: "#a855f7" },
  question: { color: "#94a3b8", bg: "#1a2030", border: "#94a3b8" },
};
const getTagLabel = (t, key) => t["tag_" + key] || key;

const ACTION_TYPES = [
  "turn_start","evolution","play","attack","effect",
  "security_check","move","opponent_action","end_turn",
];
const getActLabel = (t, v) => t["act_" + v] || v;

const PHASES = [
  "turn_start","active","draw","breeding","main","turn_end",
];

const getNodeLabel = (label, t) => {
  if (!label) return label;
  if (label === "INITIAL_BOARD_PLACEHOLDER") return t.initial_board || "開始盤面";
  const initialBoards = ["開始盤面", "Opening Board", "开局盘面", "시작 보드", "Tablero Inicial"];
  if (initialBoards.includes(label)) return t.initial_board || "開始盤面";
  const patterns = [
    /^(\d+)手目$/,
    /^Move (\d+)$/,
    /^第(\d+)步$/,
    /^(\d+)수$/,
    /^Jugada (\d+)$/,
    /^M(\d+)$/,
    /^J(\d+)$/,
  ];
  for (const pat of patterns) {
    const m = label.match(pat);
    if (m) return t.canvas_axis(parseInt(m[1]));
  }
  return label;
};


// ============================================================
// generateLabel
// ルール根拠（デジモンカードゲーム総合ルール Ver.4.0）:
//   - 育成エリア→バトルエリアへの単体移動 = 「移動」(4-16)
//   - 育成から来たカードがバトルエリアのカードに重なることはない
//   - 手札のカードをバトルエリアの既存カードに重ねる = 「進化」(8-1)
//   - 手札の複数カードをまとめてデジクロス条件で登場 = 「デジクロス」(7-2)
//   - 手札/トラッシュからバトルエリアに単体登場 = 「登場」(7-1)
// ============================================================
const generateLabel = (node, parentNode) => {
  if (!parentNode) return null;

  const parentMain     = parentNode.meta?.zones?.main     || [];
  const childMain      = node.meta?.zones?.main           || [];
  const parentBreeding = parentNode.meta?.zones?.breeding || [];

  // スタック配列または文字列から先頭カード名を取得
  const topCard = (item) => Array.isArray(item) ? item[0] : item;
  // スタック配列または文字列から進化元（2枚目以降）を取得
  const hasStack = (item) => Array.isArray(item) && item.length > 1;

  const parentMainTops = parentMain.map(topCard);
  const parentBreedingTops = parentBreeding.map(topCard);

  const events = [];

  for (const item of childMain) {
    const top = topCard(item);
    if (!top) continue;

    // 親に同じtopカードがあるか確認
    const parentItem = parentMain.find(p => topCard(p) === top);
    if (parentItem !== undefined) {
      // 親にあった → スタック枚数が増えたなら進化（上に重ねられた）
      const parentStack = Array.isArray(parentItem) ? parentItem : [parentItem];
      const childStack = Array.isArray(item) ? item : [item];
      if (childStack.length > parentStack.length) {
        // 増えた分の一番上が新しく重ねたカード = top
        // 直下（index1）が進化元
        events.push(`${childStack[1]}→${top}進化`);
      }
      continue;
    }

    // 育成エリアから来た = 移動
    if (parentBreedingTops.includes(top)) {
      events.push(`${top}移動`);
      continue;
    }

    // スタックあり = 進化（index1が直前の進化元）
    if (hasStack(item)) {
      const under = item[1]; // index1 = 直前の進化元
      events.push(`${under}→${top}進化`);
      continue;
    }

    // 単体で新規登場
    events.push(`${top}登場`);
  }

  if (events.length === 0) return null;
  return events.join(' + ');
};


// iOS Safari対応のエクスポート
const exportJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

const getPhaseLabel = (t, v) => t["ph_" + v] || v;

const NODE_W = 280;
const NODE_H = 130;
const TURN_GAP = 320;
const BRANCH_GAP = 160;

let idCounter = 100;
const uid = () => `n${++idCounter}_${Date.now()}`;

const makeNode = (parentId, turn, offsetY, action = {}) => ({
  id: uid(),
  parentId,
  children: [],
  state: {
    turn,
    phase: "main",
    memory: 1,
    myHand: 0,
    oppHand: 0,
    mySecurity: 5,
    oppSecurity: 5,
    myDeck: 40,
    oppDeck: 40,
    myTrash: 0,
    oppTrash: 0,
  },
  meta: {
    label: `${turn}手目`,
    note: "",
    tag: "normal",
    isCollapsed: false,
    color: null,
    zones: { hand: [], breeding: [], main: [], trash: [], deck: [], security: [] },
    showZones: true,
    hiddenZones: [],
  },
  action: {
    type: action.type || "play",
    description: action.description || "",
    actor: action.actor || "me",
  },
  position: { x: (turn - 1) * TURN_GAP + 40, y: offsetY },
});

const rootNode = {
  ...makeNode(null, 1, 60),
  id: "root",
  meta: { label: "INITIAL_BOARD_PLACEHOLDER", note: "", tag: "normal", isCollapsed: false },
  action: { type: "play", description: "ゲーム開始", actor: "me" },
  position: { x: 40, y: 60 },
};

const INITIAL_TREE = {
  id: "tree1",
  title: "新規分析",
  rootNodeId: "root",
  nodes: { root: rootNode },
};

// ============================================================
// UTILS
// ============================================================
function getDescendants(nodes, nodeId) {
  const result = [];
  const stack = [nodeId];
  while (stack.length) {
    const id = stack.pop();
    const node = nodes[id];
    if (!node) continue;
    result.push(id);
    node.children.forEach(c => stack.push(c));
  }
  return result;
}

function getAllEdges(nodes) {
  const edges = [];
  Object.values(nodes).forEach(node => {
    node.children.forEach(childId => {
      if (nodes[childId]) edges.push({ from: node.id, to: childId });
    });
  });
  return edges;
}

function isHiddenByAncestor(nodes, nodeId) {
  const node = nodes[nodeId];
  if (!node || !node.parentId) return false;
  const parent = nodes[node.parentId];
  if (!parent) return false;
  if (parent.meta.isCollapsed) return true;
  return isHiddenByAncestor(nodes, node.parentId);
}

// ============================================================
// MEMORY GAUGE
// ============================================================
function MemoryGauge({ value, onChange, compact, memLabel, t = {} }) {
  const max = 10;
  const color = value > 0 ? "#4a9eff" : value < 0 ? "#ef4444" : "#94a3b8";

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 10, color: "#4a9eff", fontWeight: 700, letterSpacing: 0.5, whiteSpace: "nowrap", flexShrink: 0 }}>{memLabel || "MEM"}</span>
        <div style={{ width: 72, height: 9, background: "#1e293b", borderRadius: 3, position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <div style={{
            position: "absolute", left: "50%", height: "100%",
            width: `${Math.abs(value) / max * 50}%`,
            background: color, borderRadius: 3,
            transform: value >= 0 ? "translateX(0)" : "translateX(-100%)",
          }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#475569" }} />
        </div>
        <span style={{ color, fontSize: 15, fontWeight: 900, fontFamily: "monospace", minWidth: 28 }}>
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span style={{ color, fontSize: 20, fontWeight: 900, fontFamily: "monospace" }}>
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <div style={{ position: "relative", height: 7, background: "#0f172a", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          position: "absolute", right: "50%", top: 0, bottom: 0,
          width: `${Math.abs(value) / max * 50}%`,
          background: value >= 0
            ? `linear-gradient(90deg, ${color}, ${color}88)`
            : `linear-gradient(90deg, ${color}88, ${color})`,
          transform: value >= 0 ? "translateX(0)" : "translateX(100%)",
        }} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#334155" }} />
      </div>
      {onChange && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => onChange(Math.min(10, value + 1))} style={{
              width: 26, height: 26, background: "#0b1320", border: "1px solid #1a2535",
              borderRadius: 4, color: "#4a9eff", cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>◀</button>
            <input type="range" min={-10} max={10} value={-value}
              onChange={e => onChange(-parseInt(e.target.value))}
              style={{ flex: 1, accentColor: color, cursor: "pointer" }} />
            <button onClick={() => onChange(Math.max(-10, value - 1))} style={{
              width: 26, height: 26, background: "#0b1320", border: "1px solid #1a2535",
              borderRadius: 4, color: "#ef4444", cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>▶</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, color: "#334155" }}>{"→自分"}</span>
            <span style={{ fontSize: 9, color: "#334155" }}>{"相手←"}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// NODE CARD
// ============================================================
function BoardNodeCard({ node, parentNode, isSelected, onSelect, onAddChild, onDelete, onToggleCollapse, isDragging, t, blockActions, onBlockStart, onOpenPanel, settings, htmlExportMode, htmlExportStart, isDescendantOf }) {
  const tag = NODE_TAGS[node.meta.tag] || NODE_TAGS.normal;
  const isRoot = node.parentId === null;
  const effectiveColor = node.meta.color ?? (settings?.defaultNodeColor ?? null);
  const nodeColorDef = NODE_COLORS.find(c => c.value === effectiveColor) || NODE_COLORS[0];
  const oppSecDiff = parentNode ? node.state.oppSecurity - parentNode.state.oppSecurity : 0;
  const oppSecDecreased = oppSecDiff < 0;

  // HTML出力モード時のハイライト
  const isExportStart = htmlExportMode && htmlExportStart === node.id;
  const isExportSelectable = htmlExportMode === 'end' && htmlExportStart
    && (node.id === htmlExportStart || (isDescendantOf && isDescendantOf(node.id, htmlExportStart)));
  const isExportDimmed = htmlExportMode === 'end' && !isExportSelectable;

  const handleNodePointerDown = (e) => {
    if (!isSelected) {
      onBlockStart && onBlockStart();
      onSelect(node.id);
    } else {
      onSelect(null);
    }
  };

  const handleAction = (fn) => (e) => {
    e.stopPropagation();
    if (typeof blockActions === 'function' ? blockActions() : blockActions) return;
    fn();
  };

  const phase = PHASES.includes(node.state?.phase) ? node.state.phase : "main";
  const phaseLabel = getPhaseLabel(t, phase);

  return (
    <div style={{
      position: "absolute",
      left: node.position.x,
      top: node.position.y,
      width: NODE_W,
      fontFamily: "monospace",
      zIndex: isSelected ? 10 : 1,
    }}>
      {/* フェイズラベル（ノード外側左上） */}
      <div style={{
        position: "absolute", top: -16, left: 4,
        fontSize: 9, color: "#4a9eff99", fontWeight: 700,
        letterSpacing: 0.5, whiteSpace: "nowrap",
        pointerEvents: "none",
      }}>{phaseLabel}</div>

    <div
      onPointerDown={e => { e.stopPropagation(); handleNodePointerDown(e); }}
      data-nodeid={node.id}
      style={{
        width: NODE_W,
        boxSizing: "border-box",
        background: nodeColorDef.value
          ? `linear-gradient(160deg, ${nodeColorDef.value}, ${nodeColorDef.bg})`
          : `linear-gradient(160deg, #0f172a, #131f30)`,
        border: isExportStart
          ? `2px solid #f59e0b`
          : isExportSelectable
          ? `2px solid #22c55e`
          : oppSecDecreased
            ? `1.5px solid #ef4444`
            : nodeColorDef.border
              ? `2px solid ${nodeColorDef.border}`
              : `1.5px solid ${isSelected ? "#ffffff" : "#243040"}`,
        outline: isExportStart ? "3px solid #f59e0b88"
          : isExportSelectable ? "3px solid #22c55e88"
          : isSelected ? "4px solid #ffffff" : "none",
        outlineOffset: "1px",
        borderRadius: 10,
        cursor: htmlExportMode ? (isExportSelectable || htmlExportMode === 'start' ? "pointer" : "not-allowed") : isDragging ? "grabbing" : "grab",
        userSelect: "none",
        opacity: isExportDimmed ? 0.35 : 1,
        boxShadow: isExportStart
          ? `0 0 0 3px #f59e0b88, 0 0 20px #f59e0b44`
          : isExportSelectable
          ? `0 0 0 2px #22c55e88, 0 0 16px #22c55e44`
          : isSelected
          ? `0 0 0 3px #ffffff88, 0 0 24px #ffffff44, 0 6px 24px #000a`
          : nodeColorDef.border && !oppSecDecreased
            ? `0 0 0 2px ${nodeColorDef.border}55, 0 0 16px ${nodeColorDef.border}33, 0 3px 12px #0008`
            : "0 3px 12px #0008",
        transition: isDragging ? "none" : "box-shadow 0.12s",
        fontFamily: "monospace",
        minWidth: 0,
      }}
    >
      <div style={{ height: 3, background: oppSecDecreased ? "#ef4444" : nodeColorDef.border ?? tag.color, borderRadius: "8px 8px 0 0" }} />

      <div style={{ padding: "7px 9px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: "#dde4f0", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
            {node.state.oppSecurity < 0 && (
              <span style={{ color: "#22c55e", marginRight: 4 }}>【勝ち】</span>
            )}
            {getNodeLabel(node.meta.label, t)}
          </div>
          {node.children.length > 0 && (
            <button
              onClick={e => {
                e.stopPropagation();
                onBlockStart && onBlockStart();
                onToggleCollapse(node.id);
              }}
              onPointerDown={e => e.stopPropagation()}
              style={{
                background: node.meta.isCollapsed ? "#4a9eff22" : "none",
                border: `1px solid ${node.meta.isCollapsed ? "#4a9eff88" : "#243040"}`,
                color: node.meta.isCollapsed ? "#4a9eff" : "#4a5568",
                width: 22, height: 22, borderRadius: 5, cursor: "pointer",
                fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginLeft: 4,
              }}
            >
              {node.meta.isCollapsed ? "▶" : "▼"}
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <MemoryGauge value={node.state.memory} compact memLabel={t.memory_label} />
          </div>
          {parentNode && node.state.memory !== parentNode.state.memory && (
            <span style={{
              fontSize: 10, flexShrink: 0, marginLeft: 4,
              color: node.state.memory - parentNode.state.memory > 0 ? "#4a9eff" : "#ef4444",
              fontWeight: 700,
            }}>
              ({node.state.memory - parentNode.state.memory > 0 ? "+" : ""}{node.state.memory - parentNode.state.memory})
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
          {(() => {
            const visible = settings?.visibleResourceKeys ?? ["mySecurity","oppSecurity","myHand","myDeck","oppDeck","myTrash"];
            const sz = settings?.resourceSize ?? "normal";
            const numSz = sz === "large" ? 22 : sz === "small" ? 13 : 18;
            const iconSz = sz === "large" ? 20 : sz === "small" ? 12 : 16;
            const resources = [
              { key: "mySecurity",  label: "自",  color: "#4a9eff", icon: "shield" },
              { key: "oppSecurity", label: "相", color: "#ef4444", icon: "shield" },
              { key: "myHand",      label: "✋", color: "#22c55e",  icon: "hand" },
              { key: "myDeck",      label: t.my_deck_label || "自山",  color: "#94a3b8", icon: "text" },
              { key: "oppDeck",     label: t.opp_deck_label || "相山", color: "#94a3b8", icon: "text" },
              { key: "myTrash",  label: t.my_trash_label  || "自捨札", color: "#94a3b8", icon: "text" },
              { key: "oppTrash", label: t.opp_trash_label || "相捨札", color: "#7a90a8", icon: "text" },
            ].filter(r => visible.includes(r.key));
            const top = resources.filter(r => ["mySecurity","oppSecurity"].includes(r.key));
            const middle = resources.filter(r => ["myHand","oppHand"].includes(r.key));
            const bottom = resources.filter(r => ["myDeck","oppDeck"].includes(r.key));
            const bottom2 = resources.filter(r => ["myTrash","oppTrash"].includes(r.key));
            const renderRes = (list) => list.map(r => {
                  const val = Number(node.state[r.key] ?? 0);
                  const parentVal = parentNode ? Number(parentNode.state[r.key] ?? 0) : null;
                  const resDiff = parentVal !== null ? val - parentVal : 0;
                  const isOppSec = r.key === "oppSecurity";
                  const decreased = isOppSec && oppSecDecreased;
                  return (
                    <span key={r.key} style={{
                      display: "flex", alignItems: "center", gap: 2,
                      ...(decreased ? { background:"#ef444422", borderRadius:6, padding:"2px 5px", boxShadow:"0 0 8px #ef444466", border:"1px solid #ef444488" } : {}),
                    }}>
                      {r.icon === "shield" ? (
                        <svg width={iconSz} height={iconSz+2} viewBox="0 0 24 28" fill="none">
                          <path d="M12 2L3 6v8c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6L12 2z" fill={r.color} stroke={r.color} strokeWidth="1"/>
                          <text x="12" y="18" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">{r.label}</text>
                        </svg>
                      ) : r.icon === "hand" ? (
                        <span style={{ fontSize: iconSz }}>🃏</span>
                      ) : (
                        <span style={{ fontSize: 10, color: "#4a6080" }}>{r.label}</span>
                      )}
                      <span style={{ fontSize: numSz, fontWeight: 900, color: decreased ? "#ff6b6b" : r.color }}>
                        {val}
                      </span>
                      {decreased && <span style={{ fontSize: 11, fontWeight: 700, color: "#ff6b6b" }}>{oppSecDiff}</span>}
                      {!decreased && resDiff !== 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: resDiff > 0 ? "#22c55e" : "#ef4444" }}>
                          {resDiff > 0 ? "+" : ""}{resDiff}
                        </span>
                      )}
                    </span>
                  );
                });
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
                {[...top, ...middle].length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    {renderRes([...top, ...middle])}
                  </div>
                )}
                {[...bottom, ...bottom2].length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    {renderRes([...bottom, ...bottom2])}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {node.meta.showZones !== false && getZoneDefs(t).filter(({ key }) => {
          if ((node.meta.hiddenZones || []).includes(key)) return false;
          const visKeys = (settings?.visibleZoneKeys) ?? ZONE_KEYS;
          return visKeys.includes(key);
        }).map(({ key, label, color }) => {
          const cards = node.meta.zones?.[key] || [];
          return (
            <div key={key} style={{
              marginTop: 4,
              background: "#090f1e", padding: "4px 6px", borderRadius: 3,
              borderLeft: `2px solid ${color}88`,
            }}>
              <div style={{ fontSize: 9, color: `${color}cc`, fontWeight: 700, marginBottom: 3 }}>{label}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {cards.length === 0
                  ? <span style={{ fontSize: 10, color: "#2a3a52", fontStyle: "italic" }}>{t.none_label || "なし"}</span>
                  : cards.map((item, itemIdx) => {
                      const stack = Array.isArray(item) ? item : [item];
                      const card = stack[0];
                      const stackCount = stack.length;
                      const parentCards = parentNode?.meta?.zones?.[key] || [];
                      const isNew = !parentCards.some(p => (Array.isArray(p) ? p[0] : p) === card);
                      return (
                        <NodeStackChip key={itemIdx} stack={stack} card={card} stackCount={stackCount} isNew={isNew} color={color} />
                      );
                    })
                }
              </div>
            </div>
          );
        })}

        {node.meta.note && (
          <div style={{
            marginTop: 5, fontSize: 10, color: "#7a90a8",
            background: "#090f1e", padding: "3px 6px", borderRadius: 3,
            maxHeight: 30, overflow: "hidden",
            borderLeft: "2px solid #243040",
          }}>
            📝 {node.meta.note}
          </div>
        )}
      </div>

      {isSelected && (
        <div style={{
          position: "absolute", top: 0, left: NODE_W + 8,
          display: "flex", flexDirection: "column", gap: 6, zIndex: 10,
        }}>
          <Btn color="#4a9eff" title={t.edit || "編集"} onClick={handleAction(() => onOpenPanel && onOpenPanel())}>✏️</Btn>
          <Btn color="#22c55e" title={t.add_child || "子ノード追加"} onClick={handleAction(() => onAddChild(node.id))}>+</Btn>
          {!isRoot && <Btn color="#ef4444" title={t.delete_btn || "削除"} onClick={handleAction(() => onDelete(node.id))}>×</Btn>}
        </div>
      )}

      {node.meta.isCollapsed && node.children.length > 0 && (
        <div style={{
          position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)",
          background: tag.color, color: "#000", fontSize: 8, fontWeight: 700,
          padding: "1px 4px", borderRadius: 8,
        }}>
          {node.children.length}
        </div>
      )}
    </div>
    </div>
  );
}

function Btn({ children, color, onClick, title }) {
  return (
    <button
      onClick={onClick}
      onPointerDown={e => e.stopPropagation()}
      title={title}
      style={{
        background: `${color}33`, border: `1.5px solid ${color}88`, color,
        width: 30, height: 30, borderRadius: 8, cursor: "pointer",
        fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, boxShadow: `0 2px 8px ${color}44`,
      }}>
      {children}
    </button>
  );
}

// ============================================================
// EDGES
// ============================================================
function EdgeLayer({ nodes, visibleIds }) {
  const edges = useMemo(() => getAllEdges(nodes), [nodes]);
  const visible = new Set(visibleIds);

  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
          <path d="M0,0 L0,5 L7,2.5 z" fill="#2a3a52" />
        </marker>
      </defs>
      {edges.filter(e => visible.has(e.from) && visible.has(e.to)).map(edge => {
        const from = nodes[edge.from];
        const to = nodes[edge.to];
        if (!from || !to) return null;
        const x1 = from.position.x + NODE_W;
        const y1 = from.position.y + NODE_H / 2;
        const x2 = to.position.x;
        const y2 = to.position.y + NODE_H / 2;
        const cx = (x1 + x2) / 2;
        const toTag = NODE_TAGS[to.meta.tag] || NODE_TAGS.normal;
        return (
          <path key={`${edge.from}-${edge.to}`}
            d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`}
            fill="none" stroke={toTag.color} strokeWidth={1.5}
            strokeOpacity={0.45} markerEnd="url(#arr)"
          />
        );
      })}
    </svg>
  );
}


const ZONE_KEYS = ["hand","breeding","main","trash","deck","security"];
const ZONE_COLORS = { hand: "#22c55e", breeding: "#4a9eff", main: "#f59e0b", trash: "#94a3b8", deck: "#a855f7", security: "#ef4444" };
const ZONE_LABEL_KEYS = { hand: "zone_hand", breeding: "zone_breeding", main: "zone_main", trash: "zone_trash", deck: "zone_deck", security: "zone_security" };
const getZoneDefs = (t) => ZONE_KEYS.map(key => ({ key, label: t[ZONE_LABEL_KEYS[key]] || key, color: ZONE_COLORS[key] }));
const ZONE_DEFS = [
  { key: "hand",     label: "手札",         color: "#22c55e" },
  { key: "breeding", label: "育成エリア",   color: "#4a9eff" },
  { key: "main",     label: "バトルエリア", color: "#f59e0b" },
  { key: "trash",    label: "トラッシュ",   color: "#94a3b8" },
  { key: "deck",     label: "山札",         color: "#a855f7" },
  { key: "security", label: "セキュリティ", color: "#ef4444" },
];

// ツリーノード上のスタック表示チップ
function NodeStackChip({ stack, card, stackCount, isNew, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, width: stackCount > 1 ? "100%" : "auto" }}>
      <span style={{
        background: isNew ? `${color}40` : `${color}18`,
        border: isNew ? `1.5px solid ${color}` : `1px solid ${color}55`,
        borderRadius: stackCount > 1 ? "4px 4px 0 0" : 4,
        padding: "2px 6px", fontSize: 10, color,
        fontWeight: isNew ? 700 : 400,
        boxShadow: isNew ? `0 0 4px ${color}66` : "none",
        display: "inline-flex", alignItems: "center", gap: 2,
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card}</span>
        {isNew && <span style={{ fontSize: 8, opacity: 0.8, flexShrink: 0 }}>★</span>}
      </span>
      {stack.slice(1).map((c, ci) => (
        <span key={ci} style={{
          background: `${color}0e`,
          border: `1px solid ${color}33`,
          borderTop: "none",
          borderRadius: ci === stack.length - 2 ? "0 0 4px 4px" : 0,
          padding: "2px 6px 2px 12px",
          fontSize: 9, color: color + "bb",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          <span style={{ fontSize: 7, opacity: 0.5 }}>└</span>
          <span>{c}</span>
          <span style={{ fontSize: 7, opacity: 0.4, marginLeft: "auto" }}>進化元{ci + 1}</span>
        </span>
      ))}
    </div>
  );
}

function ZoneEditor({ zones = {}, onChange, hiddenZones = [], onToggleHidden, parentZones, onPropagateUp, t = {}, settings = {}, moveTarget, setMoveTarget, deleteMode = false, selectedCards = [], setSelectedCards = () => {}, restMode = false, cardStates = {}, onToggleCardState = () => {} }) {
  const [inputs, setInputs] = useState({});
  const [editing, setEditing] = useState({});
  const [diffPreview, setDiffPreview] = useState({});
  const [dragOver, setDragOver] = useState(null);
  const dragRef = useRef(null);
  const [stackModal, setStackModal] = useState(null);
  const [expandedItems, setExpandedItems] = useState({}); // `${key}:${itemIdx}` -> bool
  const toggleExpanded = (key, itemIdx) =>
    setExpandedItems(prev => ({ ...prev, [`${key}:${itemIdx}`]: !prev[`${key}:${itemIdx}`] }));
  const [stackTarget, setStackTarget] = useState(null);
  const [dupConfirm, setDupConfirm] = useState(null);
  const [addModal, setAddModal] = useState(null);
  const [addModalInput, setAddModalInput] = useState('');
  const addModalInputRef = useRef(null);

  const addCard = (key, forcedVal) => {
    const val = forcedVal !== undefined ? forcedVal : (inputs[key] || "").trim();
    if (!val) return;
    const current = zones[key] || [];
    // 全カード名をフラットに取得（スタック内含む）
    const allNames = current.flatMap(item => Array.isArray(item) ? item : [item]);
    let addVal = val;
    if (allNames.some(c => c === val)) {
      const base = val.replace(/\d+$/, "").trimEnd();
      const nums = allNames.map(c => {
        const m = c.match(/^(.+?)(\d+)$/);
        return m && m[1].trimEnd() === base ? parseInt(m[2]) : null;
      }).filter(n => n !== null);
      addVal = `${base}${nums.length > 0 ? Math.max(...nums) + 1 : 2}`;
    }
    onChange({ ...zones, [key]: [...current, addVal] });
    if (forcedVal === undefined) setInputs(p => ({ ...p, [key]: "" }));
  };

  const removeCard = (key, card) => {
    onChange({ ...zones, [key]: (zones[key] || []).filter(c => c !== card) });
    setEditing(p => { const n = { ...p }; delete n[`${key}:${card}`]; return n; });
  };

  const startEdit = (key, card) => {
    setEditing(p => ({ ...p, [`${key}:${card}`]: card }));
  };

  const commitEdit = (key, card) => {
    const newVal = (editing[`${key}:${card}`] || "").trim();
    if (!newVal) { removeCard(key, card); return; }
    const current = zones[key] || [];
    const updated = current.map(c => c === card ? newVal : c);
    onChange({ ...zones, [key]: updated });
    setEditing(p => { const n = { ...p }; delete n[`${key}:${card}`]; return n; });
  };

  const zoneDefs = getZoneDefs(t);
  const totalCards = zoneDefs.reduce((acc, { key }) => acc + (zones[key] || []).length, 0);
  const showOnNode = true;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, width: "100%" }}>
      {stackModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#000b", zIndex: 300,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => { setStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null }); }}
           onPointerDown={e => e.stopPropagation()}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1a28", border: "1px solid #4a9eff55",
            borderRadius: "12px 12px 0 0", padding: "16px 16px 32px",
            width: "100%", maxWidth: 480,
            display: "flex", flexDirection: "column", gap: 10,
            fontFamily: "monospace",
          }}>
            {(() => {
              const { card, fromKey, fromItemIdx, fromSubIdx, targetCard, targetKey, targetItemIdx } = stackModal;
              const isSelf = fromKey === targetKey && fromItemIdx === targetItemIdx;
              const srcItem = zones[fromKey]?.[fromItemIdx];
              const srcStack = Array.isArray(srcItem) ? srcItem : [srcItem || card];

              const doMove = (type) => {
                const z = JSON.parse(JSON.stringify(zones));
                if (isSelf) {
                  const st = Array.isArray(z[fromKey][fromItemIdx]) ? [...z[fromKey][fromItemIdx]] : [z[fromKey][fromItemIdx]];
                  if (type === "top_out") { const p = st.shift(); z[fromKey][fromItemIdx] = st.length === 1 ? st[0] : st; z[fromKey] = [...z[fromKey], p]; }
                  else if (type === "rotate") { const p = st.shift(); st.push(p); z[fromKey][fromItemIdx] = st.length === 1 ? st[0] : st; }
                } else {
                  // fromを削除してadjIdxを返す
                  let adjIdx = targetItemIdx;
                  if (fromSubIdx !== undefined) {
                    const fs = Array.isArray(z[fromKey][fromItemIdx]) ? [...z[fromKey][fromItemIdx]] : [z[fromKey][fromItemIdx]];
                    fs.splice(fromSubIdx, 1);
                    z[fromKey][fromItemIdx] = fs.length === 1 ? fs[0] : fs;
                  } else if (fromItemIdx !== undefined) {
                    const fa = [...(z[fromKey] || [])];
                    fa.splice(fromItemIdx, 1);
                    z[fromKey] = fa;
                    if (fromKey === targetKey && fromItemIdx < targetItemIdx) adjIdx = targetItemIdx - 1;
                  }
                  // targetを操作
                  const tArr = [...(z[targetKey] || [])];
                  const tItem = tArr[adjIdx];
                  const tStack = Array.isArray(tItem) ? tItem : [tItem];
                  if (type === "on_top") { tArr[adjIdx] = [card, ...tStack]; z[targetKey] = tArr; }
                  else if (type === "on_bottom") { tArr[adjIdx] = [...tStack, card]; z[targetKey] = tArr; }
                  else if (type === "stack_on_bottom") {
                    // スタックごと対象スタックの下に入る
                    tArr[adjIdx] = [...tStack, ...srcStack];
                    z[targetKey] = tArr;
                  }
                  else if (type === "zone_top") { tArr.push(card); z[targetKey] = tArr; }
                }
                onChange(z); setStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null });
              };

              const targetZoneLabel = t[ZONE_LABEL_KEYS[targetKey]] || targetKey;
              const hasStack = fromSubIdx === undefined && srcStack.length > 1;

              return (<>
                <div style={{ fontSize: 12, color: "#7a90a8", marginBottom: 4 }}>
                  {isSelf
                    ? <><span style={{ color: "#4a9eff", fontWeight: 700 }}>「{card}」</span> のスタックを操作：</>
                    : <><span style={{ color: "#4a9eff", fontWeight: 700 }}>「{card}」</span>{" "}{t.stack_label || "を"}{" "}<span style={{ color: "#f59e0b", fontWeight: 700 }}>「{targetCard}」</span>{" "}{t.stack_against || "に対して："}</>
                  }
                </div>
                {isSelf ? (<>
                  <div style={{ fontSize: 10, color: "#4a6080" }}>スタック：{srcStack.join(" → ")}</div>
                  <button onClick={() => doMove("top_out")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#4a9eff18", border: "1px solid #4a9eff66", color: "#4a9eff", fontSize: 13, fontWeight: 700 }}>「{srcStack[0]}」を同エリアに単体で出す</button>
                  {srcStack.length > 1 && <button onClick={() => doMove("rotate")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#a855f718", border: "1px solid #a855f766", color: "#a855f7", fontSize: 13, fontWeight: 700 }}>「{srcStack[0]}」を一番下へ</button>}
                </>) : (<>
                  <button onClick={() => doMove("on_top")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#4a9eff18", border: "1px solid #4a9eff66", color: "#4a9eff", fontSize: 13, fontWeight: 700 }}>「{targetCard}」の上に重ねる（進化）</button>
                  <button onClick={() => doMove("on_bottom")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#a855f718", border: "1px solid #a855f766", color: "#a855f7", fontSize: 13, fontWeight: 700 }}>「{targetCard}」の下に入る（進化元）</button>
                  {hasStack && <button onClick={() => doMove("stack_on_bottom")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#ec489918", border: "1px solid #ec489966", color: "#ec4899", fontSize: 13, fontWeight: 700 }}>スタックごと「{targetCard}」の下に入る（{srcStack.join("→")}）</button>}
                  {hasStack && <button onClick={() => { const z2 = JSON.parse(JSON.stringify(zones)); const fa2 = [...(z2[fromKey]||[])]; fa2.splice(fromItemIdx,1); z2[fromKey]=fa2; const ta2=Array.isArray(z2[targetKey])?[...z2[targetKey]]:[]; ta2.push(srcStack.length===1?srcStack[0]:srcStack); z2[targetKey]=ta2; onChange(z2); setStackModal(null); setMoveTarget({mode:"move",fromKey:null,card:null}); }} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#f59e0b18", border: "1px solid #f59e0b66", color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>スタックごと{targetZoneLabel}に出す</button>}
                  <button onClick={() => doMove("zone_top")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#22c55e18", border: "1px solid #22c55e66", color: "#22c55e", fontSize: 13, fontWeight: 700 }}>「{card}」だけ{targetZoneLabel}に出す（重ねない）</button>
                </>)}
                <button onClick={() => { setStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null }); }} style={{ padding: "8px 0", borderRadius: 6, cursor: "pointer", background: "none", border: "1px solid #2a3a52", color: "#4a6080", fontSize: 12 }}>{t.cancel || "キャンセル"}</button>
              </>);
            })()}
          </div>
        </div>
      )}

      {totalCards > 0 && (
        <span style={{
          background: "#4a9eff33", color: "#4a9eff",
          borderRadius: 10, padding: "1px 7px", fontSize: 10,
          fontFamily: "monospace", alignSelf: "flex-start",
        }}>{totalCards}</span>
      )}

      {dupConfirm && (
        <div style={{
          background: "#f59e0b18", border: "1px solid #f59e0b66",
          borderRadius: 6, padding: "10px 12px", fontSize: 11,
          color: "#f59e0b", fontFamily: "monospace",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ fontWeight: 700 }}>「{dupConfirm.val}」は既に登録されています</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button onClick={() => {
              addCard(dupConfirm.key, dupConfirm.numbered);
              setInputs(p => ({ ...p, [dupConfirm.key]: "" }));
              setDupConfirm(null);
            }} style={{
              flex: 1, padding: "6px 0", borderRadius: 4, cursor: "pointer",
              background: "#4a9eff22", border: "1px solid #4a9eff66", color: "#4a9eff",
              fontSize: 11, fontFamily: "monospace", fontWeight: 700,
            }}>番号付きで追加「{dupConfirm.numbered}」</button>
            <button onClick={() => {
              addCard(dupConfirm.key, dupConfirm.val);
              setInputs(p => ({ ...p, [dupConfirm.key]: "" }));
              setDupConfirm(null);
            }} style={{
              flex: 1, padding: "6px 0", borderRadius: 4, cursor: "pointer",
              background: "#22c55e22", border: "1px solid #22c55e66", color: "#22c55e",
              fontSize: 11, fontFamily: "monospace", fontWeight: 700,
            }}>同名のまま追加</button>
            <button onClick={() => { setInputs(p => ({ ...p, [dupConfirm.key]: "" })); setDupConfirm(null); }} style={{
              padding: "6px 10px", borderRadius: 4, cursor: "pointer",
              background: "none", border: "1px solid #2a3a52", color: "#4a6080",
              fontSize: 11, fontFamily: "monospace",
            }}>キャンセル</button>
          </div>
        </div>
      )}

      {addModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#000a", zIndex: 200,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => { setAddModal(null); setAddModalInput(''); }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1a28", border: `1px solid ${addModal.color}66`,
            borderRadius: "12px 12px 0 0", padding: "16px 16px 32px",
            width: "100%", maxWidth: 480,
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontSize: 13, color: addModal.color, fontWeight: 700, fontFamily: "monospace" }}>
              {addModal.label}
            </div>
            {(zones[addModal.key] || []).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(zones[addModal.key] || []).map(card => {
                  const parentCards = parentZones?.[addModal.key] || [];
                  const isNew = !parentCards.includes(card);
                  return (
                    <span key={card} style={{
                      background: isNew ? `${addModal.color}40` : `${addModal.color}18`,
                      border: `1px solid ${isNew ? addModal.color : addModal.color + "55"}`,
                      borderRadius: 6, padding: "5px 8px",
                      fontSize: 11, color: addModal.color,
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {card}
                      <button onClick={() => removeCard(addModal.key, card)} style={{
                        background: "none", border: "none", color: "#ef4444",
                        cursor: "pointer", fontSize: 13, padding: "0 2px", lineHeight: 1,
                      }}>×</button>
                    </span>
                  );
                })}
              </div>
            )}
            <input
              ref={addModalInputRef}
              autoFocus
              value={addModalInput}
              onChange={e => setAddModalInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && addModalInput.trim()) {
                  addCard(addModal.key, addModalInput.trim());
                  setAddModalInput('');
                }
              }}
              placeholder={t.card_input_placeholder || "カード名を入力... (Enterで追加)"}
              style={{
                width: "100%", background: "#0b1320", border: `1px solid ${addModal.color}44`,
                borderRadius: 6, padding: "10px 12px", color: "#dde4f0",
                fontSize: 16, fontFamily: "monospace", outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button onClick={() => {
              if (addModalInput.trim()) addCard(addModal.key, addModalInput.trim());
              setAddModal(null);
              setAddModalInput('');
            }} style={{
              width: "100%", padding: "12px 0", borderRadius: 6, cursor: "pointer",
              background: "#1a2535", border: "1px solid #2a3a52",
              color: "#dde4f0", fontSize: 13, fontFamily: "monospace", fontWeight: 700,
            }}>完了</button>
          </div>
        </div>
      )}

      {showOnNode && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, minWidth: 0, width: "100%" }}>
          {zoneDefs.map(({ key, label, color }) => {
            const cards = zones[key] || [];
            const isHidden = hiddenZones.includes(key);
            return (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
                <div style={{
                  background: "#0b1320",
                  border: `1px solid ${moveTarget?.card && moveTarget.fromKey !== key ? color + "88" : isHidden ? "#1a2535" : color + "44"}`,
                  borderRadius: "8px 8px 0 0", padding: "6px 8px",
                  opacity: isHidden ? 0.4 : 1,
                  flex: 1, display: "flex", flexDirection: "column", gap: 4,
                  minWidth: 0, overflowX: "hidden",
                  cursor: moveTarget?.card && moveTarget.fromKey !== key ? "pointer" : "default",
                  boxShadow: moveTarget?.card && moveTarget.fromKey !== key ? `0 0 8px ${color}44` : "none",
                }} onClick={() => {
                  if (stackModal) return;
                  const canMove = moveTarget?.card && (moveTarget.fromKey !== key || moveTarget.subIdx !== undefined);
                  if (canMove) {
                    const newZones = JSON.parse(JSON.stringify(zones));
                    if (moveTarget.subIdx !== undefined) {
                      // スタック内カードを抜く
                      const fromStack = Array.isArray(newZones[moveTarget.fromKey][moveTarget.itemIdx])
                        ? [...newZones[moveTarget.fromKey][moveTarget.itemIdx]]
                        : [newZones[moveTarget.fromKey][moveTarget.itemIdx]];
                      fromStack.splice(moveTarget.subIdx, 1);
                      newZones[moveTarget.fromKey][moveTarget.itemIdx] = fromStack.length === 1 ? fromStack[0] : fromStack;
                    } else {
                      // アイテムごと抜く
                      const fromArr = [...(newZones[moveTarget.fromKey] || [])];
                      fromArr.splice(moveTarget.itemIdx, 1);
                      newZones[moveTarget.fromKey] = fromArr;
                    }
                    newZones[key] = [...(newZones[key] || []), moveTarget.card];
                    onChange(newZones);
                    setMoveTarget({ mode: "move", fromKey: null, card: null });
                  }
                }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color, fontWeight: 800 }}>{label}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, minHeight: 20 }}>
                    {cards.length === 0
                      ? <span style={{ fontSize: 9, color: "#2a3a52", fontStyle: "italic" }}>{t.none_label || "なし"}</span>
                      : cards.map((item, itemIdx) => {
                          const stack = Array.isArray(item) ? item : [item];
                          const card = stack[0];
                          const stackCount = stack.length;
                          const parentCards = parentZones?.[key] || [];
                          const isNew = !parentCards.some(p => (Array.isArray(p) ? p[0] : p) === card);
                          const isMoving = moveTarget?.card === card && moveTarget?.fromKey === key;
                          const isRest = cardStates[`${key}:${card}`] === "rest";
                          const showToggle = !["deck","trash","hand"].includes(key);
                          const isSelected = deleteMode && selectedCards.some(s => s.key === key && s.itemIdx === itemIdx);
                          return (
                            <div key={itemIdx} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                              {/* 先頭カード */}
                              {(() => {
                                const expKey = `${key}:${itemIdx}`;
                                const isExpanded = !!expandedItems[expKey];
                                return (<>
                                <div style={{
                                  border: `1px solid ${isSelected ? "#ef4444" : isMoving ? color : isNew ? color : color + "55"}`,
                                  borderRadius: stackCount > 1 ? (isExpanded ? "6px 6px 0 0" : "6px") : 6,
                                  overflow: "hidden",
                                  boxShadow: isMoving ? `0 0 6px ${color}88` : "none",
                                  opacity: isRest ? 0.7 : 1,
                                  display: "flex",
                                }}>
                                  {showToggle && (
                                    <span onClick={e => { e.stopPropagation(); onToggleCardState(key, card); }} style={{
                                      background: isRest ? color + "33" : color + "22",
                                      borderRight: `1px solid ${color}55`,
                                      padding: "5px 8px", fontSize: 11, color,
                                      display: "flex", alignItems: "center",
                                      cursor: "pointer", flexShrink: 0,
                                    }}>{isRest ? "▶︎" : "▲"}</span>
                                  )}
                                  <span onClick={e => {
                                    e.stopPropagation();
                                    if (deleteMode) {
                                      setSelectedCards(prev =>
                                        prev.some(s => s.key === key && s.itemIdx === itemIdx)
                                          ? prev.filter(s => !(s.key === key && s.itemIdx === itemIdx))
                                          : [...prev, { key, card, itemIdx }]
                                      );
                                      return;
                                    }
                                    if (restMode) { onToggleCardState(key, card); return; }
                                    if (moveTarget?.mode === "move") {
                                      if (moveTarget.card === null) {
                                        setMoveTarget({ mode: "move", fromKey: key, card, itemIdx });
                                      } else if (moveTarget.card === card && moveTarget.fromKey === key) {
                                        setMoveTarget({ mode: "move", fromKey: null, card: null });
                                      } else {
                                        setStackModal({ card: moveTarget.card, fromKey: moveTarget.fromKey, fromItemIdx: moveTarget.itemIdx, fromSubIdx: moveTarget.subIdx, targetCard: card, targetKey: key, targetItemIdx: itemIdx });
                                      }
                                    }
                                  }} style={{
                                    background: isSelected ? "#ef444422" : deleteMode ? "#ef444412"
                                      : isMoving ? `${color}55` : isNew ? `${color}40` : `${color}18`,
                                    padding: "5px 8px", fontSize: 11,
                                    color: isSelected ? "#ef4444" : deleteMode ? "#ef4444" : color,
                                    fontWeight: isNew ? 700 : 400,
                                    display: "flex", alignItems: "center", gap: 4,
                                    flex: 1, minWidth: 0, cursor: "pointer",
                                  }}>
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card}</span>
                                    {isNew && <span style={{ fontSize: 8, flexShrink: 0 }}>★</span>}
                                    {isSelected && <span style={{ fontSize: 11, flexShrink: 0 }}>✓</span>}
                                  </span>
                                  {stackCount > 1 && (
                                    <span onClick={e => { e.stopPropagation(); toggleExpanded(key, itemIdx); }} style={{
                                      background: isExpanded ? color + "44" : color + "22",
                                      borderLeft: `1px solid ${color}55`,
                                      padding: "5px 8px", fontSize: 10, color,
                                      display: "flex", alignItems: "center", gap: 2,
                                      cursor: "pointer", flexShrink: 0,
                                    }}>{isExpanded ? "▲" : "▼"}<span style={{ fontSize: 9 }}>{stackCount - 1}</span></span>
                                  )}
                                </div>
                                {/* 進化元（展開時のみ） */}
                                {isExpanded && stack.slice(1).map((c, ci) => {
                                  const subIdx = ci + 1;
                                  const isSubMoving = moveTarget?.card === c && moveTarget?.fromKey === key && moveTarget?.itemIdx === itemIdx && moveTarget?.subIdx === subIdx;
                                  return (
                                    <span key={ci} onClick={() => {
                                      if (deleteMode || restMode) return;
                                      if (moveTarget?.mode === "move") {
                                        if (!moveTarget.card) {
                                          setMoveTarget({ mode: "move", fromKey: key, card: c, itemIdx, subIdx });
                                        } else if (isSubMoving) {
                                          setMoveTarget({ mode: "move", fromKey: null, card: null });
                                        } else {
                                          setStackModal({ card: moveTarget.card, fromKey: moveTarget.fromKey, fromItemIdx: moveTarget.itemIdx, fromSubIdx: moveTarget.subIdx, targetCard: c, targetKey: key, targetItemIdx: itemIdx });
                                        }
                                      }
                                    }} style={{
                                      background: isSubMoving ? `${color}33` : `${color}0e`,
                                      border: `1px solid ${isSubMoving ? color : color + "33"}`,
                                      borderTop: "none",
                                      borderRadius: ci === stackCount - 2 ? "0 0 6px 6px" : 0,
                                      padding: "3px 8px 3px 16px",
                                      fontSize: 10, color: isSubMoving ? color : color + "bb",
                                      display: "flex", alignItems: "center", gap: 3,
                                      cursor: "pointer",
                                      boxShadow: isSubMoving ? `0 0 4px ${color}88` : "none",
                                    }}>
                                      <span style={{ fontSize: 8, opacity: 0.5 }}>└</span>
                                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c}</span>
                                      <span style={{ fontSize: 8, opacity: 0.4, marginLeft: "auto" }}>進化元{ci + 1}</span>
                                      {isSubMoving && <span style={{ fontSize: 9 }}>→</span>}
                                    </span>
                                  );
                                })}
                                </>);
                              })()}
                            </div>
                          );
                        })
                    }
                  </div>
                </div>
                <button onClick={() => { setAddModal({ key, color, label }); setAddModalInput(''); }} style={{
                  background: `${color}22`, border: `1px solid ${color}55`, color,
                  borderRadius: "0 0 8px 8px", padding: "6px 0", cursor: "pointer",
                  fontSize: 16, fontWeight: 700, width: "100%",
                }}>+</button>
              </div>
            );
          })}
        </div>
      )}

      {/* 削除モード時の削除実行ボタン */}
      {deleteMode && (
        <button
          onClick={() => {
            if (selectedCards.length === 0) return;
            const newZones = JSON.parse(JSON.stringify(zones));
            // itemIdxの大きい順にspliceしてズレを防ぐ
            const sorted = [...selectedCards].sort((a, b) =>
              a.key === b.key ? b.itemIdx - a.itemIdx : 0
            );
            sorted.forEach(({ key, itemIdx }) => {
              if (newZones[key] && itemIdx !== undefined) {
                newZones[key].splice(itemIdx, 1);
              }
            });
            onChange(newZones);
            setSelectedCards([]);
          }}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 6, cursor: "pointer",
            background: selectedCards.length > 0 ? "#ef444422" : "#1a2535",
            border: `1px solid ${selectedCards.length > 0 ? "#ef4444" : "#2a3a52"}`,
            color: selectedCards.length > 0 ? "#ef4444" : "#4a5568",
            fontSize: 13, fontFamily: "monospace", fontWeight: 700,
            marginTop: 4,
          }}
        >
          🗑 {selectedCards.length > 0 ? `${selectedCards.length}枚を削除` : "カードを選択してください"}
        </button>
      )}

    </div>
  );
}

// ============================================================
// BOARD LAYOUT VIEW（プレイシート風）
// ============================================================
function BoardLayout({ zones = {}, parentZones = {}, t = {}, state = {}, parentState = {}, cardStates = {}, onToggleCardState = null, note = undefined, onChangeZones = null, moveTarget = null, setMoveTarget = null, stackModal = null, setStackModal = null, moveStackModal = null, setMoveStackModal = null, onChangeMemory = null, onZoneRef = null }) {
  const z = zones;
  const [expandedMap, setExpandedMap] = React.useState({});
  const toggleExpanded = (zoneKey, itemIdx) => {
    const k = `${zoneKey}:${itemIdx}`;
    setExpandedMap(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const isNew = (key, card) => !((parentZones[key] || []).includes(card));

  const CardChip = ({ card, zoneKey, color }) => {
    const _isNew = isNew(zoneKey, card);
    const isRest = cardStates[`${zoneKey}:${card}`] === "rest";
    return (
      <span
        onClick={() => onToggleCardState && onToggleCardState(zoneKey, card)}
        style={{
          background: _isNew ? `${color}40` : `${color}18`,
          border: `1px solid ${_isNew ? color : color + "55"}`,
          borderRadius: 4, padding: "2px 6px",
          fontSize: 10, color,
          fontWeight: _isNew ? 700 : 400,
          wordBreak: "break-all", display: "inline-flex", alignItems: "center", gap: 3,
          lineHeight: 1.4,
          opacity: isRest ? 0.7 : 1,
          cursor: onToggleCardState ? "pointer" : "default",
        }}>
        <span style={{ fontSize: 8, flexShrink: 0 }}>{isRest ? "▶︎" : "▲"}</span>
        <span>{card}{_isNew && <span style={{ fontSize: 7, marginLeft: 2 }}>★</span>}</span>
      </span>
    );
  };

  const ZoneBox = ({ label, zoneKey, color, style = {}, children }) => {
    const cards = z[zoneKey] || [];
    const canDrop = onChangeZones && moveTarget?.card && (moveTarget.fromKey !== zoneKey || moveTarget.subIdx !== undefined);
    return (
      <div ref={el => onZoneRef && onZoneRef(zoneKey, el)} onClick={() => {
        if (!onChangeZones || !moveTarget?.card) return;
        const canMove = moveTarget.fromKey !== zoneKey || moveTarget.subIdx !== undefined;
        if (!canMove) return;
        const srcItem = zones[moveTarget.fromKey]?.[moveTarget.itemIdx];
        const srcStack = Array.isArray(srcItem) ? srcItem : [srcItem];
        if (moveTarget.subIdx === undefined && srcStack.length > 1) {
          setMoveStackModal({ card: moveTarget.card, stack: srcStack, fromKey: moveTarget.fromKey, fromItemIdx: moveTarget.itemIdx, toKey: zoneKey });
          return;
        }
        const newZones = JSON.parse(JSON.stringify(zones));
        if (moveTarget.subIdx !== undefined) {
          const fromStack = Array.isArray(newZones[moveTarget.fromKey][moveTarget.itemIdx])
            ? [...newZones[moveTarget.fromKey][moveTarget.itemIdx]]
            : [newZones[moveTarget.fromKey][moveTarget.itemIdx]];
          fromStack.splice(moveTarget.subIdx, 1);
          newZones[moveTarget.fromKey][moveTarget.itemIdx] = fromStack.length === 1 ? fromStack[0] : fromStack;
        } else {
          const fromArr = [...(newZones[moveTarget.fromKey] || [])];
          fromArr.splice(moveTarget.itemIdx, 1);
          newZones[moveTarget.fromKey] = fromArr;
        }
        newZones[zoneKey] = [...(newZones[zoneKey] || []), moveTarget.card];
        onChangeZones(newZones);
        setMoveTarget({ mode: "move", fromKey: null, card: null });
      }} style={{
        background: "#090f1e",
        border: `1px solid ${canDrop ? color + "cc" : color + "66"}`,
        borderRadius: 6, padding: "6px 8px",
        display: "flex", flexDirection: "column", gap: 4,
        boxShadow: canDrop ? `0 0 8px ${color}44` : "none",
        cursor: canDrop ? "pointer" : "default",
        overflow: "hidden", minWidth: 0, boxSizing: "border-box",
        ...style,
      }}>
        <div style={{ fontSize: 9, color, fontWeight: 700, letterSpacing: 1, flexShrink: 0 }}>{label}</div>
        {children || (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {cards.length === 0
              ? <span style={{ fontSize: 9, color: "#2a3a52", fontStyle: "italic" }}>{t.none_label || "なし"}</span>
              : cards.map((item, i) => {
                  const stack = Array.isArray(item) ? item : [item];
                  const card = stack[0];
                  const stackCount = stack.length;
                  const _isNew = isNew(zoneKey, card);
                  const isRest = cardStates[`${zoneKey}:${card}`] === "rest";
                  const showToggle = onToggleCardState && !["deck","trash","hand"].includes(zoneKey);
                  const isMoving = moveTarget?.card === card && moveTarget?.fromKey === zoneKey;
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                      <div style={{
                        border: `1px solid ${isMoving ? color : _isNew ? color : color + "55"}`,
                        borderRadius: stackCount > 1 ? "6px 6px 0 0" : 6,
                        overflow: "hidden",
                        boxShadow: isMoving ? `0 0 6px ${color}88` : "none",
                        opacity: isRest ? 0.7 : 1,
                        display: "flex",
                      }}>
                        {showToggle && (
                          <span onClick={e => { e.stopPropagation(); onToggleCardState(zoneKey, card); }} style={{
                            background: isRest ? color + "33" : color + "22",
                            borderRight: `1px solid ${color}55`,
                            padding: "5px 8px", fontSize: 11, color,
                            display: "flex", alignItems: "center",
                            cursor: "pointer", flexShrink: 0,
                          }}>
                            {zoneKey === "security" ? (isRest ? "裏" : "表") : (isRest ? "▶︎" : "▲")}
                          </span>
                        )}
                        <span onClick={e => {
                          e.stopPropagation();
                          if (!onChangeZones || !setMoveTarget) return;
                          if (!moveTarget?.card) {
                            setMoveTarget({ mode: "move", fromKey: zoneKey, card, itemIdx: i });
                          } else if (isMoving) {
                            if (stackCount > 1) {
                              setStackModal({ card, fromKey: zoneKey, fromItemIdx: i, targetCard: card, targetKey: zoneKey, targetItemIdx: i });
                            } else {
                              setMoveTarget({ mode: "move", fromKey: null, card: null });
                            }
                          } else {
                            setStackModal({ card: moveTarget.card, fromKey: moveTarget.fromKey, fromItemIdx: moveTarget.itemIdx, targetCard: card, targetKey: zoneKey, targetItemIdx: i });
                          }
                        }} style={{
                          background: isMoving ? `${color}55` : _isNew ? `${color}40` : `${color}22`,
                          padding: "5px 8px", fontSize: 12, color,
                          fontWeight: _isNew ? 700 : 400,
                          display: "flex", alignItems: "center", gap: 3,
                          flex: 1, minWidth: 0, overflow: "hidden",
                          cursor: onChangeZones ? "pointer" : "default",
                        }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card}</span>
                          {_isNew && <span style={{ fontSize: 8, flexShrink: 0 }}>★</span>}
                        </span>
                        {stackCount > 1 && (() => {
                          const expKey = `${zoneKey}:${i}`;
                          const isExpanded = !!expandedMap[expKey];
                          return (
                            <span onClick={e => { e.stopPropagation(); toggleExpanded(zoneKey, i); }} style={{
                              background: isExpanded ? color + "44" : color + "22",
                              borderLeft: `1px solid ${color}55`,
                              padding: "5px 8px", fontSize: 10, color,
                              display: "flex", alignItems: "center", gap: 2,
                              cursor: "pointer", flexShrink: 0,
                            }}>{isExpanded ? "▲" : "▼"}<span style={{ fontSize: 9 }}>{stackCount - 1}</span></span>
                          );
                        })()}
                      </div>
                      {(() => {
                        const expKey = `${zoneKey}:${i}`;
                        const isExpanded = !!expandedMap[expKey];
                        return isExpanded && stack.slice(1).map((c, ci) => {
                          const subIdx = ci + 1;
                          const isSubMoving = moveTarget?.card === c && moveTarget?.fromKey === zoneKey && moveTarget?.itemIdx === i && moveTarget?.subIdx === subIdx;
                          return (
                            <span key={ci} onClick={e => {
                              e.stopPropagation();
                              if (!onChangeZones || !setMoveTarget) return;
                              if (!moveTarget?.card) {
                                setMoveTarget({ mode: "move", fromKey: zoneKey, card: c, itemIdx: i, subIdx });
                              } else if (isSubMoving) {
                                setMoveTarget({ mode: "move", fromKey: null, card: null });
                              } else {
                                setStackModal({ card: moveTarget.card, fromKey: moveTarget.fromKey, fromItemIdx: moveTarget.itemIdx, fromSubIdx: moveTarget.subIdx, targetCard: c, targetKey: zoneKey, targetItemIdx: i });
                              }
                            }} style={{
                              background: isSubMoving ? `${color}33` : `${color}0e`,
                              border: `1px solid ${isSubMoving ? color : color + "33"}`,
                              borderTop: "none",
                              borderRadius: ci === stackCount - 2 ? "0 0 6px 6px" : 0,
                              padding: "3px 8px 3px 16px",
                              fontSize: 10, color: isSubMoving ? color : color + "bb",
                              display: "flex", alignItems: "center", gap: 3,
                              cursor: "pointer",
                              boxShadow: isSubMoving ? `0 0 4px ${color}88` : "none",
                            }}>
                              <span style={{ fontSize: 8, opacity: 0.5 }}>└</span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c}</span>
                              <span style={{ fontSize: 8, opacity: 0.4, marginLeft: "auto" }}>進化元{ci + 1}</span>
                              {isSubMoving && <span style={{ fontSize: 9 }}>→</span>}
                            </span>
                          );
                        });
                      })()}
                    </div>
                  );
                })
            }
          </div>
        )}
      </div>
    );
  };

  const secCards = z.security || [];

  // メモリー値
  const mem = state.memory ?? 0;
  const MAX_MEM = 10;

  // リソース差分
  const diff = (key) => {
    const cur = state[key] ?? 0;
    const par = parentState[key] ?? cur;
    return cur - par;
  };

  const phaseKey = PHASES.includes(state?.phase) ? state.phase : "main";
  const phaseName = t["ph_" + phaseKey] || phaseKey;

  return (
    <div style={{
      width: "100%", height: "100%", boxSizing: "border-box",
      display: "flex", flexDirection: "column", gap: 6,
      fontFamily: "monospace",
    }}>

      {/* フェイズ表示 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#4a9eff18", border: "1px solid #4a9eff44",
        borderRadius: 6, padding: "5px 0", flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, color: "#4a9eff", fontWeight: 700, letterSpacing: 2 }}>
          {phaseName}
        </span>
      </div>

      {/* 1行目：メモリーゲージ */}
      <div style={{
        background: "#090f1e", border: "1px solid #1a2535",
        borderRadius: 6, padding: "8px 10px",
        display: "flex", flexDirection: "column", gap: 6, flexShrink: 0,
      }}>
        <div style={{ fontSize: 9, color: "#4a9eff", fontWeight: 700, letterSpacing: 1 }}>MEMORY</div>
        <div style={{ display: "flex", gap: 4, alignItems: "stretch" }}>
          {/* 左側（正・自分側）: 1〜10 を2列5行 */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
            {Array.from({ length: MAX_MEM }, (_, i) => MAX_MEM - i).map(n => {
              const active = mem >= n;
              return (
                <div key={n} onClick={() => onChangeMemory && onChangeMemory(n)} style={{
                  aspectRatio: "1/1", borderRadius: "50%",
                  background: active ? "#4a9eff" : "#0b1320",
                  border: `1px solid ${active ? "#4a9eff" : "#1a2535"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: active ? "#000" : "#2a3a52", fontWeight: 700,
                  cursor: onChangeMemory ? "pointer" : "default",
                  width: "100%",
                }}>{n}</div>
              );
            })}
          </div>
          {/* 中央：0 */}
          <div onClick={() => onChangeMemory && onChangeMemory(0)} style={{
            width: 48, flexShrink: 0, borderRadius: 8,
            background: mem === 0 ? "#94a3b8" : "#0b1320",
            border: `2px solid ${mem === 0 ? "#94a3b8" : "#2a3a52"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: mem === 0 ? "#000" : "#2a3a52", fontWeight: 900,
            cursor: onChangeMemory ? "pointer" : "default",
          }}>0</div>
          {/* 右側（負・相手側）: 1〜10 を2列5行 */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
            {Array.from({ length: MAX_MEM }, (_, i) => i + 1).map(n => {
              const active = mem <= -n;
              return (
                <div key={n} onClick={() => onChangeMemory && onChangeMemory(-n)} style={{
                  aspectRatio: "1/1", borderRadius: "50%",
                  background: active ? "#ef4444" : "#0b1320",
                  border: `1px solid ${active ? "#ef4444" : "#1a2535"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: active ? "#000" : "#2a3a52", fontWeight: 700,
                  cursor: onChangeMemory ? "pointer" : "default",
                  width: "100%",
                }}>{n}</div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2行目：自SEC / 相SEC / 自ドロー */}
      <div style={{
        display: "flex", gap: 6, flexShrink: 0,
      }}>
        {[
          { label: t.my_sec || "自SEC",  key: "mySecurity",  color: "#4a9eff" },
          { label: t.opp_sec || "相SEC", key: "oppSecurity", color: "#ef4444" },
          { label: t.my_hand_label || "自ドロー", key: "myHand", color: "#22c55e" },
        ].map(({ label, key, color }) => {
          const val = state[key] ?? 0;
          const d = diff(key);
          return (
            <div key={key} style={{
              flex: 1, background: "#090f1e", border: `1px solid ${color}44`,
              borderRadius: 6, padding: "5px 8px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            }}>
              <div style={{ fontSize: 9, color, fontWeight: 700 }}>{label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color }}>{val}</span>
                {d !== 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: d > 0 ? "#22c55e" : "#ef4444" }}>
                    {d > 0 ? `+${d}` : d}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 上段：Security（左） + Battle area（中） + Deck/Trash（右） */}
      {(() => {
        const isWin = (state.oppSecurity ?? 0) < 0;
        return (
          <div style={{ display: "flex", gap: 6, flex: 3, position: "relative" }}>
            {isWin && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                pointerEvents: "none",
              }}>
                <span style={{
                  fontSize: 36, fontWeight: 900, color: "#22c55e",
                  textShadow: "0 0 20px #22c55e, 0 0 40px #22c55e88",
                  fontFamily: "monospace", letterSpacing: 4,
                }}>【勝ち】</span>
              </div>
            )}

        {/* Security */}
        <ZoneBox label={`Security (${secCards.length})`} zoneKey="security" color="#ef4444" style={{ width: 80, flexShrink: 0 }} />

        {/* Battle area：中央、大きく */}
        <ZoneBox
          label="Battle area"
          zoneKey="main"
          color="#f59e0b"
          style={{ flex: 1 }}
        />

        {/* Deck / Trash：右側縦並び */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 80, flexShrink: 0 }}>
          <ZoneBox label="Deck" zoneKey="deck" color="#a855f7" style={{ flex: 1 }} />
          <ZoneBox label="Trash" zoneKey="trash" color="#94a3b8" style={{ flex: 1 }} />
        </div>

      </div>
        );
      })()}

      {/* 下段：育成エリア（左） + 手札（右） */}
      <div style={{ display: "flex", gap: 6, flex: 2 }}>

        {/* 育成エリア */}
        <ZoneBox label={t.zone_breeding || "育成エリア"} zoneKey="breeding" color="#4a9eff" style={{ width: 160, flexShrink: 0 }} />

        {/* 手札 */}
        <ZoneBox label={t.zone_hand || "手札"} zoneKey="hand" color="#22c55e" style={{ flex: 1 }} />

      </div>

      {/* メモ */}
      {note !== undefined && (
        <div style={{
          background: "#090f1e", border: "1px solid #243040",
          borderRadius: 6, padding: "6px 10px", flexShrink: 0,
        }}>
          <div style={{ fontSize: 9, color: "#4a9eff", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>📝 MEMO</div>
          {note
            ? <div style={{ fontSize: 12, color: "#7a90a8", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{note}</div>
            : <div style={{ fontSize: 11, color: "#2a3a52", fontStyle: "italic" }}>{t.none_label || "なし"}</div>
          }
        </div>
      )}

    </div>
  );
}

// ============================================================
// BOARD VIEW MODAL
// ============================================================

function BoardViewModal({ boardViewNodeId, setBoardViewNodeId, setBoardView, nodes, selectedNode, t, onUpdateNode, onUndo, onAddChild }) {
  const [childModal, setChildModal] = useState(false);
  const [moveTarget, setMoveTarget] = useState({ mode: "move", fromKey: null, card: null });
  const [stackModal, setStackModal] = useState(null);
  const [expandedItems, setExpandedItems] = useState({}); // `${key}:${itemIdx}` -> bool
  const toggleExpanded = (key, itemIdx) =>
    setExpandedItems(prev => ({ ...prev, [`${key}:${itemIdx}`]: !prev[`${key}:${itemIdx}`] }));
  const [moveStackModal, setMoveStackModal] = useState(null);
  const [arrowMode, setArrowMode] = useState(false);
  const zoneRefs = useRef({});

  const bvNode = boardViewNodeId ? nodes[boardViewNodeId] : selectedNode;
  if (!bvNode) return null;
  const bvParent = bvNode.parentId ? nodes[bvNode.parentId] : null;
  const zones = bvNode.meta.zones || {};

  const updateZones = (newZones) => {
    const next = JSON.parse(JSON.stringify(bvNode));
    next.meta.zones = newZones;
    onUpdateNode && onUpdateNode(next);
  };

  const toggleCardState = (key, card) => {
    const cs = JSON.parse(JSON.stringify(bvNode.meta.cardStates || {}));
    const k = `${key}:${card}`;
    cs[k] = cs[k] === "rest" ? "active" : "rest";
    const next = JSON.parse(JSON.stringify(bvNode));
    next.meta.cardStates = cs;
    onUpdateNode && onUpdateNode(next);
  };

  // 親ノードとの差分からカードの移動を検出（スタック内含む）
  const detectMoves = () => {
    if (!bvParent) return [];
    const moves = [];
    const parentZones = bvParent.meta.zones || {};
    const currentZones = bvNode.meta.zones || {};

    // 親の全カードのゾーンを記録（同名カードは出現順にインデックス付き）
    const parentCardList = {}; // card -> [{key, stackIdx, itemIdx}]
    ZONE_KEYS.forEach(key => {
      (parentZones[key] || []).forEach((item, itemIdx) => {
        const stack = Array.isArray(item) ? item : [item];
        stack.forEach((card, stackIdx) => {
          if (!card) return;
          if (!parentCardList[card]) parentCardList[card] = [];
          parentCardList[card].push({ key, stackIdx, itemIdx });
        });
      });
    });

    // 現在の全カードと比較
    const usedParent = {}; // card -> 使用済みインデックス
    ZONE_KEYS.forEach(key => {
      (currentZones[key] || []).forEach((item, itemIdx) => {
        const stack = Array.isArray(item) ? item : [item];
        stack.forEach((card, stackIdx) => {
          if (!card) return;
          const candidates = parentCardList[card] || [];
          if (!usedParent[card]) usedParent[card] = 0;
          const candidate = candidates[usedParent[card]];
          if (candidate) {
            usedParent[card]++;
            if (candidate.key !== key) {
              moves.push({ card, from: candidate.key, to: key });
            }
          }
          // 親にいなかった新登場カードは無視
        });
      });
    });
    return moves;
  };

  const goParent = () => { if (bvNode.parentId) setBoardViewNodeId(bvNode.parentId); };
  const goChild = () => {
    const ch = bvNode.children || [];
    if (ch.length === 1) setBoardViewNodeId(ch[0]);
    else if (ch.length > 1) setChildModal(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", zIndex: 500, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, background: "#060c18", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ヘッダー */}
        <div style={{ padding: "10px 16px", background: "#0b1320", borderBottom: "1px solid #1a2535", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={() => { setBoardView(false); setBoardViewNodeId(null); }} style={{
            background: "none", border: "1px solid #2a3a52", color: "#7a90a8",
            cursor: "pointer", fontSize: 13, fontFamily: "monospace", fontWeight: 700,
            padding: "5px 10px", borderRadius: 5, flexShrink: 0,
          }}>戻る</button>
          <span style={{ fontSize: 13, color: "#4a9eff", fontWeight: 700, fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            🎴 {getNodeLabel(bvNode.meta.label, t)}
          </span>
          <button onClick={() => setArrowMode(v => !v)} style={{
            background: arrowMode ? "#f59e0b22" : "none",
            border: `1px solid ${arrowMode ? "#f59e0b" : "#2a3a52"}`,
            color: arrowMode ? "#f59e0b" : "#7a90a8",
            cursor: "pointer", fontSize: 13, fontFamily: "monospace", fontWeight: 700,
            padding: "5px 10px", borderRadius: 5, flexShrink: 0,
          }}>→</button>
          <button onClick={() => {
            if (!onAddChild) return;
            const newId = onAddChild(bvNode.id);
            if (newId) setBoardViewNodeId(newId);
          }} style={{
            background: "#22c55e22", border: "1px solid #22c55e66", color: "#22c55e",
            cursor: "pointer", fontSize: 13, fontFamily: "monospace", fontWeight: 700,
            padding: "5px 10px", borderRadius: 5, flexShrink: 0,
          }}>＋</button>
          <button onClick={onUndo} style={{
            background: "none", border: "1px solid #2a3a52", color: "#7a90a8",
            cursor: "pointer", fontSize: 13, fontFamily: "monospace", fontWeight: 700,
            padding: "5px 10px", borderRadius: 5, flexShrink: 0,
          }}>↩</button>
        </div>
        {/* 前後移動 */}
        <div style={{ display: "flex", gap: 6, padding: "8px 16px", background: "#0b1320", borderBottom: "1px solid #1a2535", flexShrink: 0 }}>
          <button onClick={goParent} disabled={!bvNode.parentId} style={{ flex: 1, padding: "8px 0", borderRadius: 6, cursor: bvNode.parentId ? "pointer" : "default", background: bvNode.parentId ? "#4a9eff18" : "#0b1320", border: `1px solid ${bvNode.parentId ? "#4a9eff55" : "#1a2535"}`, color: bvNode.parentId ? "#4a9eff" : "#2a3a52", fontSize: 13, fontFamily: "monospace", fontWeight: 700 }}>← 前</button>
          <button onClick={goChild} disabled={!bvNode.children?.length} style={{ flex: 1, padding: "8px 0", borderRadius: 6, cursor: bvNode.children?.length ? "pointer" : "default", background: bvNode.children?.length ? "#4a9eff18" : "#0b1320", border: `1px solid ${bvNode.children?.length ? "#4a9eff55" : "#1a2535"}`, color: bvNode.children?.length ? "#4a9eff" : "#2a3a52", fontSize: 13, fontFamily: "monospace", fontWeight: 700 }}>次 {bvNode.children?.length > 1 ? `(${bvNode.children.length}択)` : "→"}</button>
        </div>
        {/* 子選択モーダル */}
        {childModal && (
          <div style={{ position: "absolute", inset: 0, background: "#000b", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setChildModal(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a28", border: "1px solid #4a9eff55", borderRadius: 12, padding: "20px 24px", width: 280, fontFamily: "monospace", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 14, color: "#dde4f0", fontWeight: 700 }}>次のノードを選択</div>
              {(bvNode.children || []).map(childId => {
                const child = nodes[childId];
                if (!child) return null;
                return <button key={childId} onClick={() => { setBoardViewNodeId(childId); setChildModal(false); }} style={{ padding: "10px 14px", borderRadius: 6, cursor: "pointer", background: "#4a9eff18", border: "1px solid #4a9eff55", color: "#4a9eff", fontSize: 13, fontFamily: "monospace", fontWeight: 700, textAlign: "left" }}>{getNodeLabel(child.meta.label, t)}</button>;
              })}
              <button onClick={() => setChildModal(false)} style={{ padding: "8px 0", borderRadius: 6, cursor: "pointer", background: "none", border: "1px solid #2a3a52", color: "#7a90a8", fontSize: 12, fontFamily: "monospace" }}>キャンセル</button>
            </div>
          </div>
        )}
        {/* 盤面 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", boxSizing: "border-box", position: "relative" }}>
          <BoardLayout
            zones={bvNode.meta.zones || {}}
            parentZones={bvParent?.meta?.zones}
            t={t}
            state={bvNode.state || {}}
            parentState={bvParent?.state || {}}
            cardStates={bvNode.meta.cardStates || {}}
            onToggleCardState={toggleCardState}
            note={bvNode.meta.note}
            onChangeZones={updateZones}
            moveTarget={moveTarget}
            setMoveTarget={setMoveTarget}
            stackModal={stackModal}
            setStackModal={setStackModal}
            moveStackModal={moveStackModal}
            setMoveStackModal={setMoveStackModal}
            onChangeMemory={(v) => {
              const next = JSON.parse(JSON.stringify(bvNode));
              next.state.memory = v;
              onUpdateNode && onUpdateNode(next);
            }}
            onZoneRef={(key, el) => { zoneRefs.current[key] = el; }}
          />
          {/* stackModal / moveStackModal をBoardView上でも表示 */}
          {moveStackModal && (
            <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 600, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
              onClick={() => { setMoveStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null }); }}>
              <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a28", border: "1px solid #4a9eff55", borderRadius: "12px 12px 0 0", padding: "16px 16px 32px", width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 10, fontFamily: "monospace" }}>
                <div style={{ fontSize: 12, color: "#7a90a8" }}>
                  <span style={{ color: "#4a9eff", fontWeight: 700 }}>「{moveStackModal.card}」</span>（スタック{moveStackModal.stack.length}枚）をどう移動しますか？
                </div>
                <div style={{ fontSize: 10, color: "#4a6080" }}>スタック：{moveStackModal.stack.join(" → ")}</div>
                <button onClick={() => {
                  const { stack, fromKey, fromItemIdx, toKey } = moveStackModal;
                  const z = JSON.parse(JSON.stringify(zones));
                  const fromArr = [...(z[fromKey] || [])]; fromArr.splice(fromItemIdx, 1); z[fromKey] = fromArr;
                  const tArr = Array.isArray(z[toKey]) ? [...z[toKey]] : []; tArr.push(stack.length === 1 ? stack[0] : stack); z[toKey] = tArr;
                  updateZones(z); setMoveStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null });
                }} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#f59e0b18", border: "1px solid #f59e0b66", color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>
                  スタックごと移動（{moveStackModal.stack.join("→")}）
                </button>
                <button onClick={() => {
                  const { card, stack, fromKey, fromItemIdx, toKey } = moveStackModal;
                  const z = JSON.parse(JSON.stringify(zones));
                  const st = [...stack]; st.shift(); z[fromKey][fromItemIdx] = st.length === 1 ? st[0] : st;
                  const tArr = Array.isArray(z[toKey]) ? [...z[toKey]] : []; tArr.push(card); z[toKey] = tArr;
                  updateZones(z); setMoveStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null });
                }} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#4a9eff18", border: "1px solid #4a9eff66", color: "#4a9eff", fontSize: 13, fontWeight: 700 }}>
                  「{moveStackModal.card}」（一番上）だけ移動
                </button>
                <button onClick={() => { setMoveStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null }); }} style={{ padding: "8px 0", borderRadius: 6, cursor: "pointer", background: "none", border: "1px solid #2a3a52", color: "#4a6080", fontSize: 12 }}>キャンセル</button>
              </div>
            </div>
          )}
          {stackModal && (() => {
            const { card, fromKey, fromItemIdx, fromSubIdx, targetCard, targetKey, targetItemIdx } = stackModal;
            const isSelf = fromKey === targetKey && fromItemIdx === targetItemIdx;
            const srcItem = zones[fromKey]?.[fromItemIdx];
            const srcStack = Array.isArray(srcItem) ? srcItem : [srcItem];

            const doMove = (type) => {
              const z = JSON.parse(JSON.stringify(zones));
              let drawIncrement = 0;
              if (isSelf) {
                const st = Array.isArray(z[fromKey][fromItemIdx]) ? [...z[fromKey][fromItemIdx]] : [z[fromKey][fromItemIdx]];
                if (type === "top_out") { const p = st.shift(); z[fromKey][fromItemIdx] = st.length === 1 ? st[0] : st; z[fromKey] = [...z[fromKey], p]; }
                else if (type === "rotate") { const p = st.shift(); st.push(p); z[fromKey][fromItemIdx] = st.length === 1 ? st[0] : st; }
              } else {
                const removeSrc = () => {
                  if (fromSubIdx !== undefined) {
                    const fs = Array.isArray(z[fromKey][fromItemIdx]) ? [...z[fromKey][fromItemIdx]] : [z[fromKey][fromItemIdx]];
                    fs.splice(fromSubIdx, 1); z[fromKey][fromItemIdx] = fs.length === 1 ? fs[0] : fs;
                  } else {
                    const fa = [...(z[fromKey] || [])];
                    const adj = (fromKey === targetKey && fromItemIdx < targetItemIdx) ? targetItemIdx - 1 : targetItemIdx;
                    fa.splice(fromItemIdx, 1); z[fromKey] = fa;
                    return adj;
                  }
                  return targetItemIdx;
                };
                const adjIdx = removeSrc();
                const tArr = z[targetKey] || [];
                const tItem = tArr[adjIdx];
                const tStack = Array.isArray(tItem) ? tItem : [tItem];
                if (type === "on_top") {
                  tArr[adjIdx] = [card, ...tStack];
                  if (fromKey === "hand" && targetKey === "main") drawIncrement = 1;
                }
                else if (type === "on_bottom") tArr[adjIdx] = [...tStack, card];
                else if (type === "stack_on_bottom") {
                  tArr[adjIdx] = [...tStack, ...srcStack];
                }
                else if (type === "zone_stack") { const ta = Array.isArray(z[targetKey]) ? [...z[targetKey]] : []; ta.push(srcStack.length === 1 ? srcStack[0] : srcStack); z[targetKey] = ta; updateZones(z); setStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null }); return; }
                else if (type === "zone_top") { const ta = Array.isArray(z[targetKey]) ? [...z[targetKey]] : []; ta.push(card); z[targetKey] = ta; updateZones(z); setStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null }); return; }
                z[targetKey] = tArr;
              }
              // zonesと必要ならstate.myHandも同時更新
              const next = JSON.parse(JSON.stringify(bvNode));
              next.meta.zones = z;
              if (drawIncrement) next.state.myHand = (next.state.myHand ?? 0) + drawIncrement;
              onUpdateNode && onUpdateNode(next);
              setStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null });
            };

            const hasStack = fromSubIdx === undefined && srcStack.length > 1;
            const targetZoneLabel = t[ZONE_LABEL_KEYS[targetKey]] || targetKey;

            return (
              <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 600, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
                onClick={() => { setStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null }); }}>
                <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a28", border: "1px solid #4a9eff55", borderRadius: "12px 12px 0 0", padding: "16px 16px 32px", width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 10, fontFamily: "monospace" }}>
                  <div style={{ fontSize: 12, color: "#7a90a8" }}>
                    {isSelf
                      ? <><span style={{ color: "#4a9eff", fontWeight: 700 }}>「{card}」</span> のスタックを操作：</>
                      : <><span style={{ color: "#4a9eff", fontWeight: 700 }}>「{card}」</span> を <span style={{ color: "#f59e0b", fontWeight: 700 }}>「{targetCard}」</span> に対して：</>
                    }
                  </div>
                  {isSelf ? (<>
                    <div style={{ fontSize: 10, color: "#4a6080" }}>スタック：{srcStack.join(" → ")}</div>
                    <button onClick={() => { doMove("top_out"); }} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#4a9eff18", border: "1px solid #4a9eff66", color: "#4a9eff", fontSize: 13, fontWeight: 700 }}>「{srcStack[0]}」を同エリアに単体で出す</button>
                    {srcStack.length > 1 && <button onClick={() => { doMove("rotate"); }} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#a855f718", border: "1px solid #a855f766", color: "#a855f7", fontSize: 13, fontWeight: 700 }}>「{srcStack[0]}」を一番下（「{srcStack[srcStack.length-1]}」の下）へ</button>}
                  </>) : (<>
                    <button onClick={() => doMove("on_top")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#4a9eff18", border: "1px solid #4a9eff66", color: "#4a9eff", fontSize: 13, fontWeight: 700 }}>「{targetCard}」の上に重ねる（進化）</button>
                    <button onClick={() => doMove("on_bottom")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#a855f718", border: "1px solid #a855f766", color: "#a855f7", fontSize: 13, fontWeight: 700 }}>「{targetCard}」の下に入る（進化元）</button>
                    {hasStack && <button onClick={() => doMove("stack_on_bottom")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#ec489918", border: "1px solid #ec489966", color: "#ec4899", fontSize: 13, fontWeight: 700 }}>スタックごと「{targetCard}」の下に入る（{srcStack.join("→")}）</button>}
                    {hasStack && <button onClick={() => doMove("zone_stack")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#f59e0b18", border: "1px solid #f59e0b66", color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>スタックごと{targetZoneLabel}に出す（{srcStack.join("→")}）</button>}
                    <button onClick={() => doMove("zone_top")} style={{ padding: "12px 0", borderRadius: 6, cursor: "pointer", background: "#22c55e18", border: "1px solid #22c55e66", color: "#22c55e", fontSize: 13, fontWeight: 700 }}>「{card}」だけ{targetZoneLabel}に出す（重ねない）</button>
                  </>)}
                  <button onClick={() => { setStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null }); }} style={{ padding: "8px 0", borderRadius: 6, cursor: "pointer", background: "none", border: "1px solid #2a3a52", color: "#4a6080", fontSize: 12 }}>キャンセル</button>
                </div>
              </div>
            );
          })()}
          {/* 矢印オーバーレイ */}
          {arrowMode && (() => {
            const moves = detectMoves();
            if (moves.length === 0) return null;
            const ZONE_COLORS_MAP = { hand: "#22c55e", breeding: "#4a9eff", main: "#f59e0b", trash: "#94a3b8", deck: "#a855f7", security: "#ef4444" };
            return (
              <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 550 }}>
                <svg style={{ width: "100%", height: "100%" }}>
                  <defs>
                    {moves.map((_, i) => (
                      <marker key={i} id={`arrow-${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b" />
                      </marker>
                    ))}
                  </defs>
                  {moves.map((m, i) => {
                    const fromEl = zoneRefs.current[m.from];
                    const toEl = zoneRefs.current[m.to];
                    if (!fromEl || !toEl) return null;
                    const fr = fromEl.getBoundingClientRect();
                    const tr = toEl.getBoundingClientRect();
                    const x1 = fr.left + fr.width / 2;
                    const y1 = fr.top + fr.height / 2;
                    const x2 = tr.left + tr.width / 2;
                    const y2 = tr.top + tr.height / 2;
                    const color = ZONE_COLORS_MAP[m.from] || "#f59e0b";
                    return (
                      <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke={color} strokeWidth="2.5" strokeOpacity="0.85"
                          strokeDasharray="6 3" markerEnd={`url(#arrow-${i})`} />
                        <text x={(x1+x2)/2} y={(y1+y2)/2 - 6}
                          textAnchor="middle" fontSize="11" fill={color}
                          style={{ fontFamily: "monospace", fontWeight: 700 }}>{m.card}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}



// ============================================================
// DETAIL PANEL
// ============================================================
function NodeDetailPanel({ node, parentNode, onUpdate, onClose, onDelete, onAddChild, onPropagateUp, isMobile, t, blockActions, settings, onUpdateSettings, nodes = {}, onSelectNode, boardView, setBoardView, boardViewNodeId, setBoardViewNodeId, onUndo }) {
  const [panelTab, setPanelTab] = React.useState('board');
  const [moveTarget, setMoveTarget] = React.useState({ mode: "move", fromKey: null, card: null });
  const [deleteMode, setDeleteMode] = React.useState(false);
  const [selectedCards, setSelectedCards] = React.useState([]);
  const [childSelectModal, setChildSelectModal] = React.useState(false);
  const [boardViewChildModal, setBoardViewChildModal] = React.useState(false);
  const [restMode, setRestMode] = React.useState(false);

  // 盤面ビューで表示するノード（boardViewNodeIdがnullなら現在のnode）
  const boardViewNode = boardViewNodeId ? nodes[boardViewNodeId] : node;
  const boardViewParent = boardViewNode?.parentId ? nodes[boardViewNode.parentId] : null;

  const openBoardView = () => {
    setBoardViewNodeId(node.id);
    setBoardView(true);
  };
  const boardViewGoParent = () => {
    if (!boardViewNode?.parentId) return;
    setBoardViewNodeId(boardViewNode.parentId);
  };
  const boardViewGoChild = () => {
    const children = boardViewNode?.children || [];
    if (children.length === 0) return;
    if (children.length === 1) {
      setBoardViewNodeId(children[0]);
    } else {
      setBoardViewChildModal(true);
    }
  };
  const guard = (fn) => () => {
    if (typeof blockActions === 'function' ? blockActions() : blockActions) return;
    fn();
  };
  if (!node) {
    if (isMobile) return null;
    return (
      <div style={{
        width: 260, flexShrink: 0, background: "#080e1a",
        borderLeft: "1px solid #1a2535",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#2a3a52", fontSize: 12, fontFamily: "monospace",
      }}>
        ノードを選択
      </div>
    );
  }

  const tag = NODE_TAGS[node.meta.tag] || NODE_TAGS.normal;

  const update = (path, value) => {
    const keys = path.split(".");
    const next = JSON.parse(JSON.stringify(node));
    let cur = next;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
    onUpdate(next);
  };

  const panelStyle = isMobile ? {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    width: "100%",
    boxSizing: "border-box",
    background: "#080e1a",
    borderTop: `2px solid ${tag.color}`,
    zIndex: 200, display: "flex", flexDirection: "column",
    overflowX: "hidden",
  } : {
    width: 260, flexShrink: 0, background: "#080e1a",
    borderLeft: "1px solid #1a2535",
    display: "flex", flexDirection: "column",
  };

  // 前後ノード移動
  const goParent = () => {
    if (!node.parentId || !onSelectNode) return;
    onSelectNode(node.parentId);
  };
  const goChild = () => {
    if (!onSelectNode) return;
    const children = node.children || [];
    if (children.length === 0) return;
    if (children.length === 1) {
      onSelectNode(children[0]);
    } else {
      setChildSelectModal(true);
    }
  };

  return (
    <div style={panelStyle}>

      {/* 子ノード選択モーダル */}
      {childSelectModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#000b", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setChildSelectModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1a28", border: "1px solid #4a9eff55",
            borderRadius: 12, padding: "20px 24px", width: 300,
            fontFamily: "monospace", display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontSize: 14, color: "#dde4f0", fontWeight: 700 }}>次のノードを選択</div>
            {(node.children || []).map(childId => {
              const child = nodes[childId];
              if (!child) return null;
              return (
                <button key={childId} onClick={() => { onSelectNode(childId); setChildSelectModal(false); }} style={{
                  padding: "10px 14px", borderRadius: 6, cursor: "pointer",
                  background: "#4a9eff18", border: "1px solid #4a9eff55", color: "#4a9eff",
                  fontSize: 13, fontFamily: "monospace", fontWeight: 700, textAlign: "left",
                }}>{getNodeLabel(child.meta.label, t)}</button>
              );
            })}
            <button onClick={() => setChildSelectModal(false)} style={{
              padding: "8px 0", borderRadius: 6, cursor: "pointer",
              background: "none", border: "1px solid #2a3a52", color: "#7a90a8",
              fontSize: 12, fontFamily: "monospace",
            }}>キャンセル</button>
          </div>
        </div>
      )}
      <div style={{
        borderBottom: "1px solid #1a2535",
        background: "#0b1320", flexShrink: 0,
      }}>
        {/* 1行目：戻る / ノードの削除 / +追加 / × */}
        <div style={{
          padding: "8px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6,
        }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {/* 戻るボタン（モバイルのみ） */}
            {isMobile && (
              <button onClick={onClose} style={{
                background: "none", border: "1px solid #2a3a52", color: "#7a90a8",
                padding: "5px 10px", borderRadius: 5, cursor: "pointer",
                fontSize: 13, fontFamily: "monospace", fontWeight: 700,
              }}>戻る</button>
            )}
            {node.parentId && (
              <button onClick={guard(() => onDelete(node.id))} style={{
                background: "#ef444418", border: "1px solid #ef444466", color: "#ef4444",
                padding: "6px 10px", borderRadius: 4, cursor: "pointer",
                fontSize: 11, fontFamily: "monospace", fontWeight: 700,
                whiteSpace: "nowrap",
              }}>🗑 ノードの削除</button>
            )}
            <button onClick={() => { setBoardViewNodeId(node.id); setBoardView(true); }} style={{
              background: "#f59e0b18", border: "1px solid #f59e0b66", color: "#f59e0b",
              padding: "6px 10px", borderRadius: 4, cursor: "pointer",
              fontSize: 11, fontFamily: "monospace", fontWeight: 700,
              whiteSpace: "nowrap",
            }}>🎴 盤面ビュー</button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={guard(() => onAddChild(node.id))} style={{
              background: "#22c55e18", border: "1px solid #22c55e66", color: "#22c55e",
              padding: "6px 10px", borderRadius: 4, cursor: "pointer",
              fontSize: 11, fontFamily: "monospace", fontWeight: 700,
              whiteSpace: "nowrap",
            }}>+ 追加</button>
            <button onClick={onUndo} style={{
              background: "none", border: "1px solid #2a3a52", color: "#7a90a8",
              padding: "8px 12px", borderRadius: 6, cursor: "pointer",
              fontSize: 18, fontFamily: "monospace", fontWeight: 700,
            }}>↩</button>
            {!isMobile && (
              <button onClick={onClose} style={{
                background: "none", border: "none", color: "#7a90a8",
                cursor: "pointer", fontSize: 24, lineHeight: 1,
                width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            )}
          </div>
        </div>

        {/* 2行目：ノード名入力 */}
        <div style={{ padding: "0 14px 4px" }}>
          <input
            value={getNodeLabel(node.meta.label, t)}
            onChange={e => update("meta.label", e.target.value)}
            placeholder={t.node_placeholder || "ノード名"}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "none", border: "none", borderBottom: `1px solid ${tag.color}66`,
              color: tag.color, fontSize: 16, fontWeight: 700, fontFamily: "monospace",
              outline: "none", padding: "2px 4px", textAlign: "center",
            }}
          />
        </div>

        {/* 3行目：候補ボタン（常に高さ固定） */}
        <div style={{ padding: "4px 14px 6px", height: 34, boxSizing: "content-box", flexShrink: 0 }}>
          {parentNode && (() => {
            const generated = generateLabel(node, parentNode);
            return generated ? (
              <button onClick={guard(() => update("meta.label", generated))} style={{
                width: "100%", height: "100%", borderRadius: 5, cursor: "pointer",
                background: "#f59e0b18", border: "1px solid #f59e0b44", color: "#f59e0b",
                fontSize: 11, fontFamily: "monospace", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <span>✨</span><span>{generated}</span>
              </button>
            ) : null;
          })()}
        </div>
      </div>

      {/* 前後ノード移動バー（モバイルのみ） */}
      {isMobile && (
        <div style={{
          display: "flex", gap: 6, padding: "6px 14px",
          background: "#0b1320", borderBottom: "1px solid #1a2535", flexShrink: 0,
        }}>
          <button onClick={goParent} disabled={!node.parentId} style={{
            flex: 1, padding: "8px 0", borderRadius: 6, cursor: node.parentId ? "pointer" : "default",
            background: node.parentId ? "#4a9eff18" : "#0b1320",
            border: `1px solid ${node.parentId ? "#4a9eff55" : "#1a2535"}`,
            color: node.parentId ? "#4a9eff" : "#2a3a52",
            fontSize: 13, fontFamily: "monospace", fontWeight: 700,
          }}>← 前</button>
          <button onClick={goChild} disabled={!node.children?.length} style={{
            flex: 1, padding: "8px 0", borderRadius: 6, cursor: node.children?.length ? "pointer" : "default",
            background: node.children?.length ? "#4a9eff18" : "#0b1320",
            border: `1px solid ${node.children?.length ? "#4a9eff55" : "#1a2535"}`,
            color: node.children?.length ? "#4a9eff" : "#2a3a52",
            fontSize: 13, fontFamily: "monospace", fontWeight: 700,
          }}>次 {node.children?.length > 1 ? `(${node.children.length}択)` : "→"}</button>
        </div>
      )}

      <div style={{ display: "flex", borderBottom: "1px solid #1a2535", flexShrink: 0 }}>
        {[
          { key: "board",    label: t.zone_info    || "盤面" },
          { key: "resource", label: t.resource_label || "リソース" },
          { key: "node",     label: "フェイズ・メモ" },
        ].map(tb => (
          <button key={tb.key} onClick={() => setPanelTab(tb.key)} style={{
            flex: 1, padding: "10px 0", background: "none", border: "none",
            borderBottom: panelTab === tb.key ? "2px solid #4a9eff" : "2px solid transparent",
            color: panelTab === tb.key ? "#4a9eff" : "#4a5568",
            fontSize: 11, fontFamily: "monospace", fontWeight: 700, cursor: "pointer",
          }}>{tb.label}</button>
        ))}
      </div>

      {panelTab === 'board' && (
        <div style={{
          padding: "6px 14px 0", flexShrink: 0,
          background: "#080e1a",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
        }}>
          <span style={{ fontSize: 10, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, fontFamily: "monospace" }}>{t.zone_info || "盤面情報"}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {deleteMode && (
              <button onClick={() => {
                if (selectedCards.length === 0) return;
                const newZones = JSON.parse(JSON.stringify(node.meta.zones || {}));
                // subIdxありとなしを分けて処理、大きい順に削除
                const withSub = selectedCards.filter(s => s.subIdx !== undefined)
                  .sort((a, b) => b.subIdx - a.subIdx);
                const withoutSub = selectedCards.filter(s => s.subIdx === undefined)
                  .sort((a, b) => b.itemIdx - a.itemIdx);
                withSub.forEach(({ key, itemIdx, subIdx }) => {
                  const stack = Array.isArray(newZones[key][itemIdx]) ? [...newZones[key][itemIdx]] : [newZones[key][itemIdx]];
                  stack.splice(subIdx, 1);
                  newZones[key][itemIdx] = stack.length === 1 ? stack[0] : stack;
                });
                withoutSub.forEach(({ key, itemIdx }) => {
                  newZones[key].splice(itemIdx, 1);
                });
                update("meta.zones", newZones);
                setSelectedCards([]);
              }} style={{
                background: selectedCards.length > 0 ? "#ef444422" : "#1a2535",
                border: `1px solid ${selectedCards.length > 0 ? "#ef4444" : "#2a3a52"}`,
                color: selectedCards.length > 0 ? "#ef4444" : "#4a5568",
                borderRadius: 5, padding: "5px 12px", cursor: "pointer",
                fontSize: 11, fontFamily: "monospace", fontWeight: 700,
              }}>
                🗑 {selectedCards.length > 0 ? `${selectedCards.length}枚削除` : "未選択"}
              </button>
            )}
            <button onClick={openBoardView} style={{
              background: "none",
              border: "1px solid #2a3a52",
              color: "#4a6080",
              borderRadius: 5, padding: "5px 10px", cursor: "pointer",
              fontSize: 11, fontFamily: "monospace", fontWeight: 700,
              whiteSpace: "nowrap",
            }}>🎴 盤面</button>
            <button onClick={() => {
              setRestMode(r => !r);
              setDeleteMode(false);
              setSelectedCards([]);
              setMoveTarget({ mode: "move", fromKey: null, card: null });
            }} style={{
              background: restMode ? "#f59e0b22" : "none",
              border: `1px solid ${restMode ? "#f59e0b" : "#2a3a52"}`,
              color: restMode ? "#f59e0b" : "#4a6080",
              borderRadius: 5, padding: "5px 10px", cursor: "pointer",
              fontSize: 11, fontFamily: "monospace", fontWeight: 700,
              letterSpacing: 2,
            }}>{restMode ? "✕ ▲▶︎" : "▲ ▶︎"}</button>
            <button onClick={() => {
              setDeleteMode(d => !d);
              setRestMode(false);
              setSelectedCards([]);
              setMoveTarget({ mode: "move", fromKey: null, card: null });
            }} style={{
              background: deleteMode ? "#ef444422" : "none",
              border: `1px solid ${deleteMode ? "#ef4444" : "#2a3a52"}`,
              color: deleteMode ? "#ef4444" : "#4a6080",
              borderRadius: 5, padding: "5px 12px", cursor: "pointer",
              fontSize: 11, fontFamily: "monospace", fontWeight: 700,
            }}>{deleteMode ? "✕選択削除" : "🗑 選択削除"}</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 14, fontFamily: "monospace", touchAction: "pan-y", boxSizing: "border-box", width: "100%" }}>

        {panelTab === 'board' && <>

        <ZoneEditor
            zones={node.meta.zones || {}}
            onChange={z => update("meta.zones", z)}
            hiddenZones={node.meta.hiddenZones || []}
            onToggleHidden={key => {
              const current = node.meta.hiddenZones || [];
              const isHidden = current.includes(key);
              const next = isHidden
                ? current.filter(k => k !== key)
                : [...current, key];
              update("meta.hiddenZones", next);
              if (isHidden) {
                const visKeys = settings?.visibleZoneKeys ?? ZONE_KEYS;
                if (!visKeys.includes(key)) {
                  updateSettings({ visibleZoneKeys: [...visKeys, key] });
                }
              }
            }}
            parentZones={parentNode?.meta?.zones}
            onPropagateUp={(key) => onPropagateUp && onPropagateUp(key, node.meta.zones?.[key] || [])}
            t={t}
            settings={{ ...settings, _onUpdateSettings: onUpdateSettings }}
            moveTarget={moveTarget}
            setMoveTarget={setMoveTarget}
            deleteMode={deleteMode}
            selectedCards={selectedCards}
            setSelectedCards={setSelectedCards}
            restMode={restMode}
            cardStates={node.meta.cardStates || {}}
            onToggleCardState={(key, card) => {
              const cs = JSON.parse(JSON.stringify(node.meta.cardStates || {}));
              const k = `${key}:${card}`;
              cs[k] = cs[k] === "rest" ? "active" : "rest";
              update("meta.cardStates", cs);
            }}
            onInheritParent={parentNode ? guard(() => {
              const parentZones = parentNode.meta?.zones;
              if (!parentZones) return;
              const next = JSON.parse(JSON.stringify(node));
              next.meta.zones = JSON.parse(JSON.stringify(parentZones));
              onUpdate(next);
            }) : undefined}
          />

        </>
        }

        {panelTab === 'resource' && <>

        <Sec title={t.resource_label}>
          <Lbl>{t.memory_label}</Lbl>
          <MemoryGauge value={node.state.memory} onChange={v => update("state.memory", v)} t={t} />
          <div style={{ marginTop: 10 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { label: t.my_sec,                                     path: "state.mySecurity", min: 0 },
              { label: t.opp_sec,                                    path: "state.oppSecurity", min: -1 },
              { label: t.my_hand_label || t.draw_label || "自ドロー", path: "state.myHand",    min: 0 },
              { label: t.opp_hand_label || "相ドロー",                path: "state.oppHand",   min: 0 },
              { label: t.my_deck_label  || "自山",                    path: "state.myDeck",    min: 0 },
              { label: t.opp_deck_label || "相山",                    path: "state.oppDeck",   min: 0 },
              { label: t.my_trash_label  || "自捨札",                 path: "state.myTrash",   min: 0 },
              { label: t.opp_trash_label || "相捨札",                 path: "state.oppTrash",  min: 0 },
            ].map(f => {
              const val = Number(node.state[f.path.split(".")[1]] ?? 0);
              return (
                <div key={f.path}>
                  <Lbl>{f.label}</Lbl>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <button onClick={() => update(f.path, Math.max(f.min, val - 1))} style={{
                      width: 22, height: 30, background: "#0b1320", border: "1px solid #1a2535",
                      borderRadius: 4, color: "#7a90a8", cursor: "pointer", fontSize: 13,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>◀</button>
                    <div style={{
                      flex: 1, textAlign: "center", background: "#0b1320",
                      border: "1px solid #1a2535", borderRadius: 4, padding: "5px 0",
                      color: "#dde4f0", fontSize: 16, fontFamily: "monospace", fontWeight: 700,
                    }}>{val}</div>
                    <button onClick={() => update(f.path, val + 1)} style={{
                      width: 22, height: 30, background: "#0b1320", border: "1px solid #1a2535",
                      borderRadius: 4, color: "#7a90a8", cursor: "pointer", fontSize: 13,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>▶</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button onClick={() => {
              const s = settings || {};
              const next = JSON.parse(JSON.stringify(node));
              next.state.mySecurity  = s.defaultMySecurity  ?? 5;
              next.state.oppSecurity = s.defaultOppSecurity ?? 5;
              next.state.myHand      = s.defaultMyHand      ?? 0;
              next.state.oppHand     = s.defaultOppHand     ?? 0;
              next.state.myDeck      = s.defaultMyDeck      ?? 40;
              next.state.oppDeck     = s.defaultOppDeck     ?? 40;
              next.state.myTrash     = s.defaultMyTrash     ?? 0;
              next.state.oppTrash    = s.defaultOppTrash    ?? 0;
              next.state.memory      = s.defaultMemory      ?? 1;
              onUpdate(next);
            }} style={{
              flex: 1, padding: "6px 0", borderRadius: 5, cursor: "pointer",
              background: "#0b1320", border: "1px solid #2a3a52", color: "#7a90a8",
              fontSize: 11, fontFamily: "monospace", fontWeight: 600,
            }}>{"↩ Default"}</button>
            {parentNode && (
              <button onClick={() => {
                const next = JSON.parse(JSON.stringify(node));
                const p = parentNode.state;
                next.state.mySecurity  = p.mySecurity  ?? node.state.mySecurity;
                next.state.oppSecurity = p.oppSecurity ?? node.state.oppSecurity;
                next.state.myHand      = p.myHand      ?? node.state.myHand;
                next.state.myDeck      = p.myDeck      ?? node.state.myDeck;
                next.state.oppDeck     = p.oppDeck     ?? node.state.oppDeck;
                next.state.myTrash     = p.myTrash     ?? node.state.myTrash;
                next.state.memory      = p.memory      ?? node.state.memory;
                onUpdate(next);
              }} style={{
                flex: 1, padding: "6px 0", borderRadius: 5, cursor: "pointer",
                background: "#4a9eff12", border: "1px solid #4a9eff44", color: "#4a9eff",
                fontSize: 10, fontFamily: "monospace",
              }}>{"↑ Inherit Parent"}</button>
            )}
          </div>
        </Sec>

        </>
        }

        {panelTab === 'node' && <>

        <Sec title={t.phase_label || "フェイズ"}>
          <select
            value={PHASES.includes(node.state?.phase) ? node.state.phase : "main"}
            onChange={e => update("state.phase", e.target.value)}
            style={{
              width: "100%", background: "#0b1320", border: "1px solid #4a9eff44",
              borderRadius: 6, padding: "10px 12px", color: "#4a9eff",
              fontSize: 14, fontFamily: "monospace", fontWeight: 700,
              outline: "none", boxSizing: "border-box", cursor: "pointer",
              appearance: "auto",
            }}
          >
            {PHASES.map(ph => (
              <option key={ph} value={ph}>{getPhaseLabel(t, ph)}</option>
            ))}
          </select>
        </Sec>

        <Sec title={t.memo_label}>
          <div style={{ position: "relative" }}>
            <textarea value={node.meta.note} onChange={e => update("meta.note", e.target.value)}
              placeholder={t.memo_placeholder} rows={4}
              style={{
                width: "100%", background: "#0b1320", border: "1px solid #1a2535",
                borderRadius: 5, padding: "7px 9px", color: "#8a9ab8",
                fontSize: 16, fontFamily: "monospace", resize: "vertical",
                outline: "none", lineHeight: 1.6, boxSizing: "border-box",
              }} />
            {node.meta.note && (
              <button onClick={() => update("meta.note", "")} style={{
                position: "absolute", top: 6, right: 6,
                background: "#ef444422", border: "1px solid #ef444466", color: "#ef4444",
                borderRadius: 4, padding: "2px 8px", cursor: "pointer",
                fontSize: 11, fontFamily: "monospace",
              }}>✕</button>
            )}
          </div>

        </Sec>

        <Sec title={t.node_color || "ノードカラー"}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {NODE_COLORS.map(c => (
              <button key={String(c.value)} onClick={() => update("meta.color", c.value)} style={{
                width: 28, height: 28, borderRadius: 6, cursor: "pointer",
                background: c.value ? `linear-gradient(135deg, ${c.value}, ${c.bg})` : "#0b1320",
                border: node.meta.color === c.value
                  ? `2px solid ${c.border || "#4a9eff"}`
                  : c.value === null && node.meta.color === null
                    ? `2px solid #4a9eff`
                    : `1px solid ${c.border ? c.border + "66" : "#2a3a52"}`,
                boxShadow: node.meta.color === c.value || (c.value === null && node.meta.color === null) ? `0 0 6px ${c.border || "#4a9eff"}88` : "none",
              }}>
                {c.value === null && <span style={{ fontSize: 10, color: "#4a5568" }}>—</span>}
              </button>
            ))}
          </div>
        </Sec>

        {node.parentId && (
          <button onClick={guard(() => onDelete(node.id))} style={{
            width: "100%", padding: "10px 0", borderRadius: 6, cursor: "pointer",
            background: "#ef444412", border: "1px solid #ef444455", color: "#ef4444",
            fontSize: 13, fontFamily: "monospace", fontWeight: 700,
            letterSpacing: 1,
          }}>🗑 このノードを削除</button>
        )}
        </>
        }

      </div>
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase", marginBottom: 7, borderBottom: "1px solid #1e2d40", paddingBottom: 3, fontWeight: 700 }}>
        {title}
      </div>
      {children}
    </div>
  );
}
function Lbl({ children, style }) {
  return <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3, fontWeight: 600, ...style }}>{children}</div>;
}
function Inp(props) {
  return <input {...props} style={{
    width: "100%", background: "#0b1320", border: "1px solid #1a2535",
    borderRadius: 5, padding: "3px 7px", color: "#dde4f0",
    fontSize: 16, fontFamily: "monospace", outline: "none",
    boxSizing: "border-box", ...props.style,
  }} />;
}
function Sel({ children, ...props }) {
  return <select {...props} style={{
    width: "100%", background: "#0b1320", border: "1px solid #1a2535",
    borderRadius: 5, padding: "3px 7px", color: "#dde4f0",
    fontSize: 16, fontFamily: "monospace", outline: "none",
    boxSizing: "border-box",
  }}>{children}</select>;
}

// ============================================================
// MAIN APP
// ============================================================
export default function DigiTree() {
  const [tree, setTree] = useState(INITIAL_TREE);
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    const content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      const m = document.createElement('meta');
      m.name = 'viewport';
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  const [dbLoaded, setDbLoaded] = useState(false);
  const [globalShowZones, setGlobalShowZones] = useState(null);
  const [saveModal, setSaveModal] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [overwriteConfirm, setOverwriteConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loadConfirm, setLoadConfirm] = useState(null);
  const [newTreeConfirm, setNewTreeConfirm] = useState(false);
  const [insertMode, setInsertMode] = useState(null);
  const [saveListOpen, setSaveListOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('display');

  const DEFAULT_SETTINGS = {
    defaultNodeColor: null,
    defaultMemory: 1,
    defaultMySecurity: 5,
    defaultOppSecurity: 5,
    defaultMyHand: 0,
    showZonesGlobal: true,
    visibleZoneKeys: ["hand","breeding","main","trash","deck","security"],
    visibleResourceKeys: ["mySecurity","oppSecurity","myHand"],
    resourceSize: "normal",
    defaultMyDeck: 40,
    defaultOppDeck: 40,
    defaultMyTrash: 0,
    defaultOppTrash: 0,
    zoneTagWrap: "wrap",
    visibleInputKeys: ["hand","breeding","main","trash","deck","security"],
  };
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => {
    idbGet('digitree_settings').then(s => {
      if (s) setSettings(prev => ({ ...prev, ...s }));
    }).catch(() => {});
  }, []);

  const updateSettings = (patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      idbSet('digitree_settings', next).catch(() => {});
      return next;
    });
  };
  const [saveName, setSaveName] = useState("");
  const [savedTrees, setSavedTrees] = useState([]);

  useEffect(() => {
    idbGet('digitree_saved_trees').then(saved => {
      if (Array.isArray(saved) && saved.length > 0) {
        setSavedTrees(saved);
        idbSet('digitree_saved_trees_bak', saved).catch(() => {});
      } else {
        try {
          const bak = localStorage.getItem('digitree_saved_trees_bak');
          if (bak) {
            const parsed = JSON.parse(bak);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSavedTrees(parsed);
              idbSet('digitree_saved_trees', parsed).catch(() => {});
            }
          }
        } catch {}
      }
    }).catch(() => {
      try {
        idbGet('digitree_saved_trees_bak').then(bak => { if (bak && Array.isArray(bak)) setSavedTrees(bak); }).catch(() => {});
      } catch {}
    });
  }, []);

  useEffect(() => {
  // カード名の末尾スペースをtrimしてクリーンアップ
  // 括弧形式スタック "A（B（C））" を配列 ["A","B","C"] に変換
  const parseStackStr = (s) => {
    const parts = [];
    let cur = s.trim();
    while (cur) {
      const m = cur.match(/^(.+?)（(.+)）$/);
      if (!m) { parts.push(cur); break; }
      parts.push(m[1].trim());
      cur = m[2].trim();
    }
    return parts.length > 1 ? parts : parts[0] || s;
  };

  const cleanupTree = (tree) => {
    if (!tree?.nodes) return tree;
    const nodes = JSON.parse(JSON.stringify(tree.nodes));
    Object.values(nodes).forEach(node => {
      if (!node.meta?.zones) return;
      Object.keys(node.meta.zones).forEach(key => {
        node.meta.zones[key] = (node.meta.zones[key] || []).map(item => {
          if (Array.isArray(item)) return item.map(c => c.trim());
          if (typeof item === 'string') return parseStackStr(item.trim());
          return item;
        });
      });
    });
    return { ...tree, nodes };
  };

    idbGet('digitree_tree').then(saved => {
      if (saved && saved.nodes && saved.rootNodeId) {
        setTree(cleanupTree(saved));
        idbSet('digitree_tree_bak', saved).catch(() => {});
      } else {
        const sources = ['digitree_tree_bak', 'digitree_tree'];
        for (const key of sources) {
          try {
            const ls = localStorage.getItem(key);
            if (ls) {
              const parsed = JSON.parse(ls);
              if (parsed && parsed.nodes && parsed.rootNodeId) {
                setTree(cleanupTree(parsed));
                idbSet('digitree_tree', parsed).catch(() => {});
                break;
              }
            }
          } catch {}
        }
      }
      setDbLoaded(true);
    }).catch(() => {
      const sources = ['digitree_tree_bak', 'digitree_tree'];
      for (const key of sources) {
        try {
          const ls = localStorage.getItem(key);
          if (ls) {
            const parsed = JSON.parse(ls);
            if (parsed && parsed.nodes && parsed.rootNodeId) { setTree(cleanupTree(parsed)); break; }
          }
        } catch {}
      }
      setDbLoaded(true);
    });
  }, []);
  const [selectedId, setSelectedId] = useState(null);
  const blockActionsRef = useRef(false);
  const blockTimerRef = useRef(null);
  const historyRef = useRef([]);

  const setTreeWithHistory = useCallback((updater) => {
    setTree(prev => {
      historyRef.current = [...historyRef.current.slice(-29), prev];
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    setTree(prev);
  }, []);

  const applyGlobalShowZones = useCallback((show) => {
    setGlobalShowZones(show);
    setTreeWithHistory(prev => {
      const ns = JSON.parse(JSON.stringify(prev.nodes));
      Object.values(ns).forEach(n => { if (n.meta) n.meta.showZones = show; });
      return { ...prev, nodes: ns };
    });
  }, [setTreeWithHistory]);

  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  useEffect(() => {
    idbGet('digitree_viewport').then(v => { if (v) setViewport(v); }).catch(() => {
      try { const ls = localStorage.getItem('digitree_viewport'); if (ls) setViewport(JSON.parse(ls)); } catch {}
    });
  }, []);
  const [panelOpen, setPanelOpen] = useState(false);
  const [boardView, setBoardView] = useState(false);
  const [boardViewNodeId, setBoardViewNodeId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, vx: 0, vy: 0 });
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const pinchRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [lang, setLang] = useState('ja');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ja;
  const [turnIncrement, setTurnIncrement] = useState(1);
  const changeLang = (l) => { setLang(l); idbSet('digitree_lang', l).catch(() => {}); };
  useEffect(() => {
    idbGet('digitree_lang').then(l => { if (l) setLang(l); }).catch(() => {
      const ls = localStorage.getItem('digitree_lang');
      if (ls) setLang(ls);
    });
  }, []);

  useEffect(() => {
    if (!dbLoaded) return;
    const data = tree;
    idbSet('digitree_tree', data).catch(() => {});
    idbSet('digitree_tree_bak', data).catch(() => {});
  }, [tree, dbLoaded]);

  useEffect(() => {
    idbSet('digitree_viewport', viewport).catch(() => {});
  }, [viewport]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const nodes = tree.nodes;

  const visibleIds = useMemo(
    () => Object.keys(nodes).filter(id => !isHiddenByAncestor(nodes, id)),
    [nodes]
  );

  const selectedNode = selectedId ? nodes[selectedId] : null;

  const maxTurn = useMemo(() => {
    let m = 1;
    Object.values(nodes).forEach(n => { if (n.state.turn > m) m = n.state.turn; });
    return m;
  }, [nodes]);

  const getSubtreeMaxY = useCallback((nodeId, nodesMap) => {
    let maxY = nodesMap[nodeId]?.position.y ?? 0;
    const stack = [...(nodesMap[nodeId]?.children ?? [])];
    while (stack.length) {
      const id = stack.pop();
      const n = nodesMap[id];
      if (!n) continue;
      if (n.position.y > maxY) maxY = n.position.y;
      stack.push(...n.children);
    }
    return maxY;
  }, []);

  const estimateNodeHeight = useCallback((node) => {
    const baseH = 160;
    if (node.meta?.showZones === false) return baseH;
    const zoneCount = Object.values(node.meta?.zones || {}).filter(arr => arr.length > 0).length;
    const hiddenCount = (node.meta?.hiddenZones || []).length;
    const visibleZones = Math.max(0, zoneCount - hiddenCount);
    return baseH + visibleZones * 52 + (6 - visibleZones) * 30 + 20;
  }, []);

  const findFreeY = useCallback((targetX, startY, nodesMap) => {
    const occupied = Object.values(nodesMap)
      .filter(n => Math.abs(n.position.x - targetX) < NODE_W + 40)
      .map(n => ({ y: n.position.y, h: estimateNodeHeight(n) }))
      .sort((a, b) => a.y - b.y);

    let y = startY;
    let safe = false;
    while (!safe) {
      safe = !occupied.some(o => y < o.y + o.h + 16 && y + estimateNodeHeight({ meta: {} }) + 16 > o.y);
      if (!safe) y += 20;
    }
    return y;
  }, [estimateNodeHeight]);

  const insertBetween = useCallback((parentId, childId) => {
    const parent = nodes[parentId];
    const child = nodes[childId];
    if (!parent || !child) return;

    const descendants = [];
    const stack = [childId];
    while (stack.length) {
      const id = stack.pop();
      const n = nodes[id];
      if (!n) continue;
      descendants.push(id);
      stack.push(...n.children);
    }

    setTreeWithHistory(prev => {
      const ns = JSON.parse(JSON.stringify(prev.nodes));

      descendants.forEach(id => {
        if (ns[id]) {
          ns[id].state.turn += 1;
          ns[id].position.x += TURN_GAP;
        }
      });

      const newNode = {
        ...JSON.parse(JSON.stringify(ns[parentId])),
        id: uid(),
        parentId: parentId,
        children: [childId],
        state: { ...ns[parentId].state, turn: ns[parentId].state.turn + 1 },
        meta: { ...ns[parentId].meta, label: t.canvas_axis(ns[parentId].state.turn + 1), isCollapsed: false },
        action: { ...ns[parentId].action, description: "" },
        position: {
          x: ns[parentId].position.x + TURN_GAP,
          y: (ns[parentId].position.y + ns[childId].position.y) / 2,
        },
      };

      ns[childId].parentId = newNode.id;
      ns[parentId].children = ns[parentId].children.map(id => id === childId ? newNode.id : id);
      ns[newNode.id] = newNode;

      return { ...prev, nodes: ns };
    });
    setInsertMode(null);
    setSelectedId(null);
  }, [nodes, setTreeWithHistory]);

  const selectNode = useCallback((id) => {
    if (id === null) { setSelectedId(null); return; }
    if (insertMode === 'selecting_first') {
      setInsertMode({ firstId: id });
      setSelectedId(id);
      return;
    }
    if (insertMode && typeof insertMode === 'object' && insertMode.firstId) {
      const firstId = insertMode.firstId;
      const firstNode = nodes[firstId];
      if (firstNode?.children.includes(id)) {
        insertBetween(firstId, id);
      } else if (nodes[id]?.children.includes(firstId)) {
        insertBetween(id, firstId);
      } else {
        setInsertMode({ firstId: id });
        setSelectedId(id);
      }
      return;
    }
    setSelectedId(id);
  }, [insertMode, nodes, insertBetween]);

  const addChild = useCallback((parentId) => {
    const parent = nodes[parentId];
    if (!parent) return;
    const turn = parent.state.turn + turnIncrement;

    const baseY = parent.children.length === 0
      ? parent.position.y
      : getSubtreeMaxY(parentId, nodes) + BRANCH_GAP;

    const targetX = (turn - 1) * TURN_GAP + 40;
    const offsetY = findFreeY(targetX, baseY, nodes);
    const n = makeNode(parentId, turn, offsetY, { type: "play", description: "" });
    n.state = { ...parent.state, turn };
    n.meta = {
      ...parent.meta,
      label: turnIncrement === 0 ? parent.meta.label : t.canvas_axis(turn),
      isCollapsed: false,
      color: parent.meta.color ?? (settings?.defaultNodeColor ?? null),
    };
    n.action = { ...parent.action, description: "" };
    setTreeWithHistory(prev => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [parentId]: { ...parent, children: [...parent.children, n.id] },
        [n.id]: n,
      }
    }));
    setSelectedId(n.id);
    return n.id;
  }, [nodes, turnIncrement, getSubtreeMaxY, findFreeY, settings, estimateNodeHeight, t]);

  const autoLayout = useCallback(() => {
    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    const root = tree.rootNodeId;
    if (!nodesCopy[root]) return;

    const PAD = 24;

    const getH = (nodeId) => {
      const el = document.querySelector(`[data-nodeid="${nodeId}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const zoom = viewport.zoom || 1;
        return Math.ceil(rect.height / zoom);
      }
      return estimateNodeHeight(nodesCopy[nodeId]);
    };

    const setDepth = (nodeId, depth) => {
      const n = nodesCopy[nodeId];
      if (!n) return;
      n.position.x = depth * TURN_GAP + 40;
      n.children.forEach(c => setDepth(c, depth + 1));
    };
    setDepth(root, 0);

    const placed = [];

    const findY = (x, preferY, h) => {
      let y = preferY;
      let changed = true;
      while (changed) {
        changed = false;
        for (const p of placed) {
          if (Math.abs(p.x - x) > NODE_W + 20) continue;
          if (y < p.y + p.h + PAD && y + h + PAD > p.y) {
            y = p.y + p.h + PAD;
            changed = true;
            break;
          }
        }
      }
      return y;
    };

    const calcY = (nodeId, preferY) => {
      const n = nodesCopy[nodeId];
      if (!n) return preferY;
      const h = getH(nodeId);
      const y = findY(n.position.x, preferY, h);
      n.position.y = y;
      placed.push({ x: n.position.x, y, h });
      let childY = y;
      for (const childId of n.children) {
        childY = calcY(childId, childY);
      }
      return childY;
    };
    calcY(root, 60);

    historyRef.current = [...historyRef.current.slice(-29), tree];
    setTree(t => ({ ...t, nodes: nodesCopy }));
  }, [nodes, tree, setTree, estimateNodeHeight, viewport.zoom]);

  const deleteNode = useCallback((nodeId) => {
    const node = nodes[nodeId];
    if (!node || !node.parentId) return;
    setConfirmDialog({ nodeId });
  }, [nodes]);

  const execDelete = useCallback((nodeId) => {
    const node = nodes[nodeId];
    if (!node) return;
    const toDelete = getDescendants(nodes, nodeId);
    const parent = nodes[node.parentId];
    const next = { ...nodes };
    toDelete.forEach(id => delete next[id]);
    next[node.parentId] = { ...parent, children: parent.children.filter(c => c !== nodeId) };
    setTreeWithHistory(prev => ({ ...prev, nodes: next }));
    setSelectedId(null);
    setPanelOpen(false);
    setConfirmDialog(null);
  }, [nodes]);

  const updateNode = useCallback((updated) => {
    setTreeWithHistory(prev => ({ ...prev, nodes: { ...prev.nodes, [updated.id]: updated } }));
  }, [setTreeWithHistory]);

  const propagateUp = useCallback((nodeId, zoneKey, cards) => {
    setTreeWithHistory(prev => {
      const ns = JSON.parse(JSON.stringify(prev.nodes));
      let currentId = ns[nodeId]?.parentId;
      while (currentId) {
        const ancestor = ns[currentId];
        if (!ancestor) break;
        const existing = ancestor.meta?.zones?.[zoneKey] || [];
        const merged = [...new Set([...existing, ...cards])];
        if (!ancestor.meta) ancestor.meta = {};
        if (!ancestor.meta.zones) ancestor.meta.zones = {};
        ancestor.meta.zones[zoneKey] = merged;
        currentId = ancestor.parentId;
      }
      return { ...prev, nodes: ns };
    });
  }, [setTreeWithHistory]);

  const toggleCollapse = useCallback((nodeId) => {
    const node = nodes[nodeId];
    if (!node) return;
    setTreeWithHistory(prev => ({ ...prev, nodes: { ...prev.nodes, [nodeId]: { ...prev.nodes[nodeId], meta: { ...prev.nodes[nodeId].meta, isCollapsed: !prev.nodes[nodeId].meta.isCollapsed } } } }));
  }, [nodes, updateNode]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    const target = e.target.closest("[data-nodeid]");
    if (target) {
      const id = target.dataset.nodeid;
      const node = nodes[id];
      if (!node) return;
      setDraggingId(id);
      setDragOffset({
        x: e.clientX / viewport.zoom - node.position.x - viewport.x,
        y: e.clientY / viewport.zoom - node.position.y - viewport.y,
      });
      e.stopPropagation();
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, vx: viewport.x, vy: viewport.y });
    }
  }, [nodes, viewport]);

  const handleTouchStart = useCallback((e) => {
    const tag = e.target.tagName;
    if (tag === "BUTTON" || tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;

    e.preventDefault();
    if (e.touches.length === 2) {
      setDraggingId(null);
      setIsPanning(false);
      const t0 = e.touches[0], t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const cx = (t0.clientX + t1.clientX) / 2;
      const cy = (t0.clientY + t1.clientY) / 2;
      pinchRef.current = { dist, vx: viewport.x, vy: viewport.y, zoom: viewport.zoom, cx, cy };
      return;
    }
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest("[data-nodeid]");
    if (target) {
      const id = target.dataset.nodeid;
      const node = nodes[id];
      if (!node) return;
      setDraggingId(id);
      setDragOffset({
        x: touch.clientX / viewport.zoom - node.position.x - viewport.x,
        y: touch.clientY / viewport.zoom - node.position.y - viewport.y,
      });
    } else {
      setIsPanning(true);
      setPanStart({ x: touch.clientX, y: touch.clientY, vx: viewport.x, vy: viewport.y });
    }
  }, [nodes, viewport]);

  const handleMouseMove = useCallback((e) => {
    if (draggingId) {
      const nx = e.clientX / viewport.zoom - dragOffset.x - viewport.x;
      const ny = e.clientY / viewport.zoom - dragOffset.y - viewport.y;
      setTree(t => ({ ...t, nodes: { ...t.nodes, [draggingId]: { ...t.nodes[draggingId], position: { x: nx, y: ny } } } }));
    } else if (isPanning) {
      setViewport(v => ({ ...v, x: panStart.vx + (e.clientX - panStart.x) / v.zoom, y: panStart.vy + (e.clientY - panStart.y) / v.zoom }));
    }
  }, [draggingId, isPanning, dragOffset, panStart, viewport.zoom]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 2 && pinchRef.current) {
      const t0 = e.touches[0], t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const p = pinchRef.current;
      const scale = dist / p.dist;
      const newZoom = Math.min(2, Math.max(0.25, p.zoom * scale));
      const newX = p.cx / newZoom - p.cx / p.zoom + p.vx;
      const newY = p.cy / newZoom - p.cy / p.zoom + p.vy;
      setViewport({ zoom: newZoom, x: newX, y: newY });
      return;
    }
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (draggingId) {
      const nx = touch.clientX / viewport.zoom - dragOffset.x - viewport.x;
      const ny = touch.clientY / viewport.zoom - dragOffset.y - viewport.y;
      setTree(t => ({ ...t, nodes: { ...t.nodes, [draggingId]: { ...t.nodes[draggingId], position: { x: nx, y: ny } } } }));
    } else if (isPanning) {
      setViewport(v => ({ ...v, x: panStart.vx + (touch.clientX - panStart.x) / v.zoom, y: panStart.vy + (touch.clientY - panStart.y) / v.zoom }));
    }
  }, [draggingId, isPanning, dragOffset, panStart, viewport.zoom]);

  const handleEnd = useCallback(() => { setDraggingId(null); setIsPanning(false); pinchRef.current = null; }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewport(v => ({ ...v, zoom: Math.min(2, Math.max(0.25, v.zoom * delta)) }));
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "Escape") { setSelectedId(null); setPanelOpen(false); }
      if (e.key === "Delete" && selectedId) deleteNode(selectedId);
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if (e.key === "Enter" && selectedId) addChild(selectedId);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selectedId, deleteNode, addChild, undo]);

  // ============================================================
  // HTML出力
  // ============================================================
  const [htmlExportMode, setHtmlExportMode] = useState(null); // null | 'start' | 'end'
  const [htmlExportStart, setHtmlExportStart] = useState(null);

  const isDescendantOf = useCallback((nodeId, ancestorId) => {
    let cur = nodes[nodeId]?.parentId;
    while (cur) {
      if (cur === ancestorId) return true;
      cur = nodes[cur]?.parentId;
    }
    return false;
  }, [nodes]);

  const getRouteBetween = useCallback((startId, endId) => {
    const route = [];
    let cur = endId;
    while (cur) {
      route.unshift(cur);
      if (cur === startId) break;
      cur = nodes[cur]?.parentId;
    }
    return route[0] === startId ? route : null;
  }, [nodes]);

  const generateHTML = useCallback((route) => {
    const phaseLabels = { turn_start:"ターン開始時", active:"アクティブフェイズ", draw:"ドローフェイズ", breeding:"育成フェイズ", main:"メインフェイズ", turn_end:"ターン終了時" };
    const zoneColors = { hand:"#22c55e", breeding:"#4a9eff", main:"#f59e0b", trash:"#94a3b8", deck:"#a855f7", security:"#ef4444" };

    const nodeHTML = route.map((id, idx) => {
      const nd = nodes[id];
      const parent = idx > 0 ? nodes[route[idx - 1]] : null;
      const mem = nd.state.memory ?? 0;
      const phase = phaseLabels[PHASES.includes(nd.state?.phase) ? nd.state.phase : "main"] || "メインフェイズ";
      const isWin = (nd.state.oppSecurity ?? 0) < 0;
      const label = nd.meta.label === "INITIAL_BOARD_PLACEHOLDER" ? "開始盤面" : nd.meta.label;
      const cs = nd.meta.cardStates || {};
      const memColor = mem > 0 ? "#4a9eff" : mem < 0 ? "#ef4444" : "#94a3b8";

      // カードチップ
      const chip = (card, zoneKey) => {
        const color = zoneColors[zoneKey];
        const isRest = cs[`${zoneKey}:${card}`] === "rest";
        const isNew = !(parent?.meta?.zones?.[zoneKey] || []).includes(card);
        return `<span style="background:${color}${isNew?"40":"18"};border:1px solid ${color}${isNew?"":"55"};border-radius:4px;padding:2px 5px;font-size:10px;color:${color};font-weight:${isNew?700:400};display:inline-flex;align-items:center;gap:3px;margin:2px;line-height:1.4">${isRest?"▶︎":"▲"} ${card}${isNew?" ★":""}</span>`;
      };
      const zone = (zoneKey, label, style="") => {
        const color = zoneColors[zoneKey];
        const cards = nd.meta.zones?.[zoneKey] || [];
        const inner = cards.length === 0
          ? `<span style="font-size:9px;color:#2a3a52;font-style:italic">なし</span>`
          : cards.map(c => chip(c, zoneKey)).join("");
        return `<div style="background:#090f1e;border:1px solid ${color}66;border-radius:6px;padding:6px 8px;display:flex;flex-direction:column;gap:4px;${style}"><div style="font-size:9px;color:${color};font-weight:700;letter-spacing:1px">${label}</div><div style="display:flex;flex-wrap:wrap">${inner}</div></div>`;
      };

      // メモリーゲージ（flexで収まるサイズ）
      const MAX_MEM = 10;
      const memCircle = (n, active, color) =>
        `<div style="flex:1;min-width:0;aspect-ratio:1/1;max-width:22px;border-radius:50%;background:${active?color:"#0b1320"};border:1px solid ${active?color:"#1a2535"};display:flex;align-items:center;justify-content:center;font-size:8px;color:${active?"#000":"#2a3a52"};font-weight:700">${n}</div>`;
      const leftCircles = Array.from({length:MAX_MEM},(_,i)=>MAX_MEM-i).map(n=>memCircle(n,mem>=n,"#4a9eff")).join("");
      const rightCircles = Array.from({length:MAX_MEM},(_,i)=>i+1).map(n=>memCircle(n,mem<=-n,"#ef4444")).join("");
      const centerCircle = `<div style="width:22px;height:22px;border-radius:50%;background:${mem===0?"#94a3b8":"#0b1320"};border:2px solid ${mem===0?"#94a3b8":"#2a3a52"};display:flex;align-items:center;justify-content:center;font-size:9px;color:${mem===0?"#000":"#2a3a52"};font-weight:900;flex-shrink:0">0</div>`;

      // SEC縦積み
      const secCards = nd.meta.zones?.security || [];
      const secHTML = secCards.length === 0
        ? `<div style="background:#090f1e;border:1px solid #1a2535;border-radius:4px;padding:3px 5px;min-height:22px"></div>`
        : [...secCards].reverse().map(card => {
            const isNew = !(parent?.meta?.zones?.security||[]).includes(card);
            const isRest = cs[`security:${card}`] === "rest";
            return `<div style="background:${isNew?"#ef444430":"#ef444415"};border:1px solid ${isNew?"#ef4444":"#ef444455"};border-radius:4px;padding:3px 5px;font-size:9px;color:#ef4444;font-weight:${isNew?700:400};margin-bottom:3px">${isRest?"▶︎":"▲"} ${card}${isNew?" ★":""}</div>`;
          }).join("");

      const connector = idx < route.length - 1 ? `<div style="text-align:center;color:#243040;font-size:20px;margin:4px 0">↓</div>` : "";

      return `
<div style="background:#0f172a;border:1px solid #243040;border-radius:10px;padding:12px;font-family:monospace">
  <!-- ヘッダー -->
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
    <span style="background:#4a9eff22;color:#4a9eff;border:1px solid #4a9eff55;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700">${idx+1}手目</span>
    <span style="font-size:11px;color:#4a9eff;font-weight:700">${phase}</span>
    ${isWin?'<span style="color:#22c55e;font-weight:900;font-size:14px;text-shadow:0 0 10px #22c55e">【勝ち】</span>':""}
  </div>
  <div style="font-size:15px;font-weight:700;color:#dde4f0;margin-bottom:10px;border-bottom:1px solid #243040;padding-bottom:6px">${label}</div>

  <!-- メモリーゲージ -->
  <div style="background:#090f1e;border:1px solid #1a2535;border-radius:6px;padding:6px 10px;margin-bottom:6px">
    <div style="font-size:9px;color:#4a9eff;font-weight:700;margin-bottom:4px">MEMORY</div>
    <div style="display:flex;align-items:center;gap:1px;overflow:hidden">
      <div style="display:flex;gap:1px;flex:1;min-width:0;justify-content:flex-end">${leftCircles}</div>
      ${centerCircle}
      <div style="display:flex;gap:1px;flex:1;min-width:0">${rightCircles}</div>
    </div>
  </div>

  <!-- 自SEC / 相SEC / 自ドロー -->
  <div style="display:flex;gap:6px;margin-bottom:6px">
    ${[{label:"自SEC",key:"mySecurity",color:"#4a9eff"},{label:"相SEC",key:"oppSecurity",color:"#ef4444"},{label:"自ドロー",key:"myHand",color:"#22c55e"}].map(r=>{
      const val=nd.state[r.key]??0;
      const d=parent?(val-(parent.state[r.key]??val)):0;
      return `<div style="flex:1;background:#090f1e;border:1px solid ${r.color}44;border-radius:6px;padding:5px 8px;text-align:center"><div style="font-size:9px;color:${r.color};font-weight:700">${r.label}</div><div style="display:flex;align-items:baseline;justify-content:center;gap:4px"><span style="font-size:20px;font-weight:900;color:${r.color}">${val}</span>${d!==0?`<span style="font-size:11px;font-weight:700;color:${d>0?"#22c55e":"#ef4444"}">${d>0?"+"+d:d}</span>`:""}</div></div>`;
    }).join("")}
  </div>

  <!-- Security + Battle area + Deck/Trash -->
  <div style="display:flex;gap:6px;margin-bottom:6px">
    <!-- Security縦積み -->
    <div style="width:80px;flex-shrink:0">
      <div style="font-size:9px;color:#ef4444;font-weight:700;margin-bottom:3px">Security(${secCards.length})</div>
      ${secHTML}
    </div>
    <!-- Battle area -->
    ${zone("main","Battle area","flex:1")}
    <!-- Deck/Trash -->
    <div style="width:80px;flex-shrink:0;display:flex;flex-direction:column;gap:6px">
      ${zone("deck","Deck","flex:1")}
      ${zone("trash","Trash","flex:1")}
    </div>
  </div>

  <!-- 育成エリア + 手札 -->
  <div style="display:flex;gap:6px;margin-bottom:${nd.meta.note?"6px":"0"}">
    ${zone("breeding","育成エリア / Raising area","width:160px;flex-shrink:0")}
    ${zone("hand","手札","flex:1")}
  </div>

  ${nd.meta.note?`<div style="background:#090f1e;border-left:2px solid #243040;padding:5px 8px;font-size:11px;color:#7a90a8;border-radius:3px">📝 ${nd.meta.note}</div>`:""}
</div>${connector}`;
    }).join("\n");

    return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${tree.title} - DigiTree</title>
</head>
<body style="background:#060c18;color:#dde4f0;font-family:monospace;padding:16px;margin:0">
<h1 style="font-size:18px;color:#4a9eff;text-align:center;margin-bottom:24px">🌳 ${tree.title}</h1>
<div style="max-width:480px;margin:0 auto">
${nodeHTML}
</div>
</body>
</html>`;
  }, [nodes, tree.title]);

  const handleHtmlExportSelect = useCallback((id) => {
    if (htmlExportMode === 'start') {
      setHtmlExportStart(id);
      setHtmlExportMode('end');
    } else if (htmlExportMode === 'end') {
      if (id !== htmlExportStart && !isDescendantOf(id, htmlExportStart)) return;
      const route = getRouteBetween(htmlExportStart, id);
      if (!route) return;
      const html = generateHTML(route);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tree.title}_route.html`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
      setHtmlExportMode(null);
      setHtmlExportStart(null);
    }
  }, [htmlExportMode, htmlExportStart, isDescendantOf, getRouteBetween, generateHTML, tree.title]);

  const canvasSize = useMemo(() => {
    const vals = Object.values(nodes);
    return {
      w: Math.max(800, ...vals.map(n => n.position.x + NODE_W + 160)),
      h: Math.max(600, ...vals.map(n => n.position.y + NODE_H + 120)),
    };
  }, [nodes]);

  const nodeCount = Object.keys(nodes).length;

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove",  handleTouchMove,  { passive: false });
    el.addEventListener("touchend",   handleEnd,        { passive: false });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove",  handleTouchMove);
      el.removeEventListener("touchend",   handleEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleEnd]);

  const handleCanvasTap = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.dataset?.canvasbg) {
      setSelectedId(null);
      if (isMobile) setPanelOpen(false);
    }
  }, [isMobile]);

  return (
    <div style={{
      width: "100%", height: "100vh", display: "flex", flexDirection: "column",
      background: "#060c18", color: "#dde4f0",
      fontFamily: "monospace", overflow: "hidden",
    }}>
      {/* ===== HEADER ===== */}
      <div style={{ background: "#080e1a", borderBottom: "1px solid #1a2535", flexShrink: 0 }}>
        <div style={{
          height: 44, display: "flex", alignItems: "center", padding: "0 10px", gap: 8, minWidth: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <div style={{
              width: 20, height: 20, background: "linear-gradient(135deg,#4a9eff,#22c55e)",
              borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 900, color: "#000",
            }}>B</div>
            {!isMobile && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4a9eff", letterSpacing: 1.5, whiteSpace: "nowrap" }}>
                BRANCH<span style={{ color: "#22c55e" }}>MIND</span>
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            {editingTitle ? (
              <input
                autoFocus
                value={tree.title}
                onChange={e => setTree(t => ({ ...t, title: e.target.value }))}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditingTitle(false); }}
                style={{
                  width: "100%", background: "#0b1320", border: "1px solid #4a9eff",
                  borderRadius: 4, padding: "2px 6px", color: "#dde4f0",
                  fontSize: 16, fontFamily: "monospace", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <span
                onClick={() => setEditingTitle(true)}
                style={{ fontSize: 10, color: "#7a90a8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer", display: "block" }}
              >
                {tree.title}
                {dbLoaded
                  ? <span style={{ color: "#22c55e", marginLeft: 6, fontSize: 9 }}>💾{Object.keys(tree.nodes).length}件</span>
                  : <span style={{ color: "#f59e0b", marginLeft: 6, fontSize: 9 }}>読込中…</span>
                }
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Stat label={t.node_count_label || "N"} value={nodeCount} />
            <Stat label={t.stat_move} value={t.move_suffix(maxTurn)} />
          </div>

          <button onClick={() => setNewTreeConfirm(true)} style={{
            background: "#0f1a28", border: "1px solid #22c55e44", color: "#22c55e",
            width: 38, height: 38, borderRadius: 6, cursor: "pointer",
            fontSize: 12, fontFamily: "monospace", fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }} title={t.new_tree || "新規作成"}>{t.new_tree_short || "新規"}</button>

          <button onClick={() => setSaveListOpen(true)} style={{
            background: saveListOpen ? "#1a2535" : "#0f1a28",
            border: `1px solid ${savedTrees.length > 0 ? "#22c55e55" : "#1a2535"}`,
            color: savedTrees.length > 0 ? "#22c55e" : "#4a6080",
            width: 38, height: 38, borderRadius: 6, cursor: "pointer",
            fontSize: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}>{t.save_list_short || "セーブ"}</span>
            {savedTrees.length > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4,
                background: "#22c55e", color: "#000",
                borderRadius: 8, fontSize: 8, fontWeight: 900,
                padding: "1px 4px", lineHeight: 1,
              }}>{savedTrees.length}</span>
            )}
          </button>

          <button onClick={undo} disabled={historyRef.current.length === 0} style={{
            background: "#0f1a28", border: "1px solid #1a2535",
            color: historyRef.current.length === 0 ? "#2a3a52" : "#7a90a8",
            width: 44, height: 44, borderRadius: 8,
            cursor: historyRef.current.length === 0 ? "default" : "pointer",
            fontSize: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }}>↩</button>

          <button onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })} style={{
            background: "#0f1a28", border: "1px solid #1a2535", color: "#4a6080",
            width: 44, height: 44, borderRadius: 8, cursor: "pointer",
            fontSize: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }}>⌂</button>

          <button onClick={() => setSettingsOpen(true)} style={{
            background: settingsOpen ? "#1a2535" : "#0f1a28",
            border: `1px solid ${settingsOpen ? "#4a9eff" : "#1a2535"}`,
            color: "#4a9eff",
            width: 44, height: 44, borderRadius: 8, cursor: "pointer",
            fontSize: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }}>⚙</button>

        </div>
      </div>

      {/* サブバー */}
      <div style={{
        background: "#080e1a", borderBottom: "1px solid #1a2535",
        padding: "4px 10px", flexShrink: 0, display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 6,
      }}>
        {/* HTML出力ボタン / 出力モード表示 */}
        {htmlExportMode ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <span style={{ fontSize: 11, color: "#f59e0b", fontFamily: "monospace", fontWeight: 700 }}>
              {htmlExportMode === 'start' ? '📤 開始ノードをタップ' : `📤 終了ノードをタップ（開始：${getNodeLabel(nodes[htmlExportStart]?.meta?.label, t)}）`}
            </span>
            <button onClick={() => { setHtmlExportMode(null); setHtmlExportStart(null); }} style={{
              background: "none", border: "1px solid #2a3a52", color: "#7a90a8",
              borderRadius: 5, padding: "3px 8px", cursor: "pointer",
              fontSize: 11, fontFamily: "monospace",
            }}>✕</button>
          </div>
        ) : (
          <button onClick={() => { setHtmlExportMode('start'); setSelectedId(null); }} style={{
            background: "#0f1a28", border: "1px solid #94a3b855",
            color: "#94a3b8", height: 30, borderRadius: 6, cursor: "pointer",
            fontSize: 11, fontFamily: "monospace", fontWeight: 700,
            padding: "0 12px",
          }}>📤 HTML出力</button>
        )}

        {/* 盤面ビューボタン */}
        <button
          onClick={() => { if (selectedId) { setBoardViewNodeId(selectedId); setBoardView(true); } }}
          disabled={!selectedId}
          style={{
            background: selectedId ? "#0f1a28" : "none",
            border: `1px solid ${selectedId ? "#f59e0b55" : "#1a2535"}`,
            color: selectedId ? "#f59e0b" : "#2a3a52",
            height: 30, borderRadius: 6,
            cursor: selectedId ? "pointer" : "default",
            fontSize: 11, fontFamily: "monospace", fontWeight: 700,
            padding: "0 12px", display: "flex", alignItems: "center", gap: 5,
            flexShrink: 0,
          }}
        >
          🎴 選択したノードの盤面ビュー
        </button>
      </div>

      {/* ===== BODY ===== */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        <div
          ref={canvasRef}
          style={{
            flex: 1, position: "relative", overflow: "hidden",
            cursor: isPanning ? "grabbing" : "default",
            background: "#060c18",
            touchAction: "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onWheel={handleWheel}
          onClick={handleCanvasTap}
        >
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"
                patternTransform={`translate(${viewport.x * viewport.zoom % 32},${viewport.y * viewport.zoom % 32}) scale(${viewport.zoom})`}>
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#0c1828" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            transform: `translate(${viewport.x * viewport.zoom}px, ${viewport.y * viewport.zoom}px) scale(${viewport.zoom})`,
            transformOrigin: "0 0",
          }}>
            {Array.from({ length: maxTurn }, (_, i) => i + 1).map(turn => (
              <div key={turn} style={{
                position: "absolute",
                left: (turn - 1) * TURN_GAP + 40,
                top: 8,
                width: NODE_W,
                textAlign: "center",
                fontSize: 11, color: "#ffffff99", letterSpacing: 2, userSelect: "none", fontWeight: 700,
              }}>{t.canvas_axis(turn)}</div>
            ))}
          </div>

          <div style={{
            position: "absolute", top: 0, left: 0,
            transform: `translate(${viewport.x * viewport.zoom}px, ${viewport.y * viewport.zoom}px) scale(${viewport.zoom})`,
            transformOrigin: "0 0",
            width: canvasSize.w, height: canvasSize.h,
          }}>
            <EdgeLayer nodes={nodes} visibleIds={visibleIds} />
            {visibleIds.map(id => {
              const node = nodes[id];
              if (!node) return null;
              return (
                <BoardNodeCard key={id}
                  node={node}
                  parentNode={node.parentId ? nodes[node.parentId] : null}
                  settings={settings}
                  isSelected={selectedId === id}
                  onSelect={(id) => {
                    if (htmlExportMode) { handleHtmlExportSelect(id); return; }
                    selectNode(id);
                  }}
                  onAddChild={addChild}
                  onDelete={deleteNode}
                  onToggleCollapse={toggleCollapse}
                  isDragging={draggingId === id}
                  t={t}
                  blockActions={() => htmlExportMode ? false : blockActionsRef.current}
                  onOpenPanel={() => { if (!htmlExportMode) setPanelOpen(true); }}
                  onBlockStart={() => {
                    if (htmlExportMode) return;
                    blockActionsRef.current = true;
                    if (blockTimerRef.current) clearTimeout(blockTimerRef.current);
                    blockTimerRef.current = setTimeout(() => { blockActionsRef.current = false; }, 400);
                  }}
                  htmlExportMode={htmlExportMode}
                  htmlExportStart={htmlExportStart}
                  isDescendantOf={isDescendantOf}
                />
              );
            })}
          </div>

          {insertMode && (
            <div style={{
              position: "absolute", top: 36, left: "50%",
              transform: "translateX(-50%)",
              background: "#0b1320", border: "1px solid #f59e0b88",
              borderRadius: 8, padding: "8px 16px", zIndex: 20,
              display: "flex", alignItems: "center", gap: 10,
              fontFamily: "monospace", fontSize: 12, color: "#f59e0b",
              boxShadow: "0 4px 16px #000a",
            }}>
              {insertMode === 'selecting_first'
                ? "①割り込む場所の前のノードをタップ"
                : `②「${nodes[insertMode.firstId]?.meta?.label}」の次のノードをタップ`}
              <button onClick={() => { setInsertMode(null); setSelectedId(null); }} style={{
                background: "none", border: "none", color: "#f59e0b",
                cursor: "pointer", fontSize: 16,
              }}>×</button>
            </div>
          )}

          <div style={{
            position: "fixed",
            bottom: 16, right: 12,
            display: "flex", flexDirection: "column", gap: 10, zIndex: 40,
          }}>
            {isMobile && selectedId && !panelOpen && (<>
              <FAB color="#4a9eff" onClick={() => setPanelOpen(true)}>✏️</FAB>
              <FAB color="#22c55e" onClick={() => addChild(selectedId)}>+</FAB>
              {nodes[selectedId]?.parentId && (
                <FAB color="#ef4444" onClick={() => deleteNode(selectedId)}>×</FAB>
              )}
            </>)}
            <FAB
              color={insertMode ? "#f59e0b" : "#94a3b8"}
              onClick={() => {
                if (insertMode) { setInsertMode(null); setSelectedId(null); }
                else { setInsertMode('selecting_first'); setSelectedId(null); }
              }}
              size={44}
            >{insertMode ? (t.cancel_insert || "✕割込") : (t.insert_mode || "割込")}</FAB>
            <FAB color="#4a9eff" onClick={autoLayout} size={44}>{t.auto_layout || "整列"}</FAB>
            <FAB color="#7a90a8" onClick={() => setViewport(v => ({ ...v, zoom: Math.min(2, v.zoom * 1.2) }))} size={44}>＋</FAB>
            <FAB color="#7a90a8" onClick={() => setViewport(v => ({ ...v, zoom: Math.max(0.25, v.zoom * 0.8) }))} size={44}>−</FAB>
          </div>
        </div>

        {!isMobile && (
          <NodeDetailPanel
            node={selectedNode}
            parentNode={selectedNode?.parentId ? nodes[selectedNode.parentId] : null}
            onUpdate={updateNode}
            onClose={() => { setPanelOpen(false); setSelectedId(null); }}
            onDelete={deleteNode}
            onAddChild={addChild}
            onPropagateUp={(key, cards) => propagateUp(selectedId, key, cards)}
            settings={settings}
            onUpdateSettings={updateSettings}
            isMobile={false}
            turnIncrement={turnIncrement}
            setTurnIncrement={setTurnIncrement}
            t={t}
            blockActions={() => blockActionsRef.current}
            nodes={nodes}
            onSelectNode={(id) => setSelectedId(id)}
            boardView={boardView}
            setBoardView={setBoardView}
            boardViewNodeId={boardViewNodeId}
            setBoardViewNodeId={setBoardViewNodeId}
            onUndo={undo}
          />
        )}
      </div>

      {isMobile && panelOpen && selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          parentNode={selectedNode?.parentId ? nodes[selectedNode.parentId] : null}
          onUpdate={updateNode}
          onClose={() => { setPanelOpen(false); setSelectedId(null); }}
          onDelete={deleteNode}
          onAddChild={addChild}
          onPropagateUp={(key, cards) => propagateUp(selectedId, key, cards)}
          settings={settings}
          onUpdateSettings={updateSettings}
          isMobile={true}
          turnIncrement={turnIncrement}
          setTurnIncrement={setTurnIncrement}
          t={t}
          blockActions={() => blockActionsRef.current}
          nodes={nodes}
          onSelectNode={(id) => { setSelectedId(id); }}
          boardView={boardView}
          setBoardView={setBoardView}
          boardViewNodeId={boardViewNodeId}
          setBoardViewNodeId={setBoardViewNodeId}
          onUndo={undo}
        />
      )}

      {/* 盤面ビューモーダル（メインApp） */}
      {boardView && (
        <BoardViewModal
          boardViewNodeId={boardViewNodeId}
          setBoardViewNodeId={setBoardViewNodeId}
          setBoardView={setBoardView}
          nodes={nodes}
          selectedNode={selectedNode}
          t={t}
          onUpdateNode={updateNode}
          onUndo={undo}
          onAddChild={addChild}
        />
      )}

      {/* 設定モーダル */}
      {settingsOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "#000b", zIndex: 400,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setSettingsOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0b1320", border: "1px solid #4a9eff44",
            borderRadius: 14, width: 340, height: "80vh",
            display: "flex", flexDirection: "column",
            fontFamily: "monospace", boxShadow: "0 8px 48px #000e",
          }}>
            <div style={{
              padding: "14px 18px 10px", borderBottom: "1px solid #1a2535",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "#4a9eff", fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>⚙ 設定</span>
              <button onClick={() => setSettingsOpen(false)} style={{
                background: "none", border: "none", color: "#4a5568", cursor: "pointer", fontSize: 20,
              }}>×</button>
            </div>

            <div style={{ overflowY: "auto", touchAction: "pan-y", display: "flex", flexDirection: "column" }}>
              {(() => {
                const tab = settingsTab;
                const setTab = setSettingsTab;
                const tabs = [
                  { key: "display", label: t.resource_display || "表示" },
                  { key: "board",   label: t.zone_display || "盤面" },
                  { key: "appearance", label: t.appearance_tab || "言語・色・文字" },
                  { key: "data",    label: t.data_mgmt || "データ" },
                ];
                return (
                  <>
                    <div style={{ display: "flex", borderBottom: "1px solid #1a2535", flexShrink: 0 }}>
                      {tabs.map(tb => (
                        <button key={tb.key} onClick={() => setTab(tb.key)} style={{
                          flex: 1, padding: "10px 0", background: "none", border: "none",
                          borderBottom: tab === tb.key ? "2px solid #4a9eff" : "2px solid transparent",
                          color: tab === tb.key ? "#4a9eff" : "#4a5568",
                          fontSize: 11, fontFamily: "monospace", fontWeight: 700, cursor: "pointer",
                        }}>{tb.label}</button>
                      ))}
                    </div>

                    <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

                      {tab === "display" && (<>
                        <SettingSec title={t.default_resource}>
                          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                            {[
                              { label: t.size_small, value: "small" },
                              { label: t.size_normal, value: "normal" },
                              { label: t.size_large, value: "large" },
                            ].map(opt => (
                              <button key={opt.value} onClick={() => updateSettings({ resourceSize: opt.value })} style={{
                                flex: 1, padding: "7px 0", borderRadius: 5, cursor: "pointer",
                                background: settings.resourceSize === opt.value ? "#4a9eff22" : "#0b1320",
                                border: `1px solid ${settings.resourceSize === opt.value ? "#4a9eff" : "#1a2535"}`,
                                color: settings.resourceSize === opt.value ? "#4a9eff" : "#4a5568",
                                fontSize: 10, fontFamily: "monospace",
                              }}>{opt.label}</button>
                            ))}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                          {[
                            { label: t.memory_label,                       key: "defaultMemory",      visKey: null,          min: -10, max: 10,  color: "#4a9eff" },
                            { label: "",                                    key: null,                 visKey: null,          skip: true },
                            { label: t.my_sec,                             key: "defaultMySecurity",  visKey: "mySecurity",  min: 0,   max: 5,   color: "#4a9eff" },
                            { label: t.opp_sec,                            key: "defaultOppSecurity", visKey: "oppSecurity", min: 0,   max: 5,   color: "#ef4444" },
                            { label: t.my_hand_label || "自ドロー",        key: "defaultMyHand",      visKey: "myHand",      min: 0,   max: 20,  color: "#22c55e" },
                            { label: t.opp_hand_label || "相ドロー",       key: "defaultOppHand",     visKey: "oppHand",     min: 0,   max: 20,  color: "#22c55e" },
                            { label: t.my_deck_label || "自山",            key: "defaultMyDeck",      visKey: "myDeck",      min: 0,   max: 60,  color: "#94a3b8" },
                            { label: t.opp_deck_label || "相山",           key: "defaultOppDeck",     visKey: "oppDeck",     min: 0,   max: 60,  color: "#94a3b8" },
                            { label: t.my_trash_label || "自捨札",         key: "defaultMyTrash",     visKey: "myTrash",     min: 0,   max: 60,  color: "#94a3b8" },
                            { label: t.opp_trash_label || "相捨札",        key: "defaultOppTrash",    visKey: "oppTrash",    min: 0,   max: 60,  color: "#7a90a8" },
                          ].map((f, i) => {
                            if (f.skip) return <div key={i} />;
                            const visible = f.visKey ? (settings.visibleResourceKeys || []).includes(f.visKey) : null;
                            return (
                              <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "5px 6px", background: "#080e1a", borderRadius: 6, border: `1px solid ${f.color}22` }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span style={{ fontSize: 10, color: f.color, fontWeight: 700 }}>{f.label}</span>
                                  {f.visKey !== null ? (
                                    <button onClick={() => {
                                      const cur = settings.visibleResourceKeys || [];
                                      updateSettings({ visibleResourceKeys: visible ? cur.filter(k => k !== f.visKey) : [...cur, f.visKey] });
                                    }} style={{
                                      padding: "1px 5px", borderRadius: 3, cursor: "pointer", flexShrink: 0,
                                      background: visible ? `${f.color}22` : "#0b1320",
                                      border: `1px solid ${visible ? f.color : "#2a3a52"}`,
                                      color: visible ? f.color : "#4a5568",
                                      fontSize: 9, fontFamily: "monospace", fontWeight: 700,
                                    }}>{visible ? "表示" : "非表示"}</button>
                                  ) : null}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <button onClick={() => updateSettings({ [f.key]: Math.max(f.min, (settings[f.key] ?? 0) - 1) })} style={{
                                    width: 22, height: 22, background: "#0b1320", border: "1px solid #1a2535",
                                    borderRadius: 4, color: "#7a90a8", cursor: "pointer", fontSize: 10,
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                  }}>◀</button>
                                  <span style={{ color: "#dde4f0", fontWeight: 700, flex: 1, textAlign: "center", fontSize: 13 }}>
                                    {settings[f.key] ?? 0}
                                  </span>
                                  <button onClick={() => updateSettings({ [f.key]: Math.min(f.max, (settings[f.key] ?? 0) + 1) })} style={{
                                    width: 22, height: 22, background: "#0b1320", border: "1px solid #1a2535",
                                    borderRadius: 4, color: "#7a90a8", cursor: "pointer", fontSize: 10,
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                  }}>▶</button>
                                </div>
                              </div>
                            );
                          })}
                          </div>
                          <button onClick={() => updateSettings({
                            defaultMemory: 1, defaultMySecurity: 5, defaultOppSecurity: 5,
                            defaultMyHand: 0, defaultOppHand: 0, defaultMyDeck: 40, defaultOppDeck: 40, defaultMyTrash: 0, defaultOppTrash: 0,
                          })} style={{
                            marginTop: 4, width: "100%", padding: "7px 0", borderRadius: 5, cursor: "pointer",
                            background: "#0b1320", border: "1px solid #2a3a52", color: "#4a6080",
                            fontSize: 11, fontFamily: "monospace",
                          }}>{t.reset_defaults || "↩ 初期設定に戻す"}</button>
                        </SettingSec>
                      </>)}

                      {tab === "board" && (<>
                        <SettingSec title={t.zone_display}>
                          {(() => {
                            const allKeys = ["hand","breeding","main","trash","deck","security"];
                            const cur = settings.visibleZoneKeys || allKeys;
                            const isAllVisible = allKeys.every(k => cur.includes(k));
                            const isAllHidden = cur.length === 0;
                            return (<>
                              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                                <button onClick={() => { updateSettings({ visibleZoneKeys: allKeys }); applyGlobalShowZones(true); }} style={{
                                  flex: 1, padding: "10px 0", borderRadius: 5, cursor: "pointer",
                                  background: isAllVisible ? "#4a9eff22" : "#0b1320",
                                  border: `1px solid ${isAllVisible ? "#4a9eff" : "#1a2535"}`,
                                  color: isAllVisible ? "#4a9eff" : "#4a5568",
                                  fontSize: 12, fontFamily: "monospace", fontWeight: 700,
                                }}>{t.show_all || "全て表示"}</button>
                                <button onClick={() => { updateSettings({ visibleZoneKeys: [] }); applyGlobalShowZones(false); }} style={{
                                  flex: 1, padding: "10px 0", borderRadius: 5, cursor: "pointer",
                                  background: isAllHidden ? "#4a9eff22" : "#0b1320",
                                  border: `1px solid ${isAllHidden ? "#4a9eff" : "#1a2535"}`,
                                  color: isAllHidden ? "#4a9eff" : "#4a5568",
                                  fontSize: 12, fontFamily: "monospace", fontWeight: 700,
                                }}>{t.hide_all || "全て非表示"}</button>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                                {getZoneDefs(t).map(({ key, label, color }) => {
                                  const visible = cur.includes(key);
                                  return (
                                    <button key={key} onClick={() => {
                                      updateSettings({ visibleZoneKeys: visible ? cur.filter(k => k !== key) : [...cur, key] });
                                    }} style={{
                                      padding: "10px 0", borderRadius: 4, cursor: "pointer", fontSize: 12,
                                      background: visible ? `${color}22` : "#0b1320",
                                      border: `1px solid ${visible ? color : "#1a2535"}`,
                                      color: visible ? color : "#4a5568", fontFamily: "monospace",
                                      textAlign: "center",
                                    }}>{label}</button>
                                  );
                                })}
                              </div>
                            </>);
                          })()}
                        </SettingSec>

                        <SettingSec title={t.input_display_label || "入力欄の表示"}>
                          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                            {(() => {
                              const allKeys = ["hand","breeding","main","trash","deck","security"];
                              const cur = settings.visibleInputKeys ?? allKeys;
                              const isAllVisible = allKeys.every(k => cur.includes(k));
                              const isAllHidden = cur.length === 0;
                              return (<>
                                <button onClick={() => updateSettings({ visibleInputKeys: allKeys })} style={{
                                  flex: 1, padding: "10px 0", borderRadius: 5, cursor: "pointer",
                                  background: isAllVisible ? "#4a9eff22" : "#0b1320",
                                  border: `1px solid ${isAllVisible ? "#4a9eff" : "#1a2535"}`,
                                  color: isAllVisible ? "#4a9eff" : "#4a5568",
                                  fontSize: 12, fontFamily: "monospace", fontWeight: 700,
                                }}>{t.show_all || "全て表示"}</button>
                                <button onClick={() => updateSettings({ visibleInputKeys: [] })} style={{
                                  flex: 1, padding: "10px 0", borderRadius: 5, cursor: "pointer",
                                  background: isAllHidden ? "#4a9eff22" : "#0b1320",
                                  border: `1px solid ${isAllHidden ? "#4a9eff" : "#1a2535"}`,
                                  color: isAllHidden ? "#4a9eff" : "#4a5568",
                                  fontSize: 12, fontFamily: "monospace", fontWeight: 700,
                                }}>{t.hide_all || "全て非表示"}</button>
                              </>);
                            })()}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                            {getZoneDefs(t).map(({ key, label, color }) => {
                              const visible = (settings.visibleInputKeys ?? ["hand","breeding","main","trash","deck","security"]).includes(key);
                              return (
                                <button key={key} onClick={() => {
                                  const cur = settings.visibleInputKeys ?? ["hand","breeding","main","trash","deck","security"];
                                  updateSettings({ visibleInputKeys: visible ? cur.filter(k => k !== key) : [...cur, key] });
                                }} style={{
                                  padding: "10px 0", borderRadius: 4, cursor: "pointer", fontSize: 12,
                                  background: visible ? `${color}22` : "#0b1320",
                                  border: `1px solid ${visible ? color : "#1a2535"}`,
                                  color: visible ? color : "#4a5568", fontFamily: "monospace",
                                  textAlign: "center",
                                }}>{label}</button>
                              );
                            })}
                          </div>
                        </SettingSec>
                      </>)}

                      {tab === "data" && (<>
                        <SettingSec title={t.data_mgmt}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <button onClick={() => { exportJSON(tree, `digitree_${tree.title}_${new Date().toLocaleDateString("ja").replace(/\//g,"-")}.json`); }} style={{
                              padding: "12px 0", borderRadius: 5, cursor: "pointer",
                              background: "#4a9eff18", border: "1px solid #4a9eff44", color: "#4a9eff",
                              fontSize: 13, fontFamily: "monospace", fontWeight: 700,
                            }}>{t.export_current || "📤 Export Current"}</button>
                            <button onClick={() => { exportJSON({ tree, savedTrees }, `digitree_all_${new Date().toLocaleDateString("ja").replace(/\//g,"-")}.json`); }} style={{
                              padding: "10px 0", borderRadius: 5, cursor: "pointer",
                              background: "#4a9eff18", border: "1px solid #4a9eff44", color: "#4a9eff",
                              fontSize: 13, fontFamily: "monospace", fontWeight: 700,
                            }}>{t.export_all || "📤 Export All"}</button>
                            <button onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file"; input.accept = ".json,application/json";
                              document.body.appendChild(input);
                              input.onchange = e => {
                                const file = e.target.files[0];
                                document.body.removeChild(input);
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  try {
                                    const parsed = JSON.parse(ev.target.result);
                                    if (parsed.tree && parsed.savedTrees) {
                                      historyRef.current = [...historyRef.current.slice(-29), tree];
                                      setTree(parsed.tree); setSavedTrees(parsed.savedTrees);
                                      idbSet("digitree_saved_trees", parsed.savedTrees).catch(() => {});
                                      idbSet("digitree_tree", parsed.tree).catch(() => {});
                                      setSettingsOpen(false);
                                    } else if (parsed.nodes && parsed.rootNodeId) {
                                      historyRef.current = [...historyRef.current.slice(-29), tree];
                                      setTree(parsed);
                                      idbSet("digitree_tree", parsed).catch(() => {});
                                      setSettingsOpen(false);
                                    } else { alert("有効なDigiTreeファイルではありません"); }
                                  } catch { alert("読み込みに失敗しました"); }
                                };
                                reader.readAsText(file);
                              };
                              input.click();
                            }} style={{
                              padding: "12px 0", borderRadius: 5, cursor: "pointer",
                              background: "#f59e0b18", border: "1px solid #f59e0b44", color: "#f59e0b",
                              fontSize: 13, fontFamily: "monospace", fontWeight: 700,
                            }}>{t.import_label || "📥 Import"}</button>
                            <button onClick={() => { setSettingsOpen(false); setResetConfirm(true); }} style={{
                              padding: "12px 0", borderRadius: 5, cursor: "pointer",
                              background: "#ef444412", border: "1px solid #ef444444", color: "#ef4444",
                              fontSize: 13, fontFamily: "monospace", fontWeight: 700,
                            }}>{t.clear_all || "🗑 Clear All"}</button>
                          </div>
                        </SettingSec>
                      </>)}

                      {tab === "appearance" && (<>
                        <SettingSec title={t.lang_label}>
                          <select value={lang} onChange={e => changeLang(e.target.value)} style={{
                            width: "100%", background: "#0b1320", border: "1px solid #1a2535",
                            borderRadius: 5, padding: "6px 8px", color: "#dde4f0",
                            fontSize: 16, fontFamily: "monospace", outline: "none",
                          }}>
                            {Object.entries(LANG_FLAGS).map(([l, flag]) => (
                              <option key={l} value={l}>{flag} {l.toUpperCase()}</option>
                            ))}
                          </select>
                        </SettingSec>

                        <SettingSec title={t.default_color}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {NODE_COLORS.map(c => (
                              <button key={String(c.value)} onClick={() => updateSettings({ defaultNodeColor: c.value })} style={{
                                width: 38, height: 38, borderRadius: 8, cursor: "pointer",
                                background: c.value ? `linear-gradient(135deg, ${c.value}, ${c.bg})` : "#0b1320",
                                border: settings.defaultNodeColor === c.value
                                  ? `2px solid ${c.border || "#4a9eff"}`
                                  : `1px solid ${c.border ? c.border + "66" : "#2a3a52"}`,
                                boxShadow: settings.defaultNodeColor === c.value ? `0 0 6px ${c.border || "#4a9eff"}88` : "none",
                              }}>
                                {c.value === null && <span style={{ fontSize: 10, color: "#4a5568" }}>—</span>}
                              </button>
                            ))}
                          </div>
                        </SettingSec>

                        <SettingSec title={"カード名が長い場合の表示方法"}>
                          <div style={{ display: "flex", gap: 8 }}>
                            {[
                              { label: "折り返して表示", value: "wrap" },
                              { label: "省略する", value: "clip" },
                            ].map(opt => (
                              <button key={opt.value} onClick={() => updateSettings({ zoneTagWrap: opt.value })} style={{
                                flex: 1, padding: "10px 0", borderRadius: 5, cursor: "pointer",
                                background: (settings.zoneTagWrap ?? "wrap") === opt.value ? "#4a9eff22" : "#0b1320",
                                border: `1px solid ${(settings.zoneTagWrap ?? "wrap") === opt.value ? "#4a9eff" : "#1a2535"}`,
                                color: (settings.zoneTagWrap ?? "wrap") === opt.value ? "#4a9eff" : "#4a5568",
                                fontSize: 11, fontFamily: "monospace",
                              }}>{opt.label}</button>
                            ))}
                          </div>
                        </SettingSec>
                      </>)}

                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* セーブリストモーダル */}
      {saveListOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "#000b", zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setSaveListOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1a28", border: "1px solid #22c55e44",
            borderRadius: 12, padding: "20px 24px", width: 340,
            maxHeight: "80vh", display: "flex", flexDirection: "column",
            fontFamily: "monospace", boxShadow: "0 8px 40px #000c",
            gap: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, color: "#dde4f0", fontWeight: 700 }}>📋 セーブリスト</span>
              <button onClick={() => setSaveListOpen(false)} style={{
                background: "none", border: "none", color: "#4a5568",
                cursor: "pointer", fontSize: 20,
              }}>×</button>
            </div>

            {savedTrees.length === 0 ? (
              <div style={{ fontSize: 12, color: "#2a3a52", textAlign: "center", padding: "20px 0" }}>
                保存データがありません
              </div>
            ) : (
              <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                {savedTrees.map(entry => (
                  <div key={entry.id} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "#0b1320", border: "1px solid #1a2535", borderRadius: 6,
                    padding: "8px 10px",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#dde4f0", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.name}
                      </div>
                      <div style={{ fontSize: 9, color: "#2a3a52", marginTop: 2 }}>
                        {new Date(entry.savedAt).toLocaleString('ja')} ・ {Object.keys(entry.tree.nodes || {}).length}ノード
                      </div>
                    </div>
                    <button onClick={() => setLoadConfirm({ id: entry.id, name: entry.name, tree: entry.tree })} style={{
                      background: "#22c55e22", border: "1px solid #22c55e55", color: "#22c55e",
                      borderRadius: 4, padding: "4px 8px", cursor: "pointer",
                      fontSize: 11, fontFamily: "monospace", fontWeight: 700, flexShrink: 0,
                    }}>読込</button>
                    <button onClick={() => setOverwriteConfirm({ id: entry.id, name: entry.name })} style={{
                      background: "#4a9eff22", border: "1px solid #4a9eff55", color: "#4a9eff",
                      borderRadius: 4, padding: "4px 8px", cursor: "pointer",
                      fontSize: 11, fontFamily: "monospace", fontWeight: 700, flexShrink: 0,
                    }}>上書き</button>
                    <button onClick={() => setDeleteConfirm({ id: entry.id, name: entry.name })} style={{
                      background: "#ef444418", border: "1px solid #ef444444", color: "#ef4444",
                      borderRadius: 4, padding: "4px 8px", cursor: "pointer",
                      fontSize: 11, fontFamily: "monospace", fontWeight: 700, flexShrink: 0,
                    }}>削除</button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => { setSaveName(tree.title + " " + new Date().toLocaleDateString('ja')); setSaveListOpen(false); setSaveModal(true); }} style={{
              width: "100%", padding: "8px 0", borderRadius: 6, cursor: "pointer",
              background: "#22c55e18", border: "1px solid #22c55e44", color: "#22c55e",
              fontSize: 12, fontFamily: "monospace", fontWeight: 700,
            }}>+ 現在のツリーを保存</button>
          </div>
        </div>
      )}

      {saveModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#000b", zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setSaveModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1a28", border: "1px solid #22c55e55",
            borderRadius: 12, padding: "20px 24px", width: 320,
            fontFamily: "monospace", boxShadow: "0 8px 40px #000c",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ fontSize: 16, color: "#dde4f0", fontWeight: 700 }}>💾 名前をつけて保存</div>
            <input
              autoFocus
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const entry = { id: uid(), name: saveName || tree.title, tree: JSON.parse(JSON.stringify(tree)), savedAt: Date.now() };
                  const next = [entry, ...savedTrees].slice(0, 20);
                  setSavedTrees(next);
                  idbSet('digitree_saved_trees', next).catch(() => {});
                  setSaveModal(false);
                }
              }}
              placeholder="保存名を入力..."
              style={{
                background: "#0b1320", border: "1px solid #22c55e55", borderRadius: 5,
                padding: "6px 10px", color: "#dde4f0", fontSize: 16,
                fontFamily: "monospace", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setSaveModal(false)} style={{
                padding: "6px 14px", borderRadius: 5, cursor: "pointer",
                background: "none", border: "1px solid #2a3a52", color: "#7a90a8",
                fontSize: 12, fontFamily: "monospace",
              }}>キャンセル</button>
              <button onClick={() => {
                const entry = { id: uid(), name: saveName || tree.title, tree: JSON.parse(JSON.stringify(tree)), savedAt: Date.now() };
                const next = [entry, ...savedTrees].slice(0, 20);
                setSavedTrees(next);
                idbSet('digitree_saved_trees', next).catch(() => {});
                idbSet('digitree_saved_trees_bak', next).catch(() => {});
                setSaveModal(false);
              }} style={{
                padding: "6px 14px", borderRadius: 5, cursor: "pointer",
                background: "#22c55e22", border: "1px solid #22c55e66", color: "#22c55e",
                fontSize: 12, fontFamily: "monospace", fontWeight: 700,
              }}>保存</button>
            </div>
          </div>
        </div>
      )}

      {newTreeConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "#000b", zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setNewTreeConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1a28", border: "1px solid #22c55e88",
            borderRadius: 12, padding: "24px 28px", width: 300,
            fontFamily: "monospace", boxShadow: "0 8px 40px #000c",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ fontSize: 15, color: "#dde4f0", fontWeight: 700 }}>{t.new_tree || "新規作成"}</div>
            <div style={{ fontSize: 12, color: "#7a90a8", lineHeight: 1.6 }}>{t.new_tree_confirm || "現在のツリーを破棄して新規作成しますか？"}</div>
            <button onClick={() => {
              const entry = { id: uid(), name: tree.title, tree: JSON.parse(JSON.stringify(tree)), savedAt: Date.now() };
              const next = [entry, ...savedTrees.filter(e => e.id !== entry.id)].slice(0, 50);
              setSavedTrees(next);
              idbSet("digitree_saved_trees", next).catch(() => {});
              setTree(INITIAL_TREE);
              setSelectedId(null);
              setViewport({ x: 0, y: 0, zoom: 1 });
              setNewTreeConfirm(false);
            }} style={{
              padding: "10px 0", borderRadius: 6, cursor: "pointer",
              background: "#22c55e22", border: "1px solid #22c55e", color: "#22c55e",
              fontSize: 13, fontFamily: "monospace", fontWeight: 700,
            }}>{t.save_and_new || "💾 保存して新規作成"}</button>
            <button onClick={() => {
              setTree(INITIAL_TREE);
              setSelectedId(null);
              setViewport({ x: 0, y: 0, zoom: 1 });
              setNewTreeConfirm(false);
            }} style={{
              padding: "10px 0", borderRadius: 6, cursor: "pointer",
              background: "#ef444418", border: "1px solid #ef444466", color: "#ef4444",
              fontSize: 13, fontFamily: "monospace", fontWeight: 700,
            }}>{t.discard_and_new || "🗑 破棄して新規作成"}</button>
            <button onClick={() => setNewTreeConfirm(false)} style={{
              padding: "8px 0", borderRadius: 6, cursor: "pointer",
              background: "none", border: "1px solid #2a3a52", color: "#7a90a8",
              fontSize: 12, fontFamily: "monospace",
            }}>{t.cancel || "キャンセル"}</button>
          </div>
        </div>
      )}

      {loadConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setLoadConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a28", border: "1px solid #22c55e55", borderRadius: 12, padding: "20px 24px", width: 300, fontFamily: "monospace", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#dde4f0", fontWeight: 700 }}>「{loadConfirm.name}」を読み込みますか？</div>
            <div style={{ fontSize: 11, color: "#7a90a8" }}>現在のツリーは破棄されます</div>
            <button onClick={() => {
              historyRef.current = [...historyRef.current.slice(-29), tree];
              setTree(loadConfirm.tree);
              idbSet('digitree_tree', loadConfirm.tree).catch(() => {});
              setLoadConfirm(null); setSaveListOpen(false);
            }} style={{ padding: "10px 0", borderRadius: 6, cursor: "pointer", background: "#22c55e22", border: "1px solid #22c55e", color: "#22c55e", fontSize: 13, fontWeight: 700 }}>読み込む</button>
            <button onClick={() => setLoadConfirm(null)} style={{ padding: "8px 0", borderRadius: 6, cursor: "pointer", background: "none", border: "1px solid #2a3a52", color: "#7a90a8", fontSize: 12 }}>キャンセル</button>
          </div>
        </div>
      )}

      {overwriteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setOverwriteConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a28", border: "1px solid #4a9eff55", borderRadius: 12, padding: "20px 24px", width: 300, fontFamily: "monospace", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#dde4f0", fontWeight: 700 }}>「{overwriteConfirm.name}」を上書きしますか？</div>
            <div style={{ fontSize: 11, color: "#7a90a8" }}>現在のツリーで上書き保存します</div>
            <button onClick={() => {
              const next = savedTrees.map(e => e.id === overwriteConfirm.id ? { ...e, tree: JSON.parse(JSON.stringify(tree)), savedAt: Date.now() } : e);
              setSavedTrees(next);
              idbSet('digitree_saved_trees', next).catch(() => {});
              setOverwriteConfirm(null);
            }} style={{ padding: "10px 0", borderRadius: 6, cursor: "pointer", background: "#4a9eff22", border: "1px solid #4a9eff", color: "#4a9eff", fontSize: 13, fontWeight: 700 }}>上書き保存</button>
            <button onClick={() => setOverwriteConfirm(null)} style={{ padding: "8px 0", borderRadius: 6, cursor: "pointer", background: "none", border: "1px solid #2a3a52", color: "#7a90a8", fontSize: 12 }}>キャンセル</button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDeleteConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f1a28", border: "1px solid #ef444455", borderRadius: 12, padding: "20px 24px", width: 300, fontFamily: "monospace", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#dde4f0", fontWeight: 700 }}>「{deleteConfirm.name}」を削除しますか？</div>
            <button onClick={() => {
              const next = savedTrees.filter(e => e.id !== deleteConfirm.id);
              setSavedTrees(next);
              idbSet('digitree_saved_trees', next).catch(() => {});
              setDeleteConfirm(null);
            }} style={{ padding: "10px 0", borderRadius: 6, cursor: "pointer", background: "#ef444418", border: "1px solid #ef4444", color: "#ef4444", fontSize: 13, fontWeight: 700 }}>削除する</button>
            <button onClick={() => setDeleteConfirm(null)} style={{ padding: "8px 0", borderRadius: 6, cursor: "pointer", background: "none", border: "1px solid #2a3a52", color: "#7a90a8", fontSize: 12 }}>キャンセル</button>
          </div>
        </div>
      )}

      {resetConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "#000b", zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setResetConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1a28", border: "1px solid #ef444488",
            borderRadius: 12, padding: "24px 28px", width: 280,
            fontFamily: "monospace", boxShadow: "0 8px 40px #000c",
          }}>
            <div style={{ fontSize: 16, color: "#dde4f0", fontWeight: 700, marginBottom: 8 }}>全データを消去</div>
            <div style={{ fontSize: 11, color: "#7a90a8", marginBottom: 20, lineHeight: 1.6 }}>
              現在のツリーを消去して初期状態に戻します。<br />この操作は元に戻せません。
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setResetConfirm(false)} style={{
                padding: "7px 16px", borderRadius: 6, cursor: "pointer",
                background: "none", border: "1px solid #2a3a52", color: "#7a90a8",
                fontSize: 12, fontFamily: "monospace",
              }}>キャンセル</button>
              <button onClick={() => {
                idbDel('digitree_tree').catch(() => {});
                idbDel('digitree_viewport').catch(() => {});
                setTree(INITIAL_TREE);
                setViewport({ x: 0, y: 0, zoom: 1 });
                setSelectedId(null);
                setResetConfirm(false);
              }} style={{
                padding: "7px 16px", borderRadius: 6, cursor: "pointer",
                background: "#ef444422", border: "1px solid #ef4444", color: "#ef4444",
                fontSize: 12, fontFamily: "monospace", fontWeight: 700,
              }}>消去する</button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div style={{
          position: "fixed", inset: 0, background: "#000a", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setConfirmDialog(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1a28", border: "1px solid #ef444488",
            borderRadius: 12, padding: "24px 28px", width: 280,
            fontFamily: "monospace", boxShadow: "0 8px 40px #000c",
          }}>
            <div style={{ fontSize: 16, color: "#dde4f0", marginBottom: 8, fontWeight: 700 }}>ノードを削除</div>
            <div style={{ fontSize: 11, color: "#7a90a8", marginBottom: 20, lineHeight: 1.6 }}>
              このノードと子ノードをすべて削除します。<br />この操作は元に戻せません。
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDialog(null)} style={{
                padding: "7px 16px", borderRadius: 6, cursor: "pointer",
                background: "none", border: "1px solid #2a3a52", color: "#7a90a8",
                fontSize: 12, fontFamily: "monospace",
              }}>キャンセル</button>
              <button onClick={() => execDelete(confirmDialog.nodeId)} style={{
                padding: "7px 16px", borderRadius: 6, cursor: "pointer",
                background: "#ef444422", border: "1px solid #ef4444", color: "#ef4444",
                fontSize: 12, fontFamily: "monospace", fontWeight: 700,
              }}>削除する</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function SettingSec({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, borderBottom: "1px solid #1e2d40", paddingBottom: 4, fontWeight: 700 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#4a9eff", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 8, color: "#2a3a52", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

function FAB({ color, onClick, children, size = 44 }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: size / 2,
      background: `${color}22`, border: `2px solid ${color}`,
      color, fontSize: size > 40 ? 14 : 20, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 4px 16px ${color}44`,
      fontFamily: "monospace", fontWeight: 700,
    }}>{children}</button>
  );
}
