var paper = document.getElementById('musicPaper');
var ctx = paper.getContext('2d');
var paperWidth = paper.clientWidth;
// var paperWidth = 861;
var paperHeight = paper.clientHeight;
// var paperHeight = 600;

var inputTs = document.getElementById('inputTs');
var inputArea = document.getElementById('inputArea');

// ========================渲染方法 start======================
function parseAndRenderScore(s) {
	var qu = new Quill(ctx);
	// 当前行下加一线的y坐标，初始在第负一行
	var y_def = CONT.TOP_PADDING + CONT.LINE_SPACE*5;
	// 当前行x坐标，初始在第一行最左
	var x_cur = CONT.LEFT_PADDING;

	var timeBar = parseInt(s.timeSignature.split('/')[0]); // 每小节有几拍
	var timeBeat = parseInt(s.timeSignature.split('/')[1]); // 几分音符为一拍
	var notes = s.notes; // 乐谱正文

	/* 清画布 */
	ctx.clearRect(0, 0, paperWidth, paperHeight);

	/* 遍历每一个音符 */
	var tempBar = 0;  // 不足一小节就把拍数临时存到这里来，一拍加一，加到timeBar清零
	var tempHalf = 0; // 不足4分音符时长的时值，存到这里来 
	var tempXYFrs = []; // 不足4分音符时长的时值，[x, y, fr]
	for (var i = 0; i < notes.length; i++) {

		/* 第一个音符 或 一行超出 就换行并渲染五线谱 */
		if (i == 0 || x_cur > (paperWidth-CONT.LEFT_PADDING) ) {
			xyEnter();
		}
		
		var noteInfo = parseNoteGroupCode(notes[i]);
		/* 1. fr(fraction) 是几分音符（包括符点），根据开头数字判断，若无则为4分音符 */
		var fr = noteInfo.fraction;
		/* 2. stepLength: 1/时值长度 */
		var stepLength = noteInfo.stepLength;
		/* 3.ma(musical alphabet) 音名数组，采用西方现代音乐标准命名法 */
		var maGroup = noteInfo.musicalAlphabets;
		/* 4. 有符点吗？*/
		var hasPoint = noteInfo.hasPoint;
		/* 5. 升降 1 or -1 or 0 */
		var transp = noteInfo.transposition;

		// 加拍数
		tempBar += (stepLength * timeBeat); 

		/* 渲染一组最小单位块音符 */
		renderStep(x_cur, y_def, fr, stepLength, maGroup, hasPoint, transp);

		/* x右移距离，主要根据音符时值fr而定 */
		x_cur += CONT.TSG_SPACE * (stepLength * CONT.UNIT_NOTE);

		/* 如果一小节完毕，画小节线 */
		if (tempBar >= timeBar) {
			qu.drawBarLine(x_cur - CONT.TSG_SPACE/2, y_def - CONT.LINE_SPACE*5, CONT.LINE_WIDTH, CONT.LINE_COLOR);
			tempBar = 0;
		}

	}

	/* *
	 * 渲染一音符组
	 * @param x坐标，y坐标，是几分音符，1/时值长度，音符组音名（数组），是否有符点，升降
	 */
	function renderStep(x, y, fr, stepLength, maGroup, hasPoint, transp) {
		var maPlaceTop = null;
		var maPlaceBot = null;
		for (var i = 0; i < maGroup.length; i++) {
			var maPlace = getMaPlaceForG(maGroup[i]); // 在G谱表上的位置

			/* (〃'▽'〃) 要渲染音符了 */
			// 判断是否要加线
			if (maPlace <= 0 || 6 <= maPlace) {
				// lineCont 加多少条线
				var lineCont = maPlace <= 0? 0-Math.ceil(maPlace)+1 : maPlace-6+1;
				// firstPlace 加线的初始位置
				var firstPlace = maPlace <= 0? Math.ceil(maPlace) : 6;
				for (var l = 0; l < lineCont; l++, firstPlace++) 
					qu.drawline(x-CONT.TSG_SPACE/2, y-firstPlace*CONT.LINE_SPACE, CONT.TSG_SPACE, 1, CONT.LINE_SPACE, CONT.LINE_WIDTH, CONT.LINE_COLOR);
			}

			/* 1.画音符头 */
			qu.drawNoteHead(x, y-maPlace*CONT.LINE_SPACE, fr);

			/* 2.画升降符号 */
			if (transp)
				qu.drawTransp(x - CONT.NOTE_HEAD_WIDTH - 2, y-maPlace*CONT.LINE_SPACE, transp);
		
			/* 3.画符点 */
			if (hasPoint) 
				qu.drawPoint(x + CONT.DOT_LEFT, y-maPlace*CONT.LINE_SPACE, CONT.DOT_R, CONT.LINE_COLOR);
			
			// 这组音中最高音位置
			if (i == 0) {
				maPlaceTop = maPlaceBot = maPlace;
			} else {
				if (maPlace > maPlaceTop)
					maPlaceTop = maPlace;
				else if (maPlace < maPlaceBot)
					maPlaceBot = maPlace;
			}
			
		}


		/* 4.处理符干和符尾 */
		// 如果在画 时值 >= 单位音符（四分音符）的音符 之前仍有没画完符尾的音符，就画符尾
		if (stepLength >= 1/CONT.UNIT_NOTE) {
			if (tempXYFrs.length == 1) {
				// qu.drawNoteTails(tempXYFrs[0].x, tempXYFrs[0].yMin, tempXYFrs[0].fr);
				qu.drawNoteTailsAutoForward(tempXYFrs[0].x, tempXYFrs[0].baseY, tempXYFrs[0].yMin, tempXYFrs[0].fr);
			} else if (tempXYFrs.length > 1) {
				qu.drawStemTailLineAutoForward(tempXYFrs);
			}
			tempXYFrs = [];
			tempHalf = 0;
		}
		// 时值自增
		tempHalf += stepLength;
		var coordModel = {
			x: x, 
			baseY: y,
			yMax: getY(y, maPlaceBot),
			yMin: getY(y, maPlaceTop),
			fr: fr
		};
		tempXYFrs.push(coordModel);
		// 对于时值 < 单位音符时值（四分音符）的音符（如八分音符 ♫♪）
		// && 对于时值 >= 单位音符（四分音符）的音符
		// 画符尾连线
		if ( !(stepLength < 1/CONT.UNIT_NOTE && tempHalf != 1/CONT.UNIT_NOTE) ) {
			qu.drawStemTailLineAutoForward(tempXYFrs);
			tempXYFrs = [];
			tempHalf = 0;
		}

	}

	/* *
	 * 绘图坐标换行 并画下一行的五线谱
	 */
	function xyEnter() {
		y_def += CONT.ROW_SPACE;
		x_cur = CONT.LEFT_PADDING;
		qu.drawline(x_cur, y_def - CONT.LINE_SPACE*5, paperWidth-CONT.LEFT_PADDING*2, 5, CONT.LINE_SPACE, CONT.LINE_WIDTH, CONT.LINE_COLOR);
		// 画 行开头的竖线
		qu.drawBarLine(x_cur, y_def - CONT.LINE_SPACE*5, CONT.LINE_WIDTH, CONT.LINE_COLOR);
		x_cur += CONT.TSG_SPACE/2;
		// 画 谱号
		qu.drawClef(x_cur, y_def, CONT.CLEF_G, CONT.LINE_COLOR);
		x_cur += CONT.CLEF_SPACE;
	}
	
}

