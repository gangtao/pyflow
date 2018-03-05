import threading
import Queue


# A simple in memory message bus

class Subscriber(object):
    def __init__(self, name):
        self._name = name

    @property
    def name(self):
        return self._name

    def notify(self, message):
        print("{} got notified for {}".format(self._name, message))


class Bus(threading.Thread):
    def __init__(self, name):
        threading.Thread.__init__(self)
        self._name = name
        self._subscribers = list()
        self._queue = Queue.Queue()
        self._stop = False

    @property
    def name(self):
        return self._name

    def publish(self, message):
        self._queue.put(message)

    def subcribe(self, subscriber):
        if subscriber not in self._subscribers:
            self._subscribers.append(subscriber)

    def unsubscribe(self, subscriber):
        if subscriber in self._subscribers:
            index = self._subscribers.index(subscriber)
            self._subscribers.pop(index)

    def run(self):
        print("{} Start".format(self._name))
        while not self._stop:
            try:
                message = self._queue.get(True,3)
                for subscriber in self._subscribers:
                    subscriber.notify(message)
            except:
                pass
        print("{} Stop".format(self._name))

    def stop(self):
        print("{} set to complete".format(self._name))
        self._stop = True
