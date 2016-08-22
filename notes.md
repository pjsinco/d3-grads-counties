###The files we need to generate when refreshing data: 

* us-schools-[year].json
* grad-years-[year].json

###The scripts we'll run to generate them:

* add-fips.py
* grad-years.py
* populations.py

###Steps

1. Run query in Access 

2. If necessary, delete "Purpose" column in Excel  

3. Save as CSV: "members-[year].csv"  

4. Add FIPS codes to CSV  
    ```
    $ python add-fips.py
      * IN: "members-[year].csv"  
      * OUT: "members-out-[year].csv"
      * Manually update header on OUT file
          * id,designation,member_type,address_1,city,state,zip,county,grad_year,school,age,purpose,fips_state,fips_county  
    ```
5. Create a json file listing every school and # of grads by year
    ```
    $ python grad-years.py
      * IN: "members-out-[year].csv"  
      * OUT: "grad-years-[year].json"  
    ```
6. Generate the big json file with the number of graduate from each school for each county
    ```
    $ python populations.py
      * IN: "members-out-[year].csv"
      * OUT: "us-schools-[year].json"
    ```


###Band-aided name change of KCUMB-COM to KCU-COM
The new name is reflected only in the dropdown to select the Kansas City school.
