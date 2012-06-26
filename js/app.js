var App = Em.Application.create({
  ready: function()
  {
    console.log('started');
  }
});


App.feed = Em.Object.extend(
{
  googleapi: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=',
  url: null,
  name: null,
  count: 0,
  entries: [],
  jsonurl: Em.computed(function()
  {
    return this.get('googleapi')+this.get('url')+'&callback=?';
  }).property('googleapi', 'url'),

  load: function()
  {
    var self = this;
    this.set('name', 'Carregando...');
    $.getJSON(this.get('jsonurl'), function(data)
    {
      self.set('name', data.responseData.feed.title);
      self.set('count', data.responseData.feed.entries.length);
      self.set('entries', data.responseData.feed.entries);
    });
  }.observes('url'),

  show: function()
  {
    App.entriesController.open(this);
  }.observes('entries')


});

App.feedsController = Em.ArrayController.create({
  content: [],
  feedsCount: function()
  {
    return this.content.length;
  }.property('content'),

  addFeed: function(url)
  {
    feed = App.feed.create({url: url});
    feed.load();
    this.pushObject(feed);
  }
});

App.entriesController = Em.ArrayController.create({
  content: [],
  open: function(feed)
  {
    var self = this;
    this.set('content', []);

    console.log(feed.get('entries'));
    feed.get('entries').forEach(function(item){
      self.pushObject(item);
    })
  }  
})

App.FeedView = Em.View.extend({
  open: function()
  {
    this.get('feed').show();
  }
});

App.MainView = Em.View.create({
  url: null,
  templateName: 'main-view',
  feedslistBinding: 'App.feedsController.content',
  entrieslistBinding: 'App.entriesController.content',
  addRSS: function()
  {
    App.feedsController.addFeed(this.get('url'));
    this.set('url', '')
  }
}).append();

