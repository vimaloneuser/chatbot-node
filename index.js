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
  { intent: "q1", question: "What is aligner ?", answer: "aligner is teeth treatment pack." },
  { intent: "q2", question: "When to use aligner ?", answer: "You should aligner when your teeth become in bad shape" },
  { intent: "q3", question: "Is aligner treatment is usefull for teeth ?", answer: "Yes aligner is very good treatment." }
]

let clientwo = [
  { intent: "q1", question: "What is aligner ?", answer: "aligner is nothing." },
  { intent: "q2", question: "When to use aligner ?", answer: "Do not use aligner" },
  { intent: "q3", question: "Is aligner treatment is usefull for teeth ?", answer: "No it in not usefull" }
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