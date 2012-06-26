var App = Em.Application.create({
  ready: function()
  {
    App.feedsController.addFeed('https://github.com/halan/rss-ember/commits/master.atom');
  }
});

App.feed = Em.Object.extend(
{
  googleapi: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=-1&q=',
  status: 'new',
  url: null,
  name: null,
  count: 0,
  entries: [],
  jsonurl: Em.computed(function()
  {
    return this.get('googleapi')+this.get('url')+'&callback=?';
  }).property('googleapi', 'url'),

  loading: Em.computed(function()
  {
    return this.get('status') == 'loading';
  }).property('status'),

  load: function()
  {
    var self = this;
    this.set('count', null);
    this.set('status', 'loading');
    $.getJSON(this.get('jsonurl'), function(data)
    {
      if(data.responseData)
      {
        self.set('status', 'ready');
        self.set('name', data.responseData.feed.title);
        self.set('count', data.responseData.feed.entries.length);
        self.set('entries', data.responseData.feed.entries);
      }
      else
      {
        self.set('status', 'error');
      }
    }).error(function()
    {
      self.set('status', 'error');
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

    feed.get('entries').forEach(function(item){
      self.pushObject(item);
    })
  }  
})

App.FeedView = Em.View.extend({
  statusBinding: 'feed.status',
  classNameBindings: ['standClass', 'status'],
  standClass: 'feed',
  conectionBroken: function()
  {
    var self = this;

    if(self.feed.status == 'error')
    {
      self.$().fadeOut('slow', function()
      {
        App.feedsController.removeObject(self)
      });
    }
  }.observes('feed.status'),

  click: function()
  {
    this.get('feed').show();
  }
});

App.MainView = Em.View.create({
  url: null,
  templateName: 'main-view',
  feedslistBinding: 'App.feedsController.content',
  entrieslistBinding: 'App.entriesController.content',
  clickButton: function()
  {
    var url = this.get('url');
    if(url)
    {
      App.feedsController.addFeed(this.get('url'));
      this.set('url', '')
    }
  }
}).append();

Handlebars.registerHelper('raw', function(context, options) {
  return new Handlebars.SafeString(Ember.getPath(this, context));
}); 
