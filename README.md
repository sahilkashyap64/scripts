# scripts

node fixDatesWithSpaces1.js   


|Format                |Production DB/Total counts|regex to put in match pipline|Dates            |
|----------------------|--------------------------|-----------------------------|-----------------|
|All customer          |16151                     |                             |                 |
|m/d/yyyyy or d/m/yyyyy|23                        |  ```dob:/^\d{1}\/\d{1}\/\d{4}```|9/8/1971         |
|yyyy/mm/dd            |3                         |```dob:/^\d{4}\/\d{2}\/\d{2}```  |1988/03/24       |
|mm/dd/yyyy            |2779                      | ```dob:/^\d{2}\/\d{2}\/\d{4}``` |12/15/1973       |
|mm/dd/yy              |55                        |```dob: /^\d{2}\/\d{2}\/\d{2}``` |03/11/55         |
|m/dd/yyyy             |64                        |  ```dob:/^\d{1}\/\d{2}\/\d{4}```|6/15/1965        |
|mm/d/yyyy             |7                         | ```dob:/^\d{2}\/\d{1}\/\d{4}``` |11/1/1990        |
|mm/d/yy               |1                         |```dob:/^\d{2}\/\d{1}\/\d{2}```  |10/5/67          |
|m/d/yy                |6                         |```dob:/^\d{1}\/\d{1}\/\d{2}```  |2/2/68           |
|yyyy-mm-dd            |13129                     |  ```dob:/^\d{4}\-\d{2}\-\d{2}```|1990-03-22       |
|yy-mm-dd or mm-dd-yy  |1                         |  ```dob:/^\d{2}\-\d{2}\-\d{2}```|90-08-22         |
|mm-dd-yyyy            |2                         | ```dob:/^\d{2}\-\d{2}\-\d{4}``` |12-08-1973       |
|m/dd/yy               |18                        |```dob:/^\d{1}\/\d{2}\/\d{2}```  |4/12/61          |
|contains ,            |33                        |```dob: /,/```                   |May 22, 1986     |
|contains  space       |23                        |```dob: / /```                   |Decemeber 03 1993|
|yyyy                  |7                         | ```dob:/^[0-9]*```              |1983             |
|                      |                          |                                 |                 |
|Total                 |16151                     |                                 |                 |
