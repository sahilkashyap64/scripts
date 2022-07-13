# scripts
### Script to fix messed up dates
#### The scrit requires mongoDB 5
Use these commands to fix the data
```node fixDatesWithSpaces1.js````  //manually edit the data using _id 
```node fixDatesWIthYearOnly2.js````   
```node fixDatesWith2DigitYear3.js````   
```node fixDatewithProperFormat4.js````   


|   Format               | Production DB/Total counts | regex to put in match pipline     | Dates             |  Script used                     |
| ---------------------- | -------------------------- | --------------------------------- | ----------------- | -------------------------------- |
| All customer           | 16151                      |                                   |                   |                                  |
| m/d/yyyyy or d/m/yyyyy | 23                         | dob:/^\\d{1}\\/\\d{1}\\/\\d{4}$/  | 9/8/1971          | fixDatewithProperFormat4         |
| yyyy/mm/dd             | 3                          | dob:/^\\d{4}\\/\\d{2}\\/\\d{2}$/  | 1988/03/24        | fixDatewithProperFormat4         |
| mm/dd/yyyy             | 2779                       | dob:/^\\d{2}\\/\\d{2}\\/\\d{4}$/  | 12/15/1973        | fixDatewithProperFormat4         |
| mm/dd/yy               | 55                         | dob: /^\\d{2}\\/\\d{2}\\/\\d{2}$/ | 03/11/55          | fixDatesWith2DigitYear3          |
| m/dd/yyyy              | 64                         | dob:/^\\d{1}\\/\\d{2}\\/\\d{4}$/  | 6/15/1965         | fixDatewithProperFormat4         |
| mm/d/yyyy              | 7                          | dob:/^\\d{2}\\/\\d{1}\\/\\d{4}$/  | 11/1/1990         | fixDatewithProperFormat4         |
| mm/d/yy                | 1                          | dob:/^\\d{2}\\/\\d{1}\\/\\d{2}$/  | 10/5/67           | fixDatesWith2DigitYear3          |
| m/d/yy                 | 6                          | dob:/^\\d{1}\\/\\d{1}\\/\\d{2}$/  | 2/2/68            | fixDatesWith2DigitYear3          |
| yyyy-mm-dd             | 13129                      | dob:/^\\d{4}\\-\\d{2}\\-\\d{2}$/  | 1990-03-22        | fixDatewithProperFormat4         |
| yy-mm-dd or mm-dd-yy   | 1                          | dob:/^\\d{2}\\-\\d{2}\\-\\d{2}$/  | 90-08-22          | **pending**                      |
| mm-dd-yyyy             | 2                          | dob:/^\\d{2}\\-\\d{2}\\-\\d{4}$/  | 12-08-1973        | **pending**                      |
| m/dd/yy                | 18                         | dob:/^\\d{1}\\/\\d{2}\\/\\d{2}$/  | 4/12/61           | fixDatesWith2DigitYear3          |
| contains ,             | 33                         | dob: /,/                          | May 22, 1986      | fixDatesWithSpaces1              |
| contains space         | 23                         | dob: / /                          | Decemeber 03 1993 | fixDatesWithSpaces1              |
| yyyy                   | 7                          | dob:/^\[0-9\]\*$/                 | 1983              | fixDatesWIthYearOnly2            |
