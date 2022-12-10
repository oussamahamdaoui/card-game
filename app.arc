@app
card-game

@http
post /on-game-finished

@aws
# profile default
runtime typescript
region us-west-2
architecture arm64

@plugins
architect/plugin-typescript
