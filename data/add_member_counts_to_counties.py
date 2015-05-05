import json
import pdb

def main():
    with open('/Users/psinco/Sites/d3-grads-counties/data/us-schools-zoom-ready.json', 'r') as json_in:

            parsed_json = json.load(json_in)

            for i in range(len(parsed_json['objects']['counties']['geometries'])):
                mem_count = get_member_count(parsed_json['objects']['counties']['geometries'][i]['properties']['schools'])
                parsed_json['objects']['counties']['geometries'][i]['properties'].update({'mem_count': mem_count})

            with open('/Users/psinco/Sites/d3-grads-counties/data/us-schools.json', 'w') as json_out:
                json.dump(parsed_json, json_out, indent=4)
                
def get_member_count(schools):
    count = 0
    for school, num in schools.items():
        count += num

    return count

if __name__ == '__main__':
    main()
