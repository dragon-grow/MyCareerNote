var express = require('express'),   	// 서버를 간단하게 만들어주는 익스프레스 모듈 추가
    http = require('http'),
    path = require('path'),   			// 사용자의 경로 요청을 처리해주는 모듈 추가
    bodyParser = require('body-parser'),
    static = require('serve-static'),	// url로 경로접근 허가를 위한 모듈 추가
    app = express(),    //객체 생성
    router = express.Router(),
    cookieParser = require('cookie-parser'),		// 사용자 쿠기 정보 파싱 모듈
    expressSession = require('express-session'),	// 사용자 세션 정보 파싱 모듈
    draw = require('./modules/draw'),				// 외부로 분리한 화면 그리는 모듈 추가
	database = require("./modules/database");		// 외부로 분리한 데이터베이스 모듈 추가

app.set('port', process.env.PORT || 3000);			//포트번호 3000번 설정
app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());
app.use('/project', static(path.join(__dirname, 'project')));	//프로젝트 폴더를 임의 접근 가능하도록 설정
app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized:true
}));

//사용자 로그인을 처리하는 라우팅
router.route('/process/login').post(function(req,res) {
    console.log('/process/login 요청을 처리함');
	var context;
    var id = req.body.id, password = req.body.password;
	if (database) {
		database.authUser(database, id, password, function(err, docs) {
			if (err) {throw err;}
			if (docs) {      // 조회된 레코드가 있으면 성공 응답 전송
				console.dir(docs);
                req.session.user = docs[0].name;
				res.redirect("/process/dash");
			} else {  // 조회된 레코드가 없는 경우 실패 응답 전송
				context = {username:req.session.user, result:false};
 				draw.drawPage(context, res, req, 'login');
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.end('<h2>데이터베이스 연결 실패</h2>');
	}
});


// 사용자 추가 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터베이스에 추가
router.route('/process/adduser').post(function(req, res) {
	console.log('/process/adduser 호출됨.');
	var context;
    var paramId = req.body.id, paramPassword = req.body.password, paramName = req.body.name;
	if (database) {		// 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
		database.addUser(database, paramId, paramPassword, paramName, function(err, result) {
			if (err) {throw err;}
            // 결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
			if (result && result.insertedCount > 0) {
				console.dir(result);
				context = {username:paramName, result:'default'};
 				draw.drawPage(context, res, req, "addSuccess");
			} else {  // 결과 객체가 없으면 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가  실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
});
// 학점 추가 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터베이스에 추가
router.route('/process/addgrade').post(function(req, res) {
	console.log('/process/addgrade 호출됨.');
    var name = req.session.user, major = req.body.major, culture = req.body.culture,
		hrd = req.body.hrd, free = req.body.free, total = req.body.total, msc = req.body.msc,
		toeic = req.body.toeic, art = req.body.art, field = req.body.field, license = req.body.license;
    var context;
	if (database) {
		database.addGrade(database, name, major, culture, hrd, free, msc, total, toeic, art, field, license, function(err, result) {
			if (err) {throw err;}
			if (result && result.insertedCount > 0) {
				context = {username:req.session.user, result:true};
 				draw.drawPage(context, res, req, "grade");
			} else {  // 결과 객체가 없으면 실패 응답 전송
				context = {username:req.session.user, result:false};
 				draw.drawPage(context, res, req, "grade");
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
});

// 경력 추가 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터베이스에 추가
router.route('/process/addwork').post(function(req, res) {
	console.log('/process/addwork 호출됨.');
    var name = req.session.user, title = req.body.title, due = req.body.due, memo = req.body.memo;
    var context;
	if (database) {
		database.addWork(database, name, title, due, memo, function(err, result) {
			if (err) {throw err;}
			if (result && result.insertedCount > 0) {
				context = {username:req.session.user, result:true};
 				draw.drawPage(context, res, req,"resume");
			} else {  // 결과 객체가 없으면 실패 응답 전송
				context = {username:req.session.user, result:false};
 				draw.drawPage(context, res, req, "resume");
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
});

// 게시글 추가 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터베이스에 추가
router.route('/process/addpost').post(function(req, res) {
	console.log('/process/addpost 호출됨.');
    var name = req.session.user, title = req.body.title, due = "", memo = req.body.memo;
    var context = {username:req.session.user, result:true, data:""};
	if (database) {
		database.addPost(database, name, due, title, memo, function(err, result) {
			if (err) {throw err;}
			if (result && result.insertedCount > 0) {
				context.result = true;
				database.findPost(database, function(err, docs){
					if (err) {throw err;} 
					if (docs) { context.data = docs; draw.drawPage(context, res, req, "community"); }			 
				});
			} else {
				context.result = false;
				draw.drawPage(context, res, req, "community");
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
});

// 취업달력 라우팅 함수
router.route('/process/jobkorea').get(function(req, res) {
	console.log('/process/jobkorea 호출됨.');
	var context = {username:req.session.user};
    if(req.session.user) {
        draw.drawPage(context, res, req, "jobkorea");
    } else {
        res.redirect('/project/login');
    }
});

//로그인 페이지로 이동하기 위한 메소드
router.route('/project/login').get(function(req,res) {
    console.log('/project/login 요청을 처리함');
    if(req.session.user) {
		draw.drawPage(req.session.user,database,res,req);
    } else {
        context = {username:req.session.user, result:'default'};
		draw.drawPage(context, res, req, "login");
    }
});

//대시보드로 이동하기 위한 메소드
router.route('/process/dash').get(function(req,res) {
    console.log('/process/dash 요청을 처리함');
	if(req.session.user) {
		draw.dash(req.session.user,database,res,req);
	} else {
		res.redirect('/project/login');
	}
});

//학점관리 페이지로 이동하기 위한 메소드
router.route('/process/grade').get(function(req,res) {
    console.log('/process/grade 요청을 처리함');
    if(req.session.user) {
		var context = {username:req.session.user, result:'default'};
		draw.drawPage(context, res, req, "grade");
    } else {
        res.redirect('/project/login');
    }
});

//이력관리 페이지로 이동하기 위한 메소드
router.route('/process/resume').get(function(req,res) {
    console.log('/process/resume 요청을 처리함');
    var context;
    if(req.session.user) {
		context = {username:req.session.user, result:'default'};
 		draw.drawPage(context, res, req, "resume");
    } else {
        res.redirect('/project/login');
    }
});

//소통 페이지로 이동하기 위한 메소드
router.route('/process/community').get(function(req,res) {
    console.log('/process/community 요청을 처리함');
	var context = {username:req.session.user, result:'default', data:''};
	if(database) {
        database.findPost(database, function(err, docs){
            if (err) {throw err;} 
            if (docs) {
				context.data = docs;
				draw.drawPage(context, res, req, "community"); 
			} else { draw.drawPage(context, res, req, "community"); }		 
		});
	}
});

//만든이 페이지로 이동하기 위한 메소드
router.route('/process/maker').get(function(req,res) {
    console.log('/process/maker 요청을 처리함');
    var context;
    if(req.session.user) {
		context = {username:req.session.user, result:'default'};
 		draw.drawPage(context, res, req, "maker");
    } else {
        res.redirect('/project/login');
    }
});

//로그아웃 처리 요청 라우팅
router.route('/process/logout').get(function(req,res) {
    console.log('/process/logout 요청을 처리함');
    if(req.session.user) {
        req.session.destroy(function(err){
            if(err) { throw err;}
			res.redirect('/project/login');
        })
    } else {
		res.redirect('/project/login');
    }
});

//===== 뷰 엔진 설정 =====//
app.set('views', __dirname + '/project');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');
app.use('/', router);
http.createServer(app).listen(app.get('port'), function() {
    console.log('익스프레스 서버를 시작했습니다 : ' + app.get('port'));
    database.connectDB();
});