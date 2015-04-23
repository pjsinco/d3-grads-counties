-- incorporates suggestions from Jessica, 2014-04-23,
--   except we don't include na.purpose = 'Business'
-- 25,294 results
-- note: without d.prac_type = '40', we get ~41,000
SELECT n.id, n.designation, n.member_type, na.address_1, na.city, na.state_province as state, na.zip, na.county, FORMAT(e.grad_date, 'yyyy') as grad_year, e.college_code as school, DateDiff("yyyy", b.DOB, Now())+ Int( Format(now(), "mmdd") < Format( b.DOB, "mmdd") ) as age, na.purpose
FROM (((dbo_Name n INNER JOIN dbo_Biographical b
  ON n.ID = b.ID) INNER JOIN dbo_Education e
  ON n.ID = e.ID) INNER JOIN dbo_Demographics d
  on n.ID = d.ID) INNER JOIN dbo_Name_Address na
  ON n.mail_address_num = na.address_num
where n.status not in ('I', 'ID', 'IX', 'INDO', 'IMDDO', 'IRES', 'INC', 'D')
  and n.status = 'A'
  and n.member_type in ('DO-M')
  and ( na.bad_address is Null or na.bad_address = '' )
  and n.designation <> ''
  and na.city <> ''
  and na.state_province <> ''
  and na.zip <> ''
  and d.prof_empl not like '9*'
  and d.prac_type = '40'
order by n.ID ASC





select distinct(d.prac_type), g.description
from dbo_demographics d inner join dbo_gen_tables g
  on d.prac_type = g.code

SELECT n.id, n.designation, n.member_type, na.address_1, na.city, na.state_province as state, na.zip, na.county, FORMAT(e.grad_date, 'yyyy') as grad_year, e.college_code as school, DateDiff("yyyy", b.DOB, Now())+ Int( Format(now(), "mmdd") < Format( b.DOB, "mmdd") ) as age
FROM ((dbo_Name n INNER JOIN dbo_Biographical b
  ON n.ID = b.ID) INNER JOIN dbo_Education e
  ON n.ID = e.ID) INNER JOIN dbo_Name_Address na
  ON n.mail_address_num = na.address_num
where n.status not in ('I', 'ID', 'IX', 'INDO', 'IMDDO', 'IRES', 'INC', 'D')
  and n.status = 'A'
  and n.member_type in ('DO-M')
  and ( na.bad_address is Null or na.bad_address = '' )
  and n.designation <> ''
  and na.city <> ''
  and na.state_province <> ''
  and na.zip <> ''
order by n.ID ASC














SELECT n.id, n.company, e.college_name, g.*
FROM (dbo_Name n left join dbo_education e
  on n.id = e.id) left join dbo_gen_tables g
  on n.id = g.code
WHERE member_type = 'col'
and status = 'A'
order by n.id ASC

--sketches
select n.id, na.*
from dbo_name n inner join dbo_name_address na
  on n.mail_address_num = na.address_num
where n.id = '327988'

select *
from dbo_name
where n.id = '327988'

select 
from 
where

select distinct( member_type )
from dbo_name
where

select distinct(college_code)
from dbo_education e
where 

select distinct(n.id), n.member_type, e.college_code, e.college_name
from (dbo_Name n left join dbo_education e
  on n.id = e.college_code)
where n.member_type = 'COL'

select distinct(n.member_type)
from dbo_name n
  inner join dbo_Education e on n.id = e.id
where



select g.description, n.full_address
from dbo_name n inner join dbo_Gen_Tables g
  on n.id = g.code
where n.member_type = 'COL'

select distinct(n.id), n.city, n.state_province, n.zip,  n.mail_address_num_1, n.mail_address_num_2, g.description, n.full_address, e.college_name
from (dbo_name n 
  inner join dbo_Gen_Tables g on n.id = g.code)
  inner join dbo_Education e on n.id = e.college_code
where n.member_type = 'COL'
