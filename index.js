const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');
const { dockStart } = require('@nlpjs/basic');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

let nlp, client = 1;

const nlpset = async (clientNumber) => {
  console.log(clientNumber)
  nlp = null;
  const dock = await dockStart({ use: ['Basic'] });
  nlp = dock.get('nlp');
  nlp.addLanguage('en');

  defaultQuestion.map(item => {
    nlp.addDocument('en', item.question, `${item.intent}`)
    nlp.addAnswer('en', `${item.intent}`, item.answers)
  });

  if (clientNumber == 1)
    clientOne.map(item => {
      nlp.addDocument('en', item.question, `treament${item.intent}`)
      nlp.addAnswer('en', `treament${item.intent}`, item.answer)
    });
  if (clientNumber == 2)
    clientwo.map(item => {
      nlp.addDocument('en', item.question, `treament${item.intent}`)
      nlp.addAnswer('en', `treament${item.intent}`, item.answer)
    });
  nlp.addAnswer('en', `None`, 'Sorry I did not understand you')
  await nlp.train();
}

(async () => {
  nlpset(1);
})();

let defaultQuestion = [
  {
    intent: "agent.hey", question: "Hi", answers: "Hi, how can I help you ?"
  },
  {
    intent: "agent.hey", question: "Hello", answers: "Hello, how can I help you ?"
  },
  {
    intent: "agent.hey", question: "Hello there", answers: "Hey there welcome to bot, How can I help you "
  },
  {
    intent: "agent.hey", question: "How are you", answers: "Hey , great you are here"
  },
  {
    intent: "agent.hey", question: "Hey whatsapp ?", answers: "Hello, good to see you"
  },

  {
    intent: "agent.how", question: "How are you ?", answers: "Hello, I am fine"
  },
  {
    intent: "agent.how", question: "How are you doing  ?", answers: "I am totally fine , tell me about you"
  },
  {
    intent: "agent.how", question: "Hello everything is good ?", answers: "I am fine , what about you"
  },

  {
    intent: "agent.good", question: "You are very good", answers: "Than you so much , there is alot for me to learn yet"
  },
  {
    intent: "agent.good", question: "You works fine", answers: "Thanks , I am trying my best"
  },
  {
    intent: "agent.good", question: "You works very fine", answers: "Thank you"
  },

  {
    intent: "agent.useless", question: "You are useless", answers: "Sorry for you trouble, I will improve knowledge soon"
  },
  {
    intent: "agent.useless", question: "You are not good", answers: "Sorry for you trouble, I will improve knowledge soon"
  },
  {
    intent: "agent.useless", question: "you are worst", answers: "Sorry for you trouble, I will improve knowledge soon"
  }
];

let clientOne = [
  {
    intent: "q1", question: "What is aligner ?",
    answer: "Clear aligners are orthodontic devices that are a transparent, plastic form of dental braces used to adjust teeth."
  },
  {
    intent: "q2", question: "What are aligners used for?",
    answer: " Clear Aligners are transparent trays made of special material which are used to straighten teeth just like braces."
  },
  {
    intent: "q3", question: "Is aligners better than braces?",
    answer: "Generally speaking, aligners are more comfortable than braces."
  },
  {
    intent: "q4", question: "Do teeth aligners really work?",
    answer: "Yes it works"
  },
  {
    intent: "q5", question: "Are aligners safe?",
    answer: "Yes its safe"
  },
  {
    intent: "q6", question: "Are aligners painful?",
    answer: "In most cases, pain or discomfort will occur when the Invisalign® aligners are first fitted and when aligner trays are changed, about every two weeks. For most,"
  },
]

let clientwo = [
 {
    intent: "q1", question: "Are aligners expensive?",
    answer: "The average cost, according to the manufacturer, is between Rs. 1,50,000-Rs. ... "
  },
  {
    intent: "q2", question: "Which is cheaper braces or aligners?",
    answer: "You may pay between $3,000 and $7,350 for traditional braces."
  },
  {
    intent: "q3", question: "Is aligners better than braces?",
    answer: "Yes its way better that braces"
  },
  {
    intent: "q4", question: "Do teeth aligners really work?",
    answer: "If you're considering teeth straightening options, you've no doubt questioned which you should choose between clear aligners like Invisalign and conventional braces."
  },
  {
    intent: "q5", question: "Are aligners safe?",
    answer: "“Teeth aligners, when under the direct supervision of an orthodontist, are indeed safe and highly effective at achieving tooth movement,”"
  },
  {
    intent: "q6", question: "Are clear aligners permanent?",
    answer: "This is a common practice in orthodontics and you will receive instructions on wearing the retainer all day initially and for shorter periods gradually."
  },
]

// exports.botAnswer = async (request, response) => {

//   const res = await nlp.process('en', request.body.name);
//   console.log(response);

//   send({ response, statusCode: statusCode.SUCCESS, message: "Done", result: res });
// }

io.on('connect', async (socket) => {
  socket.on('join', ({ name }, callback) => {
    console.log(name, "Joined socket room")
    socket.join("1");
    socket.emit('message', { admin: 'doctor', text: `${name}, Welcome to doctor AI bot.` });
    callback();
  });

  socket.on('sendMessage', async (message, callback) => {
    const res = await nlp.process('en', message);
    io.to("1").emit('message', { user: "doctor", text: res.answer });

    console.log(res)
    callback();
  });

  socket.on('changeClient', async (clientNumber, callback) => {
    await nlpset(clientNumber);
    io.to("1").emit('message', { user: "doctor", text: `Clinet ${clientNumber} is Active now` });
    callback();
  });

  socket.on('disconnect', () => {

  })
});

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));