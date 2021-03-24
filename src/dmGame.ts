import { MachineConfig, send, Action, assign, actions } from "xstate";
import { questionList, bool, complimentsGame} from './grammars/gameList';
import { mapContext } from "xstate/lib/utils";
//import { cancel } from "xstate/lib/actionTypes";
const { cancel } = actions;

const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://time-line-game.herokuapp.com/model/parse'
const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://localhost:3000/react-xstate-colourchanger' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json());

const list = questionList
const boolGrammar = bool
const compliments = complimentsGame

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}


function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

function random_event() {
      const length = Object.keys(list).length
      let random_number = Math.floor((Math.random() * (length)) + 0);
      let random_obj = list[Object.keys(list)[random_number]];
      const event_random = random_obj;
      delete list[random_obj.key]
    return event_random;
    }

function random_compliment() {
      const length = Object.keys(compliments).length
      let random_number = Math.floor((Math.random() * (length)) + 0);
      let random_obj = compliments[Object.keys(compliments)[random_number]];
      const compliment_random = random_obj;
    return compliment_random;
    }

//const round1 = random_event()


function promptAndAsk(prompt: Action<SDSContext, SDSEvent>): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
        initial: 'prompt',
        states: {
            prompt: {
                entry: prompt,
                on: {  ENDSPEECH:  [
                { target: "ask", actions: [ (context) => console.log(list), assign((context) => { return {count: context.count + 1 }}) ]},
                    
                    ]}
            },
            ask: {
                entry: [send('LISTEN'), 
                send ('MAXSPEECH', {
                      delay: 5000  ,
                    id: 'maxsp'})],
            },
        }
    })
}


const commands = {"help": "H", "stop": "S"}
const answers = {"before": "B", "after": "A"}
const answersNumeric = {"1": "1", "2": "2", "3":"3"}


