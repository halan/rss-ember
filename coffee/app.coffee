window.App = Em.Application.create(ready: ->
  App.MainView.append()
  App.feedsController.addFeed "https://github.com/halan/rss-ember/commits/master.atom"

)

App.feed = Em.Object.extend(
  googleapi: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=-1&q="
  status: "new"
  url: null
  name: null
  count: 0
  entries: []
  jsonurl: Em.computed(->
    @get("googleapi") + @get("url") + "&callback=?"
  ).property("googleapi", "url")
  loading: Em.computed(->
    @get("status") is "loading"
  ).property("status")
  load: (->
    self = this
    @set "count", null
    @set "status", "loading"
    $.getJSON(@get("jsonurl"), (data) ->
      if data.responseData
        self.set "status", "ready"
        self.set "name", data.responseData.feed.title
        self.set "count", data.responseData.feed.entries.length
        self.set "entries", data.responseData.feed.entries
      else
        self.set "status", "error"
    ).error ->
      self.set "status", "error"
  ).observes("url")
  show: (->
    App.entriesController.open this
  ).observes("entries")
)

App.feedsController = Em.ArrayController.create(
  content: []
  feedsCount: (->
    @content.length
  ).property("content")
  addFeed: (url) ->
    feed = App.feed.create(url: url)
    feed.load()
    @pushObject feed
)

App.entriesController = Em.ArrayController.create(
  content: []
  open: (feed) ->
    self = this
    @set "content", []
    feed.get("entries").forEach (item) ->
      self.pushObject item
)

App.FeedView = Em.View.extend(
  statusBinding: "feed.status"
  classNameBindings: [ "standClass", "status" ]
  standClass: "feed"
  conectionBroken: (->
    self = this
    if self.feed.status is "error"
      self.$().fadeOut "slow", ->
        App.feedsController.removeObject self
  ).observes("feed.status")
  click: ->
    @get("feed").show()
)

App.MainView = Em.View.create(
  url: null
  templateName: "main-view"
  feedslistBinding: "App.feedsController.content"
  entrieslistBinding: "App.entriesController.content"
  clickButton: ->
    url = @get("url")
    if url
      App.feedsController.addFeed @get("url")
      @set "url", ""
)

Handlebars.registerHelper "raw", (context, options) ->
  new Handlebars.SafeString(Ember.getPath(this, context))
