ig.module("game.menu_scene")
.requires(
  "impact.game",
  "impact.font",
  "plugins.scene_manager"
).defines ->
  window.MenuScene = Scene.extend
    title_font: new ig.Font "media/fonts/squared_48.png"
    font: new ig.Font "media/fonts/squared_16.png"

    init: (manager) ->
      @manager = manager
      @bindKeys()

    bindKeys: ->
      ig.input.bind ig.KEY.ENTER, 'start'

    update: ->
      @parent()
      @manager.startGame() if ig.input.pressed 'start'

    draw: ->
      @parent()
      center_x = ig.system.width / 2
      center_y = ig.system.height / 2
      top_y = 40

      text =  "AVOLLECT\n"
      @title_font.draw text, center_x, center_y - 50, ig.Font.ALIGN.CENTER

      intro_text  = "Tap to start...\n\n"
      @font.draw intro_text, center_x, center_y, ig.Font.ALIGN.CENTER


