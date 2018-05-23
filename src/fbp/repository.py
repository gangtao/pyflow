import sqlite3
import json


def singleton(class_):
    instances = {}

    def getinstance(*args, **kwargs):
        if class_ not in instances:
            instances[class_] = class_(*args, **kwargs)
        return instances[class_]
    return getinstance


# Object repository, the repo should store
# key as string and value as json object
class BaseRepo(object):
    def register(self, domain, key, value):
        pass

    def unregister(self, domain, key):
        pass

    def get(self, domain, key=None):
        pass

    def domains(self):
        pass

    def clean(self):
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

    def domains(self):
        return self._repo.keys()

    def clean(self):
        self._repo = dict()
        return


class SqliteRepo(BaseRepo):

    def __init__(self):
        BaseRepo.__init__(self)
        # TODO : config the db name here
        self._conn = sqlite3.connect('repo.db', check_same_thread=False)
        self._domains = set()

    def register(self, domain, key, value):
        self._domains.add(domain)
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

        if int(count[0]) == 0:
            return None

        if key == None:
            result = dict()
            for row in c.execute('SELECT * FROM {}'.format(domain)):
                result[row[0]] = json.loads(row[1], strict=False)
            return result

        t = (key,)
        c.execute('SELECT value FROM {} WHERE key=?'.format(domain), t)
        result = c.fetchone()
        return json.loads(result[0], strict=False)

    def domains(self):
        # todo run this at initialize and update on register/unregister
        c = self._conn.cursor()
        cursor = c.execute(
            "SELECT name FROM sqlite_master WHERE type='table'")
        return [ row[0] for row in cursor]

    def clean(self):
        c = self._conn.cursor()
        for domain in self._domains:
            c.execute('''DELETE FROM {} '''.format(domain))
        self._conn.commit()
        self._domains = set()
        return


@singleton
class repository(object):
    # a default Sqlite repo is use, need read configuration
    # to use different DB for repo
    _repo = SqliteRepo()

    def register(self, domain, key, value):
        return self._repo.register(domain, key, value)

    def unregister(self, domain, key):
        return self._repo.unregister(domain, key)

    def get(self, domain, key=None):
        return self._repo.get(domain, key)

    def load(self, repo):
        self._repo = repo

    def domains(self):
        return self._repo.domains()

    def clean(self):
        return self._repo.clean()

    def dumps(self, path):
        repo = dict()
        for domain in self.domains():
            repo[domain] = self.get(domain)

        with open(path, "w") as f:
            f.write(json.dumps(repo, indent=2))

    def loads(self, path):
        self.clean()
        with open(path, "r") as f:
            repo = json.loads(f.read())
            for domain, domain_value in repo.iteritems():
                for key, value in domain_value.iteritems():
                    self.register(domain, key, value)
