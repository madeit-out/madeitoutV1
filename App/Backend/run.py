# import pymongo
# import gevent.monkey
# gevent.monkey.patch_all(ssl=False)

from app import create_app

app, socketio_instance = create_app()

if __name__ == "__main__":
    socketio_instance.run(app, debug=True, port=5000)

    
