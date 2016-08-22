import csv
import json

#csv_in = open('/Users/psinco/Sites/d3-grads-counties/data/members-out-eunice.csv', 'r')
csv_in = open('/Users/psinco/Sites/d3-grads-counties/data/members-out-2016.csv', 'r')
#csv_in = open('/Users/psinco/Sites/d3-grads-counties/data/members-out-abbrd.csv', 'r')

json_in = open('/Users/psinco/Sites/d3-grads-counties/data/us-schools-zoom.json', 'r')
#json_in = open('/Users/psinco/Sites/d3-grads-counties/data/us-schools.json', 'r')
#json_in = open('/Users/psinco/Sites/d3-grads-counties/data/us-abbrd.json', 'r')
fips_file = open('/Users/psinco/Sites/d3-grads-counties/data/national_county.txt', 'r')

fips_reader = csv.reader(fips_file)

parsed_json = json.load(json_in)
csv_reader = csv.reader(csv_in)
headers = csv_reader.next()

def get_county_state(fips_target):
    """Returns a dictionary with keys county, state. 
    Takes a string.

    >>> import populations as p
    >>> print(p.get_county_state('01031'))
    {'state_name': 'AL', 'county_name': 'Coffee County'}

    """
    fips_file.seek(0)
    for fips_row in fips_reader:
        code = str(fips_row[1] + fips_row[2])
        if fips_target == code:
            return {
                'county_name': fips_row[3], 
                'state_name' : fips_row[0]
            }

def get_school_from_id(school_id):
    """
    >>> import populations as p
    >>> print(p.get_school_from_id('118447'))
    ATSU-KCOM
    """
    schools = {
        "118439": "ATSU-SOMA",
        "118440": "LMU-DCOM",
        "118441": "TouroCOM-Harlem",
        "118442": "MWU/CCOM",
        "118444": "COPS",
        "118445": "DMU-COM",
        "118446": "KCUMB-COM",
        "118447": "ATSU-KCOM",
        "118448": "LECOM-Bradenton",
        "118449": "TUNCOM",
        "118453": "PCOM",
        "118454": "GA-PCOM",
        "118457": "MSUCOM",
        "118458": "UNTHSC/TCOM",
        "118459": "WVSOM",
        "118460": "OSU-COM",
        "118461": "OU-HCOM",
        "118462": "RowanSOM",
        "118463": "NYITCOM",
        "118464": "WesternU/COMP",
        "118465": "UNECOM",
        "118466": "NSU-COM",
        "118467": "LECOM",
        "118468": "MWU/AZCOM",
        "118469": "TUCOM",
        "118470": "UP-KYCOM",
        "155767": "VCOM-Virginia Campus",
        "182613": "RVUCOM",
        "182634": "PNWU-COM",
        "188393": "WCUCOM",
        "198802": "MU-COM",
        "198805": "VCOM-Carolinas Campus",
        "329224": "CUSOM",
        "348977": "LUCOM"
    }

    try:
        school_abbrev = schools[school_id]
    except KeyError as ke:
        school_abbrev = ''

    return school_abbrev

def format_json(counties):
    """Takes a list of counties"""
    num_counties = len(counties)

    for i in range(0, num_counties):
        try:
            print('Processing {} of {}'.format(i, num_counties))
            county_id = str(counties[i]['id']).zfill(5) # make sure id is 5-char string

        
            parsed_json['objects']['counties']['geometries'][i].update({'properties': {'schools': {}, 'county': '', 'state': ''}})
            #parsed_json['objects']['counties']['geometries'][i]['properties']['schools'] = schools

            loc_info = get_county_state(county_id)
            parsed_json['objects']['counties']['geometries'][i]['properties']['county'] = loc_info['county_name']
            parsed_json['objects']['counties']['geometries'][i]['properties']['state'] = loc_info['state_name']
        except:
            print('Error: ')
    
    with open('/Users/psinco/Sites/d3-grads-counties/data/us-schools-zoom.json', 'w') as json_out:
        json.dump(parsed_json, json_out, indent=4)


def main():
    counties = parsed_json['objects']['counties']['geometries']
    #format_json(counties)
   
    csv_in.seek(0) # rewind to the beginning of the file
    for row in csv_reader:
        #import pdb; pdb.set_trace()
        print'\tProcessing id #{}'.format(row[0])
        school = get_school_from_id(row[9])
        fips_county = str(row[11]).zfill(2) + str(row[12]).zfill(3)
    
        
        for i in range(len(counties)):
            county_id = str(counties[i]['id']).zfill(5) # make sure id is 5-char string
            schools = counties[i]['properties']['schools']
            if county_id == fips_county:
                if not school in schools:
                    schools[school] = 1
                    print('\t\tDone')
                    break
                else:
                    #import pdb; pdb.set_trace()
                    #if school == 'MSUCOM' and county_id == '26125':
                        #print('\t\t\tAdding to msuoak: {}'.format(row[0]))
                    schools[school] += 1
                    print('\t\tDone')
                    break
    
    
    with open('/Users/psinco/Sites/d3-grads-counties/data/us-schools-2016.json', 'w') as json_out:
        json.dump(parsed_json, json_out, indent=4)
    
    json_in.close()
    csv_in.close()
    fips_file.close()

if __name__ == '__main__':
    main()
    #pass
