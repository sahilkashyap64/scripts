# scripts
### Script to fix messed up dates
#### The scrpit requires mongoDB 4 or 5 to use the advanced aggregate pipelines

Use these commands to fix the data

```sh
node fixDatesWithSpaces1.js //manually alter the reacord using id
node fixDatesWIthYearOnly2.js
node fixDatesWith2DigitYear3.js
node fixDatewithProperFormat4.js
````   

Note: fixDatesWithSpaces1 is complicated,first fix the spelling mistakes manually and then rerun the script


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


-----
```node fixDatesWithSpaces1.js```
#####   2 functions used
1. findDatesWithSpace // finds the 'date with spaces' and returns the documentin array which faild during conversion
2. updateAlldateString // if 1st function returns 0 error then this script fixes the dates and merges them with the document
![Screenshot from 2022-07-21 19-31-40](https://user-images.githubusercontent.com/32007662/180233410-0c951f03-90af-484e-afae-ff42f586b99d.png)

-----

```node fixDatesWIthYearOnly2.js```
#####   2 functions used
1. findDatesWithYearOnlyCount //finds dates with only number eg: 1983
2. updateAlldateWithYearString // "1983-01-01"
![Screenshot from 2022-07-21 19-52-40](https://user-images.githubusercontent.com/32007662/180238957-7d31619c-bfce-42a8-93ed-101f5715902c.png)

