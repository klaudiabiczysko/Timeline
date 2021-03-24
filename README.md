### Timeline
Timeline - project game for Dialogue Systems at Gothenburg University
Klaudia Biczysko and Justyna Sikora


## General info
The gamer gets a year and need to decide if the presented discovery/invention happened before or after.
If user answers correctly, he scores a point and needs to decide if another invention happened before or after the one which was presented beforehand.
If user's answer is wrong, he gets one more question and needs to decide which answer
out of three is the correct one.
If he answers correctly, he does get a half point, but is being saved and continue the game. If user cannot answer the second question, he loses. 
The round consists of 5 basic questions. If user answers correctly for each of them, he wins the round. 
All inventions happened in XIX and XX century.

##Technicalities
Project is created with:
* Statecharts
* Heroku
* RASA
* Typescript
* React

(React component adapted from github.com/vladmaraev/react-xstate-colourchanger)
(React + xstate + Webspeech API & Natural.js)

## Challenges
* Assigning and reassigning data to context.
Since the game heavily relies on comparing dates and events, it was crucial to correctly store the data, so the compared events would not be mixed up.
* The intent classification.
When we said something like "wash the dishes", it was recognized as "after" with 99% accuracy. We managed to fix that by adding the rule that if the entity is not one of the intents 'before' or 'after', it says that the answer is not valid and asks the question once again.

## Rules
In the beginning, you'll hear a question whether you know how to play. If you want to hear the rules, say "no", if not, say "yes".
You're going to hear a year of an event. You need to decide if one event happened before or after the second one. If you guess correctly, you get a point. If you do not manage to answer correctly, you will hear another question, where you
need to decide, which answer is correct. You can do it by saying: "1", "2" or "3". If you cannot answer the second question, you lose. 
If you want to stop the game, just say "stop". If you need help, just say "help".
Good luck!
