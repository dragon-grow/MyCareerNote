var cheerio = require('xml-js'),
    request = require('request'),
	xml2js = require('xml2js'),
	database = require("./database");

//대시보드 페이지를 그려줍니다.
var dash = function(username, database, res, req){
	//대시보드 렌더링에 필요한 JSON객체 정의
    var context={username:username, total:'', grade:'', art:'', field:'', license:'',
                 job1N:'', job1T:'', job1U:'', job2N:'', job2T:'', job2U:'', job3N:'', 
                 job3T:'', job3U:'', job4N:'', job4T:'', job4U:'', job5N:'', job5T:'', job5U:'', work:""};
	if(database) {
        database.findGrade(database, username, function(err, docs){		//데이터베이스에서 성적 정보 조회
            if (err) {throw err;}
			context.username = username;
            if (docs) { 						//성적 정보가 있다면,
				var index = (docs.length)-1; 
				context.grade = docs[index]; 
				context.total = Number(docs[index].major) + Number(docs[index].msc) + Number(docs[index].hrd)
								+ Number(docs[index].free) + Number(docs[index].culture); 	//이수학점 합하기
				
				if(docs[index].art == "on"){		//졸업작품항목이 true라면!
					docs[index].art = "이수";				//대시보드에 출력할 문자열 저장
					context.art = "w3-indigo"; 			 //대시보드에 출력할 항목 색상 지정	
				} else {							//졸업작품 항목이 false라면!
					docs[index].art = "미이수";		   //대시보드에 출력할 문자열 저장
					context.art = "w3-deep-orange"; 	 //대시보드에 출력할 항목 색상 지정
				}
				if(docs[index].field == "on"){
					docs[index].field = "이수";
					context.field = "w3-indigo"; 
				} else {
					docs[index].field = "미이수";
					context.field = "w3-deep-orange"; 
				}
				if(docs[index].license == "on"){
					docs[index].license = "취득";
					context.license = "w3-indigo"; 
				} else {
					docs[index].license = "미취득";
					context.license = "w3-deep-orange"; 
				}
			}
        });
		database.findWork(database, username, function(err, docs) {		//포트폴리오(이력) 정보 조회
			if (err) {throw err;}
			if (docs) { context.work = docs; } 					//조회된 정보가 있다면 JSON에 삽입
		});
	}
	
	//사람인 홈페이지에서 제공해주는 취업정보 XML파일을 파싱합니다. 우리 페이지에 맞게 파싱하기 위한 부분입니다.
	var url = 'http://api.saramin.co.kr/job-search?keywords=nhn&edu_lv=3&job_category=404&fields=posting-date+expiration-date&sort=rc'; 
	var parser = new xml2js.Parser();
	request(url, function(error, response, body) {
		parser.parseString(body, function(err,result){
			var data = JSON.stringify(result);
			data = data.replace("job-search","jobsearch");
			var strTojson = JSON.parse(data);
			var companyn, s, e;
			context.job1T = JSON.stringify(strTojson.jobsearch.jobs[0].job[1].position[0].title);
			context.job1N = ((JSON.stringify(strTojson.jobsearch.jobs[0].job[1].company)).replace('{"name":[{"_":"','')).match('[가-힣 ()]+')[0];
			s=(JSON.stringify(strTojson.jobsearch.jobs[0].job[1].company)).indexOf('"href":"')+8;
			e=(JSON.stringify(strTojson.jobsearch.jobs[0].job[1].company)).indexOf('"}}]}');
			context.job1U = JSON.stringify(strTojson.jobsearch.jobs[0].job[1].company).substring(s,e);

			context.job2T = JSON.stringify(strTojson.jobsearch.jobs[0].job[2].position[0].title);
			context.job2N = ((JSON.stringify(strTojson.jobsearch.jobs[0].job[2].company)).replace('{"name":[{"_":"','')).match('[가-힣 ()]+')[0];
			s=(JSON.stringify(strTojson.jobsearch.jobs[0].job[2].company)).indexOf('"href":"')+8;
			e=(JSON.stringify(strTojson.jobsearch.jobs[0].job[2].company)).indexOf('"}}]}');
			context.job2U = JSON.stringify(strTojson.jobsearch.jobs[0].job[2].company).substring(s,e);

			context.job3T = JSON.stringify(strTojson.jobsearch.jobs[0].job[3].position[0].title);
			context.job3N = ((JSON.stringify(strTojson.jobsearch.jobs[0].job[3].company)).replace('{"name":[{"_":"','')).match('[가-힣 ()]+')[0];
			s=(JSON.stringify(strTojson.jobsearch.jobs[0].job[3].company)).indexOf('"href":"')+8;
			e=(JSON.stringify(strTojson.jobsearch.jobs[0].job[3].company)).indexOf('"}}]}');
			context.job3U = JSON.stringify(strTojson.jobsearch.jobs[0].job[3].company).substring(s,e);

			context.job4T = JSON.stringify(strTojson.jobsearch.jobs[0].job[4].position[0].title);
			context.job4N = ((JSON.stringify(strTojson.jobsearch.jobs[0].job[4].company)).replace('{"name":[{"_":"','')).match('[가-힣 ()]+')[0];
			s=(JSON.stringify(strTojson.jobsearch.jobs[0].job[4].company)).indexOf('"href":"')+8;
			e=(JSON.stringify(strTojson.jobsearch.jobs[0].job[4].company)).indexOf('"}}]}');
			context.job4U = JSON.stringify(strTojson.jobsearch.jobs[0].job[4].company).substring(s,e);

			context.job5T = JSON.stringify(strTojson.jobsearch.jobs[0].job[5].position[0].title);
			context.job5N = ((JSON.stringify(strTojson.jobsearch.jobs[0].job[5].company)).replace('{"name":[{"_":"','')).match('[가-힣 ()]+')[0];
			s=(JSON.stringify(strTojson.jobsearch.jobs[0].job[5].company)).indexOf('"href":"')+8;
			e=(JSON.stringify(strTojson.jobsearch.jobs[0].job[5].company)).indexOf('"}}]}');
			context.job5U = JSON.stringify(strTojson.jobsearch.jobs[0].job[1].company).substring(s,e);
			
			//대시보드에 출력할 데이터가 모두 얻어졌으므로 최종적으로 화면을 렌더링 합니다.
			req.app.render('dash', context, function(err, html) {
				if (err) { console.error('뷰 렌더링 중 에러 발생 : ' + err.stack); return; }
				res.end(html);
			}); 
		});    	
	});
};
// 페이지를 그려줍니다.
var drawPage = function(result, res, req, type){
	if(type=="login")
    	req.app.render("login", result, function(err, html) { res.end(html); });
	else if(type=="addSuccess")
		req.app.render("addSuccess", result, function(err, html) { res.end(html); });
	else if(type=="grade")
		req.app.render("grade", result, function(err, html) { res.end(html); });
	else if(type=="resume")
		req.app.render("resume", result, function(err, html) { res.end(html); });
	else if(type=="community")
		req.app.render("community", result, function(err, html) { res.end(html); });
	else if(type=="maker")
		req.app.render("maker", result, function(err, html) { res.end(html); });
	else if(type=="jobkorea")
		req.app.render("jobkorea", result, function(err, html) { res.end(html); });
};
module.exports.dash = dash;
module.exports.drawPage = drawPage