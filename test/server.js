import express from 'express';
const app = express();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});


// 访问日志
app.use(function (req, res, next) {
  // 示例输出: [2016-07-28 10:23:02] GET / 200 
  console.log(req.method.toUpperCase(),
    req.originalUrl,
    res.statusCode, new Date().toLocaleTimeString());
  next();
});
app.use('/', express.static('test'));

app.listen(3000, () => {
  console.log('go to http://localhost:3000/ to test in the browser');
  console.log('or `npm run test` in another window');
});
