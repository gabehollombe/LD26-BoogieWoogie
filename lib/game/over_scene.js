// Generated by CoffeeScript 1.6.2
ig.module("game.over_scene").requires("impact.game", "impact.font", "plugins.scene_manager").defines(function() {
  return window.OverScene = Scene.extend({
    h1_font: new ig.Font("media/fonts/existence_light_42_2.png"),
    h2_font: new ig.Font("media/fonts/existence_light_32.png"),
    font: new ig.Font("media/fonts/existence_light_16.png"),
    init: function(manager) {
      this.manager = manager;
      return this.bindKeys();
    },
    bindKeys: function() {
      return ig.input.bind(ig.KEY.ENTER, 'start');
    },
    update: function() {
      this.parent();
      if (ig.input.pressed('start')) {
        return this.manager.startGame();
      }
    },
    draw: function() {
      var center_x, center_y, credits_text, engine_text, text, thanks_text, top_y;

      this.parent();
      center_x = ig.system.width / 2;
      center_y = ig.system.height / 2;
      top_y = 40;
      text = "Game Over\n\n";
      text = "Score: " + this.score + "\n";
      this.h1_font.draw(text, center_x, top_y, ig.Font.ALIGN.CENTER);
      text = "Press Enter to retry...";
      this.h2_font.draw(text, center_x, top_y + 50, ig.Font.ALIGN.CENTER);
      credits_text = "Created by Gabe Hollombe (@gabehollombe)\n";
      credits_text += "For Ludum Dare #26, April 26-28 2013\n";
      this.font.draw(credits_text, center_x, top_y + 140, ig.Font.ALIGN.CENTER);
      engine_text = "Made with Impact, Bfxr, Pixen,\nAudacity, Garage Band,\nChrome, and Vim";
      this.font.draw(engine_text, 30, ig.system.height - 200);
      thanks_text = "Special Thanks\n";
      thanks_text += "Alexandra - Initial concept feedback\n";
      thanks_text += "Cameron and Helena - Sunday night dinner\n";
      thanks_text += "The Ludum Dare community - Encouragement and support\n";
      return this.font.draw(thanks_text, 30, ig.system.height - 110, ig.Font.ALIGN.LEFT);
    },
    setScore: function(score) {
      return this.score = score;
    }
  });
});
