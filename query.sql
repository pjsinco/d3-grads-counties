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
