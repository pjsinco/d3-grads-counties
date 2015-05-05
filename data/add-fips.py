import csv


#in_file = open('/Users/psinco/Sites/d3-grads-counties/data/d3-grads-counties.csv', 'r')
in_file = open('/Users/psinco/Sites/d3-grads-counties/data/TheDOMemberData.csv', 'r')
fips_file = open('/Users/psinco/Sites/d3-grads-counties/data/national_county.txt', 'r')
out_file = open('/Users/psinco/Sites/d3-grads-counties/data/members-out-eunice.csv', 'w')

csv_reader = csv.reader(in_file)
fips_reader = csv.reader(fips_file)
csv_writer = csv.writer(out_file)

headers = csv_reader.next()
csv_writer.writerow(headers)

for row in csv_reader:
    print('Processing: id #{}'.format(row[0]))
    
    #import pdb; pdb.set_trace()
    state = row[5]
    if state == 'LA':
        county = '{} Parish'.format(row[7])
    else:
        county = '{} County'.format(row[7])
    #county = '{} {}' . format(row[7], 'County' if state is not 'LA' else 'Parish')
    #print "{}, {}".format(county, state)

    fips_file.seek(0)
    for fips_row in fips_reader:
        if fips_row[0] == state and fips_row[3] == county:
            fips_code = fips_row[2]
            csv_writer.writerow(row + [fips_row[1], fips_row[2]])
            #csv_writer.writerow(row.extend(list('abc')))

in_file.close()
out_file.close()
fips_file.close()
