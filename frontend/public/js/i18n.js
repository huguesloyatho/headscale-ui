/**
 * Internationalization (i18n) Module
 * Supports: French, English, Spanish, Japanese, Chinese
 */

const translations = {
  fr: {
    // Navigation
    'nav.nodes': 'Noeuds',
    'nav.routes': 'Routes',
    'nav.users': 'Utilisateurs',
    'nav.apikeys': 'Clés API',
    'nav.policy': 'Policy',
    'nav.info': 'Infos',
    'nav.settings': 'Paramètres',

    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.test': 'Tester',
    'common.apply': 'Appliquer',
    'common.reset': 'Réinitialiser',
    'common.confirm': 'Confirmer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.warning': 'Avertissement',
    'common.info': 'Information',

    // Settings
    'settings.title': 'Paramètres',
    'settings.headscale.title': 'Configuration Headscale',
    'settings.headscale.url': 'URL de Headscale',
    'settings.headscale.apikey': 'Clé API',
    'settings.headscale.test': 'Tester la connexion',
    'settings.headscale.save': 'Enregistrer',
    'settings.preferences.title': 'Préférences',
    'settings.preferences.language': 'Langue',
    'settings.preferences.theme': 'Thème',
    'settings.preferences.logo': 'Logo personnalisé',
    'settings.preferences.logo.upload': 'Télécharger un logo',
    'settings.preferences.logo.remove': 'Supprimer le logo',
    'settings.preferences.logo.max': 'Taille maximale : 1 MB',

    // Themes
    'theme.dark': 'Sombre',
    'theme.light': 'Clair',
    'theme.green': 'Écolo',

    // Languages
    'lang.fr': 'Français',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.ja': '日本語',
    'lang.zh': '中文',

    // Nodes
    'nodes.title': 'Noeuds',
    'nodes.id': 'ID',
    'nodes.name': 'Nom',
    'nodes.user': 'Utilisateur',
    'nodes.ip': 'Adresse IP',
    'nodes.status': 'Statut',
    'nodes.online': 'En ligne',
    'nodes.offline': 'Hors ligne',
    'nodes.lastSeen': 'Vu pour la dernière fois',
    'nodes.tags': 'Tags',
    'nodes.routes': 'Routes',
    'nodes.delete.confirm': 'Supprimer ce noeud ?',

    // Routes
    'routes.title': 'Routes',
    'routes.advertised': 'Annoncées',
    'routes.enabled': 'Activées',
    'routes.node': 'Noeud',

    // Users
    'users.title': 'Utilisateurs',
    'users.name': 'Nom',
    'users.email': 'Email',
    'users.created': 'Créé le',
    'users.add': 'Ajouter un utilisateur',

    // API Keys
    'apikeys.title': 'Clés API',
    'apikeys.prefix': 'Préfixe',
    'apikeys.created': 'Créée le',
    'apikeys.expires': 'Expire le',
    'apikeys.expired': 'Expirée',

    // Policy
    'policy.title': 'Policy ACL',
    'policy.load': 'Charger la policy actuelle',
    'policy.save': 'Sauvegarder',
    'policy.format': 'Formater',

    // Info
    'info.title': 'Informations',
    'info.system.status': 'État du système',
    'info.system.healthy': 'Opérationnel',
    'info.system.unhealthy': 'Hors ligne',
    'info.version': 'Version Headscale',
    'info.stats': 'Statistiques',
    'info.stats.nodes': 'Noeuds',
    'info.stats.online': 'En ligne',
    'info.stats.users': 'Utilisateurs',
    'info.stats.routes': 'Routes',
    'info.actions': 'Actions rapides',
    'info.docs': 'Documentation',
  },

  en: {
    // Navigation
    'nav.nodes': 'Nodes',
    'nav.routes': 'Routes',
    'nav.users': 'Users',
    'nav.apikeys': 'API Keys',
    'nav.policy': 'Policy',
    'nav.info': 'Info',
    'nav.settings': 'Settings',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.test': 'Test',
    'common.apply': 'Apply',
    'common.reset': 'Reset',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',

    // Settings
    'settings.title': 'Settings',
    'settings.headscale.title': 'Headscale Configuration',
    'settings.headscale.url': 'Headscale URL',
    'settings.headscale.apikey': 'API Key',
    'settings.headscale.test': 'Test connection',
    'settings.headscale.save': 'Save',
    'settings.preferences.title': 'Preferences',
    'settings.preferences.language': 'Language',
    'settings.preferences.theme': 'Theme',
    'settings.preferences.logo': 'Custom logo',
    'settings.preferences.logo.upload': 'Upload logo',
    'settings.preferences.logo.remove': 'Remove logo',
    'settings.preferences.logo.max': 'Maximum size: 1 MB',

    // Themes
    'theme.dark': 'Dark',
    'theme.light': 'Light',
    'theme.green': 'Green',

    // Languages
    'lang.fr': 'Français',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.ja': '日本語',
    'lang.zh': '中文',

    // Nodes
    'nodes.title': 'Nodes',
    'nodes.id': 'ID',
    'nodes.name': 'Name',
    'nodes.user': 'User',
    'nodes.ip': 'IP Address',
    'nodes.status': 'Status',
    'nodes.online': 'Online',
    'nodes.offline': 'Offline',
    'nodes.lastSeen': 'Last seen',
    'nodes.tags': 'Tags',
    'nodes.routes': 'Routes',
    'nodes.delete.confirm': 'Delete this node?',

    // Routes
    'routes.title': 'Routes',
    'routes.advertised': 'Advertised',
    'routes.enabled': 'Enabled',
    'routes.node': 'Node',

    // Users
    'users.title': 'Users',
    'users.name': 'Name',
    'users.email': 'Email',
    'users.created': 'Created',
    'users.add': 'Add user',

    // API Keys
    'apikeys.title': 'API Keys',
    'apikeys.prefix': 'Prefix',
    'apikeys.created': 'Created',
    'apikeys.expires': 'Expires',
    'apikeys.expired': 'Expired',

    // Policy
    'policy.title': 'ACL Policy',
    'policy.load': 'Load current policy',
    'policy.save': 'Save',
    'policy.format': 'Format',

    // Info
    'info.title': 'Information',
    'info.system.status': 'System status',
    'info.system.healthy': 'Operational',
    'info.system.unhealthy': 'Offline',
    'info.version': 'Headscale version',
    'info.stats': 'Statistics',
    'info.stats.nodes': 'Nodes',
    'info.stats.online': 'Online',
    'info.stats.users': 'Users',
    'info.stats.routes': 'Routes',
    'info.actions': 'Quick actions',
    'info.docs': 'Documentation',
  },

  es: {
    // Navigation
    'nav.nodes': 'Nodos',
    'nav.routes': 'Rutas',
    'nav.users': 'Usuarios',
    'nav.apikeys': 'Claves API',
    'nav.policy': 'Política',
    'nav.info': 'Info',
    'nav.settings': 'Ajustes',

    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Añadir',
    'common.test': 'Probar',
    'common.apply': 'Aplicar',
    'common.reset': 'Restablecer',
    'common.confirm': 'Confirmar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.warning': 'Advertencia',
    'common.info': 'Información',

    // Settings
    'settings.title': 'Ajustes',
    'settings.headscale.title': 'Configuración de Headscale',
    'settings.headscale.url': 'URL de Headscale',
    'settings.headscale.apikey': 'Clave API',
    'settings.headscale.test': 'Probar conexión',
    'settings.headscale.save': 'Guardar',
    'settings.preferences.title': 'Preferencias',
    'settings.preferences.language': 'Idioma',
    'settings.preferences.theme': 'Tema',
    'settings.preferences.logo': 'Logotipo personalizado',
    'settings.preferences.logo.upload': 'Subir logotipo',
    'settings.preferences.logo.remove': 'Eliminar logotipo',
    'settings.preferences.logo.max': 'Tamaño máximo: 1 MB',

    // Themes
    'theme.dark': 'Oscuro',
    'theme.light': 'Claro',
    'theme.green': 'Verde',

    // Languages
    'lang.fr': 'Français',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.ja': '日本語',
    'lang.zh': '中文',

    // Nodes
    'nodes.title': 'Nodos',
    'nodes.id': 'ID',
    'nodes.name': 'Nombre',
    'nodes.user': 'Usuario',
    'nodes.ip': 'Dirección IP',
    'nodes.status': 'Estado',
    'nodes.online': 'En línea',
    'nodes.offline': 'Desconectado',
    'nodes.lastSeen': 'Visto por última vez',
    'nodes.tags': 'Etiquetas',
    'nodes.routes': 'Rutas',
    'nodes.delete.confirm': '¿Eliminar este nodo?',

    // Routes
    'routes.title': 'Rutas',
    'routes.advertised': 'Anunciadas',
    'routes.enabled': 'Habilitadas',
    'routes.node': 'Nodo',

    // Users
    'users.title': 'Usuarios',
    'users.name': 'Nombre',
    'users.email': 'Correo',
    'users.created': 'Creado',
    'users.add': 'Añadir usuario',

    // API Keys
    'apikeys.title': 'Claves API',
    'apikeys.prefix': 'Prefijo',
    'apikeys.created': 'Creada',
    'apikeys.expires': 'Expira',
    'apikeys.expired': 'Expirada',

    // Policy
    'policy.title': 'Política ACL',
    'policy.load': 'Cargar política actual',
    'policy.save': 'Guardar',
    'policy.format': 'Formatear',

    // Info
    'info.title': 'Información',
    'info.system.status': 'Estado del sistema',
    'info.system.healthy': 'Operativo',
    'info.system.unhealthy': 'Fuera de línea',
    'info.version': 'Versión de Headscale',
    'info.stats': 'Estadísticas',
    'info.stats.nodes': 'Nodos',
    'info.stats.online': 'En línea',
    'info.stats.users': 'Usuarios',
    'info.stats.routes': 'Rutas',
    'info.actions': 'Acciones rápidas',
    'info.docs': 'Documentación',
  },

  ja: {
    // Navigation
    'nav.nodes': 'ノード',
    'nav.routes': 'ルート',
    'nav.users': 'ユーザー',
    'nav.apikeys': 'APIキー',
    'nav.policy': 'ポリシー',
    'nav.info': '情報',
    'nav.settings': '設定',

    // Common
    'common.loading': '読み込み中...',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.add': '追加',
    'common.test': 'テスト',
    'common.apply': '適用',
    'common.reset': 'リセット',
    'common.confirm': '確認',
    'common.yes': 'はい',
    'common.no': 'いいえ',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.warning': '警告',
    'common.info': '情報',

    // Settings
    'settings.title': '設定',
    'settings.headscale.title': 'Headscale設定',
    'settings.headscale.url': 'Headscale URL',
    'settings.headscale.apikey': 'APIキー',
    'settings.headscale.test': '接続テスト',
    'settings.headscale.save': '保存',
    'settings.preferences.title': '環境設定',
    'settings.preferences.language': '言語',
    'settings.preferences.theme': 'テーマ',
    'settings.preferences.logo': 'カスタムロゴ',
    'settings.preferences.logo.upload': 'ロゴをアップロード',
    'settings.preferences.logo.remove': 'ロゴを削除',
    'settings.preferences.logo.max': '最大サイズ：1 MB',

    // Themes
    'theme.dark': 'ダーク',
    'theme.light': 'ライト',
    'theme.green': 'グリーン',

    // Languages
    'lang.fr': 'Français',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.ja': '日本語',
    'lang.zh': '中文',

    // Nodes
    'nodes.title': 'ノード',
    'nodes.id': 'ID',
    'nodes.name': '名前',
    'nodes.user': 'ユーザー',
    'nodes.ip': 'IPアドレス',
    'nodes.status': 'ステータス',
    'nodes.online': 'オンライン',
    'nodes.offline': 'オフライン',
    'nodes.lastSeen': '最終確認',
    'nodes.tags': 'タグ',
    'nodes.routes': 'ルート',
    'nodes.delete.confirm': 'このノードを削除しますか？',

    // Routes
    'routes.title': 'ルート',
    'routes.advertised': 'アドバタイズ済み',
    'routes.enabled': '有効',
    'routes.node': 'ノード',

    // Users
    'users.title': 'ユーザー',
    'users.name': '名前',
    'users.email': 'メール',
    'users.created': '作成日',
    'users.add': 'ユーザーを追加',

    // API Keys
    'apikeys.title': 'APIキー',
    'apikeys.prefix': 'プレフィックス',
    'apikeys.created': '作成日',
    'apikeys.expires': '有効期限',
    'apikeys.expired': '期限切れ',

    // Policy
    'policy.title': 'ACLポリシー',
    'policy.load': '現在のポリシーを読み込む',
    'policy.save': '保存',
    'policy.format': 'フォーマット',

    // Info
    'info.title': '情報',
    'info.system.status': 'システムステータス',
    'info.system.healthy': '稼働中',
    'info.system.unhealthy': 'オフライン',
    'info.version': 'Headscaleバージョン',
    'info.stats': '統計',
    'info.stats.nodes': 'ノード',
    'info.stats.online': 'オンライン',
    'info.stats.users': 'ユーザー',
    'info.stats.routes': 'ルート',
    'info.actions': 'クイックアクション',
    'info.docs': 'ドキュメント',
  },

  zh: {
    // Navigation
    'nav.nodes': '节点',
    'nav.routes': '路由',
    'nav.users': '用户',
    'nav.apikeys': 'API密钥',
    'nav.policy': '策略',
    'nav.info': '信息',
    'nav.settings': '设置',

    // Common
    'common.loading': '加载中...',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.add': '添加',
    'common.test': '测试',
    'common.apply': '应用',
    'common.reset': '重置',
    'common.confirm': '确认',
    'common.yes': '是',
    'common.no': '否',
    'common.error': '错误',
    'common.success': '成功',
    'common.warning': '警告',
    'common.info': '信息',

    // Settings
    'settings.title': '设置',
    'settings.headscale.title': 'Headscale配置',
    'settings.headscale.url': 'Headscale网址',
    'settings.headscale.apikey': 'API密钥',
    'settings.headscale.test': '测试连接',
    'settings.headscale.save': '保存',
    'settings.preferences.title': '偏好设置',
    'settings.preferences.language': '语言',
    'settings.preferences.theme': '主题',
    'settings.preferences.logo': '自定义徽标',
    'settings.preferences.logo.upload': '上传徽标',
    'settings.preferences.logo.remove': '删除徽标',
    'settings.preferences.logo.max': '最大大小：1 MB',

    // Themes
    'theme.dark': '深色',
    'theme.light': '浅色',
    'theme.green': '绿色',

    // Languages
    'lang.fr': 'Français',
    'lang.en': 'English',
    'lang.es': 'Español',
    'lang.ja': '日本語',
    'lang.zh': '中文',

    // Nodes
    'nodes.title': '节点',
    'nodes.id': 'ID',
    'nodes.name': '名称',
    'nodes.user': '用户',
    'nodes.ip': 'IP地址',
    'nodes.status': '状态',
    'nodes.online': '在线',
    'nodes.offline': '离线',
    'nodes.lastSeen': '最后在线',
    'nodes.tags': '标签',
    'nodes.routes': '路由',
    'nodes.delete.confirm': '删除此节点？',

    // Routes
    'routes.title': '路由',
    'routes.advertised': '已通告',
    'routes.enabled': '已启用',
    'routes.node': '节点',

    // Users
    'users.title': '用户',
    'users.name': '名称',
    'users.email': '邮箱',
    'users.created': '创建日期',
    'users.add': '添加用户',

    // API Keys
    'apikeys.title': 'API密钥',
    'apikeys.prefix': '前缀',
    'apikeys.created': '创建日期',
    'apikeys.expires': '过期日期',
    'apikeys.expired': '已过期',

    // Policy
    'policy.title': 'ACL策略',
    'policy.load': '加载当前策略',
    'policy.save': '保存',
    'policy.format': '格式化',

    // Info
    'info.title': '信息',
    'info.system.status': '系统状态',
    'info.system.healthy': '运行中',
    'info.system.unhealthy': '离线',
    'info.version': 'Headscale版本',
    'info.stats': '统计',
    'info.stats.nodes': '节点',
    'info.stats.online': '在线',
    'info.stats.users': '用户',
    'info.stats.routes': '路由',
    'info.actions': '快速操作',
    'info.docs': '文档',
  },
};

