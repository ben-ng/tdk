/** @contructor */
//
// From: http://stevehanov.ca/blog/index.php?id=109
//
// The messenger object handles bi-directional communication between the main
// window and an iframe. It will also queue messages until the iframe has
// finished loading and sends the ready signal.
function Messenger( targetFrame, targetDomain, prefix )
{
    this.init( targetFrame, targetDomain, prefix );
}

Messenger.prototype = {
    init: function( targetFrame, targetDomain, prefix ) {
        // The DOM node of the target iframe.
        this.targetFrame = targetFrame;

        // The domain, including http:// of the target iframe.
        this.targetDomain = targetDomain;
        
        // A prefix used for distinguishing multiple instances of this script.
        this.prefix = prefix;

        // A map from ticket number strings to functions awaiting replies. The
        // tickets include the prefix so we don't get confused with multiple
        // instances of the iframe.
        this.replies = {};
        this.nextTicket = 0;

        // Until the "ready" signal is received, all messages for the iframe go
        // into this queue.
        this.ready = false;
        this.queue = [];

        var self = this;
        window.addEventListener("message", function(e) {
            self.receive(e);
        }, false );
    },

    send: function( functionName, args, replyFn ) {
        var ticket = "ticket_" + this.prefix + "_" + (this.nextTicket++);
        var text = JSON.stringify( {
            "function": functionName,
            "args": args,
            "ticket": ticket
        });

        if ( replyFn ) {
            this.replies[ticket] = replyFn;
        }

        this.sendInternal( text );
    },

    receive: function( e ) {          
        if ( e.origin.replace(/https?:\/\//,'') !== this.targetDomain.replace(/\/$/, '').replace(/https?:\/\//,'') ) {
            // not for us: ignore.
            return;
        }

        var json;

        try {
            json = JSON.parse( e.data );
        } catch(except) {
            alert( "Syntax error in response from " + e.origin + ": " + e.data );
            return;
        }

        if ( json["event"] === "ready" ) {
            this.ready = true;
            this.sendQueuedEvents();
            return;
        }

        if ( !(json["ticket"] in this.replies ) ) {
            // no reply ticket.
            return;
        }

        var replyFn = this.replies[json["ticket"]];
        delete this.replies[json["ticket"]];

        var args = [];
        if ( "args" in json ) {
            args = json["args"];
        }

        replyFn.apply( undefined, args );
    },

    sendInternal: function( text )
    {
        if ( this.ready ) {
            this.targetFrame.contentWindow.postMessage( text, this.targetDomain
                    );
        } else {
            this.queue.push( text );
        }
    },

    sendQueuedEvents: function() {
    
        for( var i = 0; i < this.queue.length; i++ ) {
            this.targetFrame.contentWindow.postMessage( this.queue[i], 
                    this.targetDomain);
        }
        this.queue.length = 0;
    }
};