ig.module("game.over_scene")
.requires(
  "impact.game",
  "impact.font",
  "plugins.scene_manager"
).defines ->
  window.OverScene = Scene.extend
    h1_font: new ig.Font "media/fonts/existence_light_42_2.png"
    h2_font: new ig.Font "media/fonts/existence_light_32.png"
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
      text =  "Game Over\n\n"
      text =  "Score: #{@score}\n"
      @h1_font.draw text, center_x, top_y, ig.Font.ALIGN.CENTER
      text = "Press Enter to retry..."
      @h2_font.draw text, center_x, top_y + 50, ig.Font.ALIGN.CENTER

      credits_text  = "Created by Gabe Hollombe (@gabehollombe)\n"
      credits_text += "For Ludum Dare #26, April 26-28 2013\n"
      @font.draw credits_text, center_x, top_y + 140, ig.Font.ALIGN.CENTER



      engine_text = "Made with Impact, Bfxr, Pixen,\nAudacity, Garage Band,\nChrome, and Vim"
      @font.draw engine_text, 30, ig.system.height - 200

      thanks_text = "Special Thanks\n"
      thanks_text += "Alexandra - Initial concept feedback\n"
      thanks_text += "Cameron and Helena - Sunday night dinner\n"
      thanks_text += "The Ludum Dare community - Encouragement and support\n"
      @font.draw thanks_text, 30, ig.system.height - 110, ig.Font.ALIGN.LEFT


    setScore: (score) ->
      @score = score