// Current language (defaults to French)
let currentLanguage = 'fr';

/**
 * Get translation for a key
 * @param {string} key - Translation key (e.g. 'nav.nodes')
 * @param {string} fallback - Fallback text if key not found
 * @returns {string} Translated text
 */
function t(key, fallback = key) {
  const lang = translations[currentLanguage];
  if (!lang) return fallback;
  return lang[key] || fallback;
}

/**
 * Set current language
 * @param {string} lang - Language code (fr, en, es, ja, zh)
 */
function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    // Store in localStorage
    localStorage.setItem('language', lang);
    return true;
  }
  return false;
}

/**
 * Get current language
 * @returns {string} Current language code
 */
function getLanguage() {
  return currentLanguage;
}

/**
 * Initialize language from localStorage or browser
 */
function initLanguage() {
  // Try localStorage first
  const stored = localStorage.getItem('language');
  if (stored && translations[stored]) {
    currentLanguage = stored;
    return;
  }

  // Try browser language
  const browserLang = navigator.language.substring(0, 2);
  if (translations[browserLang]) {
    currentLanguage = browserLang;
    return;
  }

  // Default to French
  currentLanguage = 'fr';
}

/**
 * Translate all elements with data-i18n attribute
 */
function translatePage() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);

    // Update text content or placeholder
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      if (element.hasAttribute('placeholder')) {
        element.placeholder = translation;
      } else {
        element.value = translation;
      }
    } else {
      element.textContent = translation;
    }
  });
}

/**
 * Set language and translate page
 * @param {string} lang - Language code
 */
function setLanguageAndTranslate(lang) {
  if (setLanguage(lang)) {
    translatePage();
    return true;
  }
  return false;
}

// Initialize on load
initLanguage();

// Auto-translate when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', translatePage);
} else {
  translatePage();
}
