var ctx = paper.getContext('2d');

var inputTs = document.getElementById('inputTs');
var inputArea = document.getElementById('inputArea');

var checkClef = document.getElementsByClassName('checkClef');

// ========================渲染方法 start======================
function parseAndRenderScore(s) {
	var clefArr = s.clef;
	var timeBar = parseInt(s.timeSignature.split('/')[0]); // 每小节有几拍
	var timeBeat = parseInt(s.timeSignature.split('/')[1]); // 几分音符为一拍
	var notes = s.notes; // 乐谱正文

	var qu = new Quill(ctx);
	// 当前行下加一线的y坐标，初始在第负一行
	var y_def = CONT.TOP_PADDING + CONT.LINE_SPACE*5 - clefArr.length*CONT.ROW_SPACE();
	// 当前行x坐标，初始在第一行最左
	var x_cur = CONT.LEFT_PADDING;

	/* 清画布 */
	ctx.clearRect(0, 0, paperWidth, paperHeight);

	/* 遍历每一个音符 */
	var tempBar = 0;  // 不足一小节就把拍数临时存到这里来，一拍加一，加到timeBar清零
	var tempHalf = 0; // 不足4分音符时长的时值，存到这里来 
	var tempXYFrs = []; // 不足4分音符时长的时值，[x, y, fr]
	for (var i = 0; i < notes.length; i++) {

		/* 第一个音符 或 一行超出 就换行并渲染五线谱 */
		if (i == 0 || x_cur > (paperWidth-CONT.LEFT_PADDING) )
			rowEnter(clefArr);
		
		var noteInfo = parseNoteGroupCode(notes[i]);
		/* 1. fr(fraction) 是几分音符（包括符点），根据开头数字判断，若无则为4分音符 */
		var fr = noteInfo.fraction;
		/* 2. stepLength: 1/时值长度 */
		var stepLength = noteInfo.stepLength;
		/* 3.ma(musical alphabet) 音名数组，采用西方现代音乐标准命名法 */
		var maGroup = noteInfo.musicalAlphabets; // like this: ['f4#', 'c5']
		/* 4. 有符点吗？*/
		var hasPoint = noteInfo.hasPoint;

		// 加拍数
		tempBar += (stepLength * timeBeat); 

		/* 渲染一组最小单位块音符 */
		renderStep(x_cur, y_def, fr, stepLength, maGroup, hasPoint, clefArr);

		/* x右移距离，主要根据音符时值fr而定 */
		x_cur += CONT.TSG_SPACE() * (stepLength * CONT.UNIT_NOTE);

		/* 如果一小节完毕，画小节线 */
		if (tempBar >= timeBar) {
			qu.drawBarLine(x_cur - CONT.TSG_SPACE()/2, y_def - CONT.LINE_SPACE*5, CONT.LINE_WIDTH, CONT.LINE_COLOR);
			tempBar = 0;
		}

	}

	/* *
	 * 渲染一音符组
	 * @param x坐标，y坐标，是几分音符，1/时值长度，音符组音名（数组），是否有符点，谱表类型数组
	 */
	function renderStep(x, y, fr, stepLength, maGroup, hasPoint, clefArr) {
		var maPlaceTop = null;
		var maPlaceBot = null;
		for (var i = 0; i < maGroup.length; i++) {
			// var maPlace = getMaPlace(maGroup[i], clefArr[0]); // 在谱表上的位置 TODO
			var maPlace = getMaPlaceAuto(maGroup[i], clefArr); // 在多谱表上的位置 TODO
			
			if (maPlace == null) continue;

			/* (〃'▽'〃) 要渲染音符了 */
			// 判断是否要加线
			if (maPlace <= 0 || 6 <= maPlace) {
				// lineCont 加多少条线
				var lineCont = maPlace <= 0? 0-Math.ceil(maPlace)+1 : maPlace-6+1;
				// firstPlace 加线的初始位置
				var firstPlace = maPlace <= 0? Math.ceil(maPlace) : 6;
				for (var l = 0; l < lineCont; l++, firstPlace++) 
					qu.drawline(x-CONT.TSG_SPACE()/2, y-firstPlace*CONT.LINE_SPACE, CONT.TSG_SPACE(), 1, CONT.LINE_SPACE, CONT.LINE_WIDTH, CONT.LINE_COLOR);
			}

			/* 1.画音符头 */
			qu.drawNoteHead(x, y-maPlace*CONT.LINE_SPACE, fr);

			/* 2.画升降符号 */
			var transp = maGroup[i].match(new RegExp(KEY_MAP.sharp+'+$|'+KEY_MAP.flat+'+$')) || [null];
			if (transp.length > 0)
				qu.drawTransp(x - CONT.NOTE_HEAD_WIDTH - 2, y-maPlace*CONT.LINE_SPACE, transp[0]);
		
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
	 * @param 谱号array
	 */
	function rowEnter(clefs) {
		// n种谱号
		var n = clefs.length;
		// y_def 去往下一行的首行
		y_def += CONT.ROW_SPACE() * (n-1);
		for (var i = 0; i < n; i++) {			
			y_def += CONT.ROW_SPACE();
			x_cur = CONT.LEFT_PADDING;
			qu.drawline(x_cur, y_def - CONT.LINE_SPACE*5, paperWidth-CONT.LEFT_PADDING*2, 5, CONT.LINE_SPACE, CONT.LINE_WIDTH, CONT.LINE_COLOR);
			// 画 行开头的竖线
			qu.drawBarLine(x_cur, y_def - CONT.LINE_SPACE*5, CONT.LINE_WIDTH, CONT.LINE_COLOR);
			// 向右偏移： 行开头竖线 至 谱号 的距离
			x_cur += CONT.TSG_SPACE()/2;
			// 画 谱号
			qu.drawClef(x_cur, y_def, clefs[i], CONT.LINE_COLOR);
			// 向右偏移： 谱号 至 音符 的距离
			x_cur += CONT.CLEF_SPACE;
		}
		// y_def 回到本轮绘制的首行
		y_def -= CONT.ROW_SPACE() * (n-1);
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
	var maArr = mas.split(KEY_MAP.split.note);
	return {
		fraction: fr, 		 // 几分音符 string
		hasPoint: pt,		 // 是否有符点 boolean
		stepLength: sl, 	 // 在谱上的物理时值长度 number
		musicalAlphabets: maArr, // 音名数组 array
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
 * 根据音名和谱号 获得在五线谱上的位置
 * @param 音名
 * @param 谱号类型
 */
function getMaPlace(ma, type) { // 如：ma = 'f5#'
	var ma1 = ma.slice(0, 1); // 'f'
	var ma2 = ma.slice(1).match(/^\d*/); // '5'
	if (!ma1 || !ma2[0]) return null;
	var place = CONT.G_MA2SC[ma1][parseInt(ma2)];
	if (place == null) return null;
	if (type == CONT.CLEF_F)
		place += 6;
	if (type == CONT.CLEF_C)
		place += 3;
	return place; // 5
}
/* *
 * 根据音名和支持的谱号 自动获得在五线谱上的位置
 * @param 
 * @param 谱号类型 ['G', 'F', 'C']
 */
function getMaPlaceAuto(ma, types) {
	// n种谱号
	var n = types.length;
	if (n == 0) {
		console.error('请至少选择一种谱号');
		return;
	}
	if (n == 1) {
		return getMaPlace(ma, types[0]);
	}
	/*var type = types.shift();
	var place = getMaPlace(ma, type);
	for (var i = 0; i < types.length; i++) {
		if (place <= 0 || place > 6) {
			type = types.shift();
			place = getMaPlace(ma, type);
		}
	}*/
	// var type = types[0];
	// var place = getMaPlace(ma, type);
	var place = null;
	for (var i = 0; i < types.length; i++) {
		place = getMaPlace(ma, types[i]);
		if (place >= 0 && place <= 6) {
			break;
		}
	}
	return place;
	/*if (place <= 0 || place > 6) {
		for (var i = 1; i < n; i++) {
			
		}
	}*/
	// TODO
}
/* *
 * 根据基准y坐标 和音符位置 获得音符y坐标
 * @param baseY 当前行下加一线的y坐标，初始在第负一行
 * @param maplace 在五线谱上的位置
 */
function getY(baseY, maplace) {
	return baseY - maplace*CONT.LINE_SPACE;
}

/* * 
 * 比较两个音名的大小，高音大低音小
 * @param 第一个音名，第二个音名
 * return ma1 < ma2 返回<0；ma1 > ma2 返回>0；相等返回0
 */
function compareNoteName(ma1, ma2) {
	var weight = {
		'c':1, 'd':2, 'e':3, 'f':4, 'g':5, 'a':6, 'b':7
	};
	var w1 = parseInt(ma1.match(/\d/)[0])*10 + weight[ ma1.match(/^[a-g,A-G]/)[0] ];
	var w2 = parseInt(ma2.match(/\d/)[0])*10 + weight[ ma2.match(/^[a-g,A-G]/)[0] ];
	console.log(w1);
	console.log(w2);
	return w1 - w2;
}

// ========================渲染方法 end========================

var img_objs = {
	note1: new Image(),
	// note2: new Image(),
	// note4: new Image(),
	// note8: new Image(),
	clefG: new Image(),
	clefC: new Image(),
	clefF: new Image(),
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

	img_objs.clefC.src = SRC.CLEF_C;
	notes.push(img_objs.clefC);

	img_objs.clefF.src = SRC.CLEF_F;
	notes.push(img_objs.clefF);

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
	var checkedDom = [].filter.call(checkClef, function (checkDom) {
		return checkDom.checked;
	});
	score.clef = [].map.call(checkedDom, function (checkedDom) {
		return checkedDom.value;
	});
	
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
		// 监听 乐谱正文输入框 input事件
		inputArea.addEventListener('input', render);
		// 监听 选择谱表复选框 change事件
		[].map.call(checkClef, function (checkDom) {
			checkDom.addEventListener('change', render);
		});
		render();
	});
}

// start
main();