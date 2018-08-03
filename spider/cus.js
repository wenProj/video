// 取交集函数
const array_intersection = (a, b) => {
  var result = [];
  for(var i = 0; i < b.length; i ++) {
      var temp = b[i];
      for(var j = 0; j < a.length; j ++) {
          if(temp === a[j]) {
              result.push(temp);
              break;
          }
      }
  }
  return result;
}
//处理json数据
const test = (str)=> {
  var cusStr = JSON.stringify(str);
  var data= JSON.parse(cusStr);

  //拿到每个客户
  var arrTemp = [];
  for(cus in data.customers){
    var arr = [];
    //拿到每个客户的订单
    for(orders in data.customers[cus].orders){
      //拿到每个订单的商品
      for(products in data.customers[cus].orders[orders].products){
        arr.push(data.customers[cus].orders[orders].products[products].name);
      }
    }
    if(cus == 0){
      arrTemp = arr;
    }
    arrTemp = array_intersection(arrTemp,arr)
  }

  console.log(`交集：${arrTemp.toString()}`);
}

test({"customers":[{"name":"客户1","orders":[{"name":"订单1","products":[{"name":"鞋子"},{"name":"衣服"},{"name":"西红柿"}]},{"name":"订单2","products":[{"name":"衬衫"},{"name":"帽子"}]}]},{"name":"客户2","orders":[{"name":"订单1","products":[{"name":"西红柿"},{"name":"衣服"}]},{"name":"订单2","products":[{"name":"青椒"},{"name":"帽子"}]}]},{"name":"客户3","orders":[{"name":"订单1","products":[{"name":"西红柿"}]}]}]});

