export default {
  route: {
    dashboard: '首页',

    stock: '股票',
    today: '日线行情',
    daily: '每日指标',
    basic: '基本信息',
    charts: '图表',
    line: 'K线图',
    close: 'K线对比图',
    strategy: '策略',
    dataset_list: '数据列表',
    strategy_list: '策略列表',
    create_strategy: '创建策略',
    edit_strategy: '编辑策略',
    stock_picking_list: '选股策略列表',
    create_stock_picking: '创建选股策略',
    edit_stock_picking: '编辑选股策略',
    strategy_result: '策略结果',
    strategy_compare: '策略对比',
    composition: '组合',
    composition_list: '组合列表',
    create_composition: '创建组合',
    edit_composition: '编辑组合',
    jupyter: 'Jupyter',
    user: '用户',

    documentation: '文档',
    guide: '引导页',
    permission: '权限测试页',
    rolePermission: '角色权限',
    pagePermission: '页面权限',
    directivePermission: '指令权限',
    icons: '图标',
    components: '组件',
    tinymce: '富文本编辑器',
    markdown: 'Markdown',
    jsonEditor: 'JSON 编辑器',
    dndList: '列表拖拽',
    splitPane: 'Splitpane',
    avatarUpload: '头像上传',
    dropzone: 'Dropzone',
    sticky: 'Sticky',
    countTo: 'Count To',
    componentMixin: '小组件',
    backToTop: '返回顶部',
    dragDialog: '拖拽 Dialog',
    dragSelect: '拖拽 Select',
    dragKanban: '可拖拽看板',
    keyboardChart: '键盘图表',
    lineChart: '折线图',
    mixChart: '混合图表',
    example: '综合实例',
    nested: '路由嵌套',
    menu1: '菜单1',
    'menu1-1': '菜单 1-1',
    'menu1-2': '菜单 1-2',
    'menu1-2-1': '菜单 1-2-1',
    'menu1-2-2': '菜单 1-2-2',
    'menu1-3': '菜单 1-3',
    menu2: '菜单 2',
    Table: 'Table',
    dynamicTable: '动态 Table',
    dragTable: '拖拽 Table',
    inlineEditTable: 'Table 内编辑',
    complexTable: '综合 Table',
    tab: 'Tab',
    form: '表单',
    createArticle: '创建文章',
    editArticle: '编辑文章',
    articleList: '文章列表',
    errorPages: '错误页面',
    page401: '401',
    page404: '404',
    errorLog: '错误日志',
    excel: 'Excel',
    exportExcel: '导出 Excel',
    selectExcel: '导出 已选择项',
    mergeHeader: '导出 多级表头',
    uploadExcel: '上传 Excel',
    zip: 'Zip',
    pdf: 'PDF',
    exportZip: 'Export Zip',
    theme: '换肤',
    clipboardDemo: 'Clipboard',
    i18n: '国际化',
    externalLink: '外链',
    profile: '个人中心'
  },
  navbar: {
    dashboard: '首页',
    github: '项目地址',
    logOut: '退出登录',
    profile: '个人中心',
    theme: '换肤',
    size: '布局大小'
  },
  login: {
    title: '系统登录',
    logIn: '登录',
    username: '账号',
    password: '密码',
    any: '随便填',
    thirdparty: '第三方登录',
    thirdpartyTips: '本地不能模拟，请结合自己业务进行模拟！！！'
  },
  documentation: {
    documentation: '文档',
    github: 'Github 地址'
  },
  permission: {
    addRole: '新增角色',
    editPermission: '编辑权限',
    roles: '你的权限',
    switchRoles: '切换权限',
    tips: '在某些情况下，不适合使用 v-permission。例如：Element-UI 的 el-tab 或 el-table-column 以及其它动态渲染 dom 的场景。你只能通过手动设置 v-if 来实现。',
    delete: '删除',
    confirm: '确定',
    cancel: '取消'
  },
  guide: {
    description: '引导页对于一些第一次进入项目的人很有用，你可以简单介绍下项目的功能。本 Demo 是基于',
    button: '打开引导'
  },
  components: {
    documentation: '文档',
    tinymceTips: '富文本是管理后台一个核心的功能，但同时又是一个有很多坑的地方。在选择富文本的过程中我也走了不少的弯路，市面上常见的富文本都基本用过了，最终权衡了一下选择了Tinymce。更详细的富文本比较和介绍见',
    dropzoneTips: '由于我司业务有特殊需求，而且要传七牛 所以没用第三方，选择了自己封装。代码非常的简单，具体代码你可以在这里看到 @/components/Dropzone',
    stickyTips: '当页面滚动到预设的位置会吸附在顶部',
    backToTopTips1: '页面滚动到指定位置会在右下角出现返回顶部按钮',
    backToTopTips2: '可自定义按钮的样式、show/hide、出现的高度、返回的位置 如需文字提示，可在外部使用Element的el-tooltip元素',
    imageUploadTips: '由于我在使用时它只有vue@1版本，而且和mockjs不兼容，所以自己改造了一下，如果大家要使用的话，优先还是使用官方版本。'
  },
  table: {
    dynamicTips1: '固定表头, 按照表头顺序排序',
    dynamicTips2: '不固定表头, 按照点击顺序排序',
    dragTips1: '默认顺序',
    dragTips2: '拖拽后顺序',
    title: '标题',
    importance: '重要性',
    type: '类型',
    remark: '点评',
    search: '搜索',
    add: '添加',
    export: '导出',
    reviewer: '审核人',
    id: '序号',
    date: '时间',
    author: '作者',
    readings: '阅读数',
    status: '状态',
    actions: '操作',
    edit: '编辑',
    publish: '发布',
    draft: '草稿',
    delete: '删除',
    cancel: '取 消',
    confirm: '确 定',

    hist_data: '日K线',
    company: {
      ts_code: 'TS代码',
      symbol: '股票代码',
      name: '股票名称',
      area: '所在地域',
      industry: '所属行业',
      fullname: '股票全称',
      enname: '英文全称',
      market: '市场类型 （主板/中小板/创业板）',
      exchange: '交易所代码',
      curr_type: '交易货币',
      list_status: '上市状态： L上市 D退市 P暂停上市',
      list_date: '上市日期',
      delist_date: '退市日期',
      is_hs: '是否沪深港通标的，N否 H沪股通 S深股通'
    },
    index: {
      ts_code: 'TS代码',
      name: '简称',
      fullname: '指数全称',
      market: '市场',
      publisher: '发布方',
      index_type: '指数风格',
      category: '指数类别',
      base_date: '基期',
      base_point: '基点',
      list_date: '发布日期',
      weight_rule: '加权方式',
      desc: '描述',
      exp_date: '终止日期'
    },

    daily_company: {
      ts_code: 'TS股票代码',
      name: '股票名称',
      trade_date: '交易日期',
      close: '当日收盘价',
      turnover_rate: '换手率（%）',
      turnover_rate_f: '换手率（自由流通股）',
      volume_ratio: '量比',
      pe: '市盈率（总市值/净利润）',
      pe_ttm: '市盈率（TTM）',
      pb: '市净率（总市值/净资产）',
      ps: '市销率',
      ps_ttm: '市销率（TTM）',
      total_share: '总股本（万股）',
      float_share: '流通股本（万股）',
      free_share: '自由流通股本（万）',
      total_mv: '总市值（万元）',
      circ_mv: '流通市值（万元）'
    },

    daily_index: {
      ts_code: 'TS代码',
      name: '简称',
      trade_date: '交易日期',
      total_mv: '当日总市值（元）',
      float_mv: '当日流通市值（万元）',
      total_share: '当日总股本（股）',
      float_share: '当日流通股本（股）',
      free_share: '当日自由流通股本（股）',
      turnover_rate: '换手率',
      turnover_rate_f: '换手率（基于自由流通股）',
      pe: '市盈率',
      pe_ttm: '市盈率（TTM）',
      pb: '市净率'
    },

    today_company: {
      ts_code: '股票代码',
      name: '股票名称',
      trade_date: '交易日期',
      open: '开盘价',
      high: '最高价',
      low: '最低价',
      close: '收盘价',
      pre_close: '昨收价',
      change: '涨跌额',
      pct_chg: '涨跌幅',
      vol: '成交量（手）',
      amount: '成交额（千元）'
    },

    today_index: {
      ts_code: 'TS指数代码',
      name: '简称',
      trade_date: '交易日',
      open: '开盘点位',
      high: '最高点位',
      low: '最低点位',
      close: '收盘点位',
      pre_close: '昨收盘点位',
      change: '涨跌额',
      pct_chg: '涨跌幅（%）',
      vol: '成交量（手）',
      amount: '成交额（千元）'
    }
  },
  example: {
    warning: '创建和编辑页面是不能被 keep-alive 缓存的，因为keep-alive 的 include 目前不支持根据路由来缓存，所以目前都是基于 component name 来进行缓存的。如果你想类似的实现缓存效果，可以使用 localStorage 等浏览器缓存方案。或者不要使用 keep-alive 的 include，直接缓存所有页面。详情见'
  },
  errorLog: {
    tips: '请点击右上角bug小图标',
    description: '现在的管理后台基本都是spa的形式了，它增强了用户体验，但同时也会增加页面出问题的可能性，可能一个小小的疏忽就导致整个页面的死锁。好在 Vue 官网提供了一个方法来捕获处理异常，你可以在其中进行错误处理或者异常上报。',
    documentation: '文档介绍'
  },
  excel: {
    export: '导出',
    selectedExport: '导出已选择项',
    placeholder: '请输入文件名(默认excel-list)'
  },
  zip: {
    export: '导出',
    placeholder: '请输入文件名(默认file)'
  },
  pdf: {
    tips: '这里使用   window.print() 来实现下载pdf的功能'
  },
  theme: {
    change: '换肤',
    documentation: '换肤文档',
    tips: 'Tips: 它区别于 navbar 上的 theme-pick, 是两种不同的换肤方法，各自有不同的应用场景，具体请参考文档。'
  },
  tagsView: {
    refresh: '刷新',
    close: '关闭',
    closeOthers: '关闭其它',
    closeAll: '关闭所有'
  },
  settings: {
    title: '系统布局配置',
    theme: '主题色',
    tagsView: '开启 Tags-View',
    fixedHeader: '固定 Header',
    sidebarLogo: '侧边栏 Logo'
  }
}
