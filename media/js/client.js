//
// LCB Client
//

+function(window, $, _) {
    //
    // Base
    //
    var Client = function(config) {
        this.config = config;
        this.user = new UserModel;
        this.rooms = new RoomsCollection;
        return this;
    }
    //
    // Rooms
    //
    Client.prototype.getRooms = function() {
        var that = this;
        this.socket.emit('rooms:list', function(rooms) {
            that.rooms.set(rooms);
        });
    }
    Client.prototype.switchRoom = function(id) {
        var room = this.rooms.get(id);
        if (room && room.get('joined')) {
            this.rooms.current.set('id', id);
            return;
        } else {
            this.joinRoom(id, true)
        }
    }
    Client.prototype.joinRoom = function(id, switchRoom) {
        var self = this;
        if (!id) {
            // nothing to do
            return;
        }
        this.socket.emit('rooms:join', id, function(resRoom) {
            var room = self.rooms.add(resRoom);
            room.set('joined', true);
            if (switchRoom) {
                self.rooms.current.set('id', id);
            }
        });
    }
    //
    // Router Setup
    //
    Client.prototype.route = function() {
        var that = this;
        var Router = Backbone.Router.extend({
            routes: {
                '!/room/home': 'list',
                '!/room/:id': 'join',
                '*path': 'list'
            },
            join: function(id) {
                that.switchRoom(id);
            },
            list: function() {
                that.switchRoom();
            }
        });
        that.router = new Router;
        Backbone.history.start();
    }
    //
    // Socket Setup
    //
    Client.prototype.listen = function() {
        var that = this;
        this.socket = io.connect(null, {
            reconnect: true
        });
        this.socket.on('connect', function() {
            that.getRooms();
        });
        this.socket.on('disconnect', function() {
            console.log('disconnected');
        });
    }
    //
    // Start
    //
    Client.prototype.start = function() {
        this.listen();
        this.route();
        this.view = new ClientView({
            client: this
        });
        return this;
    }
    //
    // Add to window
    //
    window.LCB = window.LCB || {};
    window.LCB.Client = Client;
}(window, $, _);