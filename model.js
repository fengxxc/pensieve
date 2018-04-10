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
 * 画 音符
 * @param 横坐标，纵坐标，颜色，是几分音符
 */
Quill.prototype.drawNote = function(x, y, fr) {
	this.c.beginPath();
	var w = 0, h = 0, note = null;
	switch (parseInt(fr)) {
		case 1: // 全音符
			note = img_objs.note1;
			break;
		case 2: // 二分音符
			note = img_objs.note2;
			break;
		case 4: // 四分音符
			note = img_objs.note4;
			break;
		case 8: // 八分音符
			note = img_objs.note8;
			break;
		case 16: // 十六音符
			note = img_objs.note16;
			break;
		case 32: // 三十二音符
			note = img_objs.note32;
			break;
	}

	/* 将图片转成合适的尺寸 */
	w = note.width/2.3;
	h = note.height/2;

	this.c.drawImage(note, x-w/2, y-h+CONT.LINE_SPACE/2, w, h);
	this.c.closePath();
};
/* *
 * 画 音符头
 * @param 横坐标，纵坐标
 */
Quill.prototype.drawNoteHead = function(x, y) {
	this.c.beginPath();
	var note = img_objs.noteHead;
	/* 将图片转成合适的尺寸 */
	w = note.width/2.3;
	h = note.height/2;
	this.c.drawImage(note, x-w/2, y-h+CONT.LINE_SPACE/2, w, h);
	this.c.closePath();
};
/* *
 * 画 音符尾（单条）
 * @param 横坐标，纵坐标
 */
Quill.prototype.drawNoteTail = function(x, y) {
	this.c.beginPath();
	var note = img_objs.note8Tail;
	/* 将图片转成合适的尺寸 */
	w = note.width/2.3;
	h = note.height/2;
	this.c.drawImage(note, x + CONT.NOTE_HEAD_WIDTH, y-h, w, h);
	this.c.closePath();
};
/* *
 * 画 音符尾（多条，根据fr来判断）
 * @param 横坐标，纵坐标，是几分音符
 */
Quill.prototype.drawNoteTails = function(x, y, fr) {
	this.drawLink2point(x+CONT.NOTE_HEAD_WIDTH, y, x+CONT.NOTE_HEAD_WIDTH, y - CONT.NOTEBODY_HEIGHT, 1, CONT.LINE_COLOR);
	for (var k = 0, count = Math.log(fr/8)/Math.log(2)+1; k < count; k++) 
		this.drawNoteTail(x, y + k*CONT.NOTETAIL_LINKLINE_WIDTH*3);
};
/* *
 * 画 音符尾间连线
 * @param 坐标xy
 */
