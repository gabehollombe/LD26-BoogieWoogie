ig.module("game.main")
.requires(
  "impact.game",
  "impact.font",
  #"impact.debug.debug",

  "plugins.scene_manager",

  "game.menu_scene",
  "game.play_scene",
  "game.over_scene",
).defines ->

  #NO_MUSIC = true

  ParentGame = ig.Game.extend
    sceneManager: new SceneManager()

    main_music_track: new ig.Sound('media/music/theme.ogg', false)

    init: ->
      ig.soundManager.volume = 0.1
      @menu_scene = new MenuScene(this)
      @over_scene = new OverScene(this)
      #@play_scene = new PlayScene(this)
      #@sceneManager.setScenes [@menu_scene, @play_scene, @over_scene]
      @sceneManager.replaceScene @menu_scene
      @initMusic() unless NO_MUSIC?

    update: ->
      @sceneManager.updateScene()

    draw: ->
      @sceneManager.drawScene()

    startGame: ->
      @play_scene = new PlayScene(this)
      @play_scene.reset()
      @sceneManager.replaceScene(@play_scene)
      ig.music.play()

    endGame: (args) ->
      @over_scene.setScore(args.score)
      @sceneManager.replaceScene(@over_scene)
      ig.music.stop()

    initMusic: ->
      ig.music.add @main_music_track
      ig.music.volume = 0.5

  # Start the game with 60fps, a resolution of 320x240, scaled
  # up by a factor of 2
  ig.main "#canvas", ParentGame, 60, 640, 480, 1
