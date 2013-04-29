ig.module( 'game.entities.player')
.requires(
  'impact.entity'
  'game.entities.square'
).defines ->
  window.EntityPlayer = EntitySquare.extend
    is_player: true
    sounds:
      collect: new ig.Sound('media/collect.ogg')
      hit:     new ig.Sound('media/hit.ogg')
      die:     new ig.Sound('media/die2.ogg')
      switch:  new ig.Sound('media/switch.ogg')

    init: (x, y, settings) ->
      @parent(x, y, settings)
      @settings = settings # Needed by helper init methods below
      @game = @settings.game
      @initWidthHeight()
      @initColor()
      @initChecks()
      @speed = 200
      @maxVel = {x: @speed, y: @speed}
      @active = true

    reset: ->
      @score = 0
      @lives = 3

    update: ->
      @parent()

    initChecks: ->
      @type = ig.Entity.TYPE.A
      @checkAgainst = ig.Entity.TYPE.B

    check: (other) ->
      return unless other
      return unless other.color?
      friendly_collision = @color == other.color
      if not friendly_collision
        if other.active
          #other.spawnPeers()
          other.kill()
          @onHit()
      else
        other.kill()
        @onCollect()

    switch: (color) ->
      @onSwitch(color)

    bounceOffEdge: ->
      # Overriding Square.bounceOffEdge to keep players moving off screen
      if @touchingScreenEdges().length > 0
        @pos.x = @last.x if  @isTouching('left') or @isTouching('right')
        @pos.y = @last.y if @isTouching('top') or @isTouching('bottom')

    onSwitch: (color) ->
      #return if @score <= 1
      #@score = Math.round(@score / 4)
      @updateColor(color)
      @sounds.switch.play()

    onCollect: ->
      @score += 1
      @sounds.collect.play()
      @switch(@game.getMostPopularColor()) if @game.noMoreOfColor(@color)

    onHit: ->
      @lives -= 1 if @lives > 0
      @sounds.hit.play()
      @onDie({score: @score}) if @lives <= 0

    onDie: (args) ->
      @sounds.die.play()
      @settings.dieCallback(args)

