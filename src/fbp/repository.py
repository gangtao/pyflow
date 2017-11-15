import sqlite3
import json


def singleton(class_):
    instances = {}

    def getinstance(*args, **kwargs):
        if class_ not in instances:
            instances[class_] = class_(*args, **kwargs)
        return instances[class_]
    return getinstance


class BaseRepo(object):
    def register(self, domain, key, value):
        pass

    def unregister(self, domain, key):
        pass

    def get(self, domain, key=None):
        pass

    def get(self, domain, key=None):
        pass


class IMRepo(BaseRepo):

    def __init__(self):
        BaseRepo.__init__(self)
        self._repo = {}

    def register(self, domain, key, value):
        if self._repo.get(domain) is None:
            self._repo[domain] = {}

        self._repo[domain][key] = value

    def unregister(self, domain, key):
        if self._repo.get(domain) is None:
            return

        if self._repo.get(domain).get(key) is None:
            return

        del self._repo.get(domain)[key]

    def get(self, domain, key=None):
        if domain is None:
            return None

        if self._repo.get(domain) is None:
            return None

        if key is None:
            return self._repo.get(domain)

        if self._repo.get(domain).get(key) is None:
            return None

        return self._repo.get(domain)[key]


class SqliteRepo(BaseRepo):

    def __init__(self):
        BaseRepo.__init__(self)
        self._conn = sqlite3.connect('repo.db', check_same_thread=False)

    def register(self, domain, key, value):
        c = self._conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS {}
                     (key text PRIMARY KEY, value text)'''.format(domain))

        t = (key, json.dumps(value))
        c.execute('''REPLACE INTO {} VALUES
            (?,?)'''.format(domain), t)

        self._conn.commit()
        # self._conn.close()

    def unregister(self, domain, key):
        c = self._conn.cursor()
        t = (key,)
        c.execute('''DELETE FROM {} WHERE key=?'''.format(domain), t)

        self._conn.commit()

    def get(self, domain, key=None):
        c = self._conn.cursor()
        t = (domain,)
        c.execute(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name=?", t)
        count = c.fetchone()

        if count == 0:
            return None

        if key == None:
            result = dict()
            for row in c.execute('SELECT * FROM {}'.format(domain)):
                print row[1]
                result[row[0]] = json.loads(row[1], strict=False)
            return result

        t = (key,)
        c.execute('SELECT value FROM {} WHERE key=?'.format(domain), t)
        result = c.fetchone()
        return json.loads(result[0],strict=False)


@singleton
class repository(object):
    # by default, a in memory repository is loaded
    # to be replace by sqllite
    _repo = SqliteRepo()

    def register(self, domain, key, value):
        return self._repo.register(domain, key, value)

    def unregister(self, domain, key):
        return self._repo.unregister(domain, key)

    def get(self, domain, key=None):
        return self._repo.get(domain, key)

    def load(self, repo):
        self._repo = repo
