import csv

from populations import get_school_from_id


"""
OPTIONAL: For sanity checks only

"""

def main():
    total = 0
    schools = {}
    with open('/Users/psinco/Sites/d3-grads-counties/data/members-out.csv', 'r') as csv_in:
        csv_reader = csv.reader(csv_in)
        for row in csv_reader:
            school = get_school_from_id(row[9])

            if not school in schools:
                schools.update({school: 0})
            else:
                schools[school] += 1

        for school, count in schools.items():
            total += count
            print('{}: {}'.format(school, count))
        print('Total: {}'.format(total))

if __name__ == '__main__':
    main()

