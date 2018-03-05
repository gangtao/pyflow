import unittest

import sys,time

sys.path.append('../../src')
from message import Bus,Subscriber

class TestFBPMessage(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        pass

    @classmethod
    def tearDownClass(cls):
        pass

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_message(self):
        channel = Bus("message broker")
        suba = Subscriber("A")
        subb = Subscriber("B")
        subc = Subscriber("C")

        channel.subcribe(suba)
        channel.subcribe(subb)
        channel.subcribe(subc)

        channel.start()
        channel.publish("first message")
        channel.publish("second message")
        time.sleep(1)
        channel.unsubscribe(subc)
        time.sleep(1)
        channel.publish("third message")

        time.sleep(1)
        channel.stop()
        time.sleep(1)


if __name__ == '__main__':
    unittest.main()