/* *
 * 根据音符代码 获得的是 “几分音符”、“在谱上的物理长度”、“音名”
 * @param  用户输入音符代码 如'4c6b'（4分音符c6降半调）
 * @return 返回音符信息，type is json
 * 如 {
 		fraction: 4, 
 		hasPoint: false, 
 		stepLength: 1/4, 
 		musicalAlphabet: 'c6',
 		transposition: -1
 	}
 */	
function parseNoteGroupCode(code) {
	var frArr = /^\d+\.?/.exec(code);
	var fr = frArr? frArr[0] : '4';
	var pt = (''+fr).search(/\./) > 0;
	var sl = getStepLengthByFr(fr);
	var mas = code.slice(frArr? frArr.index+frArr[0].length : 0);
	var tp =  code.match(new RegExp(KEY_MAP.sharp+'+$|'+KEY_MAP.flat+'+$')) || [null];
	var maArr = mas.split(KEY_MAP.split.note);
	return {
		fraction: fr, 		 // 几分音符 string
		hasPoint: pt,		 // 是否有符点 boolean
		stepLength: sl, 	 // 在谱上的物理时值长度 number
		musicalAlphabets: maArr, // 音名数组 array
		transposition: tp[0] // 移调，升调1，降调-1，无0	
	};
}
/* 
 * 根据几分音符 获得在谱上的物理时值长度
 */
function getStepLengthByFr(fr) {
	if ( (''+fr).search(/\./) > 0 ) {
		return 1/fr + 1/(fr*2);
	} else {
		return 1/fr;
	}
}
/* *
 * 根据音名 获得所在五线谱（G谱表）上的位置
 * G谱表五线谱位置表示如下：(1间为1线+0.5，即1.5，以此类推)
 * 5线 -----------5
 * ......
 * 2线 ---------2
 * 1线 -------1
 * 下加一线：0
 * 下加二线：-1
 */