Quill.prototype.drawLinkLine = function(xys) {
	// 第一个和最后一个
	var first = xys[0];
	var last = xys[xys.length-1];
	// 正切值/2 （除以二是为了让倾斜度小一点，利于美观）
	var tan = (first[1]-last[1]) / (last[0]-first[0]) /2;

	// 画竖线 第一个音符的符干
	var x = first[0]+5;
	var y = first[1];
	var y2 = y - CONT.NOTEBODY_HEIGHT;
	this.drawLink2point(x, y, x, y2, 1, CONT.LINE_COLOR);

	var lastX, lastY, lastY2, // 上一次遍历的x, y, y2
		lastCount, count, endXOffset, endYOffset;	 
	for (var i = 1; i < xys.length; i++) {
		lastX = x;
		lastY = y;
		lastY2 = y2; // 前一个音符最后一根相连横线的y坐标
		
		/* 画竖线 符干 */
		x = xys[i][0]+5;
		y = xys[i][1];
		y2 = xys[0][1] - CONT.NOTEBODY_HEIGHT - (xys[i][0]-xys[0][0])*tan;
		this.drawLink2point(x, y, x, y2, 1, CONT.LINE_COLOR);

		/* 画横线 尾间连线  */
		// lastCount：前一个音符有几条横线; xys[i-1][2]：前一个音符的fr
		lastCount = Math.log(xys[i-1][2]/8)/Math.log(2) + 1;
		// count：当前音符有几条横线; xys[i][2]：当前音符的fr
		count = Math.log(xys[i][2]/8)/Math.log(2) + 1;
		// sub: 非最后一个音符：前一个音符多出来的横线；反之：后一个音符多出来的横线
		var sub = lastCount-count;

		/* 画与前一个音符相连的横线 */
		var acroCount = Math.max(count, lastCount) - Math.abs(sub);
		for (var j = 0; j < acroCount; j++) 
			this.drawLink2point(lastX, lastY2 += j*CONT.NOTETAIL_LINKLINE_WIDTH*2, x, y2 + j*CONT.NOTETAIL_LINKLINE_WIDTH*2, CONT.NOTETAIL_LINKLINE_WIDTH, CONT.LINE_COLOR);

		/* 画前一个音符多出来的横线 */
		endXOffset = (i == 1)? lastX + CONT.NOTETAIL_SINGLE_LINE_LENGTH/2 : lastX - CONT.NOTETAIL_SINGLE_LINE_LENGTH/2;
		endYOffset = (i == 1)? lastY2+CONT.NOTETAIL_LINKLINE_WIDTH*2 - CONT.NOTETAIL_SINGLE_LINE_LENGTH/2 * tan : lastY2+CONT.NOTETAIL_LINKLINE_WIDTH*2 + CONT.NOTETAIL_SINGLE_LINE_LENGTH/2 * tan;

		for (var k = 0; k < sub; k++) 
			this.drawLink2point(lastX, lastY2+CONT.NOTETAIL_LINKLINE_WIDTH*2*(k+1), endXOffset, endYOffset + k*CONT.NOTETAIL_LINKLINE_WIDTH*2, CONT.NOTETAIL_LINKLINE_WIDTH, CONT.LINE_COLOR);
		
	}
	/* 画最后一个音符多出来的横线 */
	var endSub = count-lastCount;
	endXOffset = (i == 1)? x + CONT.NOTETAIL_SINGLE_LINE_LENGTH/2 : x - CONT.NOTETAIL_SINGLE_LINE_LENGTH/2;
	endYOffset = (i == 1)? y2+CONT.NOTETAIL_LINKLINE_WIDTH*2 - CONT.NOTETAIL_SINGLE_LINE_LENGTH/2 * tan : y2+CONT.NOTETAIL_LINKLINE_WIDTH*2 + CONT.NOTETAIL_SINGLE_LINE_LENGTH/2 * tan;
	for (var m = 0; m < endSub; m++) 
		this.drawLink2point(x, y2+CONT.NOTETAIL_LINKLINE_WIDTH*2*(m+1), endXOffset, endYOffset + m*CONT.NOTETAIL_LINKLINE_WIDTH*2, CONT.NOTETAIL_LINKLINE_WIDTH, CONT.LINE_COLOR);
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

	this.c.closePath();
};
/* *
 * 画 小节分隔线
 * @param 横坐标，纵坐标，分隔线宽度，颜色
 */
Quill.prototype.drawBarLine = function(x, y, width, color) {
	this.drawLink2point(x, y, x, y + CONT.LINE_SPACE*4, width, color);
};
Quill.prototype.drawTransp = function(x, y, type) {
	if (type == CONT.SHARP_KEY) { // #
		/* 将图片转成合适的尺寸 */
		w = img_objs.sharp.width/4;
		h = img_objs.sharp.height/4;
		this.c.drawImage(img_objs.sharp, x-w, y-h/2, w, h);
		// TODO
	} else if (type == CONT.FLATS_KEY) { // b
		/* 将图片转成合适的尺寸 */
		w = img_objs.flats.width/4;
		h = img_objs.flats.height/4;
		this.c.drawImage(img_objs.flats, x-w, y-h/2, w, h);
		// TODO
	}
};