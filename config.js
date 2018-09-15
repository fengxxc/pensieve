var paper = document.getElementById('musicPaper');
var paperWidth = paper.clientWidth;
// var paperWidth = 861;
var paperHeight = paper.clientHeight;
// var paperHeight = 600;

/* 全局常量 */
var CONT = {
	// canvas宽
	W: paperWidth,

	// canvas高
	H: paperHeight,

	// 上页边距 px
	TOP_PADDING:40.5,

	// 左页边距 px
	LEFT_PADDING: 10.5,
	
	// 五线谱各线间距 px
	LINE_SPACE: 10,

	// 五线谱各行间距 px
	// ROW_SPACE: 80,
	ROW_SPACE: function () {
		return this.LINE_SPACE * 4 * 2;
	},

	// 五线谱线颜色
	LINE_COLOR: 'black',

	// 五线谱一条线宽
	LINE_WIDTH: 1,

	// 每行行首 谱号 至 音符 的距离
	CLEF_SPACE: 40,

	// 拍间距（四分音符间距）
	// TSG_SPACE: 56, 
	TSG_SPACE: function () {
		// 左页边距 + 谱号至音符的距离 + 拍间距*4(每小节4拍，共4个间隔)*一行小节数 + 左页边距 = canvas宽
		return (this.W - this.LEFT_PADDING*2 - this.CLEF_SPACE)/4/4;
	},

	// G谱号 标志常量
	CLEF_G: 'G',
	
	// F谱号 标志常量
	CLEF_F: 'F',
	
	// C谱号 标志常量
	CLEF_C: 'C',

	// G谱号中心点距顶部 与 G谱号高度的比值
	CLEF_G_SPE: 0.64,

	// F谱号中心点距顶部 与 F谱号高度的比值
	CLEF_F_SPE: 0.857,

	// C谱号中心点距顶部 与 C谱号高度的比值
	CLEF_C_SPE: 0.769,

	// 单位音符是四分音符
	UNIT_NOTE: 4,

	// 符干高
	NOTEBODY_HEIGHT: 30,

	// 符头宽/2 
	NOTE_HEAD_WIDTH: 5,

	// 连接符尾 横线宽度
	NOTETAIL_LINKLINE_WIDTH: 3,

	// 符点距左边音符的距离
	DOT_LEFT: 10,

	// 符点半径
	DOT_R: 1.5,

	// 连体音符 单独横线符尾的水平长度
	NOTETAIL_SINGLE_LINE_LENGTH: 12.5,

	/* *
	 * G谱表音名与谱表位置的映射关系，如：C4就是c[4] 
	 * G谱表五线谱位置表示如下：(1间为1线+0.5，即1.5，以此类推)
	 * 5线 -----------5
	 * ......
	 * 2线 ---------2
	 * 1线 -------1
	 * 下加一线：0
	 * 下加二线：-1
	 */
	G_MA2SC: {
		//	  0		 1	    2	  3	    4	 5	  6	   7   8	
		'c': [null,  -10.5, -7,   -3.5, 0,  3.5, 7,   7,  10.5],
		'd': [null,  -10,   -6.5, -3,   0.5, 4,   7.5, 7.5	  ],
		'e': [null,  -9.5,  -6,   -2.5, 1,   4.5, 8,   8	  ],
		'f': [null,  -9,    -5.5, -2,   1.5, 5,   8.5, 8.5	  ],
		'g': [null,  -8.5,  -5,	  -1.5, 2,	 5.5, 9,   9	  ],
		'a': [-11.5, -8,	-4.5, -1,	2.5, 6,	  9.5, 9.5	  ],
		'b': [-11,	 -7.5,	-4,	  -0.5,	3,	 6.5, 10,  10	  ]
	}
};

/* 路径 */
var SRC = {
	NOTE1: 'img/合适尺寸/全音符.png',
	// NOTE2: 'img/合适尺寸/二分音符.png',
	// NOTE4: 'img/合适尺寸/四分音符.png',
	// NOTE8: 'img/合适尺寸/八分音符.png',
	CLEF_G: 'img/合适尺寸/G谱号.png',
	CLEF_C: 'img/合适尺寸/C谱号.png',
	CLEF_F: 'img/合适尺寸/F谱号.png',
	NOTE_HEAD: 'img/合适尺寸/四分音符头.png',
	NOTE_HEAD2: 'img/合适尺寸/二分音符头.png',
	NOTE8_TAIL: 'img/合适尺寸/八分音符尾1.png',
	NOTE8_TAIL_REV: 'img/合适尺寸/八分音符尾2.png',
	SHARP: 'img/合适尺寸/升调.png',
	FLATS: 'img/合适尺寸/降调.png',
};

/* key map */
var KEY_MAP = {
	split: { // 分隔的正则
		// 音符分隔
		note: /\//g, // '/' 	
		// 音组分隔符，即同一时值上的一组音
		note_group: /\s+/g,	// ' '

	},
	// 升音符
	sharp: '#',
	// 降音符
	flat: 'b'
};

