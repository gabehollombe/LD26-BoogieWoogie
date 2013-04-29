ig.module( 'game.entities.square')
.requires( 'impact.entity')
.defines ->
  PEERS_SPAWNED = 1
  MIN_WIDTH = 16
  MIN_HEIGHT = 16
  MIN_VEL = 20
  MAX_VEL = 100
  COLORS = ['red', 'blue', 'yellow', 'white', 'green']
  SECS_UNTIL_ACTIVE = 1

  window.EntitySquare = ig.Entity.extend
    init: (x, y, settings) ->
      @parent(x, y, settings)
      @settings = settings # Needed by helper init methods below
      @initWidthHeight()
      @initColor()
      @initVels() #unless @is_player
      @type = ig.Entity.TYPE.B # Player overrides this to type A
      @spawn_timer = new ig.Timer(SECS_UNTIL_ACTIVE)
      @active = false
      @currentAnim.alpha = 0

    update: ->
      @bounceOffEdge() if @touchingScreenEdges().length > 0
      @parent()
      @checkSpawnTimer() if @spawn_timer?

    #draw: ->
      #@parent()

    checkSpawnTimer: ->
      if @spawn_timer.delta() > 0
        @spawn_timer = null
        @active = true
        @currentAnim.alpha = 0.9
      else
        @currentAnim.alpha = 1 + @spawn_timer.delta()

    spawnPeers: (player) ->
      for i in [0..PEERS_SPAWNED]
        x_offset = getRandomInt(@width, @width*2)
        x_offset *= -1 if Math.random() < 0.5
        y_offset = getRandomInt(@height, @height*2)
        y_offset *= -1 if Math.random() < 0.5
        x = @pos.x + (@width / 2) + x_offset
        y = @pos.y + (@height / 2) + y_offset
        @settings.game.spawnEntity EntitySquare, x, y, {game: @settings.game, color: @color}


    switch: (color) ->
      @updateColor(color)

    getAnimSheetForColor: (color) ->
      new ig.AnimationSheet 'media/white_320x240.png#' + @hexForColor(color), @width, @height

    randomColor: ->
      COLORS[window.getRandomInt(0, COLORS.length - 1)]

    initWidthHeight: ->
      @width = @settings.width || window.getRandomInt(MIN_WIDTH, ig.system.width / 4)
      @height = @settings.height || window.getRandomInt(MIN_HEIGHT, ig.system.height / 4)
      @size = {x: @width, y: @height} # Size is required attribute for Impact

    initColor: ->
      @color = @settings.color || @randomColor()
      @updateColor()

    updateColor: (color) ->
      @color = color if color
      @animSheet = @getAnimSheetForColor(@color)
      @currentAnim = new ig.Animation @animSheet, 0.1, [0], true

    initVels: ->
      @vel =
        x: @maybeNegative(window.getRandomInt(MIN_VEL, MAX_VEL))
        y: @maybeNegative(window.getRandomInt(MIN_VEL, MAX_VEL))
      @maxVel = @vel

    maybeNegative: (val) ->
      if Math.random() < 0.5 then val else val * -1

    bounceOffEdge: ->
      @vel.x *= -1 if @isTouching('left') or @isTouching('right')
      @vel.y *= -1 if @isTouching('top') or @isTouching('bottom')

    touchingScreenEdges: ->
      touching = []
      touching.push('left')   if @pos.x <= 0
      touching.push('top')    if @pos.y <= @settings.game.hud.height
      touching.push('right')  if @pos.x + @width >= ig.system.width
      touching.push('bottom') if @pos.y + @height >= ig.system.height
      touching

    isTouching: (dir) ->
      @touchingScreenEdges().indexOf(dir) >= 0

    hexForColor: (color) ->
      {
        'red': 'fd3333'
        'blue': '072f94'
        'yellow': 'ffff3d'
        'white': 'ffffff'
        'black': '0c0a0a'
        'green': '6ebe10'
      }[color]
