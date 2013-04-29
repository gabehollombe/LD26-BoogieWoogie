ig.module("game.menu_scene")
.requires(
  "impact.game",
  "impact.font",
  "plugins.scene_manager"
).defines ->
  window.MenuScene = Scene.extend
    title_font: new ig.Font "media/fonts/existence_light_42_2.png"
    font: new ig.Font "media/fonts/existence_light_16.png"

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

      text =  "Boogie Woogie\n"
      @title_font.draw text, center_x, top_y, ig.Font.ALIGN.CENTER

      intro_text  = "Move by holding the arrow keys.\n\n"
      intro_text += "Get points by collecting squares of your color.\n\n"
      intro_text += "Avoid squares that aren't your color.\n\n"
      intro_text += "When you collect all of your current color,\n"
      intro_text += "you switch to the most common color on the board.\n\n"
      intro_text += "Ready? Good luck!\n\n"
      intro_text += "Press Enter to start..."
      x = (ig.system.width - @font.widthForString(intro_text)) / 2
      @font.draw intro_text, x, top_y * 4


