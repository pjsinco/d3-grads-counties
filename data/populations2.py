import csv
import json
import pdb

#csv_in = open('/Users/psinco/Sites/d3-grads-counties/data/members-out-abbrd.csv', 'r')
csv_in = open('/Users/psinco/Sites/d3-grads-counties/data/members-out.csv', 'r')


json_out = open('/Users/psinco/Sites/d3-grads-counties/data/us-schools-2.json', 'w')

schools_list = ["118439", "118453", "118459", "118447", "118445", "118446", "118470", "118442", "118449", "118460", "118461", "118462", "118466", "155767", "118440", "118457", "118463", "118464", "118469", "118465", "118467", "118458", "118468", "118448", "182613", "182634", "118454", "188393", "118444", "118441", "118450"]

csv_reader = csv.reader(csv_in)

schools = { 'schools': {} }

for school in schools_list:
  schools['schools'].update({school: {'counties': {}}})

headers = csv_reader.next()

count = 0
for row in csv_reader:
    count += 1
    print(count)

    #csv_in.seek(0)

    school = row[9]
    fips_county = row[11] + row[12]

    #pdb.set_trace()
    try:
      if not schools['schools'][school]['counties'].has_key(fips_county):
          schools['schools'][school]['counties'].update({fips_county: 1})
      else:
          schools['schools'][school]['counties'][fips_county] += 1
    except KeyError:
      pass

    #pdb.set_trace()

json.dump(schools, json_out)

csv_in.close();
json_out.close();
    
    
