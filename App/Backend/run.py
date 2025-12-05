# import pymongo
# import gevent.monkey
# gevent.monkey.patch_all(ssl=False)

import os
from App import create_app

app, socketio_instance = create_app()

if __name__ == "__main__":
    socketio_instance.run(
        app,
        host="0.0.0.0",                                 # required for Render
        port=int(os.environ.get("PORT", 5000)),        # Render gives you a PORT env var
        allow_unsafe_werkzeug=True                     # allow Werkzeug in production
    )