export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'ask'
            }
        }, 
        help: {
            entry: say("It seems that you need some help. Let's try again."),
            always:[{target: 'ask.hist', actions: assign((context) => { return {count: (context.count - 1) }}) }] },

        maxspeech1: {
            entry: say("Sorry, I can't hear you."),
            on: { 'ENDSPEECH': 'ask.hist' },  

        },

        stop: {
            entry: say("Ok"),
            always: 'init'
        },

        query: {
            invoke: {
                id: 'rasa',
                src: (context, event) => nluRequest(context.query),
                onDone: {
                    target: '#compare',
                    cond: (context) => !(context.recResult === 'help'),
                    actions: [assign((context) => { return {yearString: context.object.yearString }}), assign((context, event) => { return {intentbest: event.data.intent.name }}),
                            (context:SDSContext, event:any) => console.log(event.data), cancel('maxsp'), ]
                },
                onError: {
                    target: 'ask.hist',
                    cond: (context) => !(context.recResult === 'help'),
                    actions: [cancel('maxsp'), (context,event) => console.log(event.data)]
                     }
                }
        },


        ask: {
        initial: 'welcome',
            on: {RECOGNISED: [
                    { target: 'help', 
                    cond: (context) => context.recResult === 'help' },

                    { target: 'stop', 
                    actions: cancel('maxsp'),
                    cond: (context) => context.recResult === 'stop'
                },]},
            states: {
                hist: { type: "history" },
                welcome: {
                    entry: assign((context) => { return {count: 0 }}),
                    id: "wlcm",
                    initial: "prompt",
                    on: { RECOGNISED:
                    [{cond: (context) => (boolGrammar[context.recResult] === false),
                        target: "#rules", actions: [ 
                            cancel('maxsp'),
                            assign((context) => { return {object: random_event()}}),
                            assign((context) => { return {object1: random_event()}}),
                            assign((context) => { return {count: 0 }}), 
                            assign((context) => { return {event: context.object1.event }}),
                            assign((context) => { return {stringAns: context.object1.stringAnswer}}),
                            assign((context) => { return {yearstringActual: context.object1.yearString }}),
                            assign((context) => { return {question: context.object1.question }}),
                            assign((context) => { return {answers: context.object1.answers } }),
                            assign((context) => { return {correctAnswer: context.object1.correctAnswer }}  ), 
                            assign((context) => { return {eventYear: context.object1.year } }), 
                            assign((context) => { return {pointsUser: 0 }}),

                            assign((context) => { return {year: context.object.year } }),
                            assign((context) => { return {eventCompare: context.object.event }}),
                            assign((context) => { return {yearString: context.object.yearString }}),
                            ]
                        },
                        {cond: (context) => (boolGrammar[context.recResult] === true),
                            target: "#question", actions: [ 
                                cancel('maxsp'),
                                assign((context) => { return {object: random_event()}}),
                                assign((context) => { return {object1: random_event()}}),
                                assign((context) => { return {count: 0 }}), 
                                assign((context) => { return {event: context.object1.event }}),
                                assign((context) => { return {yearstringActual: context.object1.yearString }}),
                                assign((context) => { return {stringAns: context.object1.stringAnswer}}),
                                assign((context) => { return {question: context.object1.question }}),
                                assign((context) => { return {answers: context.object1.answers } }),
                                assign((context) => { return {correctAnswer: context.object1.correctAnswer }}  ), 
                                assign((context) => { return {eventYear: context.object1.year } }), 
                                assign((context) => { return {pointsUser: 0 }}),
                                assign((context) => { return {year: context.object.year} }),
                                assign((context) => { return {eventCompare: context.object.event }}),
                                assign((context) => { return {yearString: context.object.yearString }}),
                            ]
                                
                        },
                    ],
                   
                    MAXSPEECH: '#root.dm.maxspeech1'
                },
                    states: {
                        prompt: {
                                ...promptAndAsk(send((context) => ({
                                    type: "SPEAK",
                                    value: `Welcome to Timeline. Do you know how to play?`}))),
                        },               
                    }
            },
            rules: {
                id: "rules",
                initial: "prompt",
                on: { ENDSPEECH: { target: "#question",}, },
                states: {
                    prompt: { entry: say(`You're going to hear a year of an event. You need to decide if one event happened before or after the second one. \
                    If you guess correctly, you get a point. If you do not manage to answer correctly, you will hear another question, \
                    where you need to decide, which answer is correct. You can do it by saying: 1, 2 or 3. \ 
                    If you cannot answer the second question, you lose. If you want to stop the game, just say stop. \
                    If you need help, just say help.\
                    Good luck!`) 
                    }
                }
            },
            question: {
                id: 'question',
                initial: "prompt",
                entry: assign((context) => { return {count: 0 }}),
                on: {
                    RECOGNISED: [

                        { target: "#root.dm.query", actions: [assign((context) => { return {correctAns: "after" }}),  assign((context) => { return {wrongAnswer: "before" }}), assign((context) => { return { query: context.recResult } })], 
                        cond: (context) => context.year < context.eventYear && !(context.recResult === 'help') &&  !(context.recResult === 'stop')},
                        { target: "#root.dm.query", actions: [assign((context) => { return {correctAns: "before" }}),  assign((context) => { return {wrongAnswer: "after" }}), assign((context) => { return { query: context.recResult } })], 
                        cond: (context) => context.year > context.eventYear && !(context.recResult === 'help') &&  !(context.recResult === 'stop')},
                       
                        { target: ".maxspeech",
                        actions: cancel('maxsp'),
                        cond: (context) => !(context.recResult === 'help') &&  !(context.recResult === 'stop') },
                    
                    ],
                    MAXSPEECH: '.maxspeech'
                        },
                
                states: {
                        prompt: {...promptAndAsk(send((context) => ({
                            type: "SPEAK",
                            value: `The year of ${context.eventCompare} is ${context.yearString}. Was ${context.event} earlier or later? What do you think?`})))
                        },
                        prompt1: {
                            ...promptAndAsk(send((context) => ({
                                type: "SPEAK",
                                value: `Was ${context.event} earlier or later? What do you think?`})))
                        },
                        prompt2: {
                            ...promptAndAsk(send((context) => ({
                                type: "SPEAK",
                                value: `What do you think?`})))
                        },
                        
                        maxspeech: {
                            entry: say("Sorry, I can't hear you."),
                            on: { ENDSPEECH : [{
                                cond: (context) => context.count === 0,
                                target: "prompt"},
                                {
                                cond: (context) => context.count === 1,
                                target: "prompt1"},
                
                                { target: "prompt2",
                                cond: (context) => context.count === 2},
                
                                { target: "#root.dm.init",
                                cond: (context) => context.count === 3},
                                
                            ]}
                        },
                        
                    }
            },
            compare: {
                id: "compare",
                initial: "prompt",
                on:{ 
                    ENDSPEECH: [{target: "correct", actions: [assign((context) => { return {pointsUser: (context.pointsUser +1) }}), 
                        assign((context) => { return {compliment: random_compliment() }})],
                                cond: (context) => context.correctAns === context.intentbest,
                        },
                        {target: "wrong", cond: (context) => context.wrongAnswer === context.intentbest,  actions:  [
                            assign((context) => { return {compliment: random_compliment() }})]  
                         },

                         {target: ".nomatch", cond: (context) => !(context.recResult === 'help') &&  !(context.recResult === 'stop')},
                        ],
                    
                },
                states: {
                        prompt: {entry: send((context) => ({
                            type: "SPEAK",
                            value: `Ok. Let's check.`}))

                        
                        }, 
                        nomatch: {
                            entry: say("Because the answer is not valid, you will hear the same question again."),
                            on: { ENDSPEECH: "#question" }},                 
                        
                    }
            },
            correct: {
                initial: "prompt",
                on: { 
                    ENDSPEECH: [{target: "final",  cond: (context) => context.pointsUser >= 5},
                                {target: "question", actions: [
                                    assign((context) => { return {eventCompare: context.event}}),
                                    assign((context) => { return {yearString: context.yearstringActual }}),
                                    assign((context) => { return {year: context.eventYear}}), 
                                    assign((context) => { return {object1: random_event()}}), 
                                    assign((context) => { return {event: context.object1.event } }),
                                    assign((context) => { return {eventYear: context.object1.year } }),
                                    assign((context) => { return {stringAns: context.object1.stringAnswer}}),
                                    assign((context) => { return {question: context.object1.question }}),
                                    assign((context) => { return {answers: context.object1.answers } }),
                                    assign((context) => { return {correctAnswer: context.object1.correctAnswer }} ),  
                                    assign((context) => { return {yearstringActual: context.object1.yearString }}),
                                
                                ],
                        
                },
                    ],
                },
                states: {
                    prompt: {entry: send((context) => ({
                        type: "SPEAK",
                        value: `Yes, correct. ${context.compliment}`}))
                    },                   
                }
            },
	        wrong: {
                entry: assign((context) => { return {count: 0 }}),
                initial: "prompt",
                on: { RECOGNISED: [ {target: "good", cond: (context) => context.correctAnswer === context.recResult, actions: assign((context) => { return {pointsUser: (context.pointsUser + 0.5) }}),
                                    },
                                    {target: "bad", cond: (context) => !(context.recResult === context.correctAnswer) && context.recResult in answersNumeric,},
                                    {target: ".maxspeech", actions: cancel('maxsp'), cond: (context) => !(context.recResult === 'help') &&  !(context.recResult === 'stop') }],
                    MAXSPEECH: '.maxspeech'
                },
                states: {
                    prompt: {...promptAndAsk(send((context) => ({
                        type: "SPEAK",
                        value: `No, sorry, you're wrong. Maybe you can answer this one.
                        ${context.question}. ${context.answers}.`})))
                    },  
                    prompt1: {
                        ...promptAndAsk(send((context) => ({
                            type: "SPEAK",
                            value: `Say 1, 2 or 3.`})))
                    },
                    prompt2: {
                        ...promptAndAsk(send((context) => ({
                            type: "SPEAK",
                            value: `Say 1, 2 or 3.`})))
                    },
                    
                    maxspeech: {
                        entry: say("Sorry"),
                        on: { ENDSPEECH : [{
                            cond: (context) => context.count === 0,
                            target: "prompt"},
                            {
                            cond: (context) => context.count === 1,
                            target: "prompt1"},
            
                            { target: "prompt2",
                            cond: (context) => context.count === 2},
            
                            { target: "#root.dm.init",
                            cond: (context) => context.count === 3},                           
                        ]}
                    },
                }
            },
	        good: {
                initial: "prompt",
                on: {
                    'ENDSPEECH': [{target: "final",  cond: (context) => context.pointsUser >= 5},
                    {target: "question",
                    actions: [ 
                        assign((context) => { return {eventCompare: context.event}}),
                        assign((context) => { return {yearString: context.yearstringActual }}),
                        assign((context) => { return {year: context.eventYear}}), 
                        assign((context) => { return {object1: random_event()}}),
                        assign((context) => { return {event: context.object1.event } }),
                        assign((context) => { return {eventYear: context.object1.year } }),
                        assign((context) => { return {stringAns: context.object1.stringAnswer}}),
                        assign((context) => { return {question: context.object1.question }}),
                        assign((context) => { return {answers: context.object1.answers } }),
                        assign((context) => { return {correctAnswer: context.object1.correctAnswer }}  ),
                        assign((context) => { return {yearstringActual: context.object1.yearString }}),                 
                    ],
                    
            },
        ],
                },
                states: {
                    prompt: {
                        entry: send((context) => ({
                            type: "SPEAK",
                            value: `Yes, that's correct. ${context.stringAns}. Your score is ${context.pointsUser}. ${context.compliment}`
                        })),
                    },                    
                }
            },
 	        bad: {
                initial: "prompt",
                on:  {
                    'ENDSPEECH': '#root.dm.init'
                },
                states: {
                    prompt: {
                        entry: send((context) => ({
                            type: "SPEAK",
                            value: `Sorry, that's not the correct answer. It was ${context.stringAns}. Your score is ${context.pointsUser}. Try again.`
                        })),},                    
                        },
                    },

                    final: {
                        initial: "prompt",
                        on: { ENDSPEECH: "#root.dm.init" },
                        states: {
                            prompt: {
                                entry: send((context) => ({
                                    type: "SPEAK",
                                    value: `Congrats, you won!`
                                }))
                            },
                        }
                    }
                }
            },
            
        } 
    })





 