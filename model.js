/* *
 * 画笔对象（还是个羽毛笔耶(＾－＾)V）
 */
function Quill(ctx) {
	this.c = ctx;
}
/* *
 * 画 两点间连线线
 * @param 始横坐标，始纵坐标，终横坐标，终纵坐标，线宽度，颜色
 * 注：从下往上画
 */
Quill.prototype.drawLink2point = function(x, y, x2, y2, width, color) {
	this.c.beginPath();
	this.c.lineWidth = width;
	this.c.strokeStyle = color;
	this.c.moveTo(x, y);
	this.c.lineTo(x2, y2);
	this.c.stroke();
	this.c.closePath();
};
/* *
 * 画 点
 * @para 横坐标，纵坐标，半径，颜色
 */
Quill.prototype.drawPoint = function(x, y, r, color) {
	this.c.fillStyle = color;
	this.c.beginPath();
	this.c.arc(x, y, r, 0, Math.PI*2, true);
	this.c.closePath();
	this.c.fill();
};
/* *
 * 画 一行 五线谱
 * @param 左边距，上边距，宽度，每行几条线，线间距，线宽，线颜色
 */
Quill.prototype.drawline = function(left, top, width, lineCont, lineSpace, lineWidth, lineColor) {
	this.c.beginPath();
	this.c.lineWidth = lineWidth;
	this.c.strokeStyle = lineColor;
	for (var i = 0, t = top; i < lineCont; i++, t+=lineSpace) {
		this.c.moveTo(left, t);
		this.c.lineTo(left+width, t);
	}
	this.c.stroke();
	this.c.closePath();
};
/* *
 * 画 多行 五线谱
 * @param 左边距，上边距，宽度，每行几条线，线宽，线颜色，行间距，行数
 */
Quill.prototype.drawFullPageLine = function(left, top, width, lineCont, lineSpace, lineWidth, lineColor, rowSpace, rowCont) {
	for (var i = 0, t = top; i < rowCont; i++, t+=rowSpace) 
		this.drawline(left, t, width, lineCont, lineSpace, lineWidth, lineColor);
};
/* *
 * 画 音符头
 * @param 横坐标，纵坐标
 */
Quill.prototype.drawNoteHead = function(x, y, fr) {
	this.c.beginPath();
	var note = img_objs.noteHead;
	if (fr <= 2) {
		note = img_objs.noteHead2;
	}
	/* 将图片转成合适的尺寸 */
	w = note.width/2.3;
	h = note.height/2;
	this.c.drawImage(note, x-w/2, y-h+CONT.LINE_SPACE/2, w, h);
	this.c.closePath();
};
/* *
 * 画 音符尾（单条）
 * @param 横坐标
 * @param 纵坐标
 * @param 符干符尾是否朝上 Boolean
 */
Quill.prototype._drawNoteTail = function(x, y, isUpward) {
	var note = img_objs.note8Tail;
	w = note.width/2.5;
	h = note.height/2;
	var oX = x + CONT.NOTE_HEAD_WIDTH;
	var oY = y-h;
	this.c.beginPath();
	if (!isUpward) {
		note = img_objs.note8TailRev;
		oX = x - CONT.NOTE_HEAD_WIDTH;
		oY = y;
	}
	/* 将图片转成合适的尺寸 */
	this.c.drawImage(note, oX, oY, w, h);
	this.c.closePath();
};
/* *
 * 画 音符尾（多条，根据fr来判断）
 * @param 横坐标，纵坐标，是几分音符
 */
Quill.prototype.drawNoteTails = function(x, y, fr, isUpward) {
	var forward = 1;
	var startX = x + CONT.NOTE_HEAD_WIDTH;
	var endY = y - CONT.NOTEBODY_HEIGHT;
	if (!isUpward) {
		startX = x - CONT.NOTE_HEAD_WIDTH;
		endY = y + CONT.NOTEBODY_HEIGHT;
		forward = -1;
	}
	this.drawLink2point(startX, y, startX, endY, 1, CONT.LINE_COLOR);
	for (var k = 0, count = Math.log(fr/8)/Math.log(2)+1; k < count; k++) 
		this._drawNoteTail(x, y + k*CONT.NOTETAIL_LINKLINE_WIDTH*3*forward, isUpward);
};
/* *
 * 画 音符尾（多条，根据fr来判断） 自动判断符干符尾朝向
 * @param 横坐标，纵坐标，是几分音符
 */
 Quill.prototype.drawNoteTailsAutoForward = function(x, baseY, y, fr) {
 	var midY = baseY - 3*CONT.LINE_SPACE; // 五线谱中间线的y坐标
 	var isUp = true;
 	if (y < midY) isUp = false;
 	this.drawNoteTails(x, y, fr, isUp);
 };
