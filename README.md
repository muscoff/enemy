# enemy

This application is a fullstack javascript application using React as a frontend library, 
Node-Express as a backend service, MySQL as the chosen database and Stripe Api as the test payment API

This application is a mockup of a US-based company website called Enemy
The original website was developed using React and so I developed the mockup with React to match it

One interesting thing I would with the original website is that, there is no state manager in the application and so when 
items are added to the cart, the data is sent to an external url to store that data.
Also when I item is removed from the cart, a request is made to an external url for the item to be removed which does not provide
a smooth action flow.

In the mockup version I created, I used a state manager, the Context API to manage the state of the application so that there can be smooth
flow of action from adding items to cart, updating items in the cart and also removing items from the cart.

I also integrated the application with Stripe to accept payment - For testing purposes.
