spec = {
    "title": "split",
    "id": "pyflow.transform.split",
}
output_keys = ["a", "b"]


def func(source, delimiter):
    """
    :params: source,delimiter
    :ptypes: String,String
    :returns: a,b
    :rtype: String, String
    """
    result = source.split(delimiter, 1)
    out = dict()

    out["a"] = result[0]
    if len(result) > 1:
        out["b"] = result[1]
    else:
        out["b"] = ""
    return out
