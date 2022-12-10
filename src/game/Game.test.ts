import { parseGame, GameParseError } from './Game';
import { expect, test } from '@jest/globals';

test('Throw on empty game string', () => {
    expect(() => {
        parseGame();
    }).toThrow(GameParseError);

    expect(() => {
        parseGame('');
    }).toThrow(GameParseError);
});

test('Throws on wrong trump value', () => {
    expect(() => {
        parseGame('Z#AS-KS-QS-TS#Marie,Fred,Clément,Bastien');
    }).toThrow(GameParseError);

});

test('Returns a valid game object', () => {

    expect(parseGame('S#AS-KS-QS-TS#Marie,Fred,Clément,Bastien')).toEqual({
        "players": [
            "Marie",
            "Fred",
            "Clément",
            "Bastien",
        ],
        "state": [
            "AS",
            "KS",
            "QS",
            "TS",
        ],
        "trump": "S",
    });
});

test('Throws on unvalid card', () => {

    expect(() => {
        parseGame('S#AWZ-KS-QS-TS#Marie,Fred,Clément,Bastien');
    }).toThrow(GameParseError);
});