/* *
 * 画 音符 符干 和 尾间连线
 * @param [ {x, baseY, yMax, yMin, fr}, {x2, baseY, yMax2, yMin2, fr2}, ... ]
 * @param 符干符尾是否朝上 Boolean
 */
Quill.prototype.drawStemTailLine = function(xyf, isUpward) {
	// isUpward = false;
	// 符干是否朝上参数 若未传，默认朝上
	var isUp = isUpward !== undefined? isUpward : true;
	var forward = isUp? 1 : -1;
	// 第一个
	var first = xyf[0];
	// 1.画竖线 第一个音符的符干
	var x = isUp? first.x + CONT.NOTE_HEAD_WIDTH : first.x - CONT.NOTE_HEAD_WIDTH;
	var y = isUp? first.yMax : first.yMin;
	var yDist = first.yMax - first.yMin;
	var yEnd = y - (CONT.NOTEBODY_HEIGHT + yDist)*forward; // yEnd为离符头最远端y轴坐标
	var firstYEnd = yEnd;
	this.drawLink2point(x, y, x, yEnd, 1, CONT.LINE_COLOR);
	if (xyf.length == 1) return;

	// 最后一个
	var last = xyf[xyf.length-1];
	// 正切值的绝对值/2 （除以二是为了让倾斜度小一点，利于美观）
	var tan = ( (first.yMax+first.yMin)/2 - (last.yMax+last.yMin)/2 ) / (last.x-first.x) /2;

	var lastX, lastY, lastYEnd;  // 上一次遍历的x, y, yEnd
	var lastCount, count, shortLineStartX, shortLineEndX;
	for (var i = 1; i < xyf.length; i++) {
		lastX = x;
		lastY = y;
		lastYEnd = yEnd; // 前一个音符最后一根相连横线的y坐标
		
		/* 1.画竖线 符干 */
		x = isUp? xyf[i].x + CONT.NOTE_HEAD_WIDTH : xyf[i].x - CONT.NOTE_HEAD_WIDTH;
		y = isUp? xyf[i].yMax : xyf[i].yMin;
		yDist = xyf[i].yMax - xyf[i].yMin;
		yEnd = firstYEnd - (xyf[i].x-xyf[0].x)*tan;
		this.drawLink2point(x, y, x, yEnd, 1, CONT.LINE_COLOR);

		/* 2.画横线 尾间连线  */
		// lastCount：前一个音符有几条横线; xyf[i-1].fr：前一个音符的fr
		lastCount = Math.log(xyf[i-1].fr/8)/Math.log(2) + 1; // 算log以2为底fr/8的对数
		// count：当前音符有几条横线; xyf[i].fr：当前音符的fr
		count = Math.log(xyf[i].fr/8)/Math.log(2) + 1;
		// sub: 非最后一个音符：前一个音符多出来的横线；反之：后一个音符多出来的横线
		var sub = lastCount-count;

		/* 画与前一个音符相连的横线 */
		var acroCount = Math.max(count, lastCount) - Math.abs(sub);
		for (var j = 0; j < acroCount; j++) 
			this.drawLink2point(lastX, lastYEnd += CONT.NOTETAIL_LINKLINE_WIDTH*2*j*forward, x, lastYEnd - (x - lastX)*tan, CONT.NOTETAIL_LINKLINE_WIDTH, CONT.LINE_COLOR);

		/* 画前一个音符多出来的横线 */
		var isSecond = (i == 1)? 1 : -1; // 是第二个音符吗（第二个音符的横线是向右偏移，反之向左偏移）
		shortLineStartX = (i == 1)? lastX : lastX - CONT.NOTETAIL_SINGLE_LINE_LENGTH/2;
		shortLineEndX = shortLineStartX + CONT.NOTETAIL_SINGLE_LINE_LENGTH/2;
		for (var k = 0; k < sub; k++) 
			this.drawLink2point(shortLineStartX, lastYEnd -= (shortLineStartX - lastX)*tan - CONT.NOTETAIL_LINKLINE_WIDTH*2*(k+1)*forward, shortLineEndX, lastYEnd - CONT.NOTETAIL_SINGLE_LINE_LENGTH/2*tan, CONT.NOTETAIL_LINKLINE_WIDTH, CONT.LINE_COLOR);
			
	}
	/* 画最后一个音符多出来的横线 */
	var endSub = count-lastCount;
	shortLineStartX = x - CONT.NOTETAIL_SINGLE_LINE_LENGTH/2;
	for (var m = 0; m < endSub; m++) 
		this.drawLink2point(shortLineStartX, lastYEnd -= (shortLineStartX - lastX)*tan - CONT.NOTETAIL_LINKLINE_WIDTH*2*(m+1)*forward, x, lastYEnd - CONT.NOTETAIL_SINGLE_LINE_LENGTH/2*tan, CONT.NOTETAIL_LINKLINE_WIDTH, CONT.LINE_COLOR);
};
/* *
 * 画 音符 符干 和 尾间连线 自动判断符干符尾朝向
 * @param [ {x, baseY, yMax, yMin, fr}, {x2, baseY, yMax2, yMin2, fr2}, ... ]
 * @param 符干是否朝上 Boolean
 */
