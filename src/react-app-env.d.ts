/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    nluData: any;
    ttsAgenda: string;
    intentbest: any,
    query: any,
    count: any,
    year: any,
    event: any,
    eventYear: number,
    correctAns: any,
    question: any,
    correctAnswer: any,
    answers: any,
    stringAns: any,
    object: any,
    pointsUser: number,
    wrongAnswer: any,
    compliment: any,
    eventCompare: any,
    yearCompare: any,
    yearString: string,
    object1: any,
    yearActual: any,
    yearstringActual: any,
    eventActual: any,

   

}

type SDSEvent =
    | { type: 'CLICK' }
    | { type: 'MAXSPEECH' }
    | { type: 'RECOGNISED' }
    | { type: 'ASRRESULT', value: string }
    | { type: 'ENDSPEECH' }
    | { type: 'LISTEN' }
    | { type: 'SPEAK', value: string };
