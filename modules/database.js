// 데이터베이스 객체 생성
var MongoClient = require('mongodb').MongoClient;   // 몽고디비 모듈 사용
var data;                                       // 데이터베이스 객체를 위한 변수 선언

//데이터베이스에 연결
function connectDB() {
	var databaseUrl = 'mongodb://localhost:27017/local'; 	// 데이터베이스 연결 정보
	MongoClient.connect(databaseUrl, function(err, db) {    // 데이터베이스 연결
		if (err) throw err;
		console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
		data = db.db('local');	// database 변수에 할당
	});
}
// 사용자를 인증하는 함수
var authUser = function(database, id, password, callback) {
	console.log('authUser 호출됨 : ' + id + ', ' + password);
	var users = data.collection('users');    // users 컬렉션 참조
    // 아이디와 비밀번호를 이용해 검색
	users.find({"id":id, "password":password}).toArray(function(err, docs) {
		if (err) { // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
	    if (docs.length > 0) {  // 조회한 레코드가 있는 경우 콜백 함수를 호출하면서 조회 결과 전달
	    	console.log('아이디 [%s], 패스워드 [%s] 가 일치하는 사용자 찾음.', id, password);
	    	callback(null, docs);
	    } else {  // 조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null, null 전달
	    	console.log("일치하는 사용자를 찾지 못함.");
	    	callback(null, null);
	    }
	});
}

//사용자를 추가하는 함수
var addUser = function(database, id, password, name, callback) {
	console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name);
	var users = data.collection('users');	// users 컬렉션 참조
	// id, password, username을 이용해 사용자 추가
	users.insertMany([{"id":id, "password":password, "name":name}], function(err, result) {
		if (err) {  // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
        // 에러 아닌 경우, 콜백 함수를 호출하면서 결과 객체 전달
        if (result.insertedCount > 0) {
	        console.log("사용자 레코드 추가됨 : " + result.insertedCount);
        } else {
            console.log("추가된 레코드가 없음.");
        }
	    callback(null, result);
	});
}

// 학점을 추가하는 함수
var addGrade = function(database, id, major, culture, hrd, free, msc, total, toeic, art, field, license, callback) {
	console.log('addGrade 호출됨 : ' + id);
	var grades = data.collection('grade');	// grades 컬렉션 참조
	// username을 이용해 사용자 추가
	grades.insertMany([{"name":id, "major":major, "culture":culture, "hrd":hrd, "free":free, "msc":msc,
						"total":total, "toeic":toeic, "art":art, "field":field, "license":license}], function(err, result) {
		if (err) {  						// 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
        if (result.insertedCount > 0) {		// 에러 아닌 경우, 콜백 함수를 호출하면서 결과 객체 전달
	        console.log("학점 레코드 추가됨 : " + result.insertedCount);
        } else {
            console.log("추가된 레코드가 없음.");
        }
	    callback(null, result);     
	});
}

// 경력을 추가하는 함수
var addWork = function(database, id, title, due, memo, callback) {
	console.log('addWork 호출됨 : ' + id);
	var works = data.collection('work');	// grades 컬렉션 참조
	works.insertMany([{"name":id, "title":title, "due":due, "memo":memo}], function(err, result) {	//경력추가
		if (err) {  // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
        if (result.insertedCount > 0) {		// 에러 아닌 경우, 콜백 함수를 호출하면서 결과 객체 전달
	        console.log("작업 레코드 추가됨 : " + result.insertedCount);
        } else {
            console.log("추가된 레코드가 없음.");
        }
	    callback(null, result);     
	});
}

// 게시글을 추가하는 함수
var addPost = function(database, id, date, title, memo, callback) {
	console.log('addPost 호출됨 : ' + id);
	var posts = data.collection('post');	// grades 컬렉션 참조
	// 게시글 추가
	posts.insertMany([{"name":id, "title":title, "memo":memo, "date":date}], function(err, result) {
		if (err) {  // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
        if (result.insertedCount > 0) {	// 에러 아닌 경우, 콜백 함수를 호출하면서 결과 객체 전달
	        console.log("게시글 레코드 추가됨 : " + result.insertedCount);
        } else { console.log("추가된 게시글 없음."); }
	    callback(null, result);     
	});
}

// 학점을 검색하는 함수
var findGrade = function(database, id, callback) {
	console.log('findGrade 호출됨 : ' + id);
	var grade = data.collection('grade');    // users 컬렉션 참조
	grade.find({"name":id}).toArray(function(err, docs) {		// 아이디를 이용해 검색
		if (err) { // 에러 발생 시 콜백 함수를 호출하면서 에러 객체 전달
			callback(err, null);
			return;
		}
		
	    if (docs.length > 0) {  // 조회한 레코드가 있는 경우 콜백 함수를 호출하면서 조회 결과 전달
	    	console.log('이름 [%s]가 일치하는 학점데이터 찾음.', id);
	    	callback(null, docs);
	    } else {  // 조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null, null 전달
	    	console.log("일치하는 사용자를 찾지 못함.");
	    	callback(null, null);
	    }
	});
}

// 경력을 검색하는 함수
var findWork = function(database, id, callback) {
	console.log('findWork 호출됨 : ' + id);
	var work = data.collection('work');

	work.find({"name":id}).toArray(function(err, docs) {
		if (err) { callback(err, null); return; }
	    if (docs.length > 0) {  // 조회한 레코드가 있는 경우 콜백 함수를 호출하면서 조회 결과 전달
	    	console.log('이름 [%s]가 일치하는 경력데이터 찾음.', id); callback(null, docs);
	    } else {  // 조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null, null 전달
	    	console.log("일치하는 사용자를 찾지 못함."); callback(null, null); }
	});
}

// 게시글을 검색하는 함수
var findPost = function(database, callback) {
	console.log('findPost 호출됨');
	var posts = data.collection('post');    // users 컬렉션 참조

	posts.find().toArray(function(err, docs) {    // 아이디를 이용해 검색
		if (err) { callback(err, null); return; }
	    if (docs.length > 0) { console.log('게시글 찾음.'); callback(null, docs);
	    } else { console.log("게시글 없음"); callback(null, null); }
	});
}
module.exports.connectDB = connectDB;
module.exports.authUser = authUser;
module.exports.addUser = addUser;
module.exports.addGrade = addGrade;
module.exports.addWork = addWork;
module.exports.addPost = addPost;
module.exports.findGrade = findGrade;
module.exports.findWork = findWork;
module.exports.findPost = findPost;