Quill.prototype.drawStemTailLineAutoForward = function(XYFrs) {
	if (XYFrs.length == 0) return;
	var isUp = true;
	var sum = 0;
	var midY = XYFrs[0].baseY - 3*CONT.LINE_SPACE; // 五线谱中间线的y坐标
	for (var i = 0; i < XYFrs.length; i++)
		sum += XYFrs[i].yMax + XYFrs[i].yMin;
	var avg = sum / (XYFrs.length*2);
	if (avg < midY) isUp = false;
	this.drawStemTailLine(XYFrs, isUp);
};
/* *
 * 画 谱号
 * @param 横坐标，纵坐标（初始在下加一线上），谱号类型，颜色
 */
Quill.prototype.drawClef = function(x, y, type, color) {
	this.c.beginPath();
	var _y, w, h; // 纵坐标，谱号宽，谱号高
	// G
	if (type == CONT.CLEF_G) {
		_y = y - CONT.LINE_SPACE*2;
		/* 将图片转成合适的尺寸 */
		w = img_objs.clefG.width;
		h = img_objs.clefG.height;
		this.c.drawImage(img_objs.clefG, x-w/2, _y-h*CONT.CLEF_G_SPE, w, h);
	}
	// C
	if (type == CONT.CLEF_C) {
		_y = y - CONT.LINE_SPACE*2;
		/* 将图片转成合适的尺寸 */
		w = img_objs.clefC.width;
		h = img_objs.clefC.height;
		this.c.drawImage(img_objs.clefC, x-w/2, _y-h*CONT.CLEF_C_SPE, w, h);
	}
	// F
	if (type == CONT.CLEF_F) {
		_y = y - CONT.LINE_SPACE*2;
		/* 将图片转成合适的尺寸 */
		w = img_objs.clefF.width;
		h = img_objs.clefF.height;
		this.c.drawImage(img_objs.clefF, x-w/2, _y-h*CONT.CLEF_F_SPE, w, h);
	}

	this.c.closePath();
};
/* *
 * 画 小节分隔线
 * @param 横坐标，纵坐标，分隔线宽度，颜色
 */
Quill.prototype.drawBarLine = function(x, y, width, color) {
	this.drawLink2point(x, y, x, y + CONT.LINE_SPACE*4, width, color);
};
/* *
 * 画 升降符号
 * @param 横坐标，纵坐标，升降符号(string)
 */
Quill.prototype.drawTransp = function(x, y, type) {
	if (type == KEY_MAP.sharp) { // 升
		/* 将图片转成合适的尺寸 */
		w = img_objs.sharp.width/4;
		h = img_objs.sharp.height/4;
		this.c.drawImage(img_objs.sharp, x-w, y-h/2, w, h);
	} else if (type == KEY_MAP.flat) { // 降
		/* 将图片转成合适的尺寸 */
		w = img_objs.flats.width/4;
		h = img_objs.flats.height/4;
		this.c.drawImage(img_objs.flats, x-w, y-h/2, w, h);
	}
};

/* *
 * 音符对象
 * createTime: 2018-5-25 15:31:43
 */
function Note(d, a, p) {
	/* 音符基本信息 */
	// 时值；如4分音符，表示：4
	var _d = d,
	// 音名；如C4，表示'c4'
		_a = a,
	// 是否有符点；是：true，否：false
		_p = p;

	// 时间上 占小节长度的比值；如符点8分音符，表示：1/12
	var _r = _p? 1/(_d+_d/2) : 1/_d;
	return {
		duration: _d, // 时值
		alphabet: _a, // 音名
		hasPoint: _p, // 是否有符点

		ratioOfBar: _r // 时间上 占小节长度的比值
	};
}

function stepNotesFactory(code) {
	var narr = [];
	var frArr = /^\d+\.?/.exec(code);
	var d = frArr? frArr[0] : '4';
	var p = (''+d).search(/\./) > 0;
	var as = code.slice(frArr? frArr.index+frArr[0].length : 0);
	var aArr = as.split(KEY_MAP.split.note);
	for (var i = 0; i < aArr.length; i++) {
		narr.push(Note(d, aArr[i], p));
	}
}