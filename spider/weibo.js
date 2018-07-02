
// 引入依赖
var express = require('express');
//var utility = require('utility');
//var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
 
// 建立 express 实例
var app = express();
 
var Url = 'http://tiyu.baidu.com/match/%E4%B8%96%E7%95%8C%E6%9D%AF/from/baidu_aladdin';
 
superagent.get(Url).end(function (err, response) {
    if (err) {
      return console.error(err);
    }
    console.log(response.redirects[0]);
    console.log(response.text);
    var topicUrls = [];
    var $ = cheerio.load(response.text);
    var script1 = $(this).html();
    console.log(script1);
});

app.get('/queryAmazonData', function (req, res, next) {
    // res.setHeader('200', 'Content-Type', 'text/html;charset=utf-8');
    // res.send('Hello World1');
    // res.end('sww');
    Url = req.query.url;
    console.log(Url);
    superagent.get(Url)
    .end(function (err, response) {
        if (err) {
          return console.error(err);
        }
        var topicUrls = [];
        var $ = cheerio.load(response.text);
        var script1 = $(this).html();
        $('#twisterJsInitializer_feature_div>script').each(function () {
            var script = $(this).html();
            // script就是js代码了
            // console.log(script);
            var str = script.replace("P.register('twister-js-init-dpx-data', function()", '');
            str = str.replace('var dataToReturn =', '');
            var array = str.split(',\n');
            // console.log(array);
 
            var ljlistItem = '';
            for (var i in array) {
                var data = array[i];
                if ( data.indexOf('dimensionToAsinMap') != -1){
                    // console.log(data);
                    // 7.将商品id的str组合转化为dict
                    ljlistItem = data.trim().replace('"dimensionToAsinMap" : ', '');
                }
            }
            // 将商品id的str组合转化为dict
            var dict = JSON.parse(ljlistItem);
            // console.log(dict);
 
            // 8函数替换，将商品的id替换掉
            var strlist = '';
            var splitstr = '';
 
            if(Url.indexOf('dp/') != -1){
                strlist = Url.split('dp/'); //'dp/'
                splitstr = 'dp/';
            } else if (Url.indexOf('d/') != -1){
                strlist = Url.split('d/');  // 'dp/'
                splitstr = 'd/';
            }
 
            // console.log(`strlist:${strlist}\n`);
            var ljlength = strlist[1].indexOf('/');
            var ljstr = strlist[1];
            // console.log(`ljlength:${ljlength}\n`);
            // console.log(`ljstr:${ljstr}\n`);
            strlist[1] = ljstr.slice(10,ljstr.length);
            // console.log(strlist[1]);
 
            // 9.遍历字典，根据id来拼接商品详情的url
            var urlArray = [];
            for(var key in dict) {
                // console.log(`value:${dict[key]}\n`);
                var  tempurl = strlist[0] + splitstr + dict[key] + strlist[1] + '&th=1&psc=1';
                console.log(`5.每个商品的跳转url:${tempurl}\n`);
                urlArray.push(tempurl);
                // yield Request(tempurl, callback=self.parse_productdetail);
            }
 
            var ep = new eventproxy();
            //接收到全部的商品信息后，返回给前端的接口
            ep.after('topic_html', urlArray.length, function (topics) {
            topics = topics.map(function (topicPair) {
                var topicUrl = topicPair[0];
                var topicData = topicPair[1];
                return ({
                    // topicUrl: topicUrl,
                    topicData: topicData,
                });
            });
    
            console.log('final:');
            console.log(topics);
            // res.setHeader('200', 'Content-Type', 'text/html;charset=utf-8');
            // res.send('Hello World1');
            res.send(topics);//返回商品信息给前端
            // document.write(localStorage.topics);
            });
 
            urlArray.forEach(function (topicUrl) {
                superagent.get(topicUrl)
                    .end(function (err, response1) {
                    // console.log('fetch ' + topicUrl + ' successful');
 
                    var $ = cheerio.load(response1.text);
                    //商品价格
                    price = $('#priceblock_ourprice').text().trim();
                    //商品名称
                    name = $('#productTitle').text().trim();
                    //尺寸
                    size = $('#dropdown_selected_size_name>span>span').text().trim();
                    //颜色
                    color = $('#variation_color_name>div>span').text().trim();
                    // 打折信息
                    discount = $('#applicable_promotion_list_sec>table>tr>td>span[3]>span>a[2]>span>span>span').text().trim();
 
                    //3.提取商品运费和税费 tbody不用添加
                   fee = $('#ags_shipping_import_fee').text().trim();
 
                    //4.海外购标识
                    overseapurchas = $('#agsBadge').attr('src');
                    if (overseapurchas != ''){
                        overseapurchas = 'haitao'
                    }
 
                    //5.根据是否有海外购的标识来选择prime的获取路径
                    prime = '';
                    if (overseapurchas.trim() == ''){ //没有海外购
                        //国内-免运费
                        prime = $('#price-shipping-message>i>i>span').text().trim();
                    } else if (overseapurchas.trim() != '') { //有海外购标识
                        //海外购-免运费
                        prime = $('#price-shipping-message>div>i>i>span').text().trim();
                    }
                    if (prime.length > 0){
                        prime = 'prime';
                    }
                      
                    // console.log(`price:${price}\n`);
                    // console.log(`name:${name}\n`);
                    // console.log(`size:${size}\n`);
                    // console.log(`color:${color}\n`);
                    // console.log(`discount:${discount}\n`);
                    // console.log(`fee:${fee}\n`);
                    // console.log(`overseapurchas:${overseapurchas}\n`);
                    // console.log(`prime:${prime}\n`);
                    
                    // 输出model信息
                    const object = {};
                    object.price = price;
                    object.name = name;
                    object.size = size;
                    object.color = color;
                    object.discount = discount;
                    object.overseapurchas = overseapurchas;
                    object.fee = fee;
                    object.prime = prime;
                    // 获取到全部的商品信息后发送出去（topic_html）
                    ep.emit('topic_html', [topicUrl, object]);
                    });
                });
        });
 
    });
});
 
// app.use(function(req, res, next) {
//     res.status(404).send('Sorry cant find that!');
// });
 
app.get('/index.html', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
 });
 
app.get('/process_get', function (req, res) {
 
    // 输出 JSON 格式
    var response = {
        "first_name":req.query.first_name,
        "last_name":req.query.last_name
    };
    // document.write(localStorage.topics);
    console.log(response);
    // res.end(JSON.stringify(localStorage.topics));
 });

// app.listen(3000, function (req, res) {
//    console.log('app is running at port 3000');
// });