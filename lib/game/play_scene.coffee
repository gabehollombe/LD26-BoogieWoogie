window.getRandomInt = (min, max) -> return Math.floor(Math.random() * (max - min + 1)) + min

ig.module("game.play_scene")
.requires(
  "impact.game",
  "impact.font",

  "plugins.scene_manager",

  "game.imageblender",
  "game.entities.square"
  "game.entities.player"
  "game.entities.hud"
).defines ->
  ENTITY_SIZE = 8
  INITIAL_SPAWN_TIME = 2
  MAX_OTHERS = 12

  window.PlayScene = Scene.extend
    font: new ig.Font("media/04b03.font.png")

    init: (manager) ->
      @manager = manager
      @bindKeys()
      @spawn_others_timer = new ig.Timer(INITIAL_SPAWN_TIME)
      window.Game = this

    reset: ->
      @player = @spawnEntity(
        EntityPlayer, ig.system.width / 2, ig.system.height / 2,
        {
          width: 8,
          height: 8,
          color: 'red',
          game: this
          dieCallback: ((args) => @gameOver(args))
        }
      )
      @player.reset()
      @hud = @spawnEntity(EntityHud, {player: @player})
      @field = {width: ig.system.width, height: ig.system.height - @hud.height - 10}

    # Initialize your game here; bind keys etc.
    update: ->
      # Update all entities and backgroundMaps
      @parent()
      @updatePlayerXY()
      @checkAndSpawnOthers()

    # Add your own, additional update code here
    draw: ->
      # Draw all entities and backgroundMaps
      @parent()

    bindKeys: ->
      ig.input.bind( ig.KEY.UP_ARROW, 'up' );
      ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
      ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
      ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
      ig.input.bind( ig.KEY.SPACE, 'switch' );

    checkAndSpawnOthers: ->
      return if not @isTimeToSpawn()
      @spawn_others_timer.set @getNextSpawnTime()
      return @spawnSquare(color: @player.color) if @noMoreOfColor(@player.color)
      return @spawnSquare() if @isRoomForMore()

    isTimeToSpawn: ->
      @spawn_others_timer.delta() > 0

    isRoomForMore: ->
      @getEntitiesByType(EntitySquare).length - 1 < MAX_OTHERS

    getNextSpawnTime: ->
      if @player.score <= 0
        INITIAL_SPAWN_TIME
      else
        INITIAL_SPAWN_TIME / (@player.score / 3)

    spawnSquare: (args={}) ->
      padding = 100
      x = getRandomInt(padding, ig.system.width - ENTITY_SIZE - padding)
      y = getRandomInt(@hud.height + padding, ig.system.height - ENTITY_SIZE - padding)
      @spawnEntity EntitySquare, x, y, {game: this, color: args.color}


    gameOver: (die_callback_args) ->
      ent.kill() for ent in @entities
      @manager.endGame({score: die_callback_args.score})

    updatePlayerXY: ->
      @player.vel.x = 0
      @player.vel.y = 0
      @player.vel.x = -1 * @player.speed if ig.input.state('left')
      @player.vel.x = @player.speed if ig.input.state('right')
      @player.vel.y = -1 * @player.speed if ig.input.state('up')
      @player.vel.y = @player.speed if ig.input.state('down')
      if ig.input.pressed('switch')
        @player.switch(@getMostPopularColor())


    getMostPopularColor: ->
      # Now find the color with the highest count
      highest_count = 0
      most_popular_color = null
      for color, count of @getColorCounts()
        if count > highest_count
          highest_count = count
          most_popular_color = color
      most_popular_color

    getColorCounts: ->
      squares = @getEntitiesByType(EntitySquare)
      color_counts = {}
      for square in squares
        if color_counts[square.color]?
          color_counts[square.color] += 1
        else
          color_counts[square.color] = 1
      # Don't forget to take one away due to player's current color being a square too
      color_counts[@player.color] -= 1
      color_counts

    noMoreOfColor: (color) ->
      counts = @getColorCounts()
      not counts[color]? or counts[color] == 0

