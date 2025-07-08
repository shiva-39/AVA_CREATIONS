require('dotenv').config();
const exp = require('express')
const app = exp()
const helmet = require('helmet')
// const expressAsyncHandler = require('express-async-handler')
const morgan = require('morgan')
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const mongodb = require('mongodb').MongoClient

app.use(helmet());
app.use(morgan("common"));
app.use(exp.json({ limit: "10mb" })); // Increased limit for image uploads
const cors = require('cors')
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const path = require('path')
app.use(exp.static(path.join(__dirname, '../client/build')))

let cfg, users, admins, schemes
mongodb.connect(process.env.MONGO_URL)
  .then(client => {
    console.log('Connected to MongoDB successfully!')
    cfg = client.db('cfg-16')
    users = cfg.collection('users')
    admins = cfg.collection('admins')
    schemes = cfg.collection('schemes')
    app.set('users', users)
    app.set('admins', admins)
    app.set('schemes', schemes)
    console.log("DB connection established")
  })
  .catch(err => console.log("Error in DB", err))

const router = require('./routes/auth')
const schemeRouter = require('./routes/scheme')
const analyzeRouter = require('./routes/analyze')

app.use('/auth', router)
app.use('/scheme', schemeRouter)
app.use('/api/analyze', analyzeRouter)

app.use((err, req, res, next) => {
  res.send({ message: "Error occured", payload: err.message })
})

app.post('/voice', (request, response) => {
  // Use the Twilio Node.js SDK to build an XML response
  const twiml = new VoiceResponse();

  // Create a gather verb to collect user input
  const gather = twiml.gather({
    numDigits: 1,
    action: '/voice/menu',
    method: 'POST'
  });

  gather.say('Welcome to our IVR system. Press 1 for fire emergency, press 2 for crop damage, or press 3 for seeds and fertilizers.');

  // If no input is received, repeat the menu
  twiml.say('We did not receive any input. Goodbye!');

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});

// Handle menu selections
app.post('/voice/menu', (request, response) => {
  const twiml = new VoiceResponse();
  const digit = request.body.Digits;

  switch (digit) {
    case '1':
      twiml.say('You have selected fire emergency. This is a critical situation. Please stay calm and move to a safe location immediately.');
      twiml.say('Emergency services have been notified. A fire response team will be dispatched to your location within minutes.');
      twiml.say('If you are in immediate danger, hang up and call your local emergency number. Stay safe.');
      break;
    case '2':
      twiml.say('Here are pest control tips for your silk crops.');
      twiml.say('1. Always keep the rearing room clean and dry.');
      twiml.say('2. Use quicklime to disinfect the rearing trays.');
      twiml.say('3. Remove any dead or diseased larvae immediately.');
      twiml.say('4. Don\'t overcrowd silkworms. Give them space.');
      twiml.say('5. Use a neem spray or natural disinfectants every few days.');
      twiml.record({
        action: '/voice/crop-damage',
        method: 'POST',
        maxLength: 60
      });
      break;
    case '3':
      twiml.say('You have selected seeds and fertilizers. We offer high quality seeds and organic fertilizers for all crop types.');
      twiml.say('The seeds will be dispatched to you shortly');
      twiml.gather({
        numDigits: 1,
        action: '/voice/seeds-menu',
        method: 'POST'
      });
      break;
    default:
      twiml.say('Invalid selection. Please try again.');
      twiml.redirect('/voice');
      break;
  }

  response.type('text/xml');
  response.send(twiml.toString());
});

// Handle recording completion for technical support
app.post('/voice/recording', (request, response) => {
  const twiml = new VoiceResponse();

  twiml.say('Thank you for your message. Our technical team will review your request and get back to you within 24 hours.');
  twiml.say('Goodbye!');

  response.type('text/xml');
  response.send(twiml.toString());
});

// Handle crop damage recording completion
app.post('/voice/crop-damage', (request, response) => {
  const twiml = new VoiceResponse();

  twiml.say('Thank you for reporting the crop damage. We have recorded your information.');
  twiml.say('Our agricultural specialist will assess your case and contact you within 12 hours with support options and potential compensation details.');
  twiml.say('You will also receive a reference number via SMS for tracking your case. Take care and we hope to help restore your crops soon.');

  response.type('text/xml');
  response.send(twiml.toString());
});

// Handle seeds and fertilizers submenu
app.post('/voice/seeds-menu', (request, response) => {
  const twiml = new VoiceResponse();
  const digit = request.body.Digits;

  switch (digit) {
    case '1':
      twiml.say('You selected vegetable seeds. We have premium quality seeds for tomatoes, carrots, beans, peppers, and leafy greens.');
      twiml.say('Our vegetable seed catalog includes both hybrid and organic varieties. Prices start from 50 rupees per packet.');
      twiml.say('To place an order, please visit our website or call back during business hours from 9 AM to 6 PM. Thank you!');
      break;
    case '2':
      twiml.say('You selected grain seeds. We offer certified seeds for wheat, rice, corn, millet, and barley.');
      twiml.say('All grain seeds are tested for high germination rate and disease resistance. Bulk discounts available for orders above 100 kilograms.');
      twiml.say('For pricing and availability, please speak with our grain specialist during business hours. Thank you!');
      break;
    case '3':
      twiml.say('You selected fertilizer information. We provide organic and chemical fertilizers suitable for all soil types and crops.');
      twiml.say('Our fertilizer range includes NPK compounds, organic compost, and specialized crop nutrients.');
      twiml.say('Free soil testing service available. Our fertilizer expert will recommend the best products for your specific needs. Thank you!');
      break;
    case '0':
      twiml.say('Connecting you to our agriculture specialist. Please hold while we transfer your call.');
      twiml.play('http://com.twilio.music.classical.s3.amazonaws.com/BusyStrings.wav');
      break;
    default:
      twiml.say('Invalid selection. Returning to main menu.');
      twiml.redirect('/voice');
      break;
  }

  response.type('text/xml');
  response.send(twiml.toString());
});

let port = process.env.PORT || 4000
app.listen(port, () => console.log(`Listening in on ${port}`))