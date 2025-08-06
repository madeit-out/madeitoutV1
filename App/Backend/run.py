# import pymongo
# import gevent.monkey
# gevent.monkey.patch_all(ssl=False)

from app import create_app

# app, socketio_instance = create_app()

if __name__ == '__main__':
    app, socketio_instance = create_app()
    socketio_instance.run(app, debug=True, host='127.0.0.1', port=5000)
    
