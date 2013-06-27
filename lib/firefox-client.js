var extend = require("./extend");
var ClientMethods = require("./client-methods");
var Client = require("./client");
var StyleSheets = require("./stylesheets");
var DOM = require("./dom");

module.exports = FirefoxClient;

function FirefoxClient() {
  this.client = new Client();
  this.actor = 'root';
}

FirefoxClient.prototype = extend(ClientMethods, {
  connect: function(callback, opts) {
    this.client.connect(callback, opts);

    this.client.expectReply(this.actor, function(packet) {
      console.log("got the root message", JSON.stringify(packet));
    });
  },

  listTabs: function(callback) {
    this.request("listTabs", {}, function(response) {
      console.log("got a response for listTabs");
      var tabs = response.tabs;
      var clients = tabs.map(function(tab) {
        return new TabClient(this.client, tab);
      }.bind(this));

      callback(clients);
    }.bind(this));
  }
})

function TabClient(client, tab) {
  this.client = client;
  this.actor = tab.actor;
  this.tab = tab;
}

TabClient.prototype = extend(ClientMethods, {
  get title() {
    return this.tab.title;
  },

  get url() {
    return this.tab.url
  },

  get StyleSheets() {
    if (!this._StyleSheets) {
      this._StyleSheets = new StyleSheets(this.client, this.tab.styleEditorActor);
    }
    return this._StyleSheets;
  },

  get DOM() {
    if (!this._DOM) {
      this._DOM = new DOM(this.client, this.tab.inspectorActor);
    }
    return this._DOM;
  },

  reload: function(callback) {
    this.request("reload", {}, callback);
  }
})