const express = require('express');
const stripe = require('stripe')('your_stripe_secret_key');

const app = express();

app.post('/', async (req, res)=>{
    const email = req.body.email;
    const amount = parseInt(parseFloat(req.body.amount).toFixed() * 100);

    const customer = await stripe.customers.create({
        email,
        description: 'Classic sunglasses purchase'
    });

    const payment = await stripe.paymentIntents.create({
        customer: customer.id,
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
    });

    const client_secret = payment.client_secret;

    // const token = req.body.token;
    // console.log('token',token);
    // console.log('payment', payment);

    res.send({client_secret});
    res.end();

    // const charge = await stripe.charges.create({
    //     amount: '2000',
    //     currency: 'usd',
    //     source: token,
    //     description: customer.description
    // }).catch(error=>console.log('error occurred', error));
    //console.log(customer);
});

app.post('/refund', async (req, res)=>{
    const payment_intent = req.body.payment_intent;

    await stripe.refunds.create({
        payment_intent
    })
    .then(refund=>{
        console.log(refund);
        res.send({status: true, refund});
        res.end();
    })
    .catch(error=>{
        console.log(error.message);
        res.send({status: false, msg: error.message});
        res.end();
    });

    // res.send({refund});
    // res.end();
});

module.exports = app;