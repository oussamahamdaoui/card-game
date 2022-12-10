

type Sute = 'S' | 'H' | 'D' | 'C';
type Trump = Sute;
type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
type Card = `${Value}${Sute}`;

type Game = {
    trump: Trump,
    state: Card[],
    players: [string, string, string, string],
}

type Result = {
    players: [string, string],
    score: number,
}[];

const TRUMP_SEPARATOR = '#';
const STATE_SEPARATOR = '#';
const PLAYERS_SEPARATOR = ',';
const CARD_SEPARATOR = '-';

const POINTS_SEPARATOR = '-';
const SCORE_SEPARATOR = '#';
const TEAM_SEPARATOR = '-';

const SUTES: Sute[] = ['S', 'H', 'D', 'C'];
const VALUES: Value[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const NB_OF_PLAYERS = 4;


const PLAYER_N = 0;
const PLAYER_E = 1;
const PLAYER_S = 2;
const PLAYER_W = 3;


export class GameParseError extends Error {
    constructor(message) {
        super(message);
        // Not required, but makes uncaught error messages nicer.
        this.name = 'new GameParseError';
    }
}

const indexOfMax = (arr: number[]) => {
    let maxIndex = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[maxIndex] < arr[i]) {
            maxIndex = i;
        }
    }
    return maxIndex;
}


const parseTrump = (gameString: string, currntPosition: number): [Trump, number] => {
    const trump = gameString[currntPosition] as Trump;
    if (!SUTES.includes(trump)) {
        throw new GameParseError(`Game string must start with a valid sute ${SUTES.join(',')} found ${trump} at position ${currntPosition}`);
    }
    return [trump, currntPosition + 1];
}

const parseState = (gameString: string, currntPosition: number): [Card[], number] => {
    const cards: Card[] = [];
    if (gameString[currntPosition] !== TRUMP_SEPARATOR) {
        throw new GameParseError(`Expected ${TRUMP_SEPARATOR} but got ${gameString[currntPosition]} at position ${currntPosition}`);
    }
    currntPosition++;
    while (gameString[currntPosition] !== undefined) {
        const value = gameString.substring(currntPosition, currntPosition + 1) as Value;
        if (!VALUES.includes(value)) {
            throw new GameParseError(`Expected ${VALUES.join(',')} but got ${gameString[currntPosition]} at position ${currntPosition}`)
        }
        currntPosition += 1;
        const sute = gameString.substring(currntPosition, currntPosition + 1) as Sute;
        if (!SUTES.includes(sute)) {
            throw new GameParseError(`Expected ${VALUES.join(',')} but got ${gameString[currntPosition]} at position ${currntPosition}`)
        }
        currntPosition += 1;
        const cardOrStateSeparator = gameString[currntPosition];
        if (![CARD_SEPARATOR, STATE_SEPARATOR].includes(cardOrStateSeparator)) {
            throw new GameParseError(`Expected ${[CARD_SEPARATOR, STATE_SEPARATOR].join(',')} but got ${gameString[currntPosition]} at position ${currntPosition}`);
        }
        cards.push(`${value}${sute}`);
        if (gameString[currntPosition] === STATE_SEPARATOR) {
            break;
        }
        currntPosition += 1;
    }
    if (cards.length % NB_OF_PLAYERS !== 0) {
        throw new GameParseError(`The number of cards should be a multiple of ${NB_OF_PLAYERS} but found ${cards.length}`);
    }
    if (Array.from(new Set(cards)).length !== cards.length) {
        throw new GameParseError(`Each card should be uniqe in the state`);
    }
    return [cards, currntPosition];
}

const parsePlayers = (gameString: string, currntPosition: number): [Game['players'], number] => {
    if (gameString[currntPosition] !== STATE_SEPARATOR) {
        throw new GameParseError(`Expected ${STATE_SEPARATOR} but got ${gameString[currntPosition]} at position ${currntPosition}`);
    }
    currntPosition++;
    const players: string[] = [];
    let player = '';
    while (gameString[currntPosition] !== undefined) {
        if (gameString[currntPosition] === PLAYERS_SEPARATOR) {
            players.push(player);
            player = '';
        } else {
            player += gameString[currntPosition];
        }
        currntPosition++;
    }
    players.push(player);
    if (players.length !== NB_OF_PLAYERS) {
        throw new GameParseError(`Nuber of player should be ${NB_OF_PLAYERS} but found ${players.length}`);
    }
    return [players as Game['players'], currntPosition];
}

export const parseGame = (gameString = ''): Game => {
    let pos = 0;
    let trump: Trump;
    let state: Card[];
    let players: Game['players'];

    [trump, pos] = parseTrump(gameString, pos);
    [state, pos] = parseState(gameString, pos);
    [players, pos] = parsePlayers(gameString, pos);


    const game: Game = {
        trump,
        state,
        players,
    }
    return game;
}

export const getGameResult = (game: Game): Result => {
    const {
        players,
        state,
        trump,
    } = game;
    let startingPlayer = PLAYER_N;
    let scoreTeamEW = 0;
    let scoreTeamNS = 0;
    let trick = 0;
    let totalScore = [0, 0, 0, 0];

    while (trick < state.length) {
        let currentTrick = state.slice(trick, trick + NB_OF_PLAYERS);
        let scores = [0, 0, 0, 0];
        for (let i = 0; i < NB_OF_PLAYERS; i++) {
            let player = (startingPlayer + i) % NB_OF_PLAYERS;
            const value = currentTrick[i][0] as Value;
            const sute = currentTrick[i][1] as Sute;
            const cardValue = VALUES.indexOf(value) + 1;
            const multiplier = i === 0 ? 0 : (sute === trump ? 2 : 1);
            scores[player] = cardValue * multiplier;
        }
        startingPlayer = indexOfMax(scores);
        totalScore = totalScore.map((e, i) => e + scores[i]);
        trick += NB_OF_PLAYERS;
    }

    scoreTeamEW += totalScore[PLAYER_N] + totalScore[PLAYER_S];
    scoreTeamNS += totalScore[PLAYER_E] + totalScore[PLAYER_W];

    let teamEW = [players[PLAYER_N], players[PLAYER_S]] as [string, string];
    let teamNS = [players[PLAYER_E], players[PLAYER_W]] as [string, string];

    teamEW = (totalScore[PLAYER_N] > totalScore[PLAYER_S] ? teamEW : teamEW.reverse()) as [string, string];
    teamNS = (totalScore[PLAYER_E] > totalScore[PLAYER_W] ? teamNS : teamNS.reverse()) as [string, string];
    return [
        {
            players: teamEW,
            score: scoreTeamEW,
        },
        {
            players: teamNS,
            score: scoreTeamNS,
        }
    ].sort((a, b) => a.score - b.score);
}

export const formatResult = (gameResult: Result): string => {
    return `${gameResult[0].score}${POINTS_SEPARATOR}${gameResult[1].score}${SCORE_SEPARATOR}${gameResult[0].players.join(PLAYERS_SEPARATOR)}${TEAM_SEPARATOR}${gameResult[1].players.join(PLAYERS_SEPARATOR)}`;
}
