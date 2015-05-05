import csv
import pdb
import json

from populations import get_school_from_id


def main():
    schools = {}

    with open('/Users/psinco/Sites/d3-grads-counties/data/members-out.csv', 'r') as csv_in:
        csv_reader = csv.reader(csv_in)
        for row in csv_reader:
            school = get_school_from_id(row[9])
            grad_year = row[8]

            #pdb.set_trace()
            if not school in schools:
                schools.update({school: {}})

            if not grad_year in schools[school]:
                schools[school].update({grad_year: 1})
            else:
                schools[school][grad_year] += 1
    
    with open('/Users/psinco/Sites/d3-grads-counties/data/grad-years.json', 'w') as json_out:
        json.dump(schools, json_out, indent=4)

if __name__ == '__main__':
    main()
