
/* 全局常量 */
var CONT = {
	// 上页边距 px
	TOP_PADDING:20.5,

	// 左页边距 px
	LEFT_PADDING: 10.5,
	
	// 五线谱各线间距 px
	LINE_SPACE: 10,

	// 五线谱各行间距 px
	ROW_SPACE: 80,

	// 五线谱线颜色
	LINE_COLOR: 'black',

	// 五线谱一条线宽
	LINE_WIDTH: 1,

	// 拍间距（四分音符间距）
	// 拍间距 * 4(每小节4拍，共4个间隔) * 一行有几小节 + 谱号所距五线谱最左的距离 + 左页边距*2 = canvas宽
	TSG_SPACE: 56, 

	// 每行行首 谱号所距五线谱最左的距离
	CLEF_SPACE: 40,

	// G谱号 标志常量
	CLEF_G: 'G',

	// G谱号中心点距顶部 与 G谱号高度的比值
	CLEF_G_SPE: 0.64,

	// 单位音符是四分音符
	UNIT_NOTE: 4,

	// 符干高
	NOTEBODY_HEIGHT: 30,

	// 符头宽 
	NOTE_HEAD_WIDTH: 5,

	// 连接符尾 横线宽度
	NOTETAIL_LINKLINE_WIDTH: 3,

	// 符点距左边音符的距离
	DOT_LEFT: 10,

	// 符点半径
	DOT_R: 1.5,

	// 连体音符 单独横线符尾的水平长度
	NOTETAIL_SINGLE_LINE_LENGTH: 12,

	// 升调符号
	SHARP_KEY: '#',

	// 降调符号
	FLATS_KEY: 'b'
};

/* 路径 */
var SRC = {
	NOTE1: 'img/合适尺寸/全音符.png',
	NOTE2: 'img/合适尺寸/二分音符.png',
	NOTE4: 'img/合适尺寸/四分音符.png',
	NOTE8: 'img/合适尺寸/八分音符.png',
	CLEF_G: 'img/合适尺寸/G谱号.png',
	NOTE_HEAD: 'img/合适尺寸/四分音符头.png',
	NOTE_HEAD2: 'img/合适尺寸/二分音符头.png',
	NOTE8_TAIL: 'img/合适尺寸/八分音符尾1.png',
	SHARP: 'img/合适尺寸/升调.png',
	FLATS: 'img/合适尺寸/降调.png',
};

/* 解析code的正则 */
var REG = {
	SPL: { // 分隔的正则
		NOTE: /\//g,	// \ 	// 音符分隔
		UNIT: /\s+/g,	// 空格 // 音符单元的分隔，即同一时值上的一组音

	}
};