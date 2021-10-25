const express = require('express');
const cors = require('cors');
const admin = require('./api/admin');
const slideshow = require('./api/slideshow');
const generalImages = require('./api/generalimages');
const productsImages = require('./api/productimages');
const quote = require('./api/quote');
const style = require('./api/style');
const carry = require('./api/carry');
const custom = require('./api/custom');
const products = require('./api/products');
const payment = require('./api/payment');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.use('/api/admin', admin);
app.use('/api/slideshow', slideshow);
app.use('/api/quote', quote);
app.use('/api/style', style);
app.use('/api/carry', carry);
app.use('/api/custom', custom);
app.use('/api/products', products);
app.use('/api/payment', payment);
app.use('/images/general', generalImages);
app.use('/images/products', productsImages);


// app.get('/api/post/:year/:month', (req, res)=>{
//     let obj = req.params;
//     obj.sort = req.query;
//     res.send(obj);
// });

app.listen(port, ()=>console.log(`Listening on http://localhost:${port}`));