import { parseGame, getGameResult, formatResult, GameParseError } from '../../game/Game';

export async function handler(req) {
    try {
        const gameString = JSON.parse(req.body).gemeString;
        const game = parseGame(gameString);
        const result = formatResult(getGameResult(game));
        return {
            statusCode: 200,
            headers: {
                'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
                'content-type': 'text/html; charset=utf8'
            },
            body: JSON.stringify({
                result,
            }),
        }
    } catch (err) {
        const isParsingError = err instanceof GameParseError;
        return {
            statusCode: isParsingError ? 400 : 500,
            headers: {
                'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                error: true,
                message: isParsingError ? err.message : '',
            }),
        }
    }
}