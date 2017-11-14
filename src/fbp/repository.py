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


@singleton
class repository(object):
    # by default, a in memory repository is loaded
    # to be replace by sqllite
    _repo = IMRepo()

    def register(self, domain, key, value):
        return self._repo.register(domain, key, value)

    def unregister(self, domain, key):
        return self._repo.unregister(domain, key)

    def get(self, domain, key=None):
        return self._repo.get(domain, key)
