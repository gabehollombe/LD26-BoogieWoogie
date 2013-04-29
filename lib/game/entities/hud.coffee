ig.module( 'game.entities.hud')
.requires( 'impact.entity')
.defines ->
  PADDING = 20

  window.EntityHud = ig.Entity.extend
    #font: new ig.Font "media/04b03.font.png"
    font: new ig.Font "media/fonts/existence_light_16.png"

    init: (settings) ->
      @parent(settings)
      @settings = settings # Needed by helper init methods below
      @initWidthHeight()
      @player = @settings.player
      @score_text = ""
      @lives_text = ""

    update: ->
      @parent()
      @score_text = "Score: #{@player.score}"
      @lives_text = "Lives: #{@player.lives}"

    draw: ->
      @font.draw @score_text, PADDING, PADDING
      @font.draw @lives_text, ig.system.width - PADDING, PADDING, ig.Font.ALIGN.RIGHT

    addAnims: ->
      colors = ['red', 'green', 'blue', 'yellow', 'white']
      for color, frame in colors
        anim = @addAnim color, 99, [0]
        anim.color = color

    getAnimSheetForColor: (color) ->
      new ig.AnimationSheet 'media/white_320x240.png#' + @hexForColor(color), @width, @height

    initWidthHeight: ->
      @height = @font.height + PADDING
      @width = ig.system.width
      @size = {x: @width, y: @height} # Size is required attribute for Impact
      @pos.x = 0
      @pos.y = 0
