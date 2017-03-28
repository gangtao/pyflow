spec = {
    "title": "JSON Path",
    "id": "pyflow.transform.jsonpath",
}
output_keys = []


def func(source, path):
    from jsonpath_rw import jsonpath, parse
    import json

    if type(source) == type('') or type(source) == type(u''):
        source = json.loads(source)
    elif type(source) != type({}):
        return "Invalid source type {}".format(type(source))

    jsonpath_expr = parse(path)
    ret = jsonpath_expr.find(source)

    if len(ret) == 1:
        return ret[0].value

    ret = [match.value for match in ret]
    return ret
