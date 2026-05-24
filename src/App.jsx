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
    // フェーズ
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
    phase_label:       "フェーズ",
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
    zone_main: "メインエリア",
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
    zone_main: "Main Area",
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
    zone_main: "主战区",
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
    zone_main: "메인 영역",
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
    zone_main: "Área Principal",
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
// ラベルはTRANSLATIONSから引く: t["tag_" + key]
const getTagLabel = (t, key) => t["tag_" + key] || key;

const ACTION_TYPES = [
  "turn_start","evolution","play","attack","effect",
  "security_check","move","opponent_action","end_turn",
];
const getActLabel = (t, v) => t["act_" + v] || v;

const PHASES = [
  "turn_start","active","draw","breeding","main","turn_end",
];

// ノードラベルを現在の言語に変換（「N手目」パターンを検出して変換）
const getNodeLabel = (label, t) => {
  if (!label) return label;
  if (label === "INITIAL_BOARD_PLACEHOLDER") return t.initial_board || "開始盤面";
  // 全言語の開始盤面ラベルを検出して変換
  const initialBoards = ["開始盤面", "Opening Board", "开局盘面", "시작 보드", "Tablero Inicial"];
  if (initialBoards.includes(label)) return t.initial_board || "開始盤面";
  // 「N手目」「Move N」「第N步」「N수」「Jugada N」のパターンを検出
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


// メインエリアの変化からラベルを自動生成
const generateLabel = (node, parentNode) => {
  if (!parentNode) return null;

  const parentMain     = parentNode.meta?.zones?.main     || [];
  const childMain      = node.meta?.zones?.main           || [];
  const parentBreeding = parentNode.meta?.zones?.breeding || [];
  const parentHand     = parentNode.meta?.zones?.hand     || [];
  const parentTrash    = parentNode.meta?.zones?.trash    || [];

  const events = [];

  for (const card of childMain) {
    if (parentMain.includes(card)) continue; // 変化なし

    // 「B（A）」形式のスタックチェック
    const stackMatch = card.match(/^(.+)（(.+)）$/);
    if (stackMatch) {
      const top   = stackMatch[1].trim();
      const under = stackMatch[2].trim();
      // 手札またはトラッシュからメインのカードに重ねた = 進化
      const fromHand  = parentHand.some(c => c === top || c.startsWith(top));
      const fromTrash = parentTrash.some(c => c === top || c.startsWith(top));
      if (fromHand || fromTrash) {
        events.push(`${under}→${top}進化`);
        continue;
      }
      // それ以外のスタック
      events.push(`${under}→${top}`);
      continue;
    }

    // 育成エリアから来た = 移動
    if (parentBreeding.some(c => c === card || c.startsWith(card))) {
      events.push(`${card}移動`);
      continue;
    }

    // それ以外 = 登場
    events.push(`${card}登場`);
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
    phase: "my",
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
      {/* 数値表示 */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span style={{ color, fontSize: 20, fontWeight: 900, fontFamily: "monospace" }}>
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <div style={{ position: "relative", height: 7, background: "#0f172a", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: "50%", top: 0, bottom: 0,
          width: `${Math.abs(value) / max * 50}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transform: value >= 0 ? "translateX(0)" : "translateX(-100%)",
        }} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#334155" }} />
      </div>
      {onChange && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => onChange(Math.max(-10, value - 1))} style={{
              width: 26, height: 26, background: "#0b1320", border: "1px solid #1a2535",
              borderRadius: 4, color: "#ef4444", cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>◀</button>
            <input type="range" min={-10} max={10} value={value}
              onChange={e => onChange(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: color, cursor: "pointer" }} />
            <button onClick={() => onChange(Math.min(10, value + 1))} style={{
              width: 26, height: 26, background: "#0b1320", border: "1px solid #1a2535",
              borderRadius: 4, color: "#4a9eff", cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>▶</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, color: "#334155" }}>{"相手←"}</span>
            <span style={{ fontSize: 9, color: "#334155" }}>{"→自分"}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// NODE CARD
// ============================================================
function BoardNodeCard({ node, parentNode, isSelected, onSelect, onAddChild, onDelete, onToggleCollapse, isDragging, t, blockActions, onBlockStart, onOpenPanel, settings }) {
  const tag = NODE_TAGS[node.meta.tag] || NODE_TAGS.normal;
  const isRoot = node.parentId === null;
  // node.meta.colorが未設定ならsettingsのデフォルトカラーを使う
  const effectiveColor = node.meta.color ?? (settings?.defaultNodeColor ?? null);
  const nodeColorDef = NODE_COLORS.find(c => c.value === effectiveColor) || NODE_COLORS[0];
  // 親ノードと比較して相手SECが減っているか
  const oppSecDiff = parentNode ? node.state.oppSecurity - parentNode.state.oppSecurity : 0;
  const oppSecDecreased = oppSecDiff < 0;

  // ノード本体のpointerDownで選択＋ブロック開始（clickより先に発火）
  const handleNodePointerDown = (e) => {
    if (!isSelected) {
      onBlockStart && onBlockStart();
      onSelect(node.id);
    } else {
      // 選択済みを再タップ → 選択解除
      onSelect(null);
    }
  };

  const handleAction = (fn) => (e) => {
    e.stopPropagation();
    if (typeof blockActions === 'function' ? blockActions() : blockActions) return;
    fn();
  };

  return (
    <div
      onPointerDown={e => { e.stopPropagation(); handleNodePointerDown(e); }}
      data-nodeid={node.id}
      style={{
        position: "absolute",
        left: node.position.x,
        top: node.position.y,
        width: NODE_W,
        boxSizing: "border-box",
        background: nodeColorDef.value
          ? `linear-gradient(160deg, ${nodeColorDef.value}, ${nodeColorDef.bg})`
          : `linear-gradient(160deg, #0f172a, #131f30)`,
        border: oppSecDecreased
            ? `1.5px solid #ef4444`
            : nodeColorDef.border
              ? `2px solid ${nodeColorDef.border}`
              : `1.5px solid ${isSelected ? "#ffffff" : "#243040"}`,
        outline: isSelected ? "4px solid #ffffff" : "none",
        outlineOffset: "1px",
        borderRadius: 10,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        boxShadow: isSelected
          ? `0 0 0 3px #ffffff88, 0 0 24px #ffffff44, 0 6px 24px #000a`
          : nodeColorDef.border && !oppSecDecreased
            ? `0 0 0 2px ${nodeColorDef.border}55, 0 0 16px ${nodeColorDef.border}33, 0 3px 12px #0008`
            : "0 3px 12px #0008",
        transition: isDragging ? "none" : "box-shadow 0.12s",
        fontFamily: "monospace",
        zIndex: isSelected ? 10 : 1,
        minWidth: 0,
      }}
    >
      {/* タグライン */}
      <div style={{ height: 3, background: oppSecDecreased ? "#ef4444" : nodeColorDef.border ?? tag.color, borderRadius: "8px 8px 0 0" }} />

      {/* 本体 */}
      <div style={{ padding: "7px 9px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: "#dde4f0", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
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
          {/* リソース表示（settings.visibleResourceKeys・resourceSize対応） */}
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
                {/* 1行目: SEC + ドロー */}
                {[...top, ...middle].length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    {renderRes([...top, ...middle])}
                  </div>
                )}
                {/* 2行目: 山札 + 捨札 */}
                {[...bottom, ...bottom2].length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    {renderRes([...bottom, ...bottom2])}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* ゾーン表示（showZones=trueなら全エリアを表示） */}
        {node.meta.showZones !== false && getZoneDefs(t).filter(({ key }) => {
          // hiddenZonesに入っていれば非表示
          if ((node.meta.hiddenZones || []).includes(key)) return false;
          // hiddenZonesに入っていなければ、settings.visibleZoneKeysで判定
          // ただしhiddenZonesで明示的に「表示中」にしている場合はsettingsより優先
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
                  : cards.map(card => {
                      const parentCards = parentNode?.meta?.zones?.[key] || [];
                      const isNew = !parentCards.includes(card);
                      return (
                        <span key={card} style={{
                          background: isNew ? `${color}40` : `${color}18`,
                          border: isNew ? `1.5px solid ${color}` : `1px solid ${color}55`,
                          borderRadius: 4, padding: "2px 6px",
                          fontSize: 10, color,
                          fontWeight: isNew ? 700 : 400,
                          boxShadow: isNew ? `0 0 4px ${color}66` : "none",
                          wordBreak: "break-all",
                        }}>{card}{isNew && <span style={{ fontSize: 8, marginLeft: 2, opacity: 0.8 }}>★</span>}</span>
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

      {/* アクションボタン（ノード右側に縦並び） */}
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
// 後方互換性のためデフォルトのZONE_DEFSも保持
const ZONE_DEFS = [
  { key: "hand",     label: "手札",         color: "#22c55e" },
  { key: "breeding", label: "育成エリア",   color: "#4a9eff" },
  { key: "main",     label: "メインエリア", color: "#f59e0b" },
  { key: "trash",    label: "トラッシュ",   color: "#94a3b8" },
  { key: "deck",     label: "山札",         color: "#a855f7" },
  { key: "security", label: "セキュリティ", color: "#ef4444" },
];

function ZoneEditor({ zones = {}, onChange, hiddenZones = [], onToggleHidden, parentZones, onPropagateUp, t = {}, settings = {}, moveTarget, setMoveTarget }) {
  const [inputs, setInputs] = useState({});
  const [editing, setEditing] = useState({});
  const [diffPreview, setDiffPreview] = useState({});
  const [dragOver, setDragOver] = useState(null);
  const dragRef = useRef(null);
  const [stackModal, setStackModal] = useState(null); // { card, targetCard, targetKey }
  const [stackTarget, setStackTarget] = useState(null);
  const [dupConfirm, setDupConfirm] = useState(null);
  const [addModal, setAddModal] = useState(null);
  const [addModalInput, setAddModalInput] = useState('');
  const addModalInputRef = useRef(null); // 入力欄の表示/非表示

  const addCard = (key, forcedVal) => {
    const val = forcedVal !== undefined ? forcedVal : (inputs[key] || "").trim();
    if (!val) return;
    const current = zones[key] || [];
    // 同名チェック（完全一致または番号付きのベース名が一致）
    const baseName = val.replace(/（\d+）$/, "");
    const hasSame = current.some(c => c === val || c.replace(/（\d+）$/, "") === baseName);
    if (hasSame && !current.some(c => c === val && forcedVal !== undefined)) {
      if (forcedVal !== undefined) {
        // モーダルからの呼び出し時も同名確認
        const nums = current
          .map(c => { const m = c.match(/^(.+)（(\d+)）$/); return m && m[1] === baseName ? parseInt(m[2]) : null; })
          .filter(n => n !== null);
        const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 2;
        const numbered = current.includes(val) ? `${baseName}（${nextNum}）` : val;
        setDupConfirm({ key, val, numbered });
        return;
      }
      // 番号付き候補を生成
      const nums = current
        .map(c => { const m = c.match(/^(.+)（(\d+)）$/); return m && m[1] === baseName ? parseInt(m[2]) : null; })
        .filter(n => n !== null);
      const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 2;
      const numbered = current.includes(val) ? `${baseName}（${nextNum}）` : val;
      setDupConfirm({ key, val, numbered });
      return;
    }
    onChange({ ...zones, [key]: [...current, val] });
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
  const showOnNode = true; // 常に表示

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* スタック選択モーダル */}
      {stackModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#000b", zIndex: 300,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => { if (stackModal?.zonesSnapshot) onChange(stackModal.zonesSnapshot); setStackModal(null); setMoveTarget({ mode: "move", fromKey: null, card: null }); }}
           onPointerDown={e => e.stopPropagation()}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1a28", border: "1px solid #4a9eff55",
            borderRadius: "12px 12px 0 0", padding: "16px 16px 32px",
            width: "100%", maxWidth: 480,
            display: "flex", flexDirection: "column", gap: 10,
            fontFamily: "monospace",
          }}>
            <div style={{ fontSize: 12, color: "#7a90a8", marginBottom: 4 }}>
              <span style={{ color: "#4a9eff", fontWeight: 700 }}>「{stackModal.card}」</span>
              {" "}{t.stack_label || "を"}{" "}
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>「{stackModal.targetCard}」</span>
              {" "}{t.stack_against || "に対して："}
            </div>
            {/* Aの上に重ねる */}
            <button onClick={() => {
              const { card, fromKey, targetCard, targetKey, zonesSnapshot } = stackModal;
              const newCard = `${card}（${targetCard}）`;
              const z = JSON.parse(JSON.stringify(zonesSnapshot));
              if (fromKey === targetKey) {
                z[fromKey] = (z[fromKey] || []).reduce((acc, c) => {
                  if (c === card) return acc;
                  acc.push(c === targetCard ? newCard : c);
                  return acc;
                }, []);
              } else {
                z[fromKey] = (z[fromKey] || []).filter(c => c !== card);
                z[targetKey] = (z[targetKey] || []).map(c => c === targetCard ? newCard : c);
              }
              onChange(z);
              setStackModal(null);
              setMoveTarget({ mode: "move", fromKey: null, card: null });
            }} style={{
              padding: "12px 0", borderRadius: 6, cursor: "pointer",
              background: "#4a9eff18", border: "1px solid #4a9eff66", color: "#4a9eff",
              fontSize: 13, fontWeight: 700,
            }}>「{stackModal.targetCard}」{t.stack_on_top || "の上に重ねる"} → {stackModal.card}（{stackModal.targetCard}）</button>
            {/* Aの下に重ねる */}
            <button onClick={() => {
              const { card, fromKey, targetCard, targetKey, zonesSnapshot } = stackModal;
              const newCard2 = `${targetCard}（${card}）`;
              const z = JSON.parse(JSON.stringify(zonesSnapshot));
              if (fromKey === targetKey) {
                z[fromKey] = (z[fromKey] || []).reduce((acc, c) => {
                  if (c === card) return acc;
                  acc.push(c === targetCard ? newCard2 : c);
                  return acc;
                }, []);
              } else {
                z[fromKey] = (z[fromKey] || []).filter(c => c !== card);
                z[targetKey] = (z[targetKey] || []).map(c => c === targetCard ? newCard2 : c);
              }
              onChange(z);
              setStackModal(null);
              setMoveTarget({ mode: "move", fromKey: null, card: null });
            }} style={{
              padding: "12px 0", borderRadius: 6, cursor: "pointer",
              background: "#a855f718", border: "1px solid #a855f766", color: "#a855f7",
              fontSize: 13, fontWeight: 700,
            }}>「{stackModal.targetCard}」{t.stack_on_bottom || "の下に重ねる"} → {stackModal.targetCard}（{stackModal.card}）</button>
            {/* 同じエリアに出す */}
            <button onClick={() => {
              const newZones = JSON.parse(JSON.stringify(zones));
              newZones[stackModal.fromKey] = (newZones[stackModal.fromKey] || []).filter(c => c !== stackModal.card);
              if (!newZones[stackModal.targetKey]) newZones[stackModal.targetKey] = [];
              newZones[stackModal.targetKey].push(stackModal.card);
              onChange(newZones);
              setStackModal(null);
              setMoveTarget({ mode: "move", fromKey: null, card: null });
            }} style={{
              padding: "12px 0", borderRadius: 6, cursor: "pointer",
              background: "#22c55e18", border: "1px solid #22c55e66", color: "#22c55e",
              fontSize: 13, fontWeight: 700,
            }}>{ t.same_area || "同じエリアにそのまま出す"}</button>
            <button onClick={() => {
              if (stackModal.zonesSnapshot) onChange(stackModal.zonesSnapshot);
              setStackModal(null);
              // 操作モードは継続（moveTargetは初期状態に戻すだけ）
              setMoveTarget({ mode: "move", fromKey: null, card: null });
            }} style={{
              padding: "8px 0", borderRadius: 6, cursor: "pointer",
              background: "none", border: "1px solid #2a3a52", color: "#4a6080",
              fontSize: 12,
            }}>{t.cancel || "キャンセル"}</button>
          </div>
        </div>
      )}

      {/* カード枚数バッジ */}
      {totalCards > 0 && (
        <span style={{
          background: "#4a9eff33", color: "#4a9eff",
          borderRadius: 10, padding: "1px 7px", fontSize: 10,
          fontFamily: "monospace", alignSelf: "flex-start",
        }}>{totalCards}</span>
      )}

      {/* 重複確認UI */}
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

      {/* 入力モーダル */}
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
            {/* エリア名 */}
            <div style={{ fontSize: 13, color: addModal.color, fontWeight: 700, fontFamily: "monospace" }}>
              {addModal.label}
            </div>
            {/* 登録済みカード一覧 */}
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
            {/* 入力欄 */}
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {zoneDefs.map(({ key, label, color }) => {
            const cards = zones[key] || [];
            const isHidden = hiddenZones.includes(key);
            return (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* エリアカード */}
                <div style={{
                  background: "#0b1320",
                  border: `1px solid ${moveTarget?.card && moveTarget.fromKey !== key ? color + "88" : isHidden ? "#1a2535" : color + "44"}`,
                  borderRadius: "8px 8px 0 0", padding: "6px 8px",
                  opacity: isHidden ? 0.4 : 1,
                  flex: 1, display: "flex", flexDirection: "column", gap: 4,
                  cursor: moveTarget?.card && moveTarget.fromKey !== key ? "pointer" : "default",
                  boxShadow: moveTarget?.card && moveTarget.fromKey !== key ? `0 0 8px ${color}44` : "none",
                }} onClick={() => {
                  if (stackModal) return;
                  if (moveTarget?.card && moveTarget.fromKey !== key) {
                    const newZones = JSON.parse(JSON.stringify(zones));
                    newZones[moveTarget.fromKey] = (newZones[moveTarget.fromKey] || []).filter(c => c !== moveTarget.card);
                    if (!newZones[key]) newZones[key] = [];
                    newZones[key] = [...newZones[key], moveTarget.card];
                    onChange(newZones);
                    setMoveTarget({ mode: "move", fromKey: null, card: null });
                  }
                }}>
                  {/* ヘッダー */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color, fontWeight: 800 }}>{label}</span>
                  </div>
                  {/* カード一覧 */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, minHeight: 20 }}>
                    {cards.length === 0
                      ? <span style={{ fontSize: 9, color: "#2a3a52", fontStyle: "italic" }}>{t.none_label || "なし"}</span>
                      : cards.map(card => {
                          const parentCards = parentZones?.[key] || [];
                          const isNew = !parentCards.includes(card);
                          const isMoving = moveTarget?.card === card && moveTarget?.fromKey === key;
                          return (
                            <span key={card} onClick={() => {
                              if (stackModal) return;
                              if (moveTarget?.mode === "move") {
                                if (moveTarget.card === null) {
                                  // 移動元を選択
                                  setMoveTarget({ mode: "move", fromKey: key, card });
                                } else if (!(moveTarget.card === card && moveTarget.fromKey === key)) {
                                  // 別のカードをタップ→スタック選択肢を表示（zonesスナップショットを保存）
                                  setStackModal({ card: moveTarget.card, fromKey: moveTarget.fromKey, targetCard: card, targetKey: key, zonesSnapshot: JSON.parse(JSON.stringify(zones)) });
                                }
                              }
                            }} style={{
                              background: isMoving ? `${color}66` : isNew ? `${color}40` : `${color}18`,
                              border: `1px solid ${isMoving ? color : isNew ? color : color + "55"}`,
                              borderRadius: 6, padding: "5px 8px",
                              fontSize: 11, color, fontWeight: isNew ? 700 : 400,
                              display: "flex", alignItems: "center", gap: 6,
                              overflow: "hidden",
                              cursor: moveTarget?.mode === "move" ? "pointer" : "default",
                              boxShadow: isMoving ? `0 0 6px ${color}88` : "none",
                            }}>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card}</span>
                              {!moveTarget && <button onClick={e => { e.stopPropagation(); removeCard(key, card); }} style={{
                                background: "none", border: "none", color: "#ef4444",
                                cursor: "pointer", fontSize: 13, padding: "0 2px", lineHeight: 1, flexShrink: 0,
                              }}>×</button>}
                            </span>
                          );
                        })
                    }
                  </div>
                </div>
                {/* 追加ボタン（下に配置） */}
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

    </div>
  );
}

// ============================================================
// DETAIL PANEL
// ============================================================
function NodeDetailPanel({ node, parentNode, onUpdate, onClose, onDelete, onAddChild, onPropagateUp, isMobile, t, blockActions, settings, onUpdateSettings }) {
  const [panelTab, setPanelTab] = React.useState('board');
  const [moveTarget, setMoveTarget] = React.useState(null);
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
    position: "fixed", bottom: 0, left: 0, right: 0,
    height: "85vh", background: "#080e1a",
    borderTop: `2px solid ${tag.color}`,
    borderRadius: "16px 16px 0 0",
    zIndex: 100, display: "flex", flexDirection: "column",
    boxShadow: "0 -8px 32px #000c",
  } : {
    width: 260, flexShrink: 0, background: "#080e1a",
    borderLeft: "1px solid #1a2535",
    display: "flex", flexDirection: "column",
  };

  return (
    <div style={panelStyle}>
      <div style={{
        padding: "10px 14px 8px",
        borderBottom: "1px solid #1a2535",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#0b1320", flexShrink: 0,
        borderRadius: isMobile ? "16px 16px 0 0" : 0,
      }}>
        {isMobile && (
          <div style={{
            position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)",
            width: 36, height: 4, background: "#2a3a52", borderRadius: 2,
          }} />
        )}
        {/* 左: 削除ボタン */}
        <div style={{ marginTop: isMobile ? 8 : 0, minWidth: 60, display: "flex", gap: 6 }}>
          {node.parentId && (
            <button onClick={guard(() => onDelete(node.id))} style={{
              background: "#ef444418", border: "1px solid #ef444466", color: "#ef4444",
              padding: "6px 10px", borderRadius: 4, cursor: "pointer",
              fontSize: 11, fontFamily: "monospace", fontWeight: 700,
              whiteSpace: "nowrap",
            }}>🗑 {t.delete_btn.replace("🗑 ", "")}</button>
          )}
        </div>
        {/* 中央: ノード名入力 */}
        <input
          value={getNodeLabel(node.meta.label, t)}
          onChange={e => update("meta.label", e.target.value)}
          placeholder={t.node_placeholder || "ノード名"}
          style={{
            flex: 1, marginTop: isMobile ? 8 : 0, marginLeft: 8, marginRight: 8,
            background: "none", border: "none", borderBottom: `1px solid ${tag.color}66`,
            color: tag.color, fontSize: 16, fontWeight: 700, fontFamily: "monospace",
            outline: "none", padding: "2px 4px", textAlign: "center",
          }}
        />
        {/* 右: +追加 + 閉じるボタン */}
        <div style={{ marginTop: isMobile ? 8 : 0, minWidth: 60, display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button onClick={guard(() => onAddChild(node.id))} style={{
            background: "#22c55e18", border: "1px solid #22c55e66", color: "#22c55e",
            padding: "6px 10px", borderRadius: 4, cursor: "pointer",
            fontSize: 11, fontFamily: "monospace", fontWeight: 700,
            whiteSpace: "nowrap",
          }}>+ 追加</button>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#7a90a8",
            cursor: "pointer", fontSize: 24, lineHeight: 1,
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
      </div>

      {/* タブバー */}
      <div style={{ display: "flex", borderBottom: "1px solid #1a2535", flexShrink: 0 }}>
        {[
          { key: "board",    label: t.zone_info    || "盤面" },
          { key: "resource", label: t.resource_label || "リソース" },
          { key: "node",     label: t.memo_label    || "メモ" },
        ].map(tb => (
          <button key={tb.key} onClick={() => setPanelTab(tb.key)} style={{
            flex: 1, padding: "10px 0", background: "none", border: "none",
            borderBottom: panelTab === tb.key ? "2px solid #4a9eff" : "2px solid transparent",
            color: panelTab === tb.key ? "#4a9eff" : "#4a5568",
            fontSize: 11, fontFamily: "monospace", fontWeight: 700, cursor: "pointer",
          }}>{tb.label}</button>
        ))}
      </div>

      {/* 操作モードボタン（盤面タブ時のみ固定表示） */}
      {panelTab === 'board' && (
        <div style={{
          padding: "6px 14px 0", flexShrink: 0,
          background: "#080e1a",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 10, color: "#4a9eff", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, fontFamily: "monospace" }}>{t.zone_info || "盤面情報"}</span>
          <button onClick={() => setMoveTarget(moveTarget ? null : { mode: "move", fromKey: null, card: null })} style={{
            background: moveTarget ? "#f59e0b22" : "none",
            border: `1px solid ${moveTarget ? "#f59e0b" : "#2a3a52"}`,
            color: moveTarget ? "#f59e0b" : "#4a6080",
            borderRadius: 5, padding: "5px 12px", cursor: "pointer",
            fontSize: 11, fontFamily: "monospace", fontWeight: 700,
          }}>{moveTarget ? (t.op_mode_exit || "✕操作モード") : (t.op_mode || "操作モード")}</button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 14, fontFamily: "monospace", touchAction: "pan-y" }}>

        {/* 盤面タブ */}
        {panelTab === 'board' && <>

        {/* 自動生成ボタン */}
        {parentNode && (() => {
          const generated = generateLabel(node, parentNode);
          return generated ? (
            <button onClick={guard(() => update("meta.label", generated))} style={{
              width: "100%", padding: "7px 0", borderRadius: 5, cursor: "pointer",
              background: "#f59e0b18", border: "1px solid #f59e0b44", color: "#f59e0b",
              fontSize: 11, fontFamily: "monospace", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <span>✨</span>
              <span>{generated}</span>
            </button>
          ) : null;
        })()}

        </>
        }

        {/* リソースタブ */}
        {panelTab === 'resource' && <>

        <Sec title={t.resource_label}>
          {/* メモリーゲージ */}
          <Lbl>{t.memory_label}</Lbl>
          <MemoryGauge value={node.state.memory} onChange={v => update("state.memory", v)} t={t} />
          <div style={{ marginTop: 10 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { label: t.my_sec,                                    path: "state.mySecurity", defKey: "defaultMySecurity", min: 0 },
              { label: t.opp_sec,                                   path: "state.oppSecurity",defKey: "defaultOppSecurity",min: 0 },
              { label: t.my_hand_label || t.draw_label || "自ドロー", path: "state.myHand",   defKey: "defaultMyHand",     min: 0 },
              { label: t.opp_hand_label || "相ドロー",               path: "state.oppHand",  defKey: "defaultOppHand",    min: 0 },
              { label: t.my_deck_label  || "自山",                   path: "state.myDeck",   defKey: "defaultMyDeck",     min: 0 },
              { label: t.opp_deck_label || "相山",                   path: "state.oppDeck",  defKey: "defaultOppDeck",    min: 0 },
              { label: t.my_trash_label  || "自捨札",                path: "state.myTrash",  defKey: "defaultMyTrash",    min: 0 },
              { label: t.opp_trash_label || "相捨札",                path: "state.oppTrash", defKey: "defaultOppTrash",   min: 0 },
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
          {/* デフォルトに戻す / 親を引き継ぐ */}
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

        {/* 盤面タブ（続き） */}
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
              // 「表示中」にした場合、settings.visibleZoneKeysにも追加
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

        {/* ノードタブ */}
        {panelTab === 'node' && <>

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
  // iOS自動ズーム防止
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
  const [globalShowZones, setGlobalShowZones] = useState(null); // null=各ノード設定, true=全表示, false=全非表示
  const [saveModal, setSaveModal] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [overwriteConfirm, setOverwriteConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }
  const [loadConfirm, setLoadConfirm] = useState(null); // { id, name, tree }
  const [newTreeConfirm, setNewTreeConfirm] = useState(false);
  const [insertMode, setInsertMode] = useState(null); // null | { firstId } | 'selecting'
  const [saveListOpen, setSaveListOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('display');

  // グローバル設定
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
  const [savedTrees, setSavedTrees] = useState([]); // {id, name, tree, savedAt}[]

  // 保存済みツリー一覧をIDB→localStorageの順で読み込む
  useEffect(() => {
    idbGet('digitree_saved_trees').then(saved => {
      if (Array.isArray(saved) && saved.length > 0) {
        setSavedTrees(saved);
        // IDBから読めたらlocalStorageにもバックアップ
        idbSet('digitree_saved_trees_bak', saved).catch(() => {});
      } else {
        // IDBにない場合はlocalStorageのバックアップを使う
        try {
          const bak = localStorage.getItem('digitree_saved_trees_bak');
          if (bak) {
            const parsed = JSON.parse(bak);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSavedTrees(parsed);
              // 復元したデータをIDBにも書き戻す
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

  // IndexedDB からデータを読み込む（起動時）
  useEffect(() => {
    idbGet('digitree_tree').then(saved => {
      if (saved && saved.nodes && saved.rootNodeId) {
        setTree(saved);
        idbSet('digitree_tree_bak', saved).catch(() => {});
      } else {
        // IDB→localStorageバックアップ→通常localStorageの順で試みる
        const sources = ['digitree_tree_bak', 'digitree_tree'];
        let restored = false;
        for (const key of sources) {
          try {
            const ls = localStorage.getItem(key);
            if (ls) {
              const parsed = JSON.parse(ls);
              if (parsed && parsed.nodes && parsed.rootNodeId) {
                setTree(parsed);
                idbSet('digitree_tree', parsed).catch(() => {});
                restored = true;
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
            if (parsed && parsed.nodes && parsed.rootNodeId) { setTree(parsed); break; }
          }
        } catch {}
      }
      setDbLoaded(true);
    });
  }, []);
  const [selectedId, setSelectedId] = useState(null);
  const blockActionsRef = useRef(false);
  const blockTimerRef = useRef(null);
  const historyRef = useRef([]); // アンドゥ用スタック（最大30件）

  // 選択変更時に一定時間ボタン操作をブロック

  // アンドゥ対応のsetTree
  const setTreeWithHistory = useCallback((updater) => {
    setTree(prev => {
      // 現在の状態をスタックに積む
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
    setSelectedId(null);
  }, []);

  // 全ノードのshowZonesを一括変更
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

  // 自動保存
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

  // ---- 操作 ----
  // 指定ノードの子孫全体の最大Y座標を返す
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

  // 指定X座標付近で使われていないY座標を返す
  // ノードの推定高さを計算（表示中ゾーン数に応じて）
  const estimateNodeHeight = useCallback((node) => {
    const baseH = 160; // ヘッダー+メモリー+リソース
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


  // 2ノード間に割り込みノードを挿入
  const insertBetween = useCallback((parentId, childId) => {
    const parent = nodes[parentId];
    const child = nodes[childId];
    if (!parent || !child) return;

    // childId以降の全子孫turnを+1
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

      // 子孫turnを+1・X座標を+TURN_GAP
      descendants.forEach(id => {
        if (ns[id]) {
          ns[id].state.turn += 1;
          ns[id].position.x += TURN_GAP;
        }
      });

      // 新ノード：親の情報を引き継ぎ
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

      // childの親をnewNodeに変更
      ns[childId].parentId = newNode.id;

      // parentの子のchildIdをnewNode.idに置き換え
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

    // 親の子孫最大Yを起点に、全ノードと重ならない位置を探す
    const baseY = parent.children.length === 0
      ? parent.position.y
      : getSubtreeMaxY(parentId, nodes) + BRANCH_GAP;

    const targetX = (turn - 1) * TURN_GAP + 40;
    const offsetY = findFreeY(targetX, baseY, nodes);
    const n = makeNode(parentId, turn, offsetY, { type: "play", description: "" });
    // 親の全stateを引き継ぎ（turnのみ更新）
    n.state = { ...parent.state, turn }; // 親引き継ぎ（設定のデフォルト値は新規ルートノード作成時のみ使用）
    // 親のメタ情報を引き継ぎ（ラベル・タグ・メモ）
    n.meta = {
      ...parent.meta,
      label: turnIncrement === 0 ? parent.meta.label : t.canvas_axis(turn),
      isCollapsed: false,
      // カラーは親がnull（デフォルト）なら設定のデフォルトカラーを使う、親に色があれば引き継ぐ
      color: parent.meta.color ?? (settings?.defaultNodeColor ?? null),
    };
    // 親の行動情報をベースに引き継ぎ（説明はリセット）
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
  }, [nodes, turnIncrement, getSubtreeMaxY, findFreeY, settings, estimateNodeHeight, t]);
  // ノードを自動整列（縦横両方）
  const autoLayout = useCallback(() => {
    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    const root = tree.rootNodeId;
    if (!nodesCopy[root]) return;

    const PAD = 24; // ノード間の余白

    // DOMから実際の高さを取得（ズーム補正あり）
    const getH = (nodeId) => {
      const el = document.querySelector(`[data-nodeid="${nodeId}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        // ズームで拡縮されているので実際のcanvas上の高さに戻す
        const zoom = viewport.zoom || 1;
        return Math.ceil(rect.height / zoom);
      }
      return estimateNodeHeight(nodesCopy[nodeId]);
    };

    // 1パス目: 深さでX確定
    const setDepth = (nodeId, depth) => {
      const n = nodesCopy[nodeId];
      if (!n) return;
      n.position.x = depth * TURN_GAP + 40;
      n.children.forEach(c => setDepth(c, depth + 1));
    };
    setDepth(root, 0);

    // 全配置済みノードのY範囲を管理して完全衝突防止
    const placed = []; // { x, y, h }

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

    // 2パス目: DFSでY確定
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

  // 指定エリアのカードを1番上流まで全祖先に伝播
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

  // ---- ドラッグ ----
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
    // ボタン等のインタラクティブ要素へのタッチはブラウザに委ねる
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
      // ピンチズーム処理
      const t0 = e.touches[0], t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const p = pinchRef.current;
      const scale = dist / p.dist;
      const newZoom = Math.min(2, Math.max(0.25, p.zoom * scale));
      // ピンチ中心を基準にパン補正
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

  // ---- キーボード ----
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "Escape") { setSelectedId(null); setPanelOpen(false); }
      if (e.key === "Delete" && selectedId) deleteNode(selectedId);
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedId) { e.preventDefault(); /* duplicate removed */ }
      if (e.key === "Enter" && selectedId) addChild(selectedId);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selectedId, deleteNode, addChild, undo]);

  const canvasSize = useMemo(() => {
    const vals = Object.values(nodes);
    return {
      w: Math.max(800, ...vals.map(n => n.position.x + NODE_W + 160)),
      h: Math.max(600, ...vals.map(n => n.position.y + NODE_H + 120)),
    };
  }, [nodes]);

  const nodeCount = Object.keys(nodes).length;

  // タッチイベントをnon-passiveで登録（preventDefault有効化）
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

  // ---- モバイルFAB追加ボタン ----
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
        {/* 上段: ロゴ・統計・主要ボタン */}
        <div style={{
          height: 44, display: "flex", alignItems: "center", padding: "0 10px", gap: 8, minWidth: 0,
        }}>
          {/* ロゴ */}
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

          {/* ツリー名（タップで編集） */}
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

          {/* 統計 */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Stat label={t.node_count_label || "N"} value={nodeCount} />
            <Stat label={t.stat_move} value={t.move_suffix(maxTurn)} />
          </div>

          {/* 新規作成 */}
          <button onClick={() => setNewTreeConfirm(true)} style={{
            background: "#0f1a28", border: "1px solid #22c55e44", color: "#22c55e",
            width: 38, height: 38, borderRadius: 6, cursor: "pointer",
            fontSize: 12, fontFamily: "monospace", fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }} title={t.new_tree || "新規作成"}>{t.new_tree_short || "新規"}</button>

          {/* セーブリスト */}
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

          {/* アンドゥ */}
          <button onClick={undo} disabled={historyRef.current.length === 0} style={{
            background: "#0f1a28", border: "1px solid #1a2535",
            color: historyRef.current.length === 0 ? "#2a3a52" : "#7a90a8",
            width: 44, height: 44, borderRadius: 8,
            cursor: historyRef.current.length === 0 ? "default" : "pointer",
            fontSize: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }}>↩</button>

          {/* キャンバスリセット */}
          <button onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })} style={{
            background: "#0f1a28", border: "1px solid #1a2535", color: "#4a6080",
            width: 44, height: 44, borderRadius: 8, cursor: "pointer",
            fontSize: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }}>⌂</button>

          {/* 設定 */}
          <button onClick={() => setSettingsOpen(true)} style={{
            background: settingsOpen ? "#1a2535" : "#0f1a28",
            border: `1px solid ${settingsOpen ? "#4a9eff" : "#1a2535"}`,
            color: "#4a9eff",
            width: 44, height: 44, borderRadius: 8, cursor: "pointer",
            fontSize: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          }}>⚙</button>

        </div>
      </div>

      {/* ===== BODY ===== */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* CANVAS */}
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
          {/* グリッド */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"
                patternTransform={`translate(${viewport.x * viewport.zoom % 32},${viewport.y * viewport.zoom % 32}) scale(${viewport.zoom})`}>
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#0c1828" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* ターン軸ラベル */}
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

          {/* メインレイヤー */}
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
                  onSelect={selectNode}
                  onAddChild={addChild}
                  onDelete={deleteNode}
                  onToggleCollapse={toggleCollapse}
                  isDragging={draggingId === id}
                  t={t}
                  blockActions={() => blockActionsRef.current}
                  onOpenPanel={() => { setPanelOpen(true); }}
                  onBlockStart={() => {
                    blockActionsRef.current = true;
                    if (blockTimerRef.current) clearTimeout(blockTimerRef.current);
                    blockTimerRef.current = setTimeout(() => { blockActionsRef.current = false; }, 400);
                  }}
                />
              );
            })}
          </div>

          {/* 割込モードガイド */}
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

          {/* 右下ボタン群（整列・ズーム） */}
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

        {/* DETAIL PANEL — PC: サイドバー、モバイル: ボトムシート */}
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
          />
        )}
      </div>

      {/* モバイルボトムシート */}
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
        />
      )}


      {/* ===== 設定モーダル ===== */}
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
            {/* ヘッダー */}
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

              {/* タブ切替 */}
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
                    {/* タブバー */}
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

                      {/* 表示タブ */}
                      {tab === "display" && (<>
                        {/* リソース設定 */}
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

                      {/* 盤面タブ */}
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

                      {/* データタブ */}
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

                      {/* 外観タブ */}
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
                    {/* 読込 */}
                    <button onClick={() => setLoadConfirm({ id: entry.id, name: entry.name, tree: entry.tree })} style={{
                      background: "#22c55e22", border: "1px solid #22c55e55", color: "#22c55e",
                      borderRadius: 4, padding: "4px 8px", cursor: "pointer",
                      fontSize: 11, fontFamily: "monospace", fontWeight: 700, flexShrink: 0,
                    }}>読込</button>
                    {/* 上書き */}
                    <button onClick={() => setOverwriteConfirm({ id: entry.id, name: entry.name })} style={{
                      background: "#4a9eff22", border: "1px solid #4a9eff55", color: "#4a9eff",
                      borderRadius: 4, padding: "4px 8px", cursor: "pointer",
                      fontSize: 11, fontFamily: "monospace", fontWeight: 700, flexShrink: 0,
                    }}>上書き</button>
                    {/* 削除 */}
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

      {/* 名前をつけて保存モーダル */}
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
            {savedTrees.length > 0 && (
              <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 9, color: "#2a3a52", letterSpacing: 1, marginBottom: 2 }}>保存済み一覧（タップで読み込み）</div>
                {savedTrees.map(entry => (
                  <div key={entry.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#0b1320", border: "1px solid #1a2535", borderRadius: 5,
                    padding: "5px 10px",
                  }}>
                    <button onClick={() => {
                      historyRef.current = [...historyRef.current.slice(-29), tree];
                      setTree(entry.tree);
                      setSaveModal(false);
                    }} style={{
                      background: "none", border: "none", color: "#7a90a8",
                      cursor: "pointer", fontSize: 11, fontFamily: "monospace",
                      textAlign: "left", flex: 1,
                    }}>
                      <span style={{ color: "#dde4f0" }}>{entry.name}</span>
                      <span style={{ color: "#2a3a52", marginLeft: 8, fontSize: 9 }}>
                        {new Date(entry.savedAt).toLocaleDateString('ja')}
                      </span>
                    </button>
                    <button onClick={() => {
                      const next = savedTrees.filter(e => e.id !== entry.id);
                      setSavedTrees(next);
                      idbSet('digitree_saved_trees', next).catch(() => {});
                    }} style={{
                      background: "none", border: "none", color: "#2a3a52",
                      cursor: "pointer", fontSize: 12, padding: "0 4px",
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
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

      {/* 全データ消去確認モーダル */}
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
            <div style={{ fontSize: 15, color: "#dde4f0", fontWeight: 700 }}>
              {t.new_tree || "新規作成"}
            </div>
            <div style={{ fontSize: 12, color: "#7a90a8", lineHeight: 1.6 }}>
              {t.new_tree_confirm || "現在のツリーを破棄して新規作成しますか？"}
            </div>
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
            <div style={{ fontSize: 16, color: "#dde4f0", fontWeight: 700, marginBottom: 8 }}>
              全データを消去
            </div>
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

      {/* 削除確認モーダル */}
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
            <div style={{ fontSize: 16, color: "#dde4f0", marginBottom: 8, fontWeight: 700 }}>
              ノードを削除
            </div>
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
