import inspect

# TODO: node maker is just a test tool which does not support port type yet, all default to 'String'
def create_node_spec(node_def):
    output_keys = None
    # TODO : unsecure
    exec(node_def)

    argspec = inspect.getargspec(func)
    input_names = argspec.args
    input_defaults = argspec.defaults or []
    input_ports = []
    default_start = len(input_names) - len(input_defaults)
    for i in range(len(input_names)):
        input = {
            'name': input_names[i],
            'order': i,
            'type' : "String"
        }
        if i >= default_start:
            input['default'] = input_defaults[i - default_start]
        input_ports.append(input)

    spec['port'] = {'input': input_ports}
    if output_keys:
        spec['port']['output'] = []
        for name in output_keys:
            spec['port']['output'].append({'name': name,'type':'String'})
    index = node_def.find('\ndef func')
    spec['func'] = node_def[index + 1:]
    return spec


# print create_node_spec(open('node_specs/breaker.py').read())
