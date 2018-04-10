// test
var testscore = {
	// 拍号
	timeSignature: '4/4',
	/* 乐谱正文，每个元素 是一个小节 */
	notes: [
		/* beat 每个元素 是一拍 */
		// '2f5': 二分音符，音名为f5，升半调
		// '4gb': 四分音符，音名为g5，降半调
		'4e4', '2f5#', '4g5b',
		'4e4', '2f5#', '4g5b',
		'4e4', '2f5#', '4g5b',
		'4e4', '2f5#', '4g5b',
		'4e4', '2f5#', '4g5b',
		'4e4', '2a4#', '4g5b',
		'4e4', '2f5#', '4g5b',
		'4e4', '2f5#', '4g5b',
		'4a3', '2c4#', '4c6b', //
		'2f4', '2f5#',
		'1c5b',
		'4e4', '8a4#', '8c5#', '4g5b', '4b4',
		'4e4', '16a4#', '8c5#', '16d5#', '4g5b', '4b4',
		'4e4', '16a4#', '32c5#', '16a4#', '32c5#', '16a4#', '4g5b', '4b4',
		'4e4', '16c5#', '16e5b', '8a4#', '8b4', '8a4', '4g5b',
		'4e4', '8.5a4#', '16c5#', '4g5b', '4b4',
		'4e4', '4.f5#', '8f5#', '4g5b',
		'4e4', '8f5#', '4.f5#', '4g5b',
		// '4e4', '4d5#', '4g5b', '4b4',
		 
	],
};


/*initImgs(function () {
	// drawline(ctx, CONT.LEFT_PADDING, CONT.TOP_PADDING, paperWidth-CONT.LEFT_PADDING*2, 5, CONT.LINE_SPACE, 1, CONT.LINE_COLOR);
	// debugger;
	parseAndRenderScore(testscore);

});*/

/*
4e4 2f5# 4g5b 
4e4 2f5# 4g5b 
4e4 2f5# 4g5b 
4e4 2f5# 4g5b 
4e4 2f5# 4g5b 
4e4 2a4# 4g5b 
4e4 2f5# 4g5b 
4e4 2f5# 4g5b 
4a3 2c4# 4c6b  
2f4 2f5# 
1c5b 
4e4 8a4# 8c5# 4g5b 4b4 
4e4 16a4# 8c5# 16d5# 4g5b 4b4 
4e4 16a4# 32c5# 16a4# 32c5# 16a4# 4g5b 4b4 
4e4 16c5# 16e5b 8a4# 8b4 8a4 4g5b 
4e4 8.5a4# 16c5# 4g5b 4b4 
4e4 4.f5# 8f5# 4g5b 
4e4 8f5# 4.f5# 4g5b 
*/