function getMaPlaceForG(ma) { // 如：ma = 'f5#'

	// G谱表音名与谱表位置的映射关系，如：C4就是c[4]
	var g_ma2sc = {
		//	  0		 1	    2	  3	    4	 5	  6	   7   8	
		'c': [null,  -10.5, -7,   -3.5, 0,  3.5, 7,   7,  10.5],
		'd': [null,  -10,   -6.5, -3,   0.5, 4,   7.5, 7.5	  ],
		'e': [null,  -9.5,  -6,   -2.5, 1,   4.5, 8,   8	  ],
		'f': [null,  -9,    -5.5, -2,   1.5, 5,   8.5, 8.5	  ],
		'g': [null,  -8.5,  -5,	  -1.5, 2,	 5.5, 9,   9	  ],
		'a': [-11.5, -8,	-4.5, -1,	2.5, 6,	  9.5, 9.5	  ],
		'b': [-11,	 -7.5,	-4,	  -0.5,	3,	 6.5, 10,  10	  ]
	};

	var ma1 = ma.slice(0, 1); // 'f'
	var ma2 = parseInt( ma.slice(1).match(/^\d*/) ); // '5'
	if (!ma1 || ! ma2) return 3;
	return g_ma2sc[ma1][ma2]; // 5
}
/* *
 * 根据基准y坐标 和音符位置 获得音符y坐标
 * @param baseY 当前行下加一线的y坐标，初始在第负一行
 * @param maplace 在五线谱上的位置
 */
function getY(baseY, maplace) {
	return baseY - maplace*CONT.LINE_SPACE;
}

// ========================渲染方法 end========================

var img_objs = {
	note1: new Image(),
	// note2: new Image(),
	// note4: new Image(),
	// note8: new Image(),
	clefG: new Image(),
	noteHead: new Image(),
	noteHead2: new Image(),
	note8Tail: new Image(),
	note8TailRev: new Image(),
	sharp: new Image(),
	flats: new Image(),
};

/* *
 * 初始化音符图片
 */
function initImgs(callback) {
	var notes = [];

	img_objs.note1.src = SRC.NOTE1;
	notes.push(img_objs.note1);

	// img_objs.note2.src = SRC.NOTE2;
	// notes.push(img_objs.note2);

	// img_objs.note4.src = SRC.NOTE4;
	// notes.push(img_objs.note4);

	// img_objs.note8.src = SRC.NOTE8;
	// notes.push(img_objs.note8);

	img_objs.clefG.src = SRC.CLEF_G;
	notes.push(img_objs.clefG);

	img_objs.noteHead.src = SRC.NOTE_HEAD;
	notes.push(img_objs.noteHead);

	img_objs.noteHead2.src = SRC.NOTE_HEAD2;
	notes.push(img_objs.noteHead2);

	img_objs.note8Tail.src = SRC.NOTE8_TAIL;
	notes.push(img_objs.note8Tail);

	img_objs.note8TailRev.src = SRC.NOTE8_TAIL_REV;
	notes.push(img_objs.note8TailRev);

	img_objs.sharp.src = SRC.SHARP;
	notes.push(img_objs.sharp);

	img_objs.flats.src = SRC.FLATS;
	notes.push(img_objs.flats);

	loadImgs(notes, callback);
}

/* *
 * 异步加载图片
 * @param 图片对象数组，回调函数
 */
function loadImgs(imgs, callback) {
	var lodingImgs = [];
	for (var i = 0; i < imgs.length; i++) {
		if (!imgs[i].complete) {
			lodingImgs.push(imgs[i]);
		}
	}
	
	if (lodingImgs.length > 0) {
		setTimeout(function () { loadImgs(lodingImgs, callback); }, 10);
	} else {
		if (callback) callback();
	}
}

/* *
 * 渲染所有
 */
function render() {
	var score = {};
	score.timeSignature = inputTs.value;
	score.notes = parseInput(inputArea.value);
	parseAndRenderScore(score);
}

/* *
 * 处理用户输入的代码
 */
function parseInput(val) {
	// 去首尾空格、将音组（同一时值上的一组音）切分成数组
	// return val.replace(/^\s+|\s+$/g, '').split(REG.SPL.NOTE_GROUP) || [];
	return val.replace(/^\s+|\s+$/g, '').split(KEY_MAP.split.note_group) || [];
}

function main() {
	initImgs(function () {
		// 监听input事件
		inputArea.addEventListener('input', render);
		render();
	});
}

// start